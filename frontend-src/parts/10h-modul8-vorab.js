  /* ================= Modul 8 · v0.9 Vorabversion (Konzept „Modul 8 – Neue Optik“, Stufe 4) =================
     C6 Anwesenheit (wer fährt das Auto?) · C7 Ladenachweis je Karte/Fahrzeug (CSV und Drucken/PDF) · A11 Startseite. */
  _evAway(v) {
    const p = v && v.person, st = p ? this._hass.states[p] : null;
    if (!st) return null;
    const home = st.state === "home", nm = st.attributes.friendly_name || p.replace("person.", "");
    return { home, name: nm, zone: home ? "" : st.state === "not_home" ? "" : st.state };
  }
  /* C7: Ladenachweis – Ladungen eines Monats je Karte oder Fahrzeug mit Erstattungsbetrag */
  _wbPdfRows(o) {
    const D = (this._wbStD && this._wbStD.data) || {}, a = new Date(o.y, o.m, 1), b = new Date(o.y, o.m + 1, 1);
    return (D.sessions || []).filter((x) => { const t = new Date(x.start); return t >= a && t < b && !x.running && (o.f === "all" || (o.f.startsWith("c:") ? x.card === o.f.slice(2) : x.veh === o.f.slice(2))); })
      .sort((x, y) => x.start.localeCompare(y.start));
  }
  _wbPdfModal() {
    this._wbStatLoad();
    const m = this._modal, c = this._wb(), P = c.pdf || { ct: 30, name: "" }, D = (this._wbStD && this._wbStD.data) || {}, MON = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    const vehs = [...new Set((D.sessions || []).map((x) => x.veh).filter(Boolean))], cards = [...new Set((D.sessions || []).map((x) => x.card).filter(Boolean))];
    const R = this._wbPdfRows(m), kwh = R.reduce((s, x) => s + x.kwh, 0), eur = kwh * P.ct / 100, fd = (iso) => new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    const chip = (f, t) => `<button class="gsch ${m.f === f ? "sel" : ""}" data-act="wbvpdff" data-k="${esc(f)}" aria-pressed="${m.f === f}">${esc(t)}</button>`;
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Ladenachweis</b><span>Ladungen eines Monats, z. B. für die Erstattung beim Arbeitgeber</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="evnav" style="margin:4px 0 10px"><button data-act="wbvpdfm" data-k="-1" aria-label="Vormonat">‹</button><b>${MON[m.m]} ${m.y}</b><button data-act="wbvpdfm" data-k="1" aria-label="Nächster Monat">›</button></div>
      <div class="gschips">${chip("all", "Alle Ladungen")}${vehs.map((v) => chip("v:" + v, v)).join("")}${cards.map((k) => chip("c:" + k, "Karte " + k)).join("")}</div>
      <div class="vrow"><span>Erstattung je kWh<small class="mut" style="display:block">Zum Beispiel der Satz deines Arbeitgebers.</small></span><span style="flex:none;display:flex;align-items:center;gap:6px"><input class="otxt" style="width:84px;text-align:right" type="text" inputmode="decimal" data-f="wbpdfct" value="${num(P.ct, 2)}" aria-label="Cent je kWh"> ct</span></div>
      <div class="vrow"><span>Name auf dem Nachweis<small class="mut" style="display:block">Optional.</small></span><input class="otxt" style="max-width:220px" type="text" maxlength="60" data-f="wbpdfname" value="${esc(P.name)}" placeholder="Name" aria-label="Name auf dem Nachweis"></div>
      <div class="evpdft">${R.length ? `<table><thead><tr><th>Datum</th><th>Fahrzeug</th><th>Karte</th><th>kWh</th><th>€</th></tr></thead><tbody>${R.map((x) => `<tr><td>${fd(x.start)}</td><td>${esc(x.veh || "")}</td><td>${esc(x.card || "–")}</td><td>${num(x.kwh, 2)}</td><td>${num(x.kwh * P.ct / 100, 2)}</td></tr>`).join("")}</tbody>
        <tfoot><tr><td colspan="3"><b>Summe · ${R.length} ${R.length === 1 ? "Ladung" : "Ladungen"}</b></td><td><b>${num(kwh, 2)}</b></td><td><b>${num(eur, 2)}</b></td></tr></tfoot></table>` : `<div class="mut sm">In diesem Monat gibt es keine passenden Ladungen.</div>`}</div>
      <div class="mut sm" style="margin-top:6px">Gemessen an der Wallbox. Gespeichert werden die letzten 100 Ladungen.</div>
      <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="wbvpdfcsv" ${R.length ? "" : "disabled"}>${ic("check", 16)} CSV</button><button class="btn2 pri" data-act="wbvpdfprint" ${R.length ? "" : "disabled"}>${ic("check", 16)} Drucken / als PDF sichern</button></div></div>`;
  }
  _wbPdfAct(a, b) {
    const m = this._modal, c = this._wb(), P = c.pdf || { ct: 30, name: "" }, k = b.dataset.k;
    if (a === "wbvpdf") { const S = this._evSt ? this._evSt() : { at: new Date() }, t = new Date(S.at); this._modal = { type: "wbpdf", y: t.getFullYear(), m: t.getMonth(), f: "all" }; this._renderModal(); return; }
    if (a === "wbvpdff") { m.f = k; this._renderModal(); return; }
    if (a === "wbvpdfm") { const t = new Date(m.y, m.m + Number(k), 1); m.y = t.getFullYear(); m.m = t.getMonth(); this._renderModal(); return; }
    const R = this._wbPdfRows(m), MON = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"], f2 = (v) => Number(v).toFixed(2).replace(".", ",");
    const who = m.f === "all" ? "alle Ladungen" : m.f.startsWith("c:") ? "Karte " + m.f.slice(2) : m.f.slice(2), fn = `ladenachweis-${m.y}-${String(m.m + 1).padStart(2, "0")}`;
    const save = (blob, name) => { try { const u = URL.createObjectURL(blob), el = document.createElement("a"); el.href = u; el.download = name; document.body.appendChild(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); } catch (e) { this._toast("Speichern nicht möglich"); } };
    if (a === "wbvpdfcsv") {
      const rows = [["Datum", "Uhrzeit", "Fahrzeug", "Karte", "kWh", "Cent je kWh", "Betrag EUR"], ...R.map((x) => { const t = new Date(x.start); return [t.toLocaleDateString("de-DE"), t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }), x.veh || "", x.card || "", f2(x.kwh), f2(P.ct), f2(x.kwh * P.ct / 100)]; })];
      save(new Blob(["﻿" + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" }), fn + ".csv"); this._toast("Ladenachweis als CSV gespeichert"); return;
    }
    if (a === "wbvpdfprint") {
      const kwh = R.reduce((s, x) => s + x.kwh, 0), e = (x) => String(x).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
      const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Ladenachweis ${MON[m.m]} ${m.y}</title><style>body{font:13px/1.45 system-ui,Segoe UI,Roboto,Arial,sans-serif;color:#111;margin:32px}h1{font-size:20px;margin:0 0 4px}p{margin:0 0 14px;color:#444}table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #ddd}th:nth-child(n+4),td:nth-child(n+4){text-align:right}tfoot td{text-align:right}tfoot td:first-child{text-align:left}tfoot td{font-weight:700;border-top:2px solid #111}small{color:#666}</style></head><body>
        <h1>Ladenachweis ${MON[m.m]} ${m.y}</h1><p>${P.name ? e(P.name) + " · " : ""}${e(who)} · Erstattung ${f2(P.ct)} ct/kWh</p>
        <table><thead><tr><th>Datum</th><th>Fahrzeug</th><th>Karte</th><th>kWh</th><th>Betrag €</th></tr></thead><tbody>${R.map((x) => { const t = new Date(x.start); return `<tr><td>${t.toLocaleDateString("de-DE")} ${t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</td><td>${e(x.veh || "")}</td><td>${e(x.card || "–")}</td><td>${f2(x.kwh)}</td><td>${f2(x.kwh * P.ct / 100)}</td></tr>`; }).join("")}</tbody>
        <tfoot><tr><td colspan="3">Summe · ${R.length} Ladungen</td><td>${f2(kwh)}</td><td>${f2(kwh * P.ct / 100)}</td></tr></tfoot></table><p style="margin-top:18px"><small>Gemessen an der Wallbox, erstellt mit Strom &amp; Wärme am ${new Date().toLocaleDateString("de-DE")}.</small></p></body></html>`;
      let w = null; try { w = window.open("", "_blank"); } catch (err) { w = null; }
      if (w && w.document) { w.document.write(html); w.document.close(); setTimeout(() => { try { w.focus(); w.print(); } catch (err) { /* Druckdialog nicht möglich */ } }, 300); }
      else { save(new Blob([html], { type: "text/html;charset=utf-8" }), fn + ".html"); this._toast("Als Datei gespeichert – öffnen und drucken"); }
    }
  }
  /* A11: Startseite – Kachel und Bubble aus denselben Werten wie Modul 8 (Fahrzeug, Schätzung, Wallbox) */
  _evStartK() {
    const d = this._evData(); if (!d.any || d.soc == null) return null;
    const N = this._evNow(d), sun = N.sun != null ? ` · ${num(N.sun, 0)} % Sonne` : "";
    return { soc: d.soc, est: !!d.est, chg: d.charging, plug: d.plugged, l1: d.charging ? `lädt${d.power != null ? " " + num(d.power / 1000, 1) + " kW" : ""}${sun}` : d.plugged ? "angesteckt" : (() => { const a = this._evAway(d.veh); return a && !a.home ? `unterwegs · ${a.name}` : "Ladestand"; })(),
      l2: d.charging && N.doneT ? `→ ${N.goal} % ca. ${N.doneT}` : d.range != null ? `${num(d.range, 0)} km` : "", name: d.veh ? d.veh.name : "" };
  }
