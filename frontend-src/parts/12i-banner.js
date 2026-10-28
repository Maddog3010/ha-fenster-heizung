  /* ================= Einheitliches Banner für alle Module =================
     Links Titelzeile, große Zahl, Zusatzzeile und Chips, rechts ein Logo-Feld mit dem Symbol des Moduls. */
  _modLogo(id) { return `<div class="mlogo" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${MOD_ART[id] || ""}</svg></div>`; }
  _modRing(pct, label) {
    const p = Math.max(0, Math.min(100, Math.round(pct)));
    return `<div class="mring" aria-hidden="true"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" class="rb"/><circle cx="60" cy="60" r="50" class="rf" stroke-dasharray="${(p * 3.1416).toFixed(1)} 314.2" transform="rotate(-90 60 60)"/></svg><div class="rv"><b>${p}<small>%</small></b><span>${esc(label)}</span></div></div>`;
  }
  _modHero(id, o) {
    const chips = (o.chips || []).filter(Boolean);
    return `<div class="card hero mh a-${id}${o.cls ? " " + o.cls : ""}">${this._modLogo(id)}<div class="lbl">${ic(o.icon || "info", 16)}${esc(o.lbl)}</div><div class="big${o.small ? " bs" : ""}">${esc(o.big)}${o.unit ? `<small>${esc(o.unit)}</small>` : ""}</div>${o.sub ? `<div class="sub">${esc(o.sub)}</div>` : ""}${chips.length ? `<div class="chips">${chips.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>` : ""}</div>`;
  }
  /* Banner der Module ohne eigenes Banner (aus den Werten, die die Seite ohnehin zeigt) */
  _modHeroFor(id) {
    try {
      if (id === "ev") { const d = this._evData(); return this._modHero("ev", { icon: "car", lbl: "Elektroauto & Wallbox", big: d.soc != null ? num(d.soc, 0) : "–", unit: d.soc != null ? "%" : "", sub: !d.any ? "Noch kein Fahrzeug eingerichtet" : d.charging ? `Lädt${d.power != null ? " mit " + num(d.power / 1000, 1) + " kW" : ""}` : d.plugged ? "Angesteckt, lädt nicht" : "Nicht angesteckt", chips: [d.range != null ? `Reichweite ${num(d.range, 0)} km` : "", d.odo != null ? `${num(d.odo, 0)} km gefahren` : ""] }); }
      if (id === "ga") { const st = this._hass.states, c = this._wxCfg(), wid = c.entity && st[c.entity] ? c.entity : Object.keys(st).find((k) => k.startsWith("weather.")), w = wid ? st[wid] : null, rainy = w && ["rainy", "pouring", "lightning-rainy", "snowy-rainy"].includes(w.state), pv = this._pvNow(); return this._modHero("ga", { icon: "plant", lbl: "Garten jetzt", big: w ? (rainy ? "Es regnet" : "Trocken") : "–", small: true, sub: w ? (rainy ? "Bewässern nicht nötig" : "Kein Regen gemeldet") : "Keine Wetter-Entität gefunden", chips: [pv != null ? `PV-Überschuss ${wfmt(pv)}` : ""] }); }
      if (id === "pl") { const pv = this._pvNow(), pr = this._price(), o = this._out(); return this._modHero("pl", { icon: "wave", lbl: "Pool & Sauna", big: pv != null ? wfmt(pv) : "–", small: true, sub: pv != null ? (pv >= 1000 ? "PV-Überschuss, gut für Pumpe und Heizung" : "PV-Überschuss, eher wenig") : "Noch kein Überschuss-Sensor gewählt", chips: [pr ? `${num(pr, 1)} ct/kWh` : "", o.t != null ? `${num(o.t, 1)} °C draußen` : ""] }); }
      if (id === "bt") { const soc = this._soc(), pv = this._pvNow(); return this._modHero("bt", { icon: "energy", lbl: "Batteriespeicher", big: soc != null ? num(soc, 0) : "–", unit: soc != null ? "%" : "", sub: soc != null ? "Ladestand" : "Noch kein Ladestand-Sensor gewählt", chips: [pv != null ? `PV-Überschuss ${wfmt(pv)}` : ""] }); }
      if (id === "dt") { const h = this._dtPrices(), now = new Date().getHours(); if (!h) return this._modHero("dt", { icon: "chart", lbl: "Dynamischer Stromtarif", big: "–", sub: "Noch keine Stundenpreise" }); const mn = Math.min(...h); return this._modHero("dt", { icon: "chart", lbl: "Strompreis jetzt", big: num(h[now], 1), unit: "ct/kWh", sub: `Günstigste Stunde ${h.indexOf(mn)}:00 Uhr mit ${num(mn, 1)} ct/kWh`, chips: [`Ø ${num(h.reduce((a, b) => a + b, 0) / 24, 1)} ct/kWh heute`] }); }
      if (id === "wa") return this._modHero("wa", { icon: "tools", lbl: "Wartung & Erinnerungen", big: "2", unit: "bald fällig", sub: "Beispieleinträge, eigene Termine folgen", chips: ["Filter", "Schornsteinfeger", "Betriebsstunden"] });
      if (id === "sp") { const S = this._sp(); if (!this._spD || S.error || !S.found) return this._modHero("sp", { icon: "sun", lbl: "Solar-Prognose", big: "–", sub: S && S.error ? "Prognose nicht geladen" : "Noch keine Prognose" }); return this._modHero("sp", { icon: "sun", lbl: "Solar heute (Prognose)", big: num(S.today, 1), unit: "kWh", sub: `Morgen ${num(S.tomorrow, 1)} kWh`, chips: [S.got != null ? `Bisher ${num(S.got, 1)} kWh` : ""] }); }
    } catch (e) { return ""; }
    return "";
  }
