  /* ================= Startseite · Neue Optik Stufe 2 (Konzept_Startseite_Neue-Optik, Teil B und C) =================
     B · Kacheln 2.0: die wichtigste Zahl je Modul groß, rechts Ring (Anteile) oder Mini-Verlauf (24 Std. aus der HA-Historie),
         fünf Zustände (gut, aktiv, Hinweis, Warnung, aus), Größe S (nur Zahl), M (Standard), L (mit großem Verlauf).
     C · Hinweise-Zentrale: sortiert nach Warnung, Hinweis, Info; Quelle und Zeit an jedem Hinweis; „Später“ (1 Std., heute Abend,
         morgen früh) je Gerät im Browser gespeichert; ab vier Hinweisen „+N weitere“; Erledigt = Ursache weg, dann verschwindet er.
     Einstellung layout.start.ksize = "s" | "m" | "l". Gilt nur in der neuen Optik (_hzNew). */
  _hzKs() { const k = ((this._cfg.layout.start || {}).ksize) || "m"; return ["s", "m", "l"].includes(k) ? k : "m"; }
  _hzBadE(e) { const s = e && this._hass.states[e]; return !s || ["unavailable", "unknown"].includes(s.state); }
  _hzNumE(e) { const s = e && this._hass.states[e]; const v = s ? parseFloat(String(s.state).replace(",", ".")) : NaN; return isFinite(v) ? v : null; }
  /* Kernzahl je Modul: v (Zahl oder kurzer Text), u (Einheit), l1/l2 (Zeile darunter), z (Zustand), p (Ring 0–1), ent (Verlauf), o (Bild-Optionen) */
  _hzK(m) {
    const st = this._hass.states, K = { v: null, u: "", l1: "", l2: "", z: "ok", p: null, ent: "", o: {} };
    const off = (t) => ({ ...K, v: "–", l1: t, z: "off" });
    if (m.id === "fh") {
      const R = this._collect(); if (!R.length) return off("Nicht eingerichtet");
      const th = R.flatMap((r) => r.thermos || []), dead = th.filter((e) => this._hzBadE(e));
      const n = this._hzHeatN(), W = this._hzWin(), nw = W.reduce((s, w) => s + w.n, 0), cur = th.map((e) => st[e] && Number((st[e].attributes || {}).current_temperature)).filter((x) => isFinite(x) && x > 0);
      if (n) { K.v = String(n); K.u = n === 1 ? "heizt" : "heizen"; K.o.on = true; K.z = "act"; }
      else if (cur.length) { K.v = num(cur.reduce((a, b) => a + b, 0) / cur.length, 1); K.u = "°C"; K.l2 = "Ø Räume"; }
      else { K.v = String(R.length); K.u = R.length === 1 ? "Raum" : "Räume"; }
      if (nw) { const w = W.slice().sort((a, b) => a.since - b.since)[0], min = Math.round((Date.now() - w.since) / 60000); K.l1 = `${esc(w.name)}: Fenster offen · ${this._hzSince(new Date(w.since).toISOString())}${W.length > 1 ? ` · +${W.length - 1}` : ""}`; if (min >= 15) K.z = "hint"; else if (K.z === "ok") K.z = "info"; }
      else K.l1 = "Alle Fenster zu";
      if (dead.length) { K.z = "warn"; K.l1 = `Thermostat offline: ${esc(this._wzName(dead[0]))}`; }
      return K;
    }
    if (m.id === "ww") {
      if (!this._wwConfigured()) return off("Nicht eingerichtet");
      const E = this._mdState().ww.ent || {}; K.ent = E.top || ""; if (this._hzBadE(E.top)) return { ...K, v: "–", u: "", l1: "Fühler offline", z: "warn" };
      const t = this._hzNumE(E.top), P = this._wwProblems(), b = P.find((p) => p[0] === "bad"), w = P.find((p) => p[0] === "warn"), heat = [E.rod, E.src].some((e) => e && this._wwIsOn(e));
      K.v = num(t, 0); K.u = "°C"; K.o.t = `${num(t, 0)}°`;
      if (b) { K.z = "warn"; K.l1 = esc(b[2]); } else if (w) { K.z = "hint"; K.l1 = esc(w[2]); }
      else if (heat) { K.z = "act"; K.l1 = E.rod && this._wwIsOn(E.rod) ? "Heizstab läuft" : "Wird geheizt"; }
      else K.l1 = t >= 50 ? "Speicher gut gefüllt" : t >= 42 ? "Speicher gefüllt" : "Speicher kühlt aus";
      return K;
    }
    if (m.id === "en") {
      const N = this._enOn() ? this._enNow() : null; if (!N) return off("Nicht eingerichtet");
      const sh = N.house > 0 ? Math.min(100, (N.pv2h + N.b2h) / N.house * 100) : 100;
      K.v = num(sh, 0); K.u = "%"; K.p = sh / 100; K.l1 = `aus Sonne${N.b2h > 20 ? " & Akku" : ""}`; K.l2 = `PV ${num(N.pv / 1000, 1)} kW`; K.ent = this._enState().ent.pv || "";
      K.o.on = N.pv > 50; return K;
    }
    if (m.id === "gs") {
      this._gsLoad(); const D = (this._gsD && this._gsD.devices) || (this._gsState().devices || []); if (!D.length) return off("Keine Geräte");
      const run = D.filter((d) => d.running), today = new Date().toDateString();
      if (run.length) {
        const d = run[0], nm = String(d.name || "Gerät"), ri = this._gsRestInfo ? this._gsRestInfo(d) : null;
        K.v = nm.length > 9 ? nm.slice(0, 6) + "." : nm; K.tx = true; K.z = "act"; K.o.on = true; K.hd = this._gsHd ? this._gsHd(d) : "";
        K.l1 = `läuft${ri && !ri.learn ? ` · noch ${Math.round(ri.rest / 60)} Min.` : ""}${run.length > 1 ? ` · +${run.length - 1}` : ""}`; if (ri && !ri.learn) K.p = ri.p; return K;
      }
      const done = D.filter((d) => d.last && d.last.ts && new Date(d.last.ts).toDateString() === today);
      K.v = String(D.length); K.u = D.length === 1 ? "Gerät" : "Geräte"; K.l1 = done.length ? `${esc(done[0].name)} fertig ${new Date(done[0].last.ts).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}` : "alle bereit"; return K;
    }
    if (m.id === "ev") {
      const E = this._evState().ent || {}; if (!E.soc) return off("Nicht eingerichtet"); K.ent = E.soc;
      if (this._hzBadE(E.soc)) return { ...K, v: "–", l1: "Auto nicht erreichbar", z: "warn" };
      const v = this._hzNumE(E.soc), ch = E.charging && st[E.charging] && ["on", "charging"].includes(st[E.charging].state), pl = E.plug && st[E.plug] && ["on", "plugged", "connected"].includes(st[E.plug].state);
      K.v = num(v, 0); K.u = "%"; K.p = v / 100; K.o.lvl = v; K.l1 = ch ? "lädt" : pl ? "eingesteckt" : "Ladestand"; if (ch) K.z = "act";
      const r = E.range ? this._hzNumE(E.range) : null; if (r != null) K.l2 = `${num(r, 0)} km`; return K;
    }
    if (m.id === "wx") {
      const t = this._out().t, Wn = this._hzWarnX().filter((h) => h.mod === "wx"); if (t == null && !Wn.length) return off("Keine Wetterquelle");
      K.v = t != null ? num(t, 1) : "–"; K.u = t != null ? "°C" : ""; const o = this._out(); K.l1 = Wn.length ? esc(String(Wn.find((h) => h.c === "bad") ? Wn.find((h) => h.c === "bad").t : Wn[0].t).replace(/^(Warnung|Amtliche Warnung|Vorab|Bald|Vorsorge): /, "")) : esc((WX[o.w] || ["", "Keine Warnung"])[1]);
      if (Wn.length) { K.z = "warn"; K.l2 = Wn[0].s && !/^Draußen/.test(Wn[0].s) ? String(Wn[0].s) : ""; } if (t != null && t <= 0) K.o.frost = true; return K;
    }
    if (m.id === "sf") {
      let T = null; try { T = this._sfStat(); } catch (_) { /* noch nicht geladen */ }
      if (!T || !T.l.length) return off("Keine Melder");
      K.v = String(T.l.length); K.u = "Melder";
      if (T.al.length) { K.z = "warn"; K.o.alarm = true; K.l1 = `Alarm: ${esc(T.al[0].name || "")}`; }
      else if (T.off.length) { K.z = "warn"; K.l1 = `${T.off.length} offline`; }
      else if (T.low.length) { K.z = "hint"; K.v = String(T.low.length); K.u = T.low.length === 1 ? "Batterie" : "Batterien"; K.l1 = `${esc(T.low[0].name || "")} schwach${T.low[0].bat != null ? ` · ${num(T.low[0].bat, 0)} %` : ""}`; }
      else K.l1 = "alle in Ordnung";
      return K;
    }
    if (m.id === "mu") {
      if (!this._muOn()) return off("Aus"); this._muLoad(); const B = this._hzMu().filter((b) => b.next).sort((a, b) => a.days - b.days); if (!B.length) return off("Keine Termine");
      const x = B[0], same = B.filter((b) => b.days === x.days); K.v = x.days === 0 ? "Heute" : x.days === 1 ? "Morgen" : `${x.days}`; K.u = x.days > 1 ? "Tage" : ""; K.tx = x.days <= 1;
      K.l1 = same.map((b) => esc(b.name)).join(", "); K.l2 = x.days <= 1 ? "Tonne rausstellen" : ""; K.z = x.state === "out" ? "hint" : x.days <= 1 ? "info" : "ok"; K.o.col = x.color; return K;
    }
    if (m.id === "li") {
      if (!this._liOn()) return off("Aus"); const L = this._liLamps().filter((x) => !x.un), n = L.filter((x) => x.on).length; if (!L.length) return off("Keine Lampen");
      K.v = String(n); K.u = "an"; K.p = n / L.length; K.l1 = n ? `von ${L.length} Lampen` : "alles aus"; K.z = n ? "act" : "ok"; K.o.on = n > 0; return K;
    }
    if (m.id === "sp") { const t = this._spStart(); return { ...K, v: null, l1: esc(t.sub), z: this._hzZ(t.c), pic: t.icon }; }
    if (m.id === "bt") { const s = this._enOn() ? this._soc() : null; if (s == null) return off("Kein Ladestand"); return { ...K, v: num(s, 0), u: "%", p: s / 100, o: { lvl: s }, l1: "Ladestand Akku" }; }
    if (m.id === "dt") { const p = this._price(); if (!p) return off("Kein Preis"); return { ...K, v: num(p, 1), u: "ct", l1: "pro kWh jetzt" }; }
    if (m.id === "ef") { const N = this._enOn() ? this._enNow() : null; if (!N) return off("Keine Energiedaten"); return { ...K, v: num(N.house / 1000, 1), u: "kW", l1: "Haus jetzt", l2: `PV ${num(N.pv / 1000, 1)} kW`, o: { on: N.pv > 50 } }; }
    if (m.addon) { const t = this._adTile(m); return { ...K, v: null, l1: t.sub, z: this._hzZ(t.c) }; }
    return off(modSt(m) && STG[modSt(m)] ? STG[modSt(m)].t : "");
  }
  /* Verlauf der letzten 24 Stunden aus der HA-Historie (ein Abruf je Sensor, 10 Minuten zwischengespeichert) */
  _hzHist(e) {
    if (!e || !this._hass) return null;
    const H = this._hzH || (this._hzH = {}), h = H[e];
    if (h && !h.busy && Date.now() - h.ts < 600000) return h.v;
    if (!h || !h.busy) {
      H[e] = { v: h ? h.v : null, ts: h ? h.ts : 0, busy: true };
      this._hass.callWS({ type: "history/history_during_period", start_time: new Date(Date.now() - 864e5).toISOString(), entity_ids: [e], minimal_response: true, no_attributes: true, significant_changes_only: false })
        .then((r) => { const a = (r && r[e]) || [], v = a.map((x) => parseFloat(String(x.s ?? x.state).replace(",", "."))).filter((x) => isFinite(x)); H[e] = { v: v.length > 1 ? v : [], ts: Date.now() }; })
        .catch(() => { H[e] = { v: [], ts: Date.now() }; })
        .finally(() => { if (this._mdActive() === "st" && !this._modal && !this._dragging) this._render(); });
    }
    return h ? h.v : null;
  }
  _hzSpark(v, w = 78, h = 32) {
    if (!v || v.length < 2) return "";
    const n = 40, s = v.length > n ? Array.from({ length: n }, (_, i) => v[Math.floor(i * (v.length - 1) / (n - 1))]) : v, lo = Math.min(...s), hi = Math.max(...s), d = hi - lo || 1;
    const pts = s.map((x, i) => [(i / (s.length - 1)) * (w - 4) + 2, h - 3 - ((x - lo) / d) * (h - 8)]), line = pts.map((p) => p.map((q) => q.toFixed(1)).join(",")).join(" "), last = pts[pts.length - 1];
    return `<svg class="hzksp" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polygon points="2,${h} ${line} ${w - 2},${h}" class="a"/><polyline points="${line}" class="l"/><circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2.6" class="d"/></svg>`;
  }
  _hzRing(p, s = 46, id = "") { const r = 19, C = 2 * Math.PI * r; return `<svg class="hzkr" viewBox="0 0 46 46" width="${s}" height="${s}" aria-hidden="true"><circle cx="23" cy="23" r="${r}" class="bg"/><circle cx="23" cy="23" r="${r}" class="fg"${id ? ` data-hzr="${id}"` : ""} stroke-dasharray="${(Math.max(0.02, Math.min(1, p)) * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 23 23)"/></svg>`; }
  static HZ_ZT = { ok: "Alles gut", act: "Aktiv", hint: "Hinweis", warn: "Warnung", off: "Aus", info: "Info" };
  /* Kachel 2.0 */
  _hzTile2(m) {
    const K = this._hzK(m), sz = this._hzKs(), hd = K.hd || this._hzHdFor(m), z = K.z;
    const pic = K.pic || (hd ? this._gx(hd, sz === "s" ? 26 : 32, { ...(this._hzTileO ? {} : {}), ...K.o }) : ic(m.icon, 20));
    const sub = m.addon ? "Addon" : m.n ? `Modul ${m.n}` : "", stg = modSt(m) && modSt(m) !== "stabil" && STG[modSt(m)] ? `<em class="hzkst">${STG[modSt(m)].t}</em>` : m.addon ? `<em class="hzkst">Addon</em>` : "";
    let gr = "";
    if (sz !== "s" && z !== "off") {
      const hv = K.ent && (sz === "l" || K.p == null) ? this._hzHist(K.ent) : null;
      if (sz === "l" && hv && hv.length > 1) gr = `<div class="hzkg l">${this._hzSpark(hv, 160, 40)}</div>`;
      else if (K.p != null) gr = `<div class="hzkg">${this._hzRing(K.p, 46, "k" + m.id)}</div>`;
      else if (hv && hv.length > 1) gr = `<div class="hzkg">${this._hzSpark(hv)}</div>`;
    }
    const val = K.v == null ? `<span class="hzkv tx sm">${K.l1}</span>` : `<span class="hzkv${K.tx ? " tx" : ""}"${!K.tx && /^-?[\d.,]+$/.test(String(K.v)) ? ` data-hzn="k${m.id}"` : ""}>${esc(String(K.v))}${K.u ? `<small>${esc(K.u)}</small>` : ""}</span>`;
    const line = K.v == null ? K.l2 : [K.l1, sz === "s" ? "" : K.l2].filter(Boolean).join(" · ");
    return `<button class="hzk z-${z} sz-${sz}" data-act="hzgo" data-k="${m.id}" aria-label="${esc(m.short)}: ${esc(this.constructor.HZ_ZT[z] || "")}"><i class="hzdot" aria-hidden="true"></i>
      <div class="hzkh"><span class="hzki">${pic}</span><span class="hzkn"><b>${esc(m.short)}</b><small>${sub}${stg}</small></span></div>
      <div class="hzkm">${val}${sz === "l" ? "" : gr}</div>${sz === "l" ? gr : ""}${line ? `<div class="hzks">${line}</div>` : ""}</button>`;
  }
  /* ---------- Hinweise-Zentrale ---------- */
  _hzLaterMap() { if (!this._hzLM) { try { this._hzLM = JSON.parse(localStorage.getItem("fh_hz_later") || "{}") || {}; } catch (_) { this._hzLM = {}; } } return this._hzLM; }
  _hzLaterSet(k, until) {
    const M = this._hzLaterMap(); if (until) M[k] = until; else delete M[k];
    Object.keys(M).forEach((x) => { if (M[x] < Date.now()) delete M[x]; });
    try { localStorage.setItem("fh_hz_later", JSON.stringify(M)); } catch (_) { /* Speicher gesperrt */ }
  }
  _hzKey(h) { return h.k || `${h.mod || h.blk || "x"}:${String(h.t || "").replace(/<[^>]*>/g, "").replace(/[\d.,]+/g, "#").slice(0, 60)}`; }
  /* Sichtbare Hinweise: ohne die auf „Später“ gestellten. Ein Alarm lässt sich nicht verschieben. */
  _hzVis(hints) { const M = this._hzLaterMap(), now = Date.now(); return hints.filter((h) => h.nosn || !(M[this._hzKey(h)] > now)); }
  _hzSrc(h) {
    const L = [...this._mdList(), MOD_MU, MOD_LI], m = h.mod && L.find((x) => x.id === h.mod);
    const src = m ? (m.n ? `Modul ${m.n}` : m.short) : h.blk === "alarm" ? "Alarm" : h.src || (h.i === "alert" && /Batterie/.test(h.t) ? "Batterien" : h.i === "heart" ? "Sponsor" : "Start");
    return `${src}${h.since ? ` · seit ${this._hzSince(new Date(h.since).toISOString())}` : ""}`;
  }
  _hzZentrale(all) {
    const vis = this._hzVis(all), hid = all.length - vis.length, nw = vis.filter((h) => h.c === "bad").length, nh = vis.filter((h) => h.c === "wa").length;
    const ZN = { warn: "Warnung", hint: "Hinweis", info: "Info" }, many = vis.length >= 4 && !this._hzAll, show = many ? vis.slice(0, 3) : vis;
    const HD = { fh: "windowOpen", ww: "boiler", mu: "bin", wx: "weather", sf: "smoke", ev: "car", gs: "plug", en: "pvRoof" };
    const row = (h) => {
      const z = this._hzZ(h.c || "in"), k = this._hzKey(h), hd = h.hd || (h.i === "alert" && /Batterie/.test(h.t) ? "smoke" : HD[h.mod] || (h.blk === "alarm" ? "shield" : "")), pic = hd ? this._gx(hd, 30, { alarm: !!h.alarm, frost: !!h.frost, k: h.c === "bad" ? "bad" : "ok" }) : ic(h.i, 20);
      const go = h.mod || h.blk ? `<button class="hzzb" data-act="hzgo" data-k="${h.mod || ""}" data-b="${h.blk || ""}">Ansehen</button>` : "";
      const done = h.mod === "mu" && this._muxAct ? `<button class="hzzb" data-act="hzmudone">Erledigt</button>` : "";
      const later = h.nosn ? "" : `<button class="hzzb q" data-act="hzlater" data-k="${esc(k)}" aria-label="Später erinnern">Später</button>`;
      return `<div class="hzz z-${z}"><span class="hzzi">${pic}</span><div class="hzzx"><b>${h.t}</b><small>${esc(this._hzSrc(h))}${h.s ? ` · ${h.s}` : ""}</small><em class="hzzp">${ZN[z] || "Info"}</em></div><div class="hzzbs">${done || go}${later}</div></div>`;
    };
    const head = `<h2>${ic("info", 18)}Hinweise${vis.length ? `<span class="hzzc">${vis.length}</span>` : ""}${nw ? `<span class="hzzw z-warn">${nw} ${nw === 1 ? "Warnung" : "Warnungen"}</span>` : ""}<span class="hzrt">nach Dringlichkeit</span></h2>`;
    const body = vis.length ? `<div class="hzzl">${show.map(row).join("")}</div>${many ? `<button class="hzzmore" data-act="hzall">+${vis.length - 3} weitere</button>` : vis.length >= 4 ? `<button class="hzzmore" data-act="hzall">Weniger zeigen</button>` : ""}`
      : `<div class="hzzok">${this._gx("shield", 34, { k: "ok" })}<div><b>Keine offenen Hinweise</b><small>Fenster, Batterien, Warmwasser und Termine sind in Ordnung.</small></div></div>`;
    const foot = hid ? `<div class="hzzf">${ic("clock", 14)}${hid} ${hid === 1 ? "Hinweis" : "Hinweise"} auf später gestellt<button class="lnk" data-act="hzlaterclr">Wieder zeigen</button></div>` : "";
    return `<div class="card hzzc0">${head}${body}${foot}</div>`;
  }
  _hzLaterModal() {
    const m = this._modal, d = new Date(), h = d.getHours(), eve = new Date(d); eve.setHours(19, 0, 0, 0); const mor = new Date(d); mor.setDate(d.getDate() + 1); mor.setHours(7, 0, 0, 0);
    const opt = (t, ts, s) => `<button class="hzlo" data-act="hzlaterset" data-k="${esc(m.k)}" data-t="${ts}"><b>${t}</b><small>${s}</small>${ic("chev", 16)}</button>`;
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Später erinnern</b><span>Der Hinweis kommt dann wieder, wenn die Ursache noch da ist.</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${opt("In 1 Stunde", Date.now() + 3600000, new Date(Date.now() + 3600000).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr")}
      ${h < 18 ? opt("Heute Abend", eve.getTime(), "19:00 Uhr") : ""}${opt("Morgen früh", mor.getTime(), "07:00 Uhr")}
      <div class="mut sm" style="margin-top:8px">Gilt für dieses Gerät. Alarme lassen sich nicht verschieben.</div></div>`;
  }
  _hzAct2(a, b) {
    const k = b.dataset.k;
    if (a === "hzlater") { this._modal = { type: "hzlater", k }; this._renderModal(); return true; }
    if (a === "hzlaterset") { this._hzLaterSet(k, Number(b.dataset.t) || 0); this._modal = null; this._renderModal(); this._render(); this._toast("Hinweis kommt später wieder"); return true; }
    if (a === "hzlaterclr") { this._hzLM = {}; try { localStorage.removeItem("fh_hz_later"); } catch (_) { /* egal */ } this._render(); return true; }
    if (a === "hzall") { this._hzAll = !this._hzAll; this._render(); return true; }
    if (a === "hzmudone") { this._hzMu().filter((x) => ["out", "today", "soon"].includes(x.state)).forEach((x) => this._muxAct("muxdone", { dataset: { k: x.k } })); return true; }
    if (a === "hzhead") { this._hzSave({ head: ["scene", "text", "simple"].includes(k) ? k : "scene" }); return true; }
    if (a === "hzksize") { this._hzSave({ ksize: ["s", "m", "l"].includes(k) ? k : "m" }); return true; }
    return false;
  }
