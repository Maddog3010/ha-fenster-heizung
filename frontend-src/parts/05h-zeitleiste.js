  /* ================= Modul 1 · „Warum?“ als Zeitleiste (D3) ================= */

  /* ---- D3: Zeitleiste. Verlauf der letzten 12 Std. aus Home Assistant (Fenster, Modus, Präsenz) plus geplante Punkte */
  _wtLoad(r) {
    const c = (this._wtC = this._wtC || {}), k = r.id, now = Date.now();
    if (c[k] && (c[k].busy || now - c[k].ts < 60000)) return c[k];
    const ids = [...(r.windows || []), r.modeEid, r.pres && r.pres.melder].filter(Boolean);
    c[k] = { busy: true, ts: now, ev: (c[k] && c[k].ev) || null };
    this._hass.callWS({ type: "history/history_during_period", start_time: new Date(now - 12 * 3600e3).toISOString(), end_time: new Date(now).toISOString(), entity_ids: ids, include_start_time_state: false, significant_changes_only: false, minimal_response: true, no_attributes: true })
      .then((res) => { c[k] = { busy: false, ts: Date.now(), ev: this._wtEvents(r, res || {}) }; if (this._modal && this._modal.type === "why" && this._modal.id === k) this._renderModal(); })
      .catch(() => { c[k] = { busy: false, ts: Date.now(), ev: [] }; if (this._modal && this._modal.type === "why") this._renderModal(); });
    return c[k];
  }
  _wtEvents(r, res) {
    const st = this._hass.states, nm = (e) => (st[e] && st[e].attributes.friendly_name) || e, ev = [], t = (x) => (x.lu ?? x.lc ?? 0) * 1000;
    const MT = { heizung_pausiert: ["Heizung pausiert", "am"], regelung_aktiv: ["Heizung läuft wieder", "ok"], nur_fenstermeldung: ["Heizung aus, nur Fenstermeldung", "in"], regelung_aus: ["Regelung ausgeschaltet", "in"] };
    for (const w of r.windows || []) {
      let prev = null;
      for (const x of res[w] || []) { const k = this._rkWin({ state: x.s }); if (prev !== null && k !== prev) ev.push({ t: t(x), c: k === "closed" ? "ok" : "bl", x: `${nm(w)} ${k === "open" ? "geöffnet" : k === "tilt" ? "gekippt" : "geschlossen"}` }); prev = k; }
    }
    let pm = null;
    for (const x of res[r.modeEid] || []) { if (pm !== null && x.s !== pm && MT[x.s]) ev.push({ t: t(x), c: MT[x.s][1], x: MT[x.s][0] }); pm = x.s; }
    const pe = r.pres && r.pres.melder; let pp = null;
    for (const x of res[pe] || []) { const on = ["on", "home", "detected", "occupied"].includes(x.s) || Number(x.s) > 0; if (pp !== null && on !== pp) ev.push({ t: t(x), c: "pr", x: on ? "Bewegung im Raum erkannt" : "Präsenzmelder: niemand mehr da" }); pp = on; }
    /* heutige Schaltpunkte des Heizplans, die schon vorbei sind */
    const s = this._rkState(r), d0 = new Date(); d0.setHours(0, 0, 0, 0);
    if (s.planOn) s.pts.filter((p) => p.w >= s.today * 1440 && p.w <= s.now && p.w >= s.now - 720).forEach((p) => ev.push({ t: d0.getTime() + (p.w % 1440) * 60000, c: "pl", x: `Heizplan: ${num(p.t, 1)} °C` }));
    return ev.filter((e) => e.t > Date.now() - 12 * 3600e3).sort((a, b) => a.t - b.t).slice(-12);
  }
  _wtFuture(r) {
    const s = this._rkState(r), out = [], need = ventMin(this._out().t);
    if (s.anyOpen && Date.now() >= s.since + need * 60000) out.push({ c: "am", x: "Genug gelüftet: Fenster schließen", s: `${need} Min. reichen bei ${this._out().t != null ? num(this._out().t, 0) + " °C draußen" : "dieser Außentemperatur"}` });
    else if (s.anyOpen) out.push({ c: "bl", x: `Lüften empfohlen bis ${new Date(s.since + need * 60000).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`, s: `${need} Min. bei ${this._out().t != null ? num(this._out().t, 0) + " °C draußen" : "dieser Außentemperatur"}` });
    if (r.mode === "heizung_pausiert") out.push({ c: "ok", x: s.anyOpen ? "Fortsetzen nach dem Schließen" : "Fortsetzen gleich (Verzögerung nach dem Schließen)", s: s.ziel != null ? `auf ${num(s.ziel, 1)} °C` : "" });
    if (s.planOn) { const nx = nextPt(s.pts, s.now); if (nx) out.push({ c: "pl", x: `Heizplan ab ${(nx.w % 10080) >= s.today * 1440 && nx.w < (s.today + 1) * 1440 ? "" : "morgen "}${fmtT(nx.w % 1440)}: ${num(nx.t, 1)} °C`, s: "" }); }
    if (s.pres && s.pres.anwesend && !s.pres.gesperrt) out.push({ c: "pr", x: `Bei Leerstand zurück auf den Heizplan`, s: `nach ${s.pres.verz_aus} Min. ohne Bewegung` });
    return out.slice(0, 3);
  }
  _wtHtml(r) {
    if (!this._rkOn()) return "";
    const L = this._wtLoad(r), tm = (ms) => new Date(ms).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }), s = this._rkState(r);
    const past = L.ev == null ? `<div class="wt0 mut sm">Verlauf wird geladen …</div>` : L.ev.length ? L.ev.map((e) => `<div class="wti ${e.c}"><time>${tm(e.t)}</time><i></i><span>${esc(e.x)}</span></div>`).join("") : `<div class="wt0 mut sm">In den letzten 12 Stunden ist nichts passiert.</div>`;
    const now = `<div class="wti now" style="--c:${s.col}"><time>jetzt</time><i></i><span><b>${esc(s.lab)}</b>${s.cur != null ? ` · ${num(s.cur, 1)} °C` : ""}${s.ziel != null ? ` → ${num(s.ziel, 1)} °C` : ""}</span></div>`;
    const fut = this._wtFuture(r).map((e) => `<div class="wti fut ${e.c}"><time>geplant</time><i></i><span>${esc(e.x)}${e.s ? `<small>${esc(e.s)}</small>` : ""}</span></div>`).join("");
    return `<div class="lsec">${ic("clock", 15)}Verlauf und was als Nächstes passiert</div><div class="wtl">${past}${now}${fut}</div><div class="lsec">${ic("info", 15)}Gründe im Moment</div>`;
  }

