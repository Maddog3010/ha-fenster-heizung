/* Addon „licht“ (Addon-API 1) – Modul 18 Licht & Lampen.
   v0.2 Build 2 (Technik): Einschaltzeiten und Brennstunden kommen aus dem Python-Teil (api.call("licht", "get")), damit „an seit“
   einen Neustart von Home Assistant übersteht. Räume schalten über eine passende Lichtgruppe (alle Lampen gleichzeitig),
   Lichtfarbe wird aus Kelvin, hs, xy und rgb gelesen, die Mischfarbe eines Raums nach Helligkeit gewichtet.
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
.l3pe{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;padding:26px 18px}.l3pe b{font-size:1rem}.l3pe span{color:var(--mut);max-width:440px}
.l3.an-voll .l3pr.on .l3pglow{animation:l3g 4s ease-in-out infinite}@keyframes l3g{50%{opacity:.7}}
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
    return S.d || { on: {}, today: {}, week: [], groups: {}, prefs: { view: "rooms", optik: "neu" }, areas: [], floors: {} };
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
  _liLamps() {
    const st = this._hass.states, now = Date.now(), D = this._liD(), ON = D.on || {}, TD = D.today || {}, PL = this._liPlaced();
    return Object.keys(st).filter((e) => e.startsWith("light.") && !Array.isArray((st[e].attributes || {}).entity_id)).map((e) => {
      const s = st[e], a = s.attributes || {}, modes = Array.isArray(a.supported_color_modes) ? a.supported_color_modes : [], un = s.state === "unavailable" || s.state === "unknown";
      const dim = modes.some((m) => m !== "onoff"), ct = modes.includes("color_temp"), col = modes.some((m) => ["hs", "xy", "rgb", "rgbw", "rgbww"].includes(m));
      const on = s.state === "on", t = ON[e] ? ON[e] * 1000 : new Date(s.last_changed).getTime(), pe = PL[e];
      let area = this._liAreaOf(e), pos = false;
      if (!area && pe && pe.room) { const pa = this._liPArea(pe.room); if (pa) { area = pa; pos = true; } }   /* B4: Raum aus der Position im Plan */
      return { pe: pe || null, pos, id: e, name: a.friendly_name || e, on, un, dim, ct, col, br: a.brightness != null ? Math.round(Number(a.brightness) / 2.55) : (on ? 100 : 0), kel: a.color_temp_kelvin || null, kmin: a.min_color_temp_kelvin || 2000, kmax: a.max_color_temp_kelvin || 6500, since: isFinite(t) ? Math.max(0, now - t) : 0, area, rgb: lampRgb(a), mode: a.color_mode || "", today: TD[e] || 0 };
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
    if (!rooms.length) return `${head}<div class="card empty">${ic("lamp", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Keine Lampen gefunden</div>Es gibt in Home Assistant keine Entität light.*. Lampen richtest du in Home Assistant unter Geräte und Dienste ein.</div>`;
    const on = lamps.filter((x) => x.on), long = this._liLong(), longK = Object.fromEntries(long.map((x) => [x.r.k, x.ms])), L = this._liLay();
    const mu = this._muOn && this._muOn() ? this._mu() : null, mul = mu && mu.cfg && mu.cfg.light && mu.cfg.light.on && mu.cfg.light.ent ? mu.cfg.light.ent : "";
    const unlinked = ["night", "arrive", "cozy"].filter((k) => !(L.scenes[k] && this._hass.states[L.scenes[k]])).length;
    const note = [mul ? `${ic("trash", 14)} Müll-Licht (Modul 17): ${esc(this._wzName(mul))} · ${this._hass.states[mul] && this._hass.states[mul].state === "on" ? "an" : "aus"}` : "", unlinked && adm ? `${ic("link", 14)} ${unlinked} Szenenknopf${unlinked === 1 ? "" : "e"} noch nicht verknüpft – Antippen öffnet die Einstellungen` : ""].filter(Boolean);
    const vw = this._liPrefs().view, body = vw === "plan" ? this._liPlanView(rooms, longK) : vw === "list" ? this._liList(shown) : `<div class="l3grid">${shown.map((r) => this._liRoomCard(r, longK)).join("") || `<div class="card empty">Alle Räume sind ausgeblendet. Einblenden kannst du sie in den Einstellungen.</div>`}</div>`;
    return `${head}<div class="l3 an-${this._liAnim()}">${this._liTiles(shown, lamps, on, long)}${this._liScenes(on)}${note.length ? `<div class="mut sm" style="margin:-6px 0 12px;display:flex;flex-direction:column;gap:4px">${note.map((t) => `<span style="display:inline-flex;gap:6px;align-items:center">${t}</span>`).join("")}</div>` : ""}${body}</div>`;
  }
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
    const P = this._grRaw ? this._grRaw() : (this._sfxD && this._sfxD.d && this._sfxD.d.cfg && this._sfxD.d.cfg.plan);   /* ab 2026.11.4b53 aus Modul 0 */
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
  _liPlanView(rooms, longK) {
    const P = this._liPlan(), adm = this._admin(), sf = this._mdList && this._mdList().some((m) => m.id === "sf");
    if (!P) return this._liPlanEmpty("Grundriss wird geladen …", "Einen Moment.");
    if (P.error) return this._liPlanEmpty("Grundriss gerade nicht erreichbar", "Modul 11 antwortet noch nicht – meist direkt nach einem Neustart von Home Assistant. Es wird gleich von selbst erneut versucht.");
    const allR = (P.items || []).filter((i) => i.t === "r");
    if (!allR.length) return this._liPlanEmpty("Noch kein Grundriss mit Räumen", "Den Grundriss zeichnest du einmal mit dem Baukasten aus Modul 11: Räume, Wände, Türen und Fenster. Modul 1 und Modul 18 nutzen ihn dann mit.",
      adm ? (sf ? `<button class="btn2 pri" data-act="gpedit">${ic("pencil", 16)} Grundriss zeichnen</button>` : `<span class="mut sm">Schalte dafür unter Einstellungen → Module das Modul 11 ein.</span>`) : "");
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
      ${(() => { const np = LA.filter((x) => !x.pe).length; return np ? (adm && sf ? `<button class="u" data-act="lixplace" title="Im Baukasten von Modul 11 platzieren">${np} ${np === 1 ? "Lampe" : "Lampen"} nicht im Plan${ic("chev", 13)}</button>` : `<span>${np} ${np === 1 ? "Lampe" : "Lampen"} nicht im Plan</span>`) : ""; })()}
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
    const rooms = this._liRooms().filter((r) => r.k !== "_"), cur = (this._liD().pmap || {})[it.id] || "", auto = cur ? null : this._liPRoom(it, rooms);
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Fläche zuordnen</b><span>Grundriss: ${esc(it.n || "ohne Namen")}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut sm" style="margin:0 0 10px">Welcher Bereich aus Home Assistant liegt hier? Seine Lampen leuchten dann auf dieser Fläche. Die Zuordnung gilt nur für Modul 18.</div>
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
    if (a === "lixalloffgo") { const ids = this._liLamps().filter((x) => x.on).map((x) => x.id); this._modal = null; this._renderModal(); if (ids.length) this._liSwitch(ids, false); this._toast("Alle Lampen werden ausgeschaltet"); return; }
    if (a === "lixsw") { const x = this._liLamps().find((y) => y.id === k); if (x) this._liCall("light", x.on ? "turn_off" : "turn_on", { entity_id: k }); return; }
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
    if (a === "lixplace") {   /* B7: in den Baukasten von Modul 11, Werkzeug „Lampe“ gewählt; die freien Lampen stehen dort als Liste */
      if (!this._admin()) return;
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
      api.call(ID, "set", { pmap: { [k]: v } }).then((d) => { if (this._liX) { this._liX.d = d; this._liX.ts = Date.now(); } this._render(); }).catch(() => this._toast("Speichern fehlgeschlagen"));
      return;
    }
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
      <div class="lsec">${ic("palette", 15)}Darstellung</div>
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
