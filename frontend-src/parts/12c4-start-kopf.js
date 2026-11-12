  /* ================= Startseite · Neue Optik Stufe 3 (Konzept_Startseite_Neue-Optik, Teil A, D und F) =================
     A · Haus-Kopf: das ganze Haus als Szene (Himmel wie Modul 1 und 3: Tageszeit aus sun.sun, Wetter aus den Haus-Werten),
         PV glänzt bei Überschuss, Schnee auf dem Dach bei Frost, Rauch bei Heizung, Fenster offen, Auto aus Modul 8.
         Darüber Begrüßung, Gesamt-Ampel, Chips und eine Tageszeile. Haus-Stile und Himmel-Themen (Sponsor-Extra) wie in Modul 1.
     D · Wetter als Szene mit Tagen und Frost-Vorhersage, Personen mit Zustandsring und Ankunft, Alarm mit Halten + Bestätigen.
     F · Tablet: Ampel groß, Ruhebild mit Szene.
     Einstellung layout.start.head = "scene" | "text" | "simple" (bisher amp: false → simple). */
  _hzHead() { const l = (this._cfg && this._cfg.layout && this._cfg.layout.start) || {}; if (!this._hzNew()) return "simple"; return ["scene", "text", "simple"].includes(l.head) ? l.head : l.amp === false ? "simple" : "scene"; }
  /* ---------- A · Szene ---------- */
  _hzScSvg(o = {}) {
    const st = this._hass.states, sky = this._hsSky(), u = "hz" + (this.constructor._gxN = ((this.constructor._gxN || 0) + 1) % 1e6) + "_", q = (n) => u + n;
    const night = sky.tod === "night", wh = sky.frost || sky.snow, grey = sky.cloud && !night, SK = this._hsSkyCols(sky.tod), HC = this._hsHouseCols(night), X = this._hsx();
    const N = this._enOn() ? this._enNow() : null, pv = N ? N.pv : this._pvNow(), pvOn = pv != null, glow = pvOn && pv > 300 && !night;
    const heat = this._hzHeatN() > 0, open = this._hzWin().length > 0, away = this._away && this._away();
    const E = (this._mdState().on.ev && this._evState().ent) || {}, car = !!(E.soc && st[E.soc]), chg = car && E.charging && st[E.charging] && ["on", "charging"].includes(st[E.charging].state);
    const lg = (id, s, x2 = 0, y2 = 1) => `<linearGradient id="${q(id)}" x1="0" y1="0" x2="${x2}" y2="${y2}">${s.map(([f, c, a]) => `<stop offset="${f}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ""}/>`).join("")}</linearGradient>`;
    let d = `<defs>${lg("sk", [[0, grey && !X.S.c ? "#93a7bf" : SK[0]], [1, grey && !X.S.c ? "#dde5ee" : SK[1]]])}${lg("rf", [[0, HC.roof[0]], [1, HC.roof[1]]])}${lg("wl", [[0, HC.wall[0]], [1, HC.wall[1]]], 1, 0)}
      ${lg("gr", night ? [[0, wh ? "#c7d0dc" : "#1c3a28"], [1, wh ? "#9aa6b5" : "#132a1c"]] : [[0, wh ? "#ffffff" : "#5fd27e"], [1, wh ? "#dfe7f0" : "#2f9e57"]])}
      ${lg("gl", away ? [[0, "#64748b"], [1, "#475569"]] : night ? [[0, "#fde68a"], [1, "#f59e0b"]] : [[0, "#e0f2fe"], [1, "#7dd3fc"]], .6, 1)}${lg("hw", [[0, "#fb923c", .55], [1, "#fb923c", 0]])}
      <radialGradient id="${q("sun")}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff7c2"/><stop offset=".55" stop-color="#fde68a"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient>
      <pattern id="${q("tl")}" width="10" height="6" patternUnits="userSpaceOnUse"><path d="M0 5.5 h10 M5 0 v5.5" stroke="#000" stroke-width=".7" opacity=".22"/></pattern></defs>`;
    d += this._hsSkyDraw(sky, q);
    const s0 = grey && !X.S.c ? "#93a7bf" : SK[0], s1 = grey && !X.S.c ? "#dde5ee" : SK[1], g0 = night ? (wh ? "#c7d0dc" : "#1c3a28") : wh ? "#ffffff" : "#5fd27e", g1 = night ? (wh ? "#9aa6b5" : "#132a1c") : wh ? "#dfe7f0" : "#2f9e57";
    this._hzScBg = `linear-gradient(180deg,${s0} 0%,${s1} 81%,${g0} 81%,${g1} 100%)`;
    if (o.sky) return `<svg viewBox="${o.vb || "0 0 360 120"}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Himmel" class="hzsc">${d}<path d="M-2 112 Q90 100 180 108 T362 104 V122 H-2Z" fill="url(#${q("gr")})" opacity=".9"/></svg>`;
    /* Boden, Baum, Hecke */
    d += `<rect x="-2" y="150" width="364" height="52" fill="url(#${q("gr")})"/><path d="M-2 150 h364" stroke="#000" opacity=".08"/>`;
    d += `<rect x="146" y="114" width="5" height="38" rx="2" fill="${night ? "#3b2a1c" : "#7c4a24"}"/>` + [[148, 100, 17], [138, 112, 12], [159, 110, 12], [148, 88, 11]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${wh ? (night ? "#9fb0c2" : "#eef3f8") : night ? "#1f4d30" : "#2fa35c"}"/>`).join("");
    d += [[176, 149, 8], [316, 149, 9], [334, 150, 6]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .65}" fill="${wh ? "#eef3f8" : night ? "#1d4a2c" : "#22a35a"}"/>`).join("");
    /* Haus */
    const L = 196, R = 304, T = 98, B = 150, P = 250, PT = 50;
    d += `<rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" fill="url(#${q("wl")})"/><rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" fill="#000" opacity="${night ? .12 : 0}"/>`;
    if (heat) d += `<rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" fill="url(#${q("hw")})" opacity=".55"/>`;
    /* Schornstein mit Rauch */
    d += `<rect x="276" y="56" width="11" height="26" fill="#8b2b22"/><rect x="274" y="53" width="15" height="4" rx="1" fill="#57534e"/>` + (heat ? `<g class="hssm">${[0, 1, 2].map((i) => `<circle class="hssm${i}" cx="${282 + i * 3}" cy="${46 - i * 7}" r="${3.5 + i * 2}" fill="#e2e8f0" opacity=".55"/>`).join("")}</g>` : "");
    d += `<path d="M${L - 14} ${T + 1} L${P} ${PT} L${R + 14} ${T + 1}Z" fill="url(#${q("rf")})"/><path d="M${L - 14} ${T + 1} L${P} ${PT} L${R + 14} ${T + 1}Z" fill="url(#${q("tl")})"/><path d="M${P} ${PT} L${R + 14} ${T + 1} L${P} ${T + 1}Z" fill="#000" opacity=".16"/>`;
    d += `<path d="M${L - 16} ${T + 2} L${P} ${PT - 2} L${R + 16} ${T + 2}" fill="none" stroke="#3f1510" stroke-width="3" stroke-linejoin="round"/>`;
    if (wh) d += `<path d="M${L - 12} ${T - 1} L${P} ${PT + 1} L${R + 12} ${T - 1} L${R} ${T - 4} L${P} ${PT + 6} L${L} ${T - 4}Z" fill="#f8fafc"/>`;
    if (pvOn) {
      /* Solarfeld frontal auf der linken Dachfläche (wie die Energie-Szene in Modul 3): unten 3, darüber 2 Module, innerhalb der Dachschräge */
      const pan = (x, y) => `<rect x="${x}" y="${y}" width="13" height="8.6" rx=".8" fill="${glow ? "#2563eb" : "#1e3a8a"}" stroke="${night ? "#64748b" : "#e2e8f0"}" stroke-width=".8"/><path d="M${x + 6.5} ${y} v8.6 M${x} ${y + 4.3} h13" stroke="#93c5fd" stroke-width=".4" opacity=".7"/>` +
        (glow ? `<path d="M${x + 1.5} ${y + 1.6} l3 -0" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".7"/>` : "") + (wh ? `<rect x="${x - .4}" y="${y - .8}" width="13.8" height="2.6" rx="1.2" fill="#f8fafc"/>` : "");
      const cells = [[205, 86.4], [219.5, 86.4], [234, 86.4], [219.5, 76.6], [234, 76.6]];
      d += `<g><rect x="203.6" y="85" width="44.8" height="11.4" rx="1.2" fill="#0f172a" opacity=".3"/><rect x="218.1" y="75.2" width="30.3" height="11" rx="1.2" fill="#0f172a" opacity=".3"/>${cells.map(([x, y]) => pan(x, y)).join("")}${glow ? `<g class="hzpvg" opacity="0">${cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="13" height="8.6" rx=".8" fill="#fff"/>`).join("")}</g>` : ""}</g>`;
    }

    /* Fenster und Tür */
    const win = (x, y, op) => `<rect x="${x - 1.5}" y="${y - 1.5}" width="21" height="17" rx="1.5" fill="#f8fafc"/><rect x="${x}" y="${y}" width="18" height="14" fill="url(#${q("gl")})"/>` + (away ? `${[0, 1, 2, 3].map((i) => `<path d="M${x} ${y + 2 + i * 3.4} h18" stroke="#334155" stroke-width=".8"/>`).join("")}` : `<path d="M${x + 9} ${y} v14 M${x} ${y + 7} h18" stroke="#f8fafc" stroke-width="1"/>`) +
      (op ? `<path d="M${x + 18} ${y} l7 3 v10 l-7 1z" fill="#e0f2fe" stroke="#f8fafc" stroke-width="1"/><path class="hsaw" d="M${x + 29} ${y + 7} q4 -3 8 0 t8 0" fill="none" stroke="#60a5fa" stroke-width="1.6" stroke-linecap="round"/>` : "");
    d += win(206, 106, false) + win(276, 106, open) + win(206, 128, false);
    d += `<rect x="241" y="122" width="18" height="28" rx="1.5" fill="${night ? "#5b3a1f" : "#7c4a24"}"/><circle cx="255" cy="137" r="1.3" fill="#fde68a"/>${night && !away ? `<circle cx="250" cy="118" r="7" fill="#fde68a" opacity=".35"/><rect x="247" y="115" width="6" height="5" rx="1" fill="#fde68a"/>` : ""}`;
    d += `<rect x="270" y="128" width="24" height="16" rx="1.5" fill="#f8fafc"/><rect x="271.5" y="129.5" width="21" height="13" fill="url(#${q("gl")})"/>`;
    d += `<rect x="${L - 4}" y="${B - 2}" width="${R - L + 8}" height="5" fill="#9ca3af"/>`;
    /* Auto aus Modul 8 */
    if (car) d += `<svg x="314" y="118" width="40" height="40" viewBox="0 0 64 64">${this._gxLib().L.car.f((n) => q("c" + n), {})}</svg>${chg ? `<path d="M322 131 l-4 6 h3 l-2 6 l6 -8 h-3 l2 -4z" fill="#fde047" stroke="#a16207" stroke-width=".5"/>` : ""}`;
    return `<svg viewBox="${o.vb || "0 0 360 200"}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Haus-Szene" class="hzsc">${d}</svg>`;
  }
  /* Tageszeile (W3): gespartes Heizöl/Gas heute und Anteil aus Sonne */
  _hzDayLine() {
    const R = this._collect(), bits = [];
    try {
      const g = R.reduce((s, r) => s + ((r.sc && r.sc.day && r.sc.day.gas) || 0), 0), fs = new Set(R.map((r) => r.fuel || "erdgas")), f = fs.size === 1 ? [...fs][0] : "erdgas", F = FUELS[f] || FUELS.erdgas;
      if (g > 0.005) bits.push(`${F.short} gespart heute: ${num(g, 2)} ${F.label.split(" ")[0]}`);
    } catch (_) { /* egal */ }
    const N = this._enOn() ? this._enNow() : null; if (N && N.house > 0) bits.push(`${num(Math.min(100, (N.pv2h + N.b2h) / N.house * 100), 0)} % aus Sonne jetzt`);
    return bits.join(" · ");
  }
  _hzHeadHtml(hints) {
    const L = this._hzLevel(hints), g = this._hzGreet().split(" · "), o = this._out(), st = this._hass.states;
    const N = this._enOn() ? this._enNow() : null, P = this._ortPersons().filter((p) => p.count), H = P.filter((p) => p.home), al = this._hzAlarmEnt();
    const chips = [o.t != null ? [this._gx("weather", 18, { frost: o.t <= 0 }), `Draußen ${num(o.t, 1)} °C`] : null, N ? [this._gx("pvRoof", 18), `PV ${num(N.pv / 1000, 2)} kW`] : null,
      P.length ? [this._gx("people", 18), H.length === 0 ? "niemand zu Hause" : H.length === 1 ? `${esc(H[0].name)} zu Hause` : `${H.length} zu Hause`] : null,
      al ? [this._gx("shield", 18, { k: st[al].state === "triggered" ? "bad" : st[al].state === "disarmed" ? "off" : "ok" }), `Alarm ${st[al].state === "disarmed" ? "aus" : st[al].state === "triggered" ? "AUSGELÖST" : "scharf"}`] : null].filter(Boolean);
    const day = this._hzDayLine(), tap = L.n || L.info;
    const sv = this._hzScSvg({ vb: "100 20 260 160" });
    return `<div class="card hzhd z-${L.z}"><div class="hzhs" aria-hidden="true" style="background:${this._hzScBg}">${sv}</div><div class="hzho">
      <div class="hzhg"><b>${g[0]}</b><small>${g[1] || ""}</small></div>
      <div class="hzha"${tap ? ` data-act="hzgo" data-k="" data-b="hinweise" role="button" tabindex="0"` : ""}><span class="hzab" aria-hidden="true">${L.z === "ok" ? ic("check", 22) : "<b>!</b>"}</span><span class="hzax"><b>${esc(L.t)}</b><small>${esc(L.s)}</small></span>${tap ? `<span class="hzago">${ic("chev", 16)}</span>` : ""}</div>
      ${chips.length ? `<div class="hzhc">${chips.map(([i, t]) => `<span>${i}${t}</span>`).join("")}</div>` : ""}${day ? `<div class="hzhw">${day}</div>` : ""}</div></div>`;
  }
  /* ---------- D1 · Wetter ---------- */
  _hzFcDay(wid) {
    const d = this._hzFcDD; if (d && d.id === wid && Date.now() - d.ts < 1800000) return d.list;
    if (this._hzFcDBusy || !this._hass) return d && d.id === wid ? d.list : [];
    this._hzFcDBusy = true;
    this._hass.callWS({ type: "call_service", domain: "weather", service: "get_forecasts", service_data: { type: "daily" }, target: { entity_id: wid }, return_response: true })
      .then((r) => { const f = r && r.response && r.response[wid] && r.response[wid].forecast; this._hzFcDD = { id: wid, ts: Date.now(), list: Array.isArray(f) ? f : [] }; })
      .catch(() => { this._hzFcDD = { id: wid, ts: Date.now(), list: [] }; })
      .finally(() => { this._hzFcDBusy = false; if (this._mdActive() === "st" && !this._dragging && !this._modal) this._render(); });
    return d && d.id === wid ? d.list : [];
  }
  /* Frost in den nächsten 14 Stunden laut Stundenvorhersage (nur wenn es jetzt noch nicht friert) */
  _hzFrostFc() {
    const wid = this._hzWxId(), o = this._out(); if (!wid || o.t == null || o.t <= 0) return null;
    const f = this._hzFc(wid).filter((x) => { const t = new Date(x.datetime).getTime(); return t > Date.now() && t < Date.now() + 14 * 3600000; }), c = f.find((x) => x.temperature != null && Number(x.temperature) <= 0);
    if (!c) return null; const mn = Math.min(...f.map((x) => Number(x.temperature)).filter(isFinite));
    return { at: new Date(c.datetime), min: mn };
  }
  _hzWetterN() {
    const wid = this._hzWxId(); if (!wid) return "";
    const w = this._hass.states[wid], a = w.attributes || {}, o = this._out(), k = WX[w.state] || ["cloud", w.state || ""], Wn = this._hzWarnX().filter((h) => h.mod === "wx"), ff = this._hzFrostFc();
    const days = this._hzFcDay(wid).slice(0, 4), wd = (s) => new Date(s).toLocaleDateString("de-DE", { weekday: "short" }).replace(".", "");
    const bits = [a.humidity != null ? `${num(a.humidity, 0)} % Luftfeuchte` : "", a.wind_speed != null ? `Wind ${num(a.wind_speed, 0)} ${a.wind_speed_unit || "km/h"}` : ""].filter(Boolean).join(" · ");
    const warn = Wn.length ? `<div class="hzwn z-warn">${this._gx("weather", 30, { frost: !!Wn[0].frost })}<div><b>${Wn[0].t}</b><small>${Wn[0].s || ""}</small></div></div>`
      : ff ? `<div class="hzwn z-hint">${this._gx("weather", 30, { frost: true })}<div><b>Frost heute Nacht</b><small>ab ${ff.at.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} · bis ${num(ff.min, 0)} °C · Vorhersage</small></div></div>` : "";
    let wl = "";
    if (this._labOn("wl")) { const rh = a.humidity != null ? Number(a.humidity) : null, wind = a.wind_speed != null ? Number(a.wind_speed) : null, wet = ["rainy", "pouring", "lightning-rainy", "lightning", "snowy", "snowy-rainy", "hail"].includes(w.state); const lvl = wet || (rh != null && rh > 85) || (o.t != null && o.t < 3) ? 2 : (rh != null && rh > 75) || (wind != null && wind < this._labV("wl_wind")) ? 1 : 0; wl = `<div class="hzwl">${this._labPill("Wäsche-Wetter")}<span>${["heute draußen trocknen", "draußen geht, aber langsam", "heute drinnen trocknen"][lvl]}</span></div>`; }
    return `<div class="card hzwx2 ${Wn.length ? "z-warn" : ff ? "z-hint" : "z-ok"}"><h2>${ic("cloud", 18)}Wetter<span class="hzrt">${esc(a.friendly_name || wid)}</span></h2>
      <div class="hzwb"><div class="hzws" aria-hidden="true">${this._hzScSvg({ vb: "0 0 360 120", sky: true })}</div><div class="hzwv"><b>${o.t != null ? num(o.t, 1) : "–"}<small> °C</small></b><span>${esc(k[1])}${bits ? ` · ${bits}` : ""}</span></div></div>
      ${warn}${days.length ? `<div class="hzwd">${days.map((x, i) => `<div><small>${i === 0 ? "Heute" : wd(x.datetime)}</small>${ic((WX[x.condition] || ["cloud"])[0], 22)}<b>${x.temperature != null ? num(x.temperature, 0) + "°" : "–"}</b><em>${x.templow != null ? num(x.templow, 0) + "°" : ""}</em></div>`).join("")}</div>` : ""}${wl}</div>`;
  }
  /* ---------- D2 · Personen ---------- */
  /* Ankunft schätzen: Entfernung über die Zeit, nur wenn sie kleiner wird */
  _hzEta(p) {
    const M = this._hzPD || (this._hzPD = {}), now = Date.now(), a = (M[p.id] = (M[p.id] || []).filter((x) => now - x.t < 900000));
    if (p.dist == null || p.home) { M[p.id] = []; return null; }
    if (!a.length || Math.abs(a[a.length - 1].d - p.dist) > 5) a.push({ t: now, d: p.dist });
    if (a.length < 2) return null; const f = a[0], l = a[a.length - 1], dt = (l.t - f.t) / 60000, dd = f.d - l.d;
    if (dt < 1 || dd < 150) return null; const v = dd / dt, m = Math.round(l.d / v);
    return m > 0 && m < 90 ? m : null;
  }
  _hzPersonenN() {
    const P = this._ortPersons().filter((p) => p.count); if (!P.length) return "";
    const st = this._hass.states, nh = P.filter((p) => p.home).length, dist = (d) => (d >= 1000 ? `${num(d / 1000, d < 10000 ? 1 : 0)} km` : `${num(d, 0)} m`);
    let soon = null;
    const rows = P.map((p) => {
      const s = st[p.id] || {}, pic = (s.attributes || {}).entity_picture, eta = this._hzEta(p), z = p.unavailable ? "off" : p.home ? "ok" : "info";
      if (eta != null && eta <= 20 && (!soon || eta < soon.eta)) soon = { n: p.name, eta };
      const since = s.last_changed ? new Date(s.last_changed).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "";
      const sub = p.unavailable ? "Kein Standort" : p.home ? `zu Hause${since ? ` seit ${since}` : ""}` : `${p.dist != null ? dist(p.dist) : p.state && p.state !== "not_home" ? esc(p.state) : "unterwegs"}${eta != null ? ` · kommt in ~${eta} Min.` : ""}`;
      return `<div class="hzpr z-${z}"><span class="hzpa" style="--c:${p.col};${pic ? `background-image:url('${esc(pic)}');` : ""}">${pic ? "" : esc(p.name.slice(0, 1).toUpperCase())}</span><div class="hzrx"><b>${esc(p.name)}</b><small>${sub}</small></div><em class="hzpp">${p.unavailable ? "?" : p.home ? "zu Hause" : "unterwegs"}</em></div>`;
    }).join("");
    const pre = soon ? `<div class="hzps">${this._gx("person", 28)}<div><b>${esc(soon.n)} kommt gleich</b><small>in etwa ${soon.eta} Minuten${this._labOn("vh") ? " · Heizung wird vorbereitet (Smart Vorheizen)" : ""}</small></div></div>` : "";
    return `<div class="card"><h2>${ic("users", 18)}Personen<span class="hzrt">${nh} von ${P.length} zu Hause</span></h2>${pre}<div class="hzpl">${rows}</div><div class="hzpk"><span class="z-ok"><i></i>zu Hause</span><span class="z-info"><i></i>unterwegs</span></div></div>`;
  }
  /* ---------- D3 · Alarm: Halten, dann Bestätigen ---------- */
  _hzAlarmN() {
    const e = this._hzAlarmEnt(); if (!e) return ""; const s = this._hass.states[e], c = this._hzCfg(), ctl = c.ctl && this._admin(), [txt, cl] = this._hzAlarmTxt(s.state);
    const z = cl === "bad" ? "warn" : cl === "wa" ? "hint" : s.state === "disarmed" ? "off" : "ok", since = s.last_changed ? new Date(s.last_changed).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "";
    const head = s.state === "disarmed" ? "Alarm ist aus" : s.state === "triggered" ? "Alarm ausgelöst" : `Alarm: ${txt}`;
    const hold = (k, t, ico) => `<button class="hzhold" data-hold="${k}" aria-label="${t} – gedrückt halten">${ic(ico, 18)}<span>${t}</span><i aria-hidden="true"></i></button>`;
    const btns = !ctl ? "" : s.state === "disarmed" ? `${hold("away", "Abwesend", "door")}${hold("home", "Zu Hause", "home")}` : hold("disarm", "Unscharf schalten", "shield");
    return `<div class="card hzal2 z-${z}"><h2>${ic("shield", 18)}Alarm<span class="hzrt">${esc(this._wzName(e))}</span></h2>
      <div class="hzam2">${this._gx("shield", 52, { k: z === "warn" ? "bad" : z === "off" ? "off" : "ok" })}<div><b>${esc(head)}</b><small>${ctl ? `Seit ${since} Uhr` : "Schalten ist ab Werk aus"}</small></div></div>
      ${btns ? `<div class="hzhl">${s.state === "disarmed" ? "Scharfschalten" : "Unscharf schalten"}<small>Gedrückt halten, dann bestätigen</small></div><div class="hzhb">${btns}</div>` : ""}</div>`;
  }
  _hzHoldBind() {
    if (this._hzHoldOn || !this.shadowRoot) return; this._hzHoldOn = true;
    const sr = this.shadowRoot, stop = () => { if (this._hzHoldT) { clearTimeout(this._hzHoldT); this._hzHoldT = null; } sr.querySelectorAll(".hzhold.on").forEach((b) => b.classList.remove("on")); };
    sr.addEventListener("pointerdown", (ev) => {
      const b = ev.target.closest && ev.target.closest(".hzhold"); if (!b) return; stop(); b.classList.add("on");
      this._hzHoldT = setTimeout(() => { this._hzHoldT = null; b.classList.remove("on"); this._hzAct("hzalarm", { dataset: { k: b.dataset.hold } }); }, 1200);
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach((t) => sr.addEventListener(t, stop, true));
    sr.addEventListener("keydown", (ev) => { const b = ev.target.closest && ev.target.closest(".hzhold"); if (b && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); this._hzAct("hzalarm", { dataset: { k: b.dataset.hold } }); } });
  }
  /* ---------- F · Tablet ---------- */
  _hzTmAmp(hints) {
    const L = this._hzLevel(hints);
    return `<div class="tmamp z-${L.z}"><span class="hzab" aria-hidden="true">${L.z === "ok" ? ic("check", 34) : "<b>!</b>"}</span><div><b>${esc(L.t)}</b><small>${esc(L.s)}</small></div></div>`;
  }
  _hzTmSleep() {
    const L = this._hzLevel(this._hzVis(this._hzHints()));
    return `<div class="tmsc" aria-hidden="true" data-hzan="${this._hzAnim()}">${this._hzScSvg()}</div><div class="tmsa z-${L.z}"><i></i>${esc(L.t)}</div>`;
  }
