  /* ================= Tablet-Modus · Stufe 5: Warnen und Erinnern (Modul 9, 11 und 17) ohne Scrollen =================
     Modul 9 Wetter: Reiter Jetzt (Lage, sechs Warnkacheln, amtlich, Vorsorge), 48 Stunden (Temperatur und Wind als Kurven) und Karte (DWD).
     Modul 11 Melder: Reiter Übersicht (Zustand, vier Werte, Abfahrt, Als Nächstes), Melder (bis zu 12 je Seite) und Grundriss (nur mit Plan).
     Modul 17 Müll: Reiter Abholung (was heute zu tun ist, alle Tonnen), Kalender (Monat, wer ist dran) und Haushalt (Verlauf, Jahr, Kosten).
     Anzeigen und „Verstanden“, „Steht draußen“ gehen immer. Geräte schalten und Einstellungen fragen nach der PIN, wenn das Tablet eine hat.
     Bei einer Wetterwarnung zeigt das Ruhebild die Wetter-Szene (Konzept: Variante C bei Warnung). */
  _tm2Set(g, label, extra = "") { return this._admin() ? `<button class="tm2mini" data-act="tm2g" data-g="${g}"${extra}>${ic(this._tmMe().has_pin ? "lock" : "sliders", 16)}${label}</button>` : ""; }
  _tm2Hm(iso) { const t = new Date(iso); return isFinite(t) ? `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}` : ""; }
  _tm2When(iso) {
    const t = new Date(iso); if (!isFinite(t)) return "";
    const d0 = new Date(); d0.setHours(0, 0, 0, 0); const n = Math.floor((t - d0) / 864e5);
    return `${n === 0 ? "" : n === 1 ? "morgen " : n === -1 ? "gestern " : t.toLocaleDateString("de-DE", { weekday: "short" }) + " "}${this._tm2Hm(iso)}`;
  }

  /* ---------- Modul 9 · Wetter & Warnungen ---------- */
  _tm2WxReady() { return !!(this._wxsD && this._wxsD.d && this._wxsD.d.cfg); }
  _tm2WxMapOn() { const M = (this._wxs().cfg || {}).map; return !M || M.on !== false; }
  /* Lage in einem Satz – dieselbe Rechnung wie auf der normalen Modulseite */
  _tm2WxSit() {
    const S = this._wxs(), C = S.cfg, NM = this._wxsNames(), live = !S.error && !!S.state, W = (live ? S.state.warn : this._wxsLocal()) || {}, d = this._wxWarn(), hm = (iso) => this._tm2Hm(iso);
    const KEYS = Object.keys(NM), on = (k) => !!(C.warn[k] && C.warn[k].on), lvOf = (k) => Math.max(1, Math.min(4, Number((W[k] || {}).lv) || 1)), nmOf = (k) => (k === "frost" && (W.frost || {}).kind === "ice" ? "Glätte" : NM[k]);
    const act = KEYS.filter((k) => on(k) && (W[k] || {}).a).sort((a, b) => lvOf(b) - lvOf(a)), soon = KEYS.filter((k) => on(k) && !(W[k] || {}).a && (W[k] || {}).ahead);
    const OL = (live && S.state.officials) || [], cur = OL.filter((x) => !x.vorab && !x.kommt).sort((a, b) => b.stufe - a.stufe);
    const own = act.length ? lvOf(act[0]) : 0, off = cur.length ? cur[0].stufe : 0, lv = Math.max(own, off), offTop = off > own;
    const tone = lv ? "hot" : soon.length || OL.length ? "soon" : "ok";
    let head, sub;
    if (offTop) { head = cur[0].titel; sub = `Amtlich${cur[0].bis ? ` bis ${this._tm2When(cur[0].bis)} Uhr` : ""}${act.length ? ` · gemessen: ${nmOf(act[0])}` : ""}`; }
    else if (act.length) { const w = W[act[0]] || {}; head = `${nmOf(act[0])} · Stufe ${own}${act.length > 1 ? ` und ${act.length - 1} weitere` : ""}`; sub = `${w.since ? `Seit ${hm(w.since)} Uhr` : "Gerade aktiv"}${cur.length ? ` · amtlich: ${cur[0].titel}` : ""}`; }
    else if (soon.length) { const w = W[soon[0]]; head = `${nmOf(soon[0])} wird erwartet`; sub = `Ab etwa ${this._tm2When(w.ahead)} Uhr${w.ahead_lv ? ` · Stufe ${w.ahead_lv}` : ""}`; }
    else if (OL.length) { head = OL[0].titel; sub = `${OL[0].vorab ? "Vorabinformation" : "Kommt"}${OL[0].von ? ` ab ${this._tm2When(OL[0].von)} Uhr` : ""}`; }
    else { head = "Keine Warnung"; sub = "Alle eingeschalteten Warnungen sind ruhig."; }
    return { S, C, NM, W, d, live, act, soon, OL, cur, lv, tone, head, sub, hm };
  }
  _tm2WxStatus() {
    if (!this._tm2WxReady()) return "Wird geladen";
    const X = this._tm2WxSit(), d = X.d;
    if (X.lv || X.tone === "soon") return esc(X.head);
    return ["Keine Warnung", d.o.t != null ? `${num(d.o.t, 1)} °C` : "", isFinite(d.mx) && d.mx > 0 ? `Wind ${num(d.mx, 0)} km/h` : ""].filter(Boolean).join(" · ");
  }
  _tm2Wx() {
    this._wxsLoad();
    if (!this._tm2WxReady()) return this._tm2None("cloud", this._wxsD && this._wxsD.d && this._wxsD.d.error ? "Wetter konnte nicht geladen werden." : "Wetter wird geladen …");
    const t = this._tm2Tab("wx");
    return t === "h48" ? this._tm2Wx48() : t === "map" ? this._tm2WxMap() : this._tm2WxNow();
  }
  _tm2WxNow() {
    const X = this._tm2WxSit(), { S, C, NM, W, d, live, hm } = X, st = S.state || {}, col = this._wxLvCol(X.lv), land = this._tm2Land();
    const ICO = { storm: "fan", thunder: "bolt", hail: "snow", frost: "thermo", heat: "sun", rain: "drop" };
    const wx = d.w ? (WX[d.w.state] || ["cloud", d.w.state]) : null;
    const now = [wx && `<span>${ic(wx[0], 18)}${esc(wx[1])}</span>`, d.o.t != null && `<span>${ic("thermo", 18)}${num(d.o.t, 1)} °C</span>`, isFinite(d.mx) && d.mx > 0 && `<span>${ic("fan", 18)}${num(d.mx, 0)} km/h</span>`].filter(Boolean).join("");
    const pill = `<span class="wxlvp" style="--wc:${X.tone === "soon" && !X.lv ? "#facc15" : col}">${X.lv ? `Stufe ${X.lv} · ${this._wxLvName(X.lv)}` : X.tone === "soon" ? "Vorwarnung" : "Ruhig"}</span>`;
    /* Bedienung: „Verstanden“ ohne PIN, Rollläden schließen nur nach der PIN */
    const covers = (C.acts || []).some((x) => String(x.ent).startsWith("cover.") && x.do === "close");
    const btns = [st.any ? (st.acked ? `<span class="tm2wxok">${ic("check", 18)}Quittiert</span>` : `<button class="btn2 pri" data-act="wxsack">${ic("check", 18)}Verstanden</button>`) : "",
      st.any && covers && this._admin() ? `<button class="btn2" data-act="tm2g" data-g="wxsclose">${ic(this._tmMe().has_pin ? "lock" : "blinds", 18)}Alles schließen</button>` : ""].join("");
    const sc = this._wxScSvg(this._wxScState(S, W, X.lv));
    const lage = `<div class="card tm2wxl ${X.lv ? "on" : X.tone}" style="--wc:${X.tone === "soon" && !X.lv ? "#facc15" : col}"><div class="tm2wxlt"><span class="tm2wxk">${ic("shield", 15)}Lage</span><b>${esc(X.head)}</b><small>${esc(X.sub)}</small>
      <div class="tm2wxln">${pill}${now}</div>${btns ? `<div class="tm2wxlb">${btns}</div>` : ""}</div><div class="tm2wxsc">${sc}</div></div>`;
    const tiles = `<div class="tm2wxt">${this._wxTiles({ S, W, C, NM, ICO, d, hm, live })}</div>`;
    /* Rechts: amtliche Warnungen und Vorsorge */
    const offOn = C.official.on;
    const offRows = X.OL.slice(0, land ? 2 : 1).map((x) => `<div class="tm2wxo" style="--wc:${this._wxLvCol(x.stufe)}"><i></i><span><b>${esc(x.titel)}</b><small>${x.vorab ? "Vorab" : x.kommt ? "Kommt" : `Stufe ${x.stufe}`}${x.bis ? ` · bis ${this._tm2When(x.bis)} Uhr` : ""} · ${esc(String(x.quelle || "").split(" · ")[0])}</small></span></div>`).join("");
    const off = offOn ? `<div class="card tm2cc tm2wxoc"><div class="tm2sh"><span>${ic("shield", 18)}Amtlich</span>${X.OL.length > (land ? 2 : 1) ? `<em>+${X.OL.length - (land ? 2 : 1)} weitere</em>` : ""}</div>${offRows || `<div class="tm2wxo ok"><i></i><span><b>Keine amtliche Warnung</b><small>Deutscher Wetterdienst</small></span></div>`}</div>` : "";
    const V = S.vor || [], per = land ? (window.innerHeight < 760 ? 2 : 3) : 2, p = this._tm2Page("wxvor", V.length, per), ico = { battery: "energy", car: "car", sun: "sun", window: "window", snow: "snow" };
    const vrow = (x) => `<div class="tm2wxv ${x.done ? "done" : ""}"><span class="i">${ic(ico[x.icon] || "info", 22)}</span><span class="t"><b>${esc(x.title)}</b><small>${esc(x.text)}</small></span>${x.done ? `<em>${ic("check", 16)}${hm(x.done)}</em>` : x.btn && this._admin() ? `<button class="btn2" data-act="tm2g" data-g="wxsvor" data-k="${esc(x.id)}">${esc(x.btn)}</button>` : x.auto ? `<em>automatisch</em>` : ""}</div>`;
    const vor = `<div class="card tm2cc tm2wxvc" data-sw="wxvor"><div class="tm2sh"><span>${ic("list", 18)}Vorsorge</span>${this._tm2Set("wxsopen", "Einstellungen")}</div>${V.length ? `<div class="tm2wxvl" style="--n:${per}">${V.slice(p.from, p.to).map(vrow).join("")}</div>${this._tm2Pager("wxvor", p, "")}` : `<small class="tm2note">Gerade gibt es nichts vorzubereiten. Bei Frost, Sturm oder Hitze steht hier, was du tun kannst.</small>`}</div>`;
    return `<div class="tm2wxn">${lage}${tiles}<div class="tm2wxr">${off}${vor}</div></div>`;
  }
  /* 48 Stunden: Temperatur mit Frostzeit, Wind gegen die Sturmgrenze */
  _tm2WxSeries() {
    const S = this._wxs(), T = S.tl || {};
    if ((T.t || []).length > 1 && Array.isArray(T.temp)) return { t: T.t, temp: T.temp, wind: T.wind || [], cond: T.cond || [] };
    const fc = S.fc || [];   /* ältere Backends: nur die 12 Stunden der Vorwarnung */
    return { t: fc.map((x) => x.t), temp: fc.map((x) => (isFinite(x.temp) ? x.temp : null)), wind: fc.map((x) => (isFinite(x.wind) ? x.wind : null)), cond: fc.map((x) => x.cond || "") };
  }
  _tm2Wx48() {
    const S = this._wxs(), C = S.cfg, R = this._tm2WxSeries(), n = R.t.length;
    if (n < 2) return this._tm2None("clock", "Keine Stundenvorhersage.", "Die Wetter-Entität liefert keine Vorhersage je Stunde. Die Kurven brauchen sie.");
    const fin = (v) => v != null && isFinite(v), T = R.temp.map((v, i) => [v, i]).filter(([v]) => fin(v)), Wd = R.wind.map((v, i) => [v, i]).filter(([v]) => fin(v));
    const lo = T.length ? T.reduce((a, b) => (b[0] < a[0] ? b : a)) : null, hi = Wd.length ? Wd.reduce((a, b) => (b[0] > a[0] ? b : a)) : null;
    const fr = C.warn.frost, frost = fr.on ? T.find(([v]) => v <= fr.temp) : null, st = C.warn.storm, storm = st.on ? Wd.find(([v]) => v >= st.kmh) : null;
    const own = (S.tl || {}).own || {}, first = (() => { for (let i = 0; i < n; i++) { const k = Object.keys(own).find((q) => (own[q] || [])[i] > 0); if (k) return [k, i, own[k][i]]; } return null; })();
    const at = (i) => `${this._tm2When(R.t[i])} Uhr`;
    const tiles = [
      this._tm2Tile4("Tiefstwert", lo ? num(lo[0], 1) : "–", lo ? "°C" : "", lo ? at(lo[1]) : "", lo && fr.on && lo[0] <= fr.temp ? "#60a5fa" : "#2dd4bf"),
      this._tm2Tile4("Stärkster Wind", hi ? num(hi[0], 0) : "–", hi ? "km/h" : "", hi ? at(hi[1]) : "", hi && st.on && hi[0] >= st.kmh ? this._wxLvCol(hi[0] >= (st.kmh3 || 90) ? 3 : 1) : "#2dd4bf"),
      this._tm2Tile4("Frost", frost ? this._tm2When(R.t[frost[1]]) : fr.on ? "keiner" : "aus", "", frost ? `ab ${fr.temp} °C` : fr.on ? `in ${n} Stunden` : "Warnung ausgeschaltet", frost ? "#60a5fa" : "#64748b"),
      this._tm2Tile4("Nächste Warnung", first ? this._tm2When(R.t[first[1]]) : "keine", "", first ? `${this._wxsNames()[first[0]]} · Stufe ${first[2]}` : storm ? `Sturm ab ${at(storm[1])}` : `in ${n} Stunden`, first ? this._wxLvCol(first[2]) : "#34d399")].join("");
    return `<div class="tm2sums">${tiles}</div><div class="card tm2cc tm2wx48"><div class="tm2sh"><span>${ic("chart", 18)}Nächste ${n} Stunden</span><span class="tm2legend"><i style="background:#60a5fa"></i>Temperatur<i style="background:#2dd4bf"></i>Wind${st.on ? `<i class="ln" style="background:${this._wxLvCol(1)}"></i>Sturmgrenze` : ""}</span></div><div class="tm2ch" data-tm2ch="wx48"></div></div>`;
  }
  _tm2WxChart(box, w, h) {
    const S = this._wxs(), C = S.cfg, R = this._tm2WxSeries(), n = R.t.length; if (n < 2) { box.innerHTML = ""; return; }
    const padL = 44, padR = 12, gap = 26, axis = 22, ph = Math.max(50, (h - gap - axis) / 2), cw = (w - padL - padR) / n, X = (i) => padL + cw * (i + 0.5);
    const t0 = new Date(R.t[0]).getTime(), mid = new Date(t0); mid.setHours(24, 0, 0, 0);
    const iOf = (ms) => (ms - t0) / 3600e3, xm0 = padL + cw * (iOf(mid.getTime()) + 0.5 - 0.5), xm1 = padL + cw * (iOf(mid.getTime() + 864e5) + 0.5 - 0.5);
    const panel = (vals, y0, lo, hi, color, unit, lines, shade) => {
      const Y = (v) => y0 + ph - ((v - lo) / Math.max(1e-6, hi - lo)) * ph;
      let path = "", start = true;
      vals.forEach((v, i) => { if (v == null || !isFinite(v)) { start = true; return; } path += `${start ? "M" : "L"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`; start = false; });
      const ticks = [lo, (lo + hi) / 2, hi].map((v) => `<text x="${padL - 6}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" class="tm2wxax">${num(v, 0)}</text><line x1="${padL}" x2="${w - padR}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="tm2wxg"/>`).join("");
      const ls = lines.map(([v, c, t]) => (v >= lo && v <= hi ? `<line x1="${padL}" x2="${w - padR}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="${c}" class="tm2wxlim"/><text x="${w - padR - 4}" y="${(Y(v) - 5).toFixed(1)}" text-anchor="end" fill="${c}" class="tm2wxlt">${t}</text>` : "")).join("");
      const sh = shade ? vals.map((v, i) => (v != null && isFinite(v) && shade(v) ? `<rect x="${(X(i) - cw / 2).toFixed(1)}" y="${y0}" width="${cw.toFixed(1)}" height="${ph}" fill="${shade(v)}" opacity=".18"/>` : "")).join("") : "";
      return `${sh}${ticks}${ls}<path d="${path}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><text x="${padL}" y="${y0 - 6}" class="tm2wxax">${unit}</text>`;
    };
    const tv = R.temp.filter((v) => v != null && isFinite(v)), wv = R.wind.filter((v) => v != null && isFinite(v)), fr = C.warn.frost, st = C.warn.storm;
    const tlo = Math.floor(Math.min(...tv, fr.on ? fr.temp - 2 : Infinity) - 1), thi = Math.ceil(Math.max(...tv, fr.on ? fr.temp + 2 : -Infinity) + 1);
    const whi = Math.ceil(Math.max(...wv, st.on ? st.kmh * 1.15 : 0, 20) / 10) * 10;
    const tp = panel(R.temp, 18, tlo, thi, "#60a5fa", "°C", fr.on ? [[fr.temp, "#93c5fd", `Frost ab ${fr.temp} °C`]] : [], fr.on ? (v) => (v <= fr.temp ? "#60a5fa" : "") : null);
    const wp = panel(R.wind, 18 + ph + gap, 0, whi, "#2dd4bf", "km/h", st.on ? [[st.kmh, this._wxLvCol(1), `Sturm ab ${st.kmh}`], ...(st.kmh3 && st.kmh3 <= whi ? [[st.kmh3, this._wxLvCol(3), `Stufe 3 ab ${st.kmh3}`]] : [])] : [], st.on ? (v) => (v >= st.kmh ? this._wxLvCol(v >= (st.kmh3 || 999) ? 3 : 1) : "") : null);
    const ticks = R.t.map((t, i) => { const d = new Date(t); return d.getHours() % 6 === 0 ? `<text x="${X(i).toFixed(1)}" y="${h - 5}" text-anchor="middle" class="tm2wxax">${d.getHours() === 0 ? d.toLocaleDateString("de-DE", { weekday: "short" }) : `${d.getHours()} Uhr`}</text>` : ""; }).join("");
    const tom = xm0 < w - padR ? `<rect x="${Math.max(padL, xm0).toFixed(1)}" y="0" width="${(Math.min(w - padR, xm1) - Math.max(padL, xm0)).toFixed(1)}" height="${h - axis}" class="tm2wxtm"/><text x="${(Math.max(padL, xm0) + 6).toFixed(1)}" y="12" class="tm2wxax">Morgen</text>` : "";
    box.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Temperatur und Wind der nächsten ${n} Stunden">${tom}${tp}${wp}${ticks}</svg>`;
  }
  /* Karte: DWD-Warnkarte oder Regenradar, so groß wie der Platz */
  _tm2WxMap() {
    const S = this._wxs(), M = (S.cfg && S.cfg.map) || {}, layer = this._wxMapL || M.layer || "warn", zoom = this._wxMapZ || M.zoom || "region", Z = this.constructor.WX_MAP_Z;
    const legend = layer === "radar" ? `<span class="wxmlg rad">leicht<i class="grad"></i>stark</span>` : `<span class="wxmlg">${[1, 2, 3, 4].map((l) => `<i style="background:${this._wxLvCol(l)}"></i>${l}`).join("")}<em>Stufe</em></span>`;
    const seg = (act, cur, L) => `<div class="tm2seg">${L.map(([k, t]) => `<button class="${cur === k ? "sel" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${cur === k}">${t}</button>`).join("")}</div>`;
    return `<div class="card tm2cc tm2wxm"><div class="tm2sh">${seg("wxsmapl", layer, [["warn", "Warnungen"], ["radar", "Regenradar"]])}${seg("wxsmapz", zoom, Object.entries(Z).map(([k, [, t]]) => [k, t]))}</div>
      <div class="tm2wxmb" data-tm2ch="wxmap"></div><div class="tm2wxmf">${legend}<small class="tm2note">Deutscher Wetterdienst · neu alle 5 Minuten</small></div></div>`;
  }
  _tm2WxMapDraw(box, w, h) {
    const S = this._wxs(), M = (S.cfg && S.cfg.map) || {}, layer = this._wxMapL || M.layer || "warn", zoom = this._wxMapZ || M.zoom || "region";
    const W = Math.round(w), H = Math.round(h), m = this._wxMapUrl(layer, zoom, W, H);
    box.innerHTML = `${m.ok && !m.inDe ? `<div class="wxnote">${ic("info", 15)}Dein Zuhause liegt außerhalb Deutschlands. Der DWD zeigt nur Deutschland.</div>` : ""}<div class="wxmimg tm2wxmi"><img src="${esc(m.base)}" data-keep="1" alt="" width="${W}" height="${H}" onerror="this.parentNode&&this.parentNode.classList.add('err')"><img src="${esc(m.url)}" data-keep="1" alt="${layer === "radar" ? "Niederschlagsradar" : "Warnkarte"} des Deutschen Wetterdienstes" width="${W}" height="${H}">
      ${m.pin ? `<span class="wxpin" style="left:${m.pin[0].toFixed(2)}%;top:${m.pin[1].toFixed(2)}%" title="Zuhause">${ic("home", 14)}</span>` : ""}<div class="wxmerr">${ic("alert", 16)}Karte vom DWD gerade nicht erreichbar.</div></div>`;
  }
  /* Ruhebild bei einer Warnung: große Wetter-Szene mit Lage und dem, was schon passiert ist */
  _tm2RestWxOn() {
    if (!this._tm2On() || this._tmC().rest_wx === false || !this._mdState().on.wx || !this._tm2WxReady()) return false;
    const st = this._wxs().state || {}; return !!st.any;
  }
  _tm2RestWx() {
    const X = this._tm2WxSit(), { S, C, W } = X, col = this._wxLvCol(X.lv), run = (S.state && S.state.acts) || {};
    const done = (C.acts || []).filter((a) => run[a.id] && run[a.id].state === "run").map((a) => `${this._wzName(a.ent)} ${({ close: "geschlossen", open: "geöffnet", on: "an", off: "aus", run: "ausgeführt" })[a.do] || ""}`.trim());
    const todo = (S.vor || []).filter((x) => !x.done && !x.auto).map((x) => x.title), open = (S.open || []).map((nm) => `Fenster ${nm} offen`);
    const lines = [...done.map((t) => [1, t]), ...open.map((t) => [0, t]), ...todo.map((t) => [0, t])].slice(0, 4);
    const sc = this._wxScSvg(this._wxScState(S, W, X.lv));
    return `<div class="tm2rwwx" style="--wc:${col}"><div class="tm2rwwxs">${sc}</div><div class="tm2rwwxt"><span class="wxlvp big" style="--wc:${col}">${X.lv ? `${esc(this._wxLvName(X.lv).toUpperCase())} · STUFE ${X.lv}` : "VORWARNUNG"}</span><b>${esc(X.head)}</b><small>${esc(X.sub)}</small>
      ${lines.length ? `<div class="tm2rwwxl">${lines.map(([ok, t]) => `<div class="${ok ? "ok" : "no"}">${ic(ok ? "check" : "alert", 20)}${esc(t)}</div>`).join("")}</div>` : ""}</div></div>`;
  }

  /* ---------- Modul 11 · Rauch- & Sicherheitsmelder ---------- */
  _tm2SfReady() { return !!(this._sfxD && this._sfxD.d && (this._sfxD.d.cfg || this._sfxD.d.error)); }
  _tm2SfPlanOn() { try { return this._sfx().cfg.plan.items.some((i) => i.t === "m" || i.t === "r"); } catch (_) { return false; } }
  _tm2SfStatus() {
    if (!this._tm2SfReady()) return "Wird geladen";
    const T = this._sfStat();
    if (!T.l.length) return "Noch keine Melder";
    if (T.al.length) return `ALARM · ${esc(T.al.map((x) => x.room || x.area || x.name).join(", "))}`;
    const p = [T.low.length && `${T.low.length} Batterie${T.low.length === 1 ? "" : "n"} schwach`, T.off.length && `${T.off.length} nicht erreichbar`, T.due.length && "Prüfung fällig", T.life.length && `${T.life.length} zu tauschen`].filter(Boolean);
    return p.length ? esc(p.join(" · ")) : `Alles in Ordnung · ${T.act.length} Melder`;
  }
  _tm2Sf() {
    this._sfxLoad();
    if (!this._tm2SfReady()) return this._tm2None("shield", "Melder werden geladen …");
    const T = this._sfStat();
    if (!T.l.length) return `<div class="card empty tm2none">${ic("shield", 44)}<div>Noch keine Melder.</div><small>Melder aus Home Assistant erscheinen hier von selbst.</small>${this._tm2Set("sfxopen", "Einstellungen")}</div>`;
    const t = this._tm2Tab("sf");
    return t === "me" ? this._tm2SfMel(T) : t === "pl" && this._tm2SfPlanOn() ? this._tm2SfPlan(T) : this._tm2SfOv(T);
  }
  _tm2SfCol(st) { return { alarm: "#ef4444", pause: "#94a3b8", off: "#94a3b8", warn: "#f59e0b", ok: "#34d399" }[st] || "#64748b"; }
  _tm2SfOv(T) {
    const { S, C, l, al, low, off, due, life, act } = T, land = this._tm2Land(), bad = T.bad, withBat = act.filter((x) => x.bat != null);
    let big, sub;
    if (al.length) { big = al.length > 1 ? `${al.length} Alarme` : `${String(al[0].kind || "Alarm").replace(/melder$/i, "alarm")} · ${al[0].room || al[0].area || al[0].name}`; sub = `${al[0].since ? `Seit ${this._tm2Hm(al[0].since)} Uhr · ` : ""}${al.map((x) => x.name).join(", ")}`; }
    else if (bad === "warn") { big = "Alles ruhig, aber Hinweise"; sub = this._tm2SfStatus(); }
    else { big = "Alles in Ordnung"; sub = `${act.length} Melder · alle erreichbar · Batterien gut`; }
    const stc = `<div class="card tm2sfst ${bad}"><span class="tm2sfsi">${this._gx("smoke", land ? 92 : 72, { alarm: bad === "alarm", off: bad === "warn" })}</span><div><span class="tm2wxk">${ic(bad === "alarm" ? "alert" : "shield", 15)}${bad === "alarm" ? "ALARM" : "Sicherheit im Haus"}</span><b>${esc(big)}</b><small>${sub}</small>
      ${al.length ? `<div class="tm2wxlb"><button class="btn2 pri" data-act="tm2sfdet" data-k="${esc(al[0].id)}">${ic("alert", 18)}Melder ansehen</button></div>` : ""}</div></div>`;
    const G = "#34d399", A = "#f59e0b", Rr = "#ef4444";
    const tiles = [
      this._tm2Tile4("Melder", String(act.length), "", al.length ? `${al.length} im Alarm` : T.pa.length ? `${T.pa.length} ausgeschaltet` : "kein Alarm", al.length ? Rr : G),
      this._tm2Tile4("Batterien", withBat.length ? `${withBat.length - low.length}/${withBat.length}` : "–", "gut", low.length ? `${low[0].name} ${num(low[0].bat, 0)} %` : "alle gut", low.length ? A : G),
      this._tm2Tile4("Erreichbar", `${act.length - off.length}/${act.length}`, "", off.length ? `${off[0].name} offline` : "alle erreichbar", off.length ? A : G),
      this._tm2Tile4("Prüfung", !C.test.on ? "aus" : due.length ? "fällig" : "läuft", "", S.test && S.test.last ? `zuletzt ${this._sfAgo(S.test.last)}` : "noch nie geprüft", due.length ? A : G)].join("");
    /* Abfahrt-Prüfung */
    const rows = this._sfDepRows(), open = rows.filter((x) => x.open), H = this._hass, fr = C.depart.frost;
    const ft = fr && fr.on && fr.ent && H.states[fr.ent] ? parseFloat(fr.ent.startsWith("weather.") ? H.states[fr.ent].attributes.temperature : H.states[fr.ent].state) : NaN;
    const per = land ? (window.innerHeight < 760 ? 3 : 4) : 3, pd = this._tm2Page("sfdep", rows.length, per);
    const dep = `<div class="card tm2cc tm2sfd" data-sw="sfdep"><div class="tm2sh"><span>${ic("lock", 18)}Kann ich gehen?</span><em class="${open.length ? "wa" : "on"}">${rows.length ? (open.length ? `${open.length} offen` : "alles zu") : ""}</em></div>
      ${rows.length ? `<div class="tm2sfdl">${rows.slice(pd.from, pd.to).map((x) => `<div class="tm2sfdr ${x.open ? "open" : ""}">${ic(x.ico, 22)}<span>${esc(x.name)}</span><b>${esc(x.txt)}</b></div>`).join("")}</div>${this._tm2Pager("sfdep", pd, "")}` : `<small class="tm2note">Hier steht, was offen ist, bevor du gehst: Fenster, Türen, Herd, Garage. Auswahl in den Einstellungen von Modul 11.</small>`}
      ${isFinite(ft) && ft < fr.below ? `<div class="tm2sfhint">${ic("snow", 16)}Frost: draußen ${num(ft, 0)} °C. Fenster zu, Außenhahn prüfen.</div>` : ""}</div>`;
    /* Als Nächstes */
    const nx = [];
    act.filter((x) => x.bat != null && x.bat < C.bat.pct).forEach((x) => nx.push([0, "energy", `Batterie ${x.name}`, x.bat_days != null ? `noch ~ ${this._sfDur(x.bat_days)}` : `${num(x.bat, 0)} %`, A, x.id]));
    act.filter((x) => x.off).forEach((x) => nx.push([0, "alert", `${x.name} meldet sich nicht`, x.off_days ? `seit ${x.off_days} ${x.off_days === 1 ? "Tag" : "Tagen"}` : "", A, x.id]));
    if (C.test.on && due.length) nx.push([0, "clock", due.length === 1 ? `Prüfung ${due[0].name}` : `Prüfung von ${due.length} Meldern`, "fällig", A, due.length === 1 ? due[0].id : ""]);
    life.forEach((x) => nx.push([x.life_days < 0 ? 0 : 1, "tools", `${x.name} tauschen`, x.life_days < 0 ? "überfällig" : `in ${this._sfDur(x.life_days)}`, x.life_days < 0 ? Rr : A, x.id]));
    act.filter((x) => x.bat_thr_days != null && x.bat_thr_days <= C.lead && !(x.bat != null && x.bat < C.bat.pct)).forEach((x) => nx.push([1, "energy", `Batterie ${x.name}`, `in ~ ${this._sfDur(x.bat_thr_days)}`, G, x.id]));
    nx.sort((a, b) => a[0] - b[0]);
    const pn = this._tm2Page("sfnext", nx.length, per);
    const next = `<div class="card tm2cc tm2sfn" data-sw="sfnext"><div class="tm2sh"><span>${ic("list", 18)}Als Nächstes</span>${this._tm2Set("sfxopen", "Einstellungen")}</div>
      ${nx.length ? `<div class="tm2sfdl">${nx.slice(pn.from, pn.to).map(([, i, t, v, c, id]) => `<${id ? `button data-act="tm2sfdet" data-k="${esc(id)}"` : "div"} class="tm2sfdr" style="--c:${c}">${ic(i, 22)}<span>${esc(t)}</span><b>${esc(v)}</b></${id ? "button" : "div"}>`).join("")}</div>${this._tm2Pager("sfnext", pn, "")}` : `<small class="tm2note">Im Moment steht nichts an.</small>`}</div>`;
    return `<div class="tm2sfo">${stc}<div class="tm2sums">${tiles}</div><div class="tm2sf2">${dep}${next}</div></div>`;
  }
  /* Melder: auffällige zuerst, bis zu 12 je Seite */
  _tm2SfCap() {
    const land = this._tm2Land(), W = window.innerWidth, H = window.innerHeight, size = this._tmC().size;
    let c = land ? 4 : 2, r = land ? 3 : 6;
    if (land && (W < 1150 || H < 720)) { c = 3; r = 3; }
    if (!land && H < 1150) r = 5;
    if (size === "xl") { c = Math.max(2, c - 1); r = Math.max(2, r - 1); } else if (size === "large" && land) c = 3;
    return { c, r, n: c * r };
  }
  _tm2SfMel(T) {
    const rank = (x) => (x.alarm ? 0 : x.off ? 1 : x.bat != null && x.bat < T.C.bat.pct ? 2 : x.life_days != null && x.life_days <= T.C.lead ? 3 : x.paused ? 5 : 4);
    const L = [...T.l].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, "de")), cap = this._tm2SfCap(), p = this._tm2Page("sfmel", L.length, cap.n);
    const fl = Object.fromEntries((this._sfx().cfg.plan.floors || []).map((f) => [f.id, f.n]));
    const card = (x) => {
      const st = this._sfSt(x), c = this._tm2SfCol(st), bt = x.bat != null ? Math.max(0, Math.min(100, x.bat)) : null;
      const word = st === "alarm" ? "ALARM" : st === "pause" ? "ausgeschaltet" : st === "off" ? "nicht erreichbar" : st === "warn" ? "Batterie schwach" : "In Ordnung";
      return `<button class="tm2sfm ${st}" style="--c:${c}" data-act="tm2sfdet" data-k="${esc(x.id)}" aria-label="${esc(x.name)}: ${word}"><span class="tm2sfmh"><span class="i">${this._sfHd(x.k, st, 40)}</span><span class="n"><b>${esc(x.name)}</b><small>${esc([fl[x.floor], x.room || x.area].filter(Boolean).join(" · ") || x.kind)}</small></span></span>
        <span class="tm2sfms"><i></i>${word}</span><span class="tm2sfmb">${bt != null ? `<i><i style="width:${bt}%;background:${bt < T.C.bat.pct ? "#f59e0b" : "#34d399"}"></i></i><em>${num(bt, 0)} %</em>` : `<em class="mut">Batterie unbekannt</em>`}</span></button>`;
    };
    return `<div class="tm2swb" data-sw="sfmel"><div class="tm2sfg" style="--c:${cap.c};--r:${cap.r}">${L.slice(p.from, p.to).map(card).join("")}</div>${this._tm2Pager("sfmel", p, "Melder")}</div>`;
  }
  _tm2SfPlan(T) {
    const P = this._sfPl(), fl = this._sfFl(), dm = this._sfDetMap(), on = P.items.filter((i) => i.fl === fl && i.t === "m" && i.e && dm[i.e]).map((i) => dm[i.e]);
    const land = this._tm2Land(), per = land ? (window.innerHeight < 760 ? 5 : 7) : 4, p = this._tm2Page("sfpl" + fl, on.length, per);
    const row = (x) => { const st = this._sfSt(x), c = this._tm2SfCol(st); return `<button class="tm2sfdr" style="--c:${c}" data-act="tm2sfdet" data-k="${esc(x.id)}">${this._sfHd(x.k, st, 30)}<span>${esc(x.name)}</span><b>${st === "ok" ? (x.bat != null ? `${num(x.bat, 0)} %` : "ok") : st === "warn" ? `${num(x.bat, 0)} %` : st === "alarm" ? "ALARM" : st === "off" ? "offline" : "aus"}</b></button>`; };
    const floors = P.floors.length > 1 ? `<div class="tm2seg">${P.floors.map((f) => `<button class="${f.id === fl ? "sel" : ""}" data-act="sfxfl" data-k="${f.id}" aria-pressed="${f.id === fl}">${esc(f.n)}</button>`).join("")}</div>` : "";
    const leg = `<span class="sfleg"><span><i style="background:#34d399"></i>in Ordnung</span><span><i style="background:#f59e0b"></i>Hinweis</span><span><i style="background:#ef4444"></i>Alarm</span><span><i style="background:#94a3b8"></i>aus</span></span>`;
    return `<div class="tm2sfp"><div class="card tm2cc tm2sfpc"><div class="tm2sh">${floors || `<span>${ic("home", 18)}Grundriss</span>`}${leg}</div><div class="tm2sfpv"><svg class="sfpv gd" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Grundriss">${this._grUnder ? this._grUnder(P, fl, { labels: true }) : ""}${this._sfPlanInner(fl, false)}</svg></div></div>
      <div class="card tm2cc tm2sfpl" data-sw="${"sfpl" + fl}"><div class="tm2sh"><span>${ic("bell", 18)}Melder ${esc((P.floors.find((f) => f.id === fl) || {}).n || "")}</span><em>${on.length}</em></div>${on.length ? `<div class="tm2sfdl">${on.slice(p.from, p.to).map(row).join("")}</div>${this._tm2Pager("sfpl" + fl, p, "")}` : `<small class="tm2note">Auf dieser Etage sind noch keine Melder eingezeichnet.</small>`}</div></div>`;
  }

  /* ---------- Modul 17 · Müllabfuhr (Addon) ---------- */
  _tm2MuReady() { if (!this._muOn()) return false; const S = this._mu(); return !!(this._muD && S.on && S.cal && (S.bins || []).length); }
  _tm2MuCss() { try { const d = this._adDef("muell"); return d && d.css ? `<style>${d.css}</style>` : ""; } catch (_) { return ""; } }
  /* Was gerade zu tun ist – wie das Banner der Modulseite */
  _tm2MuSit(S) {
    const rows = S.bins || [], C = S.cfg, has = (x, l) => l.includes(x.state);
    const today = rows.filter((x) => x.state === "today" || (x.state === "done" && x.days === 0)), tom = rows.filter((x) => x.state === "out" || (x.state === "done" && x.days === 1));
    const open = rows.filter((x) => has(x, ["out", "today"])), back = rows.filter((x) => x.state === "back"), soon = rows.filter((x) => x.state === "soon"), done = rows.filter((x) => x.state === "done");
    const up = rows.filter((x) => x.next && !has(x, ["out", "today", "done", "soon", "skip"]));
    const nD = (L) => L.filter((x) => x.state === "done").length;
    if (today.length && nD(today) < today.length) return { k: "today", show: today, t: "Heute wird abgeholt", s: `${this._muNames(today)} · bis ${this._muHM(Math.min(...today.map((x) => (S.until || {})[x.k] || 720)))} Uhr rausstellen`, btn: "out" };
    if (tom.length && nD(tom) < tom.length) return { k: "due", show: tom, t: "Morgen früh wird abgeholt", s: `${this._muNames(tom)} · jetzt rausstellen`, btn: "out" };
    if (back.length) return { k: "back", show: back, t: "Tonnen reinholen", s: `${this._muNames(back)} · abgeholt ${this._muDate(back[0].back_d)}`, btn: "back" };
    if (done.length) return { k: "done", show: done, t: done.length > 1 ? "Alles steht draußen" : `${done[0].name} steht draußen`, s: today.length ? "Abholung heute" : "Abholung morgen früh" };
    if (soon.length) return { k: "soon", show: soon, t: `Morgen: ${this._muNames(soon)}`, s: `Ab ${C.time} Uhr rausstellen` };
    if (up.length) { const same = up.filter((x) => x.next === up[0].next); return { k: "ok", show: same, t: "Nichts zu tun", s: `Als Nächstes: ${this._muNames(same)}, ${this._muWhen(up[0].days)} (${this._muDate(up[0].next)})` }; }
    return { k: "ok", show: [], t: "Keine Termine", s: "In den nächsten Wochen steht nichts im Kalender." };
  }
  _tm2MuStatus() {
    if (!this._muOn()) return "Addon aus";
    if (!this._tm2MuReady()) return this._muD ? "Noch nicht eingerichtet" : "Wird geladen";
    const X = this._tm2MuSit(this._mu()); return esc(X.k === "ok" ? X.s.replace(/^Als Nächstes: /, "Nächste Abholung: ") : `${X.t}${X.show.length ? `: ${this._muNames(X.show)}` : ""}`);
  }
  _tm2Mu() {
    if (!this._muOn()) return this._tm2None("trash", "Das Müll-Addon ist aus.");
    if (!this._muD) this._muWant = true;
    this._muLoad();
    const S = this._mu();
    if (!this._muD) return this._tm2None("trash", "Termine werden geladen …");
    if (!this._tm2MuReady()) return `<div class="card empty tm2none">${ic("trash", 44)}<div>${S.error ? esc(S.error) : "Noch kein Abfallkalender."}</div><small>Die Abholtermine kommen aus einem Kalender in Home Assistant.</small>${this._tm2Set("muxopen", "Einstellungen")}</div>`;
    const t = this._tm2Tab("mu");
    return this._tm2MuCss() + (t === "cal" ? this._tm2MuCal(S) : t === "home" ? this._tm2MuHome(S) : this._tm2MuNow(S));
  }
  _tm2MuNow(S) {
    const X = this._tm2MuSit(S), land = this._tm2Land(), rows = S.bins || [];
    const turn = (() => { const nx = rows.find((x) => ["out", "today", "soon"].includes(x.state)), w = nx && (S.turn || []).find((q) => q.d === nx.next); return w ? `<span class="tm2chip">${ic("users", 16)}${esc(w.name)} ist dran</span>` : ""; })();
    const open = rows.filter((x) => ["out", "today"].includes(x.state)), back = rows.filter((x) => x.state === "back");
    const btn = X.btn === "out" ? `<button class="btn2 pri tm2mub" data-act="muxdoneall">${ic("check", 22)}${open.length > 1 ? "Alle stehen draußen" : "Steht draußen"}</button>` : X.btn === "back" ? `<button class="btn2 pri tm2mub" data-act="muxinall">${ic("check", 22)}${back.length > 1 ? "Alle wieder drin" : "Wieder drin"}</button>` : "";
    const skip = S.api_v >= 2 && open.length === 1 ? `<button class="btn2" data-act="muxskip" data-k="${esc(open[0].k)}">Diesmal nicht</button>` : "";
    const pics = X.show.slice(0, 3).map((x) => this._muImg(x.img, x.color, land ? 96 : 80)).join("") || this._gx("bin", land ? 96 : 80, {});
    const top = `<div class="card tm2mut ${X.k}"><span class="tm2mupic">${pics}</span><div class="tm2mutx"><span class="tm2wxk">${ic(X.k === "ok" ? "check" : "bin", 15)}${X.k === "ok" ? "Müllabfuhr" : X.k === "back" ? "Reinholen" : "Heute zu tun"}</span><b>${esc(X.t)}</b><small>${esc(X.s)}</small>${turn || S.snooze ? `<div class="tm2wxln">${turn}${S.snooze ? `<span class="tm2chip">${ic("clock", 16)}Erinnerung um ${esc(S.snooze_until)}</span>` : ""}</div>` : ""}</div>${btn || skip ? `<div class="tm2mubs">${btn}${skip}</div>` : ""}</div>`;
    /* Alle Tonnen: quer eine Reihe, hochkant 2 × 3 */
    const per = land ? (window.innerWidth < 1150 ? 4 : 5) : 6, p = this._tm2Page("mubins", rows.length, per);
    const word = (x) => (x.state === "skip" ? "diesmal nicht" : x.state === "back" ? "reinholen" : x.state === "out" ? "raus!" : x.state === "today" ? "heute raus" : x.state === "soon" ? "morgen" : x.state === "done" ? "steht draußen" : x.state === "none" ? "kein Termin" : x.days <= 3 ? "bald" : "ok");
    const tile = (x) => {
      const tap = ["out", "today", "soon"].includes(x.state) ? "muxdone" : x.state === "done" ? "muxundo" : x.state === "back" ? "muxin" : x.state === "skip" ? "muxunskip" : "";
      const tag = tap ? `button data-act="${tap}" data-k="${esc(x.k)}"` : "div";
      return `<${tag} class="tm2mub1 s-${x.state}" style="--c:${x.color}">${this._muImg(x.img, x.color, land ? 72 : 64)}<b>${esc(x.name)}</b><em>${word(x)}</em><small>${x.next ? `${this._muDate(x.next)} · ${this._muWhen(x.days)}` : "kein Termin"}</small></${tag.split(" ")[0]}>`;
    };
    const cols = land ? Math.max(3, Math.min(per, rows.length)) : 2;
    return `<div class="tm2muo">${top}<div class="card tm2cc tm2mubc" data-sw="mubins"><div class="tm2sh"><span>${ic("trash", 18)}Alle Tonnen</span>${this._tm2Set("muxopen", "Einstellungen")}</div><div class="tm2mubg" style="--c:${cols};--r:${land ? 1 : 3}">${rows.slice(p.from, p.to).map(tile).join("")}</div>${this._tm2Pager("mubins", p, "Tonnen")}</div></div>`;
  }
  _tm2MuCal(S) {
    const C = S.cfg, land = this._tm2Land(), rows = S.bins || [];
    const cal = this._muCal2 ? this._muCal2(S) : "";
    let side;
    if (C.turn && C.turn.on && (C.turn.people || []).length) {
      const P = C.turn.people, K = Object.fromEntries(C.kinds.map((k) => [k.id, k])), T = (S.turn || []).slice(0, land ? 5 : 3);
      side = `<div class="card tm2cc tm2mus"><div class="tm2sh"><span>${ic("users", 18)}Wer ist dran?</span><em>${C.turn.mode === "week" ? "wöchentlich" : "je Abholung"}</em></div><div class="tm2mul">${T.map((t) => { const i = P.findIndex((p) => p.pid === t.pid); return `<div class="tm2mur"><span class="muav" style="--h:${(i * 67) % 360}">${esc(String(t.name || "?").trim().slice(0, 1).toUpperCase())}</span><span class="t"><b>${esc(t.name)}${t.ovr ? " <small>(getauscht)</small>" : ""}</b><small>${this._muDate(t.d)} · ${t.kinds.map((k) => (K[k] ? esc(K[k].name) : k)).join(", ")}</small></span><span class="k">${t.kinds.map((k) => (K[k] ? this._muImg(K[k].img, K[k].color, 26) : "")).join("")}</span></div>`; }).join("") || `<small class="tm2note">Keine Abholungen in nächster Zeit.</small>`}</div>${this._tm2Set("muxopen", "Tauschen")}</div>`;
    } else {
      const up = rows.filter((x) => x.next).slice(0, land ? 6 : 4);
      side = `<div class="card tm2cc tm2mus"><div class="tm2sh"><span>${ic("clock", 18)}Nächste Abholungen</span></div><div class="tm2mul">${up.map((x) => `<div class="tm2mur">${this._muImg(x.img, x.color, 30)}<span class="t"><b>${esc(x.name)}</b><small>${this._muDate(x.next)}</small></span><em>${this._muWhen(x.days)}</em></div>`).join("")}</div></div>`;
    }
    return `<div class="tm2muc"><div class="tm2mucal">${cal}</div>${side}</div>`;
  }
  _tm2MuHome(S) {
    const C = S.cfg, land = this._tm2Land(), K = Object.fromEntries(C.kinds.map((k) => [k.id, k])), Y = S.year, st = S.stats;
    const tiles = [
      Y && Y.tot && Y.tot.rate != null ? this._tm2Tile4("Rausgestellt", `${Y.tot.rate} %`, "", "der Abholungen markiert", "#2dd4bf") : this._tm2Tile4("Abholungen", Y && Y.tot ? String(Y.tot.plan) : "–", "", `im Jahr ${Y ? Y.year : ""}`, "#2dd4bf"),
      C.cost && C.cost.on && st ? this._tm2Tile4("Restmüll", `${st.done}/${st.total}`, "", "Leerungen bisher", "#78716c") : this._tm2Tile4("Abfallarten", String(C.kinds.filter((k) => k.on).length), "", "im Kalender", "#78716c"),
      C.cost && C.cost.on && st && st.cost != null ? this._tm2Tile4("Kosten", num(st.cost, 2), "€", `${st.extra || 0} Leerungen extra`, "#f59e0b") : "",
      C.bags && C.bags.on ? this._tm2Tile4(K[C.bags.kind] && K[C.bags.kind].name === "Gelber Sack" ? "Gelbe Säcke" : "Säcke", S.bags == null ? "–" : String(S.bags), "übrig", S.bags != null && S.bags <= C.bags.warn ? "Zeit für eine neue Rolle" : "Vorrat", S.bags != null && S.bags <= C.bags.warn ? "#f59e0b" : "#eab308") : ""].filter(Boolean);
    const H = S.hist || [], per = land ? (window.innerHeight < 760 ? 4 : 6) : 4, ph = this._tm2Page("muhist", H.length, per);
    const how = { tipp: "per Tipp", tag: "per Tag", meldung: "aus der Meldung", auto: "erkannt" };
    const hrow = (h) => { const k = K[h.k] || { name: h.k, img: "tonne", color: "#888" }, t = h.ts ? new Date(h.ts * 1000).toLocaleString("de-DE", { weekday: "short", hour: "2-digit", minute: "2-digit" }) : "";
      const [cls, w, s] = h.st === "out" ? ["ok", "draußen", `${t}${h.how ? " · " + (how[h.how] || h.how) : ""}${h.who ? " · " + h.who : ""}`] : h.st === "skip" ? ["sk", "ausgelassen", h.who || ""] : ["no", "nicht markiert", ""];
      return `<div class="tm2mur">${this._muImg(k.img, k.color, 28)}<span class="t"><b>${esc(k.name)}</b><small>${this._muDate(h.d)}</small></span><span class="h ${cls}"><b>${w}</b><small>${esc(s)}</small></span></div>`; };
    const hist = S.api_v >= 2 ? `<div class="card tm2cc tm2muh" data-sw="muhist"><div class="tm2sh"><span>${ic("clock", 18)}Verlauf</span></div>${H.length ? `<div class="tm2mul" style="--n:${per}">${H.slice(ph.from, ph.to).map(hrow).join("")}</div>${this._tm2Pager("muhist", ph, "")}` : `<small class="tm2note">Ab jetzt wird jede Abholung festgehalten: draußen, ausgelassen, wann und wer.</small>`}</div>` : "";
    const YR = Y && (Y.rows || []).filter((r) => r.plan > 0), py = this._tm2Page("muyear", YR ? YR.length : 0, per);
    const yrow = (r) => { const k = K[r.k] || { img: "tonne", color: "#888" }, t = Math.max(1, r.plan), w = (n) => `${(n / t) * 100}%`, un = Math.max(0, r.past - r.tracked);
      return `<div class="tm2mur">${this._muImg(k.img, k.color, 28)}<span class="t"><b>${esc(r.name)}</b><small>${r.past} von ${r.plan} vorbei${r.skip ? ` · ${r.skip}× ausgelassen` : ""}</small></span><span class="muyb tm2muyb"><i class="o" style="width:${w(r.out)}"></i><i class="s" style="width:${w(r.skip)}"></i><i class="n" style="width:${w(r.none)}"></i><i class="u" style="width:${w(un)}"></i></span><em>${r.out}</em></div>`; };
    const year = YR && YR.length ? `<div class="card tm2cc tm2muy" data-sw="muyear"><div class="tm2sh"><span>${ic("chart", 18)}Jahr ${Y.year}</span><span class="muleg"><span><u style="background:var(--teal)"></u>draußen</span><span><u style="background:var(--gray)"></u>ausgelassen</span><span><u style="background:var(--amber)"></u>ohne Angabe</span></span></div><div class="tm2mul" style="--n:${per}">${YR.slice(py.from, py.to).map(yrow).join("")}</div>${this._tm2Pager("muyear", py, "")}</div>` : "";
    if (!hist && !year) return `${tiles.length ? `<div class="tm2sums">${tiles.join("")}</div>` : ""}${this._tm2None("chart", "Noch kein Verlauf.", "Sobald die erste Abholung vorbei ist, stehen hier Verlauf und Jahresübersicht.")}`;
    return `${tiles.length ? `<div class="tm2sums${tiles.length === 3 ? " three" : tiles.length === 2 ? " two" : ""}">${tiles.join("")}</div>` : ""}<div class="tm2muhm${hist && year ? "" : " one"}">${hist}${year}</div>`;
  }
