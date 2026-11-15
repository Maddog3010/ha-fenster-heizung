  /* ================= Modul 8 · Ladungen aus dem go-e-Ladelog importieren (CSV aus der go-e-App) =================
     go-e-App → Laden → Einzelheiten → Energie pro Benutzer → Download CSV. Die Datei wird hier im Browser gelesen;
     die Spalte „Link“ (enthält einen Zugangsschlüssel zu go-e) wird verworfen und nie gespeichert.
     Den Sonnenanteil kennt die CSV nicht: geschätzt aus der Herkunft des Hausstroms (Haus-Energiebuch, sonst
     Statistik der Energiequellen) – Ladung ab Start mit gleichmäßiger Leistung über die „Ladezeit“. */
  _goeCsv(text) {
    /* CSV mit Anführungszeichen (auch Zeilenumbrüche im Kopf) */
    const rows = [], s = String(text || "").replace(/^﻿/, "");
    let row = [], f = "", q = false;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (q) { if (c === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; continue; }
      if (c === '"') q = true;
      else if (c === "," || c === ";") { row.push(f); f = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && s[i + 1] === "\n") i++; row.push(f); f = ""; if (row.some((x) => x !== "")) rows.push(row); row = []; }
      else f += c;
    }
    row.push(f); if (row.some((x) => x !== "")) rows.push(row);
    if (rows.length < 2) return { err: "Die Datei enthält keine Ladungen." };
    const H = rows[0].map((h) => h.replace(/\s+/g, " ").trim().toLowerCase()), col = (...n) => H.findIndex((h) => n.some((x) => h === x || h.startsWith(x)));
    const C = { id: col("session id"), chip: col("name des chips", "chip name"), e: col("energie", "energy"), s: col("start"), en: col("ende", "end"), lz: col("ladezeit", "charging time") };
    if (C.e < 0 || C.s < 0 || C.en < 0) return { err: "Das sieht nicht nach dem go-e-Ladelog aus (Spalten „Energie“, „Start“, „Ende“ fehlen)." };
    const dt = (v) => { const m = String(v || "").trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/); return m ? new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], +(m[6] || 0)) : null; };
    const dur = (v) => { let t = 0; String(v || "").replace(/(\d+)\s*(T|H|min|S)/g, (_, n, u) => { t += +n * { T: 86400, H: 3600, min: 60, S: 1 }[u]; return ""; }); return t; };
    const out = [];
    rows.slice(1).forEach((r) => {
      const a = dt(r[C.s]), b = dt(r[C.en]), kwh = parseFloat(String(r[C.e] || "").replace(",", "."));
      if (!a || !b || !isFinite(kwh)) return;
      out.push({ gid: C.id >= 0 ? String(r[C.id] || "").trim() : "", a, b, kwh, card: C.chip >= 0 ? String(r[C.chip] || "").trim() : "", lz: C.lz >= 0 ? dur(r[C.lz]) : 0 });
    });
    return out.length ? { rows: out } : { err: "In der Datei wurde keine Ladung erkannt." };
  }
  _goeIso(d) { const p = (n) => String(n).padStart(2, "0"), o = -d.getTimezoneOffset(), s = o >= 0 ? "+" : "-"; return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${s}${p(Math.floor(Math.abs(o) / 60))}:${p(Math.abs(o) % 60)}`; }
  /* Anteil Sonne (inkl. Hausakku, wie Modul 8 zählt) je Stunde: Energiebuch, sonst Stundenmittel der Energiequellen aus Modul 3 */
  async _goeShares(a, b) {
    const s = new Date(a.getFullYear(), a.getMonth(), a.getDate()), e = new Date(b.getFullYear(), b.getMonth(), b.getDate() + 1), sh = {};
    const EB = await this._ebQ(s, e, "hour"), F = (EB && EB.fields) || [], g = (v, k) => v[F.indexOf(k)] || 0;
    ((EB && EB.rows) || []).forEach((r) => { const [y, m, d] = r.d.split("-").map(Number), t = +new Date(y, m - 1, d, r.h), u = g(r.v, "pv") + g(r.v, "bat") + g(r.v, "net"); if (u > 0.01) sh[t] = { f: (g(r.v, "pv") + g(r.v, "bat")) / u, src: "eb" }; });
    const E = this._enState ? this._enState() : null, en = (E && E.ent) || {}, gr = this._enGrid ? this._enGrid() : { ent: "", sign: "export" };
    const ids = [en.pv, en.pv2, gr.ent, en.bat, en.bchg, en.bdis].filter(Boolean);
    if (ids.length && gr.ent && (en.pv || en.pv2)) {
      const r = await this._hass.callWS({ type: "recorder/statistics_during_period", start_time: s.toISOString(), end_time: e.toISOString(), statistic_ids: [...new Set(ids)], period: "hour", types: ["mean"] }).catch(() => ({}));
      const kf = (id) => (/^kW$/i.test(((this._hass.states[id] || {}).attributes || {}).unit_of_measurement || "") ? 1000 : 1), T = {};
      Object.entries(r || {}).forEach(([id, l]) => (l || []).forEach((x) => { const t = typeof x.start === "number" ? x.start : Date.parse(x.start); (T[t] = T[t] || {})[id] = (x.mean || 0) * kf(id); }));
      Object.entries(T).forEach(([t, v]) => {
        if (sh[t]) return;
        const pv = Math.max(0, v[en.pv] || 0) + Math.max(0, v[en.pv2] || 0), gv = v[gr.ent] || 0, imp = Math.max(0, gr.sign === "import" ? gv : -gv), exp = Math.max(0, gr.sign === "import" ? -gv : gv);
        let chg = 0, dis = 0; if (E.bmode === "two") { chg = Math.max(0, v[en.bchg] || 0); dis = Math.max(0, v[en.bdis] || 0); } else { let bb = v[en.bat] || 0; if (E.bsign === "discharge") bb = -bb; chg = Math.max(0, bb); dis = Math.max(0, -bb); }
        const pvh = Math.max(0, pv - exp - chg), use = pvh + dis + Math.max(0, imp - Math.max(0, chg - Math.max(0, pv - exp)));
        if (use > 10) sh[t] = { f: Math.min(1, (pvh + dis) / use), src: "st" };
      });
    }
    return sh;
  }
  async _goeEstimate(rows) {
    if (!rows.length) return rows;
    const a = new Date(Math.min(...rows.map((r) => +r.a))), b = new Date(Math.max(...rows.map((r) => +r.b)));
    const sh = await this._goeShares(a, b);
    return rows.map((r) => {
      const len = Math.max(60, Math.min(r.lz || (r.b - r.a) / 1000, (r.b - r.a) / 1000)), end = +r.a + len * 1000;
      let t = +r.a, pv = 0, known = 0; const hours = [];
      while (t < end) { const h = new Date(t); h.setMinutes(0, 0, 0); const nx = Math.min(end, +h + 36e5), part = (nx - t) / (len * 1000), x = sh[+h], k = r.kwh * part; if (x) { pv += k * x.f; known += part; } hours.push([Math.floor(+h / 1000), k, x ? k * x.f : null]); t = nx; }
      const ok = known > 0.5, f = ok ? pv / (r.kwh * known) : 0;
      /* Stunden ohne bekannte Herkunft: mittlerer Sonnenanteil der Ladung */
      return { ...r, pv: ok ? r.kwh * f : 0, pvest: true, pvok: ok, hours: hours.map(([ts, k, p]) => [ts, +k.toFixed(4), +(p != null ? p : k * f).toFixed(4)]) };
    });
  }
  /* Import nur anbieten, wenn im Store ein go-e Charger verbunden ist (gleiche Regel wie die Store-Kachel „go-e Charger“) */
  _goeOn() { const c = this._wb(); return !!(c && c.ip) && !this._wbHa(c); }
  _goeOpen() { if (!this._goeOn()) { this._toast("Zuerst im Store einen go-e Charger verbinden"); return; } this._modal = { type: "wbgoe", step: "pick" }; this._renderModal(); }
  _goePick() {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".csv,text/csv";
    inp.onchange = () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = async () => {
        const P = this._goeCsv(rd.result), m = this._modal; if (!m || m.type !== "wbgoe") return;
        if (P.err) { m.err = P.err; this._renderModal(); return; }
        m.step = "busy"; m.err = ""; m.file = f.name; this._renderModal();
        const rows = await this._goeEstimate(P.rows);
        const send = rows.map((r) => ({ gid: r.gid, start: this._goeIso(r.a), end: this._goeIso(r.b), kwh: r.kwh, pv: r.pvok ? r.pv : 0, pvest: true, card: r.card, hours: r.hours }));
        this._hass.callWS({ type: "fenster_heizung/wb_import", rows: send }).then((res) => {
          const ok = rows.reduce((o, r) => { o[r.gid + r.a] = r.pvok; return o; }, {});
          m.step = "preview"; m.send = send; m.res = res; m.pvok = ok; m.take = true; this._renderModal();
        }).catch(() => { m.step = "pick"; m.err = "Modul 8 konnte die Ladungen gerade nicht prüfen."; this._renderModal(); });
      };
      rd.readAsText(f, "utf-8");
    };
    inp.click();
  }
  _goeModal() {
    const m = this._modal, close = `<button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button>`;
    const wrap = (sub, body) => `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true"><div class="sh"><div><b>${this._gx("meter", 22)} Aus go-e importieren</b><span>${sub}</span></div>${close}</div>${body}</div>`;
    if (m.step === "busy") return wrap(esc(m.file || ""), `<div class="card empty">Ladungen werden gelesen und mit Modul 8 abgeglichen …</div>`);
    if (m.step === "done") return wrap("Fertig", `<div class="goeok">${ic("check", 26)}<b>${m.done.new + (m.done.restored || 0)} ${m.done.new + (m.done.restored || 0) === 1 ? "Ladung" : "Ladungen"} übernommen${m.done.fixed ? ` · ${m.done.fixed} ${m.done.fixed === 1 ? "Menge" : "Mengen"} angeglichen` : ""}</b><span>Sie stehen jetzt in der Ladestatistik, markiert mit „go-e“. Jede Ladung lässt sich wie gewohnt bearbeiten.</span></div><div class="gbtns" style="margin-top:12px"><button class="btn2 pri" data-act="close">Schließen</button></div>`);
    if (m.step === "preview") {
      const R = m.res.rows || [], cnt = (k) => R.filter((x) => x.st === k).length, nNew = cnt("new") + cnt("restore"), nDiff = cnt("diff");
      const tag = { new: ["g", "Neu"], restore: ["g", "zurück in die Liste"], dup: ["", "schon da"], diff: ["a", "Menge anders"], open: ["", "läuft gerade"], bad: ["x", "unlesbar"] };
      const f2 = (v) => num(v, 2), dt = (s) => new Date(s).toLocaleString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
      const list = R.map((x) => { const [c, l] = tag[x.st] || ["", x.st];
        return `<div class="goer ${x.st}"><div class="goet"><b>${esc(dt(x.start))}</b><small>${esc(x.card || "ohne Karte")} → ${esc(x.veh)}${!x.assigned && (x.st === "new" || x.st === "restore") ? ` <em class="goew">kein Fahrzeug</em>` : ""}</small></div>
          <div class="goev"><b>${f2(x.kwh)} kWh</b><small>${x.st === "diff" ? `Modul 8: ${f2(x.have_kwh)} kWh` : x.st === "new" || x.st === "restore" ? (x.pv > 0 ? `≈ ${f2(x.pv)} kWh Sonne` : "Sonne unbekannt") : ""}</small>${(x.st === "new" || x.st === "restore") && x.cost != null ? `<small class="goep">${f2(x.cost)} € · ${num(x.ct, 1)} ct (${esc(x.psrc || "")})</small>` : ""}</div><em class="goes ${c}">${l}</em></div>`; }).join("");
      return wrap(`${esc(m.file || "")} · ${R.length} Ladungen`, `<div class="goesum"><div><small>Neu</small><b class="gn">${nNew}</b></div><div><small>Schon in Modul 8</small><b>${cnt("dup") + nDiff}</b></div><div><small>Menge anders</small><b class="${nDiff ? "wa" : ""}">${nDiff}</b></div></div>
        ${(() => { const un = [...new Set(R.filter((x) => (x.st === "new" || x.st === "restore") && !x.assigned).map((x) => x.card || ""))]; if (!un.length) return "";
          const names = (this._wb().vehicles || []).map((v) => v.name); if (!names.length) return "";
          return `<div class="goeun"><b>${ic("alert", 15)} ${un.length === 1 ? "Eine Karte ist" : un.length + " Karten sind"} keinem Fahrzeug zugeordnet</b><span>Ohne Auswahl zählen diese Ladungen als „Gastfahrzeug“ bzw. „Unbekannt“.</span>${un.map((c) => `<div class="goeunr"><em>${esc(c || "ohne Karte")}</em><div class="gschips">${names.map((nm) => `<button class="gsch ${(m.vmap || {})[c] === nm ? "sel" : ""}" data-act="wbgoemap" data-k="${esc(c)}" data-v="${esc(nm)}">${esc(nm)}</button>`).join("")}</div></div>`).join("")}</div>`; })()}
        <div class="goel">${list}</div>
        ${nDiff ? `<div class="vrow" style="margin-top:8px"><span>Mengen an go-e angleichen<small class="mut" style="display:block">go-e misst mit dem eigenen Zähler – bei abweichenden Ladungen die Menge aus go-e übernehmen (steht im Änderungsverlauf)</small></span><button class="sw ${m.take ? "on" : ""}" data-act="wbgoetake" aria-pressed="${!!m.take}" aria-label="Mengen angleichen"></button></div>` : ""}
        ${cnt("restore") ? `<div class="gst" style="margin-top:8px">${ic("info", 15)}<span>${cnt("restore")} ${cnt("restore") === 1 ? "Ladung wurde" : "Ladungen wurden"} schon einmal importiert, fielen aber aus der Liste (bis 2026.11.3b31 hielt Modul 8 nur 100 Ladungen). Sie kommen zurück in die Liste, ohne die Tageswerte doppelt zu zählen.</span></div>` : ""}
        <div class="mut sm" style="margin-top:8px">Sonne ist geschätzt: aus der Herkunft des Hausstroms in den Stunden der Ladung (Haus-Energiebuch oder Statistik), Ladung ab Start mit gleichmäßiger Leistung. Kosten mit dem damaligen Preis je Stunde, nur für den Netzanteil – aus dem Vertrag (Modul 20), von Tibber, aus dem Verlauf des Preis-Sensors oder der Festpreis; fehlt das, der heutige Preis. In Klammern steht, woher er kommt. Neue Ladungen zählen am Starttag.</div>
        <div class="gbtns" style="margin-top:12px"><button class="btn2" data-act="wbgoepick">${ic("upload", 16)} Andere Datei</button><button class="btn2 pri" data-act="wbgoego" ${nNew || (nDiff && m.take) ? "" : "disabled"}>${ic("check", 16)} ${nNew} ${nNew === 1 ? "Ladung" : "Ladungen"} übernehmen${nDiff && m.take ? ` · ${nDiff} angleichen` : ""}</button></div>`);
    }
    return wrap("Ladelog aus der go-e-App", `<ol class="goesteps"><li>go-e-App öffnen → <b>Laden</b> → <b>Einzelheiten</b> → <b>Energie pro Benutzer</b>.</li><li><b>Download</b> → Zeitraum wählen → <b>Download CSV</b>.</li><li>Die Datei hier auswählen. Du siehst vorher, was neu ist und was Modul 8 schon kennt.</li></ol>
      <div class="tmerr" role="alert">${esc(m.err || "")}</div>
      <div class="gbtns" style="margin-top:8px"><button class="btn2 pri" data-act="wbgoepick">${ic("upload", 16)} CSV-Datei wählen</button></div>
      <div class="mut sm" style="margin-top:10px">Die Datei wird nur hier gelesen. Die Spalte „Link“ (Zugang zu go-e) wird verworfen. Die Ladekarte ordnet das Fahrzeug zu wie in Modul 8 eingestellt.</div>`);
  }
  _goeAct(a, b) {
    const m = this._modal;
    if (a === "wbgoe") { this._goeOpen(); return true; }
    if (!m || m.type !== "wbgoe") return false;
    if (a === "wbgoepick") { this._goePick(); return true; }
    if (a === "wbgoetake") { m.take = !m.take; this._renderModal(); return true; }
    if (a === "wbgoemap") {
      const c = b.dataset.k || "", v = b.dataset.v || ""; m.vmap = m.vmap || {}; if (m.vmap[c] === v) delete m.vmap[c]; else m.vmap[c] = v;
      m.send = m.send.map((r) => ({ ...r, veh_set: m.vmap[r.card || ""] || "" }));
      this._hass.callWS({ type: "fenster_heizung/wb_import", rows: m.send }).then((res) => { m.res = res; this._renderModal(); }).catch(() => this._toast("Das ging nicht"));
      return true;
    }
    if (a === "wbgoego") {
      m.step = "busy"; this._renderModal();
      this._hass.callWS({ type: "fenster_heizung/wb_import", rows: m.send, apply: true, take_kwh: !!m.take }).then((r) => { m.step = "done"; m.done = r; this._wbStatLoad && this._wbStatLoad(true); this._renderModal(); })
        .catch(() => { m.step = "preview"; this._toast("Das ging nicht"); this._renderModal(); });
      return true;
    }
    return false;
  }
