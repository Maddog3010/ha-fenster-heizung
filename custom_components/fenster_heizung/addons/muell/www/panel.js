/* Addon „muell“ (Addon-API 1). Modul 17 Müllabfuhr als Mixin: der Kern hängt die Methoden der Klasse unten an das Panel.
   v0.2: Liste „Nicht erkannt“, „Später erinnern“ mit Dauer und über Neustarts, Termine aus dem Zwischenspeicher, Abholzeit je Art,
         Uhrzeit als Stunde/Minute-Felder (kein Auswahlrad, Mac-App).
   v0.3: freie Abfallarten (bis 10) mit Name, Farbe, Bild und Wörtern, Vorlagen, bis zu drei Kalender, Sondertermine mit Vorwarnung,
         HD-Bilder je Abfallart. */
export default (api) => {
  const { ic, esc, num } = api;
  const MU_NAMES = { tonnen: "Tonnen", leiste: "14 Tage", unk: "Nicht erkannt", next: "Nächste Abholungen", cal: "Kalender", rem: "Erinnerung am Vorabend", hint: "Hinweise", cost: "Kosten" };
  const MU_WIDE = ["tonnen", "leiste", "unk", "cost"];
  const DAYS_SHORT_MU = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const COLORS = ["#78716c", "#a8531a", "#3b82f6", "#eab308", "#16a34a", "#65a30d", "#a855f7", "#ef4444", "#0ea5e9", "#ec4899"];
  const IMGS = { tonne: "Tonne", sack: "Sack", glas: "Container", gruen: "Grünschnitt", sperr: "Sperrmüll", schad: "Schadstoff", baum: "Baum" };
  const TPL_ORDER = ["rest", "bio", "papier", "gelb", "glas", "gruen", "sperr", "schad", "baum"];
  const PRE = [[1, "Vorabend"], [2, "2 Tage"], [3, "3 Tage"], [5, "5 Tage"], [7, "1 Woche"]];
  const SNZ = [30, 60, 90, 120, 180];
  const KDEF = [
    { id: "rest", name: "Restmüll", color: "#78716c", img: "tonne", match: "rest,hausmüll,hausmuell,schwarz", on: true, until: "12:00", pre: 1, tpl: "rest" },
    { id: "bio", name: "Bio", color: "#a8531a", img: "tonne", match: "bio", on: true, until: "12:00", pre: 1, tpl: "bio" },
    { id: "papier", name: "Papier", color: "#3b82f6", img: "tonne", match: "papier,pappe,blau", on: true, until: "12:00", pre: 1, tpl: "papier" },
    { id: "gelb", name: "Gelber Sack", color: "#eab308", img: "sack", match: "gelb,wertstoff,verpackung,lvp", on: true, until: "12:00", pre: 1, tpl: "gelb" },
  ];

  /* ---- HD-Bilder je Abfallart (A8). Ein Bild = viewBox 0 0 60 80, Farbe der Art als Grundton. */
  const shade = (hex, f) => { const h = String(hex || "#888888").replace("#", ""); const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) || 0); return "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f)))).toString(16).padStart(2, "0")).join(""); };
  const ART = {
    tonne: (c) => `<path d="M13 22H47L43.5 68Q43 72 39 72H21Q17 72 16.5 68Z" fill="${c}"/><path d="M13 22H47L46.2 32H13.8Z" fill="#000" opacity=".16"/>
      <path d="M19 30L21 66" stroke="#fff" opacity=".28" stroke-width="3" stroke-linecap="round"/><path d="M26 38v22M34 38v22" stroke="${shade(c, -.25)}" stroke-width="2" stroke-linecap="round"/>
      <rect x="9" y="13" width="42" height="9" rx="3.5" fill="${shade(c, .08)}"/><rect x="9" y="13" width="42" height="4" rx="2" fill="#fff" opacity=".22"/><rect x="24" y="9.5" width="12" height="4" rx="2" fill="${shade(c, .08)}"/>
      <circle cx="41" cy="71" r="6.5" fill="#0b0f13"/><circle cx="41" cy="71" r="2.4" fill="#4b5563"/>`,
    sack: (c) => `<path d="M30 14C24 14 26 22 22 26C10 34 10 70 18 72H42C50 70 50 34 38 26C34 22 36 14 30 14Z" fill="${c}"/>
      <path d="M22 26C27 29 33 29 38 26" stroke="${shade(c, -.3)}" stroke-width="2" fill="none"/><path d="M25 20H35" stroke="#0008" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M20 40C22 52 22 60 21 68" stroke="#fff" opacity=".32" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M38 44c1 8 1 14 0 20" stroke="${shade(c, -.2)}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    glas: (c) => `<path d="M8 72V44C8 28 18 18 30 18S52 28 52 44V72Z" fill="${c}"/><path d="M8 72V44C8 28 18 18 30 18" stroke="#fff" opacity=".25" stroke-width="3" fill="none"/>
      <rect x="21" y="30" width="18" height="7" rx="3.5" fill="#0b0f13"/><rect x="12" y="50" width="36" height="8" rx="2" fill="${shade(c, -.25)}"/>
      <circle cx="20" cy="54" r="2.4" fill="#f8fafc"/><circle cx="30" cy="54" r="2.4" fill="#22c55e"/><circle cx="40" cy="54" r="2.4" fill="#92400e"/><rect x="6" y="70" width="48" height="4" rx="2" fill="${shade(c, -.35)}"/>`,
    gruen: (c) => `<path d="M16 72L28 30M22 72L30 26M30 72L31 24M38 72L33 27M44 72L35 31" stroke="#7c5a2e" stroke-width="3" stroke-linecap="round"/>
      <g fill="${c}"><ellipse cx="24" cy="30" rx="9" ry="6" transform="rotate(-30 24 30)"/><ellipse cx="38" cy="29" rx="9" ry="6" transform="rotate(28 38 29)"/><ellipse cx="31" cy="20" rx="7" ry="9"/>
      <ellipse cx="18" cy="42" rx="7" ry="4.5" transform="rotate(-40 18 42)"/><ellipse cx="44" cy="42" rx="7" ry="4.5" transform="rotate(40 44 42)"/></g>
      <g fill="${shade(c, .25)}"><ellipse cx="31" cy="18" rx="3" ry="5"/><ellipse cx="22" cy="28" rx="4" ry="2.5" transform="rotate(-30 22 28)"/></g><rect x="20" y="52" width="22" height="5" rx="2.5" fill="#d6b77a"/>`,
    sperr: (c) => `<rect x="10" y="30" width="40" height="26" rx="6" fill="${shade(c, -.12)}"/><rect x="14" y="24" width="32" height="20" rx="6" fill="${c}"/>
      <rect x="6" y="38" width="12" height="24" rx="5" fill="${shade(c, .1)}"/><rect x="42" y="38" width="12" height="24" rx="5" fill="${shade(c, .1)}"/><rect x="16" y="46" width="28" height="12" rx="3" fill="${shade(c, .18)}"/>
      <path d="M17 28h26" stroke="#fff" opacity=".25" stroke-width="2.5" stroke-linecap="round"/><rect x="10" y="62" width="4" height="9" rx="1.5" fill="#3f3f46"/><rect x="46" y="62" width="4" height="9" rx="1.5" fill="#3f3f46"/>`,
    schad: (c) => `<rect x="4" y="34" width="34" height="28" rx="4" fill="${c}"/><path d="M38 42H50L56 52V62H38Z" fill="${shade(c, .15)}"/><path d="M41 45H49L53 52H41Z" fill="#bae6fd"/>
      <path d="M21 39L29 48L21 57L13 48Z" fill="#f59e0b" stroke="#fff" stroke-width="1.5"/><path d="M21 44v6M21 53v.5" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>
      <circle cx="14" cy="66" r="6" fill="#0b0f13"/><circle cx="46" cy="66" r="6" fill="#0b0f13"/><circle cx="14" cy="66" r="2.2" fill="#4b5563"/><circle cx="46" cy="66" r="2.2" fill="#4b5563"/>`,
    baum: (c) => `<rect x="27" y="60" width="6" height="12" rx="1.5" fill="#7c5a2e"/><path d="M30 10L44 32H38L48 48H40L52 62H8L20 48H12L22 32H16Z" fill="${c}"/>
      <path d="M30 10L22 32H26L18 48H24L14 62" stroke="#fff" opacity=".18" stroke-width="2" fill="none"/>
      <circle cx="26" cy="40" r="2.2" fill="#ef4444"/><circle cx="36" cy="52" r="2.2" fill="#fbbf24"/><circle cx="23" cy="56" r="2.2" fill="#38bdf8"/>
      <path d="M40 62l6 6" stroke="#e5e7eb" stroke-width="1.5"/><rect x="43" y="66" width="10" height="7" rx="1.5" fill="#f8fafc" transform="rotate(20 48 69)"/>`,
  };
  const muImg = (img, color, size = 40, cls = "") => `<svg class="muimg ${cls}" width="${size}" height="${Math.round(size * 4 / 3)}" viewBox="0 0 60 80" aria-hidden="true"><ellipse cx="30" cy="76" rx="20" ry="3.5" fill="#000" opacity=".3"/>${(ART[img] || ART.tonne)(color || "#78716c")}</svg>`;

  const CSS = `
.muimg{display:block;flex:none;filter:drop-shadow(0 2px 3px rgba(0,0,0,.25))}
.mubin{gap:4px}.mubin .muimg{margin-bottom:2px}.mubin i.when{font-style:normal;font-size:.74rem;color:var(--mut)}
.mubin.done .muimg{opacity:.55}.mubin.none .muimg{filter:grayscale(1)}
.mukl{display:flex;flex-direction:column;gap:8px;margin:6px 0}
.mukr{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:14px;background:rgba(127,127,127,.07)}
.mukr.off{opacity:.55}.mukr .mukt{flex:1;min-width:0}.mukr .mukt b{display:block}.mukr .mukt small{display:block;color:var(--mut);font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mukr .ibtn{flex:none}
.muked{border-radius:14px;border:1px solid var(--line);padding:10px 12px;margin:-2px 0 4px}
.muked .vrow{margin:8px 0}
.mucol{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0}.mucol button{width:28px;height:28px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0}
.mucol button.sel{border-color:var(--primary-text-color);box-shadow:0 0 0 2px var(--card)}
.muimgs{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.muimgs button{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 6px 4px;border-radius:12px;border:1px solid var(--line);background:transparent;color:var(--mut);font:inherit;font-size:.7rem;cursor:pointer}
.muimgs button.sel{border-color:var(--teal);color:var(--primary-text-color);background:color-mix(in srgb,var(--teal) 10%,transparent)}
.mutpl{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px;margin:6px 0}
.mutpl button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px 8px;border-radius:14px;border:1px dashed var(--line);background:transparent;color:var(--primary-text-color);font:inherit;font-size:.8rem;cursor:pointer}
.mutpl button:hover{border-color:var(--teal)}.mutpl button small{color:var(--mut);font-size:.7rem}
.muunk{display:flex;flex-direction:column;gap:10px}
.muur{padding:10px 12px;border-radius:14px;background:color-mix(in srgb,var(--amber) 8%,transparent)}
.muur b{display:block}.muur small{color:var(--mut);font-size:.8rem}.muur .gschips{margin:8px 0 0}
.muur .gsch{display:inline-flex;align-items:center;gap:6px;padding:5px 12px}
.muur .gsch u{width:10px;height:10px;border-radius:50%;display:inline-block}
.mucache{display:flex;gap:8px;align-items:center;font-size:.82rem;color:var(--amber);margin:0 0 10px}
.mumig{display:flex;gap:8px;align-items:flex-start;font-size:.84rem;margin:8px 0;padding:10px 12px;border-radius:12px;background:color-mix(in srgb,var(--teal) 10%,transparent)}
.mumv{display:flex;gap:4px}.mumv .ibtn{width:32px;height:32px}
.mutin{display:flex;align-items:center;gap:2px}
/* v0.5 Neue Optik */
.mubn{position:relative;overflow:hidden;padding:0;min-height:232px;display:flex;align-items:stretch;border:none;background:#0b1626}
.mubn .musc{position:absolute;inset:0;width:100%;height:100%}
.mubn:not(.mob):before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,14,22,.9) 0%,rgba(8,14,22,.6) 30%,rgba(8,14,22,0) 48%);z-index:1}
.mubt{position:relative;z-index:2;display:flex;flex-direction:column;gap:3px;padding:20px 22px;max-width:56%;color:#fff}
.mubt .k{font-size:.74rem;font-weight:800;letter-spacing:1.6px;color:#5eead4}.mubn.due .mubt .k{color:#fbbf24}
.mubt b{font-size:1.65rem;line-height:1.15;font-weight:800}.mubt .s{color:#cbd5e1;font-size:.9rem}.mubt .a{color:#94a3b8;font-size:.8rem}
.muchips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.muchip{display:inline-flex;align-items:center;gap:5px;padding:3px 10px 3px 7px;border-radius:999px;background:rgba(255,255,255,.12);font-size:.76rem;color:#e5e7eb}.muchip.warn{background:rgba(245,158,11,.22);color:#fde68a}.muchip .muimg{filter:none}
.mubtn{align-self:flex-start;margin-top:12px;display:inline-flex;gap:6px;align-items:center;background:#2dd4bf;color:#042f2e;border:0;border-radius:12px;padding:9px 16px;font:inherit;font-weight:700;cursor:pointer}
.mubn.mob{flex-direction:column;min-height:0}.mubn.mob .mubs{height:150px;position:relative}.mubn.mob .mubs .musc{position:absolute;inset:0;width:100%;height:100%}.mubn.mob .mubt{max-width:none;padding:14px 16px 16px;background:#0e141a}.mubn.mob .mubt b{font-size:1.35rem}.mubn.mob .mubtn{align-self:stretch;justify-content:center}
.mubn.muempty .mubt{max-width:60%;text-align:left;align-items:flex-start}
.muglow.voll{animation:muglow 1.8s ease-in-out infinite}@keyframes muglow{50%{opacity:.2}}
.mutruck.dezent,.mutruck.voll{animation:mutruck 2.4s cubic-bezier(.2,.7,.3,1) both}.mutruck.voll{animation:mutruck 2.4s cubic-bezier(.2,.7,.3,1) both,mubump .5s 2.4s ease-in-out infinite alternate}
@keyframes mutruck{from{transform:translate(900px,156px)}to{transform:translate(680px,156px)}}@keyframes mubump{to{transform:translate(680px,155px)}}
@media (prefers-reduced-motion:reduce){.muglow,.mutruck{animation:none!important}}
.mut2g{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:10px}
.mut2{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;padding:16px 8px 12px;border-radius:16px;border:0;background:rgba(127,127,127,.08);color:var(--primary-text-color);font:inherit;text-align:center}
button.mut2{cursor:pointer}button.mut2:hover{background:rgba(127,127,127,.13)}button.mut2:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.mut2 b{font-size:.95rem;margin-top:4px}.mut2 em{font-style:normal;font-size:.8rem;font-weight:800;color:var(--green)}.mut2 small{font-size:.74rem;color:var(--mut)}
.mut2 .tap{font-style:normal;font-size:.7rem;color:var(--mut);display:inline-flex;gap:4px;align-items:center;margin-top:4px}
.mut2.out,.mut2.today{background:color-mix(in srgb,var(--amber) 13%,transparent)}.mut2.out em,.mut2.today em{color:var(--amber)}
.mut2.soon em,.mut2.bald em{color:#facc15}.mut2.done{background:color-mix(in srgb,var(--teal) 11%,transparent)}.mut2.done em{color:var(--teal)}.mut2.done .muimg{opacity:.7}
.mut2.none em{color:var(--gray)}.mut2.none .muimg{filter:grayscale(1);opacity:.5}
.mut2 .ring{position:absolute;right:9px;top:9px;width:20px;height:20px;border-radius:50%;background:conic-gradient(var(--c) calc(var(--p)*1%),rgba(127,127,127,.22) 0)}.mut2 .ring:after{content:"";position:absolute;inset:4px;border-radius:50%;background:var(--card)}
.mus14r{display:grid;grid-template-columns:repeat(14,minmax(44px,1fr));gap:6px;overflow-x:auto;padding:2px 2px 6px;scrollbar-width:thin}
.mus14{display:flex;flex-direction:column;align-items:center;gap:1px;padding:7px 0 8px;border-radius:12px;border:0;background:rgba(127,127,127,.08);color:var(--primary-text-color);font:inherit;cursor:pointer}
.mus14 em{font-style:normal;font-size:.68rem;color:var(--mut)}.mus14 b{font-size:1rem}.mus14.we b{color:var(--mut)}.mus14.heute{outline:1.5px solid var(--teal)}.mus14.sel{background:color-mix(in srgb,var(--teal) 16%,transparent)}
.mus14 span{display:flex;gap:3px;height:8px;align-items:center}.mus14 u{width:8px;height:8px;border-radius:50%}
.mus14d{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;margin-top:8px;padding:10px 12px;border-radius:12px;background:rgba(127,127,127,.07)}.mus14d span{display:inline-flex;gap:6px;align-items:center}.mus14d small{color:var(--mut)}.mus14d em{font-style:normal;color:var(--mut);font-size:.8rem;margin-left:auto}
.mucm{margin:0 0 0 auto!important}.mucm .gsch{padding:3px 12px;font-size:.76rem}
.mucnav{display:flex;justify-content:flex-end;align-items:center;gap:6px;margin:-4px 0 6px}.mucnav .ibtn:first-child svg{transform:rotate(90deg)}.mucnav .ibtn:last-child svg{transform:rotate(-90deg)}
.mucal2{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center}.mucal2 em{font-style:normal;font-size:.72rem;color:var(--mut);padding:2px 0}
.mucd2{font-style:normal;display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 3px 5px;min-height:44px;border-radius:9px;background:rgba(127,127,127,.07);font-size:.82rem}.mucd2.e{background:none}.mucd2.past{opacity:.5}.mucd2.today{outline:1.5px solid var(--teal)}.mucd2.shift{outline:1.5px dashed var(--amber)}
.mucd2 span{display:flex;flex-direction:column;gap:2px;width:100%;padding:0 4px}.mucd2 u{height:4px;border-radius:2px;display:block}
.muyg{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:10px}
.muym{border:0;background:rgba(127,127,127,.06);border-radius:12px;padding:8px;color:var(--primary-text-color);font:inherit;cursor:pointer;text-align:left}.muym.cur{outline:1.5px solid var(--teal)}.muym b{font-size:.78rem;display:block;margin-bottom:4px}
.muym span{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}.muym i{display:block;aspect-ratio:1;border-radius:2px;background:rgba(127,127,127,.12)}.muym i.t{outline:1px solid var(--teal)}
.muleg{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px;font-size:.78rem;color:var(--mut)}.muleg span{display:inline-flex;gap:5px;align-items:center}.muleg u{width:10px;height:10px;border-radius:3px}
.mustep{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}.mustep>div{position:relative;display:flex;flex-direction:column;gap:4px;padding:14px;border-radius:14px;background:rgba(127,127,127,.07)}.mustep .n{position:absolute;right:12px;top:10px;font-weight:800;color:var(--teal)}.mustep small{color:var(--mut)}
`;

  const Mixin = class {
  /* Modul 17: Müllabfuhr (Addon). Termine, Ampel, Erinnerung, Ansage und Licht laufen im Python-Teil des Addons. */
  _muDef() { return { v: 2, cals: [], cal: "", time: "18:30", kinds: KDEF.map((k) => ({ ...k })), ignore: [], snooze: 60, push: { on: false, to: [] }, cost: { on: false, fee: 0, incl: 0 }, wx: true, tts: { on: false, ent: "", player: "", text: "Morgen wird {tonnen} abgeholt." }, light: { on: false, ent: "" }, look: { old: false, motion: "dezent" } }; }
  _mu() {
    const d = (this._muD && this._muD.d) || {}, df = this._muDef(), c = d.cfg || {};
    return { ...d, cfg: { ...df, ...c, kinds: Array.isArray(c.kinds) && c.kinds.length ? c.kinds : df.kinds, cals: Array.isArray(c.cals) ? c.cals : df.cals, ignore: Array.isArray(c.ignore) ? c.ignore : [], push: { ...df.push, ...(c.push || {}) }, cost: { ...df.cost, ...(c.cost || {}) }, tts: { ...df.tts, ...(c.tts || {}) }, light: { ...df.light, ...(c.light || {}) }, look: { ...df.look, ...(c.look || {}) } } };
  }
  _muImg(img, color, size, cls) { return muImg(img, color, size, cls); }
  _muLoad(force) {
    if (!this._hass || this._muBusy) return;
    if (!force && this._muD && Date.now() - this._muD.ts < 20000) return;
    this._muBusy = true;
    this._hass.callWS({ type: "fenster_heizung/mu_get" }).then((r) => { if (!this._muT) this._muD = { d: r || {}, ts: Date.now() }; }).catch(() => { this._muD = { d: { error: "Keine Antwort von Home Assistant" }, ts: Date.now() }; })
      .finally(() => { this._muBusy = false; if (this._muVisible()) { this._render(); if (this._modal && this._modal.type === "muset") this._renderModal(); } });
  }
  _muVisible() { return !!(this._modal && this._modal.type === "muset") || (!!this._mdActive && this._mdActive() === "mu" && !this._stOpen && !this._igOpen && !this._labOpen); }
  _muHasWcs() { return Object.values(this._hass.entities || {}).some((e) => e && e.platform === "waste_collection_schedule"); }
  _muSave(cfg, quiet) {
    if (!(this._muD && this._muD.d && this._muD.d.cfg)) { this._toast("Noch nicht geladen, bitte kurz warten und nochmal versuchen"); return; }
    const s = this._mu(); this._muD = { d: { ...s, cfg }, ts: Date.now() };
    clearTimeout(this._muT);
    this._muT = setTimeout(() => {
      this._muT = null;
      this._hass.callWS({ type: "fenster_heizung/mu_set", cfg: this._mu().cfg }).then((r) => { this._muD = { d: r || {}, ts: Date.now() }; if (this._muVisible() && !this._muQuiet) { this._render(); if (this._modal && this._modal.type === "muset") this._renderModal(); } })
        .catch(() => this._toast("Die Einstellung konnte nicht gespeichert werden"));
    }, 500);
    this._muQuiet = !!quiet;
    if (!quiet) { this._render(); if (this._modal && this._modal.type === "muset") this._renderModal(); }
  }
  _muPatch(fn, quiet) { const c = JSON.parse(JSON.stringify(this._mu().cfg)); fn(c); this._muSave(c, quiet); }
  _muCall(act, bin) { this._hass.callWS({ type: "fenster_heizung/mu_act", act, ...(bin ? { bin } : {}) }).then((r) => { this._muD = { d: r || {}, ts: Date.now() }; this._render(); }).catch(() => this._toast("Das hat nicht geklappt")); }
  _muDate(iso) { return iso ? new Date(iso + "T12:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }) : ""; }
  _muWhen(d) { return d == null ? "" : d === 0 ? "heute" : d === 1 ? "morgen" : `in ${d} Tagen`; }
  _muK(c, id) { return (c.kinds || []).find((k) => k.id === id); }
  _muNewId(c, want) { const used = new Set((c.kinds || []).map((k) => k.id)); if (want && !used.has(want)) return want; for (let i = 1; i < 99; i++) if (!used.has("k" + i)) return "k" + i; return "k" + Date.now() % 1000; }
  _muFreeColor(c) { const used = new Set((c.kinds || []).map((k) => k.color)); return COLORS.find((x) => !used.has(x)) || COLORS[0]; }
  _muTplFor(title) {
    const S = this._mu(), T = S.templates || {}, have = new Set(S.cfg.kinds.map((k) => k.tpl || k.id)), t = String(title || "").toLowerCase();
    let best = null, bl = 0; Object.entries(T).forEach(([id, x]) => { if (have.has(id)) return; String(x.match || "").split(",").forEach((w) => { if (w && t.includes(w) && w.length > bl) { best = id; bl = w.length; } }); });
    return best;
  }
  _muAddKind(c, tpl, title) {
    if ((c.kinds || []).length >= 10) { this._toast("Höchstens 10 Abfallarten"); return null; }
    const T = (this._mu().templates || {})[tpl];
    const id = this._muNewId(c, T ? tpl : null);
    const k = T ? { id, name: T.name, color: T.color, img: T.img, match: T.match, on: true, until: "12:00", pre: T.pre, tpl } : { id, name: String(title || "Eigene Abfallart").slice(0, 30), color: this._muFreeColor(c), img: "tonne", match: String(title || "").toLowerCase().slice(0, 60), on: true, until: "12:00", pre: 1, tpl: "" };
    if (T && title) { const w = String(title).toLowerCase().slice(0, 60); if (!k.match.split(",").some((x) => x && w.includes(x))) k.match = k.match ? `${k.match},${w}` : w; }
    c.kinds.push(k); return k;
  }
  _muxAct(a, b) {
    const k = b.dataset.k, t = b.dataset.t;
    if (a === "muxopen") { this._muLoad(true); this._muEd = null; this._modal = { type: "muset" }; this._renderModal(); return; }
    if (a === "muxdone") { this._muCall("done", k); return; }
    if (a === "muxundo") { this._muCall("undo", k); return; }
    if (a === "muxsnooze") { const m = this._mu().cfg.snooze || 60; this._muCall("snooze"); this._toast(`Ich erinnere in ${m >= 60 && m % 60 === 0 ? `${m / 60} ${m === 60 ? "Stunde" : "Stunden"}` : `${m} Minuten`} noch einmal`); return; }
    if (a === "muxtest") { this._hass.callWS({ type: "fenster_heizung/mu_test" }).then((r) => this._toast(r && r.sent ? `Test an ${r.sent} ${r.sent === 1 ? "Dienst" : "Diensten"} gesendet` : "Kein Benachrichtigungsdienst gewählt")).catch(() => this._toast("Test fehlgeschlagen")); return; }
    if (a === "muxhide") { const h = this._muLay().hidden; this._muLaySave({ hidden: h.includes(k) ? h.filter((x) => x !== k) : [...h, k] }); return; }
    if (a === "muxreset") { this._muLaySave({ order: Object.keys(MU_NAMES), hidden: [] }); this._toast("Anordnung zurückgesetzt"); return; }
    if (a === "muxstore") { this._modal = null; this._renderModal(); this._sto = { q: "", c: "haus" }; this._igOpen = true; this._labOpen = false; this._render(); return; }
    if (a === "muxked") { this._muEd = this._muEd === k ? null : k; this._renderModal(); return; }
    if (a === "muxdoneall") { const S = this._mu(); (S.bins || []).filter((x) => ["out", "today"].includes(x.state)).forEach((x) => this._muCall("done", x.k)); return; }
    if (a === "muxday") { this._muDay = this._muDay === k ? null : k; this._render(); return; }
    if (a === "muxmon") { this._muMon = Number(k) || 0; this._muCalM = "m"; this._render(); return; }
    if (a === "muxcalm") { this._muCalM = k; this._render(); return; }
    if (a === "muxunkall") { this._muUnkAll = !this._muUnkAll; this._render(); return; }
    this._muPatch((c) => {
      const K = this._muK(c, k);
      if (a === "muxsw") { if (k.startsWith("bin:")) { const x = this._muK(c, k.slice(4)); if (x) x.on = !x.on; } else if (k === "push") c.push.on = !c.push.on; else if (k === "tts") c.tts.on = !c.tts.on; else if (k === "light") c.light.on = !c.light.on; else if (k === "cost") c.cost.on = !c.cost.on; else if (k === "wx") c.wx = !c.wx; else if (k === "look") c.look.old = !c.look.old; }
      else if (a === "muxns") c.push.to = c.push.to.includes(k) ? c.push.to.filter((x) => x !== k) : [...c.push.to, k];
      else if (a === "muxcal") { c.cals = c.cals.includes(k) ? c.cals.filter((x) => x !== k) : c.cals.length >= 3 ? (this._toast("Höchstens drei Kalender"), c.cals) : [...c.cals, k]; c.cal = c.cals[0] || ""; }
      else if (a === "muxcalauto") { c.cals = []; c.cal = ""; }
      else if (a === "muxsnz") c.snooze = Number(k) || 60;
      else if (a === "muxlook") c.look.old = !c.look.old;
      else if (a === "muxmot") c.look.motion = k;
      else if (a === "muxkcol" && K) K.color = b.dataset.v;
      else if (a === "muxkimg" && K) K.img = b.dataset.v;
      else if (a === "muxkpre" && K) K.pre = Number(b.dataset.v) || 1;
      else if (a === "muxkup" || a === "muxkdn") { const i = c.kinds.findIndex((x) => x.id === k), j = a === "muxkup" ? i - 1 : i + 1; if (i >= 0 && j >= 0 && j < c.kinds.length) [c.kinds[i], c.kinds[j]] = [c.kinds[j], c.kinds[i]]; }
      else if (a === "muxkdel") { if (c.kinds.length <= 1) { this._toast("Mindestens eine Abfallart bleibt"); return; } c.kinds = c.kinds.filter((x) => x.id !== k); if (this._muEd === k) this._muEd = null; this._toast("Abfallart entfernt"); }
      else if (a === "muxkadd") { const n = this._muAddKind(c, k); if (n) { this._muEd = n.id; this._toast(`„${n.name}“ angelegt`); } }
      else if (a === "muxuas" && K && t) { const w = t.toLowerCase().slice(0, 60); if (!K.match.split(",").includes(w)) K.match = K.match ? `${K.match},${w}` : w; if (!K.on) K.on = true; this._toast(`„${t}“ zählt jetzt als ${K.name}`); }
      else if (a === "muxunew" && t) { const n = this._muAddKind(c, k || "", t); if (n) this._toast(`Neue Abfallart „${n.name}“`); }
      else if (a === "muxuign" && t) { if (!c.ignore.some((x) => x.toLowerCase() === t.toLowerCase())) c.ignore.push(t); this._toast(`„${t}“ wird ignoriert`); }
      else if (a === "muxunign" && t) c.ignore = c.ignore.filter((x) => x !== t);
    });
  }
  _muxChange(t) {
    const f = t.dataset.f, k = t.dataset.k, v = t.value || "";
    if (f === "muxsel") { this._muPatch((c) => { if (k === "tts_ent") c.tts.ent = v; else if (k === "tts_player") c.tts.player = v; else if (k === "light") c.light.ent = v; }); return true; }
    if (f === "muxtime") { if (/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) this._muPatch((c) => { c.time = v; }, true); return true; }
    if (f === "muxkuntil") { if (/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) this._muPatch((c) => { const K = this._muK(c, k); if (K) K.until = v; }, true); return true; }
    if (f === "muxkname") { this._muPatch((c) => { const K = this._muK(c, k); if (K) K.name = v.trim().slice(0, 30) || K.name; }, true); return true; }
    if (f === "muxmatch" || f === "muxkmatch") { this._muPatch((c) => { const K = this._muK(c, k); if (K) K.match = v; }, true); return true; }
    if (f === "muxtext") { this._muPatch((c) => { c.tts.text = v; }, true); return true; }
    if (f === "muxnum") { const n = Number(String(v).replace(",", ".")); if (isFinite(n)) this._muPatch((c) => { c.cost[k] = Math.max(0, n); }, true); return true; }
    return false;
  }
  _muSetupCard(S) {
    const none = !S.cal;
    return `<div class="card"><h2>${ic("trash", 18)}${none ? "Noch kein Abfallkalender" : "Kalender liefert keine Termine"}</h2>
      <div class="mut sm" style="margin:0 0 10px">${none ? "Modul 17 liest die Abholtermine aus einem Kalender von Home Assistant. Am einfachsten geht das mit der Integration waste_collection_schedule, sie kennt viele Entsorger." : esc(S.error || "Bitte einen anderen Kalender wählen.")}</div>
      ${none ? `<div class="stost"><b>1</b><span>Im Store „Abfallkalender“ öffnen und einrichten</span></div><div class="stost"><b>2</b><span>Dort deinen Entsorger wählen, es entsteht ein Kalender</span></div><div class="stost"><b>3</b><span>Hier erscheint er automatisch, oder du wählst ihn in den Einstellungen</span></div>` : ""}
      ${!none && (S.unknown || []).length ? `<div class="gst on">${ic("alert", 15)}<span>Im Kalender stehen ${(S.unknown || []).length} Termine, die keiner Abfallart zugeordnet sind. Ordne sie unten zu.</span></div>` : ""}
      <div class="gbtns" style="margin-top:10px">${this._admin() ? `<button class="btn2 pri" data-act="muxstore">${ic("puzzle", 16)} Zum Store</button><button class="btn2" data-act="muxopen">${ic("sliders", 16)} Einstellungen</button>` : `<span class="mut sm">Das richtet ein Administrator ein.</span>`}</div></div>`;
  }
  /* B3: Termine, die zu keiner Abfallart passen – zuordnen, als neue Art anlegen oder ignorieren */
  _muUnkCard(S, inModal) {
    const U = S.unknown || [], C = S.cfg; if (!U.length || !this._admin()) return "";
    const all = inModal || this._muUnkAll, rows = all ? U : U.slice(0, 3);
    const kinds = C.kinds.filter((k) => k.on);
    const row = (u) => {
      const tpl = this._muTplFor(u.t), T = tpl ? (S.templates || {})[tpl] : null;
      return `<div class="muur"><b>„${esc(u.t)}“</b><small>${u.n}× im Kalender · ${u.upcoming ? `nächster Termin ${this._muDate(u.next)}` : "nur vergangene Termine"}</small>
        <div class="gschips">${T ? `<button class="gsch sel" data-act="muxunew" data-k="${tpl}" data-t="${esc(u.t)}">${ic("plus", 14)} Als „${esc(T.name)}“ anlegen</button>` : ""}${kinds.map((k) => `<button class="gsch" data-act="muxuas" data-k="${esc(k.id)}" data-t="${esc(u.t)}"><u style="background:${k.color}"></u>${esc(k.name)}</button>`).join("")}
        ${T ? "" : `<button class="gsch" data-act="muxunew" data-k="" data-t="${esc(u.t)}">${ic("plus", 14)} Neue Abfallart</button>`}<button class="gsch" data-act="muxuign" data-t="${esc(u.t)}">${ic("eyeOff", 14)} Ignorieren</button></div></div>`;
    };
    const body = `<div class="muunk">${rows.map(row).join("")}</div>${!inModal && U.length > 3 ? `<div class="gbtns" style="margin-top:8px"><button class="lnk" data-act="muxunkall">${all ? "Weniger zeigen" : `Alle ${U.length} zeigen`}</button></div>` : ""}`;
    if (inModal) return body;
    return `<div class="card"><h2>${ic("alert", 18)}Nicht erkannt<span class="hzrt">${U.length}</span></h2><div class="mut sm" style="margin:0 0 10px">Diese Termine stehen in deinem Abfallkalender, passen aber zu keiner Abfallart. Ohne Zuordnung gibt es keine Erinnerung.</div>${body}</div>`;
  }
  _muPage() {
    this._muLoad(); const S = this._mu(), C = S.cfg, adm = this._admin();
    if (!S.on) return `<div class="card empty">${S.error ? esc(S.error) : "Lädt …"}</div>`;
    const NEW = this._muNew();
    if (!S.cal || (S.error && !(S.bins || []).some((x) => x.next))) return `<style>${CSS}</style>` + (NEW ? this._muEmpty2(S) : this._muSetupCard(S)) + this._muUnkCard(S);
    const rows = S.bins || [], due = rows.filter((x) => ["out", "today"].includes(x.state)), up = rows.filter((x) => x.next);
    const lbl = { out: "raus!", today: "heute", soon: "morgen", ok: "ok", done: "draußen", none: "–" };
    const tile = (x) => { const tap = ["out", "today", "soon"].includes(x.state) ? "muxdone" : x.state === "done" ? "muxundo" : ""; return `<${tap ? `button data-act="${tap}" data-k="${x.k}"` : "div"} class="mubin ${x.state}" ${tap ? `aria-label="${esc(x.name)}: ${tap === "muxdone" ? "steht draußen" : "wieder zurücknehmen"}"` : ""}>${muImg(x.img, x.color, 34)}<b>${esc(x.name)}</b><small>${lbl[x.state]}</small><i class="when">${x.next ? (x.days <= 1 ? this._muDate(x.next) : this._muWhen(x.days)) : "kein Termin"}</i></${tap ? "button" : "div"}>`; };
    const head = due.length ? `<div class="mulead"><b>${due.some((x) => x.state === "today") ? "Heute wird abgeholt" : "Morgen wird abgeholt"}</b><span>${due.map((x) => esc(x.name)).join(", ")}. Tippe auf die Tonne, wenn sie draußen steht.</span></div>` : `<div class="mulead ok"><b>Nichts zu tun</b><span>${up[0] ? `Als Nächstes: ${esc(up[0].name)}, ${this._muWhen(up[0].days)}.` : "Keine Termine in den nächsten Wochen."}</span></div>`;
    const cache = S.cached ? `<div class="mucache">${ic("alert", 15)}<span>Der Kalender antwortet gerade nicht. Angezeigt werden die Termine vom ${esc(S.ev_ok)} Uhr.</span></div>` : (S.cal_err || []).length ? `<div class="mucache">${ic("alert", 15)}<span>${(S.cal_err || []).map((e) => esc(this._wzName ? this._wzName(e) || e : e)).join(", ")} antwortet nicht.</span></div>` : "";
    const snz = C.snooze || 60, snzT = snz % 60 === 0 ? `${snz / 60} ${snz === 60 ? "Stunde" : "Std."}` : `${snz} Min.`;
    const ampel = `<div class="card"><h2>${ic("trash", 18)}Tonnen</h2>${cache}${head}<div class="mugrid">${rows.map(tile).join("")}</div>${C.push.on && due.some((x) => x.state === "out") ? `<div class="gbtns" style="margin-top:10px">${S.snooze ? `<span class="mut sm">${ic("clock", 14)} Ich erinnere um ${esc(S.snooze_until)} Uhr noch einmal.</span>` : `<button class="btn2" data-act="muxsnooze">${ic("clock", 16)} Später erinnern (${snzT})</button>`}</div>` : ""}</div>`;
    const next = `<div class="card"><h2>${ic("clock", 18)}Nächste Abholungen</h2><div class="wxl">${up.map((x) => `<div class="wxr ${x.days <= 1 ? "hot" : ""}"><span class="wxi" style="background:none">${muImg(x.img, x.color, 22)}</span><div class="wxm"><div class="wxt"><b>${esc(x.name)}</b><em>${this._muWhen(x.days)}</em></div><small>${this._muDate(x.next)}${x.pre > 1 ? ` · Vorwarnung ${x.pre} Tage vorher` : ""}</small></div></div>`).join("") || `<div class="mut sm">Keine Termine gefunden.</div>`}</div></div>`;
    const M = S.month || {}, first = (new Date(M.y || 2026, (M.m || 1) - 1, 1).getDay() + 6) % 7, n = new Date(M.y || 2026, M.m || 1, 0).getDate(), col = Object.fromEntries(C.kinds.map((x) => [x.id, x.color]));
    const cells = [...Array(first).fill(`<i class="mucd e"></i>`), ...Array.from({ length: n }, (_, i) => { const d = i + 1, bs = (M.d || {})[d] || []; return `<i class="mucd ${d === M.today ? "today" : ""}"><b>${d}</b><span>${bs.map((k) => `<u style="background:${col[k] || "#999"}"></u>`).join("")}</span></i>`; })];
    const mon = new Date(M.y || 2026, (M.m || 1) - 1, 1).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
    const cal = `<div class="card"><h2>${ic("today", 18)}${esc(mon)}</h2><div class="mucal">${DAYS_SHORT_MU.map((d) => `<em>${d}</em>`).join("")}${cells.join("")}</div></div>`;
    const notes = S.notes || [], nIc = { storm: "windy", frost: "snow", pre: "today" };
    const nt = `<div class="card"><h2>${ic("info", 18)}Hinweise</h2>${notes.length ? `<div class="wxl">${notes.map((x) => { const K = x.bin && C.kinds.find((k) => k.id === x.bin); return `<div class="wxr hot"><span class="wxi" ${K ? 'style="background:none"' : ""}>${K && x.k === "pre" ? muImg(K.img, K.color, 22) : ic(nIc[x.k] || "alert", 18)}</span><div class="wxm"><small>${esc(x.text)}</small></div></div>`; }).join("")}</div>` : `<div class="mut sm">Keine Sondertermine, keine Verschiebung und keine Wetterwarnung für die nächsten Abholungen.${C.wx ? "" : " Wetter-Hinweise sind aus."}</div>`}</div>`;
    const info = (ico, t, txt, on) => `<div class="wxr ${on ? "" : "off"}"><span class="wxi">${ic(ico, 18)}</span><div class="wxm"><div class="wxt"><b>${t}</b><em>${on ? "An" : "Aus"}</em></div><small>${txt}</small></div></div>`;
    const nTo = C.push.to.length, tn = (e) => esc(this._wzName(e) || e);
    const rem = `<div class="card"><h2>${ic("bell", 18)}Erinnerung am Vorabend</h2><div class="wxl">
      ${info("bell", "Nachricht aufs Handy", C.push.on ? (nTo ? `Um ${esc(C.time)} Uhr an ${nTo} ${nTo === 1 ? "Dienst" : "Dienste"}. „Später“ erinnert nach ${snzT} noch einmal.` : "An, aber noch kein Dienst gewählt (Einstellungen).") : "Aus. In den Einstellungen einschalten.", C.push.on)}
      ${info("music", "Ansage", C.tts.on && C.tts.ent && C.tts.player ? `Sprachausgabe auf ${tn(C.tts.player)} um ${esc(C.time)} Uhr.` : "Sprachausgabe über einen Lautsprecher, zum Beispiel im Flur.", C.tts.on && !!C.tts.ent && !!C.tts.player)}
      ${info("lamp", "Licht", C.light.on && C.light.ent ? `${tn(C.light.ent)} leuchtet in der Farbe der Tonne ab ${esc(C.time)} Uhr${S.light_on ? " (jetzt an)" : ""}, bis sie als draußen markiert ist.` : "Ein Licht in der Farbe der Tonne, bis sie draußen steht.", C.light.on && !!C.light.ent)}</div>
      ${adm ? `<div class="gbtns" style="margin-top:8px"><button class="btn2" data-act="muxopen">${ic("sliders", 16)} Einstellungen</button></div>` : ""}</div>`;
    let cost = ""; if (C.cost.on && S.stats) { const s = S.stats; cost = `<div class="card"><h2>${ic("chart", 18)}Restmüll ${s.year}: Leerungen und Kosten</h2><div class="lugrid">${this._labTile("Bisher geleert", `${s.done} von ${s.total}`, "Restmüll in diesem Jahr")}${this._labTile("Enthalten", s.incl ? String(s.incl) : "–", s.incl ? `noch ${s.free} frei` : "Keine Zahl eingetragen", s.incl && s.free === 0 ? "amber" : "")}${this._labTile("Extra", s.extra != null ? String(s.extra) : "–", s.cost != null ? `${num(s.cost, 2)} € zusätzlich` : "Gebühr je Leerung eintragen", s.extra ? "amber" : "green")}</div></div>`; }
    const ampel2 = `<div class="card"><h2>${ic("trash", 18)}Abfallarten<span class="hzrt">${rows.length}</span></h2>${this._muTiles2(S)}${C.push.on && due.some((x) => x.state === "out") ? `<div class="gbtns" style="margin-top:10px">${S.snooze ? `<span class="mut sm">${ic("clock", 14)} Ich erinnere um ${esc(S.snooze_until)} Uhr noch einmal.</span>` : `<button class="btn2" data-act="muxsnooze">${ic("clock", 16)} Später erinnern (${snzT})</button>`}</div>` : ""}</div>`;
    const B = NEW ? { tonnen: ampel2, leiste: this._muStrip(S), unk: this._muUnkCard(S), next, cal: this._muCal2(S), rem, hint: nt, cost } : { tonnen: ampel, unk: this._muUnkCard(S), next, cal, rem, hint: nt, cost }, lay = this._muLay(), edit = this._edit && adm;
    const eb = edit ? `<div class="banner">${ic("grip", 18)}<div>Ziehe die Karten an den Griffen, um sie zu verschieben. Mit dem Auge blendest du eine Karte aus. <button class="lnk" data-act="muxreset">Zurücksetzen</button></div></div>` : "";
    const blocks = lay.order.filter((id) => B[id] && (edit || !lay.hidden.includes(id))).map((id) => `<section class="blk mub ${MU_WIDE.includes(id) ? "wide" : ""} ${edit ? "editing" : ""} ${lay.hidden.includes(id) ? "hid" : ""}" data-sort="mublk" data-id="${id}">
      ${edit ? `<div class="etag"><span class="grip" data-handle title="Verschieben">${ic("grip", 18)}</span>${MU_NAMES[id]}<button class="eyeb" data-act="muxhide" data-k="${id}" aria-pressed="${!lay.hidden.includes(id)}" aria-label="${MU_NAMES[id]} ${lay.hidden.includes(id) ? "einblenden" : "ausblenden"}" title="${lay.hidden.includes(id) ? "Einblenden" : "Ausblenden"}">${ic(lay.hidden.includes(id) ? "eyeOff" : "eye", 18)}<span>${lay.hidden.includes(id) ? "Ausgeblendet" : "Sichtbar"}</span></button></div>` : ""}${B[id]}</section>`).join("");
    return `<style>${CSS}</style>${eb}<div class="mublks">${blocks}</div>`;
  }
  _muLay() { const l = (this._cfg && this._cfg.layout && this._cfg.layout.mu) || {}, known = Object.keys(MU_NAMES), o = (Array.isArray(l.order) ? l.order : []).filter((x) => known.includes(x)); const rest = known.filter((x) => !o.includes(x)); if (o.length && rest.includes("unk")) { const i = o.indexOf("tonnen"); o.splice(i >= 0 ? i + 1 : 0, 0, "unk"); rest.splice(rest.indexOf("unk"), 1); } return { order: [...o, ...rest], hidden: (Array.isArray(l.hidden) ? l.hidden : []).filter((x) => known.includes(x)) }; }
  _muLaySave(patch) { const l = this._muLay(); this._cfg.layout.mu = { order: l.order, hidden: l.hidden, ...patch }; this._saveLayout(); this._render(); }
  /* Einstellungen: eine Abfallart als Zeile, aufgeklappt mit Name, Bild, Farbe, Wörtern, Abholzeit und Vorwarnung */
  _muKindRow(K, i, n, adm) {
    const open = this._muEd === K.id, dis = adm ? "" : "disabled";
    const sw = `<button class="sw ${K.on ? "on" : ""}" data-act="muxsw" data-k="bin:${esc(K.id)}" aria-pressed="${!!K.on}" aria-label="${esc(K.name)} an oder aus" ${dis}></button>`;
    const preT = (PRE.find((p) => p[0] === K.pre) || [K.pre, `${K.pre} Tage`])[1];
    const row = `<div class="mukr ${K.on ? "" : "off"}">${muImg(K.img, K.color, 28)}<div class="mukt"><b>${esc(K.name)}</b><small>${esc(K.match.split(",").slice(0, 4).join(", "))}${K.match.split(",").length > 4 ? " …" : ""} · erledigt ab ${esc(K.until)} · ${K.pre > 1 ? `Vorwarnung ${esc(preT)}` : "Vorabend"}</small></div>
      ${adm ? `<button class="ibtn" data-act="muxked" data-k="${esc(K.id)}" aria-expanded="${open}" aria-label="${esc(K.name)} bearbeiten">${ic(open ? "chev" : "pencil", 18)}</button>` : ""}${sw}</div>`;
    if (!open) return row;
    const ed = `<div class="muked">
      <div class="vrow"><span>Name</span><input class="osel" type="text" maxlength="30" data-f="muxkname" data-k="${esc(K.id)}" value="${esc(K.name)}" style="width:55%;flex:none;margin:0" aria-label="Name" ${dis}></div>
      <div class="mut sm">Bild</div><div class="muimgs">${Object.entries(IMGS).map(([id, t]) => `<button class="${K.img === id ? "sel" : ""}" data-act="muxkimg" data-k="${esc(K.id)}" data-v="${id}" aria-pressed="${K.img === id}">${muImg(id, K.color, 22)}${t}</button>`).join("")}</div>
      <div class="mut sm">Farbe</div><div class="mucol">${COLORS.map((c) => `<button class="${K.color === c ? "sel" : ""}" style="background:${c}" data-act="muxkcol" data-k="${esc(K.id)}" data-v="${c}" aria-label="Farbe ${c}" aria-pressed="${K.color === c}"></button>`).join("")}</div>
      <div class="vrow" style="flex-wrap:wrap"><span>Erkennungswörter<small class="mut" style="display:block">Steht eins davon im Kalendertitel, ist es diese Art. Mit Komma trennen. Das längste passende Wort gewinnt.</small></span><input class="osel" type="text" data-f="muxkmatch" data-k="${esc(K.id)}" value="${esc(K.match)}" style="margin:0" aria-label="Erkennungswörter ${esc(K.name)}" ${dis}></div>
      <div class="vrow"><span>Abholung erledigt ab<small class="mut" style="display:block">Bis dahin zeigt der Abholtag „heute“. Danach geht es zum nächsten Termin.</small></span><span class="tin">${this._tIn(K.until, !adm, `Abholung erledigt ab (${K.name})`)}<input type="hidden" data-f="muxkuntil" data-k="${esc(K.id)}" value="${esc(K.until)}"></span></div>
      <div class="mut sm">Erinnern</div><div class="gschips">${PRE.map(([d, t]) => `<button class="gsch ${K.pre === d ? "sel" : ""}" data-act="muxkpre" data-k="${esc(K.id)}" data-v="${d}" aria-pressed="${K.pre === d}">${t}</button>`).join("")}</div>
      <div class="mut sm" style="margin:-2px 0 8px">${K.pre > 1 ? `Zusätzlich ${esc(preT)} vorher eine Vorwarnung, gut für seltene Termine wie Sperrmüll.` : "Wie bisher am Vorabend."}</div>
      <div class="foot2" style="margin-top:4px"><span class="mumv"><button class="ibtn" data-act="muxkup" data-k="${esc(K.id)}" aria-label="Nach oben" ${i === 0 ? "disabled" : ""}>${ic("up", 16)}</button><button class="ibtn" data-act="muxkdn" data-k="${esc(K.id)}" aria-label="Nach unten" ${i === n - 1 ? "disabled" : ""}>${ic("chev", 16)}</button></span><button class="btn2" data-act="muxkdel" data-k="${esc(K.id)}" ${n <= 1 ? "disabled" : ""}>${ic("trash", 16)} Entfernen</button></div></div>`;
    return row + ed;
  }
  _muxModal() {
    const S = this._mu(), C = S.cfg, H = this._hass, st = H.states, adm = this._admin();
    const sw = (k, on, label) => `<button class="sw ${on ? "on" : ""}" data-act="muxsw" data-k="${k}" aria-pressed="${!!on}" aria-label="${esc(label)}" ${adm ? "" : "disabled"}></button>`;
    const cals = Object.keys(st).filter((e) => e.startsWith("calendar.")), tts = Object.keys(st).filter((e) => e.startsWith("tts.")), pl = Object.keys(st).filter((e) => e.startsWith("media_player.")), li = Object.keys(st).filter((e) => e.startsWith("light."));
    const svc = [...new Set([...Object.keys((H.services || {}).notify || {}).filter((n) => !["send_message", "reload", "persistent_notification"].includes(n)).sort().map((n) => "notify." + n), ...C.push.to])];
    const chip = (act, k, t, on) => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${esc(k)}" aria-pressed="${!!on}" ${adm ? "" : "disabled"}>${t}</button>`;
    const nm = (e) => esc((st[e] && st[e].attributes && st[e].attributes.friendly_name) || e);
    const like = (e) => /abfall|müll|muell|waste|tonne|entsorg/i.test(e + " " + ((st[e] && st[e].attributes.friendly_name) || ""));
    const calList = [...C.cals, ...cals.filter((e) => !C.cals.includes(e)).sort((a, b) => like(b) - like(a))];
    const have = new Set(C.kinds.map((k) => k.tpl || k.id)), T = S.templates || {};
    const tpls = TPL_ORDER.filter((id) => T[id] && !have.has(id));
    const U = S.unknown || [];
    return `<style>${CSS}</style><div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Müllabfuhr</b><span>Modul 17 · Addon · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${S.migrated ? `<div class="mumig">${ic("info", 16)}<span>Deine bisherigen Tonnen stehen jetzt in der Liste „Abfallarten“. Wörter und Ein/Aus sind übernommen, die alten Einstellungen bleiben zusätzlich gespeichert.</span></div>` : ""}
      <div class="lsec">${ic("today", 15)}Abfallkalender<span class="mut" style="margin-left:auto;font-weight:400">bis zu 3</span></div>
      <div class="gschips">${calList.map((e) => chip("muxcal", e, `${C.cals.includes(e) ? ic("check", 13) + " " : ""}${nm(e)}`, C.cals.includes(e))).join("") || `<span class="mut sm">In Home Assistant gibt es noch keinen Kalender.</span>`}</div>
      <div class="gst">${ic("info", 15)}<span>${C.cals.length ? `Gewählt: ${C.cals.length} ${C.cals.length === 1 ? "Kalender" : "Kalender"}. Die Termine werden zusammengeführt.${adm ? ` <button class="lnk" data-act="muxcalauto">Automatisch wählen</button>` : ""}` : S.cal ? `Automatisch erkannt (waste_collection_schedule): ${(S.cals || []).map(nm).join(", ")}.` : "Noch keiner gefunden."} Die Integration richtest du im <button class="lnk" data-act="muxstore">Store</button> ein.</span></div>
      ${(S.cal_err || []).length ? `<div class="gst on">${ic("alert", 15)}<span>${(S.cal_err || []).map(nm).join(", ")} antwortet nicht.</span></div>` : ""}
      <div class="lsec" style="margin-top:12px">${ic("trash", 15)}Abfallarten<span class="mut" style="margin-left:auto;font-weight:400">${C.kinds.length} von 10</span></div>
      <div class="mut sm" style="margin:0 0 6px">Welche Abfallarten du hast und woran Modul 17 sie im Kalendertitel erkennt. Tippe auf den Stift zum Bearbeiten.</div>
      <div class="mukl">${C.kinds.map((K, i) => this._muKindRow(K, i, C.kinds.length, adm)).join("")}</div>
      ${adm && C.kinds.length < 10 ? `<div class="mut sm" style="margin:8px 0 0">Abfallart hinzufügen</div><div class="mutpl">${tpls.map((id) => `<button data-act="muxkadd" data-k="${id}">${muImg(T[id].img, T[id].color, 26)}${esc(T[id].name)}<small>${T[id].pre > 1 ? `Vorwarnung ${T[id].pre} Tage` : "Vorabend"}</small></button>`).join("")}<button data-act="muxkadd" data-k="">${muImg("tonne", this._muFreeColor(C), 26)}Eigene<small>frei benennen</small></button></div>` : ""}
      ${U.length ? `<div class="lsec" style="margin-top:12px">${ic("alert", 15)}Nicht erkannt<span class="mut" style="margin-left:auto;font-weight:400">${U.length}</span></div><div class="mut sm" style="margin:0 0 6px">Termine aus dem Kalender ohne Abfallart. Zuordnen, neu anlegen oder ignorieren.</div>${this._muUnkCard(S, true)}` : ""}
      ${C.ignore.length ? `<div class="lsec" style="margin-top:12px">${ic("eyeOff", 15)}Ignoriert</div><div class="gschips">${C.ignore.map((x) => `<button class="gsch" data-act="muxunign" data-t="${esc(x)}" aria-label="${esc(x)} wieder anzeigen" ${adm ? "" : "disabled"}>${esc(x)} ${ic("close", 12)}</button>`).join("")}</div>` : ""}
      <div class="lsec" style="margin-top:12px">${ic("clock", 15)}Vorabend</div>
      <div class="vrow"><span>Uhrzeit<small class="mut" style="display:block">Ab dann gilt „morgen wird abgeholt“: Ampel, Nachricht, Ansage und Licht. Vorwarnungen kommen zur selben Uhrzeit.</small></span><span class="tin">${this._tIn(C.time, !adm, "Uhrzeit am Vorabend")}<input type="hidden" data-f="muxtime" value="${esc(C.time)}"></span></div>
      <div class="lsec" style="margin-top:12px">${ic("bell", 15)}Nachricht aufs Handy</div>
      <div class="vrow"><span>Am Vorabend erinnern<small class="mut" style="display:block">Eine Nachricht, wenn morgen eine Tonne abgeholt wird und sie noch nicht als draußen markiert ist.</small></span>${sw("push", C.push.on, "Nachricht aufs Handy")}</div>
      ${svc.length ? `<div class="gschips">${svc.map((n) => chip("muxns", n, esc(n), C.push.to.includes(n))).join("")}</div>` : `<div class="mut sm">Es wurde kein Benachrichtigungsdienst (notify.*) gefunden. Die Mobile App von Home Assistant legt einen an.</div>`}
      <div class="mut sm" style="margin:2px 0 6px">${C.push.to.length ? `Gesendet wird an: ${C.push.to.map(esc).join(", ")}.` : "Es ist noch kein Dienst gewählt."}</div>
      <div class="mut sm" style="margin:8px 0 0">„Später erinnern“ nach</div><div class="gschips">${SNZ.map((m) => chip("muxsnz", String(m), m % 60 === 0 ? `${m / 60} Std.` : `${m} Min.`, (C.snooze || 60) === m)).join("")}</div>
      <div class="lsec" style="margin-top:12px">${ic("music", 15)}Ansage</div>
      <div class="vrow"><span>Sprachausgabe<small class="mut" style="display:block">Sagt die Erinnerung über einen Lautsprecher an. Im Text steht {tonnen} für die Tonnen.</small></span>${sw("tts", C.tts.on, "Ansage")}</div>
      ${C.tts.on ? `${this._wzSel(tts, C.tts.ent, "muxsel", 'data-k="tts_ent"', "– Sprachdienst (tts) wählen –", /cloud|piper|google|tts/i)}${this._wzSel(pl, C.tts.player, "muxsel", 'data-k="tts_player"', "– Lautsprecher wählen –", /flur|wohn|küche|speaker|echo|nest|sonos/i)}<input class="osel" type="text" data-f="muxtext" value="${esc(C.tts.text)}" style="margin:6px 0" aria-label="Text der Ansage" ${adm ? "" : "disabled"}>` : ""}
      <div class="lsec" style="margin-top:12px">${ic("lamp", 15)}Licht</div>
      <div class="vrow"><span>Licht in der Farbe der Tonne<small class="mut" style="display:block">Leuchtet ab der Vorabend-Uhrzeit, bis die Tonne als draußen markiert ist, und geht dann wieder aus.</small></span>${sw("light", C.light.on, "Licht")}</div>
      ${C.light.on ? this._wzSel(li, C.light.ent, "muxsel", 'data-k="light"', "– Licht wählen –", /flur|eingang|tür|tuer|diele/i) : ""}
      <div class="lsec" style="margin-top:12px">${ic("chart", 15)}Kosten</div>
      <div class="vrow"><span>Leerungen zählen<small class="mut" style="display:block">Zeigt Restmüll-Leerungen im Jahr und was darüber hinaus kostet.</small></span>${sw("cost", C.cost.on, "Kosten")}</div>
      ${C.cost.on ? `<div class="vrow"><span>Enthaltene Leerungen pro Jahr</span><input class="osel" type="number" inputmode="numeric" min="0" max="99" data-f="muxnum" data-k="incl" value="${C.cost.incl}" style="width:90px;margin:0" ${adm ? "" : "disabled"}></div><div class="vrow"><span>Gebühr je weitere Leerung (€)</span><input class="osel" type="number" inputmode="decimal" min="0" step="0.01" data-f="muxnum" data-k="fee" value="${C.cost.fee}" style="width:90px;margin:0" ${adm ? "" : "disabled"}></div>` : ""}
      <div class="lsec" style="margin-top:12px">${ic("eye", 15)}Darstellung</div>
      <div class="vrow"><span>Optik wie bisher<small class="mut" style="display:block">Zeigt Modul 17 ohne Straßen-Szene, neue Kacheln, 14-Tage-Leiste und neuen Kalender.</small></span>${sw("look", C.look.old, "Optik wie bisher")}</div>
      ${C.look.old ? "" : `<div class="mut sm" style="margin:0 0 2px">Bewegung in der Szene</div><div class="gschips">${[["aus", "Aus"], ["dezent", "Dezent"], ["voll", "Voll"]].map(([v, t]) => chip("muxmot", v, t, (C.look.motion || "dezent") === v)).join("")}</div>`}
      <div class="lsec" style="margin-top:12px">${ic("alert", 15)}Hinweise</div>
      <div class="vrow"><span>Wetter-Hinweise<small class="mut" style="display:block">Warnt vor Sturm und Frost an Abholtagen. Nutzt Modul 9, falls eingeschaltet.</small></span>${sw("wx", C.wx, "Wetter-Hinweise")}</div>
      <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="muxtest" ${C.push.to.length || C.tts.on ? "" : "disabled"}>${ic("bell", 16)} Test senden</button><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  /* ================= v0.5 Neue Optik (A1–A4, A7, A9, A10) ================= */
  _muNew() { const C = this._mu().cfg; return !(C.look && C.look.old); }
  _muMot() { const C = this._mu().cfg; let m = (C.look && C.look.motion) || "dezent"; try { if (matchMedia("(prefers-reduced-motion: reduce)").matches) m = "aus"; } catch (_) { /* egal */ } return m; }
  _muEvMap(S) { const out = {}; (S.ev || []).forEach(([d, k]) => { (out[d] = out[d] || []).push(k); }); return out; }
  _muAddDays(iso, n) { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  _muHM(min) { return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`; }
  _muNames(list) { const n = list.map((x) => x.name); return n.length <= 1 ? (n[0] || "") : n.slice(0, -1).join(", ") + " und " + n[n.length - 1]; }
  /* A1: Straßen-Szene. Fällige Arten stehen am Bordstein (Orange = muss raus, Türkis = steht draußen), die übrigen ruhen am Haus. */
  _muSceneSvg(S, mob, empty) {
    const rows = S.bins || [], hr = parseInt(String(S.now || "").slice(11, 13), 10), night = !(hr >= 7 && hr < 17), mot = this._muMot();
    const curb = empty ? [] : rows.filter((x) => ["out", "today", "done"].includes(x.state)).slice(0, 4);
    const home = empty ? [] : rows.filter((x) => !curb.includes(x)).slice(0, 4);
    const truck = !empty && rows.some((x) => x.state === "today");
    const g = (x, img, col, sc, op, glow) => `<g transform="translate(${x},${172 - 76 * sc}) scale(${sc})" opacity="${op}">${glow ? `<ellipse class="muglow ${mot}" cx="30" cy="76" rx="27" ry="6.5" fill="${glow}" opacity=".55"/>` : `<ellipse cx="30" cy="76" rx="20" ry="3.5" fill="#000" opacity=".35"/>`}${(ART[img] || ART.tonne)(col)}</g>`;
    const sky = night ? `<stop offset="0" stop-color="#0b1626"/><stop offset=".75" stop-color="#16324a"/><stop offset="1" stop-color="#2b3448"/>` : `<stop offset="0" stop-color="#1b4a74"/><stop offset=".75" stop-color="#3a7bb0"/><stop offset="1" stop-color="#6aa5cf"/>`;
    const deco = night ? `<g fill="#fff" opacity=".7"><circle cx="-200" cy="40" r="1"/><circle cx="60" cy="24" r="1.2"/><circle cx="180" cy="60" r=".9"/><circle cx="420" cy="30" r="1.2"/><circle cx="520" cy="52" r="1"/><circle cx="610" cy="22" r="1.3"/><circle cx="700" cy="40" r=".9"/><circle cx="760" cy="70" r="1"/><circle cx="480" cy="84" r=".8"/></g><circle cx="735" cy="44" r="15" fill="#e5e7eb" opacity=".9"/><circle cx="742" cy="39" r="14" fill="#13293f"/>`
      : `<circle cx="740" cy="46" r="18" fill="#fde68a"/><circle cx="740" cy="46" r="30" fill="#fde68a" opacity=".18"/><g fill="#fff" opacity=".75"><ellipse cx="560" cy="44" rx="34" ry="10"/><ellipse cx="585" cy="36" rx="22" ry="11"/><ellipse cx="660" cy="70" rx="26" ry="7"/></g>`;
    const win = night ? "#fbbf24" : "#cfe7f7";
    const house = `<path d="M318 98 L392 52 L466 98Z" fill="#22303d"/><rect x="332" y="98" width="120" height="70" fill="#2b3a48"/><path d="M342 88 L380 64 L384 70 L348 93Z" fill="#1e3a5f"/>
      <rect x="346" y="112" width="26" height="24" rx="2" fill="${win}" opacity="${night ? .85 : .7}"/><rect x="412" y="112" width="26" height="24" rx="2" fill="${win}" opacity="${night ? .45 : .7}"/><rect x="382" y="126" width="22" height="42" rx="2" fill="#16212b"/><rect x="426" y="62" width="10" height="22" fill="#3b4652"/>`;
    const lampOn = night ? `<circle cx="782" cy="104" r="56" fill="url(#mulamp)"/>` : "";
    const homeG = home.map((x, i) => g(470 + i * 34, x.img, x.color, .56, .62, null)).join("");
    const curbG = curb.map((x, i) => g((truck ? 548 : 612) + i * 46 - (curb.length > 2 ? 20 : 0), x.img, x.color, .84, 1, x.state === "done" ? "#2dd4bf" : "#f59e0b")).join("");
    const trk = truck ? `<g class="mutruck ${mot}" transform="translate(680,156)"><rect x="0" y="6" width="62" height="30" rx="4" fill="#f97316"/><rect x="62" y="14" width="26" height="22" rx="3" fill="#fb923c"/><rect x="68" y="17" width="13" height="9" rx="1.5" fill="#bae6fd"/><path d="M6 14h48M6 22h48" stroke="#fff" stroke-opacity=".25" stroke-width="2"/><circle cx="16" cy="40" r="7" fill="#0b0f13"/><circle cx="70" cy="40" r="7" fill="#0b0f13"/></g>` : "";
    const emp = empty ? `<g transform="translate(640,${172 - 76 * .84}) scale(.84)" opacity=".5"><ellipse cx="30" cy="76" rx="20" ry="3.5" fill="#000" opacity=".35"/>${ART.tonne("#64748b")}</g><text x="665" y="120" font-size="30" font-weight="800" fill="#fff" opacity=".85" font-family="inherit">?</text>` : "";
    const vb = mob ? "300 20 500 200" : "-400 0 1200 220";
    return `<svg class="musc" viewBox="${vb}" preserveAspectRatio="${mob ? "xMidYMax meet" : "xMaxYMax slice"}" aria-hidden="true"><defs><linearGradient id="musky" x1="0" y1="0" x2="0" y2="1">${sky}</linearGradient><radialGradient id="mulamp"><stop offset="0" stop-color="#fde68a" stop-opacity=".5"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient></defs>
      <rect x="-400" width="1600" height="220" fill="url(#musky)"/>${deco}${house}<rect x="462" y="150" width="120" height="20" rx="9" fill="#1f3b2c"/>
      <rect x="-400" y="168" width="1600" height="9" fill="#5b6672"/><rect x="-400" y="177" width="1600" height="43" fill="#262d35"/><path d="M-400 200H1200" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="26 22" opacity=".4"/>
      <rect x="780" y="78" width="4" height="92" fill="#3b4652"/><rect x="770" y="72" width="22" height="7" rx="3" fill="#3b4652"/>${lampOn}${homeG}${curbG}${trk}${emp}</svg>`;
  }
  _muBanner(S, mob) {
    const C = S.cfg, rows = S.bins || [], due = rows.filter((x) => ["out", "today", "done"].includes(x.state));
    const today = due.filter((x) => x.state === "today" || (x.state === "done" && x.days === 0)), tom = due.filter((x) => x.state === "out" || (x.state === "done" && x.days === 1));
    const soon = rows.filter((x) => x.state === "soon"), up = rows.filter((x) => x.next && !["out", "today", "done", "soon"].includes(x.state));
    const nDone = (L) => L.filter((x) => x.state === "done").length;
    let k = "", t = "", s = "", tone = "ok";
    if (today.length && nDone(today) < today.length) { k = "HEUTE"; t = this._muNames(today); s = `${nDone(today)} von ${today.length} steht draußen · Abholung bis ${this._muHM(Math.min(...today.map((x) => (S.until || {})[x.k] || 720)))} Uhr`; tone = "due"; }
    else if (tom.length && nDone(tom) < tom.length) { k = "MORGEN FRÜH"; t = this._muNames(tom); s = tom.length > 1 ? `${nDone(tom)} von ${tom.length} steht draußen · jetzt rausstellen` : "Jetzt rausstellen"; tone = "due"; }
    else if (due.length) { k = "ERLEDIGT"; t = due.length > 1 ? "Alles steht draußen" : `${due[0].name} steht draußen`; s = due.length > 1 ? this._muNames(due) : (today.length ? "Abholung heute" : "Abholung morgen früh"); tone = "done"; }
    else if (soon.length) { k = "MORGEN"; t = this._muNames(soon); s = `Ab ${esc(C.time)} Uhr rausstellen`; tone = "soon"; }
    else if (up.length) { const d0 = up[0].next, same = up.filter((x) => x.next === d0); k = "NÄCHSTE ABHOLUNG"; t = this._muNames(same); s = `${this._muDate(d0)} · ${this._muWhen(up[0].days)}`; }
    else { k = "MÜLLABFUHR"; t = "Keine Termine"; s = "In den nächsten Wochen steht nichts im Kalender."; }
    const preK = new Set((S.notes || []).filter((n) => n.k === "pre").map((n) => n.bin)), after = rows.filter((x) => x.next && !t.includes(x.name) && !preK.has(x.k)).slice(0, 1).map((x) => `Danach: ${esc(x.name)} ${this._muWhen(x.days)}`)[0] || "";
    const chips = [
      ...(S.notes || []).filter((n) => n.k === "pre").slice(0, 2).map((n) => { const K = C.kinds.find((q) => q.id === n.bin); return `<span class="muchip">${K ? muImg(K.img, K.color, 14) : ""}${esc(K ? K.name : "")} ${this._muWhen((new Date(n.d + "T12:00:00") - new Date(S.today + "T12:00:00")) / 864e5)}</span>`; }),
      S.snooze ? `<span class="muchip">${ic("clock", 13)} Erinnerung um ${esc(S.snooze_until)}</span>` : "",
      S.light_on ? `<span class="muchip">${ic("lamp", 13)} Licht an</span>` : "",
      S.cached ? `<span class="muchip warn">${ic("alert", 13)} Stand ${esc(S.ev_ok)}</span>` : "",
    ].filter(Boolean).join("");
    const open = rows.filter((x) => ["out", "today"].includes(x.state));
    const btn = open.length ? `<button class="mubtn" data-act="muxdoneall">${ic("check", 16)} ${open.length > 1 ? "Alle stehen draußen" : "Steht draußen"}</button>` : "";
    return `<div class="card mubn ${tone} ${mob ? "mob" : ""}">${mob ? `<div class="mubs">${this._muSceneSvg(S, true)}</div>` : this._muSceneSvg(S, false)}
      <div class="mubt"><span class="k">${k}</span><b>${esc(t)}</b><span class="s">${esc(s)}</span>${after ? `<span class="a">${after}</span>` : ""}${chips ? `<div class="muchips">${chips}</div>` : ""}${btn}</div></div>`;
  }
  /* A2 + A7: Tonnen-Kacheln 2.0 – ruhige Kacheln, Zustand als Wort und Farbe, Ring bis zur Abholung (14 Tage) */
  _muTiles2(S) {
    const rows = S.bins || [];
    const word = (x) => x.state === "out" ? "raus!" : x.state === "today" ? "heute raus" : x.state === "soon" ? "morgen" : x.state === "done" ? "steht draußen" : x.state === "none" ? "kein Termin" : x.days <= 3 ? "bald" : "ok";
    const cls = (x) => x.state === "ok" && x.days <= 3 ? "bald" : x.state;
    return `<div class="mut2g">${rows.map((x) => { const tap = ["out", "today", "soon"].includes(x.state) ? "muxdone" : x.state === "done" ? "muxundo" : ""; const p = x.next ? Math.max(4, Math.round((1 - Math.min(14, x.days) / 14) * 100)) : 0;
      return `<${tap ? `button data-act="${tap}" data-k="${x.k}" aria-label="${esc(x.name)}: ${tap === "muxdone" ? "steht draußen" : "zurücknehmen"}"` : "div"} class="mut2 ${cls(x)}"><span class="ring" style="--p:${p};--c:${x.color}" title="${x.next ? this._muWhen(x.days) : ""}"></span>${muImg(x.img, x.color, 46)}<b>${esc(x.name)}</b><em>${word(x)}</em><small>${x.next ? `${this._muWhen(x.days)} · ${this._muDate(x.next)}` : "–"}</small>${tap === "muxdone" ? `<i class="tap">antippen, wenn draußen</i>` : tap === "muxundo" ? `<i class="tap">antippen zum Zurücknehmen</i>` : ""}</${tap ? "button" : "div"}>`; }).join("")}</div>`;
  }
  /* A3: 14-Tage-Leiste */
  _muStrip(S) {
    const C = S.cfg, E = this._muEvMap(S), K = Object.fromEntries(C.kinds.map((k) => [k.id, k])), sel = this._muDay;
    const days = Array.from({ length: 14 }, (_, i) => this._muAddDays(S.today, i));
    const cell = (d, i) => { const dt = new Date(d + "T12:00:00"), wd = (dt.getDay() + 6) % 7, ks = (E[d] || []).filter((k) => K[k] && K[k].on);
      return `<button class="mus14 ${i === 0 ? "heute" : ""} ${wd >= 5 ? "we" : ""} ${ks.length ? "has" : ""} ${sel === d ? "sel" : ""}" data-act="muxday" data-k="${d}" aria-label="${this._muDate(d)}${ks.length ? ": " + ks.map((k) => K[k].name).join(", ") : ""}"><em>${i === 0 ? "heute" : DAYS_SHORT_MU[wd]}</em><b>${dt.getDate()}</b><span>${ks.map((k) => `<u style="background:${K[k].color}"></u>`).join("")}</span></button>`; };
    const sd = sel && days.includes(sel) ? sel : null, sk = sd ? (E[sd] || []).filter((k) => K[k]) : [];
    const det = sd ? `<div class="mus14d">${sk.length ? sk.map((k) => `<span>${muImg(K[k].img, K[k].color, 18)}<b>${esc(K[k].name)}</b>${K[k].pre > 1 ? `<small>Vorwarnung ${K[k].pre} Tage vorher</small>` : ""}</span>`).join("") : `<span class="mut sm">Keine Abholung.</span>`}<em>${this._muDate(sd)}</em></div>` : "";
    return `<div class="card"><h2>${ic("today", 18)}Die nächsten 14 Tage</h2><div class="mus14r">${days.map(cell).join("")}</div>${det}</div>`;
  }
  /* A4: Kalender mit Farbleisten, Blättern und Jahresansicht */
  _muCal2(S) {
    const C = S.cfg, E = this._muEvMap(S), K = Object.fromEntries(C.kinds.map((k) => [k.id, k])), shift = new Set((S.notes || []).filter((n) => n.k === "shift").map((n) => n.d));
    const t = new Date(S.today + "T12:00:00"), mode = this._muCalM || "m";
    const ds = (S.ev || []).map((x) => x[0]), last = ds.length ? new Date(ds[ds.length - 1] + "T12:00:00") : t;
    const maxOff = Math.max(0, (last.getFullYear() - t.getFullYear()) * 12 + last.getMonth() - t.getMonth()), minOff = -t.getMonth();
    const off = Math.min(maxOff, Math.max(minOff, this._muMon || 0)), base = new Date(t.getFullYear(), t.getMonth() + off, 1);
    const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const bars = (d) => (E[d] || []).filter((k) => K[k] && K[k].on).map((k) => `<u style="background:${K[k].color}" title="${esc(K[k].name)}"></u>`).join("");
    const tg = `<div class="gschips mucm"><button class="gsch ${mode === "m" ? "sel" : ""}" data-act="muxcalm" data-k="m">Monat</button><button class="gsch ${mode === "y" ? "sel" : ""}" data-act="muxcalm" data-k="y">Jahr</button></div>`;
    if (mode === "y") {
      const y = t.getFullYear();
      const mon = (m) => { const f = (new Date(y, m, 1).getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate(); return `<button class="muym ${m === t.getMonth() ? "cur" : ""}" data-act="muxmon" data-k="${m - t.getMonth()}"><b>${new Date(y, m, 1).toLocaleDateString("de-DE", { month: "short" })}</b><span>${Array(f).fill("<i></i>").join("")}${Array.from({ length: n }, (_, i) => { const d = iso(y, m, i + 1), ks = (E[d] || []).filter((k) => K[k] && K[k].on); return `<i class="${d === S.today ? "t" : ""}" style="${ks.length ? `background:${ks.length > 1 ? `linear-gradient(135deg,${K[ks[0]].color} 50%,${K[ks[1]].color} 50%)` : K[ks[0]].color}` : ""}"></i>`; }).join("")}</span></button>`; };
      const leg = C.kinds.filter((k) => k.on).map((k) => `<span><u style="background:${k.color}"></u>${esc(k.name)}</span>`).join("");
      return `<div class="card"><h2>${ic("today", 18)}${y}${tg}</h2><div class="muyg">${Array.from({ length: 12 }, (_, m) => mon(m)).join("")}</div><div class="muleg">${leg}</div></div>`;
    }
    const y = base.getFullYear(), m = base.getMonth(), f = (new Date(y, m, 1).getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate();
    const cells = [...Array(f).fill(`<i class="mucd2 e"></i>`), ...Array.from({ length: n }, (_, i) => { const d = iso(y, m, i + 1); return `<i class="mucd2 ${d === S.today ? "today" : ""} ${d < S.today ? "past" : ""} ${shift.has(d) ? "shift" : ""}" ${shift.has(d) ? 'title="Verschoben"' : ""}><b>${i + 1}</b><span>${bars(d)}</span></i>`; })];
    const nav = `<span class="mucnav"><button class="ibtn" data-act="muxmon" data-k="${off - 1}" ${off <= minOff ? "disabled" : ""} aria-label="Voriger Monat">${ic("chev", 16)}</button>${off ? `<button class="lnk" data-act="muxmon" data-k="0">Heute</button>` : ""}<button class="ibtn" data-act="muxmon" data-k="${off + 1}" ${off >= maxOff ? "disabled" : ""} aria-label="Nächster Monat">${ic("chev", 16)}</button></span>`;
    return `<div class="card"><h2>${ic("today", 18)}${esc(base.toLocaleDateString("de-DE", { month: "long", year: "numeric" }))}${tg}</h2>${nav}<div class="mucal2">${DAYS_SHORT_MU.map((d) => `<em>${d}</em>`).join("")}${cells.join("")}</div>${shift.size ? `<div class="mut sm" style="margin-top:8px">Gestrichelt: Abholung an einem anderen Tag als üblich.</div>` : ""}</div>`;
  }
  /* Banner oben: neue Optik mit Straßen-Szene, sonst das bisherige Banner des Kerns. Der Kern ruft _muHero() ab 2026.11.4b4. */
  _muHero() { const S = this._mu(); if (!this._muNew()) return this._modHeroFor("mu"); if (!(S.on && S.cal && (S.bins || []).some((x) => x.next))) return ""; const mob = !!this._narrow || (this.offsetWidth > 0 && this.offsetWidth < 640); return `<style>${CSS}</style>` + this._muBanner(S, mob); }
  /* A9: Leerzustand mit Bild und drei Schritten */
  _muEmpty2(S) {
    const none = !S.cal;
    return `<div class="card mubn muempty">${this._muSceneSvg(S, false, true)}<div class="mubt"><span class="k">MODUL 17 EINRICHTEN</span><b>${none ? "Noch kein Abfallkalender" : "Kalender liefert keine Termine"}</b><span class="s">${none ? "Die Abholtermine kommen aus einem Kalender in Home Assistant." : esc(S.error || "Bitte einen anderen Kalender wählen.")}</span></div></div>
      ${none ? `<div class="card"><div class="mustep">${[["puzzle", "Abfallkalender im Store", "„Abfallkalender“ öffnen und die Integration waste_collection_schedule einrichten."], ["today", "Entsorger wählen", "Dort deinen Ort oder Entsorger wählen. Es entsteht ein Kalender mit allen Terminen."], ["check", "Fertig", "Modul 17 findet den Kalender von selbst. Du kannst ihn auch in den Einstellungen wählen."]].map(([i, a, b], n) => `<div><span class="n">${n + 1}</span>${ic(i, 22)}<b>${a}</b><small>${b}</small></div>`).join("")}</div>
      <div class="gbtns" style="margin-top:12px">${this._admin() ? `<button class="btn2 pri" data-act="muxstore">${ic("puzzle", 16)} Zum Store</button><button class="btn2" data-act="muxopen">${ic("sliders", 16)} Einstellungen</button>` : `<span class="mut sm">Das richtet ein Administrator ein.</span>`}</div></div>` : ""}`;
  }
  };
  return {
    id: "muell", mixin: Mixin, css: CSS, settings: true, settingsTxt: "Abfallkalender, Abfallarten, Nicht erkannt, Erinnerung, Ansage, Licht, Kosten",
    page: (p) => (p._muHero ? p._muHero() : p._modHeroFor("mu")) + p._muPage(),
    act: (p, a, el) => { if (a === "settings") p._act("muxopen", el); },
    search: [
      { id: "cal", t: "Müllabfuhr: Abfallkalender", k: "müll abfall tonne kalender waste collection termine", h: "Aus bis zu drei Kalendern kommen die Abholtermine." },
      { id: "kinds", t: "Müllabfuhr: Abfallarten", k: "abfallart tonne glas sperrmüll grünschnitt schadstoff weihnachtsbaum farbe bild erkennung", h: "Bis zu 10 Abfallarten mit Name, Bild, Farbe und Erkennungswörtern." },
      { id: "rem", t: "Müllabfuhr: Erinnerung", k: "erinnerung vorabend handy ansage licht uhrzeit später vorwarnung", h: "Nachricht, Ansage und Licht am Vorabend, Vorwarnung für Sondertermine." },
      { id: "cost", t: "Müllabfuhr: Kosten Restmüll", k: "kosten gebühr leerungen restmüll", h: "Leerungen und Kosten für den Restmüll im Jahr." },
    ],
  };
};
