/* Addon „licht“ (Addon-API 1) – Modul 18 Licht & Lampen.
   v0.2 Build 2 (Technik): Einschaltzeiten und Brennstunden kommen aus dem Python-Teil (api.call("licht", "get")), damit „an seit“
   einen Neustart von Home Assistant übersteht. Räume schalten über eine passende Lichtgruppe (alle Lampen gleichzeitig),
   Lichtfarbe wird aus Kelvin, hs, xy und rgb gelesen, die Mischfarbe eines Raums nach Helligkeit gewichtet.
   v0.8 Build 8: Reiter „Regeln“ – Bewegung → Licht, Alle weg → Alle aus, Alarm (Modul 11) → Licht an, Abends → Licht an. Laufen im
   Python-Teil, Vorschläge aus Bewegungsmeldern und Räumen, Pause für alle, Protokoll „Zuletzt“.
   v0.7 Build 7: Mini-Grundriss im Lampen-Fenster – Platz per Tipp setzen, Etage wechseln, „Raum übernehmen“, „Aus dem Plan nehmen“.
   Gespeichert wird zusammen mit der Lampe in Modul 0 (gr_set plan); die Art wandert mit in den Plan.
   v0.6 Build 6 (Konzept „Lampen selbst verwalten“): Reiter „Lampen“ mit „Meine Lampen“ – nur hinzugefügte Lampen (auch Gruppen), eigener
   Name, Raum aus den Räumen von Modul 0 bzw. Bereichen, Art, „bei Alle aus“, Testen (Blinken), letzter Fehler an der Lampe, Umstiegs-Frage
   und Hinweis auf neue Lampen. Mit „Meine Lampen“ entfällt der Raum aus der Position im Plan.
   v0.5 Build 5 (Grundriss II, Konzept Teil B3, B4, B6, B7): Lampen als eigenes Element „Lampe“ im Baukasten von Modul 11 (Typ „l“).
   Platzierte Lampen leuchten an ihrem Platz, Lampen ohne Bereich bekommen den Raum aus ihrer Position, Plakette „offline“,
   „… Lampen nicht im Plan“ springt in den Baukasten. Die Methoden _liLampHex, _liRoomOfLamp und _liFreeLampAt nutzt der Baukasten.
   v0.4 Build 4 (Grundriss I, Konzept Teil B1, B2, B5): dritte Ansicht „Grundriss“ als Lichtkarte aus dem Baukasten von Modul 11 –
   Räume leuchten in der Mischfarbe ihrer Lampen, Fläche antippen schaltet den Raum, Lampenpunkt antippen schaltet die Lampe,
   lang drücken öffnet das Detail. Zuordnung Fläche → Bereich automatisch über den Namen oder von Hand (pmap im Addon-Speicher).
   v0.3 Build 3 (Neue Optik, Konzept Teil A): Haus-Szene im Banner, Kacheln 2.0, Szenenleiste, Raumkarten 2.0 mit Lichtschein
   in echter Farbe, Liste kompakt, Lampen-Detail mit Ring, Weißton-Leiste und markierter Farbe. „Optik wie bisher“ zeigt die Seite
   von Build 1. Der Kern hängt die Methoden der Klasse unten an das Panel. Szenen und Räume stehen weiter im Layout (layout.li). */
