  /* ================= Modul 8 · v0.9 Build 4: Überschuss-Balken und Strompreis =================
     Balken 0 … eingestellte Höchstleistung mit den Bereichen „zu wenig“, „1 Phase“ und „3 Phasen“, dem genauen Überschuss,
     der Ladeleistung jetzt und dem Netz-Anteil. Dazu Start/Stopp sichtbar (Restzeit aus der Regelung) und der Strompreis als Chip. */
  _evPriceChip() {
    const p = this._wbSnap().price;
    if (!p || p.ct == null) return "";
    const L = { billig: ["#34d399", "günstig laden"], guenstig: ["#86efac", "günstig"], normal: ["#fbbf24", "normal"], teuer: ["#fb923c", "teuer"], fix: ["#94a3b8", "Festpreis"] }[p.lvl] || ["#94a3b8", p.src || ""];
    return `<span class="chip evpc" style="--c:${L[0]}" title="Strompreis jetzt${p.src ? " · " + esc(p.src) : ""}"><i></i>${num(p.ct, 1)} ct/kWh${L[1] ? " · " + esc(L[1]) : ""}</span>`;
  }
  _evSurplus(d) {
    const sn = this._wbSnap(), w = sn.want || {}, e = sn.eff || sn.cfg || {}, V = 230;
    if (!this._wbOn() || !sn.cfg || !sn.cfg.enabled || w.surplus_w == null) return "";
    const minA = e.minA || 6, maxA = e.maxA || 16, ph = String(e.ph || "auto"), startW = e.startW || 1400;
    const has1 = ph !== "3", has3 = ph !== "1", top = maxA * V * (has3 ? 3 : 1);
    const st1 = Math.max(startW, minA * V), p3 = minA * V * 3, start = has1 ? st1 : Math.max(startW, p3);
    const sp = Math.max(0, w.surplus_w), ch = d.charging && d.power != null ? Math.max(0, d.power) : 0, grid = Math.max(0, ch - sp);
    const pc = (x) => Math.max(0, Math.min(100, x / top * 100)), kw = (x, n = 2) => num(x / 1000, n);
    let fit;
    const keep = (has1 ? 1 : 3) * minA * V; // so viel braucht eine laufende Ladung mit Mindeststrom
    if (sp < start && ch > 0) fit = sp < keep ? `<b>zu wenig für ${minA} A</b> – fehlen ${kw(keep - sp)} kW` : `reicht für <b>${minA} A · ${has1 ? "1 Phase" : "3 Phasen"}</b>`;
    else if (sp < start) fit = `<b>reicht noch nicht</b> – fehlt ${kw(start - sp)} kW bis zum Start`;
    else if (has1 && (!has3 || sp < p3)) { const a = Math.min(maxA, Math.floor(sp / V)); fit = `reicht für <b>${a} A · 1 Phase</b> (${kw(a * V)} kW)`; }
    else { const a = Math.min(maxA, Math.floor(sp / V / 3)); fit = `reicht für <b>${a} A · 3 Phasen</b> (${kw(a * V * 3)} kW)`; }
    const next = sp < start ? "" : has1 && has3 && sp < p3 ? `noch <b>${kw(p3 - sp)} kW</b> bis 3 Phasen` : sp < top ? `noch <b>${kw(top - sp)} kW</b> bis volle Leistung` : "volle Leistung";
    const t = w.timer, mm = (s) => s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} Min.` : `${s} s`;
    const tm = t && t.left > 0 ? `<div class="evup ${t.k === "start" ? "go" : "st"}" style="--p:${Math.round((1 - t.left / (t.tot || 1)) * 100)}%">${this._gx(t.k === "start" ? "sun" : "plug", 22, { on: t.k === "start" ? 1 : 0 })}<span>${t.k === "start" ? `<b>Startet in ca. ${mm(t.left)}</b>, wenn der Überschuss bleibt.` : `<b>Stoppt in ca. ${mm(t.left)}</b> – der Überschuss ist zu gering. Bis dahin lädt das Auto mit ${minA} A weiter.`}</span></div>`
      : w.state === "wartet" && sp < start && sn.cfg.mode !== "off" ? `<div class="evup">${this._gx("schedule", 22)}<span><b>Wartet auf Sonne.</b> Start ab ${kw(start, 1)} kW Überschuss${sn.eff && sn.eff.onMin ? `, wenn er ${sn.eff.onMin} Min. bleibt` : ""}.</span></div>` : "";
    const z = (cls, a, b) => b > a ? `<span class="z ${cls}" style="left:${pc(a)}%;width:${pc(b) - pc(a)}%"></span>` : "";
    const lab = (txt, a, b, hm) => b > a ? `<span class="zl${hm ? " hm" : ""}" style="left:${(pc(a) + pc(b)) / 2}%">${txt}</span>` : "";
    const ticks = [[0, "0"], [start, `Start ${kw(start, 1)}`]].concat(has1 && has3 ? [[p3, kw(p3, 1)]] : []).concat([[top, `max ${kw(top, 1)} kW`]]);
    return `<div class="card evup0"><h2>${this._gx("sun", 24, { on: sp >= start ? 1 : 0 })}Überschuss für die Wallbox</h2>
      <div class="evub" role="img" aria-label="Überschuss ${kw(sp)} kW${ch ? ", Ladeleistung " + kw(ch) + " kW" : ""}, eingestellt bis ${kw(top, 1)} kW">
        ${z("no", 0, start)}${has1 ? z("p1", start, Math.min(top, maxA * V)) : ""}${has3 ? z("p3", has1 ? p3 : start, top) : ""}
        ${lab("zu wenig", 0, start, 1)}${has1 ? lab(`1 Phase · ${minA}–${maxA} A`, start, Math.min(top, maxA * V)) : ""}${has3 ? lab(`3 Phasen · ${minA}–${maxA} A`, has1 ? p3 : start, top) : ""}
        <span class="s" style="width:${pc(sp)}%"></span>${grid > 0 ? `<span class="g" style="left:${pc(sp)}%;width:${pc(ch) - pc(sp)}%"></span>` : ""}
        <span class="t" style="left:${pc(start)}%"></span>${has1 && has3 ? `<span class="t" style="left:${pc(p3)}%"></span>` : ""}
        ${ch > 0 ? `<span class="w" style="left:${pc(ch)}%"></span>` : ""}</div>
      <div class="evux">${ticks.map(([x, l], i) => `<span style="left:${pc(x)}%"${i === 0 ? ' class="a"' : i === ticks.length - 1 ? ' class="e"' : ""}>${l}</span>`).join("")}</div>
      <div class="evul"><div class="big">${kw(sp)}<small>kW Überschuss</small></div>${ch > 0 ? `<div class="evpill">lädt jetzt <b>${kw(ch)} kW</b></div>` : ""}<div class="evpill">${fit}</div>${next ? `<div class="evpill">${next}</div>` : ""}
        ${grid > 0 ? `<div class="evpill nt">davon aus dem Netz <b>${kw(grid)} kW</b>${sn.price && sn.price.ct != null ? ` · ca. ${num(grid / 1000 * sn.price.ct / 100, 2)} €/h` : ""}</div>` : ""}</div>
      ${tm}${this._evSurFc(start, has1 && has3 ? p3 : null, top)}
      <div class="gsleg evuleg"><span><i style="background:var(--teal)"></i>Überschuss</span><span><i class="nt"></i>Netz</span>${ch > 0 ? `<span><i style="background:var(--primary-text-color,#e6edf3)"></i>Ladeleistung jetzt</span>` : ""}<span class="mut">Eingestellt: ${minA}–${maxA} A · ${ph === "auto" ? "Phasen automatisch" : ph === "1" ? "1 Phase" : "3 Phasen"} · Start ab ${kw(start, 1)} kW</span></div></div>`;
  }
  /* Überschuss-Vorschau: aus der PV-Prognose (minus Grundverbrauch) – ab wann reicht es für den Start, für 3 Phasen, bis wann */
  _evSurFc(start, p3, top) {
    this._wbFcLoad();
    const F = (this._wbFcD && this._wbFcD.data) || {}, H = F.hours || [], SL = (F.slot_min || 60) / 60, now = Date.now(), end = new Date(); end.setHours(23, 59, 0, 0);
    const S = H.map((h) => ({ t: new Date(h.t), w: (h.pv || 0) * 1000 })).filter((x) => x.t.getTime() + SL * 36e5 > now && x.t <= end);
    if (!F.has_pv || !S.length || !S.some((x) => x.w > 0)) return "";
    const hm = (t) => t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }), cur = S[0], z = (w) => w >= (p3 || Infinity) ? "p3" : w >= start ? "p1" : "no";
    const a = S.findIndex((x) => x.w >= start), b = p3 ? S.findIndex((x) => x.w >= p3) : -1;
    let last = -1; S.forEach((x, i) => { if (x.w >= start) last = i; });
    const peak = S.reduce((m, x) => (x.w > m.w ? x : m), S[0]), endT = last >= 0 ? new Date(S[last].t.getTime() + SL * 36e5) : null;
    const T = [];
    if (a < 0) T.push(`Heute reicht die Sonne laut Prognose nicht mehr für den Start (höchstens ${num(peak.w / 1000, 1)} kW um ${hm(peak.t)}).`);
    else {
      if (a > 0) T.push(`Ab ca. <b>${hm(S[a].t)}</b> reicht es für den Start.`);
      if (b > 0) T.push(`Ab ca. <b>${hm(S[b].t)}</b> für 3 Phasen.`); else if (b === 0 && a === 0) T.push("Jetzt reicht es laut Prognose für 3 Phasen.");
      if (endT) T.push(`Bis ca. <b>${hm(endT)}</b> reicht es.`);
      if (b < 0 && p3) T.push(`Für 3 Phasen reicht es heute nicht (höchstens ${num(peak.w / 1000, 1)} kW).`);
    }
    const sc = Math.max(peak.w * 1.1, p3 || start * 2), n = S.length, lb = [0, Math.floor(n / 2), n - 1].filter((v, i, x) => x.indexOf(v) === i);
    return `<div class="evfc"><div class="evfch">${this._gx("forecast", 20)}<b>Vorschau heute</b><span class="evfcl"><i class="no"></i>zu wenig<i class="p1"></i>1 Phase${p3 ? `<i class="p3"></i>3 Phasen` : ""}</span><span class="mut sm">${esc(F.pv_src || "Prognose")} · minus Grundverbrauch</span></div>
      <div class="evfcb" role="img" aria-label="Erwarteter Überschuss heute je ${SL < 1 ? "Viertelstunde" : "Stunde"}">${S.map((x) => `<i class="${z(x.w)}" style="height:${Math.max(6, Math.min(100, x.w / sc * 100))}%" title="${hm(x.t)} · ${num(x.w / 1000, 1)} kW"></i>`).join("")}</div>
      <div class="evfcx">${lb.map((i) => `<span style="left:${(i + .5) / n * 100}%">${i === 0 ? "jetzt" : hm(S[i].t)}</span>`).join("")}</div>
      <div class="sm" style="margin-top:6px">${T.join(" ")}</div></div>`;
  }
