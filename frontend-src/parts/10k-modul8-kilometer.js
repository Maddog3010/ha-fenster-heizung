  /* ================= Modul 8 · v0.9 Build 4: Kilometer & Verbrauch in der Statistik =================
     Gefahrene km mit Vergleich, Verbrauch kWh/100 km, Sonnen-Kilometer, km je Tag/Monat, Verbrauch nach Außentemperatur
     (letzte 12 Monate), Jahreskilometer mit Hochrechnung und optionaler Grenze (Leasing), Kilometerstand von Hand. */
  _evKmCards(D, S, R, T, Pv, run) {
    const days = D.days || [], cv = this._wb().vehicles || [], v0 = this._evVeh(), ev = this._evData(), adm = this._admin();
    const key = (t) => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
    const noSensor = cv.filter((x) => !(x.ent || {}).odo), anyKm = days.some((r) => r.km > 0);
    const odoNow = v0 ? ((v0.ent || {}).odo ? ev.odo : (D.odos || {})[v0.id]) : ev.odo;
    const manual = adm && noSensor.length ? `<div class="evkmm">${ic("pencil", 16)}<div><b>Ohne Kilometer-Sensor?</b><small>Kilometerstand ab und zu eintragen – die Strecke seit dem letzten Eintrag wird auf die Tage dazwischen verteilt.</small>
        ${noSensor.map((x) => { const o = (D.odoset || {})[x.id]; return `<div class="evkmr"><span>${esc(x.name)}<small>${o ? `zuletzt ${num(o.km, 0)} km am ${new Date(o.d + "T12:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}` : "noch kein Eintrag – der erste Stand ist der Startwert"}</small></span><input class="otxt" type="text" inputmode="numeric" data-km="${esc(x.id)}" placeholder="${o ? num(o.km, 0) : "z. B. 24.318"}" aria-label="Kilometerstand ${esc(x.name)}"><button class="btn2 pri" data-act="wbkmok" data-v="${esc(x.id)}">Eintragen</button></div>`; }).join("")}</div></div>` : "";
    if (!anyKm) return `<div class="card evkm"><h2>${this._gx("car", 24)}Kilometer &amp; Verbrauch</h2><div class="mut sm">Noch keine Kilometer. Wähle beim Fahrzeug einen Kilometerstand-Sensor${adm && noSensor.length ? " oder trage den Stand unten von Hand ein" : ""} – ab dann zählt Modul 8 die gefahrenen Kilometer je Tag.</div>${manual}</div>`;
    // Kacheln
    const sh = T.kwh > 0 ? T.pv / T.kwh : 0, k100 = T.km > 0 && T.kwh > 0 ? T.kwh / T.km * 100 : null, k100p = Pv.km > 0 && Pv.kwh > 0 ? Pv.kwh / Pv.km * 100 : null;
    const elapsed = Math.max(1, Math.ceil(((run ? new Date() : R.d1) - R.d0) / 864e5)), per = days.filter((r) => r.d >= key(R.d0) && r.d < key(R.d1));
    const top = per.reduce((m, r) => (r.km > (m ? m.km : 0) ? r : m), null);
    const pc = Pv.km > 0 ? (T.km - Pv.km) / Pv.km * 100 : null, pN = { d: "Vortag", w: "Vorwoche", m: "Vormonat", y: "Vorjahr" }[S.per];
    const k = (img, l, v, u, sub, a) => `<div class="evkmk" style="--a:${a}"><div class="evkh">${img}<span>${l}</span></div><div class="evkv">${v}${u ? `<small>${u}</small>` : ""}</div><div class="evks">${sub}</div></div>`;
    const tiles = `<div class="evkm4">${k(this._gx("car", 30), "Gefahren", num(T.km, 0), "km", pc != null && Math.abs(pc) >= 1 ? `<em class="evd n">${pc > 0 ? "▲" : "▼"} ${num(Math.abs(pc), 0)} %</em> zum ${pN}` : `im ${pN} ${num(Pv.km, 0)} km`, "#60a5fa")}
      ${k(this._gx("bolt", 30), "Verbrauch", k100 != null ? num(k100, 1) : "–", k100 != null ? "kWh/100 km" : "", k100 != null ? `geladen, mit Ladeverlusten${k100p != null ? ` · ${pN} ${num(k100p, 1)}` : ""}` : "in diesem Zeitraum nicht geladen", "#2dd4bf")}
      ${k(this._gx("sun", 30, { on: 1 }), "Sonnen-Kilometer", num(T.km * sh, 0), "km", T.kwh > 0 ? `${num(sh * 100, 0)} % der Strecke mit eigener Sonne` : "kein Laden in diesem Zeitraum", "#facc15")}
      ${k(this._gx("schedule", 30), S.per === "d" ? "Am Tag" : "Ø pro Tag", num(S.per === "d" ? T.km : T.km / elapsed, 0), "km", top && S.per !== "d" ? `am meisten ${num(top.km, 0)} km am ${new Date(top.d + "T12:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}` : "", "#a78bfa")}</div>`;
    // Balken: km je Tag (Woche/Monat) oder je Monat (Jahr); Farbe nach Sonnenanteil der Ladungen in diesem Abschnitt
    const MON = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"], sl = [];
    if (S.per === "y") for (let m = 0; m < 12; m++) { const a = new Date(R.d0.getFullYear(), m, 1), x = this._evAgg(days, a, new Date(R.d0.getFullYear(), m + 1, 1)); sl.push({ l: MON[m], x, go: a, p: "m" }); }
    else if (S.per !== "d") for (let t = new Date(R.d0); t < R.d1; t = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1)) sl.push({ l: S.per === "w" ? ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][t.getDay()] : String(t.getDate()), x: this._evAgg(days, t, new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1)), go: new Date(t), p: "d" });
    const mx = Math.max(1, ...sl.map((s) => s.x.km)), lab = (i) => sl.length <= 16 || i % 5 === 0 || i === sl.length - 1;
    const chart = sl.length ? `<div class="mut sm" style="margin:14px 0 0">${S.per === "y" ? "Kilometer je Monat" : "Kilometer je Tag"} – Farbe: woher der Strom kam, der in diesem Abschnitt geladen wurde</div>
      <div class="evkmc">${sl.map((s, i) => { const kw = s.x.kwh, g = kw > 0 ? (1 - s.x.pv / kw) * 100 : 0, cls = s.x.km <= 0 ? "z" : kw > 0 ? "" : "nl";
        return `<button class="${cls}" data-act="wbvgo" data-k="${s.go.getTime()}" data-p="${s.p}" style="--h:${s.x.km > 0 ? Math.max(4, s.x.km / mx * 100) : 3}%;--g:${g}%" title="${esc(s.l)}: ${num(s.x.km, 0)} km${kw > 0 ? ` · ${num(kw, 1)} kWh geladen · ${num(s.x.pv / kw * 100, 0)} % Sonne` : ""}" aria-label="${esc(s.l)}: ${num(s.x.km, 0)} km"><i></i><span>${lab(i) ? esc(s.l) : ""}</span></button>`; }).join("")}</div>
      <div class="gsleg" style="margin-top:6px"><span><i style="background:var(--teal)"></i>mit Sonne</span><span><i style="background:var(--amber)"></i>mit Netzstrom</span><span><i style="background:#60a5fa"></i>an dem Tag nicht geladen</span></div>` : "";
    const head = `<div class="card evkm"><h2>${this._gx("car", 24)}Kilometer &amp; Verbrauch<span class="evmr">${odoNow != null ? `Kilometerstand ${num(odoNow, 0)} km${v0 ? " · " + esc(v0.name) : ""}` : ""}</span></h2>${tiles}${chart}${manual}</div>`;
    return `${head}<div class="evkm2">${this._evKmTemp(days)}${this._evKmYear(days, v0, cv)}</div>`;
  }
  /* Verbrauch nach Außentemperatur: letzte 12 Monate, Tage mit Kilometern und Temperatur, je Bereich geladene kWh ÷ gefahrene km */
  _evKmTemp(days) {
    const lim = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10), B = [["unter 0 °C", -99, 0, "#60a5fa"], ["0–10 °C", 0, 10, "#7dd3fc"], ["10–20 °C", 10, 20, "#2dd4bf"], ["über 20 °C", 20, 99, "#facc15"]];
    const sum = B.map(() => ({ km: 0, kwh: 0 })), use = days.filter((r) => r.d >= lim && r.t != null && r.km > 0);
    use.forEach((r) => { const i = B.findIndex((b) => r.t >= b[1] && r.t < b[2]); if (i >= 0) { sum[i].km += r.km; sum[i].kwh += r.pv + r.grid; } });
    const val = sum.map((x) => (x.km >= 50 && x.kwh > 0 ? x.kwh / x.km * 100 : null)), ok = val.filter((x) => x != null);
    const lim90 = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10), r90 = days.filter((r) => r.d >= lim90), km90 = r90.reduce((a, r) => a + (r.km || 0), 0), kwh90 = r90.reduce((a, r) => a + r.pv + r.grid, 0);
    const perKwh = km90 >= 50 && kwh90 > 0 ? km90 / kwh90 : null, cap = (this._evVeh() || {}).cap || this._wb().cap || 0, perPct = perKwh && cap ? perKwh * cap * 0.9 / 100 : null;
    const cold = [val[0], val[1]].filter((x) => x != null), warm = [val[2], val[3]].filter((x) => x != null), more = cold.length && warm.length ? (Math.max(...cold) / Math.min(...warm) - 1) * 100 : null;
    const hi = Math.max(1, ...ok), lo = ok.length ? Math.min(...ok) * 0.7 : 0;
    return `<div class="card evkmt"><h2>${this._gx("thermo", 24)}Verbrauch nach Außentemperatur<span class="evmr">letzte 12 Monate</span></h2>
      ${ok.length ? `<div class="evkmtb">${B.map((b, i) => `<div><span style="--c:${b[3]};height:${val[i] != null ? 25 + (val[i] - lo) / Math.max(0.1, hi - lo) * 75 : 6}%" class="${val[i] == null ? "nd" : ""}"></span><b>${val[i] != null ? num(val[i], 1) : "–"}</b><small>${b[0]}</small></div>`).join("")}</div>
        <div class="mut sm" style="text-align:center;margin-top:2px">kWh/100 km · Bereiche mit weniger als 50 km zeigen „–“</div>` : `<div class="mut sm">Noch zu wenig Daten. Gezählt werden Tage mit Kilometern und Außentemperatur (aus den Haus-Werten oder dem Wetter).</div>`}
      ${perKwh ? `<div class="evkmf"><div><b>1 kWh ≈ ${num(perKwh, 1)} km</b><small>so weit kommst du mit einer Kilowattstunde (90 Tage)</small></div>${perPct ? `<div><b>1 % Akku ≈ ${num(perPct, 1)} km</b><small>bei ${num(cap, 0)} kWh Akku</small></div>` : ""}</div>` : ""}
      ${more != null && more > 3 ? `<div class="evkmh">${this._gx("frost", 22)}<span>Bei Kälte brauchst du rund <b>${num(more, 0)} % mehr</b> als bei Wärme.</span></div>` : ""}</div>`;
  }
  /* Jahreskilometer: seit Beginn des (Leasing-)Jahres, Hochrechnung, Vorjahr und optionale Grenze */
  _evKmYear(days, v0, cv) {
    const veh = (cv.find((x) => x.kmYear > 0) || v0 || null), from = veh ? (veh.kmFrom || 1) : 1, lim = veh ? veh.kmYear || 0 : 0, today = new Date();
    let y0 = new Date(today.getFullYear(), from - 1, 1); if (y0 > today) y0 = new Date(today.getFullYear() - 1, from - 1, 1);
    const y1 = new Date(y0.getFullYear() + 1, y0.getMonth(), 1), p0 = new Date(y0.getFullYear() - 1, y0.getMonth(), 1);
    const key = (t) => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
    const kmOf = (r) => (veh && cv.length > 1 ? ((r.veh || {})[veh.name] || {}).km || 0 : r.km || 0);
    const cur = days.filter((r) => r.d >= key(y0) && r.d < key(y1)), prev = days.filter((r) => r.d >= key(p0) && r.d < key(y0));
    const km = cur.reduce((a, r) => a + kmOf(r), 0), kmP = prev.reduce((a, r) => a + kmOf(r), 0), first = cur.find((r) => kmOf(r) > 0);
    const startT = first ? new Date(Math.max(y0.getTime(), new Date(first.d + "T00:00:00").getTime())) : y0, el = Math.max(1, (today - startT) / 864e5), len = (y1 - y0) / 864e5;
    const proj = el >= 14 ? km / el * len : null, late = first && new Date(first.d + "T00:00:00") - y0 > 7 * 864e5;
    const fd = (t) => t.toLocaleDateString("de-DE", { day: "numeric", month: "numeric", year: "numeric" }), sc = Math.max(lim || 0, proj || 0, km) * 1.05 || 1;
    const st = lim && proj != null ? (proj <= lim ? ["ok", "auf Kurs"] : proj <= lim * 1.05 ? ["warn", "knapp"] : ["bad", "zu viel"]) : null;
    const left = lim ? lim - km : null, wk = Math.max(1, (y1 - today) / (7 * 864e5));
    return `<div class="card evkmy"><h2>${this._gx("schedule", 24)}Jahreskilometer<span class="evmr">${lim ? `Grenze ${num(lim, 0)} km/Jahr` : "ohne Grenze"}${veh && cv.length > 1 ? " · " + esc(veh.name) : ""}</span></h2>
      <div class="evkmyb"><i class="f" style="width:${km / sc * 100}%"></i>${proj != null && proj > km ? `<i class="p" style="left:${km / sc * 100}%;width:${(Math.min(proj, sc) - km) / sc * 100}%"></i>` : ""}${lim ? `<span class="m" style="left:${lim / sc * 100}%"></span>` : ""}</div>
      <div class="evbl"><span><b>${num(km, 0)} km</b> seit ${from === 1 ? "1. Januar" : fd(y0)}</span><span>${proj != null ? `Hochrechnung <b>${num(proj, 0)} km</b>` : "Hochrechnung ab 14 Tagen"}</span></div>
      ${st ? `<div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center"><span class="evkmst ${st[0]}">${st[0] === "ok" ? "✓" : "!"} ${st[1]}</span><span class="mut sm">${left > 0 ? `noch ${num(left, 0)} km bis zur Grenze · ca. ${num(left / wk, 0)} km/Woche übrig` : `Grenze um ${num(-left, 0)} km überschritten`}</span></div>` : ""}
      <div class="mut sm" style="margin-top:8px">${kmP > 0 ? `Vorjahr: ${num(kmP, 0)} km. ` : ""}${late ? `Gezählt seit ${fd(new Date(first.d + "T12:00:00"))}, die Hochrechnung nutzt diesen Zeitraum. ` : ""}${lim ? "" : "Eine Grenze (z. B. Leasing) stellst du beim Fahrzeug unter „Aussehen &amp; Sensoren“ ein."}</div></div>`;
  }
  _evKmOdo(b) {
    const vid = b.dataset.v, inp = this.shadowRoot.querySelector(`[data-km="${CSS.escape(vid)}"]`), v = parseFloat(String((inp && inp.value) || "").replace(/\./g, "").replace(",", "."));
    if (!isFinite(v) || v < 0) { this._toast("Bitte den Kilometerstand eingeben"); return; }
    this._hass.callWS({ type: "fenster_heizung/wb_odo", vid, km: v }).then((r) => {
      if (!r || !r.ok) { this._toast((r && r.err) || "Kilometerstand konnte nicht gespeichert werden"); return; }
      if (r.snap) this._wbD = { snap: r.snap, ts: Date.now() };
      this._toast(r.base ? "Startwert gespeichert – ab dem nächsten Eintrag wird gezählt" : `${num(r.km, 0)} km auf ${r.days} ${r.days === 1 ? "Tag" : "Tage"} verteilt`);
      this._wbStatLoad(true);
    }).catch(() => this._toast("Kilometerstand konnte nicht gespeichert werden"));
  }
