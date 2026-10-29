class FensterHeizungPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._narrow = false; this._edit = false; this._modal = null; this._dragging = false;
    this._cfg = { layout: { blocks: [], rooms: [], icons: {}, groups: [] }, plans: {}, presence: { mode: "home" } };
    this._gen = { updates: true, summer: { mode: "auto", temp: 18, days: 3 }, wxadj: { on: false, mild: 12, down: 1, frost: 0, up: 1 }, pv: { ...PVDEF } };
    this._learn = {}; this._st = null; this._stOpen = false; this._labOpen = false; this._ortOpen = false; this._igOpen = false; this._pollN = 0;
  }
  connectedCallback() {
    this._ro = new ResizeObserver(() => { if (this._hass && !this._dragging && Math.abs(this.clientWidth - (this._w || 0)) > 24) this._render(); });
    this._ro.observe(this);
    this._ti = setInterval(() => this._tick(), 1000);
  }
  disconnectedCallback() { this._ro && this._ro.disconnect(); clearInterval(this._ti); }
  _tick() {
    this._tmTick();
    if (this._hass && ++this._pollN % 60 === 0) { this._pollGen(); this._mdPoll(); }
    this.shadowRoot.querySelectorAll("[data-since]").forEach((el) => {
      const c = cdown(+el.dataset.since, +el.dataset.need), b = el.querySelector("[data-cd]"), f = el.querySelector("[data-bar]");
      if (b) b.textContent = c.txt; if (f) f.style.width = c.pct + "%"; el.classList.toggle("done", c.left <= 0);
    });
  }
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
      this._st = r.status || null;
      this._gen = { updates: true, summer: { mode: "auto", temp: 18, days: 3 }, wxadj: { on: false, mild: 12, down: 1, frost: 0, up: 1 }, ...(r.general || {}) };
      this._gen.summer = { mode: "auto", temp: 18, days: 3, ...(this._gen.summer || {}) };
      this._gen.wxadj = { on: false, mild: 12, down: 1, frost: 0, up: 1, ...(this._gen.wxadj || {}) };
      this._gen.pv = { ...PVDEF, ...(this._gen.pv || {}) };
      this._mdApply(r);
    } catch (e) { /* älteres Backend: Standardwerte */ }
    this._cfgReady = true;
    try { await this._tmLoad(); } catch (_) { /* Tablet-Modus ist optional */ }
    try { await this._spnLoad(); this._spnApply(); } catch (_) { /* Sponsor-Bereich ist optional */ }
    try { this._upd = await this._hass.callWS({ type: "fenster_heizung/get_update" }); } catch (_) { this._upd = null; }
    this._render();
  }
  _admin() { return !!(this._hass && this._hass.user && this._hass.user.is_admin); }
  _saveLayout() { this._hass.callWS({ type: "fenster_heizung/set_layout", layout: this._cfg.layout }).catch(() => this._toast("Layout konnte nicht gespeichert werden")); }
  _toast(msg) {
    const t = this.shadowRoot.getElementById("toast"); if (!t) return;
    t.innerHTML = `<div class="toast">${esc(msg)}</div>`; clearTimeout(this._tt);
    this._tt = setTimeout(() => (t.innerHTML = ""), 2600);
  }

  _my() { try { const j = JSON.parse(localStorage.getItem("fh_my") || "{}"); return { on: !!j.on, hidden: j.hidden || [], order: j.order || [], hb: j.hb || [] }; } catch (_) { return { on: false, hidden: [], order: [], hb: [] }; } }
  _mySet(m) { try { localStorage.setItem("fh_my", JSON.stringify(m)); } catch (_) { /* privater Modus */ } }
  _collect(raw) {
    const l = this._collect0(), my = this._my();
    if (raw || this._edit || !my.on) return l;
    const v = l.filter((r) => !my.hidden.includes(r.id));
    return my.order.length ? v.sort((x, y) => { const a = my.order.indexOf(x.id), b = my.order.indexOf(y.id); return (a < 0 ? 999 : a) - (b < 0 ? 999 : b); }) : v;
  }
  _collect0() {
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
      if (eid.startsWith("switch.")) { if (a.funktion === "heizplan") { r.planOn = st.state === "on"; } else if (a.funktion === "heizer") { r.htrSw = eid; r.htrOn = st.state === "on"; } else { r.sw = eid; r.on = st.state === "on"; } }
      else if (a.zeitraum) {
        r.fuel = FUELS[a.brennstoff] ? a.brennstoff : "erdgas";
        r.sc[a.zeitraum] = { min: Number(st.state) || 0, gas: Number(a.gespart_menge ?? a.gespartes_gas_m3) || 0, kwh: a.gespartes_gas_kwh || 0 };
        r.apk = Number(a.menge_pro_kwh) || r.apk || 0.1;
        if (a.zeitraum === "day") { r.pauses = a.pausen_heute || 0; r.kw = a.aktuelle_leistung_kw || 0; r.hist = a.verlauf || {}; }
      } else if ("thermostate" in a) {
        r.modeEid = eid; r.mode = st.state; r.why = a.grund || []; r.windows = a.fenster || []; r.thermos = Object.keys(a.thermostate || {}); if (a.entry_id) r.id = a.entry_id; r.humEid = a.luftfeuchte_sensor || ""; r.rtEid = a.raumtemperatur_sensor || ""; r.rtUse = a.raumtemperatur_nutzung || {}; r.rtVal = typeof a.raumtemperatur_wert === "number" ? a.raumtemperatur_wert : null; r.wxOff = a.wetter_anpassung === "aus"; r.htr = a.heizer || null; r.airOff = a.lueftungshinweise === "aus"; r.airEvery = a.lueften_nach_h != null ? Number(a.lueften_nach_h) : 8; r.lastAir = a.zuletzt_gelueftet ? new Date(a.zuletzt_gelueftet).getTime() : 0;
      }
    }
    const list = [...rooms.values()];
    const cc = this._cfg.layout.colors || {};
    [...list].sort((x, y) => x.name.localeCompare(y.name, "de")).forEach((r, i) => { r.ci = i; r.color = HEX.test(cc[r.id] || "") ? cc[r.id] : COLORS[i % COLORS.length]; });
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
    const known = Object.keys(BLOCKS), o = (this._cfg.layout.blocks || []).filter((b) => known.includes(b)), my = this._my();
    const miss = known.filter((b) => !o.includes(b));
    let all = [...o, ...miss];
    if (miss.includes("pv") && all.includes("rooms")) { all = all.filter((b) => b !== "pv"); all.splice(all.indexOf("rooms"), 0, "pv"); }
    return my.on && !this._edit ? all.filter((b) => !my.hb.includes(b)) : all;
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
