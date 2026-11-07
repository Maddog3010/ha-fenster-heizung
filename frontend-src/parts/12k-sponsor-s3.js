  /* ================= Sponsor-Bereich 2.0 · Stufe S3: Energie-Coach, Monatsbericht, Wunsch des Monats =================
     Coach: feste Prüfregeln im Backend (coach.py), jeden Montag 6 Uhr, Ergebnis kommt fertig an (fenster_heizung/coach_get).
     Monatsbericht: Bild im Browser aus der Szene und den Monatswerten (Modul 3 Statistik, Modul 1 Monat). Teilen nur auf Knopfdruck.
     Wunsch des Monats: Umfrage in GitHub Discussions, Stand aus docs/wunsch.json im Repo (nur lesend, kein Konto nötig).
     Nichts verlässt Home Assistant – außer dem Lesen von wunsch.json und dem, was der Nutzer selbst teilt. */
  static S3_TIP = { dev: ["dishwasher", "#a78bfa"], win: ["windowOpen", "#38bdf8"], bat: ["battery", "#a78bfa"], heat: ["heater", "#fb923c"], base: ["plug", "#f87171"], car: ["car", "#34d399"] };
  _s3Eur(v) { return `${num(v, 2)} €`; }
  static S3_WISH = "https://raw.githubusercontent.com/Maddog3010/ha-fenster-heizung/main/docs/wunsch.json";
  /* ---- Laden: Coach (Backend), Monatsbericht (Statistik + Backend), Wunsch des Monats (wunsch.json im Repo) ---- */
  _s3Load() {
    const now = Date.now();
    if (this._hass && !this._s3CB && (!this._s3Cts || now - this._s3Cts > 6e5)) {
      this._s3CB = true; this._s3Cts = now;
      this._hass.callWS({ type: "fenster_heizung/coach_get" }).then((r) => { this._s3C = r; }).catch(() => { this._s3C = this._s3C || null; })
        .finally(() => { this._s3CB = false; if (this._loOpen) this._render(); });
    }
    if (!this._s3R || !this._s3R[-1]) this._s3RepLoad(-1);
    if (!this._s3Wts || now - this._s3Wts > 36e5) {
      this._s3Wts = now;
      fetch(this.constructor.S3_WISH + "?t=" + Math.floor(now / 36e5), { cache: "no-store" }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((j) => { this._s3W = j && typeof j === "object" ? j : null; return this._s3Votes(); }).catch(() => { this._s3W = this._s3W || { err: true }; })
        .finally(() => { if (this._loOpen) this._render(); });
    }
  }
  /* Stimmen live: 👍 an den Kommentaren der Abstimmung (öffentliche GitHub-API, ohne Konto). Klappt das nicht, gelten die Zahlen aus wunsch.json. */
  _s3Votes() {
    const W = this._s3W; if (!W || !W.issue || !Array.isArray(W.options)) return null;
    return fetch(`https://api.github.com/repos/Maddog3010/ha-fenster-heizung/issues/${Number(W.issue)}/comments?per_page=100`, { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((L) => { const m = new Map((Array.isArray(L) ? L : []).map((c) => [c.id, ((c.reactions || {})["+1"]) || 0])); W.options = W.options.map((o) => (m.has(o.c) ? { ...o, v: m.get(o.c) } : o)); W.live = true; })
      .catch(() => { /* Zahlen aus wunsch.json */ });
  }
  _s3Month(off) { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); d.setMonth(d.getMonth() + off); const e = new Date(d); e.setMonth(e.getMonth() + 1); return { s: d, e, ym: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, mon: d.toLocaleDateString("de-DE", { month: "long" }), year: d.getFullYear() }; }
  /* Solar, Bezug und Einspeisung eines Monats aus der Langzeitstatistik (Zähler: Änderung je Monat; Leistung: Stundenmittel) */
  async _s3Stats(s, e) {
    if (!this._enSrc || !this._enConfigured || !this._enConfigured()) return null;
    const src = this._enSrc(), pick = ["pv", "pv2", "imp", "exp"].map((k) => [k, src[k]]).filter((x) => x[1]);
    if (!pick.length) return null;
    const q = (ids, per, ty) => (ids.length ? this._hass.callWS({ type: "recorder/statistics_during_period", start_time: s.toISOString(), end_time: e.toISOString(), statistic_ids: [...new Set(ids)], period: per, types: [ty] }) : Promise.resolve({}));
    const [re, rp] = await Promise.all([q(pick.filter((x) => x[1].t === "e").map((x) => x[1].id), "month", "change"), q(pick.filter((x) => x[1].t === "p").map((x) => x[1].id), "hour", "mean")]);
    const out = {};
    let any = false;
    for (const [k, x] of pick) {
      const rows = (x.t === "e" ? re : rp)[x.id] || [];
      if (rows.length) any = true;
      const v = x.t === "e" ? rows.reduce((a, r) => a + Math.max(r.change || 0, 0), 0) * x.k
        : rows.reduce((a, r) => { let w = (r.mean || 0) * x.k; if (x.sg) w = k === "exp" ? (x.sg === "import" ? -w : w) : (x.sg === "import" ? w : -w); return a + Math.max(w, 0) / 1000; }, 0);
      const kk = k === "pv2" ? "pv" : k; out[kk] = (out[kk] || 0) + v;
    }
    return any ? out : null;
  }
  async _s3RepLoad(off) {
    this._s3R = this._s3R || {};
    if (this._s3RB === off) return; this._s3RB = off;
    const M = this._s3Month(off), R = { mon: M.mon, year: M.year, ym: M.ym };
    try {
      const [st, be] = await Promise.all([this._s3Stats(M.s, M.e).catch(() => null), this._hass.callWS({ type: "fenster_heizung/report_get", ym: M.ym }).catch(() => ({}))]);
      if (st && st.pv > 0) R.pv = st.pv;
      if (st && st.imp != null && st.exp != null) { const house = (st.pv || 0) + st.imp - st.exp; if (house > 1) R.aut = Math.max(0, Math.min(100, (1 - st.imp / house) * 100)); }
      const H = be && be.heat; if (H) { if (H.amt != null && H.unit) { const F = FUELS[H.fuel] || {}; R.oil = H.amt; R.ou = H.unit; R.on = F.short || "Brennstoff"; } else if (H.kwh > 0) { R.oil = H.kwh; R.ou = "kWh"; R.on = "Wärme"; } }
      if (be && be.gs && be.gs.saved > 0) R.sv = be.gs.saved;
    } catch (_) { /* fehlende Werte lässt der Bericht weg */ }
    this._s3R[off] = R; this._s3RB = null;
    if (this._loOpen) this._render();
    if (this._modal && this._modal.type === "s3rep") this._renderModal();
  }
  /* ---- Monatsbericht als PNG: teilen (iPhone/iPad Teilen-Menü) oder speichern ---- */
  _s3Png(cb) {
    const R = this._s3R && this._s3R[(this._modal && this._modal.off) || 0]; if (!R) return;
    const svg = this._s3RepSvg(R).replace('width="100%" style="max-width:380px;display:block;margin:0 auto;border-radius:12px"', 'width="1080" height="1350"');
    const img = new Image();
    img.onload = () => { try { const c = document.createElement("canvas"); c.width = 1080; c.height = 1350; c.getContext("2d").drawImage(img, 0, 0, 1080, 1350); c.toBlob((bl) => (bl ? cb(bl, `Monatsbericht_${R.ym}.png`) : this._toast("Bild nicht möglich")), "image/png"); } catch (_) { this._toast("Bild nicht möglich"); } };
    img.onerror = () => this._toast("Bild nicht möglich");
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  _s3Save(bl, name) { const a = document.createElement("a"); a.href = URL.createObjectURL(bl); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); this._toast("Bild gespeichert"); }
  _s3Share() {
    this._s3Png((bl, name) => {
      const f = new File([bl], name, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: "Mein Haus im Monat" }).catch(() => {});
      else this._s3Save(bl, name);
    });
  }
  _s3Act(a, b) {
    const k = b.dataset.k;
    if (a === "lgxrep") { const off = Math.min(0, Number(k) || 0); this._modal = { type: "s3rep", off }; if (!this._s3R || !this._s3R[off]) this._s3RepLoad(off); this._renderModal(); return true; }
    if (a === "lgxrepshare") { this._s3Share(); return true; }
    if (a === "lgxreppng") { this._s3Png((bl, name) => this._s3Save(bl, name)); return true; }
    if (a === "lgxcoach") { this._spnPref({ coach: this._spnS().saved_prefs.coach === false }); return true; }
    if (a === "lgxreport") { this._spnPref({ report: this._spnS().saved_prefs.report === false }); return true; }
    if (a === "lgxcrun") { this._s3CB = true; this._hass.callWS({ type: "fenster_heizung/coach_get", run: true }).then((r) => { this._s3C = r; this._toast("Coach neu berechnet"); }).catch(() => this._toast("Das ging nicht")).finally(() => { this._s3CB = false; this._render(); }); return true; }
    return false;
  }
  /* Szene „Dein Haus im Monat“: Himmel, Sonne, Haus mit Solardach, Akku, Auto, Strommast – aus der HD-Bibliothek */
  _s3Scene(W = 400, H = 170, id = "s3") {
    const put = (k, x, y, sz, o = {}) => this._gx(k, sz, { on: true, lvl: 90, ...o }).replace(/^<svg[^>]*>/, `<svg x="${x}" y="${y}" width="${sz}" height="${sz}" viewBox="0 0 64 64">`);
    const sx = W / 400, sy = H / 170, S = (v) => v * sx, T = (v) => v * sy;
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="display:block;width:100%;height:100%">
      <defs><linearGradient id="${id}sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b2a44"/><stop offset="1" stop-color="#14524f"/></linearGradient>
      <radialGradient id="${id}sn" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fde68a"/><stop offset=".5" stop-color="#fbbf24" stop-opacity=".55"/><stop offset="1" stop-color="#fbbf24" stop-opacity="0"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}sk)"/><circle cx="${S(70)}" cy="${T(40)}" r="${S(46)}" fill="url(#${id}sn)"/><circle cx="${S(70)}" cy="${T(40)}" r="${S(15)}" fill="#fde047"/>
      <path d="M0 ${T(132)}C${S(90)} ${T(120)} ${S(220)} ${T(126)} ${W} ${T(118)}V${H}H0Z" fill="#15803d"/><path d="M0 ${T(146)}C${S(120)} ${T(138)} ${S(260)} ${T(146)} ${W} ${T(136)}V${H}H0Z" fill="#166534"/>
      <path d="M${S(204)} ${T(92)}C${S(240)} ${T(80)} ${S(290)} ${T(70)} ${S(330)} ${T(64)}" fill="none" stroke="#f87171" stroke-width="${S(2)}" stroke-dasharray="${S(4)} ${S(4)}" opacity=".8"/>
      <path d="M${S(150)} ${T(118)}C${S(140)} ${T(128)} ${S(128)} ${T(128)} ${S(118)} ${T(124)}" fill="none" stroke="#fbbf24" stroke-width="${S(2.4)}" stroke-dasharray="${S(4)} ${S(3)}"/>
      ${put("house", S(146), T(36), S(96))}${put("pvRoof", S(150), T(18), S(46))}${put("battery", S(98), T(98), S(34))}${put("car", S(246), T(104), S(40))}${put("grid", S(318), T(36), S(70))}</svg>`;
  }
  /* ---- Lounge-Karten ---- */
  _s3CoachCard(C, on) {
    const head = `<div class="s3h">${this._gx("pvRoof", 34, { on: true, lvl: 80 })}<span><b>Energie-Coach</b><small>jeden Montag 3 Tipps aus deinen Daten</small></span>${C && C.week ? `<em class="lgchip">KW ${esc(String(C.week))}</em>` : ""}</div>`;
    if (!on) return `<div class="lgt s3c" id="lgcoach" style="--c:#fbbf24">${head}<div class="lgnote2">Ausgeschaltet. Unter „Deine Extras“ wieder einschalten.</div></div>`;
    if (!C) return `<div class="lgt s3c" id="lgcoach" style="--c:#fbbf24">${head}<div class="s3learn">${ic("forecast", 18)}<span>Lädt …</span></div></div>`;
    if (!C.tips || !C.tips.length) return `<div class="lgt s3c" id="lgcoach" style="--c:#fbbf24">${head}<div class="s3learn">${ic("forecast", 18)}<span>${C && C.learn ? `Der Coach sammelt noch – die ersten Tipps kommen am <b>${esc(C.next || "Montag")}</b>.` : "Diese Woche lief alles gut – keine Tipps nötig."}</span></div></div>`;
    const tips = C.tips.slice(0, 3).map((t) => { const [k, c] = this.constructor.S3_TIP[t.k] || ["bolt", "#2dd4bf"]; return `<div class="s3tip" style="--c:${c}">${this._gx(k, 26, { on: true, lvl: 70 })}<span>${esc(t.t)}</span></div>`; }).join("");
    const sum = [C.eur > 0 ? `${num(C.eur, 2)} €` : "", C.l > 0 ? `${num(C.l, 0)} ${esc(C.lu || "l Heizöl")}` : ""].filter(Boolean).join(" und ");
    return `<div class="lgt s3c" id="lgcoach" style="--c:#fbbf24">${head}${tips}${sum ? `<div class="s3sum">Möglich diese Woche: ${sum}</div>` : ""}<div class="lgnote2">Aus den letzten 7 Tagen${C.from ? ` (${esc(new Date(C.from + "T12:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }))}–${esc(new Date(C.to + "T12:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }))})` : ""} · feste Regeln, keine KI · neu jeden Montag</div></div>`;
  }
  _s3ReportCard(R, on) {
    const head = `<div class="s3h">${this._gx("house", 34, { on: true, lvl: 80 })}<span><b>Monatsbericht</b><small>„Dein Haus im ${esc((R && R.mon) || "Monat")}“ als Bild</small></span></div>`;
    if (!on) return `<div class="lgt s3c" style="--c:#2dd4bf">${head}<div class="lgnote2">Ausgeschaltet. Unter „Deine Extras“ wieder einschalten.</div></div>`;
    const cells = this._s3Cells(R);
    return `<div class="lgt s3c" style="--c:#2dd4bf">${head}<div class="s3rep"><div class="s3scn">${this._s3Scene(400, 150, "s3c")}</div>
      <div class="s3n">${cells.length ? cells.slice(0, 3).map(([v, l, c]) => `<div><b style="color:${c}">${v}</b><small>${l}</small></div>`).join("") : `<div><small>Noch keine Monatswerte</small></div>`}</div></div>
      <div class="lgbtns"><button class="lgopen" data-act="lgxrep" data-k="-1">Teilen</button><button class="lgopen gy" data-act="lgxrep" data-k="-2">Vormonat</button></div></div>`;
  }
  _s3Cells(R) {
    if (!R) return [];
    return [R.pv != null ? [`${num(R.pv, 0)}`, "kWh Solar", "#fbbf24"] : null, R.aut != null ? [`${num(R.aut, 0)} %`, "Autarkie", "#2dd4bf"] : null, R.oil > 0 ? [`${num(R.oil, 0)} ${esc(R.ou || "l")}`, `${esc(R.on || "Öl")} gespart`, "#fb923c"] : null,
      R.sv > 0 ? [`${num(R.sv, 0)} €`, "durch eigenen Strom", "#34d399"] : null].filter(Boolean);
  }
  _s3WishCard(W, mx) {
    const mon = W && W.month ? new Date(W.month + "-15T12:00:00").toLocaleDateString("de-DE", { month: "long" }) : new Date().toLocaleDateString("de-DE", { month: "long" });
    const ok = W && Array.isArray(W.options) && W.options.length, tot = ok ? W.options.reduce((a, o) => a + (o.v || 0), 0) : 0, mxv = ok ? Math.max(...W.options.map((o) => o.v || 0)) : 0;
    const rows = ok ? W.options.slice(0, 5).map((o) => { const p = tot ? Math.round((o.v || 0) / tot * 100) : 0; return `<div class="lgpoll ${o.v === mxv && mxv ? "top" : ""}"><span>${o.v === mxv && mxv ? "✓ " : ""}${esc(o.t)}${tot ? `<b>${p} %</b>` : ""}</span><i><b style="width:${p}%"></b></i></div>`; }).join("") : `<div class="lgnote2">Die Umfrage für ${esc(mon)} ist noch nicht da.${W && W.err ? " (GitHub gerade nicht erreichbar)" : ""}</div>`;
    const until = W && W.until ? new Date(W.until + "T12:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) : "";
    return `<div class="lgt" id="lgwish" style="--c:#f472b6"><h4>Wunsch des Monats · ${esc(mon)}</h4>${rows}
      ${ok ? `<div class="lgnote2">${tot} ${tot === 1 ? "Stimme" : "Stimmen"}${until ? ` · Abstimmung bis ${until}` : ""}. Gewinner kommt in die Roadmap${W.next ? ` (${esc(W.next)})` : ""}.${W.prev ? `<br>Letzter Gewinner: ${esc(W.prev)}` : ""}</div>` : ""}
      <div class="lgbtns">${W && W.url ? `<a class="btn2 lgpk" href="${esc(W.url)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">Auf GitHub abstimmen</a>` : ""}${mx && W && (W.idea || W.url) ? `<a class="btn2" href="${esc(W.idea || W.url)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none"><span class="lggd">★</span> Vorschlagen</a>` : ""}</div>
      <div class="lgnote2" style="margin-top:6px">Abstimmen mit 👍 auf GitHub (eigenes Konto)${mx ? "; als Max kannst du Wünsche vorschlagen" : ""}.</div></div>`;
  }
  /* ---- Monatsbericht als Bild (1080 × 1350, zum Teilen und Speichern) ---- */
  _s3RepSvg(R) {
    const W = 1080, H = 1350, cells = this._s3Cells(R), s = this._spnS(), f = "Roboto,system-ui,sans-serif";
    const cw = 470, chh = 170;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" style="max-width:380px;display:block;margin:0 auto;border-radius:12px">
      <rect width="${W}" height="${H}" fill="#0f1419"/>
      <text x="70" y="110" font-family="${f}" font-size="30" letter-spacing="7" font-weight="700" fill="#5eead4">STROM &amp; WÄRME · MONATSBERICHT</text>
      <text x="66" y="200" font-family="${f}" font-size="74" font-weight="900" fill="#e6edf3">Dein Haus im ${esc(R.mon || "")}</text>
      <g transform="translate(70 250)"><svg width="940" height="500" viewBox="0 0 400 213">${this._s3Scene(400, 213, "s3p").replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</svg></g>
      ${cells.map(([v, l, c], i) => { const x = 70 + (i % 2) * (cw + 0), y = 800 + Math.floor(i / 2) * (chh + 20); return `<rect x="${x}" y="${y}" width="${cw - 20}" height="${chh}" rx="24" fill="#ffffff" fill-opacity=".06"/><text x="${x + 32}" y="${y + 92}" font-family="${f}" font-size="66" font-weight="800" fill="${c}">${v}</text><text x="${x + 32}" y="${y + 138}" font-family="${f}" font-size="28" fill="#9aa7b4">${l}</text>`; }).join("")}
      <text x="${W / 2}" y="${H - 60}" text-anchor="middle" font-family="${f}" font-size="26" fill="#9aa7b4">${esc(R.year ? R.mon + " " + R.year : "")} · aus den eigenen Daten · github.com/Maddog3010</text></svg>`;
  }
  _s3RepModal() {
    const m = this._modal, R = this._s3R && this._s3R[m.off || 0], cur = (m.off || 0) === 0, close = `<button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button>`;
    const body = !R ? `<div class="mut sm">Lädt …</div>` : `<div class="lgposter">${this._s3RepSvg(R)}</div>
      <div class="gbtns" style="margin-top:12px"><button class="btn2 pri" data-act="lgxrepshare">${ic("image", 16)} Teilen</button><button class="btn2" data-act="lgxreppng">${ic("download", 16)} Als Bild speichern</button></div>
      <div class="gbtns"><button class="btn2" data-act="lgxrep" data-k="${(m.off || 0) - 1}">‹ Vormonat</button>${(m.off || 0) < 0 ? `<button class="btn2" data-act="lgxrep" data-k="${(m.off || 0) + 1}">Nächster ›</button>` : ""}</div>
      <div class="mut sm" style="margin-top:8px">Geteilt wird nur dieses Bild, und nur wenn du tippst. Werte ohne Daten lässt der Bericht weg.</div>`;
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true"><div class="sh"><div><b>Monatsbericht</b><span>${R ? `${esc(R.mon)} ${R.year}${cur ? " · bis heute" : ""}` : "Sponsor-Extra"} · nur aus deinen Daten</span></div>${close}</div>${body}</div>`;
  }
