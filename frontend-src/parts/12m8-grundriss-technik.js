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
      nfc: '<rect x="5" y="5" width="14" height="14" rx="3"/><path d="M9 9.5a4 4 0 0 1 0 5M12 8a6.5 6.5 0 0 1 0 8M15 6.5a9 9 0 0 1 0 11"/>',
      note: '<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4M8 11h8M8 15h6"/>' };
    const G = { heizen: ["Heizen & Klima", "#f97316"], strom: ["Strom", "#eab308"], sensor: ["Sensoren", "#2dd4bf"], netz: ["Netz & Medien", "#a78bfa"], notfall: ["Notfall", "#ef4444"], notiz: ["Notiz", "#94a3b8"] };
    const L = [
      ["heizkoerper", "Heizkörper", "heizen", "rad", ["climate"]], ["thermostat", "Thermostat", "heizen", "thermo", ["climate"]], ["klima", "Klimagerät", "heizen", "klima", ["climate"]], ["lueftung", "Lüftung", "heizen", "fan", ["fan", "climate"]],
      ["kamin", "Kamin / Ofen", "heizen", "fire", ["sensor:temperature", "climate"]], ["therme", "Therme", "heizen", "boiler", ["climate", "water_heater", "sensor:temperature"]], ["wp", "Wärmepumpe", "heizen", "hp", ["climate", "sensor:power"]], ["speicher", "Warmwasserspeicher", "heizen", "boiler", ["water_heater", "sensor:temperature"]],
      ["steckdose", "Steckdose", "strom", "plug", ["switch"]], ["schalter", "Schalter / Taster", "strom", "switch", ["switch", "light", "event"]], ["sicherung", "Sicherungskasten", "notfall", "fuse", []], ["zaehler", "Zähler", "strom", "meter", ["sensor:power", "sensor:energy"]],
      ["wechselrichter", "Wechselrichter", "strom", "inv", ["sensor:power"]], ["akku", "Batteriespeicher", "strom", "batt", ["sensor:battery", "sensor:power"]], ["wallbox", "Wallbox", "strom", "ev", ["sensor:power", "switch"]],
      ["temp", "Temperatur / Feuchte", "sensor", "temp", ["sensor:temperature", "sensor:humidity"]], ["bewegung", "Bewegungsmelder", "sensor", "motion", ["binary_sensor:motion", "binary_sensor:occupancy", "binary_sensor:presence"]], ["kontakt", "Kontakt (frei)", "sensor", "contact", ["binary_sensor:window", "binary_sensor:door", "binary_sensor:opening"]],
      ["wasser", "Wassermelder", "sensor", "drop", ["binary_sensor:moisture"]], ["luft", "Luftqualität", "sensor", "air", ["sensor:carbon_dioxide", "sensor:pm25", "sensor:volatile_organic_compounds", "sensor:aqi"]], ["hell", "Helligkeit", "sensor", "sun", ["sensor:illuminance"]],
      ["wlan", "WLAN-Zugangspunkt", "netz", "wifi", []], ["router", "Zigbee/Thread-Router", "netz", "mesh", []], ["nfc", "NFC-Tag", "netz", "nfc", ["tag"]], ["kamera", "Kamera", "netz", "cam", ["camera"]], ["klingel", "Klingel", "netz", "bell", ["binary_sensor", "event"]], ["lautsprecher", "Lautsprecher", "netz", "spk", ["media_player"]], ["tv", "TV", "netz", "tv", ["media_player"]],
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
    if (d === "sensor") { const n = Number(v); return { t: isFinite(n) && v !== "" ? `${num(n, (un === "°C" || (Math.abs(n) < 10 && !Number.isInteger(n))) && !Number.isInteger(n) ? 1 : 0)}${un ? " " + un : ""}` : v, on: false }; }
    if (d === "cover") return { t: ({ open: "offen", closed: "zu", opening: "öffnet", closing: "schließt" }[v] || v) + (a.current_position != null && v !== "closed" ? ` ${a.current_position} %` : ""), on: v !== "closed" };
    if (d === "tag") { const ts = Date.parse(v), ago = isFinite(ts) ? (Date.now() - ts) / 1000 : Infinity; return { t: ago < 20 ? "gescannt" : "", on: ago < 20 }; }   /* v0.17 (C13): Tag gescannt kurz im Plan */
    if (d === "lawn_mower" || d === "vacuum") return { t: { mowing: "mäht", cleaning: "saugt", docked: "in Station", paused: "Pause", returning: "fährt heim", error: "Fehler" }[v] || v, on: ["mowing", "cleaning"].includes(v), al: v === "error" };
    if (d === "device_tracker") return { t: v === "home" ? "zu Hause" : v === "not_home" ? "unterwegs" : v, on: v === "home" };
    if (d === "calendar") return { t: a.message ? String(a.message).slice(0, 24) : v === "on" ? "heute" : "–", on: v === "on" };
    if (d === "binary_sensor") { const dc = a.device_class; return { t: v === "on" ? ({ moisture: "NASS", window: "offen", door: "offen", opening: "offen", motion: "Bewegung", occupancy: "belegt", presence: "da" }[dc] || "an") : ({ moisture: "trocken", window: "zu", door: "zu", opening: "zu" }[dc] || "–"), on: v === "on", al: v === "on" && dc === "moisture" }; }
    if (d === "valve") return { t: v === "open" ? "offen" : v === "closed" ? "zu" : v, on: v === "open" };
    if (d === "media_player") return { t: v === "playing" ? "spielt" : v === "off" ? "aus" : v, on: v === "playing" };
    if (d === "water_heater") return { t: a.current_temperature != null ? num(a.current_temperature, 0) + "°" : v, on: v !== "off" };
    if (d === "camera") return { t: v === "streaming" ? "live" : "", on: v === "streaming" || v === "recording" };
    return { t: v === "on" ? "an" : v === "off" ? "aus" : v, on: v === "on" };
  }
  /* Heizkörper wie in echt: Länge × Tiefe in cm, Lamellen, Thermostatkopf am Ende. Heizt er (hvac_action heating), glüht er und strahlt Wärme in den Raum. */
  _grRadDim(i) { return { L: Math.max(30, Math.min(300, i.lw || 100)), D: Math.max(6, Math.min(30, i.dp || 10)) }; }
  /* Zu welcher Seite liegt der Raum? +1 = lokale y-Richtung nach Drehung, −1 = Gegenseite (für Wärmeschein und Beschriftung) */
  _grRoomSide(P, i, dist) {
    const an = ((i.r || 0) * Math.PI) / 180, nx = -Math.sin(an), ny = Math.cos(an), rs = (P.items || []).filter((q) => q.t === "r" && q.fl === i.fl);
    const inR = (x, y) => rs.some((q) => (this._sfInRoom ? this._sfInRoom(q, x, y) : x > q.x && x < q.x + q.w && y > q.y && y < q.y + q.h));
    /* mehrere Abstände prüfen: liegt das Teil nah an einer Wand im Raum, ist die Seite mit mehr Raum die Raumseite */
    const ds = [dist, dist * 2, dist * 3 + 10], hit = (sg) => ds.reduce((n, d) => n + (inR(i.x + nx * sg * d, i.y + ny * sg * d) ? 1 : 0), 0), a = hit(1), b = hit(-1);
    return { nx, ny, side: b > a ? -1 : 1 };
  }
  /* Heizkörper wie in echt (2026.11.4.4b1): Körper an der Wand, Wärmeschein nur zur Raumseite, Temperatur neben dem Heizkörper im Raum – nicht quer darüber */
  _grRadSvg(i, S, sc, T, hell, u, P) {
    const { L, D } = this._grRadDim(i), w = (L / 100) * sc, h = Math.max(6, (D / 100) * sc), x = i.x, y = i.y, rot = i.r ? ` transform="rotate(${i.r} ${x} ${y})"` : "";
    const s = this._hass.states[i.e], a = (s && s.attributes) || {}, heat = !!(S && a.hvac_action === "heating"), off = !s || ["off", "unavailable", "unknown"].includes(s.state), id = `${u || "g"}rad${String(i.id).replace(/[^a-z0-9]/gi, "")}`;
    const R = this._grRoomSide(P || this._sfPl(), i, h / 2 + 14), sd = R.side;
    const body = heat ? `url(#${id}h)` : off ? (hell ? "#d1d5db" : "#4b5563") : hell ? "#f8fafc" : "#cbd5e1", edge = heat ? "#ea580c" : off ? (hell ? "#9ca3af" : "#6b7280") : "#94a3b8";
    const n = Math.max(3, Math.min(60, Math.round(w / Math.max(3, (6 / 100) * sc)))), ribs = Array.from({ length: n - 1 }, (_, j) => x - w / 2 + ((j + 1) * w) / n).map((rx) => `M${rx.toFixed(1)} ${(y - h / 2 + 1).toFixed(1)}V${(y + h / 2 - 1).toFixed(1)}`).join("");
    const gh = Math.min(Math.max(h * 3, 0.35 * sc), 0.8 * sc), gy = sd > 0 ? y + h / 2 : y - h / 2 - gh;
    const glow = heat ? `<g pointer-events="none"${rot}><rect x="${x - w / 2}" y="${gy}" width="${w}" height="${gh}" fill="url(#${id}g)"><animate attributeName="opacity" values=".6;1;.6" dur="3s" repeatCount="indefinite"/></rect></g>` : "";
    const defs = heat ? `<defs><linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdba74"/><stop offset=".5" stop-color="#f97316"/><stop offset="1" stop-color="#ea580c"/></linearGradient><linearGradient id="${id}g" x1="0" y1="${sd > 0 ? 0 : 1}" x2="0" y2="${sd > 0 ? 1 : 0}"><stop offset="0" stop-color="#f97316" stop-opacity=".42"/><stop offset="1" stop-color="#f97316" stop-opacity="0"/></linearGradient></defs>` : "";
    const valve = `<rect x="${x + w / 2}" y="${y - h * 0.3}" width="${Math.max(3, h * 0.55)}" height="${h * 0.6}" rx="1.5" fill="${heat ? "#fdba74" : hell ? "#fff" : "#e5e7eb"}" stroke="${edge}" stroke-width="1"/>`;
    /* Beschriftung: im Raum neben dem Heizkörper, mit Abstand je nach Lage (waagerecht: darunter/darüber, senkrecht: daneben) */
    const lab = S && S.t ? S.t : "", B = this._grRadChip(i, P || this._sfPl(), sc, lab), lw = B ? B.lw : 0, cx = B ? B.cx : x, cy = B ? B.cy : y;
    const chip = lab ? `<g pointer-events="none"><rect x="${cx - lw / 2}" y="${cy - 7.5}" width="${lw}" height="15" rx="7.5" fill="${hell ? "#fff" : "#0b1220"}" opacity=".92"/><text x="${cx}" y="${cy + 3.5}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${heat ? "#f97316" : T.sub}">${esc(lab)}</text></g>` : "";
    const tit = `<title>Heizkörper ${num(L, 0)} × ${num(D, 0)} cm${i.e ? ` · ${esc(this._wzName(i.e))}` : ""}${lab ? ` · ${esc(lab)}` : ""}${heat ? " · heizt" : ""}</title>`;
    return { under: defs + glow, over: `<g>${tit}<g${rot}><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${Math.min(2.5, h / 3)}" fill="${body}" stroke="${edge}" stroke-width="1.2"/><path d="${ribs}" stroke="${heat ? "#c2410c" : edge}" stroke-opacity=".55" stroke-width=".8"/>${valve}</g>${chip}</g>` };
  }
  /* Lage der Temperatur am Heizkörper – auch als Hindernis für Raumnamen (2026.11.4.4b3) */
  _grRadChip(i, P, sc, lab) {
    if (!lab) return null;
    const { D } = this._grRadDim(i), h = Math.max(6, (D / 100) * sc), R = this._grRoomSide(P, i, h / 2 + 14), lw = lab.length * 5.4 + 12, off2 = h / 2 + 5 + Math.abs(R.nx) * (lw / 2) + Math.abs(R.ny) * 7.5;
    return { cx: i.x + R.nx * R.side * off2, cy: i.y + R.ny * R.side * off2, lw };
  }
  _grRadObs(P, fl, sc) {
    return (P.items || []).filter((i) => i.t === "h" && i.hk === "heizkoerper" && i.fl === fl && i.e).map((i) => { const S = this._grTechState(i), B = this._grRadChip(i, P, sc, S && S.t ? S.t : ""); return B ? [B.cx - B.lw / 2 - 3, B.cy - 10, B.cx + B.lw / 2 + 3, B.cy + 10] : null; }).filter(Boolean);
  }
  _grTechSvg(P, fl, T, q, u, hell, only) {
    const K = this._grTK(), sc = P.scale > 0 ? P.scale : 40; let d = "", over = "";
    (P.items || []).filter((i) => i.t === "h" && i.fl === fl && (!only || this._grTk(i).g === only)).forEach((i) => {
      const k = this._grTk(i), S = this._grTechState(i), c = S && S.al ? "#ef4444" : k.c, on = !!(S && S.on), x = i.x, y = i.y, nf = k.g === "notfall";
      if (k.k === "heizkoerper") { const R = this._grRadSvg(i, S, sc, T, hell, u, P); d += R.under; over += R.over; return; }   /* 2026.11.4.3b5: Heizkörper maßstäblich statt Symbol */
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
  /* Katalog der Haustechnik als Kacheln wie bei den Möbeln: Suche, Kategorien, Symbol, Seiten statt Scrollen (neue Optik, quer) */
  _grTechCat(cur, act) {
    const K = this._grTK(), ct = this._grTCT || "", num0 = (v) => v, esc0 = esc;
    const PG = this._grPaged && this._grPaged(), pp = PG ? this._grPerPage() : 0, list = K.L.filter((x) => !ct || x[2] === ct), pg = Math.min(this._grPg || 0, Math.max(0, Math.ceil(list.length / (pp || 1)) - 1));
    const chip = (k, t) => `<button class="${ct === k ? "on" : ""}" data-act="grxtcat" data-v="${k}" aria-pressed="${ct === k}">${t}</button>`;
    const rows = list.map((x, n) => `<div class="pkrow grkt${cur === x[0] ? " cur" : ""}"${pp && (n < pg * pp || n >= (pg + 1) * pp) ? " hidden" : ""} data-s="${esc0((x[1] + " " + K.G[x[2]][0]).toLowerCase())}"><button class="grkb" data-act="${act}" data-v="${x[0]}"><svg class="grkth" viewBox="-6 -2 36 28" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g fill="none" stroke="${K.G[x[2]][1]}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${K.I[x[3]]}</g></svg><b>${esc0(x[1])}</b><small style="color:${K.G[x[2]][1]}">${esc0(K.G[x[2]][0])}</small></button></div>`).join("");
    return `${this._grKatCss()}<div class="pkbox grkc"${pp ? ` data-pp="${pp}"` : ""}><input class="grkq" data-f="enq" type="search" placeholder="Suchen: Steckdose, Sensor, Kamera …" aria-label="Katalog durchsuchen" autocomplete="off"><div class="grkcs">${chip("", "Alle")}${Object.entries(K.G).map(([g, [gn]]) => chip(g, esc0(gn))).join("")}</div>
      <div class="grkl">${rows}<div class="mut sm pkno" hidden style="padding:8px">Nichts gefunden.</div></div>${pp ? `<div class="grkpg"><button data-act="grxpg" data-v="-1" aria-label="Vorherige Seite">‹</button><span class="grkpl">${pg + 1} / ${Math.max(1, Math.ceil(list.length / pp))}</span><button data-act="grxpg" data-v="1" aria-label="Nächste Seite">›</button></div>` : `<div class="mut sm" style="margin-top:6px">${K.L.length} Teile</div>`}</div>`;
  }
  _grTechProps(sel) {
    const K = this._grTK(), k = this._grTk(sel), st = this._hass.states;
    const groups = this._grTechCat(sel.hk, "grxhk");
    const want = k.d, match = (e) => want.some((w) => { const [dm, dc] = w.split(":"); return e.startsWith(dm + ".") && (!dc || ((st[e].attributes || {}).device_class === dc)); });
    const cand = want.length ? Object.keys(st).filter(match) : [];   /* Reihenfolge macht die Sensorsuche (Raum zuerst) */
    const S = this._grTechState(sel), cone = k.k === "bewegung" || k.k === "kamera", rad = k.k === "wlan" || k.k === "router";
    const step = (act, lab, val, unit) => `<div class="vrow" style="margin:6px 0"><span>${lab}</span><div class="step" style="flex:none"><button data-act="${act}" data-s="-1" aria-label="weniger">${ic("minus", 16)}</button><b>${val} ${unit}</b><button data-act="${act}" data-s="1" aria-label="mehr">${ic("plus", 16)}</button></div></div>`;
    return `<details class="grtkd"><summary><span style="color:${k.c}">●</span> ${esc(k.n)} <small class="mut">· ändern</small></summary>${groups}</details>
      ${k.k === "notiz" ? `<div class="sffld"><label>Text der Notiz</label><textarea class="osel" data-f="grxtx" rows="3" maxlength="200" placeholder="z. B. Wasserrohr in der Wand, Ersatzschlüssel im Schrank">${esc(sel.tx || "")}</textarea></div>` : ""}
      ${want.length ? `<div class="sffld"><label>Verbinden mit Home Assistant (optional)</label>${cand.length || sel.e ? this._grPick(sel, cand, want.some((w) => w.startsWith("climate")) ? /thermostat|heiz|trv|radiator|ventil/i : new RegExp(String(k.n || "").split(/[\s&-]/)[0].replace(/[^a-zäöüß]/gi, "") || "x", "i")) : `<div class="mut sm">Keine passende Entität gefunden.</div>`}${S ? `<div class="grwall ok" style="margin-top:6px">${ic("check", 14)}<span>${esc(this._wzName(sel.e))} · <b>${esc(S.t || "verbunden")}</b></span></div>` : ""}</div>` : ""}
      ${k.k === "heizkoerper" ? (() => { const { L, D } = this._grRadDim(sel); return step("grxhlw", "Länge", num(L, 0), "cm") + step("grxhdp", "Tiefe", num(D, 0), "cm") + `<div class="grseg" style="margin:2px 0 6px"><button data-act="grxhdir" data-s="-15">↺ 15°</button><button data-act="grxhdir" data-s="15">↻ 15°</button><button data-act="grxhdir" data-s="90">↻ 90°</button><button data-act="grxhwall">An Wand</button></div>`; })() : ""}
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
    if (a === "grxhlw") { this._sfSnap(); cur.lw = Math.max(30, Math.min(300, this._grRadDim(cur).L + s * 10)); this._render(); return true; }
    if (a === "grxhdp") { this._sfSnap(); cur.dp = Math.max(6, Math.min(30, this._grRadDim(cur).D + s * 2)); this._render(); return true; }
    if (a === "grxhwall") {   /* an die nächste Wand stellen: parallel, auf der Raumseite, mit kleinem Abstand */
      const sn = this._sfSnapOpen(cur.fl, cur.x, cur.y, 120, null); if (!sn) { this._toast("Keine Wand in der Nähe"); return true; }
      this._sfSnap(); const sc = this._sfPl().scale || 40, r = (sn.r * Math.PI) / 180, nx = -Math.sin(r), ny = Math.cos(r), side = Math.sign((cur.x - sn.x) * nx + (cur.y - sn.y) * ny) || 1, off = 10 + (this._grRadDim(cur).D / 200) * sc + 0.04 * sc;
      cur.x = Math.round(sn.x + nx * side * off); cur.y = Math.round(sn.y + ny * side * off); cur.r = sn.r; this._render(); return true;
    }
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