export default (api) => {
  const { ic, esc, num } = api;
  const ID = "licht";
  /* ---------- Farbe (wie logic.py) ---------- */
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const kel = (k) => {
    const t = Math.max(1000, Math.min(40000, Number(k) || 2700)) / 100;
    if (t <= 66) return [255, clamp(99.4708025861 * Math.log(t) - 161.1195681661), t <= 19 ? 0 : clamp(138.5177312231 * Math.log(t - 10) - 305.0447927307)];
    return [clamp(329.698727446 * Math.pow(t - 60, -0.1332047592)), clamp(288.1221695283 * Math.pow(t - 60, -0.0755148492)), 255];
  };
  const hs = (h, s) => {
    h = ((Number(h) % 360) + 360) % 360 / 60; s = Math.max(0, Math.min(100, Number(s))) / 100;
    const i = Math.floor(h), f = h - i, p = 1 - s, q = 1 - s * f, t = 1 - s * (1 - f);
    return [[1, t, p], [q, 1, p], [p, 1, t], [p, q, 1], [t, p, 1], [1, p, q]][i % 6].map((v) => Math.round(v * 255));
  };
  const WARM = [255, 179, 107];
  const lampRgb = (a) => {
    a = a || {};
    if (a.color_mode === "color_temp" && a.color_temp_kelvin) return kel(a.color_temp_kelvin);
    if (Array.isArray(a.rgb_color) && a.rgb_color.length >= 3) return a.rgb_color.slice(0, 3).map(clamp);
    if (Array.isArray(a.hs_color) && a.hs_color.length >= 2) return hs(a.hs_color[0], a.hs_color[1]);
    if (a.color_temp_kelvin) return kel(a.color_temp_kelvin);
    return WARM;
  };
  const hex = (c) => c ? "#" + c.map((v) => clamp(v).toString(16).padStart(2, "0")).join("") : "";
  const mix = (L) => { let r = 0, g = 0, b = 0, w = 0; L.forEach((x) => { const k = Math.max(1, x.br); r += x.rgb[0] * k; g += x.rgb[1] * k; b += x.rgb[2] * k; w += k; }); return w ? [r / w, g / w, b / w].map(Math.round) : null; };
  const L_GUESS = (name) => { const n = String(name || "").toLowerCase(); for (const [k, w] of [["streifen", ["streifen", "strip", "leiste", "led-band", "ledbox", "lightstrip"]], ["steh", ["steh", "floor"]], ["spot", ["spot", "strahler", "einbau"]], ["aussen", ["außen", "aussen", "garten", "terrasse", "wand", "outdoor"]], ["tisch", ["tisch", "nacht", "lese", "desk"]]]) if (w.some((x) => n.includes(x))) return k; return "decke"; };
  const near = (a, b) => a && b && Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 40;
  const fmtH = (s) => { const h = s / 3600; return h < 0.1 ? "0" : num(h, h < 10 ? 1 : 0); };
  const CSS = `
.l3{--lw:#ffb36b}
.l3hero{position:relative;overflow:hidden;display:flex;align-items:center;gap:18px;padding:16px 18px;border-radius:18px;margin-bottom:14px;color:#e2e8f0;
  background:radial-gradient(120% 140% at 90% 0%,color-mix(in srgb,var(--teal,#2dd4bf) 30%,#0b2c43) 0%,transparent 55%),linear-gradient(135deg,#0e3b4d,#0b1a2c 65%)}
.l3hero.day{background:radial-gradient(120% 140% at 90% 0%,#3b82f680 0%,transparent 55%),linear-gradient(135deg,#1e4a6b,#123049 65%)}
.l3hero svg.l3house{width:min(42%,230px);flex:none;height:auto;overflow:visible}
.l3hero .l3ht{flex:1;min-width:0}.l3hero .l3hk{font-size:.68rem;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:#5eead4}
.l3hero .l3hb{font-size:1.55rem;font-weight:750;color:#fff;line-height:1.15;margin:2px 0}.l3hero .l3hsub{color:#a5b8cc;font-size:.86rem}
.l3hero .l3hv{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}
.l3pill{border:1px solid color-mix(in srgb,#fff 18%,transparent);background:color-mix(in srgb,#fff 6%,transparent);color:inherit;border-radius:999px;padding:6px 13px;font:inherit;font-size:.8rem;font-weight:650;cursor:pointer;display:inline-flex;gap:6px;align-items:center}
.l3pill.sel{background:var(--teal,#2dd4bf);border-color:var(--teal,#2dd4bf);color:var(--on-acc,#042f2e)}
.l3win{transition:fill-opacity .6s,fill .6s}
.l3tiles{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));margin-bottom:12px}
.l3tile{position:relative;overflow:hidden;background:var(--card,#111a2b);border:1px solid color-mix(in srgb,var(--primary-text-color) 10%,transparent);border-radius:14px;padding:11px 13px 11px 16px;text-align:left;font:inherit;color:inherit;cursor:pointer}
.l3tile::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--a,var(--teal))}
.l3tile small{display:block;color:var(--mut);font-size:.74rem}.l3tile b{display:block;font-size:1.35rem;margin:2px 0;color:var(--primary-text-color)}
.l3tile .spark{display:flex;gap:3px;align-items:flex-end;height:18px;margin-top:4px}.l3tile .spark i{flex:1;background:color-mix(in srgb,var(--a) 70%,transparent);border-radius:2px;min-height:2px}
.l3scn{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.l3scn .l3pill{border-color:color-mix(in srgb,var(--primary-text-color) 14%,transparent);background:var(--card);color:var(--primary-text-color)}
.l3scn .l3pill.pri{background:var(--teal);border-color:var(--teal);color:var(--on-acc,#042f2e)}.l3scn .l3pill.un{border-style:dashed;color:var(--mut)}
.l3scn .l3pill:disabled{opacity:.45;cursor:default}
.l3grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(min(100%,270px),1fr));align-items:start}
.l3rc{position:relative;overflow:hidden;background:var(--card,#111a2b);border:1px solid color-mix(in srgb,var(--primary-text-color) 10%,transparent);border-radius:16px;padding:13px 14px 12px}
.l3rc .glow{position:absolute;right:-60px;top:-70px;width:200px;height:200px;border-radius:50%;background:var(--g);filter:blur(34px);opacity:calc(.15 + var(--p) * .5);pointer-events:none;transition:opacity .6s,background .6s}
.l3rc.on{border-color:color-mix(in srgb,var(--g) 40%,transparent)}
.l3rc>*{position:relative}
.l3rh{display:flex;align-items:center;gap:10px}.l3rh .t{flex:1;min-width:0}.l3rh b{display:block;font-size:1rem}.l3rh small{display:block;color:var(--mut);font-size:.78rem}
.l3big{font-size:1.9rem;font-weight:750;margin:8px 0 2px;line-height:1}.l3big.off{color:var(--mut);font-size:1.4rem}
.l3bar{display:flex;align-items:center;gap:10px}.l3bar input{flex:1;min-width:0;height:26px;accent-color:var(--g)}
.l3bar.ro{height:6px;border-radius:4px;background:color-mix(in srgb,var(--primary-text-color) 10%,transparent);overflow:hidden;margin:6px 0 2px}.l3bar.ro span{display:block;height:100%;background:var(--g);border-radius:4px}
.l3chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.l3chip{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 10px;background:color-mix(in srgb,var(--primary-text-color) 7%,transparent);border:0;color:var(--primary-text-color);font:inherit;font-size:.78rem;cursor:pointer;min-height:30px}
.l3chip i{width:9px;height:9px;border-radius:50%;background:var(--c,#475569);box-shadow:0 0 6px var(--c,transparent)}.l3chip.off{color:var(--mut)}.l3chip.off i{box-shadow:none;background:#475569}.l3chip.un{opacity:.5;text-decoration:line-through}
.l3plk{display:inline-flex;align-items:center;gap:5px;font-size:.72rem;font-weight:700;border-radius:999px;padding:3px 9px;background:color-mix(in srgb,#f59e0b 18%,transparent);color:#fbbf24;margin-top:8px;border:0;font-family:inherit;cursor:pointer}
.l3list{display:grid;gap:2px}.l3lh{font-size:.74rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);margin:12px 2px 4px}
.l3row{display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:12px;background:var(--card)}
.l3row .dot{width:12px;height:12px;border-radius:50%;background:#475569;flex:none}.l3row.on .dot{background:var(--c);box-shadow:0 0 8px var(--c)}
.l3row .nm{flex:1;min-width:0;background:none;border:0;color:var(--primary-text-color);font:inherit;text-align:left;padding:8px 0;cursor:pointer}.l3row .nm small{display:block;color:var(--mut);font-size:.74rem}
.l3row.un{opacity:.5}
.l3det .ring{display:block;margin:4px auto 6px;width:150px;height:150px}
.l3kel{position:relative;height:30px;margin:4px 0 10px}.l3kel .grad{position:absolute;left:0;right:0;top:9px;height:12px;border-radius:8px;background:linear-gradient(90deg,#ff9f4a,#ffe2bf,#fff6ea,#cfe8ff)}
.l3kel input{position:absolute;inset:0;width:100%;margin:0;opacity:0;cursor:pointer}.l3kel .mk{position:absolute;top:3px;width:24px;height:24px;margin-left:-12px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 6px #0008;pointer-events:none}
.l3det .lixc.on{outline:3px solid #fff;outline-offset:2px}
.l3kv{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.l3kv div{border-radius:12px;padding:8px 10px;background:color-mix(in srgb,var(--primary-text-color) 6%,transparent)}.l3kv small{display:block;color:var(--mut);font-size:.72rem}.l3kv b{font-size:1rem}
.l3.an-voll .l3rc.on .glow{animation:l3p 4s ease-in-out infinite}
@keyframes l3p{50%{opacity:calc(.25 + var(--p) * .55);transform:scale(1.06)}}
.l3.an-aus *,.l3.an-aus .glow{transition:none!important;animation:none!important}
@media (prefers-reduced-motion:reduce){.l3 *{animation:none!important;transition:none!important}}
.l3pc h2{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.l3psum{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}.l3psum>*{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:4px 10px;font-size:.78rem;background:color-mix(in srgb,var(--primary-text-color) 6%,transparent);color:var(--mut);border:0;font-family:inherit}
.l3psum b{color:var(--primary-text-color)}.l3psum .w{background:color-mix(in srgb,#f59e0b 18%,transparent);color:#fbbf24}.l3psum .w b{color:#fbbf24}.l3psum .u{cursor:pointer;color:var(--teal);background:color-mix(in srgb,var(--teal) 12%,transparent)}
.l3fc{display:inline-block;min-width:16px;padding:0 4px;border-radius:8px;background:#f59e0b;color:#1c1003;font-size:.7rem;text-align:center}
.l3pv{border-radius:14px;overflow:hidden;background:color-mix(in srgb,#020617 55%,var(--card,#111a2b))}.l3pv svg{display:block;width:100%;height:auto;max-height:68vh}
.l3pv text{font-family:inherit}.l3pn{fill:var(--primary-text-color);font-weight:700}.l3pt{fill:#fff;font-weight:750}.l3pt.off{fill:var(--mut);font-weight:600}.l3pz{fill:var(--mut)}
.l3pbase{fill:color-mix(in srgb,var(--card,#111a2b) 88%,#000)}.l3pbase.un{fill:color-mix(in srgb,var(--card,#111a2b) 70%,transparent)}.l3pbase.dim{fill:color-mix(in srgb,var(--card,#111a2b) 60%,transparent)}
.l3pr.ok{cursor:pointer}.l3pr.ok:hover .l3pbase{fill:color-mix(in srgb,var(--card,#111a2b) 75%,#fff)}.l3pr[data-act="lixpmap"]{cursor:pointer}
.l3pglow{transition:opacity .6s,fill .6s}.l3pw{stroke:color-mix(in srgb,var(--primary-text-color) 55%,transparent);stroke-width:5;stroke-linecap:round}
.l3pd rect{fill:color-mix(in srgb,#020617 55%,var(--card,#111a2b))}
.l3pl{cursor:pointer}.l3pl.un{cursor:default}.l3pl:hover circle:last-child{stroke:#fff}
.l3poff{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:10px}
.l3plg{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px;font-size:.74rem;color:var(--mut)}.l3plg span{display:inline-flex;align-items:center;gap:6px}
.l3plg i{width:11px;height:11px;border-radius:50%;display:inline-block}.l3plg i.un{border-radius:3px;background:repeating-linear-gradient(45deg,var(--line,#334155) 0 2px,transparent 2px 5px);border:1px dashed var(--line,#334155)}
.l4pv{border-radius:14px;overflow:hidden}.l4pv svg{display:block;width:100%;height:auto;max-height:70vh}.l4hit{cursor:pointer}.l4hit:hover{fill:#ffffff;fill-opacity:.05}.l4glow{mix-blend-mode:screen;transition:opacity .6s}
.l3pe{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;padding:26px 18px}.l3pe b{font-size:1rem}.l3pe span{color:var(--mut);max-width:440px}
.l3.an-voll .l3pr.on .l3pglow{animation:l3g 4s ease-in-out infinite}@keyframes l3g{50%{opacity:.7}}
.l3tabs{display:flex;gap:8px;margin:0 0 12px;flex-wrap:wrap}.l3tabs button{border:1px solid color-mix(in srgb,var(--primary-text-color) 14%,transparent);background:var(--card);color:var(--primary-text-color);border-radius:999px;padding:8px 16px;font:inherit;font-weight:650;cursor:pointer}.l3tabs button.on{border-color:var(--teal);color:var(--teal);box-shadow:inset 0 0 0 1px var(--teal)}.l3tabs b{display:inline-block;min-width:18px;padding:0 5px;border-radius:9px;background:#f59e0b;color:#1c1003;font-size:.72rem;margin-left:4px}
.l3lt{background:var(--card);border:1px solid color-mix(in srgb,var(--primary-text-color) 10%,transparent);border-radius:16px;overflow:hidden}
.l3lth{display:flex;align-items:center;gap:10px;padding:12px 14px;flex-wrap:wrap}.l3lth .t{flex:1;min-width:200px}.l3lth b{font-size:1rem}.l3lth small{display:block;color:var(--mut)}
.l3lg{padding:8px 14px 4px;font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);border-top:1px solid color-mix(in srgb,var(--primary-text-color) 9%,transparent)}
.l3lr{display:grid;grid-template-columns:18px minmax(0,1fr) auto auto auto 22px;gap:10px;align-items:center;padding:9px 14px;border-top:1px solid color-mix(in srgb,var(--primary-text-color) 7%,transparent);cursor:pointer;background:none;border-left:0;border-right:0;border-bottom:0;width:100%;text-align:left;color:var(--primary-text-color);font:inherit}
.l3lr:hover{background:color-mix(in srgb,var(--primary-text-color) 4%,transparent)}.l3lr.er{background:color-mix(in srgb,#ef4444 10%,transparent)}
.l3lr .dot{width:13px;height:13px;border-radius:50%;background:#475569}.l3lr.on .dot{background:var(--c);box-shadow:0 0 8px var(--c)}
.l3lr .nm b{display:block}.l3lr .nm small{display:block;color:var(--mut);font-size:.74rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.l3lr .nm small.e{color:#fca5a5;white-space:normal}
.l3tag{border-radius:999px;padding:2px 9px;font-size:.72rem;background:color-mix(in srgb,var(--primary-text-color) 8%,transparent);white-space:nowrap}.l3tag.ok{background:color-mix(in srgb,var(--teal) 16%,transparent);color:var(--teal)}.l3tag.w{background:color-mix(in srgb,#f59e0b 18%,transparent);color:#fbbf24}
.l3um{border:1px solid color-mix(in srgb,var(--teal) 45%,transparent);background:color-mix(in srgb,var(--teal) 8%,var(--card));border-radius:16px;padding:14px 16px;margin-bottom:12px}.l3um b{display:block;font-size:1rem;margin-bottom:4px}.l3um .gbtns{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.l3new{display:flex;align-items:center;gap:10px;flex-wrap:wrap;border-radius:12px;padding:9px 12px;margin-bottom:12px;background:color-mix(in srgb,#60a5fa 12%,transparent)}
.l3pick{display:grid;gap:2px;max-height:46vh;overflow:auto;border-radius:12px;background:color-mix(in srgb,var(--primary-text-color) 4%,transparent);padding:4px}
.l3pr2{display:grid;grid-template-columns:22px minmax(0,1fr) auto auto;gap:10px;align-items:center;padding:8px 10px;border-radius:10px;cursor:pointer;border:0;background:none;color:var(--primary-text-color);font:inherit;text-align:left;width:100%}
.l3pr2.sel{background:color-mix(in srgb,var(--teal) 14%,transparent)}.l3pr2 .cb{width:18px;height:18px;border-radius:5px;border:2px solid #64748b;display:inline-flex;align-items:center;justify-content:center;font-size:12px}.l3pr2.sel .cb{background:var(--teal);border-color:var(--teal);color:#042f2e}
.l3pr2 small{display:block;color:var(--mut);font-size:.74rem}.l3pr2.dim{opacity:.5}
.l3fm label{display:block;color:var(--mut);font-size:.78rem;margin:12px 0 4px}.l3fm input,.l3fm select{width:100%;box-sizing:border-box;border-radius:10px;border:1px solid color-mix(in srgb,var(--primary-text-color) 18%,transparent);background:color-mix(in srgb,var(--primary-text-color) 4%,transparent);color:var(--primary-text-color);font:inherit;padding:9px 11px}
.l3new .btn2,.l3lth .btn2,.l3um .btn2{flex:0 0 auto;width:auto}.l3lr>.mut{line-height:1.2;align-self:center}
.l3rl{display:grid}.l3rc{display:flex;align-items:center;gap:10px;padding:4px 14px 4px 0;border-top:1px solid color-mix(in srgb,var(--primary-text-color) 7%,transparent)}.l3rc.off .l3rb{opacity:.55}
.l3rb{flex:1;min-width:0;display:flex;align-items:center;gap:12px;padding:10px 0 10px 14px;border:0;background:none;color:var(--primary-text-color);font:inherit;text-align:left;cursor:pointer}
.l3rb i,.l3sgc i{width:38px;height:38px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;flex:none}.l3rb .tx{flex:1;min-width:0}.l3rb .tx b{display:block}.l3rb .tx small{display:block;color:var(--mut);font-size:.8rem}
.l3rb .mb{display:none}@media (max-width:640px){.l3rb .dk{display:none}.l3rb .mb{display:block;margin-top:4px}.l3lgr{grid-template-columns:8px 64px minmax(0,1fr)}.l3lth .btn2{padding:8px 12px}}
.l3sgg{display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr))}.l3sgc{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;border:1px dashed color-mix(in srgb,var(--primary-text-color) 22%,transparent);background:var(--card);color:var(--primary-text-color);font:inherit;text-align:left;cursor:pointer}
.l3sgc.big{border-style:solid;padding:14px}.l3sgc span:not(.pl){flex:1;min-width:0}.l3sgc b{display:block}.l3sgc small{display:block;color:var(--mut);font-size:.78rem}.l3sgc .pl{color:var(--teal);font-size:1.2rem}
.l3lgr{display:grid;grid-template-columns:10px 92px minmax(0,1fr);gap:10px;align-items:center;padding:8px 14px;border-top:1px solid color-mix(in srgb,var(--primary-text-color) 7%,transparent);font-size:.84rem}.l3lgr .d{width:8px;height:8px;border-radius:50%}.l3lgr .tm{color:var(--mut);font-variant-numeric:tabular-nums}
.l3chs{display:flex;flex-wrap:wrap;gap:6px}.l3ch{border:1px solid color-mix(in srgb,var(--primary-text-color) 16%,transparent);background:none;color:var(--primary-text-color);border-radius:999px;padding:6px 12px;font:inherit;font-size:.84rem;cursor:pointer}.l3ch.on{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 14%,transparent)}.l3ch small{color:var(--mut)}
.l3rsum{display:flex;gap:8px;align-items:flex-start;margin-top:14px;padding:10px 12px;border-radius:12px;background:color-mix(in srgb,var(--teal) 9%,transparent);font-size:.86rem}
.l3mini{border-radius:12px;background:color-mix(in srgb,var(--primary-text-color) 4%,transparent);padding:6px}.l3mini svg{display:block;width:100%;max-height:260px}.l3mini.ed svg{cursor:crosshair}
.l3minif{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:6px}.l3minif>span{flex:1 1 100%!important}.l3minif .btn2{flex:0 0 auto}
.l3fm .hint{color:var(--mut);font-size:.74rem;margin-top:4px}
@media (max-width:640px){.l3new>span{flex-basis:100%}.l3lr{grid-template-columns:16px minmax(0,1fr) auto 18px}.l3lr .hm{display:none}}
@media (max-width:560px){.l3hero{flex-direction:column;align-items:flex-start}.l3hero svg.l3house{width:100%;max-width:260px}}`;
  const Mixin = class {
  /* Modul 18: Licht & Lampen (Addon). Schaltet nur auf Fingertipp über Home Assistant (light.*, scene.*, script.*). */
  _liLay() {
    const l = (this._cfg && this._cfg.layout && this._cfg.layout.li) || {}, sc = l.scenes && typeof l.scenes === "object" ? l.scenes : {};
    return { scenes: { night: sc.night || "", arrive: sc.arrive || "", cozy: sc.cozy || "" }, hours: [1, 2, 4].includes(l.hours) ? l.hours : 2, hidden: Array.isArray(l.hidden) ? l.hidden.filter((x) => typeof x === "string") : [] };
  }
  _liSave(patch) { const l = this._liLay(); this._cfg.layout.li = { scenes: l.scenes, hours: l.hours, hidden: l.hidden, ...patch }; this._saveLayout(); this._render(); if (this._modal) this._renderModal(); }
  /* Daten aus dem Python-Teil (Build 2): an seit, Brennstunden, Gruppen, Etagen, Darstellung. Alle 30 s neu. */
  _liD() {
    const S = (this._liX = this._liX || { d: null, ts: 0, busy: false });
    if (this._hass && !S.busy && Date.now() - S.ts > (S.d ? 30000 : 8000)) {
      S.busy = true;
      api.call(ID, "get", { legacy: (this._cfg && this._cfg.layout && this._cfg.layout.li) || null }).then((d) => { S.d = d; S.err = ""; })
        .catch((e) => { S.err = (e && e.message) || "Keine Antwort"; })
        .finally(() => { S.busy = false; S.ts = Date.now(); if (this._mdActive && this._mdActive() === "li") { this._render(); if (this._modal && String(this._modal.type).startsWith("lix")) this._renderModal(); } });
    }
    return S.d || { on: {}, today: {}, week: [], groups: {}, prefs: { view: "rooms", optik: "neu" }, areas: [], floors: {}, lamps: [], mode: "", ignored: [], errs: {} };
  }
  _liPrefs() { try { if (this._gpPlan && this._mdActive && this._mdActive() === "li") this._liPlan(); } catch (_) {} return this._liD().prefs || { view: "rooms", optik: "neu" }; }
  _liNew() { return this._liPrefs().optik !== "alt"; }
  _liAreaOf(eid) {
    const H = this._hass, en = (H.entities || {})[eid]; if (!en) return "";
    if (en.area_id) return en.area_id;
    const dv = en.device_id && (H.devices || {})[en.device_id]; return (dv && dv.area_id) || "";
  }
  _liAreaName(a) { if (!a) return "Ohne Raum"; const x = (this._hass.areas || {})[a]; return (x && x.name) || a; }
  /* Alle einzelnen Lampen. Lichtgruppen (mit entity_id-Liste) werden ausgelassen, sonst zählt jede Lampe doppelt.
     „an seit“ kommt ab Build 2 aus dem Python-Teil (übersteht einen Neustart), sonst wie bisher aus last_changed. */
  _liMine() { return this._liD().mode === "mine"; }
  _liCfg() { const D = this._liD(); return Object.fromEntries((D.lamps || []).map((x) => [x.e, x])); }
  _liLamps() {
    const st = this._hass.states, now = Date.now(), D = this._liD(), ON = D.on || {}, TD = D.today || {}, PL = this._liPlaced(), mine = this._liMine(), C = this._liCfg(), ER = D.errs || {};
    const ids = mine ? (D.lamps || []).map((x) => x.e).filter((e) => st[e]) : Object.keys(st).filter((e) => e.startsWith("light.") && !Array.isArray((st[e].attributes || {}).entity_id));
    return ids.map((e) => {
      const s = st[e], a = s.attributes || {}, modes = Array.isArray(a.supported_color_modes) ? a.supported_color_modes : [], un = s.state === "unavailable" || s.state === "unknown";
      const dim = modes.some((m) => m !== "onoff"), ct = modes.includes("color_temp"), col = modes.some((m) => ["hs", "xy", "rgb", "rgbw", "rgbww"].includes(m));
      const on = s.state === "on", t = ON[e] ? ON[e] * 1000 : new Date(s.last_changed).getTime(), pe = PL[e];
      let area = this._liAreaOf(e), pos = false; const c = C[e];
      if (mine && c && c.room) area = c.room;   /* Meine Lampen: Raum von dir hat Vorrang */
      else if (!mine && !area && pe && pe.room) { const pa = this._liPArea(pe.room); if (pa) { area = pa; pos = true; } }   /* B4 (nur ohne „Meine Lampen“): Raum aus der Position */
      return { pe: pe || null, pos, cfg: c || null, err: ER[e] || null, grp: Array.isArray(a.entity_id), haName: a.friendly_name || e, id: e, name: (c && c.n) || a.friendly_name || e, on, un, dim, ct, col, br: a.brightness != null ? Math.round(Number(a.brightness) / 2.55) : (on ? 100 : 0), kel: a.color_temp_kelvin || null, kmin: a.min_color_temp_kelvin || 2000, kmax: a.max_color_temp_kelvin || 6500, since: isFinite(t) ? Math.max(0, now - t) : 0, area, rgb: lampRgb(a), mode: a.color_mode || "", today: TD[e] || 0 };
    });
  }
  _liRooms() {
    const L = this._liLay(), by = {}, AR = this._hass.areas || {};
    this._liLamps().forEach((x) => { const k = x.area || "_"; (by[k] = by[k] || { k, name: this._liAreaName(x.area), lamps: [], floor: (AR[x.area] && AR[x.area].floor_id) || "" }).lamps.push(x); });
    const all = Object.values(by).sort((a, b) => (a.k === "_") - (b.k === "_") || a.name.localeCompare(b.name, "de"));
    all.forEach((r) => {
      r.lamps.sort((a, b) => a.name.localeCompare(b.name, "de")); r.on = r.lamps.filter((x) => x.on); r.dim = r.lamps.filter((x) => x.dim && !x.un); r.hid = L.hidden.includes(r.k);
      r.mix = mix(r.on); r.col = hex(r.mix || WARM); const bp = r.on.map((x) => (x.dim ? x.br : 100)); r.pct = bp.length ? Math.round(bp.reduce((a, v) => a + v, 0) / bp.length) : 0;
    });
    return all;
  }
  /* Ist im Raum ein Bewegungs-, Anwesenheits- oder Belegungssensor aktiv? Dann kein „Licht lange an“-Hinweis. */
  _liBusy(area) {
    if (!area) return false; const st = this._hass.states;
    return Object.keys(st).some((e) => e.startsWith("binary_sensor.") && ["motion", "occupancy", "presence"].includes((st[e].attributes || {}).device_class) && st[e].state === "on" && this._liAreaOf(e) === area);
  }
  _liDur(ms) { const m = Math.round(ms / 60000); return m < 60 ? `${m} Min.` : `${num(Math.floor(m / 60), 0)} Std.${m % 60 >= 10 ? " " + (m % 60) + " Min." : ""}`; }
  _liLong() { const lim = this._liLay().hours * 36e5; return this._liRooms().filter((r) => !r.hid).map((r) => ({ r, l: r.on.filter((x) => x.since >= lim) })).filter((x) => x.l.length && !this._liBusy(x.r.k === "_" ? "" : x.r.k)).map((x) => ({ r: x.r, ms: Math.max(...x.l.map((y) => y.since)), l: x.l })).sort((a, b) => b.ms - a.ms); }
  /* Schalten über call_service per WebSocket: Home Assistant zeigt dann keine eigene Fehlermeldung, wir zeigen eine verständliche mit dem Lampennamen */
  _liCall(dom, svc, data) {
    return this._hass.callWS({ type: "call_service", domain: dom, service: svc, service_data: data }).catch((e) => {
      const ids = [].concat((data && data.entity_id) || []), nm = ids.length === 1 ? this._wzName(ids[0]) : ids.length ? `${ids.length} Lampen` : "Das";
      const why = String((e && (e.message || e.code)) || "").replace(/\s+/g, " ").slice(0, 140);
      this._toast(`${nm}: ${svc === "turn_off" ? "Ausschalten" : "Einschalten"} hat nicht geklappt – die Integration meldet: ${why || "keine Antwort"}`);
    });
  }
  /* Mehrere Lampen schalten: über den Python-Teil, der eine genau passende Lichtgruppe nimmt (gleichzeitig, weniger Funkverkehr).
     Antwortet er nicht (z. B. Addon noch nicht neu gestartet), direkt über Home Assistant. */
  _liSwitch(ids, on, extra) {
    if (!ids.length) return Promise.resolve();
    return api.call(ID, "act", { a: "switch", ids, on, ...(extra || {}) }).catch((e) => {
      const m = String((e && e.message) || "");
      if (m.includes("Integration meldet")) { this._toast(`${ids.length === 1 ? this._wzName(ids[0]) : ids.length + " Lampen"}: ${on ? "Einschalten" : "Ausschalten"} hat nicht geklappt – ${m.slice(0, 160)}`); return; }
      return this._liCall("light", on ? "turn_on" : "turn_off", { entity_id: ids, ...(on && extra && extra.brightness_pct ? { brightness_pct: extra.brightness_pct } : {}) });   /* Addon antwortet nicht: direkt */
    });
  }
  _liSwatches(x) {
    const out = [];
    if (x.ct) [[2700, "Warmweiß"], [4000, "Neutralweiß"], [6000, "Kaltweiß"]].forEach(([k, t]) => { const kk = Math.min(x.kmax, Math.max(x.kmin, k)); out.push({ t, bg: k < 3500 ? "#ffb36b" : k < 5000 ? "#fff3e0" : "#cfe8ff", d: `data-kel="${kk}"`, on: x.on && x.mode === "color_temp" && x.kel && Math.abs(x.kel - kk) < 200 }); });
    if (x.col) [[[167, 139, 250], "Violett"], [[244, 114, 182], "Rosa"], [[96, 165, 250], "Blau"], [[52, 211, 153], "Grün"], [[251, 191, 36], "Gelb"], [[248, 113, 113], "Rot"]].forEach(([c, t]) => out.push({ t, bg: `rgb(${c.join(",")})`, d: `data-rgb="${c.join(",")}"`, on: x.on && x.mode !== "color_temp" && near(x.rgb, c) }));
    return out;
  }
  _liSceneBtn(k, label, ico, pri) {
    const L = this._liLay(), e = L.scenes[k], ok = e && this._hass.states[e];
    if (!ok) return `<button class="btn2 lixun" data-act="lixscn" data-k="${k}" title="Noch nicht verknüpft">${ic("link", 15)} ${label}<small>verknüpfen</small></button>`;
    return `<button class="btn2 ${pri ? "pri" : ""}" data-act="lixscn" data-k="${k}" title="${esc(this._wzName(e))}">${ic(ico, 15)} ${label}</button>`;
  }
  /* ================= Neue Optik (Build 3) ================= */
  _liAnim() { try { return this._rkCfg().anim; } catch (_) { return "dezent"; } }
  _liNight() { const s = this._hass.states["sun.sun"]; if (s) return s.state === "below_horizon"; const h = new Date().getHours(); return h < 7 || h >= 18; }
  /* Haus im Schnitt: eine Reihe je Etage (Etagen aus Home Assistant, oben die höchste), Fenster je Raum in seiner Lichtfarbe */
  _liHouse(rooms) {
    const D = this._liD(), FL = D.floors || {}, areas = D.areas || [], lvl = {};
    Object.keys(FL).forEach((f, i) => { lvl[f] = i; });
    const rs = rooms.filter((r) => r.k !== "_" && !r.hid);
    let rows = {};
    rs.forEach((r) => { const f = r.floor && FL[r.floor] ? r.floor : "_"; (rows[f] = rows[f] || []).push(r); });
    let keys = Object.keys(rows).sort((a, b) => (lvl[b] ?? -1) - (lvl[a] ?? -1));
    if (keys.length > 3) { const keep = keys.slice(0, 2), rest = keys.slice(2).flatMap((k) => rows[k]); rows = { ...Object.fromEntries(keep.map((k) => [k, rows[k]])), _r: rest }; keys = [...keep, "_r"]; }
    if (!keys.length) keys = ["_"], rows = { _: [] };
    void areas;
    const W = 200, X0 = 24, H0 = 46, rowH = Math.max(22, Math.min(34, 90 / keys.length)), H = keys.length * rowH, night = this._liNight();
    let svg = `<svg class="l3house" viewBox="0 0 248 ${H0 + H + 14}" aria-hidden="true">`;
    svg += night ? `<circle cx="226" cy="16" r="9" fill="#e2e8f0" opacity=".85"/><circle cx="230" cy="13" r="8" fill="#0d2a3d"/>` : `<circle cx="226" cy="16" r="9" fill="#fde68a"/>`;
    svg += `<polygon points="${X0 - 8},${H0} ${X0 + W / 2},${H0 - 34} ${X0 + W + 8},${H0}" fill="#13233a" stroke="var(--teal,#2dd4bf)" stroke-width="2" stroke-linejoin="round"/>`;
    svg += `<rect x="${X0}" y="${H0}" width="${W}" height="${H}" fill="#0f1b2d" stroke="var(--teal,#2dd4bf)" stroke-width="2"/>`;
    keys.forEach((k, i) => {
      const y = H0 + i * rowH, cells = rows[k].slice(0, 6), n = Math.max(1, cells.length), cw = W / n;
      if (i) svg += `<line x1="${X0}" y1="${y}" x2="${X0 + W}" y2="${y}" stroke="#1e3350" stroke-width="2"/>`;
      cells.forEach((r, j) => {
        const x = X0 + j * cw, on = r.on.length > 0, op = on ? (0.35 + 0.6 * r.pct / 100).toFixed(2) : 0;
        if (j) svg += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + rowH}" stroke="#1e3350" stroke-width="2"/>`;
        svg += `<rect class="l3win" x="${x + 3}" y="${y + 3}" width="${cw - 6}" height="${rowH - 6}" rx="3" fill="${on ? r.col : "#0b1626"}" fill-opacity="${on ? op : 1}" stroke="${on ? "none" : "#24344d"}"><title>${esc(r.name)}: ${on ? r.on.length + " an · " + r.pct + " %" : "aus"}</title></rect>`;
        if (on) svg += `<circle cx="${x + cw / 2}" cy="${y + 7}" r="2.4" fill="#fff" opacity=".9"/>`;
      });
      if (keys.length > 1) svg += `<text x="${X0 - 4}" y="${y + rowH / 2 + 3}" text-anchor="end" font-size="8" fill="#7f95ad" font-family="inherit">${esc(k === "_" || k === "_r" ? "·" : (FL[k] || k).slice(0, 4))}</text>`;
    });
    svg += `<rect x="0" y="${H0 + H}" width="248" height="14" fill="#06101a" opacity=".55"/></svg>`;
    return svg;
  }
  _liHero() {
    if (!this._liNew()) return null;
    const rooms = this._liRooms(), shown = rooms.filter((r) => !r.hid), lamps = shown.flatMap((r) => r.lamps).filter((x) => !x.un), on = lamps.filter((x) => x.on), D = this._liD(), P = this._liPrefs();
    const roomsOn = shown.filter((r) => r.on.length).length, todayS = Object.values(D.today || {}).reduce((a, v) => a + v, 0), long = this._liLong();
    const s = this._hass.states["sun.sun"], sun = s && s.attributes && (this._liNight() ? s.attributes.next_rising : s.attributes.next_setting);
    const sunTxt = sun ? `${this._liNight() ? "Sonnenaufgang" : "Sonnenuntergang"} ${new Date(sun).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}` : "";
    const big = !lamps.length ? "Keine Lampen" : on.length ? `${on.length} ${on.length === 1 ? "Lampe" : "Lampen"} an · ${roomsOn} ${roomsOn === 1 ? "Raum" : "Räume"}` : "Alles aus";
    const sub = [lamps.length ? `heute ${fmtH(todayS)} Std. Licht` : "", sunTxt, long.length ? `${long.length} ${long.length === 1 ? "Hinweis" : "Hinweise"}` : ""].filter(Boolean).join(" · ");
    const v = (k, t, i) => `<button class="l3pill ${P.view === k ? "sel" : ""}" data-act="lixview" data-k="${k}" aria-pressed="${P.view === k}">${ic(i, 14)}${t}</button>`;
    return `<style>${CSS}</style><div class="l3hero ${this._liNight() ? "" : "day"}">${this._liHouse(rooms)}<div class="l3ht"><div class="l3hk">Modul 18 · Licht &amp; Lampen</div><div class="l3hb">${esc(big)}</div><div class="l3hsub">${esc(sub)}</div><div class="l3hv">${v("rooms", "Räume", "grid")}${v("list", "Liste", "list")}${v("plan", "Grundriss", "home")}</div></div></div>`;
  }
  _liTiles(shown, lamps, on, long) {
    const D = this._liD(), td = Object.values(D.today || {}).reduce((a, v) => a + v, 0), wk = (D.week || []).map((x) => x.h), mx = Math.max(0.1, ...wk);
    const mxOn = on.length ? Math.max(...on.map((x) => x.since)) : 0, longest = on.find((x) => x.since === mxOn);
    const t = (a, k, v, s, extra = "", act = "") => `<button class="l3tile" style="--a:${a}" ${act}><small>${k}</small><b>${v}</b><small>${s}</small>${extra}</button>`;
    return `<div class="l3tiles">
      ${t("#f59e0b", "Lampen an", `${on.length} / ${lamps.length}`, `in ${shown.filter((r) => r.on.length).length} von ${shown.length} ${shown.length === 1 ? "Raum" : "Räumen"}`, "", `data-act="lixview" data-k="list"`)}
      ${t("#60a5fa", "Licht heute", `${fmtH(td)} Std.`, "Summe aller Lampen", wk.length ? `<div class="spark" title="Letzte 7 Tage">${wk.map((h) => `<i style="height:${Math.round(4 + 14 * h / mx)}px"></i>`).join("")}</div>` : "")}
      ${t("#a78bfa", "Längste an", on.length ? this._liDur(mxOn) : "–", on.length && longest ? esc(longest.name) : "Nichts an", "", longest ? `data-act="lixdet" data-k="${esc(longest.id)}"` : "")}
      ${long.length ? t("#f87171", "Licht lange an", String(long.length), esc(long[0].r.name === "Ohne Raum" ? "Licht ohne Raum" : long[0].r.name) + " · " + this._liDur(long[0].ms)) : t("#34d399", "Hinweise", "Alles gut", `kein Licht länger als ${this._liLay().hours} Std.`)}
    </div>`;
  }
  _liScenes(on) {
    const L = this._liLay(), b = (k, label, i, pri) => { const e = L.scenes[k], ok = e && this._hass.states[e]; return ok ? `<button class="l3pill ${pri ? "pri" : ""}" data-act="lixscn" data-k="${k}" title="${esc(this._wzName(e))}">${ic(i, 15)}${label}</button>` : `<button class="l3pill un" data-act="lixscn" data-k="${k}" title="Noch nicht verknüpft">${ic("link", 14)}${label}</button>`; };
    return `<div class="l3scn">${b("night", "Gute Nacht", "moon", true)}<button class="l3pill" data-act="lixalloff" ${on.length ? "" : "disabled"}>${ic("lamp", 15)}Alle aus</button>${b("arrive", "Ankommen", "home")}${b("cozy", "Gemütlich", "fireplace")}</div>`;
  }
  _liRoomCard(r, longK) {
    const n = r.on.length, p = n ? r.pct / 100 : 0, bp = r.dim.filter((x) => x.on), lk = longK[r.k];
    const kTxt = n ? (() => { const ct = r.on.filter((x) => x.mode === "color_temp" && x.kel); return ct.length === n ? `${Math.round(ct.reduce((a, x) => a + x.kel, 0) / n / 100) * 100} K` : r.on.some((x) => x.mode && x.mode !== "color_temp" && x.mode !== "brightness" && x.mode !== "onoff") ? "Farbe" : ""; })() : "";
    const lastOff = !n ? r.lamps.filter((x) => !x.un).map((x) => new Date((this._hass.states[x.id] || {}).last_changed).getTime()).filter(isFinite).sort((a, b) => b - a)[0] : 0;
    const sub = n ? `${n} von ${r.lamps.length} an${kTxt ? " · " + kTxt : ""}` : `aus${lastOff ? " · seit " + new Date(lastOff).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : ""}`;
    return `<div class="l3rc ${n ? "on" : ""}" style="--g:${n ? r.col : "transparent"};--p:${p.toFixed(2)}">${n ? `<div class="glow"></div>` : ""}
      <div class="l3rh"><div class="t"><b>${esc(r.name)}</b><small>${sub}</small></div><button class="sw ${n ? "on" : ""}" data-act="lixroom" data-k="${esc(r.k)}" aria-pressed="${!!n}" aria-label="${esc(r.name)}: ${n ? "alle ausschalten" : "alle einschalten"}"></button></div>
      <div class="l3big ${n ? "" : "off"}">${n ? r.pct + " %" : "aus"}</div>
      ${bp.length ? `<div class="l3bar"><input type="range" min="1" max="100" value="${Math.round(bp.reduce((a, x) => a + x.br, 0) / bp.length)}" data-f="lixbr" data-k="${esc(r.k)}" aria-label="Helligkeit ${esc(r.name)}"></div>` : `<div class="l3bar ro"><span style="width:${n ? r.pct : 0}%"></span></div>`}
      ${lk ? `<button class="l3plk" data-act="lixroomoff" data-k="${esc(r.k)}" title="Ausschalten">● brennt seit ${this._liDur(lk)} · aus</button>` : ""}
      <div class="l3chips">${r.lamps.map((x) => `<button class="l3chip ${x.on ? "" : "off"} ${x.un ? "un" : ""}" style="--c:${hex(x.rgb)}" data-act="lixdet" data-k="${esc(x.id)}" ${x.un ? "disabled" : ""} aria-label="${esc(x.name)}: Details"><i></i>${esc(x.name)}${x.on && x.dim ? ` · ${x.br} %` : ""}</button>`).join("")}</div></div>`;
  }
  _liList(shown) {
    return `<div class="l3list">${shown.map((r) => `<div class="l3lh">${esc(r.name)} · ${r.on.length ? `${r.on.length} an` : "aus"}</div>${r.lamps.map((x) => `<div class="l3row ${x.on ? "on" : ""} ${x.un ? "un" : ""}" style="--c:${hex(x.rgb)}"><span class="dot"></span><button class="nm" data-act="lixdet" data-k="${esc(x.id)}" ${x.un ? "disabled" : ""}>${esc(x.name)}<small>${x.un ? "nicht erreichbar" : x.on ? `${x.dim ? x.br + " % · " : ""}an seit ${this._liDur(x.since)}` : x.today ? `heute ${fmtH(x.today)} Std. an` : "aus"}</small></button><button class="sw ${x.on ? "on" : ""}" data-act="lixsw" data-k="${esc(x.id)}" aria-pressed="${x.on}" aria-label="${esc(x.name)} ${x.on ? "ausschalten" : "einschalten"}" ${x.un ? "disabled" : ""}></button></div>`).join("")}`).join("")}</div>`;
  }
  _liPage() {
    if (!this._liNew()) return this._liPageOld();
    const rooms = this._liRooms(), shown = rooms.filter((r) => !r.hid), lamps = shown.flatMap((r) => r.lamps).filter((x) => !x.un), adm = this._admin();
    const head = `<style>${CSS}</style>`;
    if (!rooms.length && this._liMine()) return `${head}<div class="l3">${this._liTabs()}<div class="card empty">${ic("lamp", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Noch keine Lampen hinzugefügt</div>Im Reiter „Lampen“ fügst du die Lampen hinzu, die Modul 18 kennen soll.<div style="margin-top:12px">${adm ? `<button class="btn2 pri" data-act="lixadd">${ic("plus", 16)} Lampe hinzufügen</button>` : ""}</div></div></div>`;
    if (!rooms.length) return `${head}<div class="card empty">${ic("lamp", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Keine Lampen gefunden</div>Es gibt in Home Assistant keine Entität light.*. Lampen richtest du in Home Assistant unter Geräte und Dienste ein.</div>`;
    const on = lamps.filter((x) => x.on), long = this._liLong(), longK = Object.fromEntries(long.map((x) => [x.r.k, x.ms])), L = this._liLay();
    const mu = this._muOn && this._muOn() ? this._mu() : null, mul = mu && mu.cfg && mu.cfg.light && mu.cfg.light.on && mu.cfg.light.ent ? mu.cfg.light.ent : "";
    const unlinked = ["night", "arrive", "cozy"].filter((k) => !(L.scenes[k] && this._hass.states[L.scenes[k]])).length;
    const note = [mul ? `${ic("trash", 14)} Müll-Licht (Modul 17): ${esc(this._wzName(mul))} · ${this._hass.states[mul] && this._hass.states[mul].state === "on" ? "an" : "aus"}` : "", unlinked && adm ? `${ic("link", 14)} ${unlinked} Szenenknopf${unlinked === 1 ? "" : "e"} noch nicht verknüpft – Antippen öffnet die Einstellungen` : ""].filter(Boolean);
    if (this._liTab === "lampen") return `${head}<div class="l3 an-${this._liAnim()}">${this._liTabs()}${this._liLampTab()}</div>`;
    if (this._liTab === "regeln") return `${head}<div class="l3 an-${this._liAnim()}">${this._liTabs()}${this._liRulesTab()}</div>`;
    const vw = this._liPrefs().view, body = vw === "plan" ? this._liPlanView(rooms, longK) : vw === "list" ? this._liList(shown) : `<div class="l3grid">${shown.map((r) => this._liRoomCard(r, longK)).join("") || `<div class="card empty">Alle Räume sind ausgeblendet. Einblenden kannst du sie in den Einstellungen.</div>`}</div>`;
    return `${head}<div class="l3 an-${this._liAnim()}">${this._liTabs()}${this._liUmstieg(true)}${this._liTiles(shown, lamps, on, long)}${this._liScenes(on)}${note.length ? `<div class="mut sm" style="margin:-6px 0 12px;display:flex;flex-direction:column;gap:4px">${note.map((t) => `<span style="display:inline-flex;gap:6px;align-items:center">${t}</span>`).join("")}</div>` : ""}${body}</div>`;
  }
  /* ================= Reiter „Lampen“ (Build 6) ================= */
  _liTabs() {
    const D = this._liD(), n = this._liMine() ? (D.lamps || []).length : 0, nw = this._liNewLamps().length, err = Object.keys(D.errs || {}).length, t = ["lampen", "regeln"].includes(this._liTab) ? this._liTab : "ov";
    const b = (k, l) => `<button class="${t === k ? "on" : ""}" data-act="lixtab" data-k="${k}" aria-pressed="${t === k}">${l}</button>`;
    const rs = D.rules || [], ra = rs.filter((r) => r.on).length, rw = rs.filter((r) => r.on && ((D.rinfo || {})[r.id] || {}).warn).length;
    return `<div class="l3tabs">${b("ov", "Übersicht")}${b("lampen", `Lampen${n ? ` (${n})` : ""}${nw + err ? `<b>${nw + err}</b>` : ""}`)}${b("regeln", `Regeln${rs.length ? ` (${ra})` : ""}${D.rpause ? ` <b style="background:#94a3b8">Pause</b>` : rw ? `<b>${rw}</b>` : ""}`)}</div>`;
  }
  _liAllLights() { const st = this._hass.states; return Object.keys(st).filter((e) => e.startsWith("light.")).sort((a, b) => this._wzName(a).localeCompare(this._wzName(b), "de")); }
  /* Neue Lampen in Home Assistant, die weder hinzugefügt noch ausgeblendet sind (nur mit „Meine Lampen“) */
  _liNewLamps() {
    if (!this._liMine()) return [];
    const D = this._liD(), have = new Set((D.lamps || []).map((x) => x.e)), ign = new Set(D.ignored || []), st = this._hass.states;
    return this._liAllLights().filter((e) => !have.has(e) && !ign.has(e) && !Array.isArray((st[e].attributes || {}).entity_id));
  }
  _liUmstieg(small) {
    if (!this._admin() || this._liD().mode || !this._liX || !this._liX.d) return "";
    const n = this._liAllLights().filter((e) => !Array.isArray((this._hass.states[e].attributes || {}).entity_id)).length;
    if (small) return `<div class="l3new">${ic("lamp", 16)}<span style="flex:1">Neu: Lampen selbst verwalten – eigene Namen, Räume und nur die Lampen, die du willst.</span><button class="btn2 pri" data-act="lixtab" data-k="lampen">Ansehen</button></div>`;
    return `<div class="l3um"><b>Lampen selbst verwalten?</b><span class="mut sm">Bisher zeigt Modul 18 automatisch alle ${n} Lampen aus Home Assistant. Mit „Meine Lampen“ bestimmst du selbst, welche Lampen das Modul kennt, wie sie heißen und in welchem Raum sie stehen. Neue Lampen erscheinen dann nur als Hinweis.</span>
      <div class="gbtns"><button class="btn2 pri" data-act="lixmig" data-k="all">Alle ${n} übernehmen</button><button class="btn2" data-act="lixmig" data-k="pick">Selbst auswählen</button><button class="btn2" data-act="lixmig" data-k="later">Später</button></div>
      <div class="mut sm" style="margin-top:8px">„Alle übernehmen“ nimmt Namen und Bereiche aus Home Assistant. Lampen ohne Bereich bekommen einmalig den Raum aus ihrer Position im Grundriss. Danach änderst du alles je Lampe.</div></div>`;
  }
  _liLampTab() {
    const D = this._liD(), adm = this._admin(), mine = this._liMine(), st = this._hass.states;
    const um = this._liUmstieg(false);
    if (!mine && um) return um;
    if (!mine) return `<div class="card empty">${ic("lamp", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Lampen werden automatisch gezeigt</div>Modul 18 zeigt gerade alle Lampen aus Home Assistant.${adm ? ` Mit „Meine Lampen“ verwaltest du sie selbst.<div style="margin-top:12px"><button class="btn2 pri" data-act="lixmig" data-k="pick">${ic("plus", 16)} Meine Lampen einrichten</button></div>` : ""}</div>`;
    const lamps = this._liLamps(), byR = {};
    lamps.forEach((x) => { const k = x.area || "_"; (byR[k] = byR[k] || []).push(x); });
    const P = this._grRaw ? this._grRaw() : null, fls = Object.fromEntries(((P && P.floors) || []).map((f) => [f.id, f.n])), AR = this._hass.areas || {};
    const nw = this._liNewLamps(), noPl = lamps.filter((x) => !x.pe).length, nErr = lamps.filter((x) => x.err).length, rooms = Object.keys(byR).filter((k) => k !== "_").length;
    const KN = { decke: "Decke", steh: "Steh", spot: "Spot", streifen: "Streifen", aussen: "Außen", tisch: "Tisch" };
    const row = (x) => `<button class="l3lr ${x.on ? "on" : ""} ${x.err ? "er" : ""}" style="--c:${hex(x.rgb)}" ${adm ? `data-act="lixedit" data-k="${esc(x.id)}"` : `data-act="lixdet" data-k="${esc(x.id)}"`}><span class="dot"></span>
      <span class="nm"><b>${esc(x.name)}${x.grp ? ` <span class="l3tag">Gruppe</span>` : ""}</b>${x.err ? `<small class="e">Letzter Befehl abgelehnt: „${esc(String(x.err.msg).slice(0, 90))}“</small>` : `<small>${esc(x.id)}${x.cfg && x.cfg.n ? " · Name von dir" : ""}${x.cfg && x.cfg.room ? " · Raum von dir" : ""}</small>`}</span>
      <span class="l3tag hm">${KN[(x.cfg && x.cfg.k) || "decke"]}</span>${x.pe ? `<span class="l3tag ok hm">✓ im Plan</span>` : `<span class="l3tag w hm">Platz fehlt</span>`}<span class="mut sm">${x.un ? "offline" : x.on ? (x.dim ? x.br + " %" : "an") : "aus"}</span><span class="mut">›</span></button>`;
    const groups = Object.keys(byR).sort((a, b) => (a === "_") - (b === "_") || this._liAreaName(a).localeCompare(this._liAreaName(b), "de")).map((k) => {
      const fl = AR[k] && AR[k].floor_id, fn = fl && (this._liD().floors || {})[fl];
      return `<div class="l3lg">${esc(k === "_" ? "Ohne Raum – Raum wählen" : this._liAreaName(k))}${fn ? ` · ${esc(fn)}` : ""}</div>${byR[k].map(row).join("")}`;
    }).join("");
    void fls; void st;
    return `${nw.length && adm ? `<div class="l3new">${ic("info", 16)}<span style="flex:1">${nw.length === 1 ? `Neue Lampe in Home Assistant: <b>${esc(this._wzName(nw[0]))}</b>` : `${nw.length} neue Lampen in Home Assistant`}</span><button class="btn2 pri" data-act="lixadd" data-k="new">Hinzufügen</button><button class="btn2" data-act="lixign">Ausblenden</button></div>` : ""}
      <div class="l3lt"><div class="l3lth"><div class="t"><b>Meine Lampen</b><small>${lamps.length} ${lamps.length === 1 ? "Lampe" : "Lampen"} in ${rooms} ${rooms === 1 ? "Raum" : "Räumen"}${noPl ? ` · ${noPl} ohne Platz im Plan` : ""}${nErr ? ` · ${nErr} mit Fehler` : ""}</small></div>
      ${adm && noPl && (this._grEdit || (this._mdList && this._mdList().some((m) => m.id === "sf"))) ? `<button class="btn2" data-act="lixplace">${ic("home", 15)} Im Plan platzieren</button>` : ""}${adm ? `<button class="btn2 pri" data-act="lixadd">${ic("plus", 15)} Lampe hinzufügen</button>` : ""}</div>
      ${groups || `<div class="mut sm" style="padding:14px">Noch keine Lampen. „Lampe hinzufügen“ zeigt alle Lampen aus Home Assistant.</div>`}</div>
      <div class="mut sm" style="margin-top:8px">Nur diese Lampen erscheinen in Übersicht, Haus-Szene, Lichtkarte, Kacheln, Sensoren und „Alle aus“. Antippen öffnet die Einstellungen der Lampe.</div>`;
  }
  /* Räume zur Auswahl: Räume aus Modul 0 (mit Bereich), dann übrige Bereiche aus Home Assistant */
  _liRoomOpts() {
    const P = this._grRaw ? this._grRaw() : null, AR = this._hass.areas || {}, fls = Object.fromEntries(((P && P.floors) || []).map((f) => [f.id, f.n])), seen = new Set(), out = [];
    ((P && P.items) || []).filter((i) => i.t === "r").forEach((i) => { const a = this._grArea ? this._grArea(i) : null; if (a && !seen.has(a.id) && AR[a.id]) { seen.add(a.id); out.push({ id: a.id, t: `${i.n || this._liAreaName(a.id)}${fls[i.fl] ? " · " + fls[i.fl] : ""}`, g: "Modul 0" }); } });
    Object.values(AR).filter((a) => !seen.has(a.area_id)).sort((a, b) => String(a.name).localeCompare(String(b.name), "de")).forEach((a) => out.push({ id: a.area_id, t: a.name, g: "HA" }));
    return out;
  }
  _lixEditModal(m) {
    const st = this._hass.states, e = m.k, s0 = st[e]; if (!s0) return `<div class="ov" data-act="close"></div>`;
    const c = m.draft || { ...(this._liCfg()[e] || { e, n: "", room: "", k: "decke", alloff: true }) }; m.draft = c;
    const x = this._liLamps().find((y) => y.id === e), haArea = this._liAreaOf(e), opts = this._liRoomOpts(), isNew = !this._liCfg()[e];
    const K = [["decke", "Decke"], ["steh", "Steh"], ["spot", "Spot"], ["streifen", "Streifen"], ["tisch", "Tisch"], ["aussen", "Außen"]];
    const og = (g, l) => { const o = opts.filter((q) => q.g === g); return o.length ? `<optgroup label="${l}">${o.map((q) => `<option value="${esc(q.id)}" ${c.room === q.id ? "selected" : ""}>${esc(q.t)}</option>`).join("")}</optgroup>` : ""; };
    const err = (this._liD().errs || {})[e];
    return `<div class="ov" data-act="close"></div><div class="sheet l3fm" role="dialog" aria-modal="true"><div class="sh"><div><b>${isNew ? "Lampe einrichten" : "Lampe bearbeiten"}</b><span>${esc(e)}${x && x.grp ? " · Gruppe" : ""}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${err ? `<div class="l3new" style="background:color-mix(in srgb,#ef4444 14%,transparent)">${ic("alert", 16)}<span style="flex:1">Letzter Befehl abgelehnt (${new Date(err.t).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}): ${esc(err.msg)}</span></div>` : ""}
      <label>Name</label><input data-f="lixen" value="${esc(c.n)}" placeholder="${esc(s0.attributes.friendly_name || e)}" maxlength="40" autocomplete="off">
      <div class="hint">Leer lassen = Name aus Home Assistant („${esc(s0.attributes.friendly_name || e)}“)</div>
      <label>Raum</label><select data-f="lixer"><option value="" ${!c.room ? "selected" : ""}>Wie in Home Assistant${haArea ? ` (${esc(this._liAreaName(haArea))})` : " – kein Bereich"}</option>${og("Modul 0", "Räume aus Modul 0 · Haus & Grundriss")}${og("HA", "Weitere Bereiche aus Home Assistant")}</select>
      <div class="hint">Der Raum, den du wählst, gilt immer – auch wenn Home Assistant etwas anderes sagt.</div>
      <label>Art</label><div class="seg" style="flex-wrap:wrap">${K.map(([k, t]) => `<button class="${c.k === k ? "sel" : ""}" data-act="lixek" data-k="${k}">${t}</button>`).join("")}</div>
      <div class="vrow" style="margin-top:12px"><span>Bei „Alle aus“ mitschalten<small class="mut" style="display:block">Aus z. B. für Aquarium oder Außenlicht mit eigenem Zeitplan</small></span><button class="sw ${c.alloff !== false ? "on" : ""}" data-act="lixeao" aria-pressed="${c.alloff !== false}"></button></div>
      ${this._lixMini(m, c, x)}
      <div class="foot2" style="margin-top:14px">${isNew ? `<button class="btn2" data-act="close">Abbrechen</button>` : `<button class="btn2" data-act="lixedel" data-k="${esc(e)}">Entfernen</button>`}<button class="btn2" data-act="lixtest" data-k="${esc(e)}">${ic("lamp", 15)} Testen</button><button class="btn2 pri" data-act="lixesave">${isNew ? "Hinzufügen" : "Speichern"}</button></div></div>`;
  }
  /* ================= Reiter „Regeln“ (Build 8) ================= */
  _liRT() { return { motion: { i: "eye", c: "#2dd4bf", n: "Bewegung → Licht", d: "Ein Bewegungsmelder schaltet das Licht im Raum an – und nach einer Weile ohne Bewegung wieder aus." },
    away: { i: "home", c: "#a78bfa", n: "Alle weg → Alle aus", d: "Wenn niemand mehr zu Hause ist, gehen alle Lampen aus (außer denen ohne „Bei Alle aus mitschalten“)." },
    alarm: { i: "shield", c: "#f87171", n: "Alarm → Licht an", d: "Löst ein Melder aus Modul 11 aus, gehen die Lampen auf volle Helligkeit – damit der Weg nach draußen hell ist." },
    sun: { i: "sun", c: "#fbbf24", n: "Abends → Licht an", d: "Zum Sonnenuntergang Licht an (z. B. außen), zur gewählten Uhrzeit oder bei Sonnenaufgang wieder aus." } }; }
  _liMotionSensors() {
    const st = this._hass.states;
    return Object.keys(st).filter((e) => e.startsWith("binary_sensor.") && ["motion", "occupancy", "presence"].includes((st[e].attributes || {}).device_class)).sort((a, b) => this._wzName(a).localeCompare(this._wzName(b), "de"));
  }
  _liRLamps(r) {
    const all = this._liLamps();
    if ((r.lamps || []).length) return all.filter((x) => r.lamps.includes(x.id));
    if (r.room) return all.filter((x) => x.area === r.room);
    return ["alarm", "away"].includes(r.t) ? all : [];
  }
  _liRText(r) {
    const n = this._liRLamps(r).length, lp = `${n} Lampe${n === 1 ? "" : "n"}`, rn = r.room ? this._liAreaName(r.room) : "";
    if (r.t === "motion") return `Bewegung${rn ? " · " + rn : ""} → ${lp} an${r.cond === "dark" ? ", wenn dunkel" : ""}${r.off_min ? `, aus nach ${r.off_min} Min. ohne Bewegung` : ""}`;
    if (r.t === "away") return `Alle weg${r.delay_min ? ` seit ${r.delay_min} Min.` : ""} → Alle aus`;
    if (r.t === "alarm") return `Alarm in Modul 11 → ${(r.lamps || []).length ? lp : "alle Lampen"} auf 100 %${r.off_end ? ", danach wieder aus" : ""}`;
    const o = r.offset || 0;
    return `Sonnenuntergang${o ? ` ${o > 0 ? "+" : "−"}${Math.abs(o)} Min.` : ""} → ${lp} an${r.off === "sunrise" ? ", aus bei Sonnenaufgang" : r.off ? `, aus um ${r.off} Uhr` : ""}`;
  }
  _liRName(r) { const T = this._liRT()[r.t] || {}; return r.n || (r.t === "motion" && r.room ? `Bewegung · ${this._liAreaName(r.room)}` : T.n || "Regel"); }
  /* Vorschläge: Räume mit Bewegungsmelder und Lampen, Personen → Alle weg, Modul 11 → Alarm, Außenlampen → Abends */
  _liRSugg() {
    const D = this._liD(), rs = D.rules || [], st = this._hass.states, out = [], mo = [], has = (t, room) => rs.some((r) => r.t === t && (!room || r.room === room));
    const byArea = {}; this._liMotionSensors().forEach((e) => { const a = this._liAreaOf(e); if (a) (byArea[a] = byArea[a] || []).push(e); });
    Object.entries(byArea).forEach(([a, sens]) => { const n = this._liLamps().filter((x) => x.area === a).length; if (n && !has("motion", a)) mo.push({ t: "motion", room: a, sensors: sens, why: `${this._wzName(sens[0])} · ${n} Lampe${n === 1 ? "" : "n"}` }); });
    if (mo.length) out.push(mo.shift());
    const pp = Object.keys(st).filter((e) => e.startsWith("person."));
    if (pp.length && !has("away")) out.push({ t: "away", why: `${pp.length} Person${pp.length === 1 ? "" : "en"} in Home Assistant` });
    if (this._mdList && this._mdList().some((m) => m.id === "sf") && !has("alarm")) out.push({ t: "alarm", why: "Modul 11 ist an" });
    const au = this._liLamps().filter((x) => (x.cfg && x.cfg.k === "aussen") || /au(ss|ß)en|garten|terrasse|einfahrt/i.test(x.name));
    if (au.length && !has("sun")) out.push({ t: "sun", lamps: au.map((x) => x.id), why: `${au.length} Außenlampe${au.length === 1 ? "" : "n"}` });
    return [...out, ...mo].slice(0, 6);   /* gemischt: erst je Art einer, dann weitere Räume */
  }
  _liRNew(t, pre) {
    const id = "r" + Date.now().toString(36).slice(-6) + Math.random().toString(36).slice(2, 4);
    const base = { id, t, on: true, n: "", room: "", lamps: [] };
    const d = t === "motion" ? { sensors: [], cond: "dark", lux: "", lux_max: 30, off_min: 5, bri: 0, night_bri: 20 } : t === "away" ? { delay_min: 10 } : t === "alarm" ? { off_end: true } : { offset: 0, off: "23:00" };
    return { ...base, ...d, ...(pre || {}) };
  }
  _liRulesTab() {
    const D = this._liD(), rs = D.rules || [], RI = D.rinfo || {}, T = this._liRT(), adm = this._admin(), log = D.rlog || [];
    const ago = (t) => { const d = new Date(t); return isNaN(d) ? "" : d.toLocaleString("de-DE", { weekday: "short", hour: "2-digit", minute: "2-digit" }); };
    const card = (r) => {
      const ri = RI[r.id] || {}, tt = T[r.t] || {}, mine = (ri.mine || []).length;
      const st = !r.on ? `<span class="l3tag">aus</span>` : ri.warn ? `<span class="l3tag w">${esc(ri.warn)}</span>` : mine ? `<span class="l3tag ok">hat ${mine} Lampe${mine === 1 ? "" : "n"} an</span>` : `<span class="l3tag ok">aktiv</span>`;
      return `<div class="l3rc${r.on ? "" : " off"}"><button class="l3rb" ${adm ? `data-act="lixredit" data-k="${esc(r.id)}"` : ""}><i style="background:${tt.c}22;color:${tt.c}">${ic(tt.i, 20)}</i><span class="tx"><b>${esc(this._liRName(r))}</b><small>${esc(this._liRText(r))}</small><span class="mb">${st}</span></span><span class="dk">${st}</span></button>${adm ? `<button class="sw ${r.on ? "on" : ""}" data-act="lixrton" data-k="${esc(r.id)}" aria-pressed="${r.on}" aria-label="Regel an/aus"></button>` : ""}</div>`;
    };
    const sugg = adm ? this._liRSugg() : [];
    const pz = D.rpause ? `<div class="l3new" style="background:color-mix(in srgb,#94a3b8 16%,transparent)">${ic("pause", 16)}<span style="flex:1"><b>Alle Regeln pausiert</b> bis ${esc(new Date(D.rpause * 1000).toLocaleString("de-DE", { weekday: "short", hour: "2-digit", minute: "2-digit" }))} Uhr</span>${adm ? `<button class="btn2 pri" data-act="lixrpause" data-k="0">Fortsetzen</button>` : ""}</div>` : "";
    return `${pz}<div class="l3lt"><div class="l3lth"><div class="t"><b>Regeln</b><small>${rs.length ? `${rs.filter((r) => r.on).length} von ${rs.length} aktiv · laufen im Hintergrund, auch ohne offenes Dashboard` : "Noch keine Regel – das Licht reagiert dann von selbst"}</small></div>
      ${adm && rs.length && !D.rpause ? `<button class="btn2" data-act="lixrpausem">${ic("pause", 15)} Pausieren</button>` : ""}${adm ? `<button class="btn2 pri" data-act="lixrnew">${ic("plus", 15)} Regel</button>` : ""}</div>
      ${rs.length ? `<div class="l3rl">${rs.map(card).join("")}</div>` : ""}</div>
      ${sugg.length ? `<div class="l3sg"><div class="l3lg" style="border:0;padding:14px 2px 6px">Vorschläge für dein Haus</div><div class="l3sgg">${sugg.map((x, i) => { const tt = T[x.t]; return `<button class="l3sgc" data-act="lixrsugg" data-k="${i}"><i style="background:${tt.c}22;color:${tt.c}">${ic(tt.i, 18)}</i><span><b>${x.t === "motion" ? `Bewegung · ${esc(this._liAreaName(x.room))}` : tt.n}</b><small>${esc(x.why)}</small></span><span class="pl">${ic("plus", 16)}</span></button>`; }).join("")}</div></div>` : ""}
      <div class="l3lt" style="margin-top:12px"><div class="l3lth"><div class="t"><b>Zuletzt</b><small>Was die Regeln geschaltet haben</small></div></div>
      ${log.length ? log.slice(0, 12).map((x) => { const tt = T[x.rt] || {}; return `<div class="l3lgr"><span class="d" style="background:${tt.c || "#64748b"}"></span><span class="tm">${esc(ago(x.t))}</span><span class="tx"><b>${esc(x.n || (rs.find((r) => r.id === x.id) ? this._liRName(rs.find((r) => r.id === x.id)) : tt.n || ""))}</b> · ${esc(x.txt)}</span></div>`; }).join("") : `<div class="mut sm" style="padding:12px 14px">Noch nichts – sobald eine Regel schaltet, steht es hier.</div>`}</div>`;
  }
  _lixRNewModal() {
    const T = this._liRT();
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Neue Regel</b><span>Was soll das Licht von selbst tun?</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="l3sgg" style="grid-template-columns:1fr">${Object.entries(T).map(([k, t]) => `<button class="l3sgc big" data-act="lixrtype" data-k="${k}"><i style="background:${t.c}22;color:${t.c}">${ic(t.i, 22)}</i><span><b>${t.n}</b><small>${t.d}</small></span><span class="pl">›</span></button>`).join("")}</div></div>`;
  }
  _lixREditModal(m) {
    const r = m.draft, T = this._liRT()[r.t], isNew = !(this._liD().rules || []).some((x) => x.id === r.id), st = this._hass.states;
    const seg = (act, cur, opts) => `<div class="seg" style="flex-wrap:wrap">${opts.map(([v, t]) => `<button class="${String(cur) === String(v) ? "sel" : ""}" data-act="${act}" data-k="${esc(String(v))}">${t}</button>`).join("")}</div>`;
    const chip = (act, e, on, label, sub) => `<button class="l3ch ${on ? "on" : ""}" data-act="${act}" data-k="${esc(e)}" aria-pressed="${on}">${on ? "✓ " : ""}${esc(label)}${sub ? `<small> · ${esc(sub)}</small>` : ""}</button>`;
    const opts = this._liRoomOpts(), rsel = `<select data-f="lixrroom"><option value="">– kein Raum –</option>${opts.map((q) => `<option value="${esc(q.id)}" ${r.room === q.id ? "selected" : ""}>${esc(q.t)}</option>`).join("")}</select>`;
    const roomLamps = r.room ? this._liLamps().filter((x) => x.area === r.room) : [];
    const lampPick = (allTxt) => `<label>Lampen</label>${seg("lixrlm", (r.lamps || []).length || m.pick ? "pick" : "all", [["all", allTxt], ["pick", "Auswählen"]])}
      ${(r.lamps || []).length || m.pick ? `<div class="l3chs">${this._liLamps().filter((x) => !x.grp).sort((a, b) => (b.area === r.room) - (a.area === r.room)).map((x) => chip("lixrlamp", x.id, (r.lamps || []).includes(x.id), x.name, x.area ? this._liAreaName(x.area) : "")).join("")}</div>` : ""}`;
    let body = "";
    if (r.t === "motion") {
      const sens = this._liMotionSensors().sort((a, b) => (this._liAreaOf(b) === r.room) - (this._liAreaOf(a) === r.room));
      body = `<label>Raum</label>${rsel}
        <label>Bewegungsmelder</label>${sens.length ? `<div class="l3chs">${sens.map((e) => chip("lixrsens", e, r.sensors.includes(e), this._wzName(e), [this._liAreaOf(e) ? this._liAreaName(this._liAreaOf(e)) : "", st[e] && st[e].state === "on" ? "jetzt Bewegung" : ""].filter(Boolean).join(" · "))).join("")}</div>` : `<div class="hint">Keine Bewegungs- oder Präsenzmelder in Home Assistant gefunden (Geräteklasse motion, occupancy oder presence).</div>`}
        ${lampPick(r.room ? `Alle im Raum (${roomLamps.length})` : "Alle im Raum")}
        <label>Wann</label>${seg("lixrcond", r.cond, [["dark", "Nur wenn dunkel"], ["always", "Immer"]])}
        <div class="hint">„Dunkel“ = Sonne unter dem Horizont.</div>
        <label>Helligkeit</label>${seg("lixrbri", r.bri, [[0, "Wie zuletzt"], [30, "30 %"], [60, "60 %"], [100, "100 %"]])}
        <label>Nachts (22–6 Uhr)</label>${seg("lixrnb", r.night_bri, [[0, "Wie tagsüber"], [10, "10 %"], [20, "20 %"], [40, "40 %"]])}
        <label>Wieder aus nach … ohne Bewegung</label>${seg("lixroff", r.off_min, [[1, "1 Min."], [2, "2"], [5, "5"], [10, "10"], [15, "15"], [30, "30"], [0, "Nie"]])}
        <div class="hint">Ausgeschaltet werden nur Lampen, die die Regel selbst angemacht hat. Von Hand eingeschaltete bleiben an.</div>`;
    } else if (r.t === "away") {
      const pp = Object.keys(st).filter((e) => e.startsWith("person."));
      const keep = this._liLamps().filter((x) => x.cfg && x.cfg.alloff === false);
      body = `<label>Personen</label>${pp.length ? `<div class="l3chs">${pp.map((e) => `<span class="l3ch ${st[e].state === "home" ? "on" : ""}">${esc(this._wzName(e))}<small> · ${st[e].state === "home" ? "zu Hause" : "weg"}</small></span>`).join("")}</div>` : `<div class="hint">Keine Personen in Home Assistant – die Regel kann erst laufen, wenn es welche gibt.</div>`}
        <label>Warten, bis alle weg sind seit</label>${seg("lixrdel", r.delay_min, [[0, "Sofort"], [5, "5 Min."], [10, "10 Min."], [30, "30 Min."], [60, "1 Std."]])}
        <div class="hint">${keep.length ? `Bleiben an (ohne „Bei Alle aus mitschalten“): ${esc(keep.map((x) => x.name).join(", "))}.` : "Alle Lampen gehen aus. Einzelne nimmst du im Reiter „Lampen“ mit „Bei Alle aus mitschalten“ heraus."}</div>`;
    } else if (r.t === "alarm") {
      const sf = this._mdList && this._mdList().some((x) => x.id === "sf");
      body = `${sf ? "" : `<div class="l3new" style="background:color-mix(in srgb,#f59e0b 14%,transparent)">${ic("alert", 16)}<span>Modul 11 ist aus – die Regel wartet, bis es an ist.</span></div>`}
        ${lampPick(`Alle Lampen (${this._liLamps().length})`)}
        <div class="vrow" style="margin-top:12px"><span>Nach dem Alarm wieder aus<small class="mut" style="display:block">Nur die Lampen, die vorher aus waren</small></span><button class="sw ${r.off_end ? "on" : ""}" data-act="lixroffend" aria-pressed="${r.off_end}"></button></div>`;
    } else {
      body = `${lampPick(r.room ? `Alle im Raum (${roomLamps.length})` : "Alle im Raum")}${!(r.lamps || []).length && !m.pick ? `<label>Raum</label>${rsel}` : ""}
        <label>An zum Sonnenuntergang</label>${seg("lixroffs", r.offset, [[-30, "30 Min. vorher"], [-15, "15 vorher"], [0, "pünktlich"], [15, "15 danach"], [30, "30 danach"]])}
        <label>Aus</label>${seg("lixroffat", r.off, [["22:00", "22 Uhr"], ["23:00", "23 Uhr"], ["00:00", "0 Uhr"], ["sunrise", "Sonnenaufgang"], ["", "Nie"]])}`;
    }
    return `<div class="ov" data-act="close"></div><div class="sheet l3fm" role="dialog" aria-modal="true"><div class="sh"><div><b>${isNew ? "Neue Regel" : "Regel bearbeiten"}</b><span style="color:${T.c}">${T.n}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <label>Name</label><input data-f="lixrn" value="${esc(r.n)}" placeholder="${esc(this._liRName({ ...r, n: "" }))}" maxlength="40" autocomplete="off">
      ${body}
      <div class="l3rsum">${ic("info", 15)}<span>${esc(this._liRText(r))}</span></div>
      <div class="foot2" style="margin-top:12px">${isNew ? `<button class="btn2" data-act="close">Abbrechen</button>` : `<button class="btn2" data-act="lixrdelr" data-k="${esc(r.id)}">Löschen</button><button class="btn2" data-act="lixrtest" data-k="${esc(r.id)}">Testen</button>`}<button class="btn2 pri" data-act="lixrsave">${isNew ? "Regel anlegen" : "Speichern"}</button></div></div>`;
  }
  _liSaveRules(rules, msg) {
    const S = this._liX || {}; if (S.d) S.d = { ...S.d, rules };
    this._render();
    return api.call(ID, "set", { rules }).then((d) => { if (this._liX) { this._liX.d = d; this._liX.ts = Date.now(); } this._render(); if (msg) this._toast(msg); }).catch(() => this._toast("Speichern fehlgeschlagen"));
  }
  _lixRAct(a, b, k) {
    const m = this._modal, r = m && m.draft, D = this._liD(), rs = D.rules || [];
    const up = () => { this._renderModal(); return true; };
    if (a === "lixrnew") { if (this._admin()) { this._modal = { type: "lixrnew" }; this._renderModal(); } return true; }
    if (a === "lixrtype") { this._modal = { type: "lixredit", draft: this._liRNew(k) }; this._renderModal(); return true; }
    if (a === "lixrsugg") { const x = this._liRSugg()[Number(k)]; if (x) { const { why, ...pre } = x; void why; this._modal = { type: "lixredit", draft: this._liRNew(x.t, pre) }; this._renderModal(); } return true; }
    if (a === "lixredit") { const x = rs.find((y) => y.id === k); if (x && this._admin()) { this._modal = { type: "lixredit", draft: JSON.parse(JSON.stringify(x)) }; this._renderModal(); } return true; }
    if (a === "lixrton") { const list = rs.map((y) => (y.id === k ? { ...y, on: !y.on } : y)), y = list.find((z) => z.id === k); this._liSaveRules(list, y ? `${this._liRName(y)}: ${y.on ? "an" : "aus"}` : ""); return true; }
    if (a === "lixrpausem") { this._modal = { type: "lixrpause" }; this._renderModal(); return true; }
    if (a === "lixrpause") { this._modal = null; this._renderModal(); api.call(ID, "act", { a: "rules_pause", min: Number(k) || 0 }).then((d) => { if (this._liX) { this._liX.d = d; this._liX.ts = Date.now(); } this._render(); this._toast(Number(k) ? "Regeln pausiert" : "Regeln laufen wieder"); }).catch(() => this._toast("Das hat nicht geklappt")); return true; }
    if (a === "lixrtest") { api.call(ID, "act", { a: "rule_test", id: k }).then((d) => { if (this._liX) { this._liX.d = d; this._liX.ts = Date.now(); } this._toast("Regel getestet – siehe „Zuletzt“"); this._render(); }).catch((err) => this._toast(String((err && err.message) || "Testen hat nicht geklappt").slice(0, 140))); return true; }
    if (a === "lixrdelr") { const x = rs.find((y) => y.id === k); this._modal = null; this._renderModal(); this._liSaveRules(rs.filter((y) => y.id !== k), x ? `${this._liRName(x)} gelöscht` : ""); return true; }
    if (a === "lixrsave") {
      if (!r) return true;
      if (r.t === "motion" && !r.sensors.length) { this._toast("Bitte mindestens einen Bewegungsmelder wählen"); return true; }
      const i = rs.findIndex((y) => y.id === r.id), list = i < 0 ? [...rs, r] : rs.map((y) => (y.id === r.id ? r : y));
      this._modal = null; this._renderModal(); this._liSaveRules(list, i < 0 ? `${this._liRName(r)} angelegt` : "Gespeichert"); return true;
    }
    if (!r) return false;
    if (a === "lixrsens") { r.sensors = r.sensors.includes(k) ? r.sensors.filter((e) => e !== k) : [...r.sensors, k].slice(0, 6); if (!r.room && this._liAreaOf(k)) r.room = this._liAreaOf(k); return up(); }
    if (a === "lixrlm") { if (k === "all") { r.lamps = []; m.pick = false; } else { m.pick = true; if (!r.lamps.length) r.lamps = this._liRLamps({ ...r, lamps: [] }).map((x) => x.id); } return up(); }
    if (a === "lixrlamp") { r.lamps = r.lamps.includes(k) ? r.lamps.filter((e) => e !== k) : [...r.lamps, k].slice(0, 30); return up(); }
    const num = { lixrbri: "bri", lixrnb: "night_bri", lixroff: "off_min", lixrdel: "delay_min", lixroffs: "offset" }[a];
    if (num) { r[num] = Number(k) || 0; return up(); }
    if (a === "lixrcond") { r.cond = k; return up(); }
    if (a === "lixroffat") { r.off = k; return up(); }
    if (a === "lixroffend") { r.off_end = !r.off_end; return up(); }
    return false;
  }
  _lixRPauseModal() {
    const opt = [[60, "1 Stunde"], [180, "3 Stunden"], [(() => { const d = new Date(), t = new Date(d); t.setDate(d.getDate() + 1); t.setHours(6, 0, 0, 0); return Math.round((t - d) / 60000); })(), "Bis morgen früh (6 Uhr)"], [1440 * 7, "Eine Woche (z. B. Gäste)"]];
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Regeln pausieren</b><span>Alle Regeln auf einmal – das Licht reagiert dann nicht von selbst</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="l3sgg" style="grid-template-columns:1fr">${opt.map(([v, t]) => `<button class="l3sgc" data-act="lixrpause" data-k="${v}"><i style="background:#94a3b822;color:#cbd5e1">${ic("pause", 18)}</i><span><b>${t}</b></span><span class="pl">›</span></button>`).join("")}</div></div>`;
  }
  /* ---- Build 7: Mini-Grundriss im Lampen-Fenster */
  _lixMini(m, c, x) {
    const P = this._grRaw ? this._grRaw() : null, e = m.k, adm = this._admin();
    const rsAll = P ? (P.items || []).filter((i) => i.t === "r") : [];
    if (!P || !rsAll.length) return `<div class="vrow"><span>Platz im Grundriss<small class="mut" style="display:block">${P ? "Noch kein Grundriss mit Räumen." : "Grundriss wird geladen …"}</small></span>${P && adm && this._grEdit ? `<button class="btn2" data-act="lixplace">Grundriss zeichnen</button>` : ""}</div>`;
    const pl = this._liPlaced()[e];
    if (m.pos === undefined) { m.pos = pl ? { fl: pl.it.fl, x: pl.it.x, y: pl.it.y } : null; m.pos0 = JSON.stringify(m.pos); }
    const fls = P.floors && P.floors.length ? P.floors : [{ id: "eg", n: "EG" }], area = c.room || this._liAreaOf(e);
    const sugg = area ? rsAll.find((r) => this._liPArea(r) === area) : null;
    const fl = fls.some((f) => f.id === m.mfl) ? m.mfl : (m.pos && m.pos.fl) || (sugg && sugg.fl) || fls[0].id; m.mfl = fl;
    const items = (P.items || []).filter((i) => i.fl === fl), rs = items.filter((i) => i.t === "r");
    const B0 = rs.reduce((a, i) => ({ x0: Math.min(a.x0, i.x), y0: Math.min(a.y0, i.y), x1: Math.max(a.x1, i.x + i.w), y1: Math.max(a.y1, i.y + i.h) }), { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 });
    const B = rs.length ? { x: B0.x0 - 24, y: B0.y0 - 24, w: B0.x1 - B0.x0 + 48, h: B0.y1 - B0.y0 + 48 } : { x: 0, y: 0, w: 800, h: 480 };
    const inR = (r, px, py) => this._sfInRoom ? this._sfInRoom(r, px, py) : px > r.x && px < r.x + r.w && py > r.y && py < r.y + r.h;
    const here = m.pos && m.pos.fl === fl ? m.pos : null, hr = m.pos ? (P.items || []).find((r) => r.t === "r" && r.fl === m.pos.fl && inR(r, m.pos.x, m.pos.y)) : null, hrA = hr ? this._liPArea(hr) : "";
    const s0 = this._hass.states[e], col = hex(lampRgb(s0 && s0.attributes)), fz = Math.max(13, Math.round(B.w / 34));
    let g = rs.map((r) => { const a = this._liPArea(r), tg = area && a === area; return `<path d="${this._liPath(r, 2)}" fill="${tg ? "color-mix(in srgb,var(--teal) 16%,transparent)" : "color-mix(in srgb,var(--primary-text-color) 5%,transparent)"}" stroke="${tg ? "var(--teal)" : "color-mix(in srgb,var(--primary-text-color) 28%,transparent)"}" stroke-width="${tg ? 3 : 2}"/>`; }).join("");
    g += items.filter((i) => i.t === "w").map((w) => `<line x1="${w.x}" y1="${w.y}" x2="${w.x2}" y2="${w.y2}" stroke="color-mix(in srgb,var(--primary-text-color) 45%,transparent)" stroke-width="5" stroke-linecap="round"/>`).join("");
    g += rs.map((r) => { const [cx, cy] = this._liCen(r); return `<text x="${cx}" y="${cy + fz / 3}" text-anchor="middle" font-size="${fz}" fill="var(--mut,#94a3b8)" style="pointer-events:none">${esc(r.n || (this._liPArea(r) ? this._liAreaName(this._liPArea(r)) : ""))}</text>`; }).join("");
    g += items.filter((i) => i.t === "l" && i.e && i.e !== e).map((i) => `<circle cx="${i.x}" cy="${i.y}" r="${fz * 0.42}" fill="#64748b" opacity=".75"/>`).join("");
    if (here) g += `<circle cx="${here.x}" cy="${here.y}" r="${fz * 1.8}" fill="${col}" opacity=".3"/><circle cx="${here.x}" cy="${here.y}" r="${fz * 0.95}" fill="${col}" stroke="#fff" stroke-width="3"/>`;
    const fchips = fls.length > 1 ? `<div class="seg" style="margin:0 0 6px">${fls.map((f) => `<button class="${f.id === fl ? "sel" : ""}" data-act="lixmfl" data-k="${esc(f.id)}">${esc(f.n)}${m.pos && m.pos.fl === f.id ? " ●" : ""}</button>`).join("")}</div>` : "";
    const chg = JSON.stringify(m.pos) !== m.pos0;
    const st = m.pos ? `${hr ? `Steht in <b>${esc(hr.n || this._liAreaName(hrA))}</b>` : "Steht außerhalb der Räume"}${fls.length > 1 ? ` · ${esc((fls.find((f) => f.id === m.pos.fl) || {}).n || "")}` : ""}${chg ? " · <span style=\"color:var(--teal)\">neu, wird mit gespeichert</span>" : ""}` : `Noch kein Platz${chg ? " · <span style=\"color:var(--teal)\">wird aus dem Plan genommen</span>" : ""}`;
    const adopt = hrA && hrA !== area && adm ? `<button class="btn2" data-act="lixeroom" data-k="${esc(hrA)}">Raum „${esc(this._liAreaName(hrA))}“ übernehmen</button>` : "";
    if (adm) requestAnimationFrame(() => this._lixMiniBind());
    return `<label>Platz im Grundriss</label>${fchips}<div class="l3mini${adm ? " ed" : ""}"><svg viewBox="${B.x} ${B.y} ${B.w} ${B.h}" data-fl="${esc(fl)}" role="img" aria-label="Grundriss – tippen setzt die Lampe">${g}</svg></div>
      <div class="l3minif"><span class="mut sm" style="flex:1">${st}${adm ? `<br><small>${here ? "Tippe woanders hin, um sie zu versetzen." : "Tippe in den Plan, um die Lampe zu setzen."}${area && sugg ? " Der markierte Raum ist ihr Raum." : ""}</small>` : ""}</span>${adopt}${m.pos && adm ? `<button class="btn2" data-act="lixeunpl">Aus dem Plan nehmen</button>` : ""}</div>`;
  }
  _lixMiniBind() {
    const svg = this.shadowRoot && this.shadowRoot.querySelector(".l3mini.ed svg");
    if (!svg || svg.dataset.b) return; svg.dataset.b = "1";
    svg.addEventListener("click", (ev) => {
      const m = this._modal; if (!m || m.type !== "lixedit" || !svg.getScreenCTM) return;
      const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      const q = pt.matrixTransform(svg.getScreenCTM().inverse()), r10 = (v) => Math.max(-50, Math.min(1200, Math.round(v / 10) * 10));
      m.pos = { fl: svg.dataset.fl, x: r10(q.x), y: r10(q.y) };
      const P = this._grRaw(), inR = (r) => this._sfInRoom ? this._sfInRoom(r, m.pos.x, m.pos.y) : m.pos.x > r.x && m.pos.x < r.x + r.w && m.pos.y > r.y && m.pos.y < r.y + r.h;
      const hr = ((P && P.items) || []).find((r) => r.t === "r" && r.fl === m.pos.fl && inR(r)), a = hr ? this._liPArea(hr) : "";
      if (a && m.draft && !m.draft.room && !this._liAreaOf(m.k)) m.draft.room = a;   /* Lampe ohne jeden Raum: Raum aus dem Platz */
      this._renderModal();
    });
  }
  /* Platz der Lampe in Modul 0 schreiben (nur wenn geändert); Art wandert mit */
  _lixSavePos(m, d) {
    const P0 = this._grRaw ? this._grRaw() : null; if (!P0 || !this._grSavePlan) return;
    const moved = m.pos !== undefined && JSON.stringify(m.pos) !== m.pos0, cur = (P0.items || []).find((i) => i.t === "l" && i.e === m.k);
    if (!moved && !(cur && cur.k !== d.k)) return;
    const p = JSON.parse(JSON.stringify({ ...P0, floors: P0.floors && P0.floors.length ? P0.floors : [{ id: "eg", n: "EG" }], items: P0.items || [], bg: P0.bg || {} }));
    if (moved && !m.pos) p.items = p.items.filter((i) => !(i.t === "l" && i.e === m.k));
    else {
      let it = p.items.find((i) => i.t === "l" && i.e === m.k);
      if (!it) { it = { id: "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t: "l", r: 0, n: "", e: m.k }; p.items.push(it); }
      if (moved) Object.assign(it, { fl: m.pos.fl, x: m.pos.x, y: m.pos.y });
      it.k = d.k || "decke";
    }
    this._grSavePlan(p);
  }
  _lixAddModal(m) {
    const st = this._hass.states, D = this._liD(), have = new Set((D.lamps || []).map((x) => x.e)), f = m.f || "neu", q = String(m.q || "").toLowerCase(), sel = new Set(m.sel || []);
    let ids = this._liAllLights().filter((e) => (f === "grp" ? Array.isArray((st[e].attributes || {}).entity_id) : f === "neu" ? !have.has(e) && !Array.isArray((st[e].attributes || {}).entity_id) : true));
    if (q) ids = ids.filter((e) => (e + " " + this._wzName(e) + " " + this._liAreaName(this._liAreaOf(e))).toLowerCase().includes(q));
    const cap = (e) => { const a = st[e].attributes || {}, md = Array.isArray(a.supported_color_modes) ? a.supported_color_modes : []; return Array.isArray(a.entity_id) ? `Gruppe · ${a.entity_id.length}` : md.some((x) => ["hs", "xy", "rgb", "rgbw", "rgbww"].includes(x)) ? "dimmbar · Farbe" : md.includes("color_temp") ? "dimmbar · Weißton" : md.some((x) => x !== "onoff") ? "dimmbar" : "nur an/aus"; };
    const nNeu = this._liAllLights().filter((e) => !have.has(e) && !Array.isArray((st[e].attributes || {}).entity_id)).length;
    const chip = (k, t) => `<button class="${f === k ? "sel" : ""}" data-act="lixaf" data-k="${k}">${t}</button>`;
    return `<div class="ov" data-act="close"></div><div class="sheet wide l3fm" role="dialog" aria-modal="true"><div class="sh"><div><b>Lampe hinzufügen</b><span>Schritt 1 von 2 · Gerät wählen</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <input data-f="lixaq" value="${esc(m.q || "")}" placeholder="Suchen: Name, Entität, Bereich …" autocomplete="off" style="margin-bottom:8px">
      <div class="seg" style="margin-bottom:8px">${chip("neu", `Noch nicht hinzugefügt (${nNeu})`)}${chip("alle", "Alle")}${chip("grp", "Gruppen")}</div>
      <div class="l3pick">${ids.map((e) => { const h = have.has(e), on = sel.has(e); return `<button class="l3pr2 ${on ? "sel" : ""} ${h ? "dim" : ""}" ${h ? "disabled" : `data-act="lixasel" data-k="${esc(e)}"`}><span class="cb">${on ? "✓" : ""}</span><span><b>${esc(this._wzName(e))}</b><small>${esc(e)} · ${esc(this._liAreaOf(e) ? this._liAreaName(this._liAreaOf(e)) : "kein Bereich")}${h ? " · schon hinzugefügt" : ""}</small></span><span class="l3tag ${cap(e) === "nur an/aus" ? "w" : ""}">${cap(e)}</span>${h ? "" : `<span class="ibtn" data-act="lixtest" data-k="${esc(e)}" title="Kurz blinken lassen" role="button">${ic("lamp", 16)}</span>`}</button>`; }).join("") || `<div class="mut sm" style="padding:12px">Keine passende Lampe.</div>`}</div>
      <div class="hint">Das Lampen-Symbol rechts lässt eine Lampe kurz blinken – so findest du heraus, welche „H70D1“ welche ist. Gruppen zählen als <b>eine</b> Lampe.</div>
      <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="close">Abbrechen</button>${sel.size > 1 ? `<button class="btn2" data-act="lixaall">Alle ${sel.size} mit Vorschlag hinzufügen</button>` : ""}<button class="btn2 pri" data-act="lixanext" ${sel.size ? "" : "disabled"}>Weiter${sel.size ? ` (${sel.size})` : ""}</button></div></div>`;
  }
  _liSaveLamps(lamps, extra, msg) {
    const S = this._liX || {}; if (S.d) S.d = { ...S.d, lamps, ...(extra || {}) };
    this._render(); if (this._modal) this._renderModal();
    return api.call(ID, "set", { lamps, ...(extra || {}) }).then((d) => { if (this._liX) { this._liX.d = d; this._liX.ts = Date.now(); } this._render(); if (msg) this._toast(msg); }).catch(() => this._toast("Speichern fehlgeschlagen"));
  }
  _liRefresh() { if (this._liX) this._liX.ts = 0; setTimeout(() => { this._liD(); }, 300); }
  _liNewCfg(e) { const st = this._hass.states[e], nm = (st && st.attributes.friendly_name) || e; return { e, n: "", room: "", k: L_GUESS(nm), alloff: true }; }
  /* ================= Grundriss als Lichtkarte (Build 4, Konzept Teil B1, B2, B5) =================
     Der Grundriss kommt aus Modul 0 · Haus & Grundriss (gr_get, derselbe Zwischenspeicher wie in Modul 1), gezeichnet wird er bis Modul 0 Build 3 im Baukasten von Modul 11. Jede Raumfläche leuchtet
     in der Mischfarbe ihrer Lampen, die Stärke folgt der Helligkeit. Zuordnung Fläche → Bereich in Home Assistant automatisch über den
     Namen, sonst von Hand (pmap im Addon-Speicher, nur Administratoren). Bedienen: Fläche antippen = Raum schalten, Lampenpunkt
     antippen = Lampe schalten, lang drücken (oder Rechtsklick) = Lampen-Detail. Lampen als eigene Elemente im Plan folgen in Build 5. */
  _liPlan() {
    const P = this._gpPlan ? this._gpPlan() : { error: true };
    if (!P) {   /* lädt noch: gleich neu zeichnen */
      clearTimeout(this._liPT); this._liPT = setTimeout(() => { if (this._mdActive && this._mdActive() === "li") this._render(); }, 700);
    }
    return P;
  }
  /* Plan-Fläche → Bereich in Home Assistant (Bereichs-ID oder ""): von Hand (pmap), sonst über den Namen */
  _liPArea(item) {
    if (this._grArea && this._grS && this._grS.d && this._grS.d.rooms) { const g = this._grArea(item); return g ? g.id : ""; }   /* ab Modul 0 Build 2: Raumliste von Modul 0 */
    const pm = this._liD().pmap || {}, v = pm[item.id];
    if (v === "-") return "";
    if (v) return v;
    const nm = (s) => String(s || "").toLowerCase().replace(/zimmer|raum|[^a-zäöüß0-9]/g, ""), n = nm(item.n);
    if (!n) return "";
    const A = Object.values(this._hass.areas || {}).map((a) => ({ id: a.area_id, m: nm(a.name) }));
    const hit = A.find((a) => a.m === n) || A.find((a) => a.m.length > 2 && (a.m.includes(n) || n.includes(a.m)));
    return hit ? hit.id : "";
  }
  _liPRoom(item, rooms) { const a = this._liPArea(item); return a ? rooms.find((r) => r.k === a) || null : null; }
  /* Platzierte Lampen aus dem Grundriss: { light.x: { it, room } } (room = Fläche, in der die Lampe steht). Lädt den Plan nicht neu. */
  _liPlaced() {
    const P = this._grRaw ? this._grRaw() : (this._sfxD && this._sfxD.d && this._sfxD.d.cfg && this._sfxD.d.cfg.plan);   /* ab 2026.11.4b52 aus Modul 0 */
    if (!P || !Array.isArray(P.items)) return {};
    if (this._liPlC && this._liPlC.p === P && this._liPlC.pm === this._liD().pmap) return this._liPlC.m;
    const rs = P.items.filter((i) => i.t === "r"), m = {};
    const inR = (r, x, y) => this._sfInRoom ? this._sfInRoom(r, x, y) : x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;
    P.items.filter((i) => i.t === "l" && i.e).forEach((i) => { m[i.e] = { it: i, room: rs.find((r) => r.fl === i.fl && inR(r, i.x, i.y)) || null }; });
    this._liPlC = { p: P, pm: this._liD().pmap, m };
    return m;
  }
  /* Für den Baukasten (Modul 11): Lichtfarbe einer Lampe, Fläche ihres Raums auf der Etage, freie Lampe für einen Tipp an (x, y) */
  _liLampHex(e) { const s = this._hass.states[e]; return hex(lampRgb(s && s.attributes)); }
  _liRoomOfLamp(e, fl, P) { const a = this._liAreaOf(e); if (!a) return null; return (P.items || []).find((i) => i.t === "r" && i.fl === fl && this._liPArea(i) === a) || null; }
  _liFreeLampAt(fl, x, y, P) {
    const pl = new Set((P.items || []).filter((i) => i.t === "l" && i.e).map((i) => i.e)), r = (P.items || []).find((i) => i.t === "r" && i.fl === fl && this._sfInRoom && this._sfInRoom(i, x, y)), a = r ? this._liPArea(r) : "";
    const free = Object.keys(this._hass.states).filter((e) => e.startsWith("light.") && !pl.has(e) && !Array.isArray((this._hass.states[e].attributes || {}).entity_id));
    return (a && free.find((e) => this._liAreaOf(e) === a)) || (r ? free.find((e) => !this._liAreaOf(e)) : "") || "";
  }
  _liPath(i, g) {
    if (i.pts && i.pts.length >= 3) return "M" + i.pts.map((p) => p[0] + " " + p[1]).join("L") + "Z";
    const x = i.x + g, y = i.y + g, w = Math.max(4, i.w - 2 * g), h = Math.max(4, i.h - 2 * g), r = Math.min(14, w / 6, h / 6);
    return `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
  }
  _liCen(i) {
    if (!(i.pts && i.pts.length >= 3)) return [i.x + i.w / 2, i.y + i.h / 2];
    const n = i.pts.length; return [i.pts.reduce((a, p) => a + p[0], 0) / n, i.pts.reduce((a, p) => a + p[1], 0) / n];
  }
  _liPlanEmpty(t, s, btn) {
    return `<div class="card l3pe"><svg viewBox="0 0 220 110" width="200" aria-hidden="true"><rect x="10" y="8" width="200" height="94" rx="10" fill="none" stroke="var(--line,#334155)" stroke-width="3"/><path d="M110 8v56M10 64h130" stroke="var(--line,#334155)" stroke-width="3"/><circle cx="60" cy="36" r="26" fill="#ffb36b" opacity=".35"/><circle cx="60" cy="36" r="5" fill="#ffd2a1"/><circle cx="160" cy="58" r="30" fill="#a78bfa" opacity=".3"/><circle cx="160" cy="58" r="5" fill="#c4b5fd"/><circle cx="60" cy="84" r="4" fill="#475569"/></svg><b>${t}</b><span>${s}</span>${btn || ""}</div>`;
  }
  /* ================= Lichtkarte v0.9 Build 11: eine Optik mit Modul 0 – nur Ansicht =================
     Der Plan wird mit dem Zeichner von Modul 0 gezeichnet (Böden, Wände, Türen, Fenster, Treppen, Möbel, Stil wie in Modul 0).
     Darüber: Räume mit Licht leuchten in der Mischfarbe, Räume ohne Licht sind abgedunkelt, Lampen im Plan mit Schein.
     Raumnamen kommen aus Modul 0 (bleiben im Raum, meiden Lampen), zweite Zeile „75 % · 2 von 3 an“. Zoom und Vollbild wie in Modul 0.
     Bearbeitet wird nur in Modul 0: Zuordnen und Platzieren führen dorthin. Ältere Kerne (ohne _grLiCap) bekommen die bisherige Ansicht. */
  _liPlanView(rooms, longK) {
    if (!(this._grLiCap && this._grDraw && this._grLabels && this._grChipBox)) return this._liPlanViewOld(rooms, longK);
    const P = this._liPlan(), adm = this._admin();
    if (!P) return this._liPlanEmpty("Grundriss wird geladen …", "Einen Moment.");
    if (P.error) return this._liPlanEmpty("Grundriss gerade nicht erreichbar", "Modul 0 antwortet noch nicht – meist direkt nach einem Neustart von Home Assistant. Es wird gleich von selbst erneut versucht.");
    const allR = (P.items || []).filter((i) => i.t === "r");
    if (!allR.length) return this._liPlanEmpty("Noch kein Grundriss mit Räumen", "Den Grundriss zeichnest du einmal in Modul 0 · Haus & Grundriss: Räume, Wände, Türen und Fenster. Die Lichtkarte zeigt ihn dann mit deinen Lampen.", adm && this._grEdit ? `<button class="btn2 pri" data-act="lixedit0">${ic("pencil", 16)} In Modul 0 zeichnen</button>` : "");
    const fls0 = P.floors && P.floors.length ? P.floors : [{ id: "eg", n: "EG" }], fls = fls0.filter((f) => !f.ga || allR.some((i) => i.fl === f.id));
    const map = new Map(allR.map((i) => [i.id, this._liPRoom(i, rooms)]));
    const fl = fls.some((f) => f.id === this._liFl) ? this._liFl : (fls.find((f) => allR.some((i) => i.fl === f.id && map.get(i.id) && map.get(i.id).on.length)) || fls.find((f) => allR.some((i) => i.fl === f.id)) || fls[0]).id;
    const items = (P.items || []).filter((i) => i.fl === fl), rs = items.filter((i) => i.t === "r");
    const sty = this._grStyle ? this._grStyle() : "modern", narrow = !!(this._narrow || (this.clientWidth || 999) < 600), T = this._grTheme(sty), sc = P.scale > 0 ? P.scale : 40, NF = narrow ? 1.6 : 1, q = narrow ? 1.4 : 1;
    const f1 = (v) => v.toLocaleString("de-DE", { maximumFractionDigits: 1 }), kinds = new Map(rs.map((r) => [r.id, this._grKind(r)])), u = "l4p" + (this.constructor._l4N = ((this.constructor._l4N || 0) + 1) % 1e6) + "_";
    const G = this._grDraw(P, fl, { style: sty, dims: false, narrow, labels: false, now: false, click: false, layers: { licht: false, sf: false, gt: false, ht: false, mo: true } });
    const LA = rooms.flatMap((r) => r.lamps), here = LA.filter((x) => x.pe && x.pe.it.fl === fl), pathOf = (i) => "M" + this._grPoly(i).map((p) => p[0] + " " + p[1]).join("L") + "Z";
    const hell = sty === "hell", veil = hell ? "#0f172a" : "#020617";
    let d = `<defs><pattern id="${u}un" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v10" stroke="${T.sub}" stroke-width="2.5" opacity=".55"/></pattern>${rs.map((i) => `<clipPath id="${u}k${esc(i.id)}"><path d="${pathOf(i)}"/></clipPath>`).join("")}</defs>`;
    /* 1) Räume: Licht in Mischfarbe, sonst abgedunkelt; nicht zugeordnet: schraffiert */
    rs.forEach((i, ix) => {
      const r = map.get(i.id), n = r ? r.on.length : 0, p = n ? r.pct / 100 : 0, path = pathOf(i), aid = r ? r.k : this._liPArea(i), cid = `${u}g${ix}`;
      if (r && n) {
        const pin = here.some((x) => x.on && x.pe.room && x.pe.room.id === i.id), o = (0.38 + 0.45 * p) * (pin ? 0.45 : 1), [cx, cy] = this._grCen(i);
        d += `<radialGradient id="${cid}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${Math.max(i.w, i.h) * 0.75}"><stop offset="0" stop-color="${r.col}" stop-opacity="${o.toFixed(2)}"/><stop offset=".6" stop-color="${r.col}" stop-opacity="${(o * 0.5).toFixed(2)}"/><stop offset="1" stop-color="${r.col}" stop-opacity=".08"/></radialGradient><path d="${path}" fill="url(#${cid})" class="l4glow"/><path d="${path}" fill="none" stroke="${r.col}" stroke-width="2.5" stroke-opacity=".75"/>`;
      } else if (r) d += `<path d="${path}" fill="${veil}" opacity="${hell ? 0.16 : 0.42}"/>`;
      else d += `<path d="${path}" fill="${veil}" opacity="${hell ? 0.2 : 0.5}"/>${aid || (this._liD().pmap || {})[i.id] === "-" ? "" : `<path d="${path}" fill="url(#${u}un)"/>`}`;
      if (r && r.lamps.some((x) => !x.un)) d += `<path d="${path}" fill="transparent" class="l4hit" data-act="lixroom" data-k="${esc(r.k)}"><title>${esc(i.n || r.name)} · ${n ? `${n} an · ${r.pct} %` : "aus"} · Antippen schaltet den Raum</title></path>`;
    });
    /* 2) Schein der eingeschalteten Lampen im Plan, auf ihren Raum begrenzt */
    here.filter((x) => x.on).forEach((x, k) => {
      const it = x.pe.it, c = hex(x.rgb), b = (x.dim ? x.br : 100) / 100, R = (it.k === "spot" ? 0.7 : it.k === "aussen" ? 1.3 : 1) * (45 + 105 * b), g = `${u}lg${k}`;
      d += `<radialGradient id="${g}"><stop offset="0" stop-color="${c}" stop-opacity="${(0.55 + 0.35 * b).toFixed(2)}"/><stop offset=".45" stop-color="${c}" stop-opacity="${(0.25 + 0.18 * b).toFixed(2)}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient><g pointer-events="none"${x.pe.room ? ` clip-path="url(#${u}k${esc(x.pe.room.id)})"` : ""}><circle cx="${it.x}" cy="${it.y}" r="${R.toFixed(1)}" fill="url(#${g})"/></g>`;
    });
    /* 3) Plaketten „seit …“ / „offline“ oben rechts im Raum (freigehalten für die Namen) */
    if (this._grChipAt) this._grChipAt = {}; else this._grChipAt = {};
    rs.forEach((i) => {
      const r = map.get(i.id); if (!r) return;
      const lk = longK[r.k], nu = r.lamps.filter((y) => y.un).length, t = [lk ? `seit ${this._liDur(lk)}` : "", nu ? (nu > 1 ? `${nu} offline` : "offline") : ""].filter(Boolean).join(" · "); if (!t) return;
      const B = this._grChipBox(i, t); this._grChipAt[i.id] = B;
      d += `<g pointer-events="none"><rect x="${B[0]}" y="${B[1]}" width="${B[2] - B[0]}" height="20" rx="10" fill="${lk ? "#f59e0b" : "#dc2626"}"/><text x="${(B[0] + B[2]) / 2}" y="${B[1] + 14}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${lk ? "#1c1003" : "#fff"}">${esc(t)}</text></g>`;
    });
    /* 4) Lampen ohne Platz: kleine Punkte unten links im Raum (Platz suchen im Raum) */
    const loose = [];
    rs.forEach((i) => {
      const r = map.get(i.id); if (!r) return;
      const L = r.lamps.filter((y) => !(y.pe && y.pe.it.fl === fl)); if (!L.length) return;
      const pr = 6 * q, stp = pr * 3.4, inR = (x, y) => !this._sfInRoom || this._sfInRoom(i, x, y); let sx = i.x + 18, sy = i.y + i.h - 18;
      for (let k = 0; k < 12 && !inR(sx, sy); k++) { sx += 10; sy -= 8; }
      const maxN = Math.max(1, Math.floor((i.w - 36) / stp)), sh = L.slice(0, maxN);
      sh.forEach((x2, k) => loose.push({ x2, cx: sx + k * stp, cy: sy, pr }));
      if (L.length > sh.length) loose.push({ more: L.length - sh.length, cx: sx + sh.length * stp, cy: sy, pr });
    });
    /* 5) Raumnamen (Modul 0): zweite Zeile mit Licht-Zustand */
    const sub = (i) => { const r = map.get(i.id); if (r) { const n = r.on.length; return n ? `${r.pct} % · ${n} von ${r.lamps.length} an` : `aus · ${r.lamps.length} ${r.lamps.length === 1 ? "Lampe" : "Lampen"}`; } const aid = this._liPArea(i); return aid ? "keine Lampen" : (this._liD().pmap || {})[i.id] === "-" ? "kein Bereich" : "nicht zugeordnet"; };
    const subCol = (i) => { const r = map.get(i.id); return r && r.on.length ? (hell ? "#b45309" : "#fde68a") : null; };
    const obsIt = items.concat(loose.map((l) => ({ t: "l", x: l.cx, y: l.cy })));
    d += this._grLabels(rs, obsIt, { style: sty, narrow, now: false, sub, subCol }, T, kinds, NF, sc, f1, q);
    /* 6) Lampen ohne Platz und Lampen im Plan – antippen schaltet, lang drücken öffnet das Detail */
    loose.forEach(({ x2, cx, cy, pr, more }) => {
      if (more) { d += `<text x="${cx - pr * 0.4}" y="${cy + pr * 0.45}" font-size="${pr * 1.4}" fill="${T.sub}" pointer-events="none">+${more}</text>`; return; }
      const c = hex(x2.rgb);
      d += `<g class="l3pl loose${x2.on ? " on" : ""}${x2.un ? " un" : ""}" ${x2.un ? "" : `data-act="lixsw" data-k="${esc(x2.id)}" data-lhold="${esc(x2.id)}"`}><title>${esc(x2.name)} · ${x2.un ? "nicht erreichbar" : x2.on ? (x2.dim ? x2.br + " %" : "an") : "aus"} · noch nicht im Plan platziert</title><circle cx="${cx}" cy="${cy}" r="${pr * 1.9}" fill="transparent"/><circle cx="${cx}" cy="${cy}" r="${pr * 1.5}" fill="none" stroke="${T.sub}" stroke-width="1.2" stroke-dasharray="2.5 2.5"/>${x2.on ? `<circle cx="${cx}" cy="${cy}" r="${pr * 1.8}" fill="${c}" opacity=".3"/>` : ""}<circle cx="${cx}" cy="${cy}" r="${pr}" fill="${x2.un ? "transparent" : x2.on ? c : "#475569"}" stroke="${x2.on ? "#fff" : "#94a3b8"}" stroke-width="1.4"/></g>`;
    });
    here.forEach((x) => {
      const it = x.pe.it, c = hex(x.rgb), rot = it.r ? ` transform="rotate(${it.r} ${it.x} ${it.y})"` : "", fill = x.un ? "transparent" : x.on ? c : hell ? "#e2e8f0" : "#334155", stroke = x.un ? "#64748b" : x.on ? "#fff" : "#94a3b8";
      const body = it.k === "streifen" ? `<rect x="${it.x - 22 * q}" y="${it.y - 4 * q}" width="${44 * q}" height="${8 * q}" rx="${4 * q}" fill="${fill}" stroke="${stroke}" stroke-width="1.8"${x.un ? ` stroke-dasharray="3 2"` : ""}${rot}/>`
        : `<circle cx="${it.x}" cy="${it.y}" r="${(it.k === "spot" ? 6 : 9) * q}" fill="${fill}" stroke="${stroke}" stroke-width="2"${x.un ? ` stroke-dasharray="2.5 2.5"` : ""}/>`;
      d += `<g class="l3pl${x.on ? " on" : ""}${x.un ? " un" : ""}" ${x.un ? "" : `data-act="lixsw" data-k="${esc(x.id)}" data-lhold="${esc(x.id)}"`}><title>${esc(x.name)} · ${x.un ? "nicht erreichbar" : x.on ? (x.dim ? x.br + " %" : "an") : "aus"} · antippen schaltet, lang drücken für Details</title><circle cx="${it.x}" cy="${it.y}" r="${16 * q}" fill="transparent"/>${body}</g>`;
    });
    /* Kopfzeile, Etagen, Hinweise (führen nach Modul 0), Räume ohne Fläche, Legende */
    const mapped = new Set([...map.values()].filter(Boolean).map((r) => r.k)), un = allR.filter((i) => !this._liPArea(i) && (this._liD().pmap || {})[i.id] !== "-");
    const flOn = rs.map((i) => map.get(i.id)).filter((r) => r && r.on.length), nOn = flOn.reduce((a, r) => a + r.on.length, 0), np = LA.filter((x) => !x.pe).length;
    const shown = rooms.filter((r) => !r.hid), off = shown.filter((r) => !mapped.has(r.k) && r.lamps.length);
    const bar = fls.length > 1 ? `<span class="sffl">${fls.map((f) => { const c = allR.filter((i) => i.fl === f.id).map((i) => map.get(i.id)).filter((r) => r && r.on.length).length; return `<button class="${f.id === fl ? "on" : ""}" data-act="lixfl" data-k="${esc(f.id)}">${esc(f.n)}${c ? ` <b class="l3fc">${c}</b>` : ""}</button>`; }).join("")}</span>` : "";
    const sum = `<div class="l3psum"><span>${ic("lamp", 14)}<b>${nOn}</b> ${nOn === 1 ? "Lampe" : "Lampen"} an auf dieser Etage</span><span>${ic("grid", 14)}<b>${flOn.length}</b> von ${rs.filter((i) => map.get(i.id)).length} Räumen hell</span>
      ${(() => { const nl = rs.map((i) => map.get(i.id)).filter((r) => r && longK[r.k]).length; return nl ? `<span class="w">${ic("bell", 14)}<b>${nl}</b> lange an</span>` : ""; })()}
      ${np ? (adm && this._grEdit ? `<button class="u" data-act="lixplace" title="In Modul 0 platzieren">${np} ${np === 1 ? "Lampe" : "Lampen"} nicht im Plan · in Modul 0 setzen${ic("chev", 13)}</button>` : `<span>${np} ${np === 1 ? "Lampe" : "Lampen"} nicht im Plan</span>`) : ""}
      ${un.length ? (adm ? `<button class="u" data-act="lixgo0">${un.length} ${un.length === 1 ? "Raum" : "Räume"} ohne Bereich · in Modul 0 zuordnen${ic("chev", 13)}</button>` : `<span class="u">${un.length} ohne Bereich</span>`) : ""}</div>`;
    const offRow = off.length ? `<div class="l3poff"><span class="mut sm">Nicht im Grundriss:</span>${off.map((r) => `<button class="l3chip ${r.on.length ? "" : "off"}" style="--c:${r.on.length ? r.col : "#475569"}" data-act="lixroom" data-k="${esc(r.k)}" aria-label="${esc(r.name)} ${r.on.length ? "ausschalten" : "einschalten"}"><i></i>${esc(r.name)}${r.on.length ? ` · ${r.on.length} an` : ""}</button>`).join("")}</div>` : "";
    const legend = `<div class="l3plg"><span><i style="background:#ffd2a1;box-shadow:0 0 6px #ffb36b"></i>Licht an (echte Farbe)</span><span><i style="background:#1e293b"></i>Licht aus (abgedunkelt)</span><span><i style="border:1.5px dashed #64748b"></i>offline</span><span><i style="background:#334155;border:1.5px solid #94a3b8"></i>Lampe im Plan</span><span><i style="background:#475569;outline:1.5px dashed #94a3b8;outline-offset:2px"></i>ohne Platz</span><span><i class="un"></i>ohne Bereich</span><span class="mut">Bearbeiten in Modul 0</span></div>`;
    const VB = this._grVB ? this._grVB(G.vb, fl) : G.vb;
    this._liHold(); if (this._grZoomBind) this._grZoomBind(this.shadowRoot);
    return `<div class="card l3pc${this._grFull ? " grfull" : ""}"><h2>${ic("home", 18)}Lichtkarte<span class="sfhr">${bar}${adm && this._grEdit ? `<button class="sfed" data-act="lixedit0" title="Bearbeitet wird in Modul 0">${ic("pencil", 14)} In Modul 0 bearbeiten</button>` : ""}</span></h2>
      ${sum}<div class="grv grv-${sty} l4pv">${this._grZoomBar ? this._grZoomBar(fl, { noExp: true }) : ""}<svg class="grzsvg${VB !== G.vb ? " zm" : ""}" data-fl="${esc(fl)}" data-vb="${G.vb.x} ${G.vb.y} ${G.vb.w} ${G.vb.h}" viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" role="img" aria-label="Lichtkarte">${G.svg}${d}</svg></div>${offRow}${legend}</div>`;
  }
  _liPlanViewOld(rooms, longK) {
    const P = this._liPlan(), adm = this._admin(), sf = this._mdList && this._mdList().some((m) => m.id === "sf");
    if (!P) return this._liPlanEmpty("Grundriss wird geladen …", "Einen Moment.");
    if (P.error) return this._liPlanEmpty("Grundriss gerade nicht erreichbar", "Modul 11 antwortet noch nicht – meist direkt nach einem Neustart von Home Assistant. Es wird gleich von selbst erneut versucht.");
    const allR = (P.items || []).filter((i) => i.t === "r");
    if (!allR.length) return this._liPlanEmpty("Noch kein Grundriss mit Räumen", "Den Grundriss zeichnest du einmal mit dem Baukasten in Modul 0 · Haus & Grundriss: Räume, Wände, Türen und Fenster. Modul 1, 11 und 18 nutzen ihn dann mit.",
      adm ? (this._grEdit ? `<button class="btn2 pri" data-act="lixplace">${ic("pencil", 16)} Grundriss zeichnen</button>` : sf ? `<button class="btn2 pri" data-act="gpedit">${ic("pencil", 16)} Grundriss zeichnen</button>` : "") : "");
    const fls = P.floors && P.floors.length ? P.floors : [{ id: "eg", n: "EG" }];
    const map = new Map(allR.map((i) => [i.id, this._liPRoom(i, rooms)]));
    const fl = fls.some((f) => f.id === this._liFl) ? this._liFl : (fls.find((f) => allR.some((i) => i.fl === f.id && map.get(i.id) && map.get(i.id).on.length)) || fls.find((f) => allR.some((i) => i.fl === f.id)) || fls[0]).id;
    const items = (P.items || []).filter((i) => i.fl === fl), rs = items.filter((i) => i.t === "r");
    const NF = this._narrow || (this.clientWidth || 999) < 600 ? 2.1 : 1, u = "l3p" + (this.constructor._l3N = ((this.constructor._l3N || 0) + 1) % 1e6) + "_";
    const B = rs.length ? rs.reduce((a, i) => ({ x0: Math.min(a.x0, i.x), y0: Math.min(a.y0, i.y), x1: Math.max(a.x1, i.x + i.w), y1: Math.max(a.y1, i.y + i.h) }), { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }) : { x0: 0, y0: 0, x1: 800, y1: 480 };
    let d = `<defs><pattern id="${u}dot" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.1" fill="var(--primary-text-color)" opacity=".13"/></pattern>
      <pattern id="${u}un" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v10" stroke="var(--line,#334155)" stroke-width="3"/></pattern>
</defs>
      <rect x="${B.x0 - 400}" y="${B.y0 - 400}" width="${B.x1 - B.x0 + 800}" height="${B.y1 - B.y0 + 800}" fill="url(#${u}dot)"/>`;
    const lab = [], LA = rooms.flatMap((r) => r.lamps), here = LA.filter((x) => x.pe && x.pe.it.fl === fl);   /* B3: im Plan platzierte Lampen dieser Etage */
    rs.forEach((i, ix) => {
      const r = map.get(i.id), n = r ? r.on.length : 0, p = n ? r.pct / 100 : 0, path = this._liPath(i, 3), cid = `${u}c${ix}`, aid = r ? r.k : this._liPArea(i), none = (this._liD().pmap || {})[i.id] === "-";
      const act = r ? (r.lamps.some((x) => !x.un) ? `data-act="lixroom" data-k="${esc(r.k)}"` : "") : adm ? `data-act="lixpmap" data-k="${esc(i.id)}"` : "";
      const tip = r ? ` · ${n ? `${n} an · ${r.pct} %` : "aus"} · Antippen schaltet den Raum` : aid ? ` · Bereich „${this._liAreaName(aid)}“ hat keine Lampen` : none ? " · gehört zu keinem Bereich" : " · nicht zugeordnet";
      d += `<g class="l3pr${r ? " ok" : ""}${n ? " on" : ""}" ${act}><title>${esc(i.n || "Raum")}${esc(tip)}</title>`;
      if (r) {
        const pin = here.some((x) => x.on && x.pe.room && x.pe.room.id === i.id), o = (0.32 + 0.5 * p) * (pin ? 0.4 : 1);   /* weicher Schein von der Mitte; stehen Lampen im Plan, leuchten vor allem sie */
        d += `<clipPath id="${u}k${esc(i.id)}"><path d="${path}"/></clipPath><path d="${path}" class="l3pbase"/>`;
        if (n) d += `<radialGradient id="${cid}" cx=".5" cy=".5" r=".72"><stop offset="0" stop-color="${r.col}" stop-opacity="${o.toFixed(2)}"/><stop offset=".55" stop-color="${r.col}" stop-opacity="${(o * 0.55).toFixed(2)}"/><stop offset="1" stop-color="${r.col}" stop-opacity=".06"/></radialGradient><path class="l3pglow" d="${path}" fill="url(#${cid})"/>`;
        d += `<path d="${path}" fill="none" stroke="${n ? r.col : "var(--line,#334155)"}" stroke-width="2" stroke-opacity="${n ? 0.85 : 0.7}"/>`;
      } else if (aid || none) d += `<clipPath id="${u}k${esc(i.id)}"><path d="${path}"/></clipPath><path d="${path}" class="l3pbase dim"/><path d="${path}" fill="none" stroke="var(--line,#334155)" stroke-width="1.5" stroke-opacity=".6"/>`;
      else d += `<path d="${path}" class="l3pbase un"/><path d="${path}" fill="url(#${u}un)" opacity=".6"/><path d="${path}" fill="none" stroke="var(--line,#334155)" stroke-width="2" stroke-dasharray="6 5"/>`;
      d += `</g>`;
      lab.push({ i, r, aid, none });
    });
    here.filter((x) => x.on).forEach((x, k) => {
      const it = x.pe.it, c = hex(x.rgb), b = (x.dim ? x.br : 100) / 100, R = (it.k === "spot" ? 0.7 : it.k === "aussen" ? 1.3 : 1) * (45 + 105 * b), g = `${u}lg${k}`;
      d += `<radialGradient id="${g}"><stop offset="0" stop-color="${c}" stop-opacity="${(0.5 + 0.35 * b).toFixed(2)}"/><stop offset=".45" stop-color="${c}" stop-opacity="${(0.22 + 0.18 * b).toFixed(2)}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
        <g pointer-events="none"${x.pe.room ? ` clip-path="url(#${u}k${esc(x.pe.room.id)})"` : ""}>${it.k === "streifen" ? `<rect x="${it.x - 70}" y="${it.y - 45}" width="140" height="90" rx="45" fill="url(#${g})"${it.r ? ` transform="rotate(${it.r} ${it.x} ${it.y})"` : ""}/>` : `<circle cx="${it.x}" cy="${it.y}" r="${R.toFixed(0)}" fill="url(#${g})"/>`}</g>`;
    });
    /* Wände, Türen, Fenster – schlicht, damit das Licht die Hauptrolle spielt */
    items.forEach((i) => {
      const a = i.r ? ` transform="rotate(${i.r} ${i.x} ${i.y})"` : "";
      if (i.t === "w") d += `<path d="M${i.x} ${i.y}L${i.x2} ${i.y2}" class="l3pw"/>`;
      else if (i.t === "d") d += `<g${a} class="l3pd"><rect x="${i.x - 15}" y="${i.y - 4}" width="30" height="8" rx="2"/></g>`;
      else if (i.t === "f") d += `<g${a}><rect x="${i.x - 17}" y="${i.y - 3.5}" width="34" height="7" rx="2.5" fill="#bfdbfe" fill-opacity=".55" stroke="#60a5fa" stroke-width="1"/></g>`;
    });
    /* Beschriftung und Lampenpunkte */
    lab.forEach(({ i, r, aid, none }) => {
      const big = Math.min(26 * NF, i.h * 0.26, i.w * 0.22), small = Math.min(13 * NF, Math.max(10, big * 0.5), i.w * 0.095), pad = Math.max(8, Math.min(14, i.w * 0.05));
      const x = i.x + 3, y = i.y + 3, w = i.w - 6, h = i.h - 6;
      let nm = String(i.n || (r ? r.name : "Raum")); const mx = Math.max(3, Math.floor((w - pad * 2) / (small * 0.58))); if (nm.length > mx) nm = nm.slice(0, mx - 1) + "…";
      d += `<g pointer-events="none"><text x="${x + pad}" y="${y + pad + small}" font-size="${small}" class="l3pn">${esc(nm)}</text>`;
      if (r) {
        const n = r.on.length, ty = y + pad + small + 5 + big;
        if (h > small * 2 + big) d += `<text x="${x + pad}" y="${ty}" font-size="${big}" class="l3pt${n ? "" : " off"}">${n ? r.pct + " %" : "aus"}</text>`;
        if (n && h > small * 3.4 + big + 26 * NF) d += `<text x="${x + pad}" y="${ty + small * 1.3}" font-size="${small * 0.88}" class="l3pz">${n} von ${r.lamps.length} an</text>`;
        const lk = longK[r.k];
        if (lk) { const fz = 10.5 * NF, t = `seit ${this._liDur(lk)}`, bw = t.length * fz * 0.56 + fz * 1.9;
          if (bw < w * 0.6) d += `<g><rect x="${x + w - bw - 8}" y="${y + 8}" width="${bw}" height="${fz * 1.7}" rx="${fz * 0.85}" fill="#f59e0b" fill-opacity=".9"/><text x="${x + w - bw - 8 + fz * 0.9}" y="${y + 8 + fz * 1.2}" font-size="${fz}" font-weight="700" fill="#1c1003">${t}</text></g>`;
          else d += `<g><circle cx="${x + w - 8 - fz * 0.75}" cy="${y + 8 + fz * 0.75}" r="${fz * 0.75}" fill="#f59e0b"/><text x="${x + w - 8 - fz * 0.75}" y="${y + 8 + fz * 1.12}" font-size="${fz}" font-weight="800" fill="#1c1003" text-anchor="middle">!</text></g>`; }
        const nu = r.lamps.filter((q) => q.un).length;   /* B6: Plakette „offline“ unter der Zeit-Plakette */
        if (nu) { const fz = 10.5 * NF, t = nu > 1 ? `${nu} offline` : "offline", bw = t.length * fz * 0.56 + fz * 1.9, by = y + 8 + (lk ? fz * 2.1 : 0);
          if (bw < w * 0.6) d += `<g><rect x="${x + w - bw - 8}" y="${by}" width="${bw}" height="${fz * 1.7}" rx="${fz * 0.85}" fill="#dc2626" fill-opacity=".9"/><text x="${x + w - bw - 8 + fz * 0.9}" y="${by + fz * 1.2}" font-size="${fz}" font-weight="700" fill="#fff">${t}</text></g>`; }
      } else d += `<text x="${x + pad}" y="${y + pad + small * 2.4}" font-size="${small * 0.88}" class="l3pz">${aid ? "keine Lampen" : none ? "kein Bereich" : adm ? "Antippen zum Zuordnen" : "nicht zugeordnet"}</text>`;
      d += `</g>`;
      const loose = r ? r.lamps.filter((q) => !(q.pe && q.pe.it.fl === fl)) : [];
      if (r && loose.length) {   /* Punkte unten links für Lampen, die (noch) nicht im Plan stehen; in kleinen Räumen weniger */
        const pr = Math.max(4.5, Math.min(7 * NF, h * 0.055, w * 0.04)), stp = pr * 3.6, maxN = Math.max(1, Math.floor((w - pad * 2) / stp)), shown = loose.slice(0, maxN), py = y + h - pad - pr;
        shown.forEach((x2, k) => {
          const cx = x + pad + pr + k * stp, c = hex(x2.rgb);
          d += `<g class="l3pl loose${x2.on ? " on" : ""}${x2.un ? " un" : ""}" ${x2.un ? "" : `data-act="lixsw" data-k="${esc(x2.id)}" data-lhold="${esc(x2.id)}"`}><title>${esc(x2.name)} · ${x2.un ? "nicht erreichbar" : x2.on ? (x2.dim ? x2.br + " %" : "an") : "aus"} · noch nicht im Plan platziert · lang drücken für Details</title>
            <circle cx="${cx}" cy="${py}" r="${pr * 1.9}" fill="transparent"/><circle cx="${cx}" cy="${py}" r="${pr * 1.55}" fill="none" stroke="var(--mut,#94a3b8)" stroke-width="1.2" stroke-dasharray="2.5 2.5" opacity=".8"/>${x2.on ? `<circle cx="${cx}" cy="${py}" r="${pr * 1.8}" fill="${c}" opacity=".28"/>` : ""}<circle cx="${cx}" cy="${py}" r="${pr}" fill="${x2.un ? "none" : x2.on ? c : "#475569"}" stroke="${x2.un ? "#64748b" : x2.on ? "rgba(255,255,255,.85)" : "rgba(0,0,0,.45)"}" stroke-width="${x2.un ? 1.5 : 2}" ${x2.un ? `stroke-dasharray="2.5 2.5"` : ""}/></g>`;
        });
        if (loose.length > shown.length) d += `<text x="${x + pad + shown.length * stp + pr * 0.2}" y="${py + pr * 0.45}" font-size="${pr * 1.3}" class="l3pz" pointer-events="none">+${loose.length - shown.length}</text>`;
      }
    });
    /* B3: Lampen an ihrem Platz (wie im Baukasten), antippen schaltet, lang drücken öffnet das Detail */
    here.forEach((x) => {
      const it = x.pe.it, c = hex(x.rgb), q = NF > 1 ? 1.35 : 1, rot = it.r ? ` transform="rotate(${it.r} ${it.x} ${it.y})"` : "", fill = x.un ? "transparent" : x.on ? c : "#334155", stroke = x.un ? "#64748b" : x.on ? "#fff" : "#94a3b8";
      const body = it.k === "streifen" ? `<rect x="${it.x - 22 * q}" y="${it.y - 4 * q}" width="${44 * q}" height="${8 * q}" rx="${4 * q}" fill="${fill}" stroke="${stroke}" stroke-width="1.8"${x.un ? ` stroke-dasharray="3 2"` : ""}${rot}/>`
        : `<circle cx="${it.x}" cy="${it.y}" r="${(it.k === "spot" ? 6 : 9) * q}" fill="${fill}" stroke="${stroke}" stroke-width="2"${x.un ? ` stroke-dasharray="2.5 2.5"` : ""}/>${it.k === "steh" ? `<path d="M${it.x} ${it.y + 9 * q}v${7 * q}M${it.x - 5 * q} ${it.y + 16 * q}h${10 * q}" stroke="${stroke}" stroke-width="1.8"/>` : ""}`;
      d += `<g class="l3pl${x.on ? " on" : ""}${x.un ? " un" : ""}" ${x.un ? "" : `data-act="lixsw" data-k="${esc(x.id)}" data-lhold="${esc(x.id)}"`}><title>${esc(x.name)} · ${x.un ? "nicht erreichbar" : x.on ? (x.dim ? x.br + " %" : "an") : "aus"}${x.pos ? " · Raum aus der Position" : ""} · lang drücken für Details</title><circle cx="${it.x}" cy="${it.y}" r="${20 * q}" fill="transparent"/>${body}</g>`;
    });
    /* Kopfzeile, Etagen, nicht zugeordnete Flächen, Räume ohne Fläche */
    const mapped = new Set([...map.values()].filter(Boolean).map((r) => r.k)), un = allR.filter((i) => !this._liPArea(i) && (this._liD().pmap || {})[i.id] !== "-");
    const flOn = rs.map((i) => map.get(i.id)).filter((r) => r && r.on.length), nOn = flOn.reduce((a, r) => a + r.on.length, 0);
    const shown = rooms.filter((r) => !r.hid), off = shown.filter((r) => !mapped.has(r.k) && r.lamps.length);
    const bar = fls.length > 1 ? `<span class="sffl">${fls.map((f) => { const c = allR.filter((i) => i.fl === f.id).map((i) => map.get(i.id)).filter((r) => r && r.on.length).length; return `<button class="${f.id === fl ? "on" : ""}" data-act="lixfl" data-k="${esc(f.id)}">${esc(f.n)}${c ? ` <b class="l3fc">${c}</b>` : ""}</button>`; }).join("")}</span>` : "";
    const sum = `<div class="l3psum"><span>${ic("lamp", 14)}<b>${nOn}</b> ${nOn === 1 ? "Lampe" : "Lampen"} an auf dieser Etage</span><span>${ic("grid", 14)}<b>${flOn.length}</b> von ${rs.filter((i) => map.get(i.id)).length} Räumen hell</span>
      ${(() => { const nl = rs.map((i) => map.get(i.id)).filter((r) => r && longK[r.k]).length; return nl ? `<span class="w">${ic("bell", 14)}<b>${nl}</b> lange an</span>` : ""; })()}
      ${(() => { const np = LA.filter((x) => !x.pe).length; return np ? (adm && (sf || this._grEdit) ? `<button class="u" data-act="lixplace" title="Im Baukasten platzieren">${np} ${np === 1 ? "Lampe" : "Lampen"} nicht im Plan${ic("chev", 13)}</button>` : `<span>${np} ${np === 1 ? "Lampe" : "Lampen"} nicht im Plan</span>`) : ""; })()}
      ${un.length ? (adm ? `<button class="u" data-act="lixpun">${un.length} ${un.length === 1 ? "Fläche" : "Flächen"} nicht zugeordnet${ic("chev", 13)}</button>` : `<span class="u">${un.length} nicht zugeordnet</span>`) : ""}</div>`;
    const offRow = off.length ? `<div class="l3poff"><span class="mut sm">Nicht im Grundriss:</span>${off.map((r) => `<button class="l3chip ${r.on.length ? "" : "off"}" style="--c:${r.on.length ? r.col : "#475569"}" data-act="lixroom" data-k="${esc(r.k)}" aria-label="${esc(r.name)} ${r.on.length ? "ausschalten" : "einschalten"}" title="${esc(r.lamps.map((q) => q.name).join(", "))}"><i></i>${esc(r.k === "_" ? "Ohne Bereich" : r.name)} · ${r.lamps.length} ${r.lamps.length === 1 ? "Lampe" : "Lampen"} · ${r.on.length ? r.on.length + " an" : "aus"}</button>`).join("")}</div>` : "";
    const legend = `<div class="l3plg"><span><i style="background:#ffd2a1;box-shadow:0 0 6px #ffb36b"></i>an (echte Farbe)</span><span><i style="background:#475569"></i>aus</span><span><i style="border:1.5px dashed #64748b"></i>offline</span><span><i style="background:#334155;border:1.5px solid #94a3b8"></i>Lampe im Plan</span><span><i style="background:#475569;outline:1.5px dashed #94a3b8;outline-offset:2px;width:8px;height:8px"></i>noch nicht platziert</span><span><i class="un"></i>nicht zugeordnet</span><span>Fläche antippen = Raum schalten · Punkt antippen = Lampe · lang drücken = Details</span></div>`;
    const vb = `${B.x0 - 16} ${B.y0 - 16} ${B.x1 - B.x0 + 32} ${B.y1 - B.y0 + 32}`;
    this._liHold();
    return `<div class="card l3pc"><h2>${ic("home", 18)}Lichtkarte<span class="sfhr">${bar}${adm && sf ? `<button class="sfed" data-act="gpedit">${ic("pencil", 14)} Grundriss bearbeiten</button>` : ""}</span></h2>
      ${sum}<div class="l3pv"><svg viewBox="${vb}" role="img" aria-label="Grundriss mit eingeschalteten Lampen">${d}</svg></div>${offRow}${legend}</div>`;
  }
  /* Lang drücken (Handy) oder Rechtsklick (Computer) auf einen Lampenpunkt öffnet das Detail statt zu schalten */
  _liHold() {
    const sr = this.shadowRoot; if (!sr || this._liHoldOn) return; this._liHoldOn = true;
    const end = () => { clearTimeout(this._liHT); this._liHS = null; };
    sr.addEventListener("pointerdown", (e) => { const g = e.target.closest && e.target.closest("[data-lhold]"); if (!g) return; this._liHS = { x: e.clientX, y: e.clientY }; clearTimeout(this._liHT);
      this._liHT = setTimeout(() => { this._liHeld = Date.now(); this._modal = { type: "lixdet", id: g.dataset.lhold }; this._renderModal(); try { navigator.vibrate && navigator.vibrate(12); } catch (_) {} }, 520); }, true);
    sr.addEventListener("pointermove", (e) => { if (this._liHS && Math.hypot(e.clientX - this._liHS.x, e.clientY - this._liHS.y) > 8) end(); }, true);
    ["pointerup", "pointercancel", "pointerleave"].forEach((t) => sr.addEventListener(t, end, true));
    sr.addEventListener("contextmenu", (e) => { const g = e.target.closest && e.target.closest("[data-lhold]"); if (!g) return; e.preventDefault(); end(); this._liHeld = Date.now(); this._modal = { type: "lixdet", id: g.dataset.lhold }; this._renderModal(); }, true);
  }
  _lixPmapModal(m) {
    const P = this._gpPlan && this._gpPlan(), it = P && (P.items || []).find((i) => i.id === m.k); if (!it) return `<div class="ov" data-act="close"></div>`;
    const rooms = this._liRooms().filter((r) => r.k !== "_"), cur = ((this._grS && this._grS.d && this._grS.d.rooms) || this._liD().pmap || {})[it.id] || "", auto = cur ? null : this._liPRoom(it, rooms);
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Fläche zuordnen</b><span>Grundriss: ${esc(it.n || "ohne Namen")}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut sm" style="margin:0 0 10px">Welcher Bereich aus Home Assistant liegt hier? Seine Lampen leuchten dann auf dieser Fläche. Die Zuordnung steht in der Raumliste von Modul 0 und gilt für alle Module.</div>
      <div class="gschips">${rooms.map((r) => `<button class="gsch ${cur === r.k || (!cur && auto && auto.k === r.k) ? "sel" : ""}" data-act="lixpmset" data-k="${esc(it.id)}" data-v="${esc(r.k)}">${esc(r.name)} (${r.lamps.length})</button>`).join("")}</div>
      <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="lixpmset" data-k="${esc(it.id)}" data-v="-">Kein Bereich</button>${cur ? `<button class="btn2" data-act="lixpmset" data-k="${esc(it.id)}" data-v="">Automatisch</button>` : ""}<button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  /* ================= Seite wie bisher (Build 1), für „Optik wie bisher“ ================= */
  _liPageOld() {
    const adm = this._admin(), rooms = this._liRooms(), shown = rooms.filter((r) => !r.hid), lamps = shown.flatMap((r) => r.lamps).filter((x) => !x.un);
    const banner = "";
    if (!rooms.length) return `${banner}<div class="card empty">${ic("lamp", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Keine Lampen gefunden</div>Es gibt in Home Assistant keine Entität light.*. Lampen richtest du in Home Assistant unter Geräte und Dienste ein.</div>`;
    const on = lamps.filter((x) => x.on), L = this._liLay(), long = this._liLong();
    const top = shown.slice().sort((a, b) => b.on.length - a.on.length)[0], mx = on.length ? Math.max(...on.map((x) => x.since)) : 0, longest = on.find((x) => x.since === mx);
    const mu = this._muOn() ? this._mu() : null, mul = mu && mu.cfg && mu.cfg.light && mu.cfg.light.on && mu.cfg.light.ent ? mu.cfg.light.ent : "";
    const tiles = `<div class="lugrid lixtiles">${this._labTile("Lampen an", String(on.length), `von ${lamps.length} in ${shown.length} ${shown.length === 1 ? "Raum" : "Räumen"}`, on.length ? "amber" : "")}${this._labTile("Meiste Lampen an", top && top.on.length ? esc(top.name) : "–", top && top.on.length ? `${top.on.length} von ${top.lamps.length} an` : "Alles aus")}${this._labTile("Längste an", on.length ? this._liDur(mx) : "–", on.length && longest ? esc(longest.name) : "Nichts an")}${mul ? this._labTile("Müll-Licht", this._hass.states[mul] && this._hass.states[mul].state === "on" ? "An" : "Aus", esc(this._wzName(mul)) + " (Modul 17)") : ""}</div>`;
    const scn = `<div class="gbtns lixscn">${this._liSceneBtn("night", "Gute Nacht", "moon", true)}<button class="btn2" data-act="lixalloff" ${on.length ? "" : "disabled"}>${ic("lamp", 15)} Alle aus</button>${this._liSceneBtn("arrive", "Ankommen", "home")}${this._liSceneBtn("cozy", "Gemütlich", "fireplace")}</div>`;
    const names = ["night", "arrive", "cozy"].filter((k) => L.scenes[k] && this._hass.states[L.scenes[k]]).map((k) => `${{ night: "Gute Nacht", arrive: "Ankommen", cozy: "Gemütlich" }[k]}: ${esc(this._wzName(L.scenes[k]))}`);
    const now = `<div class="card"><h2>${ic("lamp", 18)}Jetzt</h2>${tiles}<div style="margin-top:12px">${scn}</div>${names.length ? `<div class="mut sm" style="margin-top:8px">${names.join(" · ")}</div>` : adm ? `<div class="mut sm" style="margin-top:8px">Die drei Knöpfe verknüpfst du in den Einstellungen mit deinen Szenen oder Skripten.</div>` : ""}</div>`;
    const hint = long.slice(0, 3).map((x) => `<div class="gst on lixhint">${ic("bell", 15)}<span><b>${esc(x.r.name === "Ohne Raum" ? "Licht ohne Raum" : "Im Raum „" + x.r.name + "“")} brennt seit ${this._liDur(x.ms)}</b> · ${x.l.map((y) => esc(y.name)).join(", ")}</span><button class="lnk" data-act="lixroomoff" data-k="${esc(x.r.k)}">Ausschalten</button></div>`).join("");
    const room = (r) => {
      const n = r.on.length, bp = r.dim.filter((x) => x.on), avg = bp.length ? Math.round(bp.reduce((a, x) => a + x.br, 0) / bp.length) : 0;
      return `<div class="card lixroom ${n ? "on" : ""}"><div class="lixhd"><span class="lixico">${ic("lamp", 20)}</span><div class="lixt"><b>${esc(r.name)}</b><small>${n ? `${n} von ${r.lamps.length} an` : "aus"}</small></div><button class="sw ${n ? "on" : ""}" data-act="lixroom" data-k="${esc(r.k)}" aria-pressed="${!!n}" aria-label="${esc(r.name)}: ${n ? "alle ausschalten" : "alle einschalten"}"></button></div>
        ${bp.length ? `<div class="lixrng"><span>${ic("sun", 14)}</span><input type="range" min="1" max="100" value="${avg}" data-f="lixbr" data-k="${esc(r.k)}" aria-label="Helligkeit ${esc(r.name)}"><b>${avg} %</b></div>` : ""}
        <div class="lixl">${r.lamps.map((x) => `<div class="lixlamp ${x.on ? "on" : ""} ${x.un ? "un" : ""}"><button class="lixnm" data-act="lixdet" data-k="${esc(x.id)}" ${x.un ? "disabled" : ""} aria-label="${esc(x.name)}: Details">${ic("lamp", 16)}<span>${esc(x.name)}${x.un ? `<small>nicht erreichbar</small>` : x.on && x.dim ? `<small>${x.br} %</small>` : ""}</span></button><button class="sw ${x.on ? "on" : ""}" data-act="lixsw" data-k="${esc(x.id)}" aria-pressed="${x.on}" aria-label="${esc(x.name)} ${x.on ? "ausschalten" : "einschalten"}" ${x.un ? "disabled" : ""}></button></div>`).join("")}</div></div>`;
    };
    return `${banner}${now}${hint}<div class="lixgrid">${shown.map(room).join("") || `<div class="card empty">Alle Räume sind ausgeblendet. Einblenden kannst du sie in den Einstellungen.</div>`}</div>`;
  }
  _lixAct(a, b) {
    const k = b.dataset.k, rooms = this._liRooms();
    if (a === "lixopen") { this._modal = { type: "lixset" }; this._renderModal(); return; }
    if (a === "lixdet") { this._modal = { type: "lixdet", id: k }; this._renderModal(); return; }
    if (a === "lixalloff") { this._modal = { type: "lixoff" }; this._renderModal(); return; }
    if (a === "lixalloffgo") { const ids = this._liLamps().filter((x) => x.on && !(x.cfg && x.cfg.alloff === false)).map((x) => x.id); this._modal = null; this._renderModal(); if (ids.length) this._liSwitch(ids, false); this._toast("Alle Lampen werden ausgeschaltet"); return; }
    if (a === "lixsw") { const x = this._liLamps().find((y) => y.id === k); if (x) this._liSwitch([k], !x.on).then(() => this._liRefresh()); return; }
    if (a === "lixroom") { const r = rooms.find((y) => y.k === k); if (r) this._liSwitch((r.on.length ? r.on : r.lamps.filter((x) => !x.un)).map((x) => x.id), !r.on.length); return; }
    if (a === "lixroomoff") { const r = rooms.find((y) => y.k === k); if (r && r.on.length) this._liSwitch(r.on.map((x) => x.id), false); return; }
    if (a === "lixscn") {
      const e = this._liLay().scenes[k];
      if (!e || !this._hass.states[e]) { if (this._admin()) { this._modal = { type: "lixset" }; this._renderModal(); } else this._toast("Dieser Knopf ist noch nicht mit einer Szene verknüpft"); return; }
      this._liCall(e.split(".")[0], "turn_on", { entity_id: e }); this._toast(`${this._wzName(e)} wird ausgeführt`); return;
    }
    if (a === "lixcol") { const m = this._modal; if (!m || m.type !== "lixdet") return; const d = { entity_id: m.id }; if (b.dataset.kel) d.color_temp_kelvin = +b.dataset.kel; else if (b.dataset.rgb) d.rgb_color = b.dataset.rgb.split(",").map(Number); this._liCall("light", "turn_on", d); return; }
    if (a === "lixhrs") { this._liSave({ hours: +k }); return; }
    if (a === "lixhide") { const h = this._liLay().hidden; this._liSave({ hidden: h.includes(k) ? h.filter((x) => x !== k) : [...h, k] }); return; }
    if (a === "lixunlink") { const l = this._liLay(); this._liSave({ scenes: { ...l.scenes, [k]: "" } }); return; }
    if ((a === "lixsw" || a === "lixroom") && this._liHeld && Date.now() - this._liHeld < 700) return;   /* nach langem Drücken nicht zusätzlich schalten */
    if (a === "lixfl") { this._liFl = k; this._render(); return; }
    if (a === "lixgo0") { if (this._mdActiveSet) { this._mdActiveSet("gr"); this._grTab = "raeume"; this._render(); } return; }   /* Zuordnen passiert in Modul 0 */
    if (a === "lixedit0") { if (this._grEdit) { this._grEdit("li", ""); this._render(); } return; }
    if (a === "lixtab") { this._liTab = ["lampen", "regeln"].includes(k) ? k : "ov"; this._render(); return; }
    if (a.startsWith("lixr") && this._lixRAct(a, b, k)) return;
    if (a === "lixmig") {   /* Umstieg auf „Meine Lampen“ */
      if (!this._admin()) return;
      if (k === "later") { this._liSaveLamps(this._liD().lamps || [], { mode: "auto" }, "Alles bleibt wie bisher – umstellen kannst du jederzeit im Reiter „Lampen“"); return; }
      if (k === "pick") { this._liTab = "lampen"; this._liSaveLamps(this._liD().lamps || [], { mode: "mine" }); this._modal = { type: "lixadd", f: "neu", sel: [] }; this._renderModal(); return; }
      const st = this._hass.states, PL = this._liPlaced();
      const lamps = this._liAllLights().filter((e) => !Array.isArray((st[e].attributes || {}).entity_id)).map((e) => { const c = this._liNewCfg(e), pe = PL[e]; if (!this._liAreaOf(e) && pe && pe.room) { const pa = this._liPArea(pe.room); if (pa) c.room = pa; } if (pe && pe.it && pe.it.k) c.k = pe.it.k; return c; });
      this._liTab = "lampen"; this._liSaveLamps(lamps, { mode: "mine" }, `${lamps.length} Lampen übernommen`); return;
    }
    if (a === "lixadd") { if (this._admin()) { this._modal = { type: "lixadd", f: "neu", sel: k === "new" ? this._liNewLamps() : [] }; this._renderModal(); } return; }
    if (a === "lixaf") { const m = this._modal; if (m && m.type === "lixadd") { m.f = k; this._renderModal(); } return; }
    if (a === "lixasel") { const m = this._modal; if (m && m.type === "lixadd") { const s2 = new Set(m.sel || []); if (s2.has(k)) s2.delete(k); else s2.add(k); m.sel = [...s2]; this._renderModal(); } return; }
    if (a === "lixanext") { const m = this._modal; if (!m || !(m.sel || []).length) return; if (m.sel.length === 1) { this._modal = { type: "lixedit", k: m.sel[0], from: "add" }; this._renderModal(); return; } this._act("lixaall", b); return; }
    if (a === "lixaall") { const m = this._modal; if (!m) return; const add = (m.sel || []).map((e) => this._liNewCfg(e)), cur = this._liD().lamps || []; this._modal = null; this._renderModal(); this._liSaveLamps([...cur, ...add], { mode: "mine" }, `${add.length} Lampen hinzugefügt – Name und Raum änderst du je Lampe`); return; }
    if (a === "lixign") { const D = this._liD(); this._liSaveLamps(D.lamps || [], { ignored: [...(D.ignored || []), ...this._liNewLamps()] }, "Ausgeblendet – über „Lampe hinzufügen“ → „Alle“ findest du sie wieder"); return; }
    if (a === "lixedit") { if (this._admin()) { this._modal = { type: "lixedit", k }; this._renderModal(); } return; }
    if (a === "lixek") { const m = this._modal; if (m && m.draft) { m.draft.k = k; this._renderModal(); } return; }
    if (a === "lixeao") { const m = this._modal; if (m && m.draft) { m.draft.alloff = m.draft.alloff === false; this._renderModal(); } return; }
    if (a === "lixmfl") { const m = this._modal; if (m && m.type === "lixedit") { m.mfl = k; this._renderModal(); } return; }
    if (a === "lixeunpl") { const m = this._modal; if (m && m.type === "lixedit") { m.pos = null; this._renderModal(); } return; }
    if (a === "lixeroom") { const m = this._modal; if (m && m.draft) { m.draft.room = k; this._renderModal(); } return; }
    if (a === "lixesave") {
      const m = this._modal; if (!m || !m.draft) return;
      this._lixSavePos(m, m.draft);
      const cur = (this._liD().lamps || []).filter((x) => x.e !== m.k), i = (this._liD().lamps || []).findIndex((x) => x.e === m.k), isNew = i < 0;
      const list = isNew ? [...cur, m.draft] : [...cur.slice(0, i), m.draft, ...cur.slice(i)];
      this._modal = null; this._renderModal(); this._liSaveLamps(list, { mode: "mine" }, isNew ? `${m.draft.n || this._wzName(m.k)} hinzugefügt` : "Gespeichert"); return;
    }
    if (a === "lixedel") { const D = this._liD(); this._modal = null; this._renderModal(); this._liSaveLamps((D.lamps || []).filter((x) => x.e !== k), { ignored: [...(D.ignored || []), k] }, `${this._wzName(k)} entfernt`); return; }
    if (a === "lixtest") { api.call(ID, "act", { a: "test", e: k }).then(() => this._toast(`${this._wzName(k)} blinkt`)).catch((err) => { this._toast(`${this._wzName(k)}: Testen hat nicht geklappt – ${String((err && err.message) || "").slice(0, 120)}`); this._liRefresh(); }); return; }
    if (a === "lixplace") {   /* B7: in den Baukasten, Werkzeug „Lampe“ gewählt; die freien Lampen stehen dort als Liste. Ab Modul 0 Build 3 in Modul 0, danach zurück */
      if (!this._admin()) return;
      if (this._grEdit) { this._modal = null; this._renderModal(); this._grEdit("li", "l"); return; }
      this._act("gpedit", b);
      let n = 0; const go = () => { if (this._sfEd) { this._sfEd.tool = "l"; this._sfEd.sel = ""; this._render(); } else if (n++ < 12) setTimeout(go, 250); };
      setTimeout(go, 500); return;
    }
    if (a === "lixpmap") { if (this._admin()) { this._modal = { type: "lixpmap", k }; this._renderModal(); } return; }
    if (a === "lixpun") {   /* nächste nicht zugeordnete Fläche: Etage wechseln und „Fläche zuordnen“ öffnen */
      const P = this._gpPlan && this._gpPlan(), rs = this._liRooms(), pm = this._liD().pmap || {}, fo = ((P && P.floors) || []).map((f) => f.id);
      const un = ((P && P.items) || []).filter((i) => i.t === "r" && pm[i.id] !== "-" && !this._liPArea(i)).sort((x, y) => (x.fl === this._liFl ? -1 : 0) - (y.fl === this._liFl ? -1 : 0) || fo.indexOf(x.fl) - fo.indexOf(y.fl));
      if (!un.length) return;
      this._liFl = un[0].fl; this._render(); this._modal = { type: "lixpmap", k: un[0].id }; this._renderModal(); return;
    }
    if (a === "lixpmset") {
      if (!this._admin()) return;
      const S = this._liX || {}, v = b.dataset.v || "", pm = { ...((S.d && S.d.pmap) || {}) };
      if (v) pm[k] = v; else delete pm[k];
      if (S.d) S.d.pmap = pm;
      this._modal = null; this._renderModal(); this._render();
      if (this._grS && this._grS.d) { const r = { ...(this._grS.d.rooms || {}) }; if (v) r[k] = v; else delete r[k]; this._grS.d = { ...this._grS.d, rooms: r }; }   /* Raumliste von Modul 0 sofort mitziehen */
      api.call(ID, "set", { pmap: { [k]: v } }).then((d) => { if (this._liX) { this._liX.d = d; this._liX.ts = Date.now(); } if (this._grDirty) this._grDirty(); this._render(); }).catch(() => this._toast("Speichern fehlgeschlagen"));
      return;
    }
    if (a === "lixmode") { if (!this._admin()) return; if (k === "mine" && !(this._liD().lamps || []).length) { this._modal = null; this._renderModal(); this._act("lixmig", { dataset: { k: "pick" } }); return; } this._liSaveLamps(this._liD().lamps || [], { mode: k === "mine" ? "mine" : "auto" }); return; }
    if (a === "lixview" || a === "lixoptik") {
      const S = this._liX || {}, patch = a === "lixview" ? { view: k } : { optik: k };
      if (S.d) S.d.prefs = { ...(S.d.prefs || {}), ...patch };  // sofort zeigen
      this._render(); if (this._modal) this._renderModal();
      if (this._admin()) api.call(ID, "set", { prefs: patch }).then((d) => { if (this._liX) { this._liX.d = d; this._liX.ts = Date.now(); } }).catch(() => this._toast("Speichern fehlgeschlagen"));
      return;
    }
  }
  _lixChange(t) {
    const f = t.dataset.f, k = t.dataset.k, v = t.value || "";
    if (f === "lixrn") { const m = this._modal; if (m && m.draft) m.draft.n = String(v).slice(0, 40); return true; }
    if (f === "lixrroom") { const m = this._modal; if (m && m.draft) { m.draft.room = v; if (!m.pick) m.draft.lamps = []; this._renderModal(); } return true; }
    if (f === "lixen") { const m = this._modal; if (m && m.draft) m.draft.n = String(v).slice(0, 40); return true; }
    if (f === "lixer") { const m = this._modal; if (m && m.draft) m.draft.room = v; return true; }
    if (f === "lixaq") { const m = this._modal; if (m && m.type === "lixadd") { m.q = v; this._renderModal(); } return true; }
    if (f === "lixsel") { if (["night", "arrive", "cozy"].includes(k) && (v === "" || /^(scene|script)\.[a-z0-9_]+$/.test(v))) { const l = this._liLay(); this._liSave({ scenes: { ...l.scenes, [k]: v } }); } return true; }
    if (f === "lixbr") { const r = this._liRooms().find((y) => y.k === k), p = Math.max(1, Math.min(100, Math.round(Number(v)))); if (r && r.dim.some((x) => x.on)) this._liSwitch(r.dim.filter((x) => x.on).map((x) => x.id), true, { brightness_pct: p }); return true; }
    if (f === "lixdbr") { const m = this._modal; if (m && m.type === "lixdet") this._liCall("light", "turn_on", { entity_id: m.id, brightness_pct: Math.max(1, Math.min(100, Math.round(Number(v)))) }); return true; }
    if (f === "lixkel") { const m = this._modal; if (m && m.type === "lixdet") this._liCall("light", "turn_on", { entity_id: m.id, color_temp_kelvin: Math.round(Number(v)) }); return true; }
    return false;
  }
  _lixDetNew(x) {
    const sw = this._liSwatches(x), c = hex(x.rgb), pct = x.on ? (x.dim ? x.br : 100) : 0, R = 54, L = 2 * Math.PI * R;
    const kv = x.kel || Math.round((x.kmin + x.kmax) / 2), kp = Math.max(0, Math.min(100, (kv - x.kmin) / Math.max(1, x.kmax - x.kmin) * 100));
    return `<style>${CSS}</style><div class="ov" data-act="close"></div><div class="sheet l3det" role="dialog" aria-modal="true"><div class="sh"><div><b>${esc(x.name)}</b><span>${esc(this._liAreaName(x.area))} · ${x.un ? "nicht erreichbar" : x.on ? `an seit ${this._liDur(x.since)}` : "aus"}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="vrow"><span>Lampe</span><button class="sw ${x.on ? "on" : ""}" data-act="lixsw" data-k="${esc(x.id)}" aria-pressed="${x.on}" aria-label="${esc(x.name)} ${x.on ? "ausschalten" : "einschalten"}"></button></div>
      <svg class="ring" viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="${R}" fill="none" stroke="color-mix(in srgb,var(--primary-text-color) 10%,transparent)" stroke-width="12"/>${x.on ? `<circle cx="70" cy="70" r="40" fill="${c}" opacity=".18"/><circle cx="70" cy="70" r="${R}" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(L * pct / 100).toFixed(1)} ${L.toFixed(1)}" transform="rotate(-90 70 70)"/>` : ""}<text x="70" y="74" text-anchor="middle" font-size="24" font-weight="700" fill="currentColor">${x.on ? pct + " %" : "aus"}</text><text x="70" y="92" text-anchor="middle" font-size="10" fill="var(--mut)">Helligkeit</text></svg>
      ${x.dim ? `<div class="l3bar" style="--g:${c}"><span class="mut sm">${ic("sun", 14)}</span><input type="range" min="1" max="100" value="${x.on ? x.br : 50}" data-f="lixdbr" aria-label="Helligkeit"></div>` : `<div class="mut sm" style="margin:8px 0;text-align:center">Diese Lampe kann nur ein- und ausgeschaltet werden.</div>`}
      ${x.ct ? `<div class="lsec">${ic("thermo", 15)}Weißton<span class="mut sm" style="margin-left:auto">${x.on && x.mode === "color_temp" && x.kel ? x.kel + " K" : "warm bis kalt"}</span></div><div class="l3kel"><div class="grad"></div>${x.on && x.mode === "color_temp" ? `<span class="mk" style="left:${kp.toFixed(1)}%;background:${c}"></span>` : ""}<input type="range" min="${x.kmin}" max="${x.kmax}" step="100" value="${kv}" data-f="lixkel" aria-label="Weißton"></div>` : ""}
      ${sw.length ? `<div class="lsec">${ic("palette", 15)}Lichtfarbe</div><div class="lixsw">${sw.map((s) => `<button class="lixc ${s.on ? "on" : ""}" style="background:${s.bg}" data-act="lixcol" ${s.d} aria-label="${esc(s.t)}" aria-pressed="${!!s.on}" title="${esc(s.t)}"></button>`).join("")}</div>` : ""}
      <div class="l3kv"><div><small>Heute an</small><b>${fmtH(x.today)} Std.</b></div><div><small>${x.on ? "An seit" : "Zustand"}</small><b>${x.on ? new Date(Date.now() - x.since).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr" : x.un ? "offline" : "aus"}</b></div></div>
      <div class="foot2" style="margin-top:12px"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _lixModal() {
    const m = this._modal, adm = this._admin();
    if (m.type === "lixpmap") return this._lixPmapModal(m);
    if (m.type === "lixedit") return this._lixEditModal(m);
    if (m.type === "lixrnew") return this._lixRNewModal();
    if (m.type === "lixredit") return this._lixREditModal(m);
    if (m.type === "lixrpause") return this._lixRPauseModal();
    if (m.type === "lixadd") return this._lixAddModal(m);
    if (m.type === "lixoff") {
      const n = this._liLamps().filter((x) => x.on).length;
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Alle Lampen ausschalten?</b><span>Modul 18 · Licht & Lampen</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm">${n ? `${n} ${n === 1 ? "Lampe ist" : "Lampen sind"} an und ${n === 1 ? "wird" : "werden"} jetzt ausgeschaltet. Das gilt für alle Räume, auch ausgeblendete.` : "Es ist keine Lampe an."}</div>
        <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="lixalloffgo" ${n ? "" : "disabled"}>Alle aus</button></div></div>`;
    }
    if (m.type === "lixdet") {
      const x = this._liLamps().find((y) => y.id === m.id); if (!x) return `<div class="ov" data-act="close"></div><div class="sheet"><div class="sh"><div><b>Lampe nicht gefunden</b></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div></div>`;
      if (this._liNew()) return this._lixDetNew(x);
      const sw = this._liSwatches(x);
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>${esc(x.name)}</b><span>${esc(this._liAreaName(x.area))} · ${x.un ? "nicht erreichbar" : x.on ? "an" : "aus"}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="vrow"><span>Lampe</span><button class="sw ${x.on ? "on" : ""}" data-act="lixsw" data-k="${esc(x.id)}" aria-pressed="${x.on}" aria-label="${esc(x.name)} ${x.on ? "ausschalten" : "einschalten"}"></button></div>
        ${x.dim ? `<div class="vrow"><span>Helligkeit</span><span class="lixrng" style="flex:1;max-width:60%"><input type="range" min="1" max="100" value="${x.on ? x.br : 50}" data-f="lixdbr" aria-label="Helligkeit"><b>${x.on ? x.br + " %" : "aus"}</b></span></div>` : `<div class="mut sm" style="margin:8px 0">Diese Lampe kann nur ein- und ausgeschaltet werden.</div>`}
        ${x.ct ? `<div class="vrow"><span>Weißton<small class="mut" style="display:block">${x.kel ? x.kel + " Kelvin" : "warm bis kalt"}</small></span><span class="lixrng" style="flex:1;max-width:60%"><input type="range" min="${x.kmin}" max="${x.kmax}" step="100" value="${x.kel || Math.round((x.kmin + x.kmax) / 2)}" data-f="lixkel" aria-label="Weißton"></span></div>` : ""}
        ${sw.length ? `<div class="lsec">${ic("palette", 15)}Lichtfarbe</div><div class="lixsw">${sw.map((s) => `<button class="lixc ${s.on ? "on" : ""}" style="background:${s.bg}" data-act="lixcol" ${s.d} aria-label="${esc(s.t)}" title="${esc(s.t)}"></button>`).join("")}</div>` : ""}
        <div class="foot2" style="margin-top:12px"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
    }
    const L = this._liLay(), H = this._hass, st = H.states, sc = Object.keys(st).filter((e) => e.startsWith("scene.") || e.startsWith("script.")), rooms = this._liRooms(), P = this._liPrefs();
    const slot = (k, t, h) => `<div class="lsec" style="margin-top:10px">${ic("link", 15)}${t}</div><div class="mut sm" style="margin:0 0 4px">${h}</div>${this._wzSel(sc, L.scenes[k], "lixsel", `data-k="${k}"`, "– nicht verknüpft –", /schlaf|nacht|aus|bed|night|ankomm|heim|home|arriv|gem(ü|u)t|cozy|relax|abend/i)}`;
    const seg = (cur, act, opts) => `<div class="seg">${opts.map(([k, l]) => `<button class="${cur === k ? "sel" : ""}" data-act="${act}" data-k="${k}" ${adm ? "" : "disabled"}>${l}</button>`).join("")}</div>`;
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true"><div class="sh"><div><b>Licht & Lampen</b><span>Modul 18 · Addon · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("lamp", 15)}Lampen</div>
      <div class="vrow"><span>Welche Lampen?<small class="mut" style="display:block">„Meine Lampen“: nur die, die du im Reiter „Lampen“ hinzufügst, mit eigenem Namen und Raum. „Automatisch“: alle Lampen aus Home Assistant.</small></span>${seg(this._liMine() ? "mine" : "auto", "lixmode", [["mine", "Meine Lampen"], ["auto", "Automatisch"]])}</div>
      <div class="lsec" style="margin-top:14px">${ic("palette", 15)}Darstellung</div>
      <div class="vrow"><span>Optik<small class="mut" style="display:block">„Wie bisher“ zeigt die Seite von Build 1 ohne Haus-Szene und Lichtschein.</small></span>${seg(P.optik, "lixoptik", [["neu", "Neu"], ["alt", "Wie bisher"]])}</div>
      <div class="vrow"><span>Ansicht<small class="mut" style="display:block">Räume als Karten, alle Lampen als Liste oder der Grundriss aus Modul 11 als Lichtkarte. Bewegung folgt Anpassen → Animationen (Aus · Dezent · Voll).</small></span>${seg(P.view, "lixview", [["rooms", "Räume"], ["list", "Liste"], ["plan", "Grundriss"]])}</div>
      <div class="lsec" style="margin-top:14px">${ic("lamp", 15)}Szenenknöpfe</div>
      <div class="mut sm" style="margin:0 0 4px">Jeder Knopf ruft eine Szene oder ein Skript aus Home Assistant auf. Ohne Auswahl bleibt er unverknüpft und öffnet diese Einstellungen. „Alle aus“ ist eingebaut.</div>
      ${slot("night", "Gute Nacht", "Zum Beispiel deine Szene zum Schlafengehen")}${slot("arrive", "Ankommen", "Zum Beispiel Licht im Flur und Wohnzimmer")}${slot("cozy", "Gemütlich", "Zum Beispiel warmes, gedimmtes Licht")}
      <div class="lsec" style="margin-top:14px">${ic("bell", 15)}Hinweis „Licht lange an“</div>
      <div class="vrow"><span>Hinweis ab<small class="mut" style="display:block">So lange darf eine Lampe an sein. Meldet ein Bewegungs- oder Anwesenheitssensor im Raum etwas, kommt kein Hinweis. Die Zeit zählt ab Build 2 auch über einen Neustart.</small></span><div class="seg">${[1, 2, 4].map((h) => `<button class="${L.hours === h ? "sel" : ""}" data-act="lixhrs" data-k="${h}" ${adm ? "" : "disabled"}>${h} Std.</button>`).join("")}</div></div>
      <div class="lsec" style="margin-top:14px">${ic("door", 15)}Räume</div>
      <div class="mut sm" style="margin:0 0 6px">Ausgeblendete Räume (zum Beispiel Garten oder Keller) fehlen auf der Seite und in der Haus-Szene. „Alle aus“ schaltet trotzdem jede Lampe.</div>
      <div class="gschips">${rooms.map((r) => `<button class="gsch ${r.hid ? "" : "sel"}" data-act="lixhide" data-k="${esc(r.k)}" aria-pressed="${!r.hid}" ${adm ? "" : "disabled"}>${esc(r.name)} (${r.lamps.length})</button>`).join("")}</div>
      <div class="lsec" style="margin-top:14px">${ic("info", 15)}Technik</div>
      <div class="mut sm">Sensoren: <code>sensor.strom_waerme_licht_lampen_an</code>, <code>…_licht_heute</code>, <code>…_laengste_an</code>. Räume schalten über eine passende Lichtgruppe, wenn es eine gibt (${Object.keys(this._liD().groups || {}).length} gefunden).</div>
      <div class="foot2" style="margin-top:12px"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  };
  return {
    id: "licht", mixin: Mixin, settings: true, settingsTxt: "Darstellung, Szenen, ausgeblendete Räume, Hinweis bei langem Licht",
    page: (p) => (p._liHero() || p._modHeroFor("li")) + p._liPage(),
    act: (p, a, el) => { if (a === "settings") p._act("lixopen", el); },
    search: [
      { id: "scenes", t: "Licht: Szenen", k: "licht lampe szene gute nacht ankommen gemütlich", h: "Szenenknöpfe wie „Gute Nacht“ und „Ankommen“." },
      { id: "long", t: "Licht: Hinweis bei langem Licht", k: "licht lange an hinweis leer raum vergessen", h: "Hinweis, wenn Licht lange brennt." },
      { id: "look", t: "Licht: Optik und Ansicht", k: "licht optik wie bisher liste räume ansicht", h: "Neue Optik oder wie bisher, Räume, Liste oder Grundriss." },
      { id: "plan", t: "Licht: Grundriss als Lichtkarte", k: "licht grundriss lichtkarte plan etage fläche zuordnen", h: "Räume im Grundriss leuchten in der Farbe ihrer Lampen." },
    ],
  };
};
