/* Fenster & Heizung – Dashboard-Panel (ohne externe Abhängigkeiten) */
const ICONS = {
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
  sofa: '<path d="M5 11V8.5A3 3 0 0 1 8 5.5h8a3 3 0 0 1 3 3V11"/><rect x="3" y="11" width="18" height="6" rx="2.5"/><path d="M6 17v2M18 17v2"/>',
  bed: '<path d="M3 19V6M3 14h18v5M21 14v-2.5A2.5 2.5 0 0 0 18.5 9H11v5"/><circle cx="7" cy="11" r="1.8"/>',
  pot: '<path d="M5 10h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3zM3 10h18M9 4.5c0 1.2 1 1.2 1 2.5M14 4.5c0 1.2 1 1.2 1 2.5"/>',
  desk: '<rect x="3" y="5" width="18" height="11" rx="2"/><path d="M8 20h8M12 16v4"/>',
  drop: '<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z"/>',
  door: '<rect x="6" y="3" width="12" height="18" rx="1.8"/><circle cx="15" cy="12" r=".9" fill="currentColor"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
};
const ic = (n, s = 22) =>
  `<svg class="ic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[n] || ICONS.door}</svg>`;

const COLORS = ["#2dd4bf", "#f59e0b", "#a78bfa", "#f472b6", "#60a5fa", "#a3e635"];
const MODE = {
  regelung_aktiv: { t: "Regelung aktiv", c: "green" },
  heizung_pausiert: { t: "Heizung pausiert", c: "amber" },
  nur_fenstermeldung: { t: "Heizung aus · nur Fenstermeldung", c: "slate" },
  regelung_aus: { t: "Regelung deaktiviert", c: "gray" },
};
const roomIcon = (n) => {
  n = n.toLowerCase();
  if (/wohn|stube/.test(n)) return "sofa";
  if (/schlaf|kinder|gast/.test(n)) return "bed";
  if (/k[üu]e?che|kitchen/.test(n)) return "pot";
  if (/b[üu]e?ro|arbeit|office/.test(n)) return "desk";
  if (/bad|wc|dusche/.test(n)) return "drop";
  return "door";
};
const num = (v, d = 0) => (Number(v) || 0).toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const CSS = `
:host{display:block;min-height:100%;background:var(--primary-background-color,#0f1419);color:var(--primary-text-color,#e6edf3);
  font-family:var(--paper-font-body1_-_font-family,Roboto,"Segoe UI",system-ui,sans-serif);
  --card:var(--card-background-color,#1a2129);--mut:var(--secondary-text-color,#9aa7b4);--line:var(--divider-color,#2a3440);
  --green:#34d399;--amber:#f59e0b;--slate:#7dd3fc;--gray:#94a3b8;--teal:#2dd4bf}
*{box-sizing:border-box}
.bar{display:flex;align-items:center;gap:8px;padding:calc(10px + env(safe-area-inset-top,0px)) 16px 10px;position:sticky;top:0;z-index:2;
  background:var(--app-header-background-color,var(--card));color:var(--app-header-text-color,var(--primary-text-color));border-bottom:1px solid var(--line)}
.bar h1{font-size:1.15rem;font-weight:600;margin:0;flex:1}
.bar button{background:none;border:0;color:inherit;padding:6px;border-radius:50%;cursor:pointer;display:grid;place-items:center}
.wrap{max-width:1180px;margin:0 auto;padding:16px 14px calc(28px + env(safe-area-inset-bottom,0px));display:grid;gap:14px}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px}
.card h2{font-size:.95rem;margin:0 0 12px;font-weight:600;display:flex;align-items:center;gap:8px}
.card h2 .ic{color:var(--teal)}
.hero{position:relative;overflow:hidden;border:0;color:#ecfeff;padding:20px 18px;
  background:radial-gradient(120% 140% at 85% 0%,#14b8a6 0%,rgba(20,184,166,0) 55%),linear-gradient(135deg,#0f5f66 0%,#0c3b52 60%,#0b2c43 100%)}
.hero .art{position:absolute;right:-6px;top:8px;width:46%;max-width:300px;opacity:.95}
.hero .lbl{font-size:.82rem;opacity:.85;display:flex;gap:6px;align-items:center}
.hero .big{font-size:2.7rem;font-weight:700;line-height:1.05;margin:6px 0 2px;letter-spacing:-.5px}
.hero .big small{font-size:1.2rem;font-weight:500;opacity:.85;margin-left:4px}
.hero .sub{font-size:.8rem;opacity:.75;max-width:55%}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
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
.room{display:grid;gap:12px}
.rh{display:flex;align-items:center;gap:12px}
.rico{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;color:#fff;flex:none}
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
.foot{display:flex;align-items:center;gap:12px;border-top:1px solid var(--line);padding-top:12px}
.foot .a{flex:1;min-width:0}
.foot .a b{font-size:1.1rem}
.foot .a span{display:block;font-size:.76rem;color:var(--mut);margin-top:2px}
.note{text-align:center;color:var(--mut);font-size:.76rem;padding:2px 10px}
.empty{text-align:center;color:var(--mut);padding:40px 10px}
@media(min-width:720px){.tiles{grid-template-columns:repeat(4,1fr)}.rooms{grid-template-columns:repeat(2,1fr)}.hero .big{font-size:3.3rem}.hero .art{width:34%}}
@media(min-width:1080px){.rooms{grid-template-columns:repeat(3,1fr)}}
`;

