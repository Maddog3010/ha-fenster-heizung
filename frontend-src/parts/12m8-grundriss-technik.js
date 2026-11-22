  /* ================= Modul 0 Build 9: Haustechnik, Sensoren und Notfall-Punkte (Element „h“) =================
     Katalog in Gruppen (Heizen & Klima, Strom, Sensoren, Netz & Medien, Notfall, Notiz). Jedes Teil kann mit einer Entität verbunden
     werden und zeigt dann seinen Zustand (Temperatur, an/aus, offen, nass …). Bewegungsmelder und Kamera mit Erfassungskegel,
     WLAN mit Reichweite. Notfall-Punkte (Haupthahn, Sicherungskasten, Feuerlöscher …) erscheinen auch im Plan von Modul 11. */
  _grTK() {
    if (this._grTKc) return this._grTKc;
    const I = {
      rad: '<rect x="4" y="7" width="16" height="11" rx="2"/><path d="M8 7v11M12 7v11M16 7v11M6 20v1M18 20v1"/>', thermo: '<circle cx="12" cy="12" r="7.5"/><path d="M12 12l3-3"/><circle cx="12" cy="12" r="1.2"/>',
      klima: '<rect x="3" y="6" width="18" height="8" rx="2"/><path d="M7 17c0 1.5 1.5 2.5 0 4M12 17c0 1.5 1.5 2.5 0 4M17 17c0 1.5 1.5 2.5 0 4"/>', fan: '<circle cx="12" cy="12" r="2"/><path d="M12 10c-1-4 0-6 3-6 1 3-1 5-3 6zM14 12c4-1 6 0 6 3-3 1-5-1-6-3zM12 14c1 4 0 6-3 6-1-3 1-5 3-6zM10 12c-4 1-6 0-6-3 3-1 5 1 6 3z"/>',
      fire: '<path d="M12 21c-4 0-6-2.5-6-6 0-4 4-6 4-10 3 2 4 4 4 6 1-1 2-2 2-3 2 2 4 5 4 7 0 3.5-3 6-8 6z"/>', boiler: '<rect x="6" y="3" width="12" height="18" rx="3"/><path d="M9 8h6M12 13v4"/>', hp: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="9" cy="12" r="3.5"/><path d="M15 9h3M15 12h3M15 15h3"/>',
      plug: '<rect x="5" y="5" width="14" height="14" rx="3"/><path d="M10 10v2M14 10v2M10 15h4"/>', switch: '<rect x="7" y="4" width="10" height="16" rx="2"/><rect x="9.5" y="7" width="5" height="5" rx="1"/>', fuse: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7v4M12 7v4M16 7v4M8 15h8"/>',
      meter: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 10h8M8 14h3"/><path d="M15 13l-2 3h3l-2 3"/>', inv: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M7 10c1.5-2 3-2 4 0s2.5 2 4 0M7 15h10"/>', batt: '<rect x="6" y="5" width="12" height="16" rx="2"/><path d="M10 3h4M12 9l-2 4h4l-2 4"/>',
      ev: '<rect x="6" y="3" width="10" height="16" rx="2"/><path d="M11 7l-2 4h4l-2 4"/><path d="M16 9h2a1 1 0 0 1 1 1v6a2 2 0 0 0 4 0"/>', temp: '<path d="M10 4a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/><path d="M12 14v-5"/>',
      motion: '<circle cx="13" cy="4.5" r="1.8"/><path d="M9 21l3-6 3 3v4M12 15l-1-5 4 1 2 3M11 10l-3 2"/>', contact: '<rect x="5" y="4" width="6" height="16" rx="1"/><rect x="13" y="4" width="6" height="16" rx="1"/>', drop: '<path d="M12 3c3 5 6 8 6 11a6 6 0 0 1-12 0c0-3 3-6 6-11z"/>',
      air: '<path d="M4 9h10a3 3 0 1 0-3-3M4 15h14a3 3 0 1 1-3 3M4 12h7"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>', wifi: '<path d="M3 9a13 13 0 0 1 18 0M6 12.5a8.5 8.5 0 0 1 12 0M9 16a4 4 0 0 1 6 0"/><circle cx="12" cy="19" r="1"/>',
      mesh: '<circle cx="12" cy="12" r="2.5"/><circle cx="5" cy="6" r="1.8"/><circle cx="19" cy="6" r="1.8"/><circle cx="12" cy="20" r="1.8"/><path d="M10 11 6.4 7.2M14 11l3.6-3.8M12 14.5V18"/>', cam: '<rect x="3" y="7" width="13" height="10" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
      bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>', spk: '<rect x="6" y="3" width="12" height="18" rx="2"/><circle cx="12" cy="14" r="3.5"/><circle cx="12" cy="7" r="1"/>', tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M9 21h6M12 17v4"/>',
      valve: '<path d="M4 12h5M15 12h5M9 8v8l6-8v8z"/><path d="M12 8V4M9 4h6"/>', gas: '<path d="M12 21c-4 0-6-2.5-6-6 0-4 4-6 4-10 3 2 4 4 4 6 1-1 2-2 2-3 2 2 4 5 4 7 0 3.5-3 6-8 6z"/><path d="M4 4l16 16"/>', ext: '<path d="M9 8h6v12a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/><path d="M12 8V5M10 5h5l3-2M9 12h6"/>',
      exit: '<path d="M4 3h9v18H4zM13 12h8M18 9l3 3-3 3"/><circle cx="8" cy="12" r="1"/>', meet: '<circle cx="12" cy="7" r="2"/><circle cx="6" cy="10" r="1.6"/><circle cx="18" cy="10" r="1.6"/><path d="M8 20v-5a4 4 0 0 1 8 0v5M3 19v-3a3 3 0 0 1 4-2.8M21 19v-3a3 3 0 0 0-4-2.8"/>', aid: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M9 6V4h6v2M12 10v6M9 13h6"/>',
      note: '<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4M8 11h8M8 15h6"/>' };
    const G = { heizen: ["Heizen & Klima", "#f97316"], strom: ["Strom", "#eab308"], sensor: ["Sensoren", "#2dd4bf"], netz: ["Netz & Medien", "#a78bfa"], notfall: ["Notfall", "#ef4444"], notiz: ["Notiz", "#94a3b8"] };
    const L = [
      ["heizkoerper", "Heizkörper", "heizen", "rad", ["climate"]], ["thermostat", "Thermostat", "heizen", "thermo", ["climate"]], ["klima", "Klimagerät", "heizen", "klima", ["climate"]], ["lueftung", "Lüftung", "heizen", "fan", ["fan", "climate"]],
      ["kamin", "Kamin / Ofen", "heizen", "fire", ["sensor:temperature", "climate"]], ["therme", "Therme", "heizen", "boiler", ["climate", "water_heater", "sensor:temperature"]], ["wp", "Wärmepumpe", "heizen", "hp", ["climate", "sensor:power"]], ["speicher", "Warmwasserspeicher", "heizen", "boiler", ["water_heater", "sensor:temperature"]],
      ["steckdose", "Steckdose", "strom", "plug", ["switch"]], ["schalter", "Schalter / Taster", "strom", "switch", ["switch", "light", "event"]], ["sicherung", "Sicherungskasten", "notfall", "fuse", []], ["zaehler", "Zähler", "strom", "meter", ["sensor:power", "sensor:energy"]],
      ["wechselrichter", "Wechselrichter", "strom", "inv", ["sensor:power"]], ["akku", "Batteriespeicher", "strom", "batt", ["sensor:battery", "sensor:power"]], ["wallbox", "Wallbox", "strom", "ev", ["sensor:power", "switch"]],
      ["temp", "Temperatur / Feuchte", "sensor", "temp", ["sensor:temperature", "sensor:humidity"]], ["bewegung", "Bewegungsmelder", "sensor", "motion", ["binary_sensor:motion", "binary_sensor:occupancy", "binary_sensor:presence"]], ["kontakt", "Tür-/Fensterkontakt", "sensor", "contact", ["binary_sensor:window", "binary_sensor:door", "binary_sensor:opening"]],
      ["wasser", "Wassermelder", "sensor", "drop", ["binary_sensor:moisture"]], ["luft", "Luftqualität", "sensor", "air", ["sensor:carbon_dioxide", "sensor:pm25", "sensor:volatile_organic_compounds", "sensor:aqi"]], ["hell", "Helligkeit", "sensor", "sun", ["sensor:illuminance"]],
      ["wlan", "WLAN-Zugangspunkt", "netz", "wifi", []], ["router", "Zigbee/Thread-Router", "netz", "mesh", []], ["kamera", "Kamera", "netz", "cam", ["camera"]], ["klingel", "Klingel", "netz", "bell", ["binary_sensor", "event"]], ["lautsprecher", "Lautsprecher", "netz", "spk", ["media_player"]], ["tv", "TV", "netz", "tv", ["media_player"]],
      ["haupthahn_w", "Haupthahn Wasser", "notfall", "valve", ["valve", "switch"]], ["haupthahn_g", "Haupthahn Gas", "notfall", "gas", ["valve", "switch"]], ["feuerloescher", "Feuerlöscher", "notfall", "ext", []], ["notausgang", "Notausgang", "notfall", "exit", []], ["sammelpunkt", "Sammelpunkt", "notfall", "meet", []], ["erstehilfe", "Erste Hilfe", "notfall", "aid", []],
      ["notiz", "Notiz", "notiz", "note", []]];
    this._grTKc = { I, G, L, by: Object.fromEntries(L.map((x) => [x[0], { k: x[0], n: x[1], g: x[2], i: x[3], d: x[4], c: G[x[2]][1] }])) };
    return this._grTKc;
  }
  _grTk(i) { const K = this._grTK(); return K.by[i.hk] || K.by.steckdose; }
  /* Zustand einer verbundenen Entität: Text, aktiv, Alarm */
  _grTechState(i) {
    const s = i.e && this._hass.states[i.e]; if (!s) return null;
    const a = s.attributes || {}, d = i.e.split(".")[0], v = s.state, un = a.unit_of_measurement || "";
    if (["unavailable", "unknown"].includes(v)) return { t: "offline", on: false };
    if (d === "climate") return { t: `${a.current_temperature != null ? num(a.current_temperature, 1) + "°" : ""}${a.temperature != null ? " → " + num(a.temperature, 1) + "°" : ""}`.trim() || v, on: a.hvac_action === "heating" || a.hvac_action === "cooling" || (v !== "off" && a.hvac_action == null) };
    if (d === "sensor") { const n = Number(v); return { t: isFinite(n) && v !== "" ? `${num(n, Math.abs(n) < 10 && !Number.isInteger(n) ? 1 : 0)}${un ? " " + un : ""}` : v, on: false }; }
    if (d === "binary_sensor") { const dc = a.device_class; return { t: v === "on" ? ({ moisture: "NASS", window: "offen", door: "offen", opening: "offen", motion: "Bewegung", occupancy: "belegt", presence: "da" }[dc] || "an") : ({ moisture: "trocken", window: "zu", door: "zu", opening: "zu" }[dc] || "–"), on: v === "on", al: v === "on" && dc === "moisture" }; }
    if (d === "valve") return { t: v === "open" ? "offen" : v === "closed" ? "zu" : v, on: v === "open" };
    if (d === "media_player") return { t: v === "playing" ? "spielt" : v === "off" ? "aus" : v, on: v === "playing" };
    if (d === "water_heater") return { t: a.current_temperature != null ? num(a.current_temperature, 0) + "°" : v, on: v !== "off" };
    if (d === "camera") return { t: v === "streaming" ? "live" : "", on: v === "streaming" || v === "recording" };
    return { t: v === "on" ? "an" : v === "off" ? "aus" : v, on: v === "on" };
  }
  _grTechSvg(P, fl, T, q, u, hell, only) {
    const K = this._grTK(), sc = P.scale > 0 ? P.scale : 40; let d = "", over = "";
    (P.items || []).filter((i) => i.t === "h" && i.fl === fl && (!only || this._grTk(i).g === only)).forEach((i) => {
      const k = this._grTk(i), S = this._grTechState(i), c = S && S.al ? "#ef4444" : k.c, on = !!(S && S.on), x = i.x, y = i.y, nf = k.g === "notfall";
      if (k.k === "bewegung" || k.k === "kamera") {
        const R = (i.rg || (k.k === "kamera" ? 8 : 6)) * sc, fov = i.fov || (k.k === "kamera" ? 90 : 110), a0 = (((i.r || 0) - 90 - fov / 2) * Math.PI) / 180, a1 = (((i.r || 0) - 90 + fov / 2) * Math.PI) / 180;
        d += `<path d="M${x} ${y}L${x + R * Math.cos(a0)} ${y + R * Math.sin(a0)}A${R} ${R} 0 ${fov > 180 ? 1 : 0} 1 ${x + R * Math.cos(a1)} ${y + R * Math.sin(a1)}Z" fill="${c}" fill-opacity="${on ? 0.22 : 0.08}" stroke="${c}" stroke-opacity=".45" stroke-dasharray="4 4"/>`;
      }
      if (k.k === "wlan" || k.k === "router") { const R = (i.rg || (k.k === "wlan" ? 10 : 6)) * sc; d += [1, 0.66, 0.33].map((f) => `<circle cx="${x}" cy="${y}" r="${R * f}" fill="none" stroke="${c}" stroke-opacity="${0.15 + (1 - f) * 0.3}" stroke-dasharray="3 5"/>`).join(""); }
      const s = 11 * q, box = nf ? `<path d="M${x} ${y - s * 1.25}L${x + s * 1.2} ${y + s * 0.9}H${x - s * 1.2}Z" fill="${hell ? "#fff" : "#111827"}" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>` : `<rect x="${x - s}" y="${y - s}" width="${2 * s}" height="${2 * s}" rx="${k.k === "notiz" ? 3 : 6 * q}" fill="${hell ? "#fff" : "#111827"}" stroke="${c}" stroke-width="${on ? 2.2 : 1.4}"/>`;
      const ico = `<g transform="translate(${x - 7.5 * q} ${y - (nf ? 5 : 7.5) * q}) scale(${(15 * q) / 24})" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${K.I[k.i]}</g>`;
      const pulse = on && k.k === "bewegung" ? `<circle cx="${x}" cy="${y}" r="${s}" fill="none" stroke="${c}" stroke-width="2"><animate attributeName="r" values="${s};${s * 2.4}" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="1.6s" repeatCount="indefinite"/></circle>` : "";
      const lab = k.k === "notiz" ? String(i.tx || i.n || "Notiz").slice(0, 28) : S && S.t ? S.t : nf ? k.n : "", lw = lab.length * 5.6 + 12;
      const chip = lab ? `<rect x="${x - lw / 2}" y="${y + s + 3}" width="${lw}" height="15" rx="7.5" fill="${hell ? "#fff" : "#0b1220"}" opacity=".92"/><text x="${x}" y="${y + s + 14}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${S && (S.on || S.al) ? c : nf ? c : T.sub}">${esc(lab)}</text>` : "";
      over += `<g><title>${esc(k.n)}${i.e ? ` · ${esc(this._wzName(i.e))}` : ""}${S && S.t ? ` · ${esc(S.t)}` : ""}${k.k === "notiz" && i.tx ? ` · ${esc(i.tx)}` : ""}</title>${pulse}${box}${ico}${chip}</g>`;
    });
    return d + over;
  }
  /* ---- Baukasten */
  _grTechCat(cur, act) { const K = this._grTK(); return Object.entries(K.G).map(([g, [gn, gc]]) => `<div class="grtkg"><small style="color:${gc}">${gn}</small><div class="grseg">${K.L.filter((x) => x[2] === g).map((x) => `<button class="${cur === x[0] ? "on" : ""}" data-act="${act}" data-v="${x[0]}">${x[1]}</button>`).join("")}</div></div>`).join(""); }
  _grTechProps(sel) {
    const K = this._grTK(), k = this._grTk(sel), st = this._hass.states;
    const groups = this._grTechCat(sel.hk, "grxhk");
    const want = k.d, match = (e) => want.some((w) => { const [dm, dc] = w.split(":"); return e.startsWith(dm + ".") && (!dc || ((st[e].attributes || {}).device_class === dc)); });
    const rm = (this._sfPl().items || []).find((r) => r.t === "r" && r.fl === sel.fl && this._sfInRoom(r, sel.x, sel.y)), ar = rm && this._grArea ? this._grArea(rm) : null;
    const cand = want.length ? Object.keys(st).filter(match).sort((a, b) => ((ar && this._grEntArea(b) === ar.id ? 1 : 0) - (ar && this._grEntArea(a) === ar.id ? 1 : 0)) || this._wzName(a).localeCompare(this._wzName(b), "de")).slice(0, 24) : [];
    const S = this._grTechState(sel), cone = k.k === "bewegung" || k.k === "kamera", rad = k.k === "wlan" || k.k === "router";
    const step = (act, lab, val, unit) => `<div class="vrow" style="margin:6px 0"><span>${lab}</span><div class="step" style="flex:none"><button data-act="${act}" data-s="-1" aria-label="weniger">${ic("minus", 16)}</button><b>${val} ${unit}</b><button data-act="${act}" data-s="1" aria-label="mehr">${ic("plus", 16)}</button></div></div>`;
    return `<details class="grtkd"><summary><span style="color:${k.c}">●</span> ${esc(k.n)} <small class="mut">· ändern</small></summary>${groups}</details>
      ${k.k === "notiz" ? `<div class="sffld"><label>Text der Notiz</label><textarea class="osel" data-f="grxtx" rows="3" maxlength="200" placeholder="z. B. Wasserrohr in der Wand, Ersatzschlüssel im Schrank">${esc(sel.tx || "")}</textarea></div>` : ""}
      ${want.length ? `<div class="sffld"><label>Verbinden mit Home Assistant (optional)</label>${cand.length ? `<div class="gschips"><button class="gsch ${!sel.e ? "sel" : ""}" data-act="grxhe" data-v="">keine</button>${cand.map((e) => `<button class="gsch ${sel.e === e ? "sel" : ""}" data-act="grxhe" data-v="${esc(e)}">${esc(this._wzName(e))}${ar && this._grEntArea(e) === ar.id ? `<small class="mut"> · ${esc(ar.name)}</small>` : ""}</button>`).join("")}</div>` : `<div class="mut sm">Keine passende Entität gefunden.</div>`}${S ? `<div class="grwall ok" style="margin-top:6px">${ic("check", 14)}<span>${esc(this._wzName(sel.e))} · <b>${esc(S.t || "verbunden")}</b></span></div>` : ""}</div>` : ""}
      ${cone ? step("grxhrg", "Reichweite", num(sel.rg || (k.k === "kamera" ? 8 : 6), 1), "m") + step("grxhfov", "Blickwinkel", sel.fov || (k.k === "kamera" ? 90 : 110), "°") + `<div class="grseg" style="margin:2px 0 6px"><button data-act="grxhdir" data-s="-15">↺ 15°</button><button data-act="grxhdir" data-s="15">↻ 15°</button><button data-act="grxhdir" data-s="90">↻ 90°</button></div>` : ""}
      ${rad ? step("grxhrg", "Reichweite", num(sel.rg || (k.k === "wlan" ? 10 : 6), 1), "m") : ""}
      ${k.g === "notfall" ? `<div class="mut sm" style="margin-top:6px">Notfall-Punkte erscheinen auch im Grundriss von Modul 11 – im Alarm sieht man sofort, wo Haupthahn, Sicherungen und Feuerlöscher sind.</div>` : ""}`;
  }
  _grB9Act(a, b) {
    const ed = this._sfEd, v = b && b.dataset ? b.dataset.v : "", s = b && b.dataset ? Number(b.dataset.s || 0) : 0; if (!ed) return false;
    if (a === "grxhkt") { this._grHkLast = v; this._render(); return true; }
    const cur = ed.plan.items.find((x) => x.id === ed.sel); if (!cur || cur.t !== "h") return false;
    if (a === "grxhk") { this._sfSnap(); cur.hk = v; this._grHkLast = v; if (!this._grTk(cur).d.length) cur.e = ""; delete cur.rg; delete cur.fov; this._render(); return true; }
    if (a === "grxhe") { this._sfSnap(); cur.e = v; this._render(); return true; }
    if (a === "grxhrg") { this._sfSnap(); const k = this._grTk(cur), base = cur.rg || (k.k === "kamera" ? 8 : k.k === "wlan" ? 10 : 6); cur.rg = Math.max(1, Math.min(30, Math.round((base + s * (base >= 10 ? 1 : 0.5)) * 2) / 2)); this._render(); return true; }
    if (a === "grxhfov") { this._sfSnap(); const base = cur.fov || (this._grTk(cur).k === "kamera" ? 90 : 110); cur.fov = Math.max(20, Math.min(360, base + s * 10)); this._render(); return true; }
    if (a === "grxhdir") { this._sfSnap(); cur.r = ((((cur.r || 0) + s) % 360) + 360) % 360; this._render(); return true; }
    return false;
  }
  _grB9Change(t) {
    const f = t.dataset ? t.dataset.f : "", ed = this._sfEd;
    if (f === "grxtx" && ed) { const cur = ed.plan.items.find((x) => x.id === ed.sel); if (cur && cur.t === "h") { this._sfSnap(); cur.tx = String(t.value || "").slice(0, 200); this._render(); } return true; }
    return false;
  }
  /* ---- Bereiche und Etagen in Home Assistant anlegen (Reiter „Räume“) */
  _grNoArea(P) { const R = this._grRooms(); return (P.items || []).filter((r) => r.t === "r" && !r.ds && String(r.n || "").trim() && !this._grArea(r) && R[r.id] !== "-"); }
  async _grMakeAreas(withFloors) {
    const P = this._grRaw(); if (!P || !this._admin()) return;
    const todo = this._grNoArea(P); if (!todo.length) { this._toast("Alle Räume haben schon einen Bereich"); return; }
    try {
      let floors = {};
      if (withFloors) {
        let have = []; try { have = await this._hass.callWS({ type: "config/floor_registry/list" }); } catch (_) { have = null; }
        if (have) {
          const lv = (n, i) => { const x = String(n).toLowerCase(); return /^(eg|erdgeschoss)$/.test(x) ? 0 : /^(og|obergeschoss|1\. ?og)$/.test(x) ? 1 : /^(dg|dachgeschoss)$/.test(x) ? 2 : /^(kg|ug|keller|untergeschoss)$/.test(x) ? -1 : i; };
          for (const [i, f] of this._grFloors(P).entries()) {
            const hit = have.find((h) => String(h.name).toLowerCase() === String(f.n).toLowerCase());
            if (hit) floors[f.id] = hit.floor_id; else { const nf = await this._hass.callWS({ type: "config/floor_registry/create", name: f.n, level: lv(f.n, i) }); floors[f.id] = nf.floor_id; }
          }
        }
      }
      const patch = {}; let n = 0;
      for (const r of todo) {
        const ex = Object.values(this._hass.areas || {}).find((a) => String(a.name).toLowerCase() === String(r.n).trim().toLowerCase());
        const ar = ex || (await this._hass.callWS({ type: "config/area_registry/create", name: String(r.n).trim(), ...(floors[r.fl] ? { floor_id: floors[r.fl] } : {}) }));
        if (!ex) n++;
        patch[r.id] = ar.area_id;
      }
      await this._hass.callWS({ type: "fenster_heizung/gr_set", rooms: patch }).then((d) => { const S = this._grS0(); S.d = d; S.ts = Date.now(); });
      this._toast(`${n} ${n === 1 ? "Bereich" : "Bereiche"} angelegt${Object.keys(floors).length ? " und Etagen zugeordnet" : ""}`); this._render();
    } catch (e) { this._toast("Bereiche konnten nicht angelegt werden"); }
  }
  _grAreaBox(P) {
    const no = this._grNoArea(P); if (!this._admin()) return "";
    return `<div class="card"><h2>${ic("home", 18)}Bereiche in Home Assistant</h2>${no.length ? `<div class="mut sm" style="margin-bottom:8px"><b style="color:#fbbf24">${no.length} ${no.length === 1 ? "Raum" : "Räume"} ohne Bereich:</b> ${esc(no.map((r) => r.n).join(", "))}</div>
      <div class="mut sm" style="margin-bottom:10px">Legt die fehlenden Bereiche in Home Assistant an und ordnet sie gleich zu – auf Wunsch mit den Etagen (EG, OG …). Bestehende Bereiche mit gleichem Namen werden nur zugeordnet.</div>
      <div class="grseg"><button data-act="grxmkar" data-k="1">Bereiche und Etagen anlegen</button><button data-act="grxmkar" data-k="0">Nur Bereiche</button></div>` : `<div class="mut sm">Alle Räume im Plan haben einen Bereich. ${ic("check", 14)}</div>`}</div>`;
  }
  /* ---- Raum-Sensoren (Einstellungen) */
  _grEntBox(D) {
    const on = (D.meta || {}).ent === "1", P = D.plan || {}, rs = (P.items || []).filter((r) => r.t === "r" && !r.ds && String(r.n || "").trim());
    const sl = (n) => String(n).toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "raum";
    const ex = rs[0] ? sl(rs[0].n) : "kueche";
    return `<div class="card"><h2>${ic("chart", 18)}Raum-Sensoren in Home Assistant</h2>
      <div class="vrow"><span>Raum-Sensoren anlegen<small class="mut" style="display:block">Je Raum Fläche, Temperatur, Lampen an, Fenster offen und belegt – für eigene Automationen („Küche belegt“), Sprachassistenten und Kennzahlen. Dazu die Wohnfläche des Hauses.</small></span><button class="sw ${on ? "on" : ""}" data-act="grxent" aria-pressed="${on}" aria-label="Raum-Sensoren ein- oder ausschalten"></button></div>
      ${on ? `<div class="mut sm" style="margin-top:6px">${rs.length} Räume · ${rs.length * 5 + 1} Entitäten, z. B.:</div><pre class="grpre">sensor.strom_waerme_raum_${ex}_flaeche
sensor.strom_waerme_raum_${ex}_temperatur
sensor.strom_waerme_raum_${ex}_lampen_an
binary_sensor.strom_waerme_raum_${ex}_fenster_offen
binary_sensor.strom_waerme_raum_${ex}_belegt
sensor.strom_waerme_haus_wohnflaeche</pre><div class="mut sm" style="margin-top:6px">Temperatur, Lampen, Fenster und Bewegung kommen aus dem Bereich des Raums (Reiter „Räume“). Ohne Bereich zeigen sie „nicht verfügbar“.</div>` : ""}</div>`;
  }
  _grB9Act2(a, b) {
    const k = b && b.dataset ? b.dataset.k : "";
    if (a === "grxmkar") { this._grMakeAreas(k === "1"); return true; }
    if (a === "grxent") { const S = this._grS0(), on = !(S.d && S.d.meta && S.d.meta.ent === "1"); this._hass.callWS({ type: "fenster_heizung/gr_cfg", ent: on }).then((d) => { S.d = d; S.ts = Date.now(); this._render(); this._toast(on ? "Raum-Sensoren werden angelegt" : "Raum-Sensoren ausgeschaltet"); }).catch(() => this._toast("Das hat nicht geklappt")); return true; }
    return false;
  }
