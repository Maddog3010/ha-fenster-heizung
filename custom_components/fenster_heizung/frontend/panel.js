/* Fenster & Heizung – Dashboard-Panel 2.0 (ohne externe Abhängigkeiten) */
const ICONS = {
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 12.5l9 5 9-5M3 17l9 5 9-5"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  chart: '<path d="M4 4v16h16"/><path d="M8 15l3-4 3 2 5-7"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  window: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M4 12h16"/>',
  windowOpen: '<rect x="3" y="3" width="9" height="18" rx="2"/><path d="M14 5l7 2v10l-7 2z"/><path d="M3 12h9"/>',
  radiator: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M7.5 9.5v5M12 9.5v5M16.5 9.5v5M6 18v2M18 18v2"/>',
  flame: '<path d="M12 2.5c1.1 3 5.2 5.4 5.2 10.2A5.2 5.2 0 0 1 12 18a5.2 5.2 0 0 1-5.2-5.3c0-2.2 1.2-3.6 2.4-4.8.2 1.8 1 2.8 2 3.2C11.6 8.6 10.8 5.4 12 2.5z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  today: '<rect x="4" y="5" width="16" height="16" rx="2.5"/><path d="M4 10h16M8 3v4M16 3v4"/><circle cx="12" cy="15.5" r="1.6" fill="currentColor"/>',
  month: '<rect x="4" y="5" width="16" height="16" rx="2.5"/><path d="M4 10h16M8 3v4M16 3v4M8 14h2M14 14h2M8 17.5h2"/>',
  year: '<rect x="4" y="5" width="16" height="16" rx="2.5"/><path d="M4 10h16M8 3v4M16 3v4M8 14h8M8 17.5h8"/>',
  total: '<path d="M7.5 9C4 9 4 15 7.5 15c4 0 5-6 9-6 3.5 0 3.5 6 0 6-4 0-5-6-9-6z"/>',
  thermo: '<path d="M10 14.5V5.5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/><path d="M12 9v7"/>',
  plan: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M4 9h16M8 2.5v3M16 2.5v3"/><circle cx="12" cy="14.6" r="3"/><path d="M12 13.2v1.5l1 .6"/>',
  sofa: '<path d="M5 11V8.5A3 3 0 0 1 8 5.5h8a3 3 0 0 1 3 3V11"/><rect x="3" y="11" width="18" height="6" rx="2.5"/><path d="M6 17v2M18 17v2"/>',
  tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
  dining: '<circle cx="12" cy="6.5" r="2.6"/><path d="M4 11h16M7 11v9M17 11v9"/>',
  pot: '<path d="M5 10h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3zM3 10h18M9 4.5c0 1.2 1 1.2 1 2.5M14 4.5c0 1.2 1 1.2 1 2.5"/>',
  bed: '<path d="M3 19V6M3 14h18v5M21 14v-2.5A2.5 2.5 0 0 0 18.5 9H11v5"/><circle cx="7" cy="11" r="1.8"/>',
  baby: '<circle cx="12" cy="13.5" r="6.5"/><circle cx="6.3" cy="6.8" r="2.3"/><circle cx="17.7" cy="6.8" r="2.3"/><path d="M9.8 12.5h.01M14.2 12.5h.01M10.4 16c1 .8 2.2.8 3.2 0"/>',
  desk: '<rect x="3" y="5" width="18" height="11" rx="2"/><path d="M8 20h8M12 16v4"/>',
  book: '<path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5v13"/>',
  drop: '<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z"/>',
  laundry: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><circle cx="12" cy="13.5" r="4.5"/><path d="M8 6.5h.01M11 6.5h.01"/>',
  door: '<rect x="6" y="3" width="12" height="18" rx="1.8"/><circle cx="15" cy="12" r=".9" fill="currentColor"/>',
  stairs: '<path d="M3 20h18M3 20v-5h5v-5h5V5h8"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  tree: '<circle cx="12" cy="9" r="6"/><path d="M12 15v6M8.5 21h7"/>',
  car: '<path d="M4 17v-5l2-5h12l2 5v5zM4 17v2M20 17v2M4 12h16"/><circle cx="8" cy="15" r=".9" fill="currentColor"/><circle cx="16" cy="15" r=".9" fill="currentColor"/>',
  tools: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13.5h18"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  suitcase: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18M12 13v2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  pencil: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19zM14.5 6.5l3 3"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/>',
  grip: '<g fill="currentColor" stroke="none"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></g>',
};
const ic = (n, s = 22) =>
  `<svg class="ic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.door}</svg>`;

const ROOM_ICONS = [["sofa", "Wohnzimmer"], ["tv", "Medien"], ["dining", "Esszimmer"], ["pot", "Küche"], ["bed", "Schlafzimmer"], ["baby", "Kinderzimmer"], ["desk", "Büro"], ["book", "Bibliothek"],
  ["drop", "Bad"], ["laundry", "Waschküche"], ["door", "Flur"], ["stairs", "Treppe"], ["sun", "Wintergarten"], ["tree", "Terrasse"], ["car", "Garage"], ["tools", "Werkstatt"]];
const COLORS = ["#2dd4bf", "#f59e0b", "#a78bfa", "#f472b6", "#60a5fa", "#a3e635"];
const MODE = {
  regelung_aktiv: { t: "Regelung aktiv", c: "green" },
  heizung_pausiert: { t: "Heizung pausiert", c: "amber" },
  nur_fenstermeldung: { t: "Heizung aus · nur Fenstermeldung", c: "slate" },
  regelung_aus: { t: "Regelung deaktiviert", c: "gray" },
};
const LOGO_URL = "/fenster_heizung_static/logo.png";
const FUELS = {
  erdgas: { short: "Gas", label: "m³ Gas", noun: "Gasersparnis" },
  heizoel: { short: "Heizöl", label: "l Heizöl", noun: "Heizölersparnis" },
  fluessiggas: { short: "Flüssiggas", label: "l Flüssiggas", noun: "Flüssiggasersparnis" },
  pellets: { short: "Pellets", label: "kg Pellets", noun: "Pelletersparnis" },
  strom: { short: "Strom", label: "kWh Strom", noun: "Stromersparnis" },
};
const MIXED = { short: "Heizenergie", label: "kWh Heizenergie", unit: "kWh", noun: "Ersparnis" };
const unitOf = (f) => (f.unit || f.label.split(" ")[0]);
const GROUP_ICONS = ["layers", "home", "bed", "sofa", "desk"];
const BLOCKS = { hero: "Kopfkarte", presence: "Anwesenheit", tiles: "Kennzahlen", chart: "Diagramm", rooms: "Räume" };
const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const DAYS_LONG = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const TEMPLATE = [
  { days: [0, 1, 2, 3, 4], time: "05:30", temp: 21 }, { days: [0, 1, 2, 3, 4], time: "08:00", temp: 18 },
  { days: [0, 1, 2, 3, 4], time: "16:00", temp: 21 }, { days: [0, 1, 2, 3, 4], time: "22:00", temp: 17 },
  { days: [5, 6], time: "07:30", temp: 21 }, { days: [5, 6], time: "23:00", temp: 17 },
];
const roomIcon = (n) => {
  n = n.toLowerCase();
  if (/wohn|stube/.test(n)) return "sofa";
  if (/kinder/.test(n)) return "baby";
  if (/schlaf|gast/.test(n)) return "bed";
  if (/k[üu]e?che|kitchen/.test(n)) return "pot";
  if (/b[üu]e?ro|arbeit|office/.test(n)) return "desk";
  if (/bad|wc|dusche/.test(n)) return "drop";
  return "door";
};
const num = (v, d = 0) => (Number(v) || 0).toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---- Heizplan-Rechnung (gleiche Logik wie im Backend) ---- */
const toMin = (t) => { const [h, m] = String(t || "0:0").split(":").map(Number); return (h || 0) * 60 + (m || 0); };
const fmtT = (min) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
const STOPS = [[14, [59, 130, 246]], [17, [56, 189, 248]], [19, [253, 224, 71]], [21, [245, 158, 11]], [24, [239, 68, 68]]];
const heat = (t) => {
  t = Math.min(Math.max(Number(t) || 14, 14), 24);
  let i = 0; while (i < STOPS.length - 2 && t > STOPS[i + 1][0]) i++;
  const [a, ca] = STOPS[i], [b, cb] = STOPS[i + 1], k = (t - a) / (b - a);
  return `rgb(${ca.map((v, j) => Math.round(v + (cb[j] - v) * k)).join(",")})`;
};
const points = (entries) => (entries || []).flatMap((e) => (e.days || []).map((d) => ({ w: d * 1440 + toMin(e.time), t: Number(e.temp) }))).sort((a, b) => a.w - b.w);
const at = (pts, w) => { if (!pts.length) return null; let c = pts[pts.length - 1]; for (const p of pts) { if (p.w <= w) c = p; else break; } return c.t; };
const nextPt = (pts, w) => (pts.length ? pts.find((p) => p.w > w) || { ...pts[0], w: pts[0].w + 10080 } : null);
const segs = (pts, d) => {
  const lo = d * 1440, cuts = pts.filter((p) => p.w >= lo && p.w < lo + 1440), out = [];
  let start = 0, t = at(pts, lo);
  for (const c of cuts) { const m = c.w - lo; if (m > start) out.push({ s: start, e: m, t }); start = m; t = c.t; }
  out.push({ s: start, e: 1440, t });
  return out;
};
const nowMin = () => { const n = new Date(); return ((n.getDay() + 6) % 7) * 1440 + n.getHours() * 60 + n.getMinutes(); };
const bar = (pts, d, now) => `<div class="tlw"><div class="tl">${segs(pts, d).map((s) =>
  `<i style="width:${(s.e - s.s) / 14.4}%;background:${heat(s.t)}" title="${fmtT(s.s)}–${fmtT(s.e % 1440 || 1440)} · ${num(s.t, 1)} °C"></i>`).join("")}</div>${now != null ? `<b style="left:${(now % 1440) / 14.4}%"></b>` : ""}</div>
  <div class="tla"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>`;

