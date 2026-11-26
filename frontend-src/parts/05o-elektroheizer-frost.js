  /* ================= Modul 1 · Elektroheizer: Zusatzheizung bei Frost =================
     Je Heizer „Wann soll er heizen?“ (PV-Überschuss, Frost, Beides). Frost heizt mit Netzstrom, wenn es draußen unter der
     Frostgrenze und der Raum zu kalt ist; vor dem ersten Einschalten steht eine Sicherheitsabfrage. Für alle Heizer gelten
     Netzleistung und Preisgrenze (Preis aus Modul 14, nur mit dynamischem Tarif). Die Regelung steht in heater.py/pvlogic.py. */
  _frost() { return { ...FRDEF, ...((this._gen || {}).frost || {}) }; }
  _ehModeText(m) { return m === "frost" ? "bei Frost" : m === "both" ? "bei PV-Überschuss und Frost" : "mit PV-Überschuss"; }
  _ehFrostDraft(s = {}) {
    const n = (k, d) => (s[k] === undefined || s[k] === null || s[k] === "" || !isFinite(Number(s[k])) ? d : Number(s[k]));
    return { mode: s.mode === "frost" || s.mode === "both" ? s.mode : "pv", frost_out: n("frost_out", 0), frost_target: n("frost_target", 21), frost_wait: n("frost_wait", 20),
      frost_from: String(s.frost_from || "06:00").slice(0, 5), frost_to: String(s.frost_to || "22:00").slice(0, 5), frost_run: n("frost_run", 60), frost_day: n("frost_day", 8), frost_stage: n("frost_stage", 1), frost_ok: s.frost_ok === "on" || s.frost_ok === true };
  }
  _ehFrostData(d) {
    return { mode: d.mode, frost_out: d.frost_out, frost_target: d.frost_target, frost_wait: d.frost_wait, frost_from: d.frost_from, frost_to: d.frost_to, frost_run: d.frost_run, frost_day: d.frost_day, frost_stage: d.frost_stage, frost_ok: d.mode !== "pv" && d.frost_ok };
  }
  _ehFrostRows(d, room, W, row, step, tin) {
    const stage = Math.max(1, Math.min(W.length, d.frost_stage)), watt = W[stage - 1] || 0, F = this._frost(), many = W.length > 1 && d.entity.startsWith("climate.");
    const sensor = room && room.rtEid;
    return `<div class="ehfr"><div class="lsec">❄ Zusatzheizung bei Frost</div>
      ${sensor ? row("Raumsensor", "Pflicht. Ohne aktuelle Werte (2 Stunden) geht der Heizer aus.", `<span class="ehfrs">${ic("thermo", 15)}<b>${esc(this._wzName(room.rtEid))}</b></span>`) : `<div class="gbox">Für die Zusatzheizung braucht „${esc(room ? room.name : "der Raum")}“ einen Raumtemperatur-Sensor.${room ? `<button class="btn2" data-act="opt" data-id="${esc(room.id)}" style="width:100%;margin-top:8px">${ic("sliders", 15)} Raumeinstellungen öffnen</button>` : ""}</div>`}
      ${row("Frostgrenze draußen", "Zugeheizt wird nur, wenn es draußen kälter ist. Ende erst 1 °C darüber.", step("frost_out", "°C", 0.5, -20, 10, 1))}
      ${row("Zuheizen bis", "Start ab 0,5 °C darunter.", step("frost_target", "°C", 0.5, 10, 25, 1))}
      ${row("Wartezeit", "So lange muss der Raum zu kalt sein. Der Heizkörper bekommt zuerst Zeit.", step("frost_wait", "Min.", 5, 0, 120))}
      ${row("Uhrzeit ab", "Außerhalb bleibt der Heizer aus. Gleiche Zeiten = ganztägig.", tin("frost_from", "Frost erlaubt ab"))}${row("Uhrzeit bis", "", tin("frost_to", "Frost erlaubt bis"))}
      ${row("Höchstens am Stück", "Danach 15 Min. Pause.", step("frost_run", "Min.", 15, 15, 180))}
      ${row("Höchstens am Tag", "Danach bis Mitternacht aus.", step("frost_day", "Std.", 1, 1, 24))}
      ${many ? row("Leistungsstufe bei Frost", `Stufe ${stage} · ${wfmt(watt)}`, step("frost_stage", "", 1, 1, W.length)) : ""}
      ${watt > F.watt ? `<div class="gbox">${wfmt(watt)} liegen über der Netzleistung aller Heizer (${wfmt(F.watt)}). So heizt er bei Frost nicht. Ändern kannst du die Grenze in der Heizerliste.</div>` : `<div class="mut sm" style="margin:6px 0 0">Alle Frost-Heizer zusammen: höchstens ${wfmt(F.watt)}${F.price_on ? `, nur bis ${num(F.price, 1)} ct/kWh` : ""}. Einstellbar in der Heizerliste.</div>`}</div>`;
  }
  /* Sicherheitsabfrage vor dem ersten Einschalten */
  _ehConfirmModal(M, room, watt) {
    const items = ["Das Gerät hat Überhitzungs- und Kippschutz.", "Der Hersteller erlaubt den unbeaufsichtigten Betrieb.", `Die Steckdose ist für ${wfmt(watt)} ausgelegt, ohne Verlängerungskabel.`];
    return `<div class="ov" data-act="ehxcfno"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Zusatzheizung einschalten">
      <div class="sh"><div><b>Zusatzheizung einschalten?</b><span>${esc(M.d.name || "Elektroheizer")}${room ? " · " + esc(room.name) : ""}</span></div><button class="ibtn" data-act="ehxcfno" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut sm" style="margin:0 0 10px">Der Heizer läuft dann auch ohne Aufsicht und mit Netzstrom. Bitte bestätige:</div>
      ${items.map((t, i) => `<button class="ehchk${M.confirm[i] ? " on" : ""}" data-act="ehxcfchk" data-i="${i}" role="checkbox" aria-checked="${!!M.confirm[i]}"><i>${M.confirm[i] ? ic("check", 16) : ""}</i><span>${t}</span></button>`).join("")}
      <div class="gbox"><b>Empfohlen:</b> An der Steckdose ein automatisches Aus nach ${num(M.d.frost_run + 10)} Minuten einstellen. Das schützt, wenn Home Assistant ausfällt.</div>
      ${M.err ? `<div class="gbox" style="margin-top:10px">${esc(M.err)}</div>` : ""}
      <div class="foot2"><button class="btn2" data-act="ehxcfno">Abbrechen</button><button class="btn2 pri" data-act="ehxcfok" ${M.confirm.every(Boolean) && !M.busy ? "" : "disabled"}>Einschalten</button></div></div>`;
  }
  _ehFrostAct(a, b) {
    const M = this._modal, d = M.d;
    if (a === "ehxseg" && b.dataset.k === "mode") { if (b.dataset.v === "pv") d.frost_ok = false; return false; }
    if (a === "ehxcfchk") { M.confirm[+b.dataset.i] = !M.confirm[+b.dataset.i]; }
    else if (a === "ehxcfno") { M.confirm = null; }
    else if (a === "ehxcfok") { if (!M.confirm || !M.confirm.every(Boolean)) return true; M.confirm = null; d.frost_ok = true; this._ehSave(); return true; }
    else return false;
    this._renderModal(); return true;
  }
  /* Heizerliste: Regeln für alle Heizer, sobald einer bei Frost heizt */
  _ehFrostRules(rooms) {
    const hs = rooms.filter((r) => htrFrost(r.htr)); if (!hs.length) return "";
    const F = this._frost(), pv = this._pv(), live = (this._ehD && this._ehD.frost) || null, adm = this._admin();
    const n = (f, k, l, u, h, v, lo, hi, st) => `<div class="of"><div class="ol"><b>${l}</b><span>${h}</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="${f}" data-k="${k}" value="${v}" min="${lo}" max="${hi}" step="${st}" ${adm ? "" : "disabled"}><i>${u}</i></span></div></div>`;
    const ct = live && live.ct != null ? Number(live.ct) : null, high = F.price_on && ct != null && ct > F.price;
    const price = !F.price_on ? "" : !live ? `<div class="gst">${ic("info", 15)}Strompreis wird geladen …</div>` : !live.tarif ? `<div class="gbox">Die Preisgrenze braucht Modul 14 mit dynamischem Tarif (Tibber oder Preis-Sensor). Ohne Preise wird trotzdem geheizt.</div>` : ct == null ? `<div class="gbox">Gerade liefert Modul 14 keinen Preis. Es wird trotzdem geheizt.</div>` : `<div class="gst ${high ? "" : "on"}">${ic("bolt", 15)}Strom jetzt ${num(ct, 1)} ct/kWh: ${high ? "zu teuer, Frost-Heizer warten" : "Zuheizen erlaubt"}.</div>`;
    const big = hs.filter((r) => { const w = stepsOf(r.htr)[0]; return w > F.watt; });
    return `<div class="lsec">❄ Frost-Regeln für alle Heizer</div><div class="fhs open fhst"><div class="fhb">
      ${n("gfr", "watt", "Netzleistung aller Heizer", "W", "Mehr ziehen alle Frost-Heizer zusammen nie. Die Priorität entscheidet. Andere Verbraucher zählen nicht mit.", F.watt, 100, 20000, 100)}
      ${big.length ? `<div class="gbox">${esc(big.map((r) => this._ehName(r)).join(", "))}: mehr Leistung als die Grenze, heizt so nicht bei Frost.</div>` : ""}
      <div class="of"><div class="ol"><b>Preisgrenze (Modul 14)</b><span>Teurer als die Grenze: Frost-Heizer warten.</span></div><div class="oc"><div class="seg oseg">${[["off", "Aus"], ["on", "An"]].map(([k, l]) => `<button class="${(F.price_on ? "on" : "off") === k ? "sel" : ""}" data-act="ehxfrp" data-k="${k}" ${adm ? "" : "disabled"}>${l}</button>`).join("")}</div></div></div>
      ${F.price_on ? n("gfr", "price", "Heizen nur bis", "ct/kWh", "Gesamtpreis je kWh.", F.price, -20, 200, 0.5) : ""}${price}
      ${n("gpvn", "minrun", "Mindestlaufzeit", "Min.", `Kürzer läuft ein Heizer nicht an einem Stück${pv.sensor ? " (PV und Frost)" : ""}. Störungen schalten sofort ab.`, pv.minrun, 0, 120, 5)}</div></div>`;
  }
  _htrLab(h) {
    const f = h.frost || {}, base = (HTR[h.status] || HTR.aus)[0];
    if (h.status === "frost_wartet" && f.rest_min) return `Wartet noch ${f.rest_min} Min. auf den Heizkörper`;
    if (h.status === "frost_pause" && f.rest_min) return `Pause · noch ${f.rest_min} Min.`;
    if (h.status === "frost_mild" && f.aussen != null) return `Aus: draußen ${num(f.aussen, 1)} °C`;
    if (h.status === "frost_preis") return "Strom über der Preisgrenze";
    if (h.status === "frost_abwesend") return "Aus: abwesend oder Urlaub";
    if (h.status === "frost_heizaus") return "Aus: Sommermodus oder Heizung aus";
    if (h.status === "frost_ok") return "Sicherheitsabfrage fehlt (Heizer bearbeiten)";
    if (h.status === "zeit" && h.modus === "frost") return "Außerhalb der Uhrzeit";
    return base;
  }
  _htrKeep(h) { const f = h.frost; return !!(htrFrost(h) && f && (h.status === "frost" || (f.aussen != null && f.aussen < f.grenze))); }
  _htrFrostMeta(h, share) {
    const f = h.frost || {}, kwh = Number(h.heute_kwh) || 0, net = Math.max(0, kwh - (Number(h.heute_pv_kwh) || 0)), cost = num(Number(h.heute_kosten) || 0, 2), both = h.modus === "both";
    const meta = both ? [`${num(kwh, 1)} kWh heute${share != null ? ` · ${share} % PV` : ""}`, `${cost} € Netzstrom`, `PV bis ${num(h.ziel, 1)} °C · Frost bis ${num(f.ziel, 1)} °C`] : [`${num(net, 1)} kWh Netz heute`, `${cost} €`, `Ziel ${num(f.ziel, 1)} °C`];
    const info = [f.aussen != null ? `Draußen ${num(f.aussen, 1)} °C` : "Draußen unbekannt", f.raum != null ? `Raum ${num(f.raum, 1)} °C` : "Raumsensor ohne Werte", `Frostgrenze ${num(f.grenze, 1)} °C`].join(" · ");
    return `<div class="htrm">${meta.map((m) => `<span>${m}</span>`).join("")}</div><div class="htrn mut">${ic("thermo", 13)}${info}</div>`;
  }
  /* Modul 14: Hinweis auf die Preisgrenze der Frost-Heizer */
  _ehTarifCard(S) {
    const hs = this._htrRooms().filter((r) => htrFrost(r.htr)); if (!hs.length) return "";
    const F = this._frost(), ct = S.now && S.now.ct != null ? Number(S.now.ct) : null, high = F.price_on && ct != null && ct > F.price;
    return `<div class="card ehtf"><h2>❄ Frost-Heizer</h2><div class="mut sm">${F.price_on ? `Heizen bei Frost nur bis ${num(F.price, 1)} ct/kWh.${ct != null ? ` Jetzt ${num(ct, 1)} ct: <b>${high ? "zu teuer, sie warten" : "erlaubt"}</b>.` : ""}` : "Noch keine Preisgrenze: Bei Frost wird unabhängig vom Strompreis geheizt."}</div>
      ${this._admin() ? `<button class="btn2" data-act="ehxlist" style="margin-top:10px">${ic("sliders", 16)} Preisgrenze einstellen</button>` : ""}</div>`;
  }
