  /* ================= Tablet-Modus · Stufe 6: Licht & Lampen (Modul 18) ohne Scrollen (2026.11.5b14) =================
     Reiter Räume (Szenen und „Alle aus“ oben, bis zu 8 Raumkacheln mit Helligkeit und Schalter), Lichtkarte (Grundriss, nur mit Plan)
     und Szenen (große Felder, 6 je Seite). Eine einzelne Lampe öffnet das Detailfenster. Lampen schalten geht immer,
     Lampen, Regeln und Szenen verknüpfen ändern nur am Handy oder Rechner. Die Seite nutzt die Daten und Aktionen des Licht-Addons. */
  _tm2LiOn() { return !!(this._liOn && this._liOn()); }
  _tm2LiPlanOn() { try { const P = this._gpPlan && this._gpPlan(); return !!(P && !P.error && (P.items || []).some((i) => i.t === "r")); } catch (_) { return false; } }
  _tm2LiReady() { return this._tm2LiOn() && !!(this._liX && this._liX.d); }
  /* Das Addon zeichnet nur neu, wenn seine eigene Seite offen ist: hier gleich nach dem Laden nachziehen */
  _tm2LiWait() {
    if (this._tm2LiT) return;
    this._tm2LiT = setTimeout(() => { this._tm2LiT = 0; if (this._tm2Shows("li")) this._render(); }, 1500);
  }
  _tm2LiHex(c) { return Array.isArray(c) ? `#${c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}` : "#ffd2a1"; }
  _tm2LiRooms() { return this._liRooms().filter((r) => !r.hid && r.lamps.length); }
  _tm2LiStatus() {
    if (!this._tm2LiOn()) return this._adOn("licht") ? "Wird geladen" : "Addon aus";
    this._liD();
    if (!this._tm2LiReady()) return "Wird geladen";
    const rs = this._tm2LiRooms(), lamps = rs.flatMap((r) => r.lamps).filter((x) => !x.un), on = lamps.filter((x) => x.on);
    if (!lamps.length) return "Keine Lampen";
    const n = rs.filter((r) => r.on.length).length;
    return on.length ? `${on.length} ${on.length === 1 ? "Lampe" : "Lampen"} an · ${n} ${n === 1 ? "Raum" : "Räume"}` : "Alles aus";
  }
  /* Szenen: zuerst die drei verknüpften Knöpfe des Moduls, dann alle Szenen aus Home Assistant */
  _tm2LiScenes() {
    const L = this._liLay(), st = this._hass.states, out = [], seen = new Set();
    [["night", "Gute Nacht", "moon"], ["arrive", "Ankommen", "home"], ["cozy", "Gemütlich", "fireplace"]].forEach(([k, n, i]) => { const e = L.scenes[k]; if (e && st[e]) { out.push({ e, n, i }); seen.add(e); } });
    Object.keys(st).filter((e) => e.startsWith("scene.") && !seen.has(e)).sort((a, b) => this._wzName(a).localeCompare(this._wzName(b), "de")).forEach((e) => out.push({ e, n: this._wzName(e), i: "palette" }));
    return out;
  }
  _tm2Li() {
    if (!this._tm2LiOn()) return this._tm2None("lamp", this._adOn("licht") ? "Das Licht-Addon wird geladen …" : "Das Licht-Addon ist aus.");
    this._liD();
    if (!this._tm2LiReady()) { this._tm2LiWait(); return this._tm2None("lamp", "Lampen werden geladen …"); }
    const rs = this._tm2LiRooms();
    if (!rs.length) return `<div class="card empty tm2none">${ic("lamp", 44)}<div>${this._liMine() ? "Noch keine Lampen hinzugefügt." : "Keine Lampen gefunden."}</div><small>${this._liMine() ? "Im Licht-Modul am Handy oder Rechner fügst du Lampen hinzu." : "Lampen richtest du in Home Assistant unter Geräte und Dienste ein."}</small></div>`;
    const t = this._tm2Tab("li");
    return t === "map" ? this._tm2LiMap(rs) : t === "scn" ? this._tm2LiScn() : this._tm2LiRooms2(rs);
  }
  _tm2LiBtn(act, k, label, ico, cls = "") { return `<button class="btn2 tm2lis ${cls}" data-act="${act}"${k ? ` data-k="${esc(k)}"` : ""}>${ic(ico, 20)}<span>${esc(label)}</span></button>`; }
  _tm2LiStrip(rs) {
    const on = rs.flatMap((r) => r.lamps).filter((x) => x.on && !x.un), sc = this._tm2LiScenes().slice(0, 3);
    const lay = this._liLay(), keys = ["night", "arrive", "cozy"].filter((k) => lay.scenes[k] && this._hass.states[lay.scenes[k]]);
    const btns = sc.map((s, i) => `<button class="btn2 tm2lis${i === 0 && keys[0] === "night" ? " pri" : ""}" data-act="tm2liscn" data-k="${esc(s.e)}">${ic(s.i, 20)}<span>${esc(s.n)}</span></button>`).join("");
    return `<div class="tm2listrip">${btns}<button class="btn2 tm2lis" data-act="lixalloff" ${on.length ? "" : "disabled"}>${ic("lamp", 20)}<span>Alle aus</span></button><span class="tm2lisum">${on.length ? `${on.length} ${on.length === 1 ? "Lampe" : "Lampen"} an` : "Alles aus"}</span></div>`;
  }
  /* Raumbild wie in Modul 1: eigenes Foto, sonst die Zeichnung zum Raumtyp (aus Namen oder Einstellung erkannt) */
  _tm2LiPic(r, on) {
    try {
      const ph = (this._cfg.layout.photos || {})[r.k], t = (this._cfg.layout.rtype || {})[r.k], C = this.constructor.RK_TYPES || [];
      const type = C.some((x) => x[0] === t) ? t : this._rkTypeAuto({ id: r.k, name: r.name, nameOnly: true }) || "wohnen", col = on ? r.col || "#fbbf24" : "#64748b";
      const night = this._hass.states["sun.sun"] ? this._hass.states["sun.sun"].state === "below_horizon" : false;
      if (ph) return `<div class="rk2art ph${on ? "" : " gr"} tm2lipic" style="background-image:url('${esc(ph)}');--c:${col}"></div>`;
      return `<div class="rk2art${on ? "" : " gr"}${night ? " nt" : ""} tm2lipic" style="--c:${col}">${this._rkArt(type, { k: on ? "ok" : "aus", col, open: [], tilt: [], anyOpen: 0, act: null, heating: false, t0: null, night, lfs: [] }, { ms: false })}</div>`;
    } catch (e) { return ""; }
  }
  _tm2LiRoomTile(r) {
    const n = r.on.length, bp = r.dim.filter((x) => x.on), long = this._liLong().find((x) => x.r.k === r.k);
    const sub = n ? `${n} von ${r.lamps.length} an${long ? ` · seit ${this._liDur(long.ms)}` : ""}` : `aus · ${r.lamps.length} ${r.lamps.length === 1 ? "Lampe" : "Lampen"}`;
    const slider = bp.length ? `<input type="range" class="tm2lisl" style="--p:${Math.round(bp.reduce((a, x) => a + x.br, 0) / bp.length)}%" min="1" max="100" value="${Math.round(bp.reduce((a, x) => a + x.br, 0) / bp.length)}" data-f="lixbr" data-k="${esc(r.k)}" aria-label="Helligkeit ${esc(r.name)}">` : `<div class="tm2lib"><span style="width:${n ? r.pct : 0}%"></span></div>`;
    return `<div class="tm2lir${n ? " on" : ""}${long ? " long" : ""}" style="--g:${n ? r.col : "transparent"}">${this._tm2LiPic(r, !!n)}<button class="tm2lih" data-act="tm2lirm" data-k="${esc(r.k)}" aria-label="${esc(r.name)}: Lampen einzeln zeigen"><span class="tm2lik">${ic("lamp", 26)}</span><span class="tm2lit"><b>${esc(r.name)}</b><small>${esc(sub)}</small></span><span class="tm2lip">${n ? `${r.pct}<small> %</small>` : "aus"}</span></button>
      <div class="tm2lia">${slider}<button class="sw ${n ? "on" : ""}" data-act="lixroom" data-k="${esc(r.k)}" aria-pressed="${!!n}" aria-label="${esc(r.name)}: ${n ? "alle ausschalten" : "alle einschalten"}"></button></div></div>`;
  }
  _tm2LiRooms2(rs) {
    const land = this._tm2Land(), H = window.innerHeight, per = land ? (H < 700 ? 6 : 8) : (H < 1000 ? 6 : 8), p = this._tm2Page("lirooms", rs.length, per);
    const gc = land ? (per === 6 ? 3 : 4) : 2, gr = Math.ceil(per / gc);
    return `<div class="tm2li">${this._tm2LiStrip(rs)}<div class="card tm2cc tm2lic" data-sw="lirooms"><div class="tm2lig" style="--c:${gc};--r:${gr}">${rs.slice(p.from, p.to).map((r) => this._tm2LiRoomTile(r)).join("")}</div>${this._tm2Pager("lirooms", p, "Räume")}</div></div>`;
  }
  _tm2LiScn() {
    const S = this._tm2LiScenes(), land = this._tm2Land(), per = land ? 6 : 6, p = this._tm2Page("liscn", S.length, per);
    if (!S.length) return `<div class="card empty tm2none">${ic("palette", 44)}<div>Noch keine Szenen.</div><small>Szenen legst du in Home Assistant an. Die drei Knöpfe „Gute Nacht“, „Ankommen“ und „Gemütlich“ verknüpfst du im Licht-Modul am Handy oder Rechner.</small></div>`;
    const on = this._tm2LiRooms().flatMap((r) => r.lamps).filter((x) => x.on && !x.un).length;
    return `<div class="tm2li">${`<div class="tm2listrip"><button class="btn2 tm2lis" data-act="lixalloff" ${on ? "" : "disabled"}>${ic("lamp", 20)}<span>Alle aus</span></button><span class="tm2lisum">${S.length} ${S.length === 1 ? "Szene" : "Szenen"}</span></div>`}<div class="card tm2cc tm2lic" data-sw="liscn"><div class="tm2lisg" style="--c:${land ? 3 : 2};--r:2">${S.slice(p.from, p.to).map((s) => `<button class="tm2lisc" data-act="tm2liscn" data-k="${esc(s.e)}">${ic(s.i, 40)}<b>${esc(s.n)}</b><small>${esc(s.e.startsWith("scene.") ? "Szene" : "Skript")}</small></button>`).join("")}</div>${this._tm2Pager("liscn", p, "Szenen")}</div></div>`;
  }
  /* Lichtkarte: dieselbe Zeichnung wie im Modul, in den freien Platz gesetzt. Ändern des Plans gehört in Modul 0 (Handy, Rechner). */
  _tm2LiMap(rs) {
    const longK = Object.fromEntries(this._liLong().map((x) => [x.r.k, x.ms]));
    let html = "";
    try { html = this._liPlanView(this._liRooms(), longK); } catch (e) { html = `<div class="card empty tm2none">${ic("alert", 44)}<div>Die Lichtkarte ließ sich nicht zeichnen.</div></div>`; }
    if (!this._tm2LiPlanOn()) { this._tm2LiWait(); return `<div class="tm2li"><div class="card empty tm2none">${ic("home", 44)}<div>Noch kein Grundriss.</div><small>Den Grundriss zeichnest du einmal in Modul 0 · Haus &amp; Grundriss.</small></div></div>`; }
    return `<div class="tm2li"><div class="tm2lipl">${html}</div></div>`;
  }
  /* Raumfenster: alle Lampen des Raums, jede mit Schalter und Detail */
  _tm2LiRoomModal(m) {
    const r = this._liRooms().find((x) => x.k === m.k); if (!r) return "";
    const n = r.on.length, hd = `<div class="sh"><div><b>${esc(r.name)}</b><span>${n ? `${n} von ${r.lamps.length} an · ${r.pct} %` : "alles aus"}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>`;
    const rows = r.lamps.map((x) => `<div class="tm2lil${x.on ? " on" : ""}${x.un ? " un" : ""}" style="--c:${this._tm2LiHex(x.rgb)}"><i></i><button class="nm" data-act="lixdet" data-k="${esc(x.id)}" ${x.un ? "disabled" : ""}><b>${esc(x.name)}</b><small>${x.un ? "nicht erreichbar" : x.on ? `an${x.dim ? ` · ${x.br} %` : ""} · seit ${this._liDur(x.since)}` : "aus"}</small></button><button class="sw ${x.on ? "on" : ""}" data-act="lixsw" data-k="${esc(x.id)}" aria-pressed="${x.on}" ${x.un ? "disabled" : ""} aria-label="${esc(x.name)} ${x.on ? "ausschalten" : "einschalten"}"></button></div>`).join("");
    const bp = r.dim.filter((x) => x.on), sl = bp.length ? `<div class="tm2lirb"><span>${ic("sun", 18)}Helligkeit im Raum</span><input type="range" min="1" max="100" value="${Math.round(bp.reduce((a, x) => a + x.br, 0) / bp.length)}" data-f="lixbr" data-k="${esc(r.k)}" aria-label="Helligkeit ${esc(r.name)}"></div>` : "";
    return `<div class="ov" data-act="close"></div><div class="sheet tm2rm tm2lim" role="dialog" aria-modal="true">${hd}${sl}<div class="tm2lils">${rows}</div><div class="foot2" style="margin-top:12px"><button class="btn2" data-act="lixroom" data-k="${esc(r.k)}">${ic("lamp", 18)} ${n ? "Alle ausschalten" : "Alle einschalten"}</button><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  /* Aktionen und Fenster der Stufe 6 (Licht, Wartung, Abrechnungen) */
  _tm6Act(a, b) {
    const k = b.dataset.k;
    if (a === "tm2lirm") { this._modal = { type: "tm2s6li", k }; this._renderModal(); return true; }
    if (a === "tm2liscn") {
      const st = this._hass.states[k]; if (!st) return true;
      this._liCall(k.split(".")[0], "turn_on", { entity_id: k }); this._toast(`${this._wzName(k)} wird ausgeführt`); return true;
    }
    if (a.startsWith("tm2wt")) return this._tm2WtAct(a, b);
    if (a.startsWith("tm2ab")) return this._tm2AbAct(a, b);
    return false;
  }
  _tm2S6Modal(m) {
    if (m.type === "tm2s6li") return this._tm2LiRoomModal(m);
    if (m.type === "tm2s6wt") return this._wtEd ? `<div class="ov" data-act="waxtcancel"></div><div class="sheet wide tm2wted" role="dialog" aria-modal="true">${this._wtEditor()}</div>` : "";
    return "";
  }
