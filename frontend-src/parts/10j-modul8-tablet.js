  /* ================= Modul 8 · v0.9 Build 4: Tablet-Wandansicht „Laden“ =================
     Im Tablet-Modus: Carport-Banner, Ladeband, Überschuss-Balken mit Vorschau und große Knöpfe für Modus und Schnellstart.
     „Alle Details“ öffnet die normale Seite von Modul 8, „Wandansicht“ führt zurück. */
  _evWall() {
    const d = this._evData(), sn = this._wbSnap(), c = sn.cfg || {}, N = this._evNow(d), adm = this._admin(), q = sn.quick && sn.quick.k;
    const M = [["off", "Aus", "plug"], ["pv", "Sonne", "sun"], ["minpv", "Sonne + Netz", "grid"], ["now", "Voll", "bolt"]];
    const Q = [["h1", "1 Stunde voll", "bolt"], ["goal", "Bis zum Ziel", "battery"], ["sun", "Heute nur Sonne", "sun"]];
    const can = adm && c.enabled && !c.planOn;
    const modes = `<div class="evwm">${M.map(([k, t, g]) => `<button class="evwb ${N.mode === k ? "sel" : ""}" data-act="wbmode" data-k="${k}" aria-pressed="${N.mode === k}" ${can ? "" : "disabled"}>${this._gx(g, 44, { on: N.mode === k ? 1 : 0 })}<b>${t}</b></button>`).join("")}</div>`;
    const quick = q ? `<div class="evwq on">${this._gx("bolt", 34, { on: 1 })}<span><b>Schnellstart: ${esc((Q.find((x) => x[0] === q) || ["", ""])[1])}</b><small>${q === "h1" ? "endet nach einer Stunde" : q === "goal" ? "bis zum Ladelimit" : "bis Mitternacht"}</small></span><button class="evwb stop" data-act="wbxq" data-k="">Stopp</button></div>`
      : `<div class="evwm q">${Q.map(([k, t, g]) => `<button class="evwb" data-act="wbxq" data-k="${k}" ${adm && c.enabled ? "" : "disabled"}>${this._gx(g, 34)}<b>${t}</b></button>`).join("")}</div>`;
    const why = !c.enabled ? "Die Laderegelung ist aus. Einschalten unter „Alle Details“." : c.planOn ? "Die Planung steuert gerade die Wallbox." : N.w.reason || "";
    return `<div class="evwall">${this._evBanner()}${this._evSay(d)}
      <div class="evwg"><div>${this._evBand(d)}${this._evSurplus(d) || `<div class="card evup0"><div class="mut">Kein Überschuss-Wert – dafür braucht Modul 8 die Laderegelung und einen Netz-Sensor.</div></div>`}</div>
        <div class="card evwc"><h2>${this._gx("wallbox", 26)}Wie soll geladen werden?</h2>${modes}${why ? `<div class="mut sm" style="margin:10px 2px 0">${esc(why)}</div>` : ""}
          <div class="lsec" style="margin-top:16px">${ic("energy", 15)}Schnellstart</div>${quick}
          <button class="btn2 evwfull" data-act="wbwall" data-k="full">${ic("sliders", 18)}Alle Details</button></div></div></div>`;
  }
  _evWallOn() { return !!(this._tmOn && this._tmOn() && this._wbOn() && !this._evWallFull); }
