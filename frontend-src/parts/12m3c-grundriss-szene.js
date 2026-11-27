  /* ================= Modul 0 · Neue Optik Plan (v0.14, Build 1) =================
     A1 Haus-Szene als Banner: das Haus mit Tageszeit, Räumen in ihrer Temperaturfarbe, offenen Fenstern (gelb) und – wenn Modul 16
        (Solar-Prognose) an ist – PV auf dem Dach. Daneben Kennzahlen als Chips; jeder Chip ist ein Sprung („2 Fenster offen“ öffnet den Plan
        mit der Ebene „Melder“).
     A2 eine Kopfleiste: Etagen, Ansicht ▾, Bearbeiten und ⋯ (die Reiter kommen in das ⋯-Menü) – dieselbe Leiste wie auf dem Handy, jetzt in jeder Breite.
     A6 Ebenen als wischbare Leiste über dem Plan.
     Schalter „Wie bisher“ in Einstellungen (pro Browser). Nur Darstellung – Daten und Plan bleiben unberührt. */
  _grLook() { if (this._grLookV == null) { try { this._grLookV = localStorage.getItem("fh_gr_look") === "classic" ? "classic" : "new"; } catch (_) { this._grLookV = "new"; } } return this._grLookV; }
  _grLookNew() { return this._grLook() !== "classic" && !this._grTv; }
  /* Kennzahlen aus Home Assistant: offene Fenster (alle Räume von Modul 1), Lampen an (Modul 18) */
  _grLive() {
    const h = this._hass, st = h.states || {}; let win = 0, lamps = 0;
    try { (this._collect(true) || []).forEach((r) => { win += (r.windows || []).filter((e) => st[e] && ["on", "open"].includes(st[e].state)).length; }); } catch (_) { /* Modul 1 aus */ }
    if (this._liOn && this._liOn()) Object.keys(st).forEach((e) => { if (e.startsWith("light.") && st[e].state === "on" && !Array.isArray((st[e].attributes || {}).entity_id)) lamps++; });
    return { win, lamps };
  }
  /* Temperatur eines Plan-Raums (über die Zuordnung zu Modul 1), sonst null */
  _grRoomT(r, all) {
    try { const f = this._gpMatch ? this._gpMatch(r, all) : null, e = f && (f.rtEid || (f.thermos || [])[0]), s = e && this._hass.states[e]; if (!s) return null; const v = Number(s.attributes && s.attributes.current_temperature != null ? s.attributes.current_temperature : s.state); return Number.isFinite(v) ? v : null; } catch (_) { return null; }
  }
  _grTcol(t) { return t == null ? "#2dd4bf" : t < 17 ? "#60a5fa" : t < 20 ? "#38bdf8" : t < 22.5 ? "#2dd4bf" : t < 25 ? "#fb923c" : "#f87171"; }
  _grScene(P) {
    const fls = this._grFloors(P).filter((f) => !f.ga).slice().reverse().slice(0, 3), W = 230, X0 = 18, H0 = 56, rowH = fls.length > 2 ? 30 : 38, H = Math.max(1, fls.length) * rowH, hr = new Date().getHours(), day = hr >= 7 && hr < 20;
    const all = this._gpAll ? this._gpAll() : [], st = this._hass.states, pv = this._mdList().some((m) => m.id === "sp");
    const sky = day ? ["#1d4e89", "#0b2540"] : ["#0b1226", "#050914"], vh = H0 + H + 16;
    let s = `<svg class="grhs grsc" viewBox="0 0 270 ${vh}" aria-hidden="true"><defs><linearGradient id="grsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs><rect width="270" height="${vh}" rx="14" fill="url(#grsk)"/>`;
    s += day ? `<circle cx="236" cy="22" r="9" fill="#fbbf24"/><circle cx="236" cy="22" r="15" fill="#fbbf24" opacity=".18"/>` : `<circle cx="238" cy="22" r="8" fill="#e2e8f0"/><circle cx="242" cy="20" r="7" fill="${sky[0]}"/><circle cx="40" cy="14" r="1.2" fill="#fff"/><circle cx="90" cy="26" r="1" fill="#fff"/><circle cx="150" cy="12" r="1.2" fill="#fff"/>`;
    s += `<polygon points="${X0 - 8},${H0} ${X0 + W / 2},${H0 - 38} ${X0 + W + 8},${H0}" fill="#17263c" stroke="#2dd4bf" stroke-width="2" stroke-linejoin="round"/>`;
    if (pv) s += `<g transform="rotate(-19 ${X0 + 62} ${H0 - 24})"><rect x="${X0 + 40}" y="${H0 - 30}" width="26" height="10" rx="1.5" fill="#1e3a8a" stroke="#93c5fd" stroke-width="1"/><rect x="${X0 + 68}" y="${H0 - 30}" width="26" height="10" rx="1.5" fill="#1e3a8a" stroke="#93c5fd" stroke-width="1"/></g>`;
    s += `<rect x="${X0}" y="${H0}" width="${W}" height="${H}" fill="#0f1b2d" stroke="#2dd4bf" stroke-width="2"/>`;
    fls.forEach((f, i) => {
      const y = H0 + i * rowH, rs = (P.items || []).filter((x) => x.t === "r" && x.fl === f.id).slice(0, 6), n = Math.max(1, rs.length), cw = W / n;
      if (i) s += `<line x1="${X0}" y1="${y}" x2="${X0 + W}" y2="${y}" stroke="#1e3350" stroke-width="2"/>`;
      rs.forEach((r, j) => {
        const x = X0 + j * cw, t = this._grRoomT(r, all), c = this._grTcol(t);
        let wo = false; try { const f2 = this._gpMatch ? this._gpMatch(r, all) : null; wo = !!(f2 && (f2.windows || []).some((e) => st[e] && ["on", "open"].includes(st[e].state))); } catch (_) { /* egal */ }
        s += `<rect x="${x + 3}" y="${y + 3}" width="${cw - 6}" height="${rowH - 6}" rx="4" fill="${c}" fill-opacity=".2" stroke="${c}" stroke-opacity=".55"><title>${esc(r.n || "Raum")}${t != null ? ` · ${t.toFixed(1).replace(".", ",")} °` : ""}</title></rect>`;
        if (t != null && cw > 30) s += `<text x="${x + cw / 2}" y="${y + rowH / 2 + 4}" text-anchor="middle" font-size="10" font-weight="700" fill="#e2e8f0">${t.toFixed(1).replace(".", ",")}°</text>`;
        if (wo) s += `<rect x="${x + cw - 12}" y="${y + 6}" width="7" height="9" rx="1" fill="#fbbf24"/>`;
      });
      s += `<text x="${X0 - 4}" y="${y + rowH / 2 + 3}" text-anchor="end" font-size="8" fill="#9db1c8">${esc(String(f.n || "").slice(0, 3))}</text>`;
    });
    return s + `<rect x="0" y="${H0 + H}" width="270" height="16" fill="#0a1a12"/><rect x="${X0 + W / 2 - 9}" y="${H0 + H - 14}" width="18" height="14" rx="2" fill="#0b1626" stroke="#2dd4bf" stroke-opacity=".6"/></svg>`;
  }
  _grHeroNew(P, D, st, fls, uTxt, edit) {
    const L = this._grLive(), chk = this._grCheck ? this._grCheck(P) : { n: 0 }, rooms = st.rooms || 0, nFl = fls.filter((f) => !f.ga).length, hasLot = fls.some((f) => f.ga);
    const sc = P.scale > 0 ? P.scale : 40; let m2 = 0; try { (P.items || []).filter((i) => i.t === "r" && !i.ds && fls.some((f) => f.id === i.fl && !f.ga)).forEach((r) => { m2 += this._grAreaM2(r, sc) || 0; }); } catch (_) { /* ohne Fläche */ }
    const area = m2 >= 1 ? `${Math.round(m2)} m²` : "";
    const chip = (k, ic2, txt, cls) => `<button class="grc ${cls || ""}" data-act="grxchip" data-k="${k}">${ic2 ? ic(ic2, 13) + " " : ""}${txt}</button>`;
    const nUse = (D.users || []).length;
    const chips = [
      chip("rooms", "home", `${rooms} ${rooms === 1 ? "Raum" : "Räume"}`),
      area ? chip("plan", "", area) : "",
      chip("win", "windowOpen", L.win ? `${L.win} Fenster offen` : "Fenster zu", L.win ? "warn" : ""),
      this._liOn && this._liOn() ? chip("lamp", "", L.lamps ? `${L.lamps} ${L.lamps === 1 ? "Lampe" : "Lampen"} an` : "Lampen aus") : "",
      chip("chk", chk.n ? "alert" : "check", chk.n ? `Plan-Check · ${chk.n}` : "Plan-Check ok", chk.n ? "warn" : "ok"),
      nUse ? `<span class="grc dim">genutzt von ${nUse} ${nUse === 1 ? "Modul" : "Modulen"}${uTxt ? ` (${esc(uTxt)})` : ""}</span>` : "",
    ].join("");
    const sub = rooms ? `Ein Bauplan für alle Module · ${nFl} ${nFl === 1 ? "Etage" : "Etagen"}${hasLot ? " · Außen" : ""}` : "Einmal zeichnen, in allen Modulen nutzen";
    return `<div class="grh grh2">${this._grScene(P)}<div style="flex:1;min-width:0"><div class="k">Modul 0</div><div class="b">Haus &amp; Grundriss</div><div class="s">${sub}</div><div class="grcs">${chips}</div>${D.lock && D.lock.sid !== this._grSid() ? `<div class="s" style="color:#fbbf24;margin-top:6px">${ic("pencil", 13)} Wird gerade von ${esc(D.lock.by)} bearbeitet</div>` : ""}</div></div>`;
  }
  /* A6: Ebenen als wischbare Leiste (ersetzt die umbrechenden Knöpfe); gleiche Aktionen wie bisher */
  _grLayerBar(lyr) { return lyr.replace('<div class="grl">', '<div class="grl grlb">'); }
  _grLookCss() {
    return `.grh2{background:radial-gradient(120% 140% at 95% 0%,#0e7490 0%,transparent 55%),linear-gradient(135deg,#0f3d3a,#0b1a2c 70%)}.grh2 svg.grhs{width:min(42%,270px)}
      .grh2 .b{font-size:1.35rem;font-weight:800;color:#fff}.grcs{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
      .grc{display:inline-flex;align-items:center;gap:5px;border:0;border-radius:999px;padding:5px 11px;font:inherit;font-size:.78rem;font-weight:650;background:#ffffff14;color:#e2e8f0;cursor:pointer}.grc:hover{background:#ffffff24}
      .grc.warn{background:#fbbf2426;color:#fcd34d}.grc.ok{color:#5eead4}.grc.dim{background:none;cursor:default;color:#9db1c8;font-weight:500;padding-left:2px}
      .grlb{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding-bottom:2px}.grlb::-webkit-scrollbar{display:none}.grlb button{flex:none}
      @media (max-width:640px){.grh2{flex-direction:column;align-items:stretch}.grh2 svg.grhs{width:100%;max-height:150px}}`;
  }
