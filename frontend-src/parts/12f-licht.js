  /* Modul 18: Licht & Lampen (Labs). Schaltet nur auf Fingertipp über Home Assistant (light.*, scene.*, script.*).
     Das Modul gibt es nur, solange das Lab „Licht & Lampen“ (li) an ist. Verknüpfte Szenen und ausgeblendete Räume stehen im Layout (layout.li). */
  _liLay() {
    const l = (this._cfg && this._cfg.layout && this._cfg.layout.li) || {}, sc = l.scenes && typeof l.scenes === "object" ? l.scenes : {};
    return { scenes: { night: sc.night || "", arrive: sc.arrive || "", cozy: sc.cozy || "" }, hours: [1, 2, 4].includes(l.hours) ? l.hours : 2, hidden: Array.isArray(l.hidden) ? l.hidden.filter((x) => typeof x === "string") : [] };
  }
  _liSave(patch) { const l = this._liLay(); this._cfg.layout.li = { scenes: l.scenes, hours: l.hours, hidden: l.hidden, ...patch }; this._saveLayout(); this._render(); if (this._modal) this._renderModal(); }
  _liAreaOf(eid) {
    const H = this._hass, en = (H.entities || {})[eid]; if (!en) return "";
    if (en.area_id) return en.area_id;
    const dv = en.device_id && (H.devices || {})[en.device_id]; return (dv && dv.area_id) || "";
  }
  _liAreaName(a) { if (!a) return "Ohne Raum"; const x = (this._hass.areas || {})[a]; return (x && x.name) || a; }
  /* Alle einzelnen Lampen. Lichtgruppen (mit entity_id-Liste) werden ausgelassen, sonst zählt jede Lampe doppelt. */
  _liLamps() {
    const st = this._hass.states, now = Date.now();
    return Object.keys(st).filter((e) => e.startsWith("light.") && !Array.isArray((st[e].attributes || {}).entity_id)).map((e) => {
      const s = st[e], a = s.attributes || {}, modes = Array.isArray(a.supported_color_modes) ? a.supported_color_modes : [], un = s.state === "unavailable" || s.state === "unknown";
      const dim = modes.some((m) => m !== "onoff"), ct = modes.includes("color_temp"), col = modes.some((m) => ["hs", "xy", "rgb", "rgbw", "rgbww"].includes(m));
      const t = new Date(s.last_changed).getTime();
      return { id: e, name: a.friendly_name || e, on: s.state === "on", un, dim, ct, col, br: a.brightness != null ? Math.round(Number(a.brightness) / 2.55) : (s.state === "on" ? 100 : 0), kel: a.color_temp_kelvin || null, kmin: a.min_color_temp_kelvin || 2000, kmax: a.max_color_temp_kelvin || 6500, since: isFinite(t) ? now - t : 0, area: this._liAreaOf(e) };
    });
  }
  _liRooms() {
    const L = this._liLay(), by = {};
    this._liLamps().forEach((x) => { const k = x.area || "_"; (by[k] = by[k] || { k, name: this._liAreaName(x.area), lamps: [] }).lamps.push(x); });
    const all = Object.values(by).sort((a, b) => (a.k === "_") - (b.k === "_") || a.name.localeCompare(b.name, "de"));
    all.forEach((r) => { r.lamps.sort((a, b) => a.name.localeCompare(b.name, "de")); r.on = r.lamps.filter((x) => x.on); r.dim = r.lamps.filter((x) => x.dim && !x.un); r.hid = L.hidden.includes(r.k); });
    return all;
  }
  /* Ist im Raum ein Bewegungs-, Anwesenheits- oder Belegungssensor aktiv? Dann kein „Licht lange an“-Hinweis. */
  _liBusy(area) {
    if (!area) return false; const st = this._hass.states;
    return Object.keys(st).some((e) => e.startsWith("binary_sensor.") && ["motion", "occupancy", "presence"].includes((st[e].attributes || {}).device_class) && st[e].state === "on" && this._liAreaOf(e) === area);
  }
  _liDur(ms) { const m = Math.round(ms / 60000); return m < 60 ? `${m} Min.` : `${num(Math.floor(m / 60), 0)} Std.${m % 60 >= 10 ? " " + (m % 60) + " Min." : ""}`; }
  _liLong() { const lim = this._liLay().hours * 36e5; return this._liRooms().filter((r) => !r.hid).map((r) => ({ r, l: r.on.filter((x) => x.since >= lim) })).filter((x) => x.l.length && !this._liBusy(x.r.k === "_" ? "" : x.r.k)).map((x) => ({ r: x.r, ms: Math.max(...x.l.map((y) => y.since)), l: x.l })).sort((a, b) => b.ms - a.ms); }
  _liCall(dom, svc, data) { return this._hass.callService(dom, svc, data).catch(() => this._toast("Das hat nicht geklappt")); }
  _liSwatches(x) {
    const out = [];
    if (x.ct) [[2700, "Warmweiß"], [4000, "Neutralweiß"], [6000, "Kaltweiß"]].forEach(([k, t]) => out.push({ t, bg: k < 3500 ? "#ffb36b" : k < 5000 ? "#fff3e0" : "#cfe8ff", d: `data-kel="${Math.min(x.kmax, Math.max(x.kmin, k))}"`, on: x.kel && Math.abs(x.kel - Math.min(x.kmax, Math.max(x.kmin, k))) < 200 }));
    if (x.col) [[[167, 139, 250], "Violett"], [[244, 114, 182], "Rosa"], [[96, 165, 250], "Blau"], [[52, 211, 153], "Grün"], [[251, 191, 36], "Gelb"], [[248, 113, 113], "Rot"]].forEach(([c, t]) => out.push({ t, bg: `rgb(${c.join(",")})`, d: `data-rgb="${c.join(",")}"`, on: false }));
    return out;
  }
  _liSceneBtn(k, label, ico, pri) {
    const L = this._liLay(), e = L.scenes[k], ok = e && this._hass.states[e];
    if (!ok) return `<button class="btn2 lixun" data-act="lixscn" data-k="${k}" title="Noch nicht verknüpft">${ic("link", 15)} ${label}<small>verknüpfen</small></button>`;
    return `<button class="btn2 ${pri ? "pri" : ""}" data-act="lixscn" data-k="${k}" title="${esc(this._wzName(e))}">${ic(ico, 15)} ${label}</button>`;
  }
  _liPage() {
    const adm = this._admin(), rooms = this._liRooms(), shown = rooms.filter((r) => !r.hid), lamps = shown.flatMap((r) => r.lamps).filter((x) => !x.un);
    const banner = `<div class="labban">${ic("flask", 22)}<div><b>Labs · Licht & Lampen</b>Dieses Modul ist ein Experiment und nur da, solange das Lab eingeschaltet ist. Es schaltet nur, wenn du tippst.</div></div>`;
    if (!rooms.length) return `${banner}<div class="card empty">${ic("lamp", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Keine Lampen gefunden</div>Es gibt in Home Assistant keine Entität light.*. Lampen richtest du in Home Assistant unter Geräte und Dienste ein.</div>`;
    const on = lamps.filter((x) => x.on), L = this._liLay(), long = this._liLong();
    const top = shown.slice().sort((a, b) => b.on.length - a.on.length)[0], mx = on.length ? Math.max(...on.map((x) => x.since)) : 0, longest = on.find((x) => x.since === mx);
    const mu = this._labOn("mm") ? this._mu() : null, mul = mu && mu.cfg && mu.cfg.light && mu.cfg.light.on && mu.cfg.light.ent ? mu.cfg.light.ent : "";
    const tiles = `<div class="lugrid lixtiles">${this._labTile("Lampen an", String(on.length), `von ${lamps.length} in ${shown.length} ${shown.length === 1 ? "Raum" : "Räumen"}`, on.length ? "amber" : "")}${this._labTile("Meiste Lampen an", top && top.on.length ? esc(top.name) : "–", top && top.on.length ? `${top.on.length} von ${top.lamps.length} an` : "Alles aus")}${this._labTile("Längste an", on.length ? this._liDur(mx) : "–", on.length && longest ? esc(longest.name) : "Nichts an")}${mul ? this._labTile("Müll-Licht", this._hass.states[mul] && this._hass.states[mul].state === "on" ? "An" : "Aus", esc(this._wzName(mul)) + " (Modul 17)") : ""}</div>`;
    const scn = `<div class="gbtns lixscn">${this._liSceneBtn("night", "Gute Nacht", "moon", true)}<button class="btn2" data-act="lixalloff" ${on.length ? "" : "disabled"}>${ic("lamp", 15)} Alle aus</button>${this._liSceneBtn("arrive", "Ankommen", "home")}${this._liSceneBtn("cozy", "Gemütlich", "fireplace")}</div>`;
    const names = ["night", "arrive", "cozy"].filter((k) => L.scenes[k] && this._hass.states[L.scenes[k]]).map((k) => `${{ night: "Gute Nacht", arrive: "Ankommen", cozy: "Gemütlich" }[k]}: ${esc(this._wzName(L.scenes[k]))}`);
    const now = `<div class="card"><h2>${ic("lamp", 18)}Jetzt</h2>${tiles}<div style="margin-top:12px">${scn}</div>${names.length ? `<div class="mut sm" style="margin-top:8px">${names.join(" · ")}</div>` : adm ? `<div class="mut sm" style="margin-top:8px">Die drei Knöpfe verknüpfst du in den Einstellungen mit deinen Szenen oder Skripten.</div>` : ""}</div>`;
    const hint = long.slice(0, 3).map((x) => `<div class="gst on lixhint">${ic("bell", 15)}<span><b>${esc(x.r.name === "Ohne Raum" ? "Licht ohne Raum" : "Im Raum „" + x.r.name + "“")} brennt seit ${this._liDur(x.ms)}</b> · ${x.l.map((y) => esc(y.name)).join(", ")}</span><button class="lnk" data-act="lixroomoff" data-k="${esc(x.r.k)}">Ausschalten</button></div>`).join("");
    const room = (r) => {
      const n = r.on.length, bp = r.dim.filter((x) => x.on), avg = bp.length ? Math.round(bp.reduce((a, x) => a + x.br, 0) / bp.length) : 0;
      return `<div class="card lixroom ${n ? "on" : ""}"><div class="lixhd"><span class="lixico">${ic("lamp", 20)}</span><div class="lixt"><b>${esc(r.name)}</b><small>${n ? `${n} von ${r.lamps.length} an` : "aus"}</small></div><button class="sw ${n ? "on" : ""}" data-act="lixroom" data-k="${esc(r.k)}" aria-pressed="${!!n}" aria-label="${esc(r.name)}: ${n ? "alle ausschalten" : "alle einschalten"}"></button></div>
        ${bp.length ? `<div class="lixrng"><span>${ic("sun", 14)}</span><input type="range" min="1" max="100" value="${avg}" data-f="lixbr" data-k="${esc(r.k)}" aria-label="Helligkeit ${esc(r.name)}"><b>${avg} %</b></div>` : ""}
        <div class="lixl">${r.lamps.map((x) => `<div class="lixlamp ${x.on ? "on" : ""} ${x.un ? "un" : ""}"><button class="lixnm" data-act="lixdet" data-k="${esc(x.id)}" ${x.un ? "disabled" : ""} aria-label="${esc(x.name)}: Details">${ic("lamp", 16)}<span>${esc(x.name)}${x.un ? `<small>nicht erreichbar</small>` : x.on && x.dim ? `<small>${x.br} %</small>` : ""}</span></button><button class="sw ${x.on ? "on" : ""}" data-act="lixsw" data-k="${esc(x.id)}" aria-pressed="${x.on}" aria-label="${esc(x.name)} ${x.on ? "ausschalten" : "einschalten"}" ${x.un ? "disabled" : ""}></button></div>`).join("")}</div></div>`;
    };
    return `${banner}${now}${hint}<div class="lixgrid">${shown.map(room).join("") || `<div class="card empty">Alle Räume sind ausgeblendet. Einblenden kannst du sie in den Einstellungen.</div>`}</div>`;
  }
  _lixAct(a, b) {
    const k = b.dataset.k, rooms = this._liRooms();
    if (a === "lixopen") { this._modal = { type: "lixset" }; this._renderModal(); return; }
    if (a === "lixdet") { this._modal = { type: "lixdet", id: k }; this._renderModal(); return; }
    if (a === "lixalloff") { this._modal = { type: "lixoff" }; this._renderModal(); return; }
    if (a === "lixalloffgo") { const ids = this._liLamps().filter((x) => x.on).map((x) => x.id); this._modal = null; this._renderModal(); if (ids.length) this._liCall("light", "turn_off", { entity_id: ids }); this._toast("Alle Lampen werden ausgeschaltet"); return; }
    if (a === "lixsw") { const x = this._liLamps().find((y) => y.id === k); if (x) this._liCall("light", x.on ? "turn_off" : "turn_on", { entity_id: k }); return; }
    if (a === "lixroom") { const r = rooms.find((y) => y.k === k); if (r) this._liCall("light", r.on.length ? "turn_off" : "turn_on", { entity_id: (r.on.length ? r.on : r.lamps.filter((x) => !x.un)).map((x) => x.id) }); return; }
    if (a === "lixroomoff") { const r = rooms.find((y) => y.k === k); if (r && r.on.length) this._liCall("light", "turn_off", { entity_id: r.on.map((x) => x.id) }); return; }
    if (a === "lixscn") {
      const e = this._liLay().scenes[k];
      if (!e || !this._hass.states[e]) { if (this._admin()) { this._modal = { type: "lixset" }; this._renderModal(); } else this._toast("Dieser Knopf ist noch nicht mit einer Szene verknüpft"); return; }
      this._liCall(e.split(".")[0], "turn_on", { entity_id: e }); this._toast(`${this._wzName(e)} wird ausgeführt`); return;
    }
    if (a === "lixcol") { const m = this._modal; if (!m || m.type !== "lixdet") return; const d = { entity_id: m.id }; if (b.dataset.kel) d.color_temp_kelvin = +b.dataset.kel; else if (b.dataset.rgb) d.rgb_color = b.dataset.rgb.split(",").map(Number); this._liCall("light", "turn_on", d); return; }
    if (a === "lixhrs") { this._liSave({ hours: +k }); return; }
    if (a === "lixhide") { const h = this._liLay().hidden; this._liSave({ hidden: h.includes(k) ? h.filter((x) => x !== k) : [...h, k] }); return; }
    if (a === "lixunlink") { const l = this._liLay(); this._liSave({ scenes: { ...l.scenes, [k]: "" } }); return; }
  }
  _lixChange(t) {
    const f = t.dataset.f, k = t.dataset.k, v = t.value || "";
    if (f === "lixsel") { if (["night", "arrive", "cozy"].includes(k) && (v === "" || /^(scene|script)\.[a-z0-9_]+$/.test(v))) { const l = this._liLay(); this._liSave({ scenes: { ...l.scenes, [k]: v } }); } return true; }
    if (f === "lixbr") { const r = this._liRooms().find((y) => y.k === k), p = Math.max(1, Math.min(100, Math.round(Number(v)))); if (r && r.dim.some((x) => x.on)) this._liCall("light", "turn_on", { entity_id: r.dim.filter((x) => x.on).map((x) => x.id), brightness_pct: p }); return true; }
    if (f === "lixdbr") { const m = this._modal; if (m && m.type === "lixdet") this._liCall("light", "turn_on", { entity_id: m.id, brightness_pct: Math.max(1, Math.min(100, Math.round(Number(v)))) }); return true; }
    if (f === "lixkel") { const m = this._modal; if (m && m.type === "lixdet") this._liCall("light", "turn_on", { entity_id: m.id, color_temp_kelvin: Math.round(Number(v)) }); return true; }
    return false;
  }
  _lixModal() {
    const m = this._modal, adm = this._admin();
    if (m.type === "lixoff") {
      const n = this._liLamps().filter((x) => x.on).length;
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Alle Lampen ausschalten?</b><span>Modul 18 · Licht & Lampen</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm">${n ? `${n} ${n === 1 ? "Lampe ist" : "Lampen sind"} an und ${n === 1 ? "wird" : "werden"} jetzt ausgeschaltet. Das gilt für alle Räume, auch ausgeblendete.` : "Es ist keine Lampe an."}</div>
        <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="lixalloffgo" ${n ? "" : "disabled"}>Alle aus</button></div></div>`;
    }
    if (m.type === "lixdet") {
      const x = this._liLamps().find((y) => y.id === m.id); if (!x) return `<div class="ov" data-act="close"></div><div class="sheet"><div class="sh"><div><b>Lampe nicht gefunden</b></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div></div>`;
      const sw = this._liSwatches(x);
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>${esc(x.name)}</b><span>${esc(this._liAreaName(x.area))} · ${x.un ? "nicht erreichbar" : x.on ? "an" : "aus"}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="vrow"><span>Lampe</span><button class="sw ${x.on ? "on" : ""}" data-act="lixsw" data-k="${esc(x.id)}" aria-pressed="${x.on}" aria-label="${esc(x.name)} ${x.on ? "ausschalten" : "einschalten"}"></button></div>
        ${x.dim ? `<div class="vrow"><span>Helligkeit</span><span class="lixrng" style="flex:1;max-width:60%"><input type="range" min="1" max="100" value="${x.on ? x.br : 50}" data-f="lixdbr" aria-label="Helligkeit"><b>${x.on ? x.br + " %" : "aus"}</b></span></div>` : `<div class="mut sm" style="margin:8px 0">Diese Lampe kann nur ein- und ausgeschaltet werden.</div>`}
        ${x.ct ? `<div class="vrow"><span>Weißton<small class="mut" style="display:block">${x.kel ? x.kel + " Kelvin" : "warm bis kalt"}</small></span><span class="lixrng" style="flex:1;max-width:60%"><input type="range" min="${x.kmin}" max="${x.kmax}" step="100" value="${x.kel || Math.round((x.kmin + x.kmax) / 2)}" data-f="lixkel" aria-label="Weißton"></span></div>` : ""}
        ${sw.length ? `<div class="lsec">${ic("palette", 15)}Lichtfarbe</div><div class="lixsw">${sw.map((s) => `<button class="lixc ${s.on ? "on" : ""}" style="background:${s.bg}" data-act="lixcol" ${s.d} aria-label="${esc(s.t)}" title="${esc(s.t)}"></button>`).join("")}</div>` : ""}
        <div class="foot2" style="margin-top:12px"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
    }
    const L = this._liLay(), H = this._hass, st = H.states, sc = Object.keys(st).filter((e) => e.startsWith("scene.") || e.startsWith("script.")), rooms = this._liRooms();
    const slot = (k, t, h) => `<div class="lsec" style="margin-top:10px">${ic("link", 15)}${t}</div><div class="mut sm" style="margin:0 0 4px">${h}</div>${this._wzSel(sc, L.scenes[k], "lixsel", `data-k="${k}"`, "– nicht verknüpft –", /schlaf|nacht|aus|bed|night|ankomm|heim|home|arriv|gem(ü|u)t|cozy|relax|abend/i)}`;
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true"><div class="sh"><div><b>Licht & Lampen</b><span>Modul 18 · Labs · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("lamp", 15)}Szenenknöpfe</div>
      <div class="mut sm" style="margin:0 0 4px">Jeder Knopf ruft eine Szene oder ein Skript aus Home Assistant auf. Ohne Auswahl bleibt er unverknüpft und öffnet diese Einstellungen. „Alle aus“ ist eingebaut.</div>
      ${slot("night", "Gute Nacht", "Zum Beispiel deine Szene zum Schlafengehen")}${slot("arrive", "Ankommen", "Zum Beispiel Licht im Flur und Wohnzimmer")}${slot("cozy", "Gemütlich", "Zum Beispiel warmes, gedimmtes Licht")}
      <div class="lsec" style="margin-top:14px">${ic("bell", 15)}Hinweis „Licht lange an“</div>
      <div class="vrow"><span>Hinweis ab<small class="mut" style="display:block">So lange darf eine Lampe an sein. Meldet ein Bewegungs- oder Anwesenheitssensor im Raum etwas, kommt kein Hinweis.</small></span><div class="seg">${[1, 2, 4].map((h) => `<button class="${L.hours === h ? "sel" : ""}" data-act="lixhrs" data-k="${h}" ${adm ? "" : "disabled"}>${h} Std.</button>`).join("")}</div></div>
      <div class="lsec" style="margin-top:14px">${ic("door", 15)}Räume</div>
      <div class="mut sm" style="margin:0 0 6px">Ausgeblendete Räume (zum Beispiel Garten oder Keller) fehlen auf der Seite, auch bei „Alle aus“ der Seitenübersicht. „Alle aus“ schaltet trotzdem jede Lampe.</div>
      <div class="gschips">${rooms.map((r) => `<button class="gsch ${r.hid ? "" : "sel"}" data-act="lixhide" data-k="${esc(r.k)}" aria-pressed="${!r.hid}" ${adm ? "" : "disabled"}>${esc(r.name)} (${r.lamps.length})</button>`).join("")}</div>
      <div class="foot2" style="margin-top:12px"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
