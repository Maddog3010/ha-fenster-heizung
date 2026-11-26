  /* ================= Tablet-Modus · Stufe 4: Modul 14 Stromtarif ohne Scrollen =================
     Reiter Preise (vier Werte, Preisband, Tief/Hoch/Schnitt), Geräte (bestes Fenster) und Tarif-Check.
     „Erinnern“ braucht keine PIN, Quelle, Geräte, Preisalarm und Vergleichspreis schon. */
  _tm2TfReady() { const S = this._tf(); return !!(this._tfD && !S.error && S.src && S.src !== "fix"); }
  _tm2Dt() {
    this._tfLoad();
    const S = this._tf(), adm = this._admin(), set = (k, l) => (adm ? `<button class="btn2" data-act="tm2g" data-g="tfxopen" data-k="${k}">${ic("lock", 16)}${l}</button>` : "");
    if (!this._tfD) return this._tm2None("chart", "Preise werden geladen …");
    if (S.error || !S.src) return `<div class="card empty tm2none">${ic("chart", 44)}<div>Noch keine Strompreise.</div><small>Verbinde Tibber oder wähle einen Preis-Sensor mit Preisliste.</small>${set("q", "Quelle wählen")}</div>`;
    if (S.src === "fix") return `<div class="card empty tm2none">${ic("bolt", 44)}<div>Festpreis: ${this._tfCt(S.now.ct)} ct/kWh</div><small>Mit einem Festpreis gibt es keine günstigen Zeiten.</small>${set("q", "Quelle wählen")}</div>`;
    const t = this._tm2Tab("dt");
    return t === "dev" ? this._tm2DtDevs(S) : t === "check" ? this._tm2DtCheck(S) : this._tm2DtPrices(S);
  }
  _tm2DtDay(S) { return this._tm2TfDay === "tm" && S.tomorrow ? "tm" : "td"; }
  /* Zeit des tiefsten und höchsten Preises eines Tages */
  _tm2DtRange(S, day) {
    const d0 = new Date(); d0.setHours(0, 0, 0, 0); if (day === "tm") d0.setDate(d0.getDate() + 1);
    const d1 = new Date(d0); d1.setDate(d1.getDate() + 1);
    return { from: d0.getTime() / 1000, to: d1.getTime() / 1000 };
  }
  _tm2DtPrices(S) {
    const C = S.cfg, N = S.now, T = S.today || {}, M = S.tomorrow, best = this._tfBest(S), adm = this._admin(), day = this._tm2DtDay(S), D = day === "tm" ? M || {} : T, R = this._tm2DtRange(S, day);
    const up = N.next_h != null && N.ct != null ? N.next_h - N.ct : null;
    const tiles = [
      this._tm2Tile4("Jetzt", this._tfCt(N.ct), "ct", `${this._tfName(N.lv).toLowerCase()}${N.until ? ` bis ${this._tfWhen(N.until)}` : ""}`, this._tfCol(N.lv)),
      this._tm2Tile4("Nächste Stunde", this._tfCt(N.next_h), "ct", up == null ? "–" : Math.abs(up) < 0.3 ? "etwa gleich" : up > 0 ? "wird teurer" : "wird günstiger", this._tfCol(this._tfLv(N.next_h, T.avg, C))),
      this._tm2Tile4("Bestes Fenster", best ? this._tfHm(best.s) : "–", "", best ? `${this._tfIsTomorrow(best.s) ? "morgen" : "heute"} · ${C.win_h} Std. · Ø ${this._tfCt(best.avg)} ct` : "zu wenig Preise", "#22c55e"),
      this._tm2Tile4("Morgen", M ? this._tfCt(M.avg) : "–", M ? "ct" : "", M ? (T.avg != null ? `Ø · ${this._tfCt(Math.abs(M.avg - T.avg))} ct ${M.avg <= T.avg ? "unter" : "über"} heute` : "Ø") : "ab ca. 13 Uhr", "#60a5fa")].join("");
    const ser = (S.series || []).filter((x) => x.ct != null && x.s >= R.from && x.s < R.to);
    const at = (v) => { const x = ser.find((y) => Math.abs(y.ct - v) < 0.005); return x ? `${this._tfHm(x.s)} Uhr` : "&nbsp;"; };
    const lo = ser.length ? Math.min(...ser.map((x) => x.ct)) : null, hi = ser.length ? Math.max(...ser.map((x) => x.ct)) : null;
    const foot = [
      this._tm2Tile4("Tagestief", this._tfCt(lo), "ct", lo == null ? "" : at(lo), "#22c55e"),
      this._tm2Tile4("Tageshoch", this._tfCt(hi), "ct", hi == null ? "" : at(hi), "#ef4444"),
      this._tm2Tile4(day === "tm" ? "Ø morgen" : "Ø heute", this._tfCt(D.avg), "ct", D.hours != null ? `${num(D.hours, 0)} Stunden` : "", "#2dd4bf")].join("");
    const leg = [["cheap", "günstig"], ["normal", "normal"], ["dear", "teuer"], ...(S.neg ? [["neg", "negativ"]] : [])].map(([k, l]) => `<i style="background:${this._tfCol(k)}"></i>${l}`).join(" ");
    const seg = M ? `<div class="tm2seg tm2dseg">${[["td", "Heute"], ["tm", "Morgen"]].map(([k, l]) => `<button class="${day === k ? "sel" : ""}" data-act="tm2tfday" data-k="${k}" aria-pressed="${day === k}">${l}</button>`).join("")}</div>` : "";
    return `<div class="tm2sums">${tiles}</div>
      <div class="card tm2cc tm2dtb"><div class="tm2sh"><span>${ic("chart", 18)}${seg ? "" : "Heute · "}Cent je kWh</span><span class="tm2shr">${this._frost().price_on && this._htrRooms().some((r) => htrFrost(r.htr)) ? `<span class="tm2legend" title="Preisgrenze der Frost-Heizer">❄ Heizer bis ${num(this._frost().price, 1)} ct</span>` : ""}<span class="tm2legend">${leg}</span>${seg}${adm ? `<button class="tm2mini" data-act="tm2g" data-g="tfxopen" data-k="q" aria-label="Preisquelle einstellen">${ic("lock", 16)}Quelle</button>` : ""}</span></div><div class="tm2ch" data-tm2ch="dt"></div></div>
      <div class="tm2sums three">${foot}</div>`;
  }
  _tm2DtChart(box, w, h) {
    const S = this._tf(), day = this._tm2DtDay(S), R = this._tm2DtRange(S, day);
    const res = !this._tm2Land() || (S.cfg.res || "q") === "h" ? "h" : "q";
    box.innerHTML = this._tfBand(S, { from: R.from, to: R.to, res, best: day === "tm" ? S.best_tomorrow : S.best, h: Math.max(60, h - 22), cls: "tm2band" }) || `<div class="tm2none">${ic("chart", 40)}<div>Für diesen Tag gibt es noch keine Preise.</div></div>`;
  }
  _tm2DtDevs(S) {
    const adm = this._admin(), on = (S.devs || []).filter((x) => x.on), gs = this._mdState().on.gs;
    const land = this._tm2Land(), per = land ? (window.innerHeight < 760 ? 5 : 6) : 5, p = this._tm2Page("dtdev", on.length, per);
    const rows = on.slice(p.from, p.to).map((d) => {
      const T = GS_TYP[d.typ] || {}, w = d.w, lv = w ? this._tfLv(w.avg, (S.today || {}).avg, S.cfg) || "cheap" : "";
      const sub = w ? `${this._tfDur(d.dur)}${w.sun >= 10 ? ` · ${w.sun} % Sonne` : ""}${d.by != null ? ` · fertig bis ${d.by} Uhr` : ""}` : d.running ? "läuft gerade" : d.n < 2 ? `lernt die Laufzeit (${d.n} von 2 Läufen)` : "kein passendes Fenster";
      const when = w ? (w.now ? "jetzt" : `${this._tfIsTomorrow(w.s) ? "morgen " : ""}${this._tfHm(w.s)}`) : "–";
      const det = w ? `Ø ${this._tfCt(w.avg)} ct${w.save >= 0.01 ? ` · −${num(w.save, 2)} €` : ""}` : "&nbsp;";
      const btn = !w || !adm ? `<span class="tm2dtn"></span>` : w.now ? `<span class="tm2dtn go">${ic("check", 18)}Jetzt starten</span>` : `<button class="tm2dtn btn${d.rem ? " on" : ""}" data-act="tfxrem" data-k="${esc(d.id)}" aria-pressed="${!!d.rem}">${ic(d.rem ? "check" : "bell", 18)}${d.rem ? `Erinnert ${this._tfHm(d.rem)}` : "Erinnern"}</button>`;
      return `<div class="tm2dtd" style="--lc:${w ? this._tfCol(lv) : "var(--line)"}"><span class="i">${ic(T.i || "plug", 26)}</span><span class="n"><b>${esc(d.name)}</b><small>${esc(sub)}</small></span><span class="w"><b>${when}</b><small>${det}</small></span>${btn}</div>`;
    }).join("");
    const T = S.today || {}, slots = (S.slots || []).slice(0, land && window.innerHeight >= 760 ? 6 : 4);
    const list = slots.map((x, i) => `<div class="tm2dts"><i>${i + 1}</i><b>${this._tfIsTomorrow(x.s) ? "morgen " : ""}${this._tfHm(x.s)}–${this._tfHm(x.e)}</b><span style="color:${this._tfCol(this._tfLv(x.avg, T.avg, S.cfg) || "cheap")}">${this._tfCt(x.avg)} ct</span></div>`).join("");
    const empty = !gs ? "Dafür braucht es Modul 4 Gerätestrom mit Geräten, die ihre Leistung messen." : !(S.devs || []).length ? "Lege in Modul 4 Geräte mit Leistungsmessung an. Nach zwei Läufen steht hier die beste Startzeit." : "Für kein Gerät ist ein Fenster eingeschaltet.";
    return `<div class="tm2stat tm2dtg"><div class="card tm2cc" data-sw="dtdev"><div class="tm2sh"><span>${ic("clock", 18)}Bestes Fenster je Gerät</span>${adm ? `<button class="tm2mini" data-act="tm2g" data-g="tfxopen" data-k="w">${ic("lock", 16)}Geräte &amp; Preisalarm</button>` : ""}</div>
        ${rows ? `<div class="tm2dtl">${rows}</div>${this._tm2Pager("dtdev", p, "Geräte")}` : `<div class="tm2none">${ic("laundry", 40)}<div>${empty}</div></div>`}</div>
      <div class="card tm2cc"><div class="tm2sh"><span>${ic("chart", 18)}Günstigste Stunden</span></div>${list ? `<div class="tm2dtsl">${list}</div>` : `<div class="mut tm2nox">Zu wenig Preise.</div>`}</div></div>`;
  }
  _tm2DtCheck(S) {
    const K = this._tfCk, adm = this._admin();
    if (!K || (!K.d && !K.busy) || (K.d && Date.now() - (K.ts || 0) > 600000 && !K.busy)) { if (!K || !K.busy) this._tfCkLoad(K ? K.per : "m", K ? K.ref : ""); }
    const R = (this._tfCk && this._tfCk.d) || null, per = (this._tfCk && this._tfCk.per) || "m";
    const seg = [["m", "Monat"], ["y", "Jahr"]].map(([k, l]) => `<button class="${per === k ? "sel" : ""}" data-act="tfxck" data-k="${k}" aria-pressed="${per === k}">${l}</button>`).join("");
    const bar = `<div class="tm2bar"><div class="tm2seg tm2ckseg">${seg}</div>${R && !R.error ? `<div class="tm2per"><button data-act="tfxckp" data-k="-1" aria-label="Zurück">${ic("back", 20)}</button><b>${esc(R.title)}</b><button class="nx" data-act="tfxckp" data-k="1" aria-label="Weiter">${ic("back", 20)}</button></div>` : ""}</div>`;
    if (!R) return `${bar}${this._tm2None("chart", "Wird gerechnet …")}`;
    if (R.error) return `${bar}${this._tm2None("chart", "Der Tarif-Check ist gerade nicht verfügbar.")}`;
    if (!R.n) {
      const why = !R.eb ? "Dafür braucht es das Haus-Energiebuch mit einem Netz-Sensor." : !R.first ? "Die Preis-Historie füllt sich ab heute jeden Tag." : `Preise sind gespeichert seit ${new Date(R.first).toLocaleDateString("de-DE")}.`;
      return `${bar}${this._tm2None("chart", "Für diesen Zeitraum gibt es noch nichts zu rechnen.", why)}`;
    }
    const sv = R.save;
    const tiles = [
      this._tm2Tile4(`Bezahlt (${esc(S.src_name || "dynamisch")})`, `${num(R.paid, 2)} €`, "", `Ø ${this._tfCt(R.ct)} ct · ${num(R.kwh, 0)} kWh`, "#2dd4bf"),
      this._tm2Tile4("Mit Festpreis", `${num(R.fix, 2)} €`, "", `${this._tfCt(R.cmp_ct)} ct je kWh${R.base ? " · mit Grundgebühr" : ""}`, "#60a5fa"),
      this._tm2Tile4(sv >= 0 ? "Gespart" : "Mehrkosten", `${num(Math.abs(sv), 2)} €`, "", R.fix > 0 ? `${num(Math.abs(sv) / R.fix * 100, 0)} % ${sv >= 0 ? "günstiger" : "teurer"}` : "", sv >= 0 ? "#22c55e" : "#ef4444")].join("");
    const leg = per === "y" ? `<i style="background:${this._tfCol("cheap")}"></i>günstiger als Festpreis <i style="background:${this._tfCol("dear")}"></i>teurer` : `<i style="background:${this._tfCol("cheap")}"></i>günstig <i style="background:${this._tfCol("normal")}"></i>normal <i style="background:${this._tfCol("dear")}"></i>teuer`;
    return `${bar}<div class="tm2sums three">${tiles}</div>
      <div class="card tm2cc tm2ckc"><div class="tm2sh"><span>${ic("chart", 18)}Dein Preis je ${per === "y" ? "Monat" : "Tag"} (ct)</span><span class="tm2shr"><span class="tm2legend">${leg}</span>${adm ? `<button class="tm2mini" data-act="tm2g" data-g="tfxopen" data-k="p">${ic("lock", 16)}Vergleichspreis</button>` : ""}</span></div>
        ${R.est ? `<small class="tm2note">${R.est} ${R.est === 1 ? "Tag" : "Tage"} aus Tageswerten geschätzt (blass)</small>` : ""}<div class="tm2ch" data-tm2ch="dtck"></div></div>`;
  }
  _tm2DtCkChart(box, w, h) {
    const R = this._tfCk && this._tfCk.d; if (!R || !R.n) return;
    const per = this._tfCk.per, MON = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
    const rows = per === "y" ? (R.months || []).map((m) => ({ l: MON[Number(m.m.slice(5, 7)) - 1], ct: m.ct, est: m.est >= m.n, lv: m.save >= 0 ? "cheap" : "dear" }))
      : (R.days || []).map((d) => ({ l: `${Number(d.d.slice(8, 10))}.`, ct: d.ct, est: d.est, lv: d.lv }));
    const n = per === "y" ? 12 : Math.max(28, rows.length), mx = Math.max(R.cmp_ct || 0, ...rows.map((r) => r.ct || 0), 1) * 1.15, step = enStep(mx), top = Math.ceil(mx / step) * step;
    const x0 = 34, x1 = w - 6, y0 = 10, y1 = h - 22, bw = (x1 - x0) / n, bar = Math.max(4, Math.min(44, bw * 0.64)), Y = (v) => y1 - Math.max(0, v) / top * (y1 - y0);
    let g = "";
    for (let v = 0; v <= top + 1e-9; v += step) g += `<line x1="${x0}" x2="${x1}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="tm2gl"/><text x="${x0 - 8}" y="${(Y(v) + 4).toFixed(1)}" class="tm2ax" text-anchor="end">${num(v, 0)}</text>`;
    const every = per === "y" ? 1 : bw < 22 ? 7 : 4;
    const bars = rows.map((r, i) => { const x = x0 + i * bw + (bw - bar) / 2;
      return `<rect x="${x.toFixed(1)}" y="${Y(r.ct || 0).toFixed(1)}" width="${bar.toFixed(1)}" height="${Math.max(2, y1 - Y(r.ct || 0)).toFixed(1)}" rx="4" fill="${this._tfCol(r.lv || "normal")}"${r.est ? ' opacity=".45"' : ""}><title>${r.l} · Ø ${this._tfCt(r.ct)} ct</title></rect>${i % every === 0 ? `<text x="${(x + bar / 2).toFixed(1)}" y="${h - 5}" class="tm2ax" text-anchor="middle">${r.l}</text>` : ""}`; }).join("");
    const fy = R.cmp_ct ? `<line x1="${x0}" x2="${x1}" y1="${Y(R.cmp_ct).toFixed(1)}" y2="${Y(R.cmp_ct).toFixed(1)}" class="tm2dl"/><text x="${x1}" y="${(Y(R.cmp_ct) - 6).toFixed(1)}" class="tm2ax b" text-anchor="end">Festpreis ${this._tfCt(R.cmp_ct)} ct</text>` : "";
    box.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Eigener Strompreis im Vergleich zum Festpreis">${g}${bars}${fy}</svg>`;
  }
  /* ================= Tablet-Modus · Stufe 4: Modul 16 Solar-Prognose ohne Scrollen =================
     Reiter Prognose (große Zahlen, Kurve, beste Zeit), Treffsicherheit (14 Tage und Treffer-Kalender) und Anlagen.
     Quellen und Sensoren öffnen sich erst nach der PIN. */
  _tm2SpReady() { const S = this._sp(); return !!(this._spD && !S.error && S.found); }
  _tm2Sp() {
    this._spLoad();
    const S = this._sp(), adm = this._admin(), set = adm ? `<button class="btn2" data-act="tm2g" data-g="spxopen">${ic("lock", 16)}Quelle wählen</button>` : "";
    if (!this._spD) return this._tm2None("sun", "Prognose wird geladen …");
    if (S.error) return this._tm2None("alert", "Die Prognose konnte nicht geladen werden.");
    if (!S.found) return `<div class="card empty tm2none">${ic("sun", 44)}<div>Noch keine Prognose da.</div><small>Wähle die Quelle, am einfachsten die Integration Forecast.Solar.</small>${set}</div>`;
    const C = this._spCalc(), t = this._tm2Tab("sp");
    return t === "acc" ? this._tm2SpAcc(C) : t === "sites" ? this._tm2SpSites(C) : this._tm2SpNow(C);
  }
  _tm2SpDay(C) { return this._spDay === "tomorrow" || (this._spDay == null && C.night) ? "tomorrow" : "today"; }
  _tm2SpWarn(C) {
    const S = C.S, adm = this._admin(), f1 = (v) => this._spF(v);
    if (S.dup && S.sel_mode !== "manual") return `<div class="tm2warn">${ic("alert", 18)}<span>Prognose vermutlich doppelt gezählt: mehrere Dienste werden addiert.</span>${adm ? `<button class="tm2mini" data-act="tm2g" data-g="spxopen">${ic("lock", 16)}Anlagen wählen</button>` : ""}</div>`;
    const L = S.low; if (!L || C.night) return "";
    return `<div class="tm2warn">${ic("alert", 18)}<span>Anlage liefert deutlich weniger als erwartet: ${L.from}–${L.to} Uhr ${f1(L.a)} statt ${f1(L.f * C.cf)} kWh.</span></div>`;
  }
  _tm2SpBig(l, v, u, s, c) { return `<div class="tm2big4" style="--a:${c}"><span>${l}</span><b>${v}${u ? `<small>${u}</small>` : ""}</b><em>${s || "&nbsp;"}</em></div>`; }
  _tm2SpNow(C) {
    const S = C.S, f1 = (v) => this._spF(v), day = this._tm2SpDay(C), dp = S.today > 0 ? Math.round((S.tomorrow - S.today) / S.today * 100) : null;
    const cmp = dp == null ? "" : dp === 0 ? "wie heute" : `${Math.abs(dp)} % ${dp < 0 ? "weniger" : "mehr"} als heute`;
    const acc = C.acc != null ? `${C.acc}` : "–";
    const nums = C.night
      ? [this._tm2SpBig("Morgen erwartet", f1(C.tmr), "kWh", cmp, "#60a5fa"), this._tm2SpBig(S.got != null ? "Heute erzeugt" : "Heute erwartet", f1(S.got != null ? S.got : C.base), "kWh", C.base > 0 && S.got != null ? `${Math.round(S.got / C.base * 100)} % der Prognose` : "", "#facc15"),
        this._tm2SpBig("Prognose heute früh", f1(C.base), "kWh", C.cf !== 1 ? `korrigiert × ${num(C.cf, 2)}` : "", "#f59e0b"), this._tm2SpBig("Treffsicherheit", acc, C.acc != null ? "%" : "", C.nAcc ? `${C.nAcc} ${C.nAcc === 1 ? "Tag" : "Tage"}` : "braucht Ertragssensor", "#34d399")]
      : [this._tm2SpBig("Heute erwartet", f1(C.base), "kWh", C.cf !== 1 ? `korrigiert × ${num(C.cf, 2)}` : "Prognose von heute früh", "#f59e0b"),
        this._tm2SpBig("Bisher", f1(S.got), S.got != null ? "kWh" : "", C.vor == null ? "kein Ertragssensor" : Math.abs(C.vor) < 0.1 ? "genau im Plan" : C.vor > 0 ? `${f1(C.vor)} kWh vor Plan` : `${f1(-C.vor)} kWh hinter Plan`, "#facc15"),
        this._tm2SpBig("Noch zu erwarten", f1(C.rest), "kWh", `bis etwa ${C.H1} Uhr`, "#fde047"), this._tm2SpBig("Morgen", f1(C.tmr), "kWh", cmp, "#60a5fa")];
    const seg = `<div class="tm2seg tm2dseg">${[["today", "Heute"], ["tomorrow", "Morgen"]].map(([k, l]) => `<button class="${day === k ? "sel" : ""}" data-act="spxday" data-k="${k}" aria-pressed="${day === k}">${l}</button>`).join("")}</div>`;
    const A = day === "today" ? this._spActH() : null, rows = day === "today" ? C.rows : C.tm, fc = Object.fromEntries(rows), h = this._spH;
    const det = h != null && fc[h] != null ? `<em class="on">${h}–${h + 1} Uhr · Prognose ${num(fc[h], 2)} kWh${A && A[h] != null && h <= Math.floor(C.nh) ? ` · Ertrag ${num(A[h], 2)} kWh` : ""}</em>` : "";
    const B = S.best, devs = this._spDevs(), gs = this._m3Has("gs") && this._mdList().some((m) => m.id === "gs");
    const best = B ? `<div class="card tm2spb">${this._gx(devs[0] ? devs[0].g : "sun", 40, { on: true })}<span><b>Beste Zeit ${S.best_day === "today" ? "" : "morgen "}${B.from}–${B.to} Uhr</b><small>rund ${f1(B.kwh * C.cf)} kWh${devs.length ? ` · ${devs.map((d) => esc(d.n)).slice(0, 3).join(", ")}` : ""}</small></span>${gs ? `<button class="tm2mini" data-act="tm2spgs">${ic("clock", 16)}Startfenster</button>` : ""}</div>`
      : `<div class="card tm2spb">${this._gx("sun", 40)}<span><b>Keine beste Zeit</b><small>Dafür reicht die Prognose gerade nicht.</small></span></div>`;
    return `${this._tm2SpWarn(C)}<div class="tm2sums tm2spn">${nums.join("")}</div>
      <div class="card tm2cc tm2spc"><div class="tm2sh"><span>${ic("chart", 18)}kWh je Stunde</span><span class="tm2shr">${det}<span class="tm2legend"><i style="background:#f59e0b"></i>Prognose${day === "today" ? ` <i style="background:#34d399"></i>Ertrag` : ""}${B && S.best_day === day ? ` <i style="background:rgba(52,211,153,.35)"></i>beste Zeit` : ""}</span>${seg}</span></div><div class="tm2ch" data-tm2ch="sp"></div></div>
      <div class="tm2spf">${best}<button class="card tm2spa" data-act="tm2tab" data-v="sp" data-k="acc">${this._gx("forecast", 40)}<span><b>Treffsicherheit ${acc}${C.acc != null ? " %" : ""}</b><small>${C.nAcc ? `letzte ${C.nAcc} ${C.nAcc === 1 ? "Tag" : "Tage"}` : "braucht Ertragssensor und einige Tage"}</small></span>${ic("chev", 20)}</button></div>`;
  }
  _tm2SpChart(box, w, h) {
    if (!this._tm2SpReady()) return;
    const C = this._spCalc(), S = C.S, day = this._tm2SpDay(C), rows = day === "today" ? C.rows : C.tm;
    if (!rows.length) { box.innerHTML = `<div class="tm2none">${ic("sun", 40)}<div>Für diesen Tag gibt es keine Stundenwerte.</div></div>`; return; }
    const P = rows.filter((x) => x[1] > 0.01), h0 = Math.max(0, (P.length ? P[0][0] : 6) - 1), h1 = Math.min(24, (P.length ? P[P.length - 1][0] + 1 : 19) + 1);
    const A = day === "today" ? this._spActH() : null, fc = Object.fromEntries(rows), mx = Math.max(0.5, ...rows.map((x) => x[1]), ...(A ? Object.values(A) : [0])) * 1.12;
    const step = mx > 8 ? enStep(mx) : mx > 3 ? 1 : mx > 1.5 ? 0.5 : 0.25, x0 = 38, x1 = w - 6, y0 = 10, y1 = h - 22, X = (v) => x0 + (v - h0) / (h1 - h0) * (x1 - x0), Y = (v) => y1 - v / mx * (y1 - y0);
    let g = "";
    for (let v = 0; v <= mx; v += step) g += `<line x1="${x0}" x2="${x1}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="tm2gl"/><text x="${x0 - 8}" y="${(Y(v) + 4).toFixed(1)}" class="tm2ax" text-anchor="end">${num(v, step < 1 ? (step < 0.5 ? 2 : 1) : 0)}</text>`;
    const every = (x1 - x0) / (h1 - h0) < 34 ? 3 : 2;
    for (let t = h0; t <= h1; t++) if ((t - h0) % every === 0) g += `<text x="${Math.min(w - 10, X(t)).toFixed(1)}" y="${h - 5}" class="tm2ax" text-anchor="middle">${t}</text>`;
    const line = (p) => p.map(([a, b], i) => `${i ? "L" : "M"}${a.toFixed(1)} ${b.toFixed(1)}`).join(" "), area = (p) => `${line(p)} L${p[p.length - 1][0].toFixed(1)} ${y1} L${p[0][0].toFixed(1)} ${y1} Z`;
    const fp = []; for (let t = h0; t < h1; t++) fp.push([X(t + 0.5), Y(fc[t] || 0)]);
    const ap = []; if (A) for (let t = h0; t <= Math.min(Math.floor(C.nh), h1 - 1); t++) ap.push([X(t + 0.5), Y(A[t] || 0)]);
    const bd = S.best && S.best_day === day ? S.best : null;
    const best = bd ? `<rect x="${X(bd.from).toFixed(1)}" y="${y0}" width="${(X(bd.to) - X(bd.from)).toFixed(1)}" height="${y1 - y0}" fill="rgba(52,211,153,.14)"/>` : "";
    const now = day === "today" && C.nh > h0 && C.nh < h1 ? `<line x1="${X(C.nh).toFixed(1)}" x2="${X(C.nh).toFixed(1)}" y1="${y0}" y2="${y1}" class="tm2dl"/><text x="${(X(C.nh) + 6).toFixed(1)}" y="${y0 + 12}" class="tm2ax b">jetzt</text>` : "";
    const sel = this._spH != null && fc[this._spH] != null ? `<rect x="${X(this._spH).toFixed(1)}" y="${y0}" width="${(X(this._spH + 1) - X(this._spH)).toFixed(1)}" height="${y1 - y0}" fill="rgba(127,127,127,.14)"/>` : "";
    const hit = rows.filter(([t]) => t >= h0 && t < h1).map(([t]) => `<rect x="${X(t).toFixed(1)}" y="${y0}" width="${(X(t + 1) - X(t)).toFixed(1)}" height="${y1 - y0}" fill="transparent" data-act="spxh" data-k="${t}" style="cursor:pointer"/>`).join("");
    box.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Prognose und Ertrag je Stunde">${g}${best}${sel}<path d="${area(fp)}" fill="rgba(245,158,11,.18)"/><path d="${line(fp)}" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linejoin="round"/>${ap.length > 1 ? `<path d="${line(ap)}" fill="none" stroke="#34d399" stroke-width="3.5" stroke-linejoin="round"/><circle cx="${ap[ap.length - 1][0].toFixed(1)}" cy="${ap[ap.length - 1][1].toFixed(1)}" r="5" fill="#34d399"/>` : ""}${now}${hit}</svg>`;
  }
  /* Treffsicherheit eines Tages in Prozent (wie die Kennzahl: 100 minus Abweichung) */
  _tm2SpHit(x) { return x && x.a != null && x.f > 0 ? Math.round(100 - Math.min(100, Math.abs(x.a - x.f) / x.f * 100)) : null; }
  _tm2SpDays(S) { return S.hist30 && S.hist30.length ? S.hist30 : S.hist || []; }
  _tm2SpAcc(C) {
    const S = C.S, f1 = (v) => this._spF(v), all = this._tm2SpDays(S), y = new Date(); y.setDate(y.getDate() - 1);
    const key = (t) => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
    const last = all.find((x) => x.d === key(y)), dv = last && last.a != null && last.f > 0 ? Math.round((last.a - last.f) / last.f * 100) : null;
    const tiles = [
      this._tm2Tile4("Treffsicherheit", C.acc != null ? C.acc : "–", C.acc != null ? "%" : "", C.nAcc ? `letzte ${C.nAcc} ${C.nAcc === 1 ? "Tag" : "Tage"}` : "braucht Ertragssensor", "#34d399"),
      this._tm2Tile4("Gelernte Korrektur", S.corr != null && S.corr > 0 ? `× ${num(S.corr, 2)}` : "–", "", S.corr != null && S.corr > 0 ? `aus ${S.corr_n} Tagen` : S.cfg.corr === false ? "ausgeschaltet" : S.corr_n != null && S.corr_n < 7 ? `lernt (${S.corr_n} von 7 Tagen)` : "noch keine", "#2dd4bf"),
      this._tm2Tile4("Gestern", dv != null ? `${dv > 0 ? "+" : dv < 0 ? "−" : ""}${Math.abs(dv)} %` : "–", "", last && last.a != null ? `${f1(last.a)} statt ${f1(last.f)} kWh` : "kein Wert", "#f59e0b")].join("");
    const byd = Object.fromEntries(all.map((x) => [x.d, x])), today = new Date(); today.setHours(12, 0, 0, 0);
    const st = new Date(today); st.setDate(st.getDate() - ((st.getDay() + 6) % 7) - 21);
    let cells = "";
    for (let i = 0; i < 28; i++) {
      const t = new Date(st.getTime()); t.setDate(st.getDate() + i);
      const k = key(t), x = byd[k], p = this._tm2SpHit(x), cl = p == null ? "n" : p >= 90 ? "g" : p >= 80 ? "y" : "r";
      cells += x ? `<button class="${cl}" data-act="tm2x" data-k="sp" data-id="${k}" aria-label="${t.toLocaleDateString("de-DE")}: ${p == null ? "ohne Ertrag" : `${p} Prozent`}"><small>${t.getDate()}</small><b>${p == null ? "–" : p}</b></button>` : `<span class="${t > today ? "f" : "n"}"><small>${t.getDate()}</small></span>`;
    }
    return `<div class="tm2sums three">${tiles}</div>
      <div class="tm2stat tm2spac"><div class="card tm2cc"><div class="tm2sh"><span>${ic("chart", 18)}Prognose und Ertrag je Tag (kWh)</span><span class="tm2legend"><i style="background:#f59e0b"></i>Prognose <i style="background:#34d399"></i>Ertrag</span></div><div class="tm2ch" data-tm2ch="spacc"></div></div>
        <div class="card tm2cc tm2cal"><div class="tm2sh"><span>${ic("today", 18)}Treffer-Kalender</span></div><div class="tm2calh">${["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => `<i>${d}</i>`).join("")}</div><div class="tm2calg">${cells}</div></div></div>`;
  }
  _tm2SpAccChart(box, w, h) {
    if (!this._tm2SpReady()) return;
    const H = this._tm2SpDays(this._sp()).filter((x) => x.f != null).slice(-14);
    if (H.length < 2) { box.innerHTML = `<div class="tm2none">${ic("chart", 40)}<div>Noch zu wenig abgeschlossene Tage.</div></div>`; return; }
    const mx = Math.max(1, ...H.map((x) => Math.max(x.f || 0, x.a || 0))) * 1.1, step = enStep(mx), top = Math.ceil(mx / step) * step;
    const x0 = 38, x1 = w - 16, y0 = 10, y1 = h - 22, X = (i) => x0 + 12 + i / (H.length - 1) * (x1 - x0 - 24), Y = (v) => y1 - v / top * (y1 - y0);
    let g = "";
    for (let v = 0; v <= top + 1e-9; v += step) g += `<line x1="${x0}" x2="${x1}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="tm2gl"/><text x="${x0 - 8}" y="${(Y(v) + 4).toFixed(1)}" class="tm2ax" text-anchor="end">${num(v, step < 1 ? 1 : 0)}</text>`;
    const every = Math.max(1, Math.ceil(52 / ((x1 - x0) / H.length)));
    H.forEach((x, i) => { if ((H.length - 1 - i) % every === 0) g += `<text x="${X(i).toFixed(1)}" y="${h - 5}" class="tm2ax" text-anchor="middle">${new Date(`${x.d}T12:00:00`).toLocaleDateString("de-DE", { day: "numeric", month: "numeric" })}</text>`; });
    const path = (k) => { let s = "", pen = false; H.forEach((x, i) => { if (x[k] == null) { pen = false; return; } s += `${pen ? "L" : "M"}${X(i).toFixed(1)} ${Y(x[k]).toFixed(1)} `; pen = true; }); return s; };
    const dots = H.map((x, i) => (x.a != null ? `<circle cx="${X(i).toFixed(1)}" cy="${Y(x.a).toFixed(1)}" r="4" fill="#34d399"/>` : "")).join("");
    box.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Prognose und Ertrag der letzten Tage">${g}<path d="${path("f")}" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linejoin="round"/><path d="${path("a")}" fill="none" stroke="#34d399" stroke-width="3" stroke-linejoin="round"/>${dots}</svg>`;
  }
  _tm2SpSites(C) {
    const S = C.S, adm = this._admin(), f1 = (v) => this._spF(v), L = (S.site_sums || []).filter((x) => x && x.n), cols = ["#f59e0b", "#38bdf8", "#4ade80", "#c084fc", "#f472b6", "#facc15"];
    const one = !L.length, list = one ? [{ n: (S.sites || [])[0] || S.src || "Deine Anlage", t: S.today, m: S.tomorrow, h: S.hours }] : L;
    const tot = list.reduce((a, x) => a + (x.t || 0), 0) || 1, land = this._tm2Land(), per = land ? 6 : 4, p = this._tm2Page("spsite", list.length, per);
    const spark = (h, c) => { if (!h || h.length < 2) return `<span class="sl"></span>`; const mx = Math.max(0.1, ...h.map((x) => x[1])), h0 = h[0][0], sp = Math.max(1, h[h.length - 1][0] - h0);
      const pt = h.map(([t, v]) => `${((t - h0) / sp * 96 + 2).toFixed(1)},${(38 - v / mx * 34).toFixed(1)}`).join(" ");
      return `<svg class="sl" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><polyline points="2,38 ${pt} 98,38" fill="${c}" fill-opacity=".18" stroke="none"/><polyline points="${pt}" fill="none" stroke="${c}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`; };
    const cards = list.slice(p.from, p.to).map((x, i) => { const c = cols[(p.from + i) % cols.length], pc = Math.round((x.t || 0) / tot * 100);
      return `<div class="card tm2site" style="--a:${c}"><div class="h"><b>${esc(x.n)}</b>${list.length > 1 ? `<em>${pc} %</em>` : ""}</div><div class="v"><b>${f1((x.t || 0) * C.cf)}<small>kWh heute</small></b><span>morgen ${f1((x.m || 0) * C.cf)} kWh</span></div>${spark(x.h, c)}</div>`; }).join("");
    const cnt = Math.max(1, p.to - p.from), c = land ? Math.min(3, cnt) : cnt > 2 ? 2 : 1, r = Math.max(1, Math.ceil(cnt / c));
    return `<div class="tm2gsh"><span>Alle Anlagen heute <b>${f1(tot * C.cf)} kWh</b></span><small>morgen ${f1(list.reduce((a, x) => a + (x.m || 0), 0) * C.cf)} kWh${C.cf !== 1 ? ` · korrigiert × ${num(C.cf, 2)}` : ""}${list.length < 2 ? " · einzeln ab zwei Anlagen" : ""}</small>${adm ? `<button class="tm2mini end" data-act="tm2g" data-g="spxopen">${ic("lock", 16)}Quellen &amp; Sensoren</button>` : ""}</div>
      <div class="tm2swb" data-sw="spsite"><div class="tm2sites" style="--c:${c};--r:${r}">${cards}</div>${this._tm2Pager("spsite", p, "Anlagen")}</div>`;
  }
  /* Ein Tag aus dem Treffer-Kalender als Fenster */
  _tm2SpModal(m) {
    const x = this._tm2SpDays(this._sp()).find((y) => y.d === m.id);
    return `<div class="ov" data-act="close"></div><div class="sheet wide tm2rm spx" role="dialog" aria-modal="true"><div class="sh"><div><b>Treffsicherheit${x && this._tm2SpHit(x) != null ? ` ${this._tm2SpHit(x)} %` : ""}</b><small>Solar-Prognose</small></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>${x ? this._spDay1(x) : `<div class="mut">Für diesen Tag gibt es keine Werte.</div>`}</div>`;
  }
