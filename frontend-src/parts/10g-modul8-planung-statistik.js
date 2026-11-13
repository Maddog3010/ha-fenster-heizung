  /* ================= Modul 8 · v0.8 Planung & Statistik in der neuen Optik =================
     A12 Ladeplan als ein Band (Sonne als Fläche, Preis als Streifen, Ladefenster, Abfahrt) · A13 Statistik mit Tag/Woche/Monat/Jahr wie Modul 3/4
     B4 geschätzter Ladestand für Autos ohne Sensor. Der Plan kommt fertig aus dem Backend (B1). */
  _evPlanNew(d) {
    this._wbFcLoad(); this._tbLoad();
    const F = this._wbFcD && this._wbFcD.data, c = this._wb(), adm = this._admin();
    if (!F) return `<div class="card empty">${this._gx("forecast", 40)}<div class="sm" style="margin-top:8px">Vorhersage wird geladen …</div></div>`;
    const H = F.hours || [], PL = F.plan || { ok: false }, SL = (F.slot_min || 60) / 60, now = Date.now();
    if (!H.length) return `<div class="card empty">${this._gx("forecast", 40)}<div style="margin:8px 0 4px;font-weight:700">Keine Vorhersage verfügbar</div><div class="sm">Wähle einen Preis (Tibber oder Preis-Sensor) und eine PV-Prognose (Modul 16 oder Forecast.Solar).</div></div>${this._wbPlan(d, true)}`;
    const tm = (t) => t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }), dl = PL.deadline ? new Date(PL.deadline) : null;
    const shown = H.map((h, i) => ({ ...h, i, t: new Date(h.t) })).filter((x) => x.t.getTime() + SL * 36e5 > now).slice(0, Math.round(30 / SL)), n = shown.length;
    const W = this._evNarrow() ? 440 : 1000, Hh = 230, pl = 12, pr = 12, top = 30, base = 178, bw = (W - pl - pr) / Math.max(1, n);
    const pmax = PL.pmax || 11, mxP = Math.max(pmax * 0.6, ...shown.map((x) => x.pv)) * 1.1, Y = (v) => base - v / mxP * (base - top), X = (k) => pl + k * bw;
    const pr0 = shown.map((x) => x.price), lo = Math.min(...pr0), hi = Math.max(...pr0), q = (v) => hi - lo < 0.5 ? 1 : (v - lo) / (hi - lo);
    const pcol = (v) => { const r = q(v); return r < 0.25 ? "#34d399" : r < 0.5 ? "#a3e635" : r < 0.75 ? "#fbbf24" : "#f87171"; };
    const sel = PL.ok ? Object.fromEntries(Object.entries(PL.sel || {}).map(([k, v]) => [Number(k), v])) : {};
    let area = `M${X(0)} ${base}`, line = "", strip = "", labels = "", wins = "";
    shown.forEach((x, k) => { const cx = X(k) + bw / 2; area += ` L${cx.toFixed(1)} ${Y(x.pv).toFixed(1)}`; line += `${k ? " L" : "M"}${cx.toFixed(1)} ${Y(x.pv).toFixed(1)}`;
      strip += `<rect x="${(X(k) + 1).toFixed(1)}" y="${base + 10}" width="${(bw - 2).toFixed(1)}" height="14" rx="3" fill="${pcol(x.price)}"><title>${tm(x.t)} · ${num(x.price, 1)} ct/kWh · Sonne ${num(x.pv, 1)} kW</title></rect>`;
      if (x.t.getMinutes() === 0 && x.t.getHours() % 3 === 0) labels += `<text x="${X(k).toFixed(1)}" y="${base + 42}" class="evpx">${String(x.t.getHours()).padStart(2, "0")}</text>`;
      if (x.t.getHours() === 0 && x.t.getMinutes() === 0 && k) labels += `<line x1="${X(k).toFixed(1)}" x2="${X(k).toFixed(1)}" y1="${top - 6}" y2="${base + 26}" class="evpd"/><text x="${(X(k) + 4).toFixed(1)}" y="${top - 10}" class="evpx">morgen</text>`; });
    area += ` L${X(n)} ${base} Z`;
    (PL.wins || []).forEach((w) => { const a = shown.findIndex((x) => x.i === w.s), b = shown.findIndex((x) => x.i === w.e - 1); if (a < 0) return; const e = b < 0 ? a : b, sun = w.share >= 50;
      wins += `<rect x="${(X(a) + 1).toFixed(1)}" y="${top}" width="${((e - a + 1) * bw - 2).toFixed(1)}" height="${base - top}" rx="9" class="evpw ${sun ? "s" : "g"}"/><text x="${(X(a) + 6).toFixed(1)}" y="${top + 15}" class="evpwl ${sun ? "s" : "g"}">${num(w.kwh, 1)} kWh</text>`; });
    const dk = dl ? shown.findIndex((x) => x.t.getTime() + SL * 36e5 > dl.getTime()) : -1, dx = dk >= 0 ? X(dk) + ((dl - shown[dk].t) / (SL * 36e5)) * bw : null;
    const after = dx != null ? `<rect x="${dx.toFixed(1)}" y="${top - 8}" width="${(W - pr - dx).toFixed(1)}" height="${base - top + 36}" class="evpa"/><line x1="${dx.toFixed(1)}" x2="${dx.toFixed(1)}" y1="${top - 8}" y2="${base + 26}" class="evpdl"/><text x="${(dx + 6).toFixed(1)}" y="${top + 4}" class="evpdt">Abfahrt ${dl ? tm(dl) : ""}${PL.target ? " · " + PL.target + " %" : ""}</text>` : "";
    const nowX = shown.length ? X(0) + ((now - shown[0].t) / (SL * 36e5)) * bw : X(0);
    const svg = `<svg class="evpsvg" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none" role="img" aria-label="Sonne, Strompreis und geplante Ladefenster bis zur Abfahrt">
      <defs><linearGradient id="evpsun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#facc15" stop-opacity=".55"/><stop offset="1" stop-color="#facc15" stop-opacity=".04"/></linearGradient></defs>
      <line x1="${pl}" x2="${W - pr}" y1="${base}" y2="${base}" class="evpd"/>${wins}<path d="${area}" fill="url(#evpsun)"/><path d="${line}" fill="none" stroke="#facc15" stroke-width="2.4" vector-effect="non-scaling-stroke"/>
      ${strip}${labels}${after}<line x1="${nowX.toFixed(1)}" x2="${nowX.toFixed(1)}" y1="${top - 8}" y2="${base + 26}" class="evpn"/><text x="${(nowX + 4).toFixed(1)}" y="${top - 10}" class="evpx b">jetzt</text></svg>`;
    // Satz: Was passiert bis zur Abfahrt?
    const ws = (PL.wins || []).map((w) => { const a = H[w.s] && new Date(H[w.s].t), b = H[w.e - 1] && new Date(new Date(H[w.e - 1].t).getTime() + SL * 36e5); if (!a) return ""; const tod = a.toDateString() === new Date().toDateString();
      return `${tod ? "heute" : "morgen"} ${tm(a)}–${tm(b)} ${w.share >= 50 ? "mit Sonne" : "zum günstigen Preis"} (${num(w.kwh, 1)} kWh)`; }).filter(Boolean);
    const say = !PL.ok ? (PL.why === "soc" ? `Für einen Plan fehlt der Ladestand${PL.veh ? ` von <b>${esc(PL.veh)}</b>` : ""}. ${PL.vid && adm ? `<button class="lnk" data-act="wbrvedit" data-v="${esc(PL.vid)}">Sensor wählen oder Ladestand eingeben</button>` : ""}` : "Der Plan wird berechnet …")
      : PL.need <= 0.05 ? "<b>Ziel schon erreicht.</b> Bis zur Abfahrt muss nicht geladen werden." : `<b>So wird geladen:</b> ${ws.map(esc).join(", dann ")}.${PL.left > 0.05 ? ` Es fehlen noch ${num(PL.left, 1)} kWh – die kommen zum Schluss mit Netzstrom.` : ""}`;
    const k = (img, l, v, u, sub) => `<div class="evk"><div class="evkh">${img}<span>${l}</span></div><div class="evkv">${v}${u ? `<small>${u}</small>` : ""}</div><div class="evks">${sub}</div></div>`;
    const sh = PL.ok && PL.plan.kwh > 0 ? PL.plan.pv / PL.plan.kwh * 100 : 0, sav = PL.ok ? Math.max(0, PL.imm.cost - PL.plan.cost) : 0;
    const chip = (key, t) => `<button class="${(c.planStrat || "mix") === key ? "sel" : ""}" data-act="wbplan" data-k="${key}" aria-pressed="${(c.planStrat || "mix") === key}" ${adm ? "" : "disabled"}>${t}</button>`;
    return `<div class="card evplan"><h2>${this._gx("schedule", 24)}Ladeplan bis zur Abfahrt<span class="evmr">${PL.veh ? esc(PL.veh) + (PL.cap ? ` · ${num(PL.cap, 1)} kWh` : "") : ""}</span></h2>
      <div class="vrow"><span>Planung steuert die Wallbox<small class="mut" style="display:block">${c.planOn ? "An: Die Wallbox lädt nur in den geplanten Fenstern." : "Aus: Der Plan wird nur angezeigt."}</small></span><button class="sw ${c.planOn ? "on" : ""}" data-act="wbsw" data-k="planOn" aria-pressed="${!!c.planOn}" aria-label="Planung aktiv" ${adm ? "" : "disabled"}></button></div>
      ${c.planOn && !c.enabled ? `<div class="gst on">${ic("info", 15)}Die Laderegelung ist aus. Schalte sie im Register „Laden“ ein, sonst wird nichts nach Plan geladen.</div>` : ""}
      ${PL.ok && PL.day_ok === false ? `<div class="gst on">${ic("info", 15)}<span>An diesem Tag gilt keine Abfahrt (${PL.days === "wk" ? "nur Mo–Fr" : "nur am Wochenende"}). Es gilt der normale Modus.</span></div>` : ""}
      <div class="evseg">${chip("mix", "Sonne zuerst, dann günstig")}${chip("sun", "Nur Sonne")}${chip("price", "Günstigster Preis")}</div>
      <div class="mut sm" style="margin:4px 0 6px">Ziel <b>${PL.target != null ? PL.target : c.planSoc} %</b> bis <b>${esc(PL.until || c.planTime)} Uhr</b>${PL.soc != null ? ` · jetzt ${num(PL.soc, 0)} %${PL.est ? " (geschätzt)" : ""}` : ""}${PL.pmax ? ` · bis ${num(PL.pmax, 1)} kW` : ""}${PL.own ? " · eigene Abfahrt des Fahrzeugs" : ""}</div>
      <div class="evpwrap">${svg}</div>
      <div class="gsleg" style="margin-top:4px"><span><i style="background:#facc15"></i>Sonne (${esc(F.pv_src || "Prognose")})</span><span><i style="background:linear-gradient(90deg,#34d399,#fbbf24,#f87171)"></i>Preis günstig → teuer</span><span><i style="background:transparent;outline:1.5px solid var(--teal)"></i>Ladefenster</span></div>
      <div class="evsay ${PL.ok ? "ok" : "info"}" style="margin:12px 0 0">${this._gx(PL.ok && sh >= 50 ? "sun" : "price", 28, { on: 1 })}<span>${say}</span></div></div>
      ${PL.ok ? `<div class="evks4">${k(this._gx("bolt", 36), "Geplant", num(PL.plan.kwh, 1), "kWh", `${num(PL.soc, 0)} % → ${PL.target} %`)}${k(this._gx("sun", 36, { on: 1 }), "Davon Sonne", num(sh, 0), "%", `${num(PL.plan.pv, 1)} kWh`)}${k(this._gx("euro", 36), "Kosten", num(PL.plan.cost, 2), "€", "Netzstrom im Plan")}${k(this._gx("price", 36), "Ersparnis", num(sav, 2), "€", "gegenüber sofort laden")}</div>` : ""}
      ${this._wbPlan(d, true)}`;
  }
  /* A13: Statistik – Zeitraum wie Modul 3/4, Kacheln mit Vergleich, pro 100 km, Fahrzeuge und Karten */
  _evNarrow() { return (window.innerWidth || 1000) < 620; }
  _evSt() { const n = new Date(); return this._evStV || (this._evStV = { per: "m", at: new Date(n.getFullYear(), n.getMonth(), n.getDate()) }); }
  _evRange(per, at) {
    const a = new Date(at), d0 = per === "d" ? new Date(a.getFullYear(), a.getMonth(), a.getDate()) : per === "w" ? (() => { const x = new Date(a.getFullYear(), a.getMonth(), a.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; })() : per === "m" ? new Date(a.getFullYear(), a.getMonth(), 1) : new Date(a.getFullYear(), 0, 1);
    const d1 = per === "d" ? new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + 1) : per === "w" ? new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + 7) : per === "m" ? new Date(d0.getFullYear(), d0.getMonth() + 1, 1) : new Date(d0.getFullYear() + 1, 0, 1);
    const prev = per === "d" ? new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() - 1) : per === "w" ? new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() - 7) : per === "m" ? new Date(d0.getFullYear(), d0.getMonth() - 1, 1) : new Date(d0.getFullYear() - 1, 0, 1);
    return { d0, d1, prev };
  }
  _evAgg(days, d0, d1) {
    const key = (t) => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`, a = key(d0), b = key(d1), T = { pv: 0, grid: 0, cost: 0, full: 0, km: 0, veh: {} };
    days.filter((r) => r.d >= a && r.d < b).forEach((r) => { T.pv += r.pv; T.grid += r.grid; T.cost += r.cost; T.full += r.full || 0; T.km += r.km || 0;
      Object.entries(r.veh || {}).forEach(([n, x]) => { const v = T.veh[n] || (T.veh[n] = { kwh: 0, cost: 0, km: 0 }); v.kwh += x.kwh; v.cost += x.cost; v.km += x.km || 0; }); });
    T.kwh = T.pv + T.grid; return T;
  }
  _evStatNew() {
    this._wbStatLoad();
    const D = (this._wbStD && this._wbStD.data) || null;
    if (!D) return `<div class="card empty">${this._gx("meter", 40)}<div class="sm" style="margin-top:8px">Statistik wird geladen …</div></div>`;
    const S = this._evSt(), R = this._evRange(S.per, S.at), days = D.days || [], T = this._evAgg(days, R.d0, R.d1), run = R.d1 > new Date();
    /* Vergleich fair: Läuft der Zeitraum noch, zählt beim Vorzeitraum nur derselbe Anteil (z. B. 1.–13. Oktober gegen 1.–13. November) */
    const pEnd = run && S.per !== "d" ? (() => { const t = new Date(R.prev); t.setDate(t.getDate() + Math.ceil((new Date() - R.d0) / 864e5)); return t < R.d0 ? t : R.d0; })() : R.d0, Pv = this._evAgg(days, R.prev, pEnd);
    const MON = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"], MONL = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    const fd = (t) => t.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
    const title = S.per === "d" ? R.d0.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) : S.per === "w" ? `${fd(R.d0)} – ${fd(new Date(R.d1 - 864e5))}` : S.per === "m" ? `${MONL[R.d0.getMonth()]} ${R.d0.getFullYear()}` : String(R.d0.getFullYear());
    const inR = (iso) => { const t = new Date(iso); return t >= R.d0 && t < R.d1; }, ses = (D.sessions || []).filter((x) => inR(x.start));
    const sh = T.kwh > 0 ? T.pv / T.kwh * 100 : 0, shP = Pv.kwh > 0 ? Pv.pv / Pv.kwh * 100 : null, d100 = T.km > 0 ? T.cost / T.km * 100 : null, k100 = T.km > 0 ? T.kwh / T.km * 100 : null;
    const delta = (v, p, unit, better) => p == null || (!v && !p) ? "" : (() => { const dv = v - p, up = dv > 0.05, dn = dv < -0.05; return up || dn ? `<em class="evd ${!better ? "n" : (up ? better === "up" : better === "down") ? "g" : "b"}">${up ? "▲" : "▼"} ${num(Math.abs(dv), unit === "%" ? 0 : 2)}${unit === "%" ? " Pkt." : " " + unit}</em>` : ""; })();
    const prevN = S.per === "d" ? "Vortag" : S.per === "w" ? "Vorwoche" : S.per === "m" ? "Vormonat" : "Vorjahr";
    const k = (img, l, v, u, sub) => `<div class="evk"><div class="evkh">${img}<span>${l}</span></div><div class="evkv">${v}${u ? `<small>${u}</small>` : ""}</div><div class="evks">${sub}</div></div>`;
    // Balken: Woche = 7 Tage, Monat = Tage, Jahr = Monate, Tag = Ladungen
    let slots = [];
    if (S.per === "y") for (let m = 0; m < 12; m++) { const a = new Date(R.d0.getFullYear(), m, 1), b = new Date(R.d0.getFullYear(), m + 1, 1), x = this._evAgg(days, a, b); slots.push({ l: MON[m], pv: x.pv, grid: x.grid, go: a, per: "m" }); }
    else if (S.per === "d") slots = ses.slice().reverse().map((x) => ({ l: new Date(x.start).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }), pv: x.pv, grid: x.kwh - x.pv }));
    else for (let t = new Date(R.d0); t < R.d1; t = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1)) { const x = this._evAgg(days, t, new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1)); slots.push({ l: S.per === "w" ? ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][t.getDay()] : String(t.getDate()), pv: x.pv, grid: x.grid, go: new Date(t), per: "d" }); }
    const mx = Math.max(0.5, ...slots.map((s) => s.pv + s.grid)), W = this._evNarrow() ? 440 : 1000, Hh = 190, base = 160, bw = (W - 20) / Math.max(1, slots.length), bar = Math.min(bw * 0.62, 46);
    const bars = slots.map((s, i) => { const x = 10 + i * bw + (bw - bar) / 2, hp = s.pv / mx * (base - 14), hg = s.grid / mx * (base - 14), lab = slots.length <= 16 || i % 2 === 0 || i === slots.length - 1;
      return `<g ${s.go ? `class="evsb" data-act="wbvgo" data-k="${s.go.getTime()}" data-p="${s.per}"` : ""}><title>${esc(s.l)}: ${num(s.pv + s.grid, 1)} kWh · ${num(s.pv + s.grid > 0 ? s.pv / (s.pv + s.grid) * 100 : 0, 0)} % Sonne</title><rect x="${x.toFixed(1)}" y="8" width="${bar.toFixed(1)}" height="${base - 8}" fill="transparent"/>${hp > 0.3 ? `<rect x="${x.toFixed(1)}" y="${(base - hp).toFixed(1)}" width="${bar.toFixed(1)}" height="${hp.toFixed(1)}" rx="4" fill="var(--teal)"/>` : ""}${hg > 0.3 ? `<rect x="${x.toFixed(1)}" y="${(base - hp - hg).toFixed(1)}" width="${bar.toFixed(1)}" height="${hg.toFixed(1)}" rx="4" fill="var(--amber)"/>` : ""}${lab ? `<text x="${(x + bar / 2).toFixed(1)}" y="${base + 18}" class="evpx" text-anchor="middle">${esc(s.l)}</text>` : ""}</g>`; }).join("");
    const vehs = Object.entries(T.veh).sort((a, b) => b[1].kwh - a[1].kwh), vmx = Math.max(0.1, ...vehs.map(([, v]) => v.kwh)), cv = this._wb().vehicles || [];
    const cards = {}; ses.forEach((x) => { if (!x.card) return; const c = cards[x.card] || (cards[x.card] = { kwh: 0, cost: 0, n: 0, veh: x.veh }); c.kwh += x.kwh; c.cost += x.cost; c.n++; });
    const seg = (p, t) => `<button class="${S.per === p ? "sel" : ""}" data-act="wbvper" data-k="${p}" aria-pressed="${S.per === p}">${t}</button>`;
    const isNow = run;
    return `<div class="evsthd"><div class="evseg">${seg("d", "Tag")}${seg("w", "Woche")}${seg("m", "Monat")}${seg("y", "Jahr")}</div><div class="evnav"><button data-act="wbvnav" data-k="-1" aria-label="Zurück">‹</button><b>${esc(title)}</b><button data-act="wbvnav" data-k="1" aria-label="Weiter" ${isNow ? "disabled" : ""}>›</button></div></div>
      <div class="evks5">${k(this._gx("bolt", 34), "Geladen", num(T.kwh, 1), "kWh", `${ses.length} ${ses.length === 1 ? "Ladung" : "Ladungen"} ${delta(T.kwh, Pv.kwh, "kWh", "")}`)}
        ${k(this._gx("sun", 34, { on: 1 }), "Sonnenanteil", num(sh, 0), "%", `${num(T.pv, 1)} kWh Sonne ${shP != null ? delta(sh, shP, "%", "up") : ""}`)}
        ${k(this._gx("euro", 34), "Kosten", num(T.cost, 2), "€", `nur Netzstrom ${delta(T.cost, Pv.cost, "€", "down")}`)}
        ${k(this._gx("car", 34), "Pro 100 km", d100 != null ? num(d100, 2) : "–", d100 != null ? "€" : "", k100 != null ? `${num(k100, 1)} kWh/100 km · ${num(T.km, 0)} km` : "braucht den Kilometerstand")}
        ${k(this._gx("price", 34), "Gespart", num(Math.max(0, T.full - T.cost), 2), "€", "gegenüber nur Netzstrom")}</div>
      <div class="evcols"><div><div class="card"><h2>${this._gx("meter", 24)}${S.per === "d" ? "Ladungen an diesem Tag" : S.per === "y" ? "Geladen je Monat" : "Geladen je Tag"}<span class="evmr">${S.per === "y" || S.per === "m" || S.per === "w" ? "Antippen öffnet den Zeitraum" : ""}</span></h2>
        ${slots.length && T.kwh > 0 ? `<svg class="evstsvg" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none" role="img" aria-label="Geladene Energie, Sonne und Netz">${bars}<line x1="10" x2="${W - 10}" y1="${base}" y2="${base}" class="evpd"/></svg>
        <div class="gsleg"><span><i style="background:var(--teal)"></i>Sonne ${num(T.pv, 1)} kWh</span><span><i style="background:var(--amber)"></i>Netz ${num(T.grid, 1)} kWh</span><span class="mut">▲▼ gegenüber ${run && S.per !== "d" ? "dem gleichen Zeitraum im " + prevN : "dem " + prevN}</span></div>` : `<div class="mut sm">In diesem Zeitraum wurde nicht geladen.</div>`}</div>
        <div class="card"><h2>${this._gx("schedule", 24)}Ladungen<span class="evmr"><button class="lnk" data-act="wbcsv">Als CSV exportieren</button></span></h2>${ses.length ? `<div class="evses">${ses.slice(0, 12).map((x) => { const t = new Date(x.start), s2 = x.kwh > 0 ? x.pv / x.kwh * 100 : 0;
          return `<div><span class="evsd"><b>${t.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}</b><small>${t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}${x.running ? " · läuft" : x.min ? " · " + (x.min >= 60 ? num(x.min / 60, 1) + " h" : num(x.min, 0) + " Min.") : ""}</small></span><span class="evsv"><b>${esc(x.veh || "Unbekannt")}</b><small>${x.card ? esc(x.card) : this._wbHa() ? "" : "ohne Karte"}</small></span><span class="evsbar"><i style="width:${s2}%"></i></span><span class="evsk"><b>${num(x.kwh, 1)} kWh</b><small>${num(s2, 0)} % Sonne · ${num(x.cost, 2)} €</small></span></div>`; }).join("")}</div>` : `<div class="mut sm">Keine Ladungen in diesem Zeitraum.</div>`}</div></div>
      <div><div class="card"><h2>${this._gx("people", 24)}Fahrzeuge &amp; Karten</h2>${vehs.length ? vehs.map(([n, v]) => { const x = cv.find((y) => y.name === n), p100 = v.km > 0 ? v.cost / v.km * 100 : null;
          return `<div class="evvr">${x ? `<span class="rfpic">${this._evThumb(x, 84)}</span>` : `<span class="rfpic">${this._gx("car", 30)}</span>`}<div class="evvt"><b>${esc(n)}</b><div class="evbb sm"><i class="f" style="width:${v.kwh / vmx * 100}%"></i></div><small>${num(v.kwh, 1)} kWh · ${num(v.cost, 2)} €${p100 != null ? ` · ${num(p100, 2)} €/100 km` : ""}</small></div></div>`; }).join("") : `<div class="mut sm">Noch keine Ladungen mit erkanntem Fahrzeug.</div>`}
        ${Object.keys(cards).length ? `<div class="lsec" style="margin-top:10px">${ic("shield", 15)}Je Karte</div>${Object.entries(cards).map(([n, c]) => `<div class="evcr"><span><b>${esc(n)}</b><small>${esc(c.veh)} · ${c.n} ${c.n === 1 ? "Ladung" : "Ladungen"}</small></span><span><b>${num(c.kwh, 1)} kWh</b><small>${num(c.cost, 2)} €</small></span></div>`).join("")}` : ""}</div></div></div>`;
  }
  _evStAct(a, b) {
    const S = this._evSt(), k = b.dataset.k;
    if (a === "wbvper") S.per = k;
    else if (a === "wbvnav") { const d = Number(k), t = new Date(S.at); if (S.per === "d") t.setDate(t.getDate() + d); else if (S.per === "w") t.setDate(t.getDate() + 7 * d); else if (S.per === "m") t.setMonth(t.getMonth() + d, 1); else t.setFullYear(t.getFullYear() + d, 0, 1); S.at = t; }
    else if (a === "wbvgo") { S.at = new Date(Number(k)); S.per = b.dataset.p || "d"; }
    else if (a === "wbvestok") { const inp = this.shadowRoot.querySelector('[data-f="wbvest"]'), v = parseFloat(String(inp && inp.value || "").replace(",", ".")); if (!isFinite(v) || v < 0 || v > 100) { this._toast("Bitte einen Ladestand von 0 bis 100 % eingeben"); return; }
      this._hass.callWS({ type: "fenster_heizung/wb_est", vid: b.dataset.v, soc: v }).then((r) => { this._wbD = { snap: r, ts: Date.now() }; this._renderModal(); this._render(); this._toast("Ladestand übernommen"); }).catch(() => this._toast("Ladestand konnte nicht gespeichert werden")); return; }
    this._render();
  }