const CSS = `
:host{display:block;min-height:100%;background:var(--primary-background-color,#0f1419);color:var(--primary-text-color,#e6edf3);
  font-family:var(--paper-font-body1_-_font-family,Roboto,"Segoe UI",system-ui,sans-serif);
  --card:var(--card-background-color,#1a2129);--mut:var(--secondary-text-color,#9aa7b4);--line:var(--divider-color,#2a3440);
  --green:#34d399;--amber:#f59e0b;--slate:#7dd3fc;--gray:#94a3b8;--teal:#2dd4bf}
*{box-sizing:border-box}
button{font:inherit;color:inherit}
.bar{display:flex;align-items:center;gap:10px;padding:10px 14px;position:sticky;top:0;z-index:5;
  background:var(--app-header-background-color,var(--card));color:var(--app-header-text-color,var(--primary-text-color));border-bottom:1px solid var(--line)}
.bar .ib0{background:none;border:0;padding:6px;border-radius:50%;cursor:pointer;display:grid;place-items:center}
.brand{display:flex;align-items:center;gap:10px;flex:1;min-width:0}
.logo{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;color:#fff;flex:none;
  background:linear-gradient(135deg,#14b8a6,#0e6a82);box-shadow:0 4px 12px rgba(20,184,166,.35)}
.brand>div{min-width:0}.brand b{display:block;font-size:1.12rem;font-weight:700;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.brand div span em{font-style:normal}.brand .ver:not(:first-child)::before{content:" · "}
.brand div span{display:block;font-size:.72rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar:not(.nar){position:static;background:none;border:0;max-width:1180px;margin:0 auto;padding:18px 14px 0;gap:14px}
.bar:not(.nar) .logo{width:46px;height:46px;border-radius:14px}
.bar:not(.nar) .brand{gap:14px}
.bar:not(.nar) .brand b{font-size:1.3rem}
.bar:not(.nar) .brand div span{font-size:.82rem;margin-top:2px}
.pillbtn{flex:none;display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:transparent;border-radius:999px;padding:7px 12px;font-size:.82rem;font-weight:600;cursor:pointer}
.pillbtn.pri{background:var(--teal);border-color:var(--teal);color:#042f2e}
.wrap{max-width:1180px;margin:0 auto;padding:16px 14px calc(28px + env(safe-area-inset-bottom,0px));display:grid;gap:14px}
.banner{display:flex;gap:10px;align-items:flex-start;border:1px dashed var(--teal);border-radius:14px;padding:11px 13px;font-size:.84rem;color:var(--mut);background:color-mix(in srgb,var(--teal) 8%,transparent)}
.banner .ic{color:var(--teal);flex:none;margin-top:1px}
.blk.editing{outline:2px dashed var(--line);outline-offset:4px;border-radius:20px;position:relative}
.etag{display:flex;align-items:center;gap:8px;font-size:.78rem;font-weight:600;color:var(--mut);margin:0 0 8px 2px}
.grip{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:10px;background:var(--card);border:1px solid var(--line);color:var(--primary-text-color);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;flex:none}
.ghost{position:fixed!important;margin:0!important;outline:0!important;z-index:40;pointer-events:none;opacity:.97;box-shadow:0 20px 44px rgba(0,0,0,.5);border-radius:20px;background:var(--primary-background-color)}
.dragging{opacity:.28}
.drop-before{box-shadow:0 -5px 0 0 var(--teal);border-radius:4px}.drop-after{box-shadow:0 5px 0 0 var(--teal);border-radius:4px}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px}
.card h2{font-size:.95rem;margin:0 0 12px;font-weight:600;display:flex;align-items:center;gap:8px}
.card h2 .ic{color:var(--teal)}
.hero{position:relative;overflow:hidden;border:0;color:#ecfeff;padding:20px 18px;min-height:168px;
  background:radial-gradient(120% 140% at 85% 0%,#14b8a6 0%,rgba(20,184,166,0) 55%),linear-gradient(135deg,#0f5f66 0%,#0c3b52 60%,#0b2c43 100%)}
.hero .art{position:absolute;right:10px;top:14px;height:104px;width:auto;max-width:44%;opacity:.95}
.hero .hlogo{position:absolute;right:14px;bottom:14px;width:48px;height:48px;border-radius:50%;object-fit:cover;box-shadow:0 4px 14px rgba(0,0,0,.45),0 0 0 2px rgba(255,255,255,.16);background:#000}
.hero .lbl{max-width:calc(100% - 150px);font-size:.82rem;opacity:.85;display:flex;gap:6px;align-items:center}
.hero .big{font-size:2.7rem;font-weight:700;line-height:1.05;margin:6px 0 2px;letter-spacing:-.5px}
.hero .big small{font-size:1.2rem;font-weight:500;opacity:.85;margin-left:4px}
.hero .sub{font-size:.8rem;opacity:.75;max-width:55%}
.chips{position:relative;display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.chip{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.14);backdrop-filter:blur(4px);border-radius:999px;padding:6px 11px;font-size:.8rem;font-weight:500}
.tiles{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.tile{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 14px;position:relative;overflow:hidden}
.tile .t{display:flex;align-items:center;gap:6px;color:var(--mut);font-size:.78rem}
.tile .v{font-size:1.45rem;font-weight:700;margin-top:6px}
.tile .v small{font-size:.8rem;font-weight:500;color:var(--mut);margin-left:3px}
.tile .g{font-size:.78rem;color:var(--mut);margin-top:2px;display:flex;gap:5px;align-items:center}
.tile .g .ic{color:var(--amber)}
.tile::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--a,var(--teal))}
.legend{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;font-size:.78rem;color:var(--mut)}
.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.rooms{display:grid;grid-template-columns:1fr;gap:14px}
.room{display:grid;gap:12px;position:relative}
.rh{display:flex;align-items:center;gap:12px}
.rico{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;color:#fff;flex:none;border:0;position:relative}
button.rico{cursor:pointer;outline:2px dashed rgba(255,255,255,.55);outline-offset:2px}
button.rico::after{content:"";position:absolute;right:-5px;bottom:-5px;width:18px;height:18px;border-radius:50%;background:var(--card);border:1px solid var(--line)}
.rico .pen{position:absolute;right:-4px;bottom:-4px;width:16px;height:16px;color:var(--primary-text-color);z-index:1;display:grid;place-items:center}
.rn{flex:1;min-width:0}
.rn b{font-size:1.05rem;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:.76rem;font-weight:600;margin-top:3px;color:var(--c)}
.pill::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--c);box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 25%,transparent)}
.green{--c:var(--green)}.amber{--c:var(--amber)}.slate{--c:var(--slate)}.gray{--c:var(--gray)}
.sw{width:46px;height:26px;border-radius:999px;background:var(--line);position:relative;border:0;cursor:pointer;flex:none;transition:.2s}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:.2s}
.sw.on{background:var(--teal)}.sw.on::after{left:23px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.box{border-radius:14px;padding:11px 12px;background:color-mix(in srgb,var(--c,var(--gray)) 12%,transparent);border:1px solid color-mix(in srgb,var(--c,var(--gray)) 30%,transparent);min-width:0}
.box .t{display:flex;align-items:center;gap:7px;font-size:.78rem;color:var(--mut)}
.box .t .ic{color:var(--c,var(--mut))}
.box .v{font-weight:700;font-size:1rem;margin-top:5px}
.box .s{font-size:.75rem;color:var(--mut);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.plan{border-top:1px solid var(--line);padding-top:12px;display:grid;gap:8px}
.ph{display:flex;align-items:center;gap:8px}
.pt{display:flex;gap:7px;align-items:center;font-weight:600;font-size:.9rem;flex:1}
.pt .ic{color:var(--teal)}
.ph .pill{margin:0}
.ibtn{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:10px;border:1px solid var(--line);background:transparent;cursor:pointer;color:var(--primary-text-color);flex:none}
.pnow{font-size:.82rem;color:var(--mut)}.pnow b{color:var(--primary-text-color)}
.tlw{position:relative}
.tl{display:flex;height:14px;border-radius:7px;overflow:hidden;background:var(--line)}
.tl i{display:block;height:100%}
.tlw b{position:absolute;top:-4px;bottom:-4px;width:3px;margin-left:-1.5px;border-radius:2px;background:#fff;box-shadow:0 0 0 2px rgba(0,0,0,.4)}
.tla{display:flex;justify-content:space-between;font-size:.68rem;color:var(--mut);margin-top:3px;padding:0 1px}
.off .tl,.off .pnow{opacity:.45}
.plnk{display:flex;flex-wrap:wrap;gap:2px 22px}
.lnk{background:none;border:0;color:var(--teal);font-weight:600;font-size:.86rem;cursor:pointer;padding:6px 2px;display:inline-flex;gap:6px;align-items:center;text-align:left}
.foot{display:flex;align-items:center;gap:12px;border-top:1px solid var(--line);padding-top:12px}
.foot .a{flex:1;min-width:0}
.foot .a b{font-size:1.1rem}
.foot .a span{display:block;font-size:.76rem;color:var(--mut);margin-top:2px}
.note{text-align:center;color:var(--mut);font-size:.76rem;padding:2px 10px}
.empty{text-align:center;color:var(--mut);padding:40px 10px}
/* Dialoge */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:20}
.sheet{position:fixed;z-index:21;left:0;right:0;bottom:0;max-height:90vh;overflow:auto;background:var(--card);border-radius:22px 22px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line);box-shadow:0 -10px 40px rgba(0,0,0,.45)}
.sh{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.sh>div{flex:1}.sh b{font-size:1.15rem;display:block}.sh span{font-size:.82rem;color:var(--mut)}
.row{display:flex;align-items:center;justify-content:space-between;padding:6px 0 12px;font-weight:600}
.dchips{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 10px}
.dc{border:1px solid var(--line);background:transparent;border-radius:999px;min-width:38px;padding:6px 8px;font-size:.8rem;font-weight:600;cursor:pointer;color:var(--mut)}
.dc.sel{background:var(--teal);border-color:var(--teal);color:#042f2e}
.dchips.sm .dc{min-width:34px;padding:5px 6px;font-size:.74rem}
.mut{color:var(--mut)}.sm{font-size:.76rem;margin:4px 0 12px}
.seg{display:flex;border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-bottom:12px}.seg button{flex:1;background:transparent;border:0;padding:9px 6px;font-weight:600;font-size:.84rem;cursor:pointer;color:var(--mut)}.seg button.sel{background:var(--teal);color:#042f2e}
.quick{display:flex;flex-wrap:wrap;gap:4px 16px;margin:0 0 2px}.quick .lnk{font-size:.78rem;padding:2px 0}
.sp{border:1px solid var(--line);border-radius:14px;padding:11px;margin-bottom:10px;background:color-mix(in srgb,var(--primary-background-color) 55%,transparent)}
.sp1{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.sp input[type=time]{background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:8px 10px;font:inherit;font-size:1.05rem;font-weight:700;width:112px}
.step{display:flex;align-items:center;gap:8px;flex:1;justify-content:center}
.step button{width:34px;height:34px;border-radius:50%;border:1px solid var(--line);background:transparent;cursor:pointer;display:grid;place-items:center}
.step b{min-width:72px;text-align:center;font-size:1.05rem}
.btns{display:flex;justify-content:space-between;gap:10px;margin:2px 0 12px}
.foot2{display:flex;gap:10px}
.btn2{flex:1;border-radius:14px;border:1px solid var(--line);background:transparent;padding:12px;font-weight:700;cursor:pointer}
.btn2.pri{background:var(--teal);border-color:var(--teal);color:#042f2e}
.igrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:6px 0 12px}
.igrid button{border:1px solid var(--line);background:transparent;border-radius:14px;padding:10px 2px 8px;display:grid;gap:5px;justify-items:center;font-size:.68rem;color:var(--mut);cursor:pointer}
.igrid button.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 14%,transparent);color:var(--primary-text-color)}
.igrid button.sel .ic{color:var(--teal)}
.toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:60;background:#111827;color:#fff;border:1px solid #334155;padding:10px 16px;border-radius:999px;font-size:.86rem;box-shadow:0 8px 24px rgba(0,0,0,.4)}
.pres h2{margin-bottom:12px}
.seg3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.seg3 button{display:grid;justify-items:center;gap:5px;padding:11px 4px;border-radius:14px;border:1px solid var(--line);background:transparent;font-weight:600;font-size:.8rem;color:var(--mut);cursor:pointer}
.seg3 button[disabled]{cursor:default;opacity:.7}
.seg3 button.sel{background:color-mix(in srgb,var(--teal) 16%,transparent);border-color:var(--teal);color:var(--primary-text-color)}
.seg3 button.sel .ic{color:var(--teal)}
.pstat{font-size:.88rem;color:var(--mut);margin-bottom:10px}.pstat b{color:var(--primary-text-color)}
.pers{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.per{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line);border-radius:999px;padding:5px 12px;font-size:.8rem}
.per i{width:9px;height:9px;border-radius:50%;background:var(--gray)}.per.home i{background:var(--green)}
.pnote{display:flex;gap:8px;align-items:center;font-size:.8rem;color:var(--amber);background:color-mix(in srgb,var(--amber) 12%,transparent);border-radius:10px;padding:7px 10px}
.sheet input[type=date]{background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:8px;font:inherit;font-size:.95rem}
.vrow{display:flex;gap:10px;align-items:center;justify-content:space-between;margin:10px 0}
.vrow>span{font-size:.92rem}
.pl{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.why{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--line);background:transparent;border-radius:999px;padding:2px 9px;font-size:.72rem;color:var(--mut);cursor:pointer;margin-top:3px}
.why-l{display:grid;gap:11px;margin:6px 0 14px}
.wl{display:flex;gap:10px;align-items:flex-start;font-size:.92rem}.wl i{flex:none;width:10px;height:10px;border-radius:50%;margin-top:6px}
.wl.ok i{background:var(--green)}.wl.warn i{background:var(--amber)}.wl.info i{background:var(--gray)}
@media(max-width:520px){.pillbtn .bl{display:none}.pillbtn{padding:8px}.brand .tag{display:none}.brand b{font-size:.94rem}.brand{gap:8px}.hero .hlogo{width:42px;height:42px;right:12px;bottom:12px}.hero .chips{padding-right:50px}.brand .ver::before{content:""!important}.brand .logo{width:34px;height:34px}}
@media(min-width:720px){.tiles{grid-template-columns:repeat(4,1fr)}.rooms{grid-template-columns:repeat(2,1fr)}.hero .big{font-size:3.3rem}
  .hero .art{top:50%;transform:translateY(-50%);height:88%;max-height:190px;max-width:34%;right:84px}.hero .hlogo{width:60px;height:60px;right:20px;bottom:18px}.hero .chips{padding-right:0}.hero .lbl{max-width:none}
  .sheet{left:50%;right:auto;bottom:auto;top:50%;transform:translate(-50%,-50%);width:min(580px,92vw);border-radius:22px;max-height:86vh}}
@media(min-width:1080px){.rooms{grid-template-columns:repeat(3,1fr)}}

.grp{display:grid;gap:10px;min-width:0;max-width:100%}.grp>*{min-width:0}
.grp+.grp{margin-top:22px}
.gh{display:flex;align-items:center;gap:12px;padding:2px 2px}
.gico{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;flex:none;color:#fff;background:linear-gradient(135deg,#14b8a6,#0e6a82)}
.gn{flex:1;min-width:0}.gn b{display:block;font-size:1.05rem;line-height:1.2}
.gn span{display:block;font-size:.76rem;color:var(--mut)}
.gtog,.gedit,.gmv{border:1px solid var(--line);background:transparent;border-radius:10px;width:34px;height:34px;display:grid;place-items:center;cursor:pointer;color:var(--primary-text-color);flex:none}
.gtog{transition:transform .2s}.grp.col .gtog{transform:rotate(-90deg)}
.gmv.up .ic{transform:rotate(180deg)}.gmv[disabled]{opacity:.35;cursor:default}
.gmini{display:flex;flex-wrap:wrap;gap:8px}
.gm{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);background:var(--card);border-radius:999px;padding:7px 12px;font-size:.84rem}
.gm i{width:9px;height:9px;border-radius:50%;background:var(--c);box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 25%,transparent)}
.gm small{color:var(--mut)}
.gadd{border:1.5px dashed var(--line);background:transparent;border-radius:16px;padding:14px;color:var(--teal);font-weight:600;cursor:pointer;display:flex;gap:8px;align-items:center;justify-content:center;margin-top:10px;width:100%}
.gsw{display:flex;align-items:center;gap:8px;flex:none;font-size:.72rem;color:var(--mut)}
.gsw span{display:none}
@media(min-width:720px){.gsw span{display:inline}}
.gname{width:100%;background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:12px;padding:11px 12px;font:inherit;font-size:1rem;margin:4px 0 12px}
.gicons{display:flex;gap:8px;margin:4px 0 12px}
.gicons button{width:46px;height:46px;border-radius:14px;border:1px solid var(--line);background:transparent;color:var(--primary-text-color);display:grid;place-items:center;cursor:pointer}
.gicons button.sel{background:var(--teal);border-color:var(--teal);color:#042f2e}
.btn2.del{flex:0 0 auto;color:#f87171;border-color:color-mix(in srgb,#f87171 40%,var(--line))}
.sheet.wide{padding-bottom:calc(14px + env(safe-area-inset-bottom,0px))}
@media(min-width:720px){.sheet.wide{width:min(780px,94vw)}}
.rdays{display:flex;gap:2px;overflow-x:auto;margin:0 -6px 8px;padding:2px 6px 6px;scrollbar-width:none}
.rdays::-webkit-scrollbar{display:none}
.rd{flex:none;width:44px;border:0;background:transparent;border-radius:14px;padding:4px 0 2px;cursor:pointer;color:var(--mut);display:grid;justify-items:center;gap:3px}
.rd small{font-size:.72rem;font-weight:600}
.rd b{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;font-size:.95rem;color:var(--primary-text-color);font-weight:600}
.rd.sel b{background:var(--teal);color:#042f2e}
.rd.today small::after{content:"•";margin-left:2px;color:var(--teal)}
.rtiles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:2px 0 10px}
.rtiles .tile{padding:10px 12px 10px 14px;border-radius:14px}
.rtiles .tile .v{font-size:1.2rem;margin-top:4px}
.rtiles .tile .g{font-size:.72rem}
.rleg{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:.76rem;color:var(--mut);margin:4px 0 6px}
.rleg span{display:inline-flex;align-items:center;gap:6px}
.rleg i{display:inline-block;width:16px;height:0;border-top:2.5px solid var(--c)}
.rleg i.d{border-top-style:dashed;border-top-width:2px}
.rleg i.b{height:10px;width:14px;border:0;border-radius:3px;background:color-mix(in srgb,var(--c) 28%,transparent)}
.rleg i.o{width:10px;height:10px;border:2.2px solid var(--c);border-radius:50%;background:var(--card)}
.rwrap{position:relative;touch-action:pan-y;user-select:none;-webkit-user-select:none}
.rchart{display:block;width:100%;height:auto;cursor:crosshair}
.rtip{position:absolute;top:6px;transform:translateX(-50%);background:var(--primary-background-color);border:1px solid var(--line);border-radius:12px;padding:8px 12px;box-shadow:0 8px 24px rgba(0,0,0,.35);pointer-events:none;min-width:128px;font-size:.76rem;color:var(--mut)}
.rtip b{display:block;font-size:1.25rem;color:var(--primary-text-color);margin:1px 0 3px}
.rtip .st{display:flex;align-items:center;gap:6px;color:var(--primary-text-color);font-size:.78rem;font-weight:600}
.rtip .st i{width:8px;height:8px;border-radius:50%;background:var(--c)}
.rtip .wo{margin-top:3px;color:#60a5fa;font-weight:600}
.rbar{display:flex;height:10px;border-radius:6px;overflow:hidden;background:var(--line);margin:6px 0 2px}
.rbar i{display:block;height:100%}
.rev{display:grid;gap:0;margin:6px 0 4px}
.rev>div{display:grid;grid-template-columns:48px 14px 1fr;gap:8px;align-items:start;padding:7px 0;border-top:1px solid var(--line);font-size:.86rem}
.rev>div:first-child{border-top:0}
.rev time{color:var(--mut);font-variant-numeric:tabular-nums}
.rev i{width:10px;height:10px;border-radius:50%;background:var(--c);margin-top:5px}
.rev small{display:block;color:var(--mut);font-size:.74rem;margin-top:1px}
.rnav{display:flex;justify-content:space-between;margin-top:6px}
.rmsg{padding:34px 8px;text-align:center;color:var(--mut);font-size:.9rem;border:1px dashed var(--line);border-radius:14px;margin:6px 0 8px}
`;

class FensterHeizungPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._narrow = false; this._edit = false; this._modal = null; this._dragging = false;
    this._cfg = { layout: { blocks: [], rooms: [], icons: {}, groups: [] }, plans: {}, presence: { mode: "home" } };
  }
  connectedCallback() {
    this._ro = new ResizeObserver(() => { if (this._hass && !this._dragging && Math.abs(this.clientWidth - (this._w || 0)) > 24) this._render(); });
    this._ro.observe(this);
  }
  disconnectedCallback() { this._ro && this._ro.disconnect(); }
  set hass(h) {
    const first = !this._hass;
    this._hass = h;
    if (first) this._load();
    this._render();
    if (this._modal && this._modal.type === "why") this._renderModal();  // Gründe bleiben aktuell
  }
  set narrow(v) { this._narrow = v; this._render(); }
  set panel(_) {}
  set route(_) {}

  async _load() {
    try {
      const r = await this._hass.callWS({ type: "fenster_heizung/get_state" });
      this._cfg = { layout: { blocks: [], rooms: [], icons: {}, groups: [], ...(r.layout || {}) }, plans: r.plans || {}, presence: r.presence || { mode: "home" } };
      this._ver = r.version || "";
    } catch (e) { /* älteres Backend: Standardwerte */ }
    this._render();
  }
  _admin() { return !!(this._hass && this._hass.user && this._hass.user.is_admin); }
  _saveLayout() { this._hass.callWS({ type: "fenster_heizung/set_layout", layout: this._cfg.layout }).catch(() => this._toast("Layout konnte nicht gespeichert werden")); }
  _toast(msg) {
    const t = this.shadowRoot.getElementById("toast"); if (!t) return;
    t.innerHTML = `<div class="toast">${esc(msg)}</div>`; clearTimeout(this._tt);
    this._tt = setTimeout(() => (t.innerHTML = ""), 2600);
  }

  _collect() {
    const h = this._hass, rooms = new Map();
    for (const [eid, ent] of Object.entries(h.entities || {})) {
      if (ent.platform !== "fenster_heizung") continue;
      const st = h.states[eid];
      if (!st) continue;
      const key = ent.device_id || eid;
      let r = rooms.get(key);
      if (!r) {
        const dev = (h.devices || {})[key] || {};
        r = { id: key, name: dev.name_by_user || dev.name || eid, sc: {}, hist: {} };
        rooms.set(key, r);
      }
      const a = st.attributes || {};
      if (eid.startsWith("switch.")) { if (a.funktion === "heizplan") { r.planOn = st.state === "on"; } else { r.sw = eid; r.on = st.state === "on"; } }
      else if (a.zeitraum) {
        r.fuel = FUELS[a.brennstoff] ? a.brennstoff : "erdgas";
        r.sc[a.zeitraum] = { min: Number(st.state) || 0, gas: Number(a.gespart_menge ?? a.gespartes_gas_m3) || 0, kwh: a.gespartes_gas_kwh || 0 };
        r.apk = Number(a.menge_pro_kwh) || r.apk || 0.1;
        if (a.zeitraum === "day") { r.pauses = a.pausen_heute || 0; r.kw = a.aktuelle_leistung_kw || 0; r.hist = a.verlauf || {}; }
      } else if ("thermostate" in a) {
        r.modeEid = eid; r.mode = st.state; r.why = a.grund || []; r.windows = a.fenster || []; r.thermos = Object.keys(a.thermostate || {}); if (a.entry_id) r.id = a.entry_id;
      }
    }
    const list = [...rooms.values()];
    [...list].sort((x, y) => x.name.localeCompare(y.name, "de")).forEach((r, i) => (r.color = COLORS[i % COLORS.length]));
    const order = this._cfg.layout.rooms || [], prio = { heizung_pausiert: 0, regelung_aktiv: 1, nur_fenstermeldung: 2, regelung_aus: 3 };
    return list.sort((x, y) => {
      const ix = order.indexOf(x.id), iy = order.indexOf(y.id);
      if (ix >= 0 && iy >= 0) return ix - iy;
      if (ix >= 0) return -1;
      if (iy >= 0) return 1;
      return (prio[x.mode] ?? 9) - (prio[y.mode] ?? 9) || x.name.localeCompare(y.name, "de");
    });
  }
  _icon(r) { return (this._cfg.layout.icons || {})[r.id] || roomIcon(r.name); }
  _blockOrder() {
    const known = Object.keys(BLOCKS), o = (this._cfg.layout.blocks || []).filter((b) => known.includes(b));
    return [...o, ...known.filter((b) => !o.includes(b))];
  }

  _days(rooms, n = 14) {
    const out = [], now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      out.push({ d, iso, v: rooms.map((r) => (i === 0 ? r.sc.day?.min || 0 : Number(r.hist[iso]) || 0)) });
    }
    return out;
  }
  _chart(rooms) {
    const days = this._days(rooms), W = Math.max(300, Math.min(1100, (this.clientWidth || 390) - 62)), H = 230, L = 36, R = 6, T = 12, B = 30;
    this._w = this.clientWidth;
    const lblStep = W < 480 ? 3 : 2;
    const tot = days.map((x) => x.v.reduce((a, b) => a + b, 0));
    const step = [30, 60, 120, 240, 480].find((s) => Math.max(...tot, 1) / s <= 4) || 480;
    const max = Math.max(Math.ceil(Math.max(...tot, 1) / step) * step, step);
    const iw = (W - L - R) / days.length, bw = iw * 0.62, y = (v) => T + (H - T - B) * (1 - v / max);
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="Pausenzeit pro Tag">`;
    for (let v = 0; v <= max; v += step) {
      s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-dasharray="${v ? "3 4" : "0"}"/>`;
      s += `<text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="12" fill="var(--mut)">${v}</text>`;
    }
    days.forEach((dd, i) => {
      const x = L + iw * i + (iw - bw) / 2; let acc = 0;
      dd.v.forEach((v, k) => {
        if (v <= 0) return;
        const y1 = y(acc + v), h = y(acc) - y1; acc += v;
        s += `<rect x="${x}" y="${y1}" width="${bw}" height="${Math.max(h, 1)}" rx="3" fill="${rooms[k].color}"/>`;
      });
      const today = i === days.length - 1, lab = (days.length - 1 - i) % lblStep === 0;
      if (lab) s += `<text x="${today ? x + bw : x + bw / 2}" y="${H - 8}" text-anchor="${today ? "end" : "middle"}" font-size="12" fill="${today ? "var(--primary-text-color)" : "var(--mut)"}" font-weight="${today ? 700 : 400}">${today ? "heute" : dd.d.toLocaleDateString("de-DE", { day: "numeric", month: "numeric" })}</text>`;
    });
    if (!tot.some(Boolean)) s += `<text x="${(L + W - R) / 2}" y="${(T + H - B) / 2}" text-anchor="middle" font-size="13" fill="var(--mut)">Noch keine Pausen in den letzten 14 Tagen</text>`;
    return s + "</svg>";
  }
  _spark(r) {
    const days = this._days([r], 7).map((x) => x.v[0]), max = Math.max(...days, 1);
    return `<svg viewBox="0 0 84 30" width="84" height="30" aria-hidden="true">${days.map((v, i) =>
      `<rect x="${i * 12 + 1}" y="${28 - Math.max((v / max) * 26, 1.5)}" width="9" height="${Math.max((v / max) * 26, 1.5)}" rx="2.5" fill="var(--teal)" opacity="${i === 6 ? 1 : 0.45}"/>`).join("")}</svg>`;
  }
  _art() {
    return `<svg class="art" viewBox="0 0 200 150" aria-hidden="true">
    <circle cx="100" cy="72" r="62" fill="rgba(255,255,255,.07)"/>
    <rect x="26" y="8" width="114" height="84" rx="9" fill="#ecfeff"/><rect x="34" y="16" width="98" height="68" rx="5" fill="#0b3b4a"/>
    <rect x="38" y="20" width="44" height="60" rx="2" fill="#bfeaf2"/><path d="M60 20v60M38 50h44" stroke="#ecfeff" stroke-width="3"/>
    <path d="M88 20l36 9v42l-36 9z" fill="#d4f3f8" stroke="#ecfeff" stroke-width="3" stroke-linejoin="round"/><path d="M88 50l36 0" stroke="#ecfeff" stroke-width="2.5"/>
    <rect x="34" y="104" width="100" height="36" rx="9" fill="#fff"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${44 + i * 15}" y="111" width="8" height="22" rx="4" fill="#0f766e"/>`).join("")}
    <circle cx="150" cy="122" r="9" fill="#f59e0b"/><circle cx="150" cy="122" r="4.5" fill="#fde68a"/>
    <g transform="translate(144 4) scale(2.2)"><path d="M12 2.5c1.1 3 5.2 5.4 5.2 10.2A5.2 5.2 0 0 1 12 18a5.2 5.2 0 0 1-5.2-5.3c0-2.2 1.2-3.6 2.4-4.8.2 1.8 1 2.8 2 3.2C11.6 8.6 10.8 5.4 12 2.5z" fill="#fb923c"/>
    <path d="M12 9c.6 1.8 2.8 2.9 2.8 5.2A2.8 2.8 0 0 1 12 17a2.8 2.8 0 0 1-2.8-2.8c0-1.2.7-2 1.3-2.6.1 1 .5 1.5 1 1.8C11.4 11.3 11 10 12 9z" fill="#fde047"/></g>
    <path d="M150 50l36 36" stroke="#ecfeff" stroke-width="4" stroke-linecap="round"/></svg>`;
  }

  _pres() { return { mode: "home", temp: 16, preheat: true, preheat_time: "12:00", auto: true, persons: [], away_after: 30, ...(this._cfg.presence || {}) }; }
  _away() { const p = this._pres(); return (p.effective ?? p.mode) !== "home"; }
  _fmtD(iso) { return iso ? new Date(iso + "T12:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }) : "–"; }

  /* ---------------- Gruppen ---------------- */
  _collapsed() {
    try { return new Set(JSON.parse(localStorage.getItem("fh_collapsed") || "[]")); } catch (_) { return new Set(); }
  }
  _setCollapsed(set) { try { localStorage.setItem("fh_collapsed", JSON.stringify([...set])); } catch (_) { /* Speicher gesperrt */ } }
  _groupsHtml(rooms) {
    const groups = (this._cfg.layout.groups || []).filter((g) => g && g.name), edit = this._edit, adm = this._admin();
    const addBtn = edit && adm ? `<button class="gadd" data-act="gadd">${ic("plus", 18)}Gruppe hinzufügen</button>` : "";
    if (!groups.length) return `<div class="rooms" data-sort-container="room">${rooms.map((r) => this._room(r)).join("")}</div>${addBtn}`;
    const used = new Set(groups.flatMap((g) => g.rooms || [])), rest = rooms.filter((r) => !used.has(r.id)), col = this._collapsed();
    const list = groups.map((g) => ({ ...g, members: rooms.filter((r) => (g.rooms || []).includes(r.id)) }));
    if (rest.length) list.push({ id: "_rest", name: "Weitere Räume", icon: "home", members: rest, fixed: true });
    const dot = { green: "#34d399", amber: "#f59e0b", slate: "#7dd3fc", gray: "#94a3b8" };
    const html = list.map((g, gi) => {
      const m = g.members, paused = m.filter((r) => r.mode === "heizung_pausiert").length, min = m.reduce((a, r) => a + (r.sc.day?.min || 0), 0);
      const fs = new Set(m.map((r) => r.fuel || "erdgas")), amount = fs.size === 1 ? `${num(m.reduce((a, r) => a + (r.sc.day?.gas || 0), 0), 2)} ${FUELS[[...fs][0]].label}` : `${num(m.reduce((a, r) => a + (r.sc.day?.kwh || 0), 0), 1)} kWh Wärme`;
      const allOn = m.length > 0 && m.every((r) => r.on), closed = col.has(g.id);
      const stat = m.length ? `${m.length} ${m.length === 1 ? "Raum" : "Räume"} · ${paused ? paused + " pausiert" : "alle aktiv"} · ${num(min)} Min. · ${amount}` : "Noch keine Räume";
      const mv = edit && adm && !g.fixed ? `<button class="gmv up" data-act="gmv" data-g="${esc(g.id)}" data-dir="-1" ${gi === 0 ? "disabled" : ""} aria-label="Gruppe nach oben">${ic("chev", 16)}</button><button class="gmv" data-act="gmv" data-g="${esc(g.id)}" data-dir="1" ${gi >= groups.length - 1 ? "disabled" : ""} aria-label="Gruppe nach unten">${ic("chev", 16)}</button><button class="gedit" data-act="gedit" data-g="${esc(g.id)}" aria-label="Gruppe bearbeiten">${ic("pencil", 16)}</button>` : "";
      const body = !m.length ? "" : closed
        ? `<div class="gmini">${m.map((r) => { const t = (r.thermos || []).map((e) => this._hass.states[e]).filter(Boolean)[0]?.attributes.current_temperature; return `<span class="gm" style="--c:${dot[(MODE[r.mode] || MODE.regelung_aus).c]}"><i></i>${esc(r.name)}${t != null ? `<small>${num(t, 1)} °C</small>` : ""}</span>`; }).join("")}</div>`
        : `<div class="rooms" data-sort-container="room">${m.map((r) => this._room(r)).join("")}</div>`;
      return `<section class="grp ${closed ? "col" : ""}" data-gid="${esc(g.id)}"><div class="gh">
        <span class="gico">${ic(g.icon || "layers", 20)}</span><div class="gn"><b>${esc(g.name)}</b><span>${stat}</span></div>${mv}
        ${m.some((r) => r.sw) ? `<div class="gsw"><span>Fensterregelung</span><button class="sw ${allOn ? "on" : ""}" data-act="gsw" data-g="${esc(g.id)}" aria-label="Fensterregelung der Gruppe ${esc(g.name)} umschalten" aria-pressed="${allOn}"></button></div>` : ""}
        <button class="gtog" data-act="gtog" data-g="${esc(g.id)}" aria-label="Gruppe ein- oder ausklappen" aria-expanded="${!closed}">${ic("chev", 18)}</button></div>${body}</section>`;
    }).join("");
    return html + addBtn;
  }
  _gActions(a, b) {
    const L = this._cfg.layout; L.groups = L.groups || [];
    if (a === "gtog") { const c = this._collapsed(), id = b.dataset.g; c.has(id) ? c.delete(id) : c.add(id); this._setCollapsed(c); this._render(); }
    else if (a === "gsw") {
      const rooms = this._collect(), g = L.groups.find((x) => x.id === b.dataset.g);
      const ids = g ? g.rooms : rooms.filter((r) => !L.groups.some((x) => x.rooms.includes(r.id))).map((r) => r.id);
      const mem = rooms.filter((r) => ids.includes(r.id) && r.sw), all = mem.every((r) => r.on);
      if (mem.length) this._hass.callService("switch", all ? "turn_off" : "turn_on", { entity_id: mem.map((r) => r.sw) });
    }
    else if (a === "gmv") {
      const i = L.groups.findIndex((x) => x.id === b.dataset.g), j = i + +b.dataset.dir;
      if (i >= 0 && L.groups[j]) { [L.groups[i], L.groups[j]] = [L.groups[j], L.groups[i]]; this._saveLayout(); this._render(); }
    }
    else if (a === "gedit" || a === "gadd") {
      const g = a === "gedit" ? L.groups.find((x) => x.id === b.dataset.g) : null;
      this._modal = { type: "grp", draft: g ? { ...g, rooms: [...g.rooms] } : { id: "g" + Date.now().toString(36).slice(-8), name: "", icon: GROUP_ICONS[0], rooms: [], isNew: true } };
      this._renderModal();
    }
    else if (a === "gpick") { const d = this._modal.draft, id = b.dataset.r; d.rooms = d.rooms.includes(id) ? d.rooms.filter((x) => x !== id) : [...d.rooms, id]; this._renderModal(); }
    else if (a === "gicon") { this._modal.draft.icon = b.dataset.k; this._renderModal(); }
    else if (a === "gsave") {
      const d = this._modal.draft; d.name = (d.name || "").trim();
      if (!d.name) { this._toast("Bitte einen Namen eingeben"); return; }
      L.groups.forEach((x) => (x.rooms = x.rooms.filter((r) => !d.rooms.includes(r))));
      const i = L.groups.findIndex((x) => x.id === d.id), { isNew, ...clean } = d;
      if (i >= 0) L.groups[i] = clean; else L.groups.push(clean);
      this._saveLayout(); this._modal = null; this._renderModal(); this._render();
    }
    else if (a === "gdel") { L.groups = L.groups.filter((x) => x.id !== this._modal.draft.id); this._saveLayout(); this._modal = null; this._renderModal(); this._render(); }
  }

  /* ---------------- Bericht ---------------- */
  _repDays(n = 14) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); out.push({ iso: this._isoDay(-i), d, today: i === 0 }); }
    return out;
  }
  _repOpen(id) { this._modal = { type: "rep", id, day: this._isoDay(0), keepScroll: 99999 }; this._repLoad(this._modal); this._renderModal(); }
  async _repLoad(m) {
    const r = this._collect().find((x) => x.id === m.id); if (!r) return;
    const day = m.day, [y, mo, d] = day.split("-").map(Number), start = new Date(y, mo - 1, d), nextDay = new Date(y, mo - 1, d + 1), end = new Date(Math.min(+nextDay, Date.now()));
    this._repCache = this._repCache || new Map();
    const key = m.id + "|" + day, hit = this._repCache.get(key);
    if (hit && (day !== this._isoDay(0) ? true : Date.now() - hit.at < 60000)) { m.data = hit.data; m.error = null; m.loading = false; return; }
    const tok = (this._repTok = (this._repTok || 0) + 1);
    m.loading = true; m.data = null; m.error = null; m.tok = tok;
    const ids = [...(r.thermos || []), ...(r.windows || []), ...(r.modeEid ? [r.modeEid] : [])];
    try {
      const res = await this._hass.callWS({ type: "history/history_during_period", start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: ids, include_start_time_state: true, significant_changes_only: false, minimal_response: false, no_attributes: false });
      if (m.tok !== tok) return;
      m.data = this._repBuild(r, res || {}, start, end);
      this._repCache.set(key, { at: Date.now(), data: m.data });
    } catch (e) {
      if (m.tok !== tok) return;
      m.error = "Der Verlauf konnte nicht aus Home Assistant geladen werden.";
    }
    m.loading = false;
    if (this._modal === m) this._renderModal();
  }
  _repBuild(r, res, start, end) {
    const t0 = +start / 1000, endMin = Math.max(5, Math.floor((+end - +start) / 60000));
    const ser = (eid) => { let a = {}; return (res[eid] || []).map((x) => { if (x.a) a = x.a; return { t: Math.max(0, ((x.lu ?? x.lc ?? t0) - t0) / 60), s: x.s, a }; }); };
    const at = (list, t) => { let v = null; for (const x of list) { if (x.t <= t) v = x; else break; } return v; };
    const th = (r.thermos || []).map(ser), wins = (r.windows || []).map((e) => ({ e, list: ser(e), name: this._hass.states[e]?.attributes.friendly_name || "Fenster" })), mode = r.modeEid ? ser(r.modeEid) : [];
    const num2 = (v) => (typeof v === "number" ? v : Number(v)), ok = (v) => v != null && v !== "" && Number.isFinite(num2(v));
    const pts = []; let lastTemp = null;
    for (let m = 0; m <= endMin; m += 5) {
      const ts = th.map((l) => at(l, m)).filter(Boolean), cs = ts.map((x) => x.a.current_temperature).filter(ok).map(num2);
      if (cs.length) lastTemp = cs.reduce((a, b) => a + b, 0) / cs.length;
      const md = at(mode, m), paused = !!md && md.s === "heizung_pausiert";
      const tg = ts.filter((x) => x.s !== "off" && x.s !== "unavailable").map((x) => x.a.temperature).filter(ok).map(num2);
      const w = wins.find((x) => at(x.list, m)?.s === "on");
      if (lastTemp != null) pts.push({ t: m, temp: Math.round(lastTemp * 10) / 10, tgt: !paused && tg.length ? tg.reduce((a, b) => a + b, 0) / tg.length : null, paused, open: w ? w.name : null });
    }
    const intervals = (list, on) => { const out = []; let cur = null; for (const x of list) { if (on(x)) { if (!cur) cur = [x.t, endMin]; } else if (cur) { cur[1] = x.t; out.push(cur); cur = null; } } if (cur) out.push(cur); return out; };
    const pauses = intervals(mode, (x) => x.s === "heizung_pausiert").filter(([a, b]) => b > a);
    const opens = []; wins.forEach((w) => intervals(w.list, (x) => x.s === "on").forEach(([a, b]) => b > a && opens.push({ s: a, e: b, name: w.name })));
    opens.sort((a, b) => a.s - b.s);
    const hh = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(Math.floor(m) % 60).padStart(2, "0")}`, ev = [];
    for (const o of opens) {
      ev.push({ t: o.s, c: "#60a5fa", x: `${o.name} geöffnet`, y: "Offenes Fenster erkannt" });
      if (o.e < endMin || !(Date.now() - +end < 90000)) ev.push({ t: o.e, c: "#60a5fa", x: `${o.name} geschlossen`, y: `${Math.round(o.e - o.s)} Min. offen` });
    }
    for (const [a, b] of pauses) { ev.push({ t: a, c: "#f59e0b", x: "Heizung pausiert", y: "wegen offenem Fenster" }); if (b < endMin) ev.push({ t: b, c: "#34d399", x: "Heizung wieder aktiv", y: "Fenster geschlossen" }); }
    let prev = null;
    for (const p of pts) { if (p.tgt != null) { if (prev != null && Math.abs(p.tgt - prev) >= 0.25) ev.push({ t: p.t, c: "#2dd4bf", x: `Solltemperatur ${num(p.tgt, 1)} °C`, y: "Heizplan oder Änderung am Thermostat" }); prev = p.tgt; } }
    ev.sort((a, b) => a.t - b.t).forEach((e) => (e.h = hh(e.t)));
    const temps = pts.map((p) => p.temp), pm = pauses.reduce((a, [x, y]) => a + (y - x), 0), openMin = opens.reduce((a, o) => a + (o.e - o.s), 0);
    return { pts, pauses, opens, ev, end: endMin, pm, openMin, kwh: pm / 60 * (r.kw || 0), apk: r.apk || 0.1, fuel: r.fuel || "erdgas",
      avg: temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : 0, min: temps.length ? Math.min(...temps) : 0, max: temps.length ? Math.max(...temps) : 0 };
  }
  _repHover(min) {
    const d = this._repData; if (!d || !d.pts.length) return;
    const sr = this.shadowRoot, g = this._repGeo, p = d.pts.reduce((a, q) => (Math.abs(q.t - min) < Math.abs(a.t - min) ? q : a), d.pts[0]);
    const x = g.x(p.t), y = g.y(p.temp), xl = sr.getElementById("rxl"), c = sr.getElementById("rxc"), tip = sr.getElementById("rtip");
    if (xl) { xl.setAttribute("x1", x); xl.setAttribute("x2", x); }
    if (c) { c.setAttribute("cx", x); c.setAttribute("cy", y); }
    if (!tip) return;
    const hh = `${String(Math.floor(p.t / 60)).padStart(2, "0")}:${String(p.t % 60).padStart(2, "0")}`;
    tip.style.left = Math.min(Math.max(x / g.W * 100, 17), 83) + "%";
    tip.innerHTML = `${hh} Uhr<b>${num(p.temp, 1)} °C</b><div class="st" style="--c:${p.paused ? "#f59e0b" : "#34d399"}"><i></i>${p.paused ? "Heizung pausiert" : p.tgt != null ? "Ziel " + num(p.tgt, 1) + " °C" : "Thermostat aus"}</div>${p.open ? `<div class="wo">${esc(p.open)} offen</div>` : ""}`;
  }
  _repChart(d) {
    const cw = this.clientWidth || 390, avail = cw >= 720 ? Math.min(780, cw * 0.94) : cw, W = Math.max(300, Math.min(748, Math.floor(avail - 32))), H = W < 500 ? 250 : 300, L = 34, R = 10, T = 12, B = 26;
    const iw = W - L - R, ih = H - T - B, vals = d.pts.flatMap((p) => (p.tgt != null ? [p.temp, p.tgt] : [p.temp]));
    let lo = Math.floor(Math.min(...vals) - 1), hi = Math.ceil(Math.max(...vals) + 1); if (hi - lo < 6) { lo -= 2; hi += 2; }
    const x = (m) => L + iw * m / 1440, y = (v) => T + ih * (1 - (v - lo) / (hi - lo));
    this._repGeo = { W, x, y, L, iw };
    let s = `<svg class="rchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Temperaturverlauf"><defs><linearGradient id="rag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2dd4bf" stop-opacity=".34"/><stop offset="1" stop-color="#2dd4bf" stop-opacity="0"/></linearGradient></defs>`;
    for (let v = Math.ceil(lo / 2) * 2; v <= hi; v += 2) s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="var(--mut)">${v}°</text>`;
    for (const h of [0, 6, 12, 18, 24]) s += `<line x1="${x(h * 60)}" x2="${x(h * 60)}" y1="${T}" y2="${T + ih}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${x(h * 60)}" y="${H - 8}" text-anchor="${h === 0 ? "start" : h === 24 ? "end" : "middle"}" font-size="11" fill="var(--mut)">${String(h).padStart(2, "0")}:00</text>`;
    for (const [a, b] of d.pauses) s += `<rect x="${x(a)}" y="${T}" width="${Math.max(2, x(b) - x(a))}" height="${ih}" fill="#f59e0b" opacity=".16"/>`;
    let tp = "", open = false, py = null;
    for (const p of d.pts) {
      if (p.tgt == null) { open = false; py = null; continue; }
      if (!open) { tp += `M${x(p.t).toFixed(1)} ${y(p.tgt).toFixed(1)} `; open = true; }
      else { if (py !== p.tgt) tp += `L${x(p.t).toFixed(1)} ${y(py).toFixed(1)} `; tp += `L${x(p.t).toFixed(1)} ${y(p.tgt).toFixed(1)} `; }
      py = p.tgt;
    }
    if (tp) s += `<path d="${tp}" fill="none" stroke="#7dd3fc" stroke-width="1.8" stroke-dasharray="5 4" opacity=".9"/>`;
    const line = d.pts.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)} ${y(p.temp).toFixed(1)}`).join(" "), last = d.pts[d.pts.length - 1];
    s += `<path d="${line} L${x(last.t)} ${T + ih} L${x(d.pts[0].t)} ${T + ih} Z" fill="url(#rag)"/><path d="${line}" fill="none" stroke="#2dd4bf" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`;
    for (const o of d.opens) { const p = d.pts.find((q) => q.t >= o.s) || last; s += `<circle cx="${x(o.s)}" cy="${y(p.temp)}" r="5" fill="var(--card)" stroke="#60a5fa" stroke-width="2.4"/>`; }
    s += `<line id="rxl" x1="0" x2="0" y1="${T}" y2="${T + ih}" stroke="var(--mut)" opacity=".7"/><circle id="rxc" r="5.5" cx="0" cy="0" fill="var(--card)" stroke="#2dd4bf" stroke-width="2.4"/></svg>`;
    return s;
  }
  _repBody(r, m) {
    const days = this._repDays(), idx = days.findIndex((x) => x.iso === m.day), d = m.data;
    const head = `<div class="rdays">${days.map((x) => `<button class="rd ${x.iso === m.day ? "sel" : ""} ${x.today ? "today" : ""}" data-act="repday" data-d="${x.iso}" aria-label="${x.d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}"><small>${"SMDMDFS"[x.d.getDay()]}</small><b>${x.d.getDate()}</b></button>`).join("")}</div>`;
    const nav = `<div class="rnav"><button class="lnk" data-act="repnav" data-s="-1" ${idx <= 0 ? "disabled style=\"opacity:.4\"" : ""}>‹ Vorheriger Tag</button><button class="lnk" data-act="repnav" data-s="1" ${idx >= days.length - 1 ? "disabled style=\"opacity:.4\"" : ""}>Nächster Tag ›</button></div>`;
    this._repData = null;
    if (m.loading) return head + `<div class="rmsg">Verlauf wird geladen …</div>` + nav;
    if (m.error) return head + `<div class="rmsg">${esc(m.error)}</div>` + nav;
    if (!d || !d.pts.length) return head + `<div class="rmsg">Für diesen Tag liegen keine Verlaufsdaten vor.<br><span class="sm">Der Bericht nutzt den Verlauf (Recorder) von Home Assistant. Er reicht so weit zurück, wie dort Daten aufbewahrt werden.</span></div>` + nav;
    this._repData = d;
    const F = FUELS[d.fuel] || FUELS.erdgas, bar = []; let prev = null;
    for (const p of d.pts) { const k = p.paused ? "p" : "a"; if (prev && prev.k === k) prev.n += 5; else bar.push((prev = { k, n: 5 })); }
    return head + `<div class="rtiles">
        <div class="tile" style="--a:#2dd4bf"><div class="t">${ic("thermo", 15)}Ø Temperatur</div><div class="v">${num(d.avg, 1)}<small>°C</small></div><div class="g">${num(d.min, 1)} – ${num(d.max, 1)} °C</div></div>
        <div class="tile" style="--a:#f59e0b"><div class="t">${ic("radiator", 15)}Pausiert</div><div class="v">${num(d.pm)}<small>Min.</small></div><div class="g">${ic("flame", 13)}~${num(d.kwh * d.apk, 2)} ${F.label.split(" ")[0]}</div></div>
        <div class="tile" style="--a:#60a5fa"><div class="t">${ic("windowOpen", 15)}Fenster offen</div><div class="v">${d.opens.length}<small>×</small></div><div class="g">${num(d.openMin)} Min. gesamt</div></div>
      </div>
      <div class="rleg"><span style="--c:#2dd4bf"><i></i>Temperatur</span><span style="--c:#7dd3fc"><i class="d"></i>Ziel (Thermostat)</span><span style="--c:#f59e0b"><i class="b"></i>Heizung pausiert</span><span style="--c:#60a5fa"><i class="o"></i>Fenster geöffnet</span></div>
      <div class="rwrap" id="rwrap">${this._repChart(d)}<div class="rtip" id="rtip"></div></div>
      <div class="rbar" aria-hidden="true">${bar.map((b) => `<i style="width:${b.n / 1440 * 100}%;background:${b.k === "p" ? "#f59e0b" : "#34d399"}"></i>`).join("")}</div>
      <div class="rleg" style="margin:6px 0 0"><span style="--c:#34d399"><i class="b" style="background:#34d399"></i>Heizung aktiv</span><span style="--c:#f59e0b"><i class="b" style="background:#f59e0b"></i>pausiert wegen Fenster</span></div>
      <div class="mut sm" style="margin:14px 0 2px"><b style="color:var(--primary-text-color)">Ereignisse</b></div>
      <div class="rev">${d.ev.length ? d.ev.map((e) => `<div style="--c:${e.c}"><time>${e.h}</time><i></i><span>${esc(e.x)}<small>${esc(e.y)}</small></span></div>`).join("") : `<div style="--c:var(--line)"><time></time><i></i><span>Keine Ereignisse an diesem Tag</span></div>`}</div>` + nav;
  }

  _isoDay(add = 0) { const d = new Date(); d.setDate(d.getDate() + add); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
  _savePresence() {
    this._hass.callWS({ type: "fenster_heizung/set_presence", presence: this._cfg.presence })
      .then((r) => { this._cfg.presence = r; this._render(); })
      .catch(() => this._toast("Anwesenheit konnte nicht gespeichert werden"));
  }
  _presenceCard() {
    const p = this._pres(), h = this._hass, adm = this._admin();
    const persons = (p.persons.length ? p.persons : Object.keys(h.states).filter((e) => e.startsWith("person."))).map((e) => h.states[e]).filter(Boolean);
    const days = p.to ? Math.max(0, Math.ceil((new Date(p.to + "T23:59:59") - new Date()) / 864e5)) : 0;
    const stat = p.mode === "vacation" && p.effective === "home"
      ? `<b>Urlaub geplant:</b> ${this._fmtD(p.from)} bis ${this._fmtD(p.to)} · Absenkung ${num(p.temp, 1)} °C`
      : p.mode === "vacation"
        ? `<b>Urlaub bis ${this._fmtD(p.to)}</b> (noch ${days} Tage) · Absenkung ${num(p.temp, 1)} °C${p.preheat ? ` · Vorheizen am Rückkehrtag ab ${p.preheat_time} Uhr` : ""}`
        : p.mode === "away" ? `<b>Abwesend:</b> Räume auf ${num(p.temp, 1)} °C abgesenkt. ${p.origin === "auto" ? "Bei Rückkehr einer Person" : "Nach dem Umschalten auf „Zu Hause“"} gilt wieder der Heizplan.`
        : `<b>Zu Hause:</b> Alle Heizpläne laufen normal.${p.auto ? " Automatisch abwesend, wenn alle Personen " + p.away_after + " Min. unterwegs sind." : ""}`;
    return `<div class="card pres"><h2>${ic("home", 18)}Anwesenheit &amp; Urlaub</h2>
      <div class="seg3">${[["home", "home", "Zu Hause"], ["away", "door", "Abwesend"], ["vacation", "suitcase", "Urlaub"]].map(([k, i, l]) => `<button class="${p.mode === k ? "sel" : ""}" data-act="pm" data-k="${k}" ${adm ? "" : "disabled"}>${ic(i, 22)}${l}</button>`).join("")}</div>
      <div class="pstat">${stat}</div>
      ${persons.length ? `<div class="pers">${persons.map((s) => `<span class="per ${s.state === "home" ? "home" : ""}"><i></i>${esc(s.attributes.friendly_name || s.entity_id)} · ${s.state === "home" ? "zu Hause" : "unterwegs"}</span>`).join("")}</div>` : ""}
      ${adm ? `<div class="plnk"><button class="lnk" data-act="vac">${ic("suitcase", 16)}Urlaub planen</button><button class="lnk" data-act="pset">${ic("sliders", 16)}Einstellungen</button></div>` : ""}</div>`;
  }

  _planBox(r) {
    const p0 = this._cfg.plans[r.id] || { enabled: false, entries: [] }, p = { ...p0, enabled: r.planOn ?? p0.enabled }, pts = points(p.entries), adm = this._admin();
    const btn = adm ? `<button class="ibtn" data-act="plan" data-id="${esc(r.id)}" aria-label="Heizplan bearbeiten">${ic("pencil", 17)}</button>` : "";
    if (!pts.length) return `<div class="plan"><div class="ph"><span class="pt">${ic("plan", 18)}Heizplan</span><span class="pill gray">nicht eingerichtet</span></div>${adm ? `<button class="lnk" data-act="plan" data-id="${esc(r.id)}">${ic("plus", 16)}Heizplan einrichten</button>` : ""}</div>`;
    const now = nowMin(), today = Math.floor(now / 1440), cur = at(pts, now), nx = nextPt(pts, now), nw = nx.w % 10080, nd = Math.floor(nw / 1440);
    const when = nd === today && nx.w > now ? "heute" : nd === (today + 1) % 7 ? "morgen" : DAYS[nd];
    return `<div class="plan ${p.enabled && !this._away() ? "" : "off"}"><div class="ph"><span class="pt">${ic("plan", 18)}Heizplan</span><span class="pill ${p.enabled ? "green" : "gray"}">${p.enabled ? "aktiv" : "aus"}</span>${btn}</div>
      <div class="pnow">Jetzt <b>${num(cur, 1)} °C</b> · ab ${when} ${fmtT(nw % 1440)} Uhr <b>${num(nx.t, 1)} °C</b></div>${bar(pts, today, now)}</div>`;
  }

  _room(r) {
    const h = this._hass, m = MODE[r.mode] || MODE.regelung_aus, edit = this._edit;
    const wins = (r.windows || []).map((e) => h.states[e]).filter(Boolean), open = wins.filter((w) => ["on", "open"].includes(w.state));
    const wc = open.length ? "amber" : "green", winName = (w) => w.attributes.friendly_name || w.entity_id;
    const th = (r.thermos || []).map((e) => h.states[e]).filter(Boolean), t0 = th[0], cur = t0?.attributes.current_temperature, tgt = t0?.attributes.temperature;
    const hv = t0 ? (t0.state === "off" ? "aus" : t0.state === "heat" ? "heizt" : t0.state === "auto" ? "Automatik" : t0.state) : "–";
    const hc = !t0 ? "gray" : t0.state === "off" ? "slate" : "green";
    const d = r.sc.day || { min: 0, gas: 0, kwh: 0 };
    const icon = edit
      ? `<button class="rico" style="background:${r.color}" data-act="icon" data-id="${esc(r.id)}" aria-label="Symbol ändern">${ic(this._icon(r), 24)}<span class="pen">${ic("pencil", 11)}</span></button>`
      : `<div class="rico" style="background:${r.color}">${ic(this._icon(r), 24)}</div>`;
    return `<div class="card room" data-sort="room" data-id="${esc(r.id)}"><div class="rh">
      ${edit ? `<span class="grip" data-handle title="Verschieben">${ic("grip", 18)}</span>` : ""}${icon}
      <div class="rn"><b>${esc(r.name)}</b><div class="pl"><span class="pill ${m.c}">${m.t}</span><button class="why" data-act="why" data-id="${esc(r.id)}" aria-label="Warum?">${ic("info", 13)}Warum?</button><button class="why" data-act="rep" data-id="${esc(r.id)}" aria-label="Bericht">${ic("chart", 13)}Bericht</button></div></div>
      <button class="sw ${r.on ? "on" : ""}" data-act="sw" data-sw="${esc(r.sw)}" aria-label="Fensterregelung umschalten" aria-pressed="${!!r.on}"></button></div>
      <div class="two">
        <div class="box ${wc}"><div class="t">${ic(open.length ? "windowOpen" : "window", 18)}Fenster</div>
          <div class="v">${open.length ? `${open.length} von ${wins.length} offen` : "alle geschlossen"}</div>
          <div class="s">${esc(open.length ? open.map(winName).join(", ") : wins.map(winName).join(", ") || "–")}</div></div>
        <div class="box ${hc}"><div class="t">${ic("radiator", 18)}Heizung</div>
          <div class="v">${cur != null ? num(cur, 1) + " °C" : hv}</div>
          <div class="s">${t0 ? (cur != null && tgt != null ? `Ziel ${num(tgt, 1)} °C · ` : "") + hv : "kein Thermostat"}${th.length > 1 ? ` (+${th.length - 1})` : ""}</div></div>
      </div>
      ${this._planBox(r)}${this._away() ? `<div class="pnote">${ic("suitcase", 16)}${this._pres().effective === "vacation" || this._pres().mode === "vacation" ? "Urlaubsmodus" : "Abwesend"}: Absenkung auf ${num(this._pres().temp, 1)} °C, der Heizplan ruht.</div>` : ""}
      <div class="foot"><div class="a"><b>${num(d.min)} Min. pausiert</b><span>${r.pauses || 0}× heute · ~${num(d.gas, 2)} ${FUELS[r.fuel || "erdgas"].label} · ${num(r.kw, 2)} kW</span></div>${this._spark(r)}</div></div>`;
  }

  _render() {
    if (!this._hass || this._dragging) return;
    const sr = this.shadowRoot;
    if (!this._built) { this._build(); }
    const bg = getComputedStyle(this).backgroundColor.match(/\d+/g) || [15, 20, 25];
    this.style.colorScheme = (0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2]) < 140 ? "dark" : "light";
    const rooms = this._collect(), edit = this._edit, adm = this._admin();
    const sum = (sc, k) => rooms.reduce((a, r) => a + (r.sc[sc]?.[k] || 0), 0);
    const paused = rooms.filter((r) => r.mode === "heizung_pausiert").length;
    const fset = new Set(rooms.map((r) => r.fuel || "erdgas")), F = fset.size === 1 ? FUELS[[...fset][0]] : MIXED, mixed = fset.size > 1;
    const amt = (sc) => (mixed ? sum(sc, "kwh") : sum(sc, "gas"));
    const dateStr = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
    const tiles = [["day", "today", "Heute", "#2dd4bf"], ["month", "month", "Monat", "#60a5fa"], ["year", "year", "Jahr", "#a78bfa"], ["total", "total", "Gesamt", "#f472b6"]];
    const content = {
      hero: () => `<div class="card hero">${this._art()}<img class="hlogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false">
        <div class="lbl">${ic("flame", 16)}Heute ${F.short} gespart (geschätzt)</div>
        <div class="big">${num(amt("day"), 2)}<small>${F.label}</small></div><div class="sub">${esc(dateStr)}</div>
        <div class="chips"><span class="chip">${ic("clock", 16)}${num(sum("day", "min"))} Min. pausiert</span>
          <span class="chip">${ic("radiator", 16)}${paused} von ${rooms.length} ${rooms.length === 1 ? "Raum" : "Räumen"} pausiert</span>
          <span class="chip">${ic("thermo", 16)}${num(sum("day", "kwh"), 1)} kWh Wärme</span></div></div>`,
      presence: () => this._presenceCard(),
      tiles: () => `<div class="tiles">${tiles.map(([sc, ico, lab, col]) => `<div class="tile" style="--a:${col}">
        <div class="t">${ic(ico, 17)}${lab}</div><div class="v">${num(sum(sc, "min"))}<small>Min.</small></div>
        <div class="g">${ic("flame", 14)}${num(amt(sc), 2)} ${unitOf(F)}</div></div>`).join("")}</div>`,
      chart: () => `<div class="card"><h2>${ic("clock", 18)}Pausenzeit pro Tag · letzte 14 Tage</h2>${this._chart(rooms)}
        <div class="legend">${[...rooms].sort((a, b) => COLORS.indexOf(a.color) - COLORS.indexOf(b.color)).map((r) => `<span><i style="background:${r.color}"></i>${esc(r.name)}</span>`).join("")}</div></div>`,
      rooms: () => this._groupsHtml(rooms),
    };
    // Reihenfolge der Räume im Diagramm = Reihenfolge der Farben, deshalb nach Farbe
    const chartRooms = [...rooms].sort((a, b) => COLORS.indexOf(a.color) - COLORS.indexOf(b.color));
    content.chart = () => `<div class="card"><h2>${ic("clock", 18)}Pausenzeit pro Tag · letzte 14 Tage</h2>${this._chart(chartRooms)}
        <div class="legend">${chartRooms.map((r) => `<span><i style="background:${r.color}"></i>${esc(r.name)}</span>`).join("")}</div></div>`;
    const blocks = rooms.length ? this._blockOrder().map((id) => `<section class="blk ${edit ? "editing" : ""}" data-sort="block" data-id="${id}">
        ${edit ? `<div class="etag"><span class="grip" data-handle title="Verschieben">${ic("grip", 18)}</span>${BLOCKS[id]}</div>` : ""}${content[id]()}</section>`).join("")
      : `<div class="card empty">Noch keine Räume eingerichtet.<br>Füge unter Einstellungen › Geräte &amp; Dienste die Integration „Fenster &amp; Heizung“ hinzu.</div>`;
    sr.getElementById("main").innerHTML = `
      <div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><span class="logo">${ic("windowOpen", 22)}</span><div><b>Modul 1 – Fenster &amp; Heizung</b><span><em class="tag">Smarte Fenster- und Heizungssteuerung</em>${this._ver ? `<em class="ver">Version ${esc(this._ver)}</em>` : ""}</span></div></div>
        ${adm ? (edit ? `<button class="pillbtn pri" data-act="done">${ic("check", 16)}<span class="bl">Fertig</span></button>` : `<button class="pillbtn" data-act="edit">${ic("pencil", 16)}<span class="bl">Anpassen</span></button>`) : ""}</div>
      <div class="wrap">${edit ? `<div class="banner">${ic("grip", 18)}<div>Ziehe Karten und Bereiche an den Griffen, um sie zu verschieben. Tippe auf ein Raumsymbol, um es zu ändern.</div></div>` : ""}
        ${blocks}${rooms.length ? `<div class="note">${mixed ? "Bei gemischten Brennstoffen wird die Ersparnis als Heizenergie in kWh gezeigt. Sie ist eine grobe Schätzung." : "Die " + F.noun + " ist eine grobe Schätzung. Die echte Ersparnis liegt etwas darunter."}</div>` : ""}</div>`;
  }

  _build() {
    const sr = this.shadowRoot;
    sr.innerHTML = `<style>${CSS}</style><div id="main"></div><div id="modal"></div><div id="toast"></div>`;
    this._built = true;
    sr.addEventListener("click", (e) => { const b = e.target.closest("[data-act]"); if (b) this._act(b.dataset.act, b); });
    const hov = (e) => { const c = e.target.closest && e.target.closest(".rchart"); if (!c || !this._repGeo) return; const bb = c.getBoundingClientRect(), g = this._repGeo; this._repHover(Math.min(1439, Math.max(0, ((e.clientX - bb.left) / bb.width * g.W - g.L) / g.iw * 1440))); };
    sr.addEventListener("pointermove", hov); sr.addEventListener("pointerdown", hov);
    sr.addEventListener("input", (e) => { const t = e.target; if (t.dataset && t.dataset.f === "gname" && this._modal) this._modal.draft.name = t.value; });
    sr.addEventListener("pointerdown", (e) => { const g = e.target.closest("[data-handle]"); if (g) this._dragStart(e, g); });
    sr.addEventListener("change", (e) => {
      const t = e.target;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("v") && this._modal && this._modal.type === "vac") { const k = { vfrom: "from", vto: "to", vtime: "preheat_time" }[t.dataset.f]; this._modal.draft[k] = t.value; if (k === "from" && t.value > this._modal.draft.to) this._modal.draft.to = t.value; this._renderModal(); }
      else if (t.dataset && t.dataset.f === "gname" && this._modal) { this._modal.draft.name = t.value; }
      else if (t.dataset && t.dataset.f === "time" && this._modal) { this._modal.draft.entries[+t.dataset.i].time = t.value || "00:00"; this._renderModal(); }
    });
  }

  /* ---------------- Aktionen ---------------- */
  _act(a, b) {
    const m = this._modal, i = +b.dataset.i, id = b.dataset.id;
    if (a === "menu") this.dispatchEvent(new Event("hass-toggle-menu", { bubbles: true, composed: true }));
    else if (["gtog", "gsw", "gmv", "gedit", "gadd", "gpick", "gicon", "gsave", "gdel"].includes(a)) this._gActions(a, b);
    else if (a === "rep") this._repOpen(id);
    else if (a === "repday") { m.day = b.dataset.d; m.keepScroll = b.closest(".rdays").scrollLeft; this._repLoad(m).then(() => {}); this._renderModal(); }
    else if (a === "repnav") { const ds = this._repDays(), k = ds.findIndex((x) => x.iso === m.day) + +b.dataset.s; if (ds[k]) { m.day = ds[k].iso; m.keepScroll = this.shadowRoot.querySelector(".rdays")?.scrollLeft; this._repLoad(m).then(() => {}); this._renderModal(); } }
    else if (a === "sw") this._hass.callService("switch", "toggle", { entity_id: b.dataset.sw });
    else if (a === "edit") { this._edit = true; this._render(); }
    else if (a === "done") { this._edit = false; this._render(); }
    else if (a === "plan") this._openPlan(id);
    else if (a === "icon") { this._modal = { type: "icon", id }; this._renderModal(); }
    else if (a === "close") { this._modal = null; this._renderModal(); }
    else if (a === "pick") { this._cfg.layout.icons = { ...(this._cfg.layout.icons || {}), [m.id]: b.dataset.k }; this._saveLayout(); this._modal = null; this._renderModal(); this._render(); }
    else if (a === "preset") { const ic2 = { ...(this._cfg.layout.icons || {}) }; delete ic2[m.id]; this._cfg.layout.icons = ic2; this._saveLayout(); this._modal = null; this._renderModal(); this._render(); }
    else if (a === "why") { this._modal = { type: "why", id }; this._renderModal(); }
    else if (a === "pm") {
      const p = this._pres();
      if (b.dataset.k === "vacation" && !(p.from && p.to)) { this._act("vac", b); return; }
      this._cfg.presence = { ...p, mode: b.dataset.k, origin: "manual" }; this._savePresence(); this._render();
    }
    else if (a === "vac") {
      const p = this._pres(), all = Object.keys(this._hass.states).filter((e) => e.startsWith("person."));
      this._modal = { type: "vac", draft: { ...p, from: p.from || this._isoDay(0), to: p.to || this._isoDay(7), persons: p.persons.length ? [...p.persons] : all } }; this._renderModal();
    }
    else if (a === "pset") {
      const p = this._pres(), all = Object.keys(this._hass.states).filter((e) => e.startsWith("person."));
      this._modal = { type: "pset", draft: { ...p, persons: p.persons.length ? [...p.persons] : all } }; this._renderModal();
    }
    else if (m && (m.type === "vac" || m.type === "pset")) {
      const d = m.draft;
      if (a === "vtm") d.temp = Math.max(5, d.temp - 0.5);
      else if (a === "vtp") d.temp = Math.min(25, d.temp + 0.5);
      else if (a === "vpre") d.preheat = !d.preheat;
      else if (a === "vauto") d.auto = !d.auto;
      else if (a === "vawm") d.away_after = Math.max(15, d.away_after - 15);
      else if (a === "vawp") d.away_after = Math.min(120, d.away_after + 15);
      else if (a === "vper") { const e = b.dataset.e; d.persons = d.persons.includes(e) ? d.persons.filter((x) => x !== e) : [...d.persons, e]; }
      else if (a === "psetsave") {
        this._cfg.presence = { ...this._pres(), temp: d.temp, auto: d.auto, away_after: d.away_after, persons: d.persons }; this._savePresence(); this._modal = null; this._renderModal(); this._render(); this._toast("Einstellungen gespeichert"); return;
      }
      else if (a === "vsave") {
        if (!d.from || !d.to || d.to < d.from) { this._toast("Bitte ein gültiges Datum wählen"); return; }
        this._cfg.presence = { ...d, mode: "vacation", origin: "manual" }; this._savePresence(); this._modal = null; this._renderModal(); this._render(); this._toast("Urlaub gespeichert"); return;
      }
      this._renderModal();
    }
    else if (m && m.type === "plan") {
      const d = m.draft;
      if (a === "penable") d.enabled = !d.enabled;
      else if (a === "pday") m.day = +b.dataset.d;
      else if (a === "pdc") { const e = d.entries[i], k = +b.dataset.d; e.days = e.days.includes(k) ? e.days.filter((x) => x !== k) : [...e.days, k].sort(); }
      else if (a === "tmin") d.entries[i].temp = Math.max(5, Math.round((d.entries[i].temp - 0.5) * 2) / 2);
      else if (a === "tplus") d.entries[i].temp = Math.min(30, Math.round((d.entries[i].temp + 0.5) * 2) / 2);
      else if (a === "pdel") d.entries.splice(i, 1);
      else if (a === "pmode") d.mode = b.dataset.k;
      else if (a === "pdq") d.entries[i].days = { wk: [0, 1, 2, 3, 4], we: [5, 6], all: [0, 1, 2, 3, 4, 5, 6] }[b.dataset.q];
      else if (a === "pdup") d.entries.splice(i + 1, 0, { ...d.entries[i], days: [...d.entries[i].days], id: this._uid() });
      else if (a === "padd") d.entries.push({ id: this._uid(), days: [0, 1, 2, 3, 4], time: "06:00", temp: 21 });
      else if (a === "ptpl") d.entries = TEMPLATE.map((e) => ({ ...e, id: this._uid() }));
      else if (a === "psave") return this._savePlan();
      this._renderModal();
    }
  }
  _uid() { return "e" + Math.random().toString(36).slice(2, 8); }
  _openPlan(id) {
    if (!this._admin()) return;
    const p0 = this._cfg.plans[id] || { enabled: true, entries: [] }, pr = this._collect().find((x) => x.id === id), p = { ...p0, enabled: pr && pr.planOn !== undefined ? pr.planOn : p0.enabled };
    const draft = { mode: p.mode || "heat", enabled: p.entries.length ? p.enabled : true, entries: p.entries.map((e) => ({ ...e, days: [...e.days], id: e.id || this._uid() })) };
    this._modal = { type: "plan", id, draft, day: Math.floor(nowMin() / 1440) };
    this._renderModal();
  }
  async _savePlan() {
    const m = this._modal, entries = m.draft.entries.filter((e) => e.days.length);
    entries.sort((a, b) => Math.min(...a.days) - Math.min(...b.days) || toMin(a.time) - toMin(b.time));
    const plan = { enabled: m.draft.enabled && entries.length > 0, entries };
    try {
      await this._hass.callWS({ type: "fenster_heizung/set_plan", entry_id: m.id, enabled: plan.enabled, entries, mode: m.draft.mode });
      this._cfg.plans[m.id] = { ...plan, mode: m.draft.mode }; this._modal = null; this._renderModal(); this._render(); this._toast("Heizplan gespeichert");
    } catch (e) { this._toast("Heizplan konnte nicht gespeichert werden"); }
  }

  _renderModal() {
    const box = this.shadowRoot.getElementById("modal"), m = this._modal;
    const old = box.querySelector(".sheet"), top = old ? old.scrollTop : 0;
    if (!m) { box.innerHTML = ""; return; }
    const r = this._collect().find((x) => x.id === m.id) || { name: "" };
    if (m.type === "icon") {
      const cur = this._icon(r);
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Symbol wählen</b><span>${esc(r.name)}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="igrid">${ROOM_ICONS.map(([k, l]) => `<button class="${k === cur ? "sel" : ""}" data-act="pick" data-k="${k}">${ic(k, 28)}<span>${l}</span></button>`).join("")}</div>
        <button class="lnk" data-act="preset">Automatisch nach Raumname</button></div>`;
    } else if (m.type === "rep") {
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Bericht</b><span>${esc(r.name)} · ${m.day.split("-").reverse().join(".")}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        ${this._repBody(r, m)}</div>`;
      const dd = box.querySelector(".rdays"); if (dd) dd.scrollLeft = m.keepScroll ?? 99999;
      if (this._repData) { const ev = this._repData.ev.find((e) => e.c === "#60a5fa"), last = this._repData.pts[this._repData.pts.length - 1].t; this._repHover(ev ? ev.t + 2 : Math.min(12 * 60, last)); }
    } else if (m.type === "grp") {
      const d = m.draft, rooms = this._collect(), owner = (id) => (this._cfg.layout.groups || []).find((g) => g.id !== d.id && (g.rooms || []).includes(id));
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>${d.isNew ? "Neue Gruppe" : "Gruppe bearbeiten"}</b><span>Räume zusammenfassen</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm" style="margin:0">Name</div><input class="gname" data-f="gname" value="${esc(d.name)}" placeholder="z. B. Obergeschoss" maxlength="30">
        <div class="mut sm" style="margin:0">Symbol</div><div class="gicons">${GROUP_ICONS.map((k) => `<button class="${d.icon === k ? "sel" : ""}" data-act="gicon" data-k="${k}" aria-label="${k}">${ic(k, 22)}</button>`).join("")}</div>
        <div class="mut sm" style="margin:0">Räume in dieser Gruppe</div>
        <div class="dchips">${rooms.map((r) => { const o = owner(r.id); return `<button class="dc ${d.rooms.includes(r.id) ? "sel" : ""}" data-act="gpick" data-r="${esc(r.id)}">${esc(r.name)}${o && !d.rooms.includes(r.id) ? ` <small style="opacity:.7">· ${esc(o.name)}</small>` : ""}</button>`; }).join("")}</div>
        <div class="mut sm" style="margin:0 0 12px">Ein Raum gehört immer nur zu einer Gruppe. Nicht zugeordnete Räume stehen unter „Weitere Räume“.</div>
        <div class="foot2">${d.isNew ? "" : `<button class="btn2 del" data-act="gdel" aria-label="Gruppe löschen">${ic("trash", 17)}</button>`}<button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="gsave">Speichern</button></div></div>`;
    } else if (m.type === "why") {
      const mm = MODE[r.mode] || MODE.regelung_aus;
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>${r.mode === "heizung_pausiert" ? "Warum pausiert die Heizung?" : "Warum „" + mm.t + "“?"}</b><span>${esc(r.name)}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="why-l">${(r.why || []).map((w) => `<div class="wl ${w.s}"><i></i><span>${esc(w.t)}</span></div>`).join("") || `<div class="mut">Keine Angaben vorhanden.</div>`}</div>
        <div class="foot2"><button class="btn2" data-act="close">Schließen</button></div></div>`;
    } else if (m.type === "vac") {
      const d = m.draft;
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Urlaub planen</b><span>Alle Räume · Absenkung ${num(d.temp, 1)} °C</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="vrow"><span>Von</span><input type="date" value="${d.from}" data-f="vfrom"></div>
        <div class="vrow"><span>Bis</span><input type="date" value="${d.to}" data-f="vto" min="${d.from}"></div>
        <div class="vrow"><span>Am Rückkehrtag vorheizen</span><button class="sw ${d.preheat ? "on" : ""}" data-act="vpre" aria-pressed="${d.preheat}"></button></div>
        ${d.preheat ? `<div class="vrow"><span>Vorheizen ab</span><input type="time" value="${d.preheat_time}" data-f="vtime" style="background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:8px;font:inherit"></div>` : ""}
        <div class="mut sm" style="margin:2px 0 0">${d.preheat ? `Am Bis-Tag gilt ab ${d.preheat_time} Uhr wieder der Heizplan.` : "Der Heizplan gilt wieder ab dem Tag nach dem Bis-Datum."}</div>
        <div class="mut sm" style="margin:10px 0 0">Die Absenktemperatur und die automatische Erkennung stellst du unter „Einstellungen“ ein.</div>
        <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="vsave">Urlaub starten</button></div></div>`;
    } else if (m.type === "pset") {
      const d = m.draft, persons = Object.keys(this._hass.states).filter((e) => e.startsWith("person."));
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Einstellungen</b><span>Anwesenheit &amp; Urlaub</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm" style="margin:0 0 4px">Absenkung</div>
        <div class="vrow"><span>Temperatur bei Abwesenheit und Urlaub</span><div class="step"><button data-act="vtm" aria-label="kälter">${ic("minus", 18)}</button><b style="color:${heat(d.temp)}">${num(d.temp, 1)} °C</b><button data-act="vtp" aria-label="wärmer">${ic("plus", 18)}</button></div></div>
        <div class="mut sm" style="margin:14px 0 4px">Automatisch erkennen</div>
        <div class="vrow"><span>Abwesend, wenn niemand zu Hause ist</span><button class="sw ${d.auto ? "on" : ""}" data-act="vauto" aria-pressed="${d.auto}"></button></div>
        ${d.auto ? `<div class="dchips">${persons.map((e) => `<button class="dc ${d.persons.includes(e) ? "sel" : ""}" data-act="vper" data-e="${esc(e)}">${esc(this._hass.states[e].attributes.friendly_name || e)}</button>`).join("")}</div>
        <div class="vrow"><span>Nach</span><div class="step"><button data-act="vawm" aria-label="weniger">${ic("minus", 18)}</button><b>${d.away_after} Min.</b><button data-act="vawp" aria-label="mehr">${ic("plus", 18)}</button></div></div>` : ""}
        <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="psetsave">Speichern</button></div></div>`;
    } else {
      const d = m.draft, pts = points(d.entries), today = Math.floor(nowMin() / 1440);
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Heizplan</b><span>${esc(r.name)}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="row"><span>Heizplan aktiv</span><button class="sw ${d.enabled ? "on" : ""}" data-act="penable" aria-label="Heizplan aktiv" aria-pressed="${d.enabled}"></button></div>
        <div class="mut sm" style="margin:0 0 6px">Beim Planstart ausgeschaltete Thermostate einschalten</div>
        <div class="seg">${[["keep", "Nein"], ["heat", "Heizen"], ["auto", "Automatik"]].map(([k, l]) => `<button class="${d.mode === k ? "sel" : ""}" data-act="pmode" data-k="${k}">${l}</button>`).join("")}</div>
        <div class="mut sm" style="margin:0 0 4px">Vorschau für Tag</div>
        <div class="dchips">${DAYS.map((x, k) => `<button class="dc ${m.day === k ? "sel" : ""}" data-act="pday" data-d="${k}">${x}</button>`).join("")}</div>
        ${pts.length ? bar(pts, m.day, m.day === today ? nowMin() : null) : `<div class="mut">Noch keine Schaltpunkte.</div>`}
        <div class="mut sm">${DAYS_LONG[m.day]} · Farbe = Temperatur</div>
        ${d.entries.map((e, i) => `<div class="sp"><div class="sp1">
          <input type="time" value="${e.time}" data-i="${i}" data-f="time" aria-label="Uhrzeit">
          <div class="step"><button data-act="tmin" data-i="${i}" aria-label="kälter">${ic("minus", 18)}</button><b style="color:${heat(e.temp)}">${num(e.temp, 1)} °C</b><button data-act="tplus" data-i="${i}" aria-label="wärmer">${ic("plus", 18)}</button></div>
          <button class="ibtn" data-act="pdel" data-i="${i}" aria-label="Schaltpunkt löschen">${ic("trash", 17)}</button></div>
          <div class="mut sm" style="margin:2px 0 2px">Gilt an (mehrere Tage möglich)</div>
          <div class="dchips sm">${DAYS.map((x, k) => `<button class="dc ${e.days.includes(k) ? "sel" : ""}" data-act="pdc" data-i="${i}" data-d="${k}">${x}</button>`).join("")}</div>
          <div class="quick"><button class="lnk" data-act="pdq" data-i="${i}" data-q="wk">Mo–Fr</button><button class="lnk" data-act="pdq" data-i="${i}" data-q="we">Sa–So</button><button class="lnk" data-act="pdq" data-i="${i}" data-q="all">Alle Tage</button><button class="lnk" data-act="pdup" data-i="${i}">${ic("copy", 14)}Kopie</button></div></div>`).join("")}
        <div class="btns"><button class="lnk" data-act="padd">${ic("plus", 16)}Schaltpunkt</button><button class="lnk" data-act="ptpl">Vorlage laden</button></div>
        <div class="foot2"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="psave">Speichern</button></div></div>`;
    }
    const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top;
  }

  /* ---------------- Verschieben per Ziehen ---------------- */
  _scroller() {
    let n = this;
    while (n) {
      if (n instanceof HTMLElement) { const s = getComputedStyle(n); if (/(auto|scroll)/.test(s.overflowY) && n.scrollHeight > n.clientHeight + 2) return n; }
      n = n.parentElement || (n.getRootNode && n.getRootNode().host);
    }
    return document.scrollingElement;
  }
  _dragStart(e, h) {
    if (e.button !== undefined && e.button > 0) return;
    const item = h.closest("[data-sort]"); if (!item) return;
    e.preventDefault();
    const rc = item.getBoundingClientRect(), ghost = item.cloneNode(true);
    ghost.classList.add("ghost"); ghost.removeAttribute("data-sort");
    Object.assign(ghost.style, { left: rc.left + "px", top: rc.top + "px", width: rc.width + "px", height: rc.height + "px", overflow: "hidden" });
    this.shadowRoot.appendChild(ghost); item.classList.add("dragging");
    this._drag = { item, container: item.parentElement, group: item.dataset.sort, ghost, dx: e.clientX - rc.left, dy: e.clientY - rc.top, x: e.clientX, y: e.clientY, t: null, after: false };
    this._dragging = true;
    try { h.setPointerCapture(e.pointerId); } catch (_) { /* egal */ }
    this._mv = (ev) => { ev.preventDefault(); const d = this._drag; d.x = ev.clientX; d.y = ev.clientY; d.ghost.style.left = d.x - d.dx + "px"; d.ghost.style.top = d.y - d.dy + "px"; this._retarget(); };
    this._up = () => this._dragEnd(true);
    this._cancel = () => this._dragEnd(false);
    window.addEventListener("pointermove", this._mv, { passive: false });
    window.addEventListener("pointerup", this._up);
    window.addEventListener("pointercancel", this._cancel);
    const loop = () => {
      if (!this._dragging) return;
      const d = this._drag, sc = this._scroller();
      if (sc) { if (d.y < 110) sc.scrollTop -= (110 - d.y) / 5; else if (d.y > innerHeight - 110) sc.scrollTop += (d.y - (innerHeight - 110)) / 5; }
      this._retarget(); this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
    this._retarget();
  }
  _retarget() {
    const d = this._drag; if (!d) return;
    const sibs = [...d.container.children].filter((c) => c !== d.item && c.dataset.sort === d.group);
    sibs.forEach((s) => s.classList.remove("drop-before", "drop-after"));
    let best = null, bd = 1e9;
    for (const s of sibs) {
      const r = s.getBoundingClientRect();
      if (d.x >= r.left && d.x <= r.right && d.y >= r.top && d.y <= r.bottom) { best = s; break; }
      const dist = Math.hypot(d.x - (r.left + r.width / 2), d.y - (r.top + r.height / 2));
      if (dist < bd) { bd = dist; best = s; }
    }
    d.t = best; if (!best) return;
    const r = best.getBoundingClientRect(), cols = getComputedStyle(d.container).gridTemplateColumns.split(" ").length;
    const sameRow = Math.abs(r.top + r.height / 2 - d.y) < r.height / 2;
    d.after = d.group === "room" && cols > 1 && sameRow ? d.x > r.left + r.width / 2 : d.y > r.top + r.height / 2;
    best.classList.add(d.after ? "drop-after" : "drop-before");
  }
  _dragEnd(commit) {
    const d = this._drag; if (!d) return;
    window.removeEventListener("pointermove", this._mv); window.removeEventListener("pointerup", this._up); window.removeEventListener("pointercancel", this._cancel);
    cancelAnimationFrame(this._raf); d.ghost.remove(); d.item.classList.remove("dragging");
    [...d.container.children].forEach((s) => s.classList.remove("drop-before", "drop-after"));
    if (commit && d.t) {
      d.after ? d.t.after(d.item) : d.t.before(d.item);
      const ids = [...d.container.children].filter((c) => c.dataset.sort === d.group).map((c) => c.dataset.id);
      if (d.group === "room") {
        const all = this._collect().map((r) => r.id), slots = all.map((id, i) => (ids.includes(id) ? i : -1)).filter((i) => i >= 0);
        slots.forEach((pos, k) => (all[pos] = ids[k])); this._cfg.layout.rooms = all;
      } else this._cfg.layout.blocks = ids;
      this._saveLayout();
    }
    this._drag = null; this._dragging = false; this._render();
  }
}
customElements.define("fenster-heizung-panel", FensterHeizungPanel);
