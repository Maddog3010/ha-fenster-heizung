  /* ================= Weihnachts-Theme (Build 1) =================
     Saison 01.12.–27.12., Phasen advent · heiligabend · feiertage · ausklang, Kerzen nach Adventssonntag, Countdown.
     Einstellungen kommen vom Backend (fenster_heizung/saison_get), das Theme-Datum rechnet das Dashboard selbst aus –
     bei „Datum simulieren“ (nur Entwickler) mit dem Versatz aus dem Backend. Die Logik entspricht saison.py. */
  async _saiLoad() { try { this._saiD = await this._hass.callWS({ type: "fenster_heizung/saison_get" }); this._saiT0 = Date.now(); } catch (_) { this._saiD = null; } }
  _saiCfg() { return { modus: "auto", lichter: true, countdown: true, icons: true, ...((this._saiD && this._saiD.cfg) || {}) }; }
  _saiNow() {
    const d = this._saiD, s = d && d.sim;
    if (s && s.on && Date.now() / 1000 < s.until) return new Date(Date.now() + s.offset * 1000);
    return new Date();
  }
  _saiSundays(y) {
    const x = new Date(y, 11, 25), back = ((x.getDay() + 6) % 7 + 1) % 7 || 7;  /* JS: Sonntag = 0 → wie Python weekday()+1 */
    const v = new Date(y, 11, 25 - back);
    return [3, 2, 1, 0].map((w) => new Date(y, 11, v.getDate() - w * 7));
  }
  _saiState(now) {
    const c = this._saiCfg(), y = now.getFullYear(), m = now.getMonth(), dd = now.getDate(), day = new Date(y, m, dd);
    const inS = m === 11 && dd >= 1 && dd <= 27;
    let ph = !inS ? "aus" : dd <= 23 ? "advent" : dd === 24 ? "heiligabend" : dd <= 26 ? "feiertage" : "ausklang";
    if (c.modus === "an" && ph === "aus") ph = "advent";
    const vis = c.modus === "an" || ((c.modus === "auto" || c.modus === "akzente") && inS);
    const kz = day > new Date(y, 11, 27) ? 0 : this._saiSundays(y).filter((s) => s <= day).length;
    let ha = new Date(y, 11, 24); if (day > ha) ha = new Date(y + 1, 11, 24);
    const tage = Math.round((ha - day) / 864e5);
    const anim = ((this._cfg.layout.rk || {}).anim) !== "aus";
    return { ph, vis, kz, tage, mv: vis && c.modus !== "akzente" && anim, key: `${ph}|${vis}|${kz}|${tage}|${c.modus}`, day };
  }
  _sai() { return this._saiState(this._saiNow()); }
  /* Jede Sekunde aus _tick: nur neu zeichnen, wenn sich am Theme etwas ändert (Tageswechsel, Ende der Simulation) */
  _saiTick() {
    if (!this._saiD) return;
    const k = this._sai().key;
    if (this._saiK !== undefined && this._saiK !== k) { this._saiK = k; if (this._advLoad) this._advLoad().then(() => { this._render(); if (this._modal && this._modal.type === "advent") this._renderModal(); }); this._render(); if (this._modal && (this._modal.type === "look" || this._modal.type === "sai")) this._renderModal(); return; }
    this._saiK = k;
  }
  _saiKranz(n, w = 30) {
    const xs = [8, 20, 32, 44];
    const c = xs.map((x, i) => `<rect x="${x}" y="14" width="6" height="13" rx="1" fill="#e05a6b" opacity="${i < n ? 1 : 0.38}"/>${i < n ? `<ellipse cx="${x + 3}" cy="10" rx="2.3" ry="3.7" fill="#f4d58d"/><ellipse cx="${x + 3}" cy="11" rx="1" ry="1.8" fill="#fff"/>` : ""}`).join("");
    return `<svg class="saiK" width="${w}" height="${Math.round(w * 0.6)}" viewBox="0 0 58 34" aria-hidden="true"><ellipse cx="29" cy="28" rx="27" ry="6" fill="#2d7a5c"/><circle cx="10" cy="29" r="2" fill="#e05a6b"/><circle cx="29" cy="31" r="2" fill="#e05a6b"/><circle cx="48" cy="29" r="2" fill="#e05a6b"/>${c}</svg>`;
  }
  _saiText(s) {
    if (s.ph === "heiligabend") return "Frohe Weihnachten!";
    if (s.ph === "feiertage") return `${s.day.getDate() === 25 ? "1." : "2."} Weihnachtsfeiertag`;
    if (s.ph === "ausklang") return "Bis nächstes Jahr";
    const adv = s.kz ? `${s.kz}. Advent` : "Advent";
    return this._saiCfg().countdown ? `${adv} · noch ${s.tage} ${s.tage === 1 ? "Tag" : "Tage"}` : adv;
  }
  /* Kopfkarte Modul 1: Lichterkette oben, Kranz und Countdown als erster Chip */
  _saiHeroCls() { const s = this._sai(); return s.vis && this._saiCfg().lichter ? " saiH" : ""; }
  _saiLights(n = 14) {
    const s = this._sai(); if (!s.vis || !this._saiCfg().lichter) return "";
    const C = s.ph === "heiligabend" ? ["#f4d58d", "#fff3c0", "#f4d58d", "#ffe08a"] : s.ph === "feiertage" ? ["#e05a6b", "#f4d58d", "#ff8fa3", "#f4d58d"] : ["#e05a6b", "#f4d58d", "#3fa37a", "#8cc8f5", "#c9a6f5"];
    return `<div class="saiL${s.mv ? " mv" : ""}" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i style="--c:${C[i % C.length]};--i:${i}"></i>`).join("")}</div>`;
  }
  _saiStartChip() { const s = this._sai(); return s.vis ? [this._saiKranz(s.kz, 26), esc(this._saiText(s))] : null; }
  _saiChip() { const s = this._sai(); return s.vis ? `<span class="chip saiC"${this._advOn && this._advOn() ? ` data-act="advxkal" role="button" tabindex="0"` : ""}>${this._saiKranz(s.kz, 30)}${esc(this._saiText(s))}</span>` : ""; }
  _saiRoomIcon(r) {
    const s = this._sai(); if (!s.vis || !this._saiCfg().icons) return "";
    if (s.ph === "heiligabend") return `<span class="saiR" aria-hidden="true">⭐</span>`;
    const t = this._rkType ? this._rkType(r) : "";
    const I = { wohnen: "🎄", kueche: "🍪", kind: "⛄", esszimmer: "🕯️", schlafen: "🌙" };
    return I[t] ? `<span class="saiR" aria-hidden="true">${I[t]}</span>` : "";
  }
  /* Einstellungen → Darstellung: eigene Zeile, Link im Darstellungs-Fenster und eigenes Fenster */
  _saiStatus() { const c = this._saiCfg(), s = this._sai(); return s.vis ? `Aktiv · ${this._saiText(s)}` : c.modus === "aus" ? "Aus" : "Startet am 01.12. · Adventskalender, Lichterkette, Schnee"; }
  _saiRow(row) { return this._admin() ? row("tree", "Weihnachts-Theme", esc(this._saiStatus()), "saixdlg", "", this._saiD && this._saiD.dev ? `<em class="sxc ok">Entwickler</em>` : "") : ""; }
  _saiLink() { return `<div class="lsec">${ic("tree", 15)}Weihnachts-Theme</div><button class="sxrow" data-act="saixdlg"><span class="sxi">${ic("tree", 20)}</span><span class="sxt"><b>Weihnachts-Theme &amp; Adventskalender</b><small>${esc(this._saiStatus())}</small></span><span class="sxg">${ic("chev", 16)}</span></button>`; }
  _saiModal() {
    const body = this._saiD ? this._saiLook() : `<div class="mut" style="padding:16px">Lädt …</div>`;
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Weihnachts-Theme</b><span>gilt für alle Nutzer · 01.12.–27.12.</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${body}<div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _saiLook() {
    if (!this._saiD) return "";
    const c = this._saiCfg(), s = this._sai(), d = this._saiD, sim = d.sim && d.sim.on && Date.now() / 1000 < d.sim.until;
    const PH = { aus: "aus", advent: "Advent", heiligabend: "Heiligabend", feiertage: "Feiertage", ausklang: "Ausklang" };
    const status = s.vis ? `Aktiv: ${PH[s.ph]} · ${s.kz} ${s.kz === 1 ? "Kerze" : "Kerzen"}` : c.modus === "aus" ? "Ausgeschaltet" : "Startet am 01.12. und endet am 27.12.";
    const M = [["auto", "Automatisch"], ["an", "Immer an"], ["aus", "Aus"], ["akzente", "Nur Akzente"]];
    const info = { auto: "Vom 01.12. bis 27.12. von selbst, jedes Jahr.", an: "Immer sichtbar, z. B. für Bildschirmfotos. Außerhalb der Weihnachtszeit mit Advents-Optik.", aus: "Nie anzeigen – alles sieht aus wie bisher.", akzente: "Nach Datum, aber ohne Bewegung: Kranz, Farben und Countdown bleiben, die Lichter blinken nicht." }[c.modus];
    const tog = (k, l) => `<div class="ltog"><span>${l}</span><button class="sw ${c[k] ? "on" : ""}" data-act="saixtog" data-k="${k}" aria-pressed="${c[k]}" aria-label="${esc(l)}"></button></div>`;
    let dev = "";
    if (d.dev) {
      const y = s.day.getFullYear(), Q = [["11-30T23:59", "30.11. 23:59"], ["12-01T08:00", "1.12."], ["12-06T08:00", "6.12."], ["12-20T08:00", "20.12."], ["12-24T08:00", "24.12."], ["12-25T08:00", "25.12."], ["12-27T08:00", "27.12."], ["12-28T08:00", "28.12."]];
      const at = sim ? String(d.sim.at || "").slice(5, 10) : "";
      const until = sim ? new Date(d.sim.until * 1000).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "";
      dev = `<div class="saiDev"><div class="hd"><span>${ic("flask", 15)} Datum simulieren</span><span class="tag">Entwickler</span></div>
        <div class="mut sm">Verschiebt nur das Theme im Dashboard. Heizpläne, Statistiken, Automationen und die Entitäten bleiben bei der echten Zeit.</div>
        <div class="saiQ">${Q.map(([v, l]) => `<button class="${at && v.startsWith(at) ? "sel" : ""}" data-act="saixsim" data-k="${y}-${v}">${l}</button>`).join("")}</div>
        <div class="saiRow"><input data-f="saisimat" placeholder="JJJJ-MM-TTTHH:MM" value="${sim ? esc(d.sim.at) : `${y}-12-24T08:00`}" style="width:170px"><select data-f="saisimmin">${[15, 30, 60, 120, 480].map((n) => `<option value="${n}" ${n === (this._saiMin || 60) ? "selected" : ""}>${n < 60 ? n + " Min." : n / 60 + " Std."}</option>`).join("")}</select><button class="btn2" data-act="saixgo">Simulieren</button></div>
        ${sim ? `<div class="saiWarn"><span>⚠️ Simulation aktiv: <b>${esc(String(d.sim.at).replace("T", " "))}</b> · endet um ${until}</span><button class="btn2" data-act="saixoff">Beenden</button></div>` : ""}</div>`;
    }
    return `<div class="lsec">${ic("tree", 15)}Weihnachts-Theme</div>
      <div class="saiBox">${this._saiKranz(s.kz, 46)}<div><div class="t">${esc(status)}</div><div class="s">${s.vis ? esc(this._saiText(s)) : "Lichterkette, Adventskranz und Countdown auf der Startseite und in Modul 1"}</div></div></div>
      <div class="seg" style="margin-top:6px">${M.map(([k, l]) => `<button class="${c.modus === k ? "sel" : ""}" data-act="saixmode" data-k="${k}">${l}</button>`).join("")}</div>
      <div class="mut sm" style="margin:0 0 8px">${info}</div>
      ${tog("lichter", "Lichterkette an den Kopfkarten")}${tog("countdown", "Countdown bis Heiligabend")}${tog("icons", "Weihnachtliche Raum-Symbole")}${dev}${this._advLook ? this._advLook() : ""}`;
  }
  _saiSave(cfg) {
    this._hass.callWS({ type: "fenster_heizung/saison_set", cfg }).then((r) => { this._saiD = r; this._saiK = undefined; this._render(); this._renderModal(); })
      .catch(() => this._toast("Einstellung konnte nicht gespeichert werden"));
  }
  _saiSim(act, at) {
    const msg = { type: "fenster_heizung/saison_sim", act }; if (act === "on") { msg.at = at; msg.minutes = this._saiMin || 60; }
    this._hass.callWS(msg).then(async (r) => { this._saiD = r; this._saiK = undefined; if (this._advLoad) await this._advLoad(); this._render(); this._renderModal(); this._toast(act === "on" ? "Simulation läuft – nur das Theme" : "Simulation beendet"); })
      .catch((e) => this._toast(e && e.code === "bad_date" ? "Ungültiges Datum (Format JJJJ-MM-TTTHH:MM)" : e && e.code === "no_dev" ? "Nur mit Entwickler-Zugang" : "Simulation nicht möglich"));
  }
  _saiAct(a, b) {
    const box = this.shadowRoot.getElementById("modal");
    if (a === "saixdlg") { this._modal = { type: "sai" }; this._renderModal(); if (!this._saiD) this._saiLoad().then(() => this._renderModal()); if (!this._advD && this._advLoad) this._advLoad().then(() => this._renderModal()); }
    else if (a === "saixmode") this._saiSave({ ...this._saiCfg(), modus: b.dataset.k });
    else if (a === "saixtog") { const k = b.dataset.k, c = this._saiCfg(); this._saiSave({ ...c, [k]: !c[k] }); }
    else if (a === "saixsim") this._saiSim("on", b.dataset.k);
    else if (a === "saixgo") { const i = box && box.querySelector('[data-f="saisimat"]'), m = box && box.querySelector('[data-f="saisimmin"]'); if (m) this._saiMin = +m.value || 60; this._saiSim("on", i ? i.value.trim() : ""); }
    else if (a === "saixoff") this._saiSim("off");
  }