class FensterHeizungPanel extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: "open" }); this._narrow = false; }
  set hass(h) { this._hass = h; this._render(); }
  set narrow(v) { this._narrow = v; this._render(); }
  set panel(_) {}
  set route(_) {}

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
        r = { name: dev.name_by_user || dev.name || eid, sc: {}, hist: {} };
        rooms.set(key, r);
      }
      const a = st.attributes || {};
      if (eid.startsWith("switch.")) { r.sw = eid; r.on = st.state === "on"; }
      else if (a.zeitraum) {
        r.sc[a.zeitraum] = { min: Number(st.state) || 0, gas: a.gespartes_gas_m3 || 0, kwh: a.gespartes_gas_kwh || 0 };
        if (a.zeitraum === "day") { r.pauses = a.pausen_heute || 0; r.kw = a.aktuelle_leistung_kw || 0; r.hist = a.verlauf || {}; }
      } else if ("thermostate" in a) {
        r.mode = st.state; r.windows = a.fenster || []; r.thermos = Object.keys(a.thermostate || {}); r.src = a.heizung_quelle;
      }
    }
    const prio = { heizung_pausiert: 0, regelung_aktiv: 1, nur_fenstermeldung: 2, regelung_aus: 3 };
    return [...rooms.values()].sort((x, y) => (prio[x.mode] ?? 9) - (prio[y.mode] ?? 9) || x.name.localeCompare(y.name, "de"));
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
    const days = this._days(rooms), W = 640, H = 250, L = 42, R = 8, T = 12, B = 32;
    const tot = days.map((x) => x.v.reduce((a, b) => a + b, 0));
    const step = [30, 60, 120, 240, 480].find((s) => Math.max(...tot, 1) / s <= 4) || 480;
    const max = Math.max(Math.ceil(Math.max(...tot, 1) / step) * step, step);
    const iw = (W - L - R) / days.length, bw = iw * 0.62, y = (v) => T + (H - T - B) * (1 - v / max);
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Pausenzeit pro Tag">`;
    for (let v = 0; v <= max; v += step) {
      s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-dasharray="${v ? "3 4" : "0"}"/>`;
      s += `<text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="14" fill="var(--mut)">${v}</text>`;
    }
    days.forEach((dd, i) => {
      const x = L + iw * i + (iw - bw) / 2; let acc = 0;
      dd.v.forEach((v, k) => {
        if (v <= 0) return;
        const y1 = y(acc + v), h = y(acc) - y1; acc += v;
        s += `<rect x="${x}" y="${y1}" width="${bw}" height="${Math.max(h, 1)}" rx="3" fill="${COLORS[k % COLORS.length]}"/>`;
      });
      const today = i === days.length - 1, lab = i % 2 === (days.length - 1) % 2 || today;
      if (lab) s += `<text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle" font-size="14" fill="${today ? "var(--primary-text-color)" : "var(--mut)"}" font-weight="${today ? 700 : 400}">${today ? "heute" : dd.d.toLocaleDateString("de-DE", { day: "numeric", month: "numeric" })}</text>`;
    });
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

  _room(r, i) {
    const h = this._hass, m = MODE[r.mode] || MODE.regelung_aus;
    const wins = (r.windows || []).map((e) => h.states[e]).filter(Boolean);
    const open = wins.filter((w) => ["on", "open"].includes(w.state));
    const wc = open.length ? "amber" : "green";
    const winName = (w) => w.attributes.friendly_name || w.entity_id;
    const th = (r.thermos || []).map((e) => h.states[e]).filter(Boolean);
    const t0 = th[0], cur = t0?.attributes.current_temperature, tgt = t0?.attributes.temperature;
    const hv = t0 ? (t0.state === "off" ? "aus" : t0.state === "heat" ? "heizt" : t0.state === "auto" ? "Automatik" : t0.state) : "–";
    const hc = !t0 ? "gray" : t0.state === "off" ? "slate" : "green";
    const d = r.sc.day || { min: 0, gas: 0, kwh: 0 };
    return `<div class="card room"><div class="rh">
      <div class="rico" style="background:${COLORS[i % COLORS.length]}">${ic(roomIcon(r.name), 24)}</div>
      <div class="rn"><b>${esc(r.name)}</b><span class="pill ${m.c}">${m.t}</span></div>
      <button class="sw ${r.on ? "on" : ""}" data-sw="${esc(r.sw)}" aria-label="Fensterregelung umschalten" aria-pressed="${!!r.on}"></button></div>
      <div class="two">
        <div class="box ${wc}"><div class="t">${ic(open.length ? "windowOpen" : "window", 18)}Fenster</div>
          <div class="v">${open.length ? `${open.length} von ${wins.length} offen` : "alle geschlossen"}</div>
          <div class="s">${esc(open.length ? open.map(winName).join(", ") : wins.map(winName).join(", ") || "–")}</div></div>
        <div class="box ${hc}"><div class="t">${ic("radiator", 18)}Heizung</div>
          <div class="v">${cur != null ? num(cur, 1) + " °C" : hv}</div>
          <div class="s">${t0 ? (cur != null && tgt != null ? `Ziel ${num(tgt, 1)} °C · ` : "") + hv : "kein Thermostat"}${th.length > 1 ? ` (+${th.length - 1})` : ""}</div></div>
      </div>
      <div class="foot"><div class="a"><b>${num(d.min)} Min. pausiert</b><span>${r.pauses || 0}× heute · ~${num(d.gas, 2)} m³ Gas · ${num(r.kw, 2)} kW</span></div>${this._spark(r)}</div></div>`;
  }

  _render() {
    if (!this._hass) return;
    const rooms = this._collect();
    const sum = (sc, k) => rooms.reduce((a, r) => a + (r.sc[sc]?.[k] || 0), 0);
    const paused = rooms.filter((r) => r.mode === "heizung_pausiert").length;
    const dateStr = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
    const tiles = [["day", "today", "Heute", "#2dd4bf"], ["month", "month", "Monat", "#60a5fa"], ["year", "year", "Jahr", "#a78bfa"], ["total", "total", "Gesamt", "#f472b6"]];
    this.shadowRoot.innerHTML = `<style>${CSS}</style>
    <div class="bar">${this._narrow ? `<button id="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}<h1>Fenster &amp; Heizung</h1></div>
    <div class="wrap">${rooms.length ? `
      <div class="card hero">${this._art()}
        <div class="lbl">${ic("flame", 16)}Heute gespart (geschätzt)</div>
        <div class="big">${num(sum("day", "gas"), 2)}<small>m³ Gas</small></div>
        <div class="sub">${esc(dateStr)}</div>
        <div class="chips"><span class="chip">${ic("clock", 16)}${num(sum("day", "min"))} Min. pausiert</span>
          <span class="chip">${ic("radiator", 16)}${paused} von ${rooms.length} Räumen pausiert</span>
          <span class="chip">${ic("thermo", 16)}${num(sum("day", "kwh"), 1)} kWh</span></div></div>
      <div class="tiles">${tiles.map(([sc, ico, lab, col]) => `<div class="tile" style="--a:${col}">
        <div class="t">${ic(ico, 17)}${lab}</div><div class="v">${num(sum(sc, "min"))}<small>Min.</small></div>
        <div class="g">${ic("flame", 14)}${num(sum(sc, "gas"), 2)} m³</div></div>`).join("")}</div>
      <div class="card"><h2>${ic("clock", 18)}Pausenzeit pro Tag · letzte 14 Tage</h2>${this._chart(rooms)}
        <div class="legend">${rooms.map((r, i) => `<span><i style="background:${COLORS[i % COLORS.length]}"></i>${esc(r.name)}</span>`).join("")}</div></div>
      <div class="rooms">${rooms.map((r, i) => this._room(r, i)).join("")}</div>
      <div class="note">Die Gasersparnis ist eine grobe Schätzung. Die echte Ersparnis liegt etwas darunter.</div>` :
      `<div class="card empty">Noch keine Räume eingerichtet.<br>Füge unter Einstellungen › Geräte &amp; Dienste die Integration „Fenster &amp; Heizung“ hinzu.</div>`}</div>`;
    this.shadowRoot.querySelectorAll("[data-sw]").forEach((b) => b.addEventListener("click", () => this._hass.callService("switch", "toggle", { entity_id: b.dataset.sw })));
    const m = this.shadowRoot.getElementById("menu");
    if (m) m.addEventListener("click", () => this.dispatchEvent(new Event("hass-toggle-menu", { bubbles: true, composed: true })));
  }
}
customElements.define("fenster-heizung-panel", FensterHeizungPanel);
