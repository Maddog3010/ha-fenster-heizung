  /* ================= Modul 8 · v0.9 Vorabversion (Konzept „Modul 8 – Neue Optik“, Stufe 4) =================
     C6 Anwesenheit (wer fährt das Auto?) · C7 Ladenachweis je Karte/Fahrzeug (CSV und Drucken/PDF) · A11 Startseite
     · Ladungen in der Ladestatistik bearbeiten (Fahrzeug, Menge, Karte, dienstlich, Notiz, löschen). */
  _evAway(v) {
    const p = v && v.person, st = p ? this._hass.states[p] : null;
    if (!st) return null;
    const home = st.state === "home", nm = st.attributes.friendly_name || p.replace("person.", "");
    return { home, name: nm, zone: home ? "" : st.state === "not_home" ? "" : st.state };
  }
  /* C7: Ladenachweis – Ladungen eines Monats je Karte oder Fahrzeug mit Erstattungsbetrag */
  _wbPdfRows(o) {
    const D = (this._wbStD && this._wbStD.data) || {}, a = new Date(o.y, o.m, 1), b = new Date(o.y, o.m + 1, 1);
    return (D.sessions || []).filter((x) => { const t = new Date(x.start); return t >= a && t < b && !x.running && (o.f === "all" || (o.f === "biz" ? !!x.biz : o.f.startsWith("c:") ? x.card === o.f.slice(2) : x.veh === o.f.slice(2))); })
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
      <div class="gschips">${chip("all", "Alle Ladungen")}${(D.sessions || []).some((x) => x.biz) ? chip("biz", "Nur dienstlich") : ""}${vehs.map((v) => chip("v:" + v, v)).join("")}${cards.map((k) => chip("c:" + k, "Karte " + k)).join("")}</div>
      <div class="vrow"><span>Erstattung je kWh<small class="mut" style="display:block">Zum Beispiel der Satz deines Arbeitgebers.</small></span><span style="flex:none;display:flex;align-items:center;gap:6px"><input class="otxt" style="width:84px;text-align:right" type="text" inputmode="decimal" data-f="wbpdfct" value="${num(P.ct, 2)}" aria-label="Cent je kWh"> ct</span></div>
      <div class="vrow"><span>Name auf dem Nachweis<small class="mut" style="display:block">Optional.</small></span><input class="otxt" style="max-width:220px" type="text" maxlength="60" data-f="wbpdfname" value="${esc(P.name)}" placeholder="Name" aria-label="Name auf dem Nachweis"></div>
      <div class="evpdft">${R.length ? `<table><thead><tr><th>Datum</th><th>Fahrzeug</th><th>Karte</th><th>kWh</th><th>€</th></tr></thead><tbody>${R.map((x) => `<tr><td>${fd(x.start)}</td><td>${esc(x.veh || "")}${x.biz ? `<em class="evtag">dienstlich</em>` : ""}${x.note ? `<small class="mut" style="display:block">${esc(x.note)}</small>` : ""}</td><td>${esc(x.card || "–")}</td><td>${num(x.kwh, 2)}${x.orig != null ? `<sup title="Gemessen: ${num(x.orig, 2)} kWh">*</sup>` : ""}</td><td>${num(x.kwh * P.ct / 100, 2)}</td></tr>`).join("")}</tbody>
        <tfoot><tr><td colspan="3"><b>Summe · ${R.length} ${R.length === 1 ? "Ladung" : "Ladungen"}</b></td><td><b>${num(kwh, 2)}</b></td><td><b>${num(eur, 2)}</b></td></tr></tfoot></table>` : `<div class="mut sm">In diesem Monat gibt es keine passenden Ladungen.</div>`}</div>
      <div class="mut sm" style="margin-top:6px">Gemessen an der Wallbox. Gespeichert werden die letzten 100 Ladungen.${R.some((x) => x.orig != null) ? " * Von Hand geändert – der gemessene Wert steht im Nachweis." : ""}</div>
      <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="wbvpdfcsv" ${R.length ? "" : "disabled"}>${ic("check", 16)} CSV</button><button class="btn2 pri" data-act="wbvpdfprint" ${R.length ? "" : "disabled"}>${ic("check", 16)} Als PDF speichern</button></div></div>`;
  }
  _wbPdfAct(a, b) {
    const m = this._modal, c = this._wb(), P = c.pdf || { ct: 30, name: "" }, k = b.dataset.k;
    if (a === "wbvpdf") { const S = this._evSt ? this._evSt() : { at: new Date() }, t = new Date(S.at); this._modal = { type: "wbpdf", y: t.getFullYear(), m: t.getMonth(), f: "all" }; this._renderModal(); return; }
    if (a === "wbvpdff") { m.f = k; this._renderModal(); return; }
    if (a === "wbvpdfm") { const t = new Date(m.y, m.m + Number(k), 1); m.y = t.getFullYear(); m.m = t.getMonth(); this._renderModal(); return; }
    const R = this._wbPdfRows(m), MON = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"], f2 = (v) => Number(v).toFixed(2).replace(".", ",");
    const who = m.f === "all" ? "alle Ladungen" : m.f === "biz" ? "dienstliche Ladungen" : m.f.startsWith("c:") ? "Karte " + m.f.slice(2) : m.f.slice(2), fn = `ladenachweis-${m.y}-${String(m.m + 1).padStart(2, "0")}`;
    const save = (blob, name) => { try { const u = URL.createObjectURL(blob), el = document.createElement("a"); el.href = u; el.download = name; document.body.appendChild(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); } catch (e) { this._toast("Speichern nicht möglich"); } };
    if (a === "wbvpdfcsv") {
      const rows = [["Datum", "Uhrzeit", "Fahrzeug", "Karte", "kWh", "Cent je kWh", "Betrag EUR", "Dienstlich", "Notiz", "Gemessen kWh (falls geändert)"], ...R.map((x) => { const t = new Date(x.start); return [t.toLocaleDateString("de-DE"), t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }), x.veh || "", x.card || "", f2(x.kwh), f2(P.ct), f2(x.kwh * P.ct / 100), x.biz ? "ja" : "", x.note || "", x.orig != null ? f2(x.orig) : ""]; })];
      save(new Blob(["﻿" + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" }), fn + ".csv"); this._toast("Ladenachweis als CSV gespeichert"); return;
    }
    if (a === "wbvpdfprint") {
      const kwh = R.reduce((s, x) => s + x.kwh, 0), ch = R.filter((x) => x.orig != null);
      const rows = R.map((x) => { const t = new Date(x.start); return { date: `${t.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })} ${t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`,
        veh: `${x.veh || ""}${x.biz ? " · dienstlich" : ""}`, card: x.card || "–", kwh: f2(x.kwh) + (x.orig != null ? "*" : ""), eur: f2(x.kwh * P.ct / 100), note: x.note || "" }; });
      try {
        const bytes = this._wbPdfDoc({ title: `Ladenachweis ${MON[m.m]} ${m.y}`, sub: `${P.name ? P.name + " · " : ""}${who} · Erstattung ${f2(P.ct)} ct/kWh`, rows,
          sum: { label: `Summe · ${R.length} ${R.length === 1 ? "Ladung" : "Ladungen"}`, kwh: f2(kwh), eur: f2(kwh * P.ct / 100) + " €" },
          notes: [...(ch.length ? [`* Von Hand geändert. Gemessen: ${ch.map((x) => `${new Date(x.start).toLocaleDateString("de-DE")} ${f2(x.orig)} kWh`).join(", ")}.`] : []), `Gemessen an der Wallbox, erstellt mit Strom & Wärme am ${new Date().toLocaleDateString("de-DE")}.`],
          foot: `Ladenachweis ${MON[m.m]} ${m.y}${P.name ? " · " + P.name : ""}` });
        save(new Blob([bytes], { type: "application/pdf" }), fn + ".pdf"); this._toast("Ladenachweis als PDF gespeichert");
      } catch (err) { this._toast("PDF konnte nicht erstellt werden"); }
    }
  }
  /* A11: Startseite – Kachel und Bubble aus denselben Werten wie Modul 8 (Fahrzeug, Schätzung, Wallbox) */
  _evStartK() {
    const d = this._evData(); if (!d.any || d.soc == null) return null;
    const N = this._evNow(d), sun = N.sun != null ? ` · ${num(N.sun, 0)} % Sonne` : "";
    return { soc: d.soc, est: !!d.est, chg: d.charging, plug: d.plugged, l1: d.charging ? `lädt${d.power != null ? " " + num(d.power / 1000, 1) + " kW" : ""}${sun}` : d.plugged ? "angesteckt" : (() => { const a = this._evAway(d.veh); return a && !a.home ? `unterwegs · ${a.name}` : "Ladestand"; })(),
      l2: d.charging && N.doneT ? `→ ${N.goal} % ca. ${N.doneT}` : d.range != null ? `${num(d.range, 0)} km` : "", name: d.veh ? d.veh.name : "" };
  }
  /* Ladestatistik: eine abgeschlossene Ladung bearbeiten. Die gemessene Menge bleibt erhalten und wird im Nachweis gezeigt. */
  _sesFind(start) { const D = (this._wbStD && this._wbStD.data) || {}; return (D.sessions || []).find((x) => x.start === start && !x.running) || null; }
  _sesGrab() {
    const m = this._modal, q = (f) => this.shadowRoot.querySelector(`[data-f="${f}"]`);
    if (!m || m.type !== "wbses") return;
    const k = q("wbseskwh"), c = q("wbsescard"), n = q("wbsesnote");
    if (k) m.kwh = k.value; if (c) m.card = c.value; if (n) m.note = n.value;
  }
  _sesModal() {
    const m = this._modal, x = this._sesFind(m.start);
    if (!x) return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Ladung</b><span>Nicht mehr vorhanden</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div><div class="mut sm">Diese Ladung wurde gelöscht oder ist älter als die letzten 100 Ladungen.</div></div>`;
    const t = new Date(x.start), c = this._wb(), names = [...new Set([...(c.vehicles || []).map((v) => v.name), x.veh, "Unbekannt"].filter(Boolean))];
    const s2 = x.kwh > 0 ? x.pv / x.kwh * 100 : 0, dur = x.min ? (x.min >= 60 ? num(x.min / 60, 1) + " h" : num(x.min, 0) + " Min.") : "";
    const chip = (n) => `<button class="gsch ${m.veh === n ? "sel" : ""}" data-act="wbvsesveh" data-k="${esc(n)}" aria-pressed="${m.veh === n}">${esc(n)}</button>`;
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Ladung bearbeiten">
      <div class="sh"><div><b>Ladung bearbeiten</b><span>${t.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}, ${t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr${dur ? " · " + dur : ""}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="evsesh"><span><small>Gemessen</small><b>${num(x.orig != null ? x.orig : x.kwh, 2)} kWh</b></span><span><small>Sonne</small><b>${num(s2, 0)} %</b></span><span><small>Kosten</small><b>${num(x.cost, 2)} €</b></span></div>
      <div class="lsec">${ic("car", 15)}Fahrzeug</div>
      <div class="gschips">${names.map(chip).join("")}</div>
      <div class="vrow"><span>Geladene Menge<small class="mut" style="display:block">${x.orig != null ? `Von Hand geändert. Gemessen wurden ${num(x.orig, 2)} kWh.` : "Nur ändern, wenn die Wallbox falsch gemessen hat."}</small></span><span style="flex:none;display:flex;align-items:center;gap:6px"><input class="otxt" style="width:96px;text-align:right" type="text" inputmode="decimal" data-f="wbseskwh" value="${esc(m.kwh)}" aria-label="Geladene Menge in kWh"> kWh</span></div>
      <div class="vrow"><span>Karte<small class="mut" style="display:block">Leer lassen für „ohne Karte“.</small></span><input class="otxt" style="max-width:200px" type="text" maxlength="30" data-f="wbsescard" value="${esc(m.card)}" placeholder="ohne Karte" aria-label="Karte"></div>
      <div class="vrow"><span>Dienstlich<small class="mut" style="display:block">Für den Ladenachweis an den Arbeitgeber.</small></span><button class="sw ${m.biz ? "on" : ""}" data-act="wbvsesbiz" aria-pressed="${!!m.biz}" aria-label="Dienstlich"></button></div>
      <div class="vrow" style="display:block"><span>Notiz</span><input class="otxt" style="width:100%;margin-top:6px" type="text" maxlength="80" data-f="wbsesnote" value="${esc(m.note)}" placeholder="z. B. Gast geladen, Fahrt nach Hamburg" aria-label="Notiz"></div>
      ${(x.chg && x.chg.length) || x.edit ? `<div class="lsec" style="margin-top:12px">${ic("schedule", 15)}Änderungen</div><div class="evchg">${(x.chg || []).slice().reverse().map((c) => `<div><small>${new Date(c.t).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</small><ul>${c.x.map((y) => `<li>${esc(y)}</li>`).join("")}</ul></div>`).join("") || `<div><small>${new Date(x.edit).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</small><ul><li>bearbeitet (vor diesem Update, Einzelheiten nicht gespeichert)</li></ul></div>`}${x.orig != null ? `<div class="mut sm">Gemessen an der Wallbox: ${num(x.orig, 2)} kWh</div>` : ""}</div>` : ""}
      ${(() => { const P = this._sesPrev(x); if (!P) return ""; const tp = new Date(P.start); return `<div class="evmrg">${ic("link", 16)}<span><b>Gehört zur Ladung davor?</b><small>Ladung ab ${tp.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr${tp.toDateString() !== t.toDateString() ? " (" + tp.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) + ")" : ""} · ${num(P.kwh, 1)} kWh · ${esc(P.veh)}. Zum Beispiel nach einem Phasenwechsel getrennt gezählt.</small></span><button class="btn2" data-act="wbvsesmrg" ${m.busy ? "disabled" : ""}>Zusammenführen</button></div>`; })()}
      <div class="foot2" style="margin-top:12px">${m.del ? `<button class="btn2 dng" data-act="wbvsesdel2">${ic("trash", 16)} Wirklich löschen</button>` : `<button class="btn2" data-act="wbvsesdel">${ic("trash", 16)} Löschen</button>`}<button class="btn2 pri" data-act="wbvsesok" ${m.busy ? "disabled" : ""}>${ic("check", 16)} Speichern</button></div></div>`;
  }
  /* Teil davor (älter, gleiches Fahrzeug, höchstens 12 Stunden dazwischen) – wie merge_prev im Backend */
  _sesPrev(x) {
    const L = ((this._wbStD && this._wbStD.data) || {}).sessions || [], i = L.findIndex((y) => y.start === x.start), p = i >= 0 ? L[i + 1] : null;
    if (!p || p.running || x.running || p.veh !== x.veh) return null;
    const gap = (new Date(x.start) - (new Date(p.start).getTime() + (p.min || 0) * 6e4)) / 36e5;
    return gap >= -0.1 && gap <= 12 ? p : null;
  }
  _sesAct(a, b) {
    if (a === "wbvses") {
      const x = this._sesFind(b.dataset.k); if (!x) return;
      if (!this._admin()) { this._toast("Nur Administratoren können Ladungen bearbeiten"); return; }
      this._modal = { type: "wbses", start: x.start, veh: x.veh || "Unbekannt", kwh: num(x.kwh, 2), kwh0: num(x.kwh, 2), card: x.card || "", note: x.note || "", biz: !!x.biz, del: false }; this._renderModal(); return;
    }
    const m = this._modal; if (!m || m.type !== "wbses") return;
    this._sesGrab();
    if (a === "wbvsesveh") { m.veh = b.dataset.k; this._renderModal(); return; }
    if (a === "wbvsesbiz") { m.biz = !m.biz; this._renderModal(); return; }
    if (a === "wbvsesdel") { m.del = true; this._renderModal(); return; }
    const send = (body, msg) => { m.busy = true; this._renderModal();
      this._hass.callWS({ type: "fenster_heizung/wb_session", start: m.start, ...body }).then((r) => { this._wbStD = { data: r || {}, ts: Date.now() }; this._modal = null; this._renderModal(); this._render(); this._toast(msg); })
        .catch(() => { m.busy = false; this._renderModal(); this._toast("Ladung konnte nicht gespeichert werden"); }); };
    if (a === "wbvsesdel2") { send({ delete: true }, "Ladung gelöscht"); return; }
    if (a === "wbvsesmrg") { send({ merge: true }, "Ladungen zusammengeführt"); return; }
    if (a === "wbvsesok") {
      const x = this._sesFind(m.start), k = parseFloat(String(m.kwh).replace(",", "."));
      if (!isFinite(k) || k < 0 || k > 300) { this._toast("Bitte eine Menge von 0 bis 300 kWh eingeben"); return; }
      const body = { veh: m.veh, card: String(m.card || "").trim(), note: String(m.note || "").trim(), biz: !!m.biz };
      if (String(m.kwh).trim() !== m.kwh0) body.kwh = k; // nur senden, wenn wirklich geändert (sonst würde die Rundung als Änderung zählen)
      send(body, "Ladung gespeichert");
    }
  }
  /* „Unbekannt“ im angezeigten Zeitraum einem Fahrzeug zuordnen */
  _asgModal() {
    const m = this._modal, cv = this._wb().vehicles || [], a = new Date(m.d0), b = new Date(m.d1 - 864e5), D = (this._wbStD && this._wbStD.data) || {};
    const iso = (t) => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`, k0 = iso(a), k1 = iso(b);
    const kwh = (D.days || []).filter((d) => d.d >= k0 && d.d <= k1).reduce((s, d) => s + ((d.veh || {}).Unbekannt ? d.veh.Unbekannt.kwh : 0), 0), n = (D.sessions || []).filter((x) => !x.running && x.veh === "Unbekannt" && x.start.slice(0, 10) >= k0 && x.start.slice(0, 10) <= k1).length;
    const fd = (t) => t.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Unbekannt zuordnen">
      <div class="sh"><div><b>„Unbekannt“ zuordnen</b><span>${k0 === k1 ? fd(a) : `${fd(a)} – ${fd(b)}`} · ${num(kwh, 1)} kWh${n ? ` · ${n} ${n === 1 ? "Ladung" : "Ladungen"}` : ""}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut sm" style="margin-bottom:10px">Ladungen, bei denen die Wallbox kein Fahrzeug erkannt hat, werden dem gewählten Fahrzeug zugeschrieben – in der Statistik, bei den Kosten je Fahrzeug und im Ladenachweis. Jede Ladung bekommt einen Eintrag unter „Änderungen“.</div>
      <div class="gschips">${cv.map((v) => `<button class="gsch ${m.to === v.name ? "sel" : ""}" data-act="wbvasgto" data-k="${esc(v.name)}" aria-pressed="${m.to === v.name}">${esc(v.name)}</button>`).join("")}</div>
      <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="wbvasgok" ${m.to && !m.busy ? "" : "disabled"}>${ic("check", 16)} ${m.to ? `${esc(m.to)} zuordnen` : "Fahrzeug wählen"}</button></div></div>`;
  }
  _asgAct(a, b) {
    if (a === "wbvasg") { const cv = this._wb().vehicles || []; this._modal = { type: "wbasg", d0: Number(b.dataset.k), d1: Number(b.dataset.e), to: cv.length === 1 ? cv[0].name : "" }; this._renderModal(); return; }
    const m = this._modal; if (!m || m.type !== "wbasg") return;
    if (a === "wbvasgto") { m.to = b.dataset.k; this._renderModal(); return; }
    if (a === "wbvasgok" && m.to) {
      const iso = (t) => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
      m.busy = true; this._renderModal();
      this._hass.callWS({ type: "fenster_heizung/wb_assign", d0: iso(new Date(m.d0)), d1: iso(new Date(m.d1 - 864e5)), to: m.to }).then((r) => { this._wbStD = { data: r || {}, ts: Date.now() }; this._modal = null; this._renderModal(); this._render(); this._toast("Zugeordnet"); })
        .catch(() => { m.busy = false; this._renderModal(); this._toast("Zuordnen nicht möglich"); });
    }
  }

