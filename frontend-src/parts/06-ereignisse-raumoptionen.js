  _build() {
    const sr = this.shadowRoot;
    sr.innerHTML = `<style>${CSS}</style><div id="main"></div><div id="modal"></div><div id="toast"></div>`;
    this._built = true; this._t0 = Date.now();
    /* Ein Klick zählt nur, wenn der Finger oder die Maus auch hier aufgesetzt wurde. So lösen Geisterklicks (zum Beispiel nach dem Antippen der Seitenleiste oder beim Wischen) keine Schaltfläche aus. Tastatur (detail 0) bleibt erlaubt. */
    const sig = (b) => `${b.dataset.act}|${b.dataset.k || ""}|${b.dataset.id || ""}|${b.dataset.i || ""}`;
    sr.addEventListener("pointerdown", (e) => { const b = e.target.closest && e.target.closest("[data-act]"); this._pd = b ? { s: sig(b), t: Date.now() } : null; }, true);
    sr.addEventListener("click", (e) => { const b = e.target.closest("[data-act]"); if (!b) return; if (e.detail !== 0 && !(this._pd && this._pd.s === sig(b) && Date.now() - this._pd.t < 2000)) return; if (b.dataset.act === "mdst" && Date.now() - (this._t0 || 0) < 1200) return; this._act(b.dataset.act, b); });
    /* Wischen auf der Modulleiste soll nicht die Seitenleiste von Home Assistant öffnen. */
    sr.addEventListener("touchstart", (e) => { if (e.target.closest && e.target.closest(".mbar,.rdays,.sxl,.ohint")) e.stopPropagation(); }, { passive: true });
    const hov = (e) => { const c = e.target.closest && e.target.closest(".rchart"); if (!c || !this._repGeo) return; const bb = c.getBoundingClientRect(), g = this._repGeo; this._repHover(Math.min(1439, Math.max(0, ((e.clientX - bb.left) / bb.width * g.W - g.L) / g.iw * 1440))); };
    sr.addEventListener("pointermove", hov); sr.addEventListener("pointerdown", hov);
    const whv = (e) => { const c = e.target.closest && e.target.closest(".wwc2"); if (!c || !this._wwGeo) return; const bb = c.getBoundingClientRect(), g = this._wwGeo; this._wwHover(Math.min(g.total, Math.max(0, ((e.clientX - bb.left) / bb.width * g.W - g.L) / g.iw * g.total))); };
    sr.addEventListener("pointermove", whv); sr.addEventListener("pointerdown", whv);
    const hhov = (e) => { const c = e.target.closest && e.target.closest(".hchart"); if (!c || !this._hrGeo) return; const bb = c.getBoundingClientRect(), g = this._hrGeo; this._hrHover(Math.min(1439, Math.max(0, Math.round((((e.clientX - bb.left) / bb.width) * g.W - g.L) / g.iw * 1440)))); };
    sr.addEventListener("pointermove", hhov); sr.addEventListener("pointerdown", hhov);
    sr.addEventListener("input", (e) => this._onInput(e.target));
    sr.addEventListener("pointerdown", (e) => { const g = e.target.closest("[data-handle]"); if (g) this._dragStart(e, g); });
    sr.addEventListener("input", (e) => { const t = e.target; if (t.dataset && t.dataset.f === "enq") { const q = t.value.trim().toLowerCase(); let n = 0; t.closest(".pkbox").querySelectorAll(".pkrow").forEach((r) => { const ok = !q || r.dataset.s.includes(q); r.hidden = !ok; if (ok) n++; }); const z = t.closest(".pkbox").querySelector(".pkno"); if (z) z.hidden = n > 0; } });
    sr.addEventListener("change", (e) => this._onChange(e.target));
  }

  _onChange(t) {
      if (t.dataset && (t.dataset.f === "vnotify" || t.dataset.f === "vwarn" || t.dataset.f === "vdays" || t.dataset.f === "vbat" || t.dataset.f === "vbatinv")) { const v = { ...this._vcfg() }; if (t.dataset.f === "vbat" || t.dataset.f === "vbatinv") { const bs = { ...(v.batsrc || {}) }, e = t.dataset.e, cur = bs[e] || { src: "", inv: false }; if (t.dataset.f === "vbat") { if (t.value) bs[e] = { src: t.value, inv: t.value.startsWith("binary_sensor.") ? !!cur.inv : false }; else delete bs[e]; } else if (bs[e]) bs[e] = { ...bs[e], inv: t.checked }; v.batsrc = bs; } else if (t.dataset.f === "vnotify") v.notify = t.value; else if (t.dataset.f === "vdays") { const n = Number(String(t.value).replace(",", ".")); v.days = isFinite(n) ? Math.min(60, Math.max(1, Math.round(n))) : 7; } else { const n = Number(String(t.value).replace(",", ".")); v.warn = isFinite(n) ? Math.min(60, Math.max(11, Math.round(n))) : 20; } this._gen.valve = v; this._saveGen(); this._renderModal(); return; }
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("wz") && this._wzChange(t)) return;
      if (t.dataset && t.dataset.f && (t.dataset.f.startsWith("md") || t.dataset.f.startsWith("ww") || t.dataset.f.startsWith("en") || t.dataset.f.startsWith("gs") || t.dataset.f.startsWith("ev")) && this._mdChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("ort") && this._ortChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("ig") && this._igChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("wxs") && this._wxsChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("sfx") && this._sfxChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("wb") && this._wbChange(t)) return;
      if (this._lookChange(t)) return;
      if (t.dataset && t.dataset.k === "htr_steps" && this._modal && this._modal.type === "opt") { this._renderModal(); return; }
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("v") && this._modal && this._modal.type === "vac") { const k = { vfrom: "from", vto: "to", vtime: "preheat_time" }[t.dataset.f]; this._modal.draft[k] = t.value; if (k === "from" && t.value > this._modal.draft.to) this._modal.draft.to = t.value; this._renderModal(); }
      else if (t.dataset && t.dataset.f === "gname" && this._modal) { this._modal.draft.name = t.value; }
      else if (t.dataset && t.dataset.f === "time" && this._modal) { this._modal.draft.entries[+t.dataset.i].time = t.value || "00:00"; this._renderModal(); }
  }
  _onInput(t) { if (t.dataset && t.dataset.f === "hpre" && this._modal && this._modal.type === "opt") { const D = this._modal.draft, a = Array.isArray(D.htr_presets) ? [...D.htr_presets] : []; a[+t.dataset.i] = t.value; D.htr_presets = a; return; } if (t.dataset && t.dataset.f === "oadd" && this._modal && this._modal.type === "opt") { if (t.value) { this._modal.draft[t.dataset.k].push(t.value); this._renderModal(); } return; } if (t.dataset && t.dataset.f === "oval" && this._modal && this._modal.type === "opt") { const D = this._modal.draft; D[t.dataset.k] = t.dataset.num ? (t.value === "" ? "" : Number(t.value)) : t.value; if (t.tagName === "SELECT" || t.dataset.k === "room_area") this._renderModal(); return; } if (t.dataset && t.dataset.f === "gname" && this._modal) this._modal.draft.name = t.value;  }

  /* ---------------- Aktionen ---------------- */
  _act(a, b) {
    const m = this._modal, i = +b.dataset.i, id = b.dataset.id;
    if (a === "menu") this.dispatchEvent(new Event("hass-toggle-menu", { bubbles: true, composed: true }));
    else if (a === "pkopen") { this._pkId = this._pkId === b.dataset.pid ? null : b.dataset.pid; this._renderModal(); const q = this.shadowRoot.querySelector(".pksearch"); if (q) q.focus(); }
    else if (a === "pkpick") { const meta = (this._pkReg || {})[b.dataset.pid]; this._pkId = null; if (meta) { const t = { dataset: { ...meta }, value: b.dataset.v, tagName: "SELECT" }; this._onInput(t); this._onChange(t); } this._renderModal(); }
    else if (a.startsWith("md") || a.startsWith("ww") || a.startsWith("en") || (a.startsWith("gs") && a !== "gsum") || a.startsWith("ev")) this._mdAct(a, b);
    else if (a.startsWith("ort")) this._ortAct(a, b);
    else if (a.startsWith("sto")) this._stoAct(a, b);
    else if (a.startsWith("ig")) this._igAct(a, b);
    else if (a.startsWith("wxs")) this._wxsAct(a, b);
    else if (a.startsWith("sfx")) this._sfxAct(a, b);
    else if (a.startsWith("wb")) this._wbAct(a, b);
    else if (["gtog", "gsw", "gmv", "gedit", "gadd", "gpick", "gicon", "gsave", "gdel"].includes(a)) this._gActions(a, b);
    else if (a === "opt") this._optOpen(id);
    else if (a === "oadd") this._nav(HA_PAGE);
    else if (a === "wz") this._wzOpen();
    else if (a === "diag") this._dgOpen(b.dataset.k);
    else if (a.startsWith("dg") && m && m.type === "diag") this._dgAct(a, b);
    else if (a.startsWith("wz") && m && m.type === "wiz") this._wzAct(a, b);
    else if (m && m.type === "opt") this._optAct(a, b);
    else if (a === "rep") this._repOpen(id);
    else if (a === "repday") { m.day = b.dataset.d; m.keepScroll = b.closest(".rdays").scrollLeft; this._repLoad(m).then(() => {}); this._renderModal(); }
    else if (a === "repnav") { const ds = this._repDays(), k = ds.findIndex((x) => x.iso === m.day) + +b.dataset.s; if (ds[k]) { m.day = ds[k].iso; m.keepScroll = this.shadowRoot.querySelector(".rdays")?.scrollLeft; this._repLoad(m).then(() => {}); this._renderModal(); } }
    else if (a === "sw") this._hass.callService("switch", "toggle", { entity_id: b.dataset.sw });
    else if (a === "edit") { this._edit = true; this._render(); }
    else if (a === "done") { this._edit = false; this._render(); }
    else if (a === "view") { try { localStorage.setItem("fh_view", b.dataset.k); } catch (_) { /* Speicher gesperrt */ } this._render(); }
    else if (a === "plan") this._openPlan(id);
    else if (a === "icon") { this._modal = { type: "icon", id }; this._renderModal(); }
    else if (a === "airsetup") { this._optOpen(id).then(() => { if (this._modal && this._modal.type === "opt") { this._modal.open.add("air"); this._renderModal(); } }); }
    else if (a === "hrep") this._hrOpen(id);
    else if (a === "hrepall") { this._modal = { type: "hrepall" }; this._renderModal(); }
    else if (a === "hrday") { m.day = b.dataset.d; this._hrLoad(m); this._renderModal(); }
    else if (a === "gpvpm") { this._gen.pv = { ...this._pv(), [b.dataset.p + "_mode"]: b.dataset.k }; this._saveGen(); this._render(); this._renderModal(); }
    else if (a === "gpvsign") { this._gen.pv = { ...this._pv(), sign: b.dataset.k }; this._saveGen(); this._render(); this._renderModal(); }
    else if (a === "fhset") { this._modal = { type: "fh" }; this._renderModal(); }
    else if (a === "fhsec") { const s = this._fhOpenSet(); s.has(b.dataset.k) ? s.delete(b.dataset.k) : s.add(b.dataset.k); try { localStorage.setItem("fh-open", JSON.stringify([...s])); } catch (_) {} this._renderModal(); }
    else if (a === "gen") { this._modal = { type: "gen", restore: null }; this._renderModal(); }
    else if (a === "news") { this._modal = { type: "news" }; this._renderModal(); }
    else if (a === "updx") { try { localStorage.setItem("fh_upd_skip", this._upd.latest); } catch (_) { /* egal */ } this._render(); this._toast("Hinweis ausgeblendet bis zur nächsten Version"); }
    else if (a === "skipv") { try { localStorage.setItem("fh_upd_skip", this._upd.latest); } catch (_) { /* egal */ } this._modal = null; this._renderModal(); this._render(); }
    else if (a === "hacs") { this._modal = null; this._renderModal(); this._nav("/hacs"); }
    else if (a === "chk") {
      this._toast("Prüfe auf neue Version …");
      this._hass.callWS({ type: "fenster_heizung/get_update", force: true }).then((u) => {
        this._upd = u || this._upd;
        if (u && u.error) this._toast(`Prüfung nicht möglich: ${u.error}`);
        else this._toast(u && vgt(u.latest, this._ver) ? `Version ${u.latest} ist verfügbar` : `Du hast die neueste Version${this._ver ? " (" + this._ver + ")" : ""}`);
        this._render(); this._renderModal();
      }).catch(() => this._toast("Prüfung nicht möglich"));
    }
    else if (a === "gupd") { this._gen.updates = this._gen.updates === false; this._saveGen(); this._render(); this._renderModal(); }
    else if (a === "gsum") { this._gen.summer = { ...this._gen.summer, mode: b.dataset.k }; this._saveGen(); this._render(); this._renderModal(); }
    else if (a === "gdays") { this._gen.summer = { ...this._gen.summer, days: Number(b.dataset.k) }; this._saveGen(); this._render(); this._renderModal(); }
    else if (a === "gwx") { this._gen.wxadj = { ...this._gen.wxadj, on: !this._gen.wxadj.on }; this._saveGen(); this._render(); this._renderModal(); }
    else if (a === "bk") this._backup();
    else if (a === "rs") { const f = this.shadowRoot.querySelector('input[data-f="rsfile"]'); if (f) f.click(); }
    else if (a === "rsno") { this._modal.restore = null; this._renderModal(); }
    else if (a === "rsgo") this._restore();
    else if (a === "my") { this._modal = { type: "my" }; this._renderModal(); }
    else if (a === "mytog") { const x = this._my(); x.on = !x.on; this._mySet(x); this._render(); this._renderModal(); }
    else if (a === "myvis") { const x = this._my(), id = b.dataset.id; x.hidden = x.hidden.includes(id) ? x.hidden.filter((i) => i !== id) : [...x.hidden, id]; x.on = true; this._mySet(x); this._render(); this._renderModal(); }
    else if (a === "myblk") { const x = this._my(), id = b.dataset.id; x.hb = x.hb.includes(id) ? x.hb.filter((i) => i !== id) : [...x.hb, id]; x.on = true; this._mySet(x); this._render(); this._renderModal(); }
    else if (a === "mymv") { const x = this._my(), ids = this._collect(true).map((r) => r.id), cur = x.order.length ? [...x.order.filter((i) => ids.includes(i)), ...ids.filter((i) => !x.order.includes(i))] : ids, i = cur.indexOf(b.dataset.id), j = i + Number(b.dataset.d); if (i >= 0 && j >= 0 && j < cur.length) { [cur[i], cur[j]] = [cur[j], cur[i]]; x.order = cur; x.on = true; this._mySet(x); this._render(); this._renderModal(); } }
    else if (a === "myreset") { this._mySet({ on: false, hidden: [], order: [], hb: [] }); this._render(); this._renderModal(); }
    else if (a === "look") { this._modal = { type: "look" }; this._renderModal(); }
    else if (a === "lacc") { this._cfg.layout.accent = b.dataset.k || ""; this._saveLayout(); this._render(); this._renderModal(); }
    else if (a === "hmode") { const hc = this._heroCfg(); this._cfg.layout.hero = { mode: b.dataset.k, own: hc.own }; this._saveLayout(); this._render(); this._renderModal(); }
    else if (a === "hup") { this._heroTarget = b.dataset.k; const inp = this.shadowRoot.querySelector("[data-f=hfile]"); if (inp) inp.click(); }
    else if (a === "hdel") { const hc = this._heroCfg(), own = { ...hc.own }; delete own[b.dataset.k]; this._cfg.layout.hero = { mode: hc.mode, own }; this._saveLayout(); this._render(); this._renderModal(); }
    else if (a === "lwx") { this._cfg.layout.wx = { ...(this._cfg.layout.wx || {}), on: !this._wxCfg().on }; this._saveLayout(); this._render(); this._renderModal(); }
    else if (a === "rcol") { const c = { ...(this._cfg.layout.colors || {}) }; if (b.dataset.k) c[m.id] = b.dataset.k; else delete c[m.id]; this._cfg.layout.colors = c; this._saveLayout(); this._render(); this._renderModal(); }
    else if (a === "rphoto") { const f = this.shadowRoot.querySelector('[data-f="rfile"]'); if (f) f.click(); }
    else if (a === "rphotodel") { const c = { ...(this._cfg.layout.photos || {}) }; delete c[m.id]; this._cfg.layout.photos = c; this._saveLayout(); this._render(); this._renderModal(); }
    else if (a === "close") { this._modal = null; this._renderModal(); }
    else if (a === "pick") { this._cfg.layout.icons = { ...(this._cfg.layout.icons || {}), [m.id]: b.dataset.k }; this._saveLayout(); this._render(); this._renderModal(); }
    else if (a === "preset") { const ic2 = { ...(this._cfg.layout.icons || {}) }; delete ic2[m.id]; this._cfg.layout.icons = ic2; this._saveLayout(); this._render(); this._renderModal(); }
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
      else if (a === "pday") m.day = m.day === +b.dataset.d ? null : +b.dataset.d;
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
  _nav(path) {
    try { history.pushState(null, "", path); window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } })); } catch (_) { location.href = path; }
  }
  async _optOpen(id) {
    if (!this._admin()) return;
    let res;
    try { res = await this._hass.callWS({ type: "fenster_heizung/get_options", entry_id: id }); } catch (_) { this._toast("Einstellungen konnten nicht geladen werden"); return; }
    const o = (res && res.options) || {};
    const d = { window_sensors: [], thermostats: [], open_delay: 60, close_delay: 30, action: "off", setback_temp: 12, heating_entity: "", heating_off_states: "off", outdoor_sensor: "", outdoor_max_temp: 15, block_from: "", block_to: "", notify_service: [], notify_after: 0, notify_title: "", notify_message: "", fuel: "erdgas", energy_per_unit: "", cop: 3.5, room_area: 0, heat_load_w_m2: 60, design_temp: -12, heat_power_kw: 1, humidity_sensor: "", air_hint: "on", weather_adj: "on", air_every: 8, htr_on: "off", htr_entity: "", htr_watt: 1500, htr_target: 22, htr_prio: 5, htr_steps: "", htr_thermo: "off", htr_auto: "on", htr_presets: [], htr_devtemp: "max", htr_from: "", htr_to: "" };
    for (const k of Object.keys(d)) if (o[k] !== undefined && o[k] !== null) d[k] = Array.isArray(o[k]) ? [...o[k]] : o[k];
    if (Array.isArray(d.htr_steps)) d.htr_steps = d.htr_steps.join(", ");
    this._modal = { type: "opt", id, name: (res && res.name) || "", draft: d, open: new Set(["dev", "ctl"]), busy: false };
    this._renderModal();
  }
  async _optAct(a, b) {
    const m = this._modal, d = m.draft, k = b.dataset.k;
    if (a === "close") { this._modal = null; this._renderModal(); return; }
    else if (a === "osec") { m.open.has(k) ? m.open.delete(k) : m.open.add(k); }
    else if (a === "oset") d[k] = b.dataset.v;
    else if (a === "orm") d[k] = d[k].filter((x) => x !== b.dataset.e);
    else if (a === "oclr") d[k] = "";
    else if (a === "ohost" || a === "odel") { this._modal = null; this._renderModal(); this._nav(HA_PAGE); return; }
    else if (a === "osave") {
      if (m.busy) return;
      m.busy = true; this._renderModal();
      try {
        await this._hass.callWS({ type: "fenster_heizung/set_options", entry_id: m.id, options: d });
        this._modal = null; this._renderModal(); this._toast("Einstellungen gespeichert");
        setTimeout(() => this._load && this._load(), 2500);
      } catch (e) { m.busy = false; this._toast((e && e.message) || "Speichern fehlgeschlagen"); this._renderModal(); }
      return;
    }
    this._renderModal();
  }
  _optBody(m) {
    const d = m.draft, st = this._hass.states, ent = (dom, cls) => Object.keys(st).filter((e) => e.startsWith(dom + ".") && (!cls || st[e].attributes.device_class === cls));
    const notify = Object.keys((this._hass.services && this._hass.services.notify) || {}).filter((n) => !["send_message", "reload"].includes(n)).map((n) => "notify." + n).sort();
    const fn = (e) => esc((st[e] && st[e].attributes.friendly_name) || e);
    const usedTh = new Set(this._collect(true).flatMap((r) => r.thermos || []));
    const row = (label, hint, ctl) => `<div class="of"><div class="ol"><b>${label}</b>${hint ? `<span>${hint}</span>` : ""}</div><div class="oc">${ctl}</div></div>`;
    const num = (k, unit, o = {}) => row(o.l, o.h, `<span class="onum"><input type="number" inputmode="decimal" data-f="oval" data-k="${k}" data-num="1" value="${d[k]}" min="${o.min ?? ""}" max="${o.max ?? ""}" step="${o.step ?? 1}" ${o.ph ? `placeholder="${o.ph}"` : ""}><i>${unit}</i></span>`);
    const txt = (k, o = {}) => row(o.l, o.h, `<input class="otxt" data-f="oval" data-k="${k}" value="${esc(d[k])}">`);
    const time = (k, o) => row(o.l, o.h, `<span class="onum"><input type="time" data-f="oval" data-k="${k}" value="${d[k] || ""}">${d[k] ? `<button class="oclr" data-act="oclr" data-k="${k}" aria-label="Zurücksetzen">${ic("close", 14)}</button>` : ""}</span>`);
    const seg = (k, opts) => `<div class="seg oseg">${opts.map(([v, l]) => `<button class="${d[k] === v ? "sel" : ""}" data-act="oset" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
    const multi = (k, cand, l, h) => row(l, h, `<div class="ochips">${d[k].map((e) => `<span class="och">${fn(e)}<button data-act="orm" data-k="${k}" data-e="${esc(e)}" aria-label="Entfernen">${ic("close", 12)}</button></span>`).join("")}${this._wzSel(cand.filter((e) => !d[k].includes(e)), "", "oadd", `data-k="${k}"`, "＋ hinzufügen")}</div>`);
    const one = (k, cand, l, h) => { const c = d[k] && !cand.includes(d[k]) ? [d[k], ...cand] : cand; return row(l, h, this._wzSel(c, d[k], "oval", `data-k="${k}"`, "– keine –")); };
    const FU = { erdgas: ["Erdgas", "m³", 10], heizoel: ["Heizöl", "l", 10], fluessiggas: ["Flüssiggas", "l", 6.6], pellets: ["Pellets", "kg", 4.8], strom: ["Wärmepumpe / Strom", "kWh", 1] }, fu = FU[d.fuel] || FU.erdgas;
    const sec = (id, ic2, title, sum, body) => `<section class="osec ${m.open.has(id) ? "open" : ""}"><button class="oh" data-act="osec" data-k="${id}" aria-expanded="${m.open.has(id)}"><span class="oi">${ic(ic2, 18)}</span><div><b>${title}</b><span>${sum}</span></div>${ic("chev", 18)}</button>${m.open.has(id) ? `<div class="ob">${body}</div>` : ""}</section>`;
    const A = d.action === "setback" ? `Absenken auf ${num0(d.setback_temp)} °C` : "Thermostat aus";
    return [
      sec("dev", "window", "Fenster &amp; Thermostate", `${d.window_sensors.length} Fenster · ${d.thermostats.length} Thermostat${d.thermostats.length === 1 ? "" : "e"}`,
        multi("window_sensors", ent("binary_sensor"), "Fenstersensoren") + multi("thermostats", ent("climate"), "Heizungsthermostate") + this._hsRoomNote(d.thermostats)),
      sec("ctl", "radiator", "Regelung", `${d.open_delay} s auf · ${d.close_delay} s zu · ${A}`,
        num("open_delay", "s", { l: "Verzögerung nach Öffnen", h: "So lange muss das Fenster offen sein, bevor die Heizung pausiert.", min: 0, max: 3600, step: 5 }) +
        num("close_delay", "s", { l: "Verzögerung nach Schließen", min: 0, max: 3600, step: 5 }) +
        row("Aktion bei offenem Fenster", "", seg("action", [["off", "Thermostat aus"], ["setback", "Absenken"]])) +
        (d.action === "setback" ? num("setback_temp", "°C", { l: "Absenktemperatur", min: 5, max: 25, step: 0.5 }) : "") +
        one("heating_entity", ent("climate").concat(ent("binary_sensor"), ent("sensor"), ent("switch"), ent("input_boolean"), ent("input_select"), ent("select")), "Heizungs-Sensor (optional)", "Steht er auf einem „Heizung aus“-Zustand, wird nicht geregelt.") +
        txt("heating_off_states", { l: "Zustände für „Heizung aus“", h: "Komma getrennt, z. B. off" })),
      sec("cond", "clock", "Bedingungen", `${d.block_from && d.block_to ? "Sperrzeit " + d.block_from + "–" + d.block_to : "keine Sperrzeit"} · unter ${num0(d.outdoor_max_temp)} °C`,
        time("block_from", { l: "Sperrzeit von", h: "In dieser Zeit wird nicht geregelt, z. B. nachts." }) + time("block_to", { l: "Sperrzeit bis" }) +
        one("outdoor_sensor", ent("sensor", "temperature"), "Außentemperatursensor (optional)") +
        num("outdoor_max_temp", "°C", { l: "Nur regeln, wenn draußen kälter als", min: -20, max: 40, step: 0.5 })),
      sec("note", "info", "Erinnerung", d.notify_service.length ? `nach ${d.notify_after} Min. an ${d.notify_service.length} Gerät${d.notify_service.length === 1 ? "" : "e"}` : "aus",
        multi("notify_service", notify, "Benachrichtigungs-Aktionen", "Wie in den Entwicklerwerkzeugen, z. B. notify.mobile_app_handy.") +
        num("notify_after", "min", { l: "Erinnerung nach … Minuten offen", h: "0 = aus", min: 0, max: 240, step: 1 }) +
        txt("notify_title", { l: "Titel (optional)", h: "Platzhalter: {raum}, {minuten}, {fenster}" }) + txt("notify_message", { l: "Nachrichtentext" })),
      sec("air", "drop", "Raumluft", d.humidity_sensor ? fn(d.humidity_sensor) : `ohne Sensor${Number(d.air_every) > 0 ? ` · Lüften nach ${d.air_every} Std.` : ""}`,
        one("humidity_sensor", ent("sensor", "humidity"), "Luftfeuchte-Sensor", "Mit Sensor zeigt die Karte Luftfeuchte, Taupunkt und Schimmelrisiko. Ohne Sensor gibt es Lüftungs-Erinnerung, Wandtemperatur und kritische Feuchte.") +
        num("air_every", "Std.", { l: "Erinnern, wenn länger nicht gelüftet", h: "0 = aus. Gemessen am letzten Schließen des Fensters.", min: 0, max: 48, step: 1 }) +
        row("Lüftungshinweise und Schimmelwarnung", "Auf der Karte und als Erinnerung nach dem Lüften.", seg("air_hint", [["on", "An"], ["off", "Aus"]]))),
      sec("wxa", "partly", "Wetter-Anpassung", d.weather_adj === "off" ? "ausgenommen" : "folgt der allgemeinen Einstellung",
        row("Zieltemperatur nach Wetter anpassen", "Die Grenzwerte stellst du unter „Allgemein“ ein.", seg("weather_adj", [["on", "Ja"], ["off", "Ausnehmen"]]))),
      sec("htr", "bolt", "Elektroheizer", d.htr_on === "on" ? `${parseSteps(d.htr_steps).length > 1 ? parseSteps(d.htr_steps).length + " Stufen bis " + wfmt(parseSteps(d.htr_steps).slice(-1)[0]) : wfmt(parseSteps(d.htr_steps)[0] || d.htr_watt)} · bis ${d.htr_target} °C` : "nicht aktiviert",
        row("Elektroheizer in diesem Raum", "Heizt nur bei genug PV-Überschuss. Die Karte zeigt Status und Bericht.", seg("htr_on", [["off", "Aus"], ["on", "An"]])) +
        (d.htr_on === "on" ? one("htr_entity", ent("switch").concat(ent("climate").filter((e) => !usedTh.has(e) || e === d.htr_entity)), "Schalter oder Gerät des Heizers", "Ein Schalter oder ein Klima-Gerät. Thermostate der Räume stehen hier nicht zur Auswahl.") +
          txt("htr_steps", { l: "Leistungsstufen in Watt", h: "Falls der Heizer Stufen hat, z. B. 800, 1200, 1800. Leer = eine Stufe mit der Leistung unten." }) +
          (parseSteps(d.htr_steps).length ? `<div class="stpv">${parseSteps(d.htr_steps).map((w, i) => `<span><b>${i + 1}</b>${wfmt(w)}</span>`).join("")}</div>` : num("htr_watt", "W", { l: "Leistung des Heizers", h: "Nennleistung laut Typenschild.", min: 50, max: 5000, step: 50 })) +
          this._presetRows(d, st, row) +
          (parseSteps(d.htr_steps).length > 1 ? row("Stufen regeln", "Automatisch: höhere Stufe bei mehr Überschuss, niedrigere bei weniger. Fest: nur die höchste Stufe.", seg("htr_auto", [["on", "Automatisch"], ["off", "Fest"]])) : "") +
          row("Thermostat während des Heizers", "Aus = die Heizkörper-Thermostate des Raums werden abgestellt, solange der Heizer läuft. Danach regeln sie wieder.", seg("htr_thermo", [["off", "Ausschalten"], ["on", "Weiterlaufen"]])) +
          num("htr_target", "°C", { l: "Heizen bis", h: "Der Heizer schaltet ab, sobald der Raum so warm ist.", min: 10, max: 30, step: 0.5 }) +
          num("htr_prio", "", { l: "Priorität", h: "1 wird zuerst versorgt, wenn der Überschuss nicht für alle reicht.", min: 1, max: 9, step: 1 }) +
          time("htr_from", { l: "Erlaubt ab", h: "Optional. Leer = ganztägig." }) + time("htr_to", { l: "Erlaubt bis" }) : "")),
      sec("fuel", "flame", "Brennstoff &amp; Ersparnis", `${fu[0]} · ${d.energy_per_unit || fu[2]} kWh/${fu[1]}${Number(d.room_area) > 0 ? " · " + d.room_area + " m²" : ""}`,
        row("Brennstoff", "Bestimmt Einheit und Beschriftung im Dashboard.", `<select class="osel" data-f="oval" data-k="fuel">${Object.entries(FU).map(([v, x]) => `<option value="${v}" ${d.fuel === v ? "selected" : ""}>${x[0]} (${x[1]})</option>`).join("")}</select>`) +
        num("energy_per_unit", "kWh/" + fu[1], { l: "Energie pro Einheit", h: "Leer = Standard des Brennstoffs.", min: 0, max: 40, step: 0.1, ph: String(fu[2]) }) +
        (d.fuel === "strom" ? num("cop", "", { l: "Jahresarbeitszahl JAZ / COP", h: "Nur Wärmepumpe.", min: 1, max: 8, step: 0.1 }) : "") +
        num("room_area", "m²", { l: "Raumfläche", h: "Größer als 0: Heizleistung wird berechnet. 0 = feste Leistung.", min: 0, max: 300, step: 0.5 }) +
        (Number(d.room_area) > 0 ? num("heat_load_w_m2", "W/m²", { l: "Spezifische Heizlast", h: "Neubau ca. 40, saniert ca. 60, Altbau ca. 100.", min: 10, max: 250, step: 1 }) + num("design_temp", "°C", { l: "Auslegungs-Außentemperatur", min: -30, max: 5, step: 0.5 }) : num("heat_power_kw", "kW", { l: "Feste Heizleistung des Raums", min: 0.1, max: 30, step: 0.1 }))),
    ].join("");
  }
  _uid() { return "e" + Math.random().toString(36).slice(2, 8); }
  _openPlan(id) {
    if (!this._admin()) return;
    const p0 = this._cfg.plans[id] || { enabled: true, entries: [] }, pr = this._collect().find((x) => x.id === id), p = { ...p0, enabled: pr && pr.planOn !== undefined ? pr.planOn : p0.enabled };
    const draft = { mode: p.mode || "heat", enabled: p.entries.length ? p.enabled : true, entries: p.entries.map((e) => ({ ...e, days: [...e.days], id: e.id || this._uid() })) };
    this._modal = { type: "plan", id, draft, day: Math.floor(nowMin() / 1440) };
    this._renderModal();
  }
