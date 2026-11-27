  /* ================= Tablet-Modus · Stufe 3: Modul 19 Hausfluss ohne Scrollen und die Ruhebilder =================
     Jetzt: das Haus füllt die Seite, darunter vier Tageswerte. Strom: Herkunft als drei Lichtsäulen, Verbraucher in
     Seiten. Ruhebild: Energie („Das Haus braucht gerade …“) oder Hausfluss (nur Solar, Haus, Akku und Netz). */
  _tm2EfNodes() { const c = this._efxCfg(); return Object.keys(EF_POS).filter((p) => c.nodes[p] && c.nodes[p].on); }
  _tm2Ef() {
    if (!this._efxD) { this._efxLoad(); return this._tm2None("energy", "Hausfluss wird geladen …"); }
    if (!this._efxSp()) return this._efPage();
    if (!this._tm2EfNodes().length) return this._tm2None("energy", "Noch keine Kacheln.", "Solar, Netz, Akku und Verbraucher legst du in der normalen Ansicht an.");
    return this._tm2Tab("ef") === "strom" ? this._tm2EfStrom() : this._tm2EfNow();
  }
  _tm2EfNow() {
    this._tm2EfB = true; let board;
    try { board = this._efPage(); } finally { this._tm2EfB = false; }
    const H = this._efxStatLoad({ range: "day", off: 0 }), T = H && H.any ? H.tot : null, price = Number(this._price()) || 0, feed = Number(this._feed()) || 0;
    const aut = T && T.use > 0 ? Math.round(Math.max(0, 1 - T.net / T.use) * 100) : null, vt = T ? (T.exp * feed + Math.max(0, T.use - T.net) * price) / 100 : null;
    const tiles = [
      this._tm2Tile4("Solar heute", this._tm2Kwh(T ? T.gen : null), "kWh", T && T.gen > 0 ? `${Math.round(Math.max(0, T.gen - T.exp) / T.gen * 100)} % selbst genutzt` : "", "#fbbf24"),
      this._tm2Tile4("Netzbezug", this._tm2Kwh(T ? T.imp : null), "kWh", T ? `${num(T.imp * price / 100, 2)} € Kosten` : "", "#f87171"),
      this._tm2Tile4("Autarkie", aut == null ? "–" : aut, "%", T ? `von ${this._tm2Kwh(T.use)} kWh Verbrauch` : "", "#a78bfa"),
      this._tm2Tile4("Vorteil heute", vt == null ? "–" : `${num(vt, 2)} €`, "", "Solar genutzt und eingespeist", "#34d399")].join("");
    return `<div class="tm2efb">${board}</div><div class="tm2sums">${tiles}</div>`;
  }
  /* Kachelgröße so wählen, dass das ganze Brett in seinen Platz passt */
  _tm2EfFit(b) {
    const box = b.closest(".tm2efb"); if (!box) return;
    const H = box.clientHeight, W = box.clientWidth; if (!H || !W) return;
    b.style.minHeight = "0px";
    let w = Math.max(80, Math.min(250, Math.floor((W - 64) / 4)));
    for (let i = 0; i < 8; i++) {
      b.style.setProperty("--eft", w + "px");
      const over = b.offsetHeight - H; if (over <= 0 || w <= 70) break;
      w = Math.max(70, Math.floor(w * H / b.offsetHeight) - 2);
    }
    this._efW = w; b.style.minHeight = H + "px";
  }
  _tm2EfStrom() {
    const P = this._efP(), R = this._efPer(P), c = this._efxCfg(), H = this._efxStatLoad(P);
    const bar = `<div class="tm2bar"><div class="tm2seg" role="group" aria-label="Zeitraum">${[["day", "Tag"], ["week", "Woche"], ["month", "Monat"], ["year", "Jahr"]].map(([k, l]) => `<button class="${P.range === k ? "sel" : ""}" data-act="efxrng" data-k="${k}" aria-pressed="${P.range === k}">${l}</button>`).join("")}</div>
      <div class="tm2per"><button data-act="efxoff" data-k="-1" aria-label="Zurück">${ic("back", 20)}</button><b>${esc(this._efPLbl(P, R))}</b><button class="nx" data-act="efxoff" data-k="1" aria-label="Weiter" ${P.off >= 0 ? "disabled" : ""}>${ic("back", 20)}</button></div></div>`;
    const none = (t, s = "") => `${bar}${this._tm2None("energy", t, s)}`;
    if (!this._efxPowIds(Object.values(c.nodes).filter((n) => n.on)).length) return none("Keine Leistungssensoren.", "Der Strom-Reiter rechnet mit den Leistungssensoren deiner Kacheln.");
    if (!H) return none("Verlauf wird geladen …");
    if (H.err || !H.any) return none("Für diesen Zeitraum gibt es keine Werte.", "Die Sensoren brauchen eine „state_class“ (measurement).");
    const T = H.tot, f1 = (v) => this._tm2Kwh(v), pc = (a, b) => (b > 0 ? Math.round(a / b * 100) : 0);
    const src = EF_MIX.filter(([k]) => k !== "oth" || T.oth > 0.05), mx = Math.max(0.001, ...src.map(([k]) => T[k]));
    const cols = src.map(([k, l, col]) => `<div class="tm2efc" style="--c:${col}"><b>${pc(T[k], T.use)} %</b><span><i style="height:${(T[k] / mx * 100).toFixed(1)}%"></i></span><em>${l}</em><small>${f1(T[k])} kWh</small></div>`).join("");
    const all = this._efxConsList(P, R, H, c), H2 = window.innerHeight, land = this._tm2Land(), per = H2 < 640 ? 3 : H2 < 760 ? 4 : !land && H2 < 1000 ? 3 : 5;
    const p = this._tm2Page("efcons", all.length, per), SRC = { gs: "Modul 4", wb: "Modul 8" };
    const rows = all.slice(p.from, p.to).map((x) => {
      const s = pc(x.pv, x.kwh), three = x.bat != null, seg = three ? [["#fbbf24", x.pv], ["#a78bfa", x.bat], ["#f87171", x.net]] : [["#fbbf24", x.pv]];
      return `<div class="tm2efr" style="--c:${x.n.color || EF_POS[x.p][3]}"><span class="efq sm"><span class="efqi">${this._efxImgN(x.n, { on: x.kwh > 0 })}</span></span><span class="tm2efn"><b>${esc(x.n.name)}${SRC[x.src] ? `<small>${SRC[x.src]}</small>` : ""}</b><span aria-hidden="true">${seg.map(([col, v]) => (v > 0 && x.kwh > 0 ? `<i style="width:${(v / x.kwh * 100).toFixed(1)}%;background:${col}"></i>` : "")).join("")}</span></span><strong>${s} %<small>Solar</small></strong><em>${this._tm2Kwh(x.kwh)} kWh</em></div>`;
    }).join("");
    return `${bar}<div class="tm2efs"><div class="card tm2cc"><div class="tm2sh"><span>${ic("chart", 18)}Woher kam der Strom?</span></div><div class="tm2efcols">${cols}</div><small class="tm2note">${f1(T.use)} kWh Verbrauch · ${f1(T.gen)} kWh Solar erzeugt · ${T.use > 0 ? 100 - pc(T.net, T.use) : 0} % ohne Netz</small></div>
      <div class="card tm2cc" data-sw="efcons"><div class="tm2sh"><span>${ic("energy", 18)}Verbraucher mit Solar-Anteil</span></div>${rows ? `<div class="tm2efl" style="--n:${per}">${rows}</div>${this._tm2Pager("efcons", p, "Verbraucher")}` : `<small class="tm2note">Keine Verbraucher-Kacheln mit Leistungssensor.</small>`}</div></div>`;
  }
  /* ---------- Ruhebilder ---------- */
  _tm2RestKind() {
    if (!this._tm2On()) return "";
    const want = this._tmC().rest; if (want === "clock") return "";
    const k = want === "en" || want === "ef" ? want : this._tmV() === "en" || this._tmV() === "ef" ? this._tmV() : "";
    if (!k || !this._mdList().some((m) => m.id === k)) return "";
    if (k === "en") return this._enConfigured() ? k : "";
    if (!this._efxD) { this._efxLoad(); return ""; }
    return this._efxSp() && this._tm2EfNodes().length ? k : "";
  }
  _tm2RestWall() {
    try {
      /* Stufe 5: Bei einer Wetterwarnung zeigt das Ruhebild die Wetter-Szene, egal welches Ruhebild gewählt ist */
      const k = this._tm2RestWxOn() ? "wx" : this._tm2RestKind(), inner = k === "wx" ? this._tm2RestWx() : k === "en" ? this._tm2RestEn() : k === "ef" ? this._tm2RestEf() : "";
      if (!inner) return "";
      const d = new Date();
      return `<div class="tmrest tm2rw ${this._tm2Land() ? "land" : "port"}" data-kind="${k}"><div class="tm2rwh"><span class="tm2rwt"><b data-tmclk>${d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</b><small data-tmdate>${d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</small></span>${this._tm2RestHints()}</div>${inner}<div class="tmrw">Antippen zum Aufwecken</div></div>`;
    } catch (_) { return ""; }
  }
  _tm2RestEn() {
    this._tm2EnRange(true); this._enLoad();
    const n = this._enNow(); if (!n) return "";
    const V = this._tm2EnVals(), solar = n.house > 0 ? Math.round(Math.min(100, Math.max(0, (n.pv2h || 0) / n.house * 100))) : null;
    const tile = (g, o, label, value, sub, color) => `<div class="tm2rwv" style="--a:${color}">${this._gx(g, 56, o)}<span><small>${label}</small><b>${value}</b><em>${sub}</em></span></div>`;
    const bat = n.hasBat ? tile("battery", { lvl: n.soc }, n.bc > 20 ? "Batterie lädt" : n.dis > 20 ? "Batterie liefert" : "Batterie", n.soc != null ? `${Math.round(n.soc)} %` : "–", n.bc > 20 || n.dis > 20 ? wfmt(Math.max(n.bc, n.dis)) : "ruht", "#a78bfa") : "";
    return `<div class="tm2rwen"><div class="tm2rwbig"><small>Das Haus braucht gerade</small><b>${wfmt(n.house)}</b><em>${solar != null ? `${solar} % aus Solar` : "&nbsp;"}</em></div>
      <div class="tm2rwl">${tile("pvRoof", { on: n.pv > 20 }, "Solar", wfmt(n.pv), "erzeugt", "#fbbf24")}${bat}${tile("grid", {}, n.exp > n.imp ? "Einspeisung" : "Netz", wfmt(n.exp > n.imp ? n.exp : n.imp), n.exp > n.imp ? "geht ins Netz" : n.imp > 20 ? "Bezug" : "ruht", n.exp > n.imp ? "#34d399" : "#f87171")}</div>
      <div class="tm2rwaut"><span>Autarkie heute</span><i><i style="width:${V.aut || 0}%"></i></i><b>${V.aut == null ? "–" : `${V.aut} %`}</b></div></div>`;
  }
  _tm2RestEf() {
    const c = this._efxCfg(), list = this._tm2EfNodes(), items = this._efxItems(list), nodes = list.map((p) => c.nodes[p]), calc = this._efxCalc(nodes), hubW = c.hub.calc === "rest" ? calc.rest : calc.total, mix = this._efxMix(nodes);
    /* je Quelle zusammengefasst: alle Solar-Kacheln, alle Akkus, das Netz */
    const sum = (kind) => { const l = items.filter((x) => x.src && x.kind === kind); return l.length ? { w: l.reduce((a, x) => a + (x.nd ? 0 : x.w), 0), it: l[0], nd: l.every((x) => x.nd) } : null; };
    const pv = sum("pv"), bat = sum("bat"), net = sum("net");
    const tile = (cls, g, o, label, s, sub, color) => (s ? `<div class="tm2rwn ${cls}" style="--a:${color}">${this._gx(g, 72, o)}<small>${label}</small><b>${s.nd ? "–" : this._efxFmtW(Math.abs(s.w))}</b><em>${s.nd ? "keine Daten" : sub}</em></div>` : `<div class="tm2rwn ${cls} empty"></div>`);
    const soc = bat ? this._efxState(bat.it.n, bat.it.w).lvl : null;
    return `<div class="tm2rwef">${tile("pv", "pvRoof", { on: !!pv && pv.w < -5 }, "Solar", pv, pv && pv.w < -5 ? "erzeugt" : "ruht", "#fbbf24")}
      <div class="tm2rwn hub"><svg viewBox="-60 -60 120 120" aria-hidden="true">${this._efxRingSvg(mix, 52, 8)}${this._gx("house", 60, { on: true }).replace("<svg ", '<svg x="-30" y="-32" ')}</svg><small>${esc(c.hub.name || "Haus")}</small><b>${this._efxFmtW(hubW)}</b><em>${esc(this._efxMixTxt(mix))}</em></div>
      ${tile("bat", "battery", { lvl: soc == null ? 60 : soc }, `Akku${soc != null ? ` ${Math.round(soc)} %` : ""}`, bat, bat && bat.w > 5 ? "lädt" : bat && bat.w < -5 ? "entlädt" : "ruht", "#a78bfa")}
      ${tile("net", "grid", {}, "Netz", net, net && net.w > 5 ? "Einspeisung" : net && net.w < -5 ? "Bezug" : "ruht", net && net.w > 5 ? "#34d399" : "#f87171")}</div>`;
  }
