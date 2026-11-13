  /* Fahrzeuge und Karten (nach dem Vorbild von evcc): Das Fahrzeug wird an der Karte erkannt, die an der Wallbox angelegt wird. */
  _rfCard(bare) {
    const sn = this._wbSnap(), c = sn.cfg, adm = this._admin(), cards = (sn.info && sn.info.cards) || [], who = sn.who || null;
    const nm = (i) => (cards.find((x) => x.i === i) || {}).n || `Karte ${i}`;
    const MODES = [["off", "Aus"], ["pv", "Sonne"], ["minpv", "Sonne + Netz"], ["now", "Voll"]], ML = Object.fromEntries(MODES);
    const mode = (id, cur) => `<div class="gschips" style="margin:6px 0">${MODES.map(([k, l]) => `<button class="gsch ${cur === k ? "sel" : ""}" data-act="wbrmode" data-v="${id}" data-k="${k}" aria-pressed="${cur === k}" ${adm ? "" : "disabled"}>${l}</button>`).join("")}</div>`;
    const lim = (id, val) => `<div class="vrow"><span>Ladelimit</span><div class="step" style="flex:none"><button data-act="wbrlim" data-v="${id}" data-s="-5" aria-label="weniger" ${adm ? "" : "disabled"}>${ic("minus", 18)}</button><b>${val} %</b><button data-act="wbrlim" data-v="${id}" data-s="5" aria-label="mehr" ${adm ? "" : "disabled"}>${ic("plus", 18)}</button></div></div>`;
    const used = new Set(c.vehicles.flatMap((x) => x.ids));
    const owner = (i) => c.vehicles.find((x) => x.ids.includes(i)), rfid = !this._wbHa(c), socs = sn.socs || {};
    const assign = `<div class="rfa"><div class="lsec">${ic("shield", 15)}Karten zuordnen</div><div class="mut sm" style="margin:2px 0 6px">Pro Fahrzeug sind beliebig viele Karten möglich. Jede Karte gehört aber nur zu einem Fahrzeug.</div>

      ${cards.length ? cards.map((k) => { const o = owner(k.i), act = who && who.card === k.i; return `<div class="rfc"><div class="rfn"><b>${esc(k.n)}</b>${act ? `<span class="ost home">Aktiv</span>` : ""}<small class="mut">Karte ${k.i} · ${num(k.kwh, 0)} kWh geladen · ${o ? "gehört zu " + esc(o.name) : "keinem Fahrzeug zugeordnet (Gast)"}</small></div>
        ${c.vehicles.length ? `<div class="gschips" style="margin:4px 0 0">${c.vehicles.map((x) => `<button class="gsch ${o && o.id === x.id ? "sel" : ""}" data-act="wbrassign" data-v="${x.id}" data-k="${k.i}" aria-pressed="${!!(o && o.id === x.id)}" ${adm ? "" : "disabled"}>${esc(x.name)}</button>`).join("")}</div>` : `<div class="mut sm">Lege zuerst ein Fahrzeug an.</div>`}</div>`; }).join("") : `<div class="mut sm">Es wurden noch keine Karten von der Wallbox gelesen. Lege sie in der go-e-App an (Einstellungen → Zugang → RFID-Karten).</div>`}</div>`;
    const veh = c.vehicles.map((x) => `<div class="rfv"><div class="oper" style="padding:0"><span class="rfpic">${this._evThumb(x)}</span><div class="opi"><b>${esc(x.name)}</b><small>${this._evVehLine(x, socs[x.id])}</small></div>${adm ? `<button class="btn2" data-act="wbrvedit" data-v="${x.id}" style="flex:none">${ic("pencil", 15)} Aussehen &amp; Sensoren</button>` : ""}</div>
      ${rfid ? `<div class="mut sm" style="margin-top:8px">${x.ids.length ? "Erkannt an: " + x.ids.map((i) => esc(nm(i))).join(", ") : "Noch keine Karte zugeordnet"}</div>
      <div class="mut sm" style="margin-top:8px">Kennungen (Karten aus der Wallbox)</div>
      <div class="gschips" style="margin:6px 0">${x.ids.map((i) => `<button class="gsch sel" data-act="wbrrm" data-v="${x.id}" data-k="${i}" aria-label="${esc(nm(i))} entfernen" ${adm ? "" : "disabled"}>${esc(nm(i))} ${ic("close", 12)}</button>`).join("")}</div>
      ${cards.some((k) => !used.has(k.i)) ? `<div class="mut sm" style="margin-top:4px">Freie Karten antippen, um sie diesem Fahrzeug zuzuordnen</div><div class="gschips" style="margin:6px 0">${cards.filter((k) => !used.has(k.i)).map((k) => `<button class="gsch" data-act="wbrcadd" data-v="${x.id}" data-k="${k.i}" aria-label="${esc(k.n)} zuordnen" ${adm ? "" : "disabled"}>${ic("plus", 12)} ${esc(k.n)}</button>`).join("")}</div>` : (cards.length ? `<div class="mut sm" style="margin-top:4px">Alle Karten der Wallbox sind zugeordnet.</div>` : `<div class="mut sm" style="margin-top:4px">Es sind noch keine Karten in der go-e-App angelegt.</div>`)}` : ""}
      <div class="mut sm" style="margin-top:8px">${rfid ? "Modus, sobald das Fahrzeug erkannt wird" : "Modus für dieses Fahrzeug"}</div>${mode(x.id, x.mode)}${lim(x.id, x.limit)}</div>`).join("");
    const dv = `<div class="rfa"><div class="lsec">${ic("car", 15)}${rfid ? "Ohne Karte gilt" : "Fahrzeug an dieser Wallbox"}</div><div class="mut sm" style="margin:2px 0 6px">${rfid ? "Wird keine Karte angelegt, gilt dieses Fahrzeug (Ladestand, Modus, Abfahrt). „Keines“: Es gilt der Modus oben." : "Diese Wallbox meldet keine Karten. Wähle, welches Fahrzeug hier lädt – sein Ladestand, Modus und seine Abfahrt gelten."}</div>
      <div class="gschips">${[["", rfid ? "Keines" : "Keines (Modus oben)"], ...c.vehicles.map((x) => [x.id, x.name])].map(([k, t]) => `<button class="gsch ${(c.defVeh || "") === k ? "sel" : ""}" data-act="wbrvdef" data-v="${k}" aria-pressed="${(c.defVeh || "") === k}" ${adm ? "" : "disabled"}>${esc(t)}</button>`).join("")}</div></div>`;
    const st = !sn.ok ? ["Wallbox nicht erreichbar", sn.error || "keine Antwort"]
      : who && who.kind === "vehicle" && who.auto ? [`Es gilt: ${who.name}`, `${rfid ? "Keine Karte angelegt, es gilt das Fahrzeug ohne Karte" : "Fest zugeordnet"}. Modus „${ML[who.mode]}“, Ladelimit ${who.limit} %.`]
      : !who ? [rfid ? "Keine Kennung erkannt" : "Kein Fahrzeug zugeordnet", c.lock ? "Strom & Wärme verändert nichts, bis eine Karte angelegt wird." : "Es gilt der Modus der Laderegelung oben."]
      : who.kind === "vehicle" ? [`Erkannt: ${who.name} (Karte „${nm(who.card)}“)`, `Die Regelung arbeitet im Modus „${ML[who.mode]}“ mit Ladelimit ${who.limit} %.`]
      : [`Erkannt: Gastfahrzeug (Karte „${nm(who.card)}“)`, `Die Karte ist keinem Fahrzeug zugeordnet. Es gilt der Modus „${ML[who.mode]}“.`];
    return `${bare ? "<div>" : `<div class="card ocard"><h2>${ic("car", 18)}Fahrzeuge${rfid ? " &amp; Karten" : ""}</h2>`}
      <div class="mut sm" style="margin-bottom:8px">${rfid ? `Jedes Fahrzeug hat eigene Sensoren und ein eigenes Aussehen. Wie bei evcc wird das Fahrzeug an der Karte erkannt, die an der Wallbox angelegt wird. Als Kennung dient der Kartenname aus der go-e-App. Eine Karte gehört zu genau einem Fahrzeug, ein Fahrzeug kann mehrere Karten haben.` : "Jedes Fahrzeug hat eigene Sensoren, eine eigene Akkugröße und ein eigenes Aussehen. Diese Wallbox meldet keine Karten: Unten wählst du, welches Fahrzeug hier lädt."}</div>
      <div class="gst" style="margin:0 0 10px">${ic(who ? "check" : "info", 15)}<span><b>${esc(st[0])}</b><br>${esc(st[1])}</span></div>
      ${rfid ? assign : ""}
      ${veh}
      ${c.vehicles.length ? dv : ""}
      ${adm && c.vehicles.length < 6 ? `<button class="lnk" data-act="wbrvnew">${ic("plus", 16)}Fahrzeug hinzufügen</button>` : ""}
      ${rfid ? `<div class="rfv"><div class="oper" style="padding:0"><span class="oav" style="background:#64748b">${ic("user", 20)}</span><div class="opi"><b>Gastfahrzeug</b><small>Unbekannte Karte</small></div></div>${mode("guest", c.guest.mode)}${lim("guest", c.guest.limit)}</div>` : ""}
      ${rfid ? `<div class="vrow"><span>Nur mit erkannter Karte regeln<small class="mut" style="display:block">Ohne angelegte Karte verändert Strom &amp; Wärme nichts an der Wallbox. Die eigentliche Sperre kommt von der Kartenpflicht in der go-e-App.</small></span><button class="sw ${c.lock ? "on" : ""}" data-act="wbrlock" aria-pressed="${c.lock}" aria-label="Nur mit erkannter Karte regeln" ${adm ? "" : "disabled"}></button></div>` : ""}
      <div class="vrow"><span>Nach dem Abstecken zurücksetzen<small class="mut" style="display:block">Die Wallbox wird auf „neutral“ gestellt und die Erkennung vergessen. Sie gilt nur für eine Ladung.</small></span><button class="sw ${c.reset ? "on" : ""}" data-act="wbrreset" aria-pressed="${c.reset}" aria-label="Nach dem Abstecken zurücksetzen" ${adm ? "" : "disabled"}></button></div></div>`;
  }
  _rfAct(a, b) {
    const c = this._wb(), k = b.dataset.k, id = b.dataset.v;
    const upd = (fn) => { if (id === "guest") this._wbSave({ guest: fn({ ...c.guest }) }); else this._wbSave({ vehicles: c.vehicles.map((x) => (x.id === id ? fn({ ...x }) : x)) }); };
    if (a === "wbrlock") this._wbSave({ lock: !c.lock });
    else if (a === "wbrreset") this._wbSave({ reset: !c.reset });
    else if (a === "wbrmode") upd((x) => ({ ...x, mode: k }));
    else if (a === "wbrlim") upd((x) => ({ ...x, limit: Math.max(50, Math.min(100, x.limit + Number(b.dataset.s))) }));
    else if (a === "wbrrm") upd((x) => ({ ...x, ids: x.ids.filter((i) => i !== Number(k)) }));
    else if (a === "wbrcadd" || a === "wbrassign") { const n = Number(k), has = (c.vehicles.find((x) => x.id === id) || { ids: [] }).ids.includes(n); this._wbSave({ vehicles: c.vehicles.map((x) => (x.id === id ? { ...x, ids: has ? x.ids.filter((i) => i !== n) : [...x.ids, n] } : { ...x, ids: x.ids.filter((i) => i !== n) })) }, true); }

    else if (a === "wbrvedit") { this._modal = { type: "wbveh", id, back: this._modal && this._modal.type === "evset" ? "evset" : "" }; this._renderModal(); return; }
    else if (a === "wbrvdone") { const bk = (this._modal || {}).back; this._pkId = null; this._modal = bk ? { type: bk } : null; this._renderModal(); }
    else if (a === "wbrvdef") this._wbSave({ defVeh: id || "" }, true);
    else if (a === "wbrvbrand") upd((x) => ({ ...x, brand: x.brand === k ? "" : k }));
    else if (a === "wbrvbody") upd((x) => ({ ...x, body: k }));
    else if (a === "wbrvcol") upd((x) => ({ ...x, color: k }));
    else if (a === "wbrvdel2") { this._wbSave({ vehicles: c.vehicles.filter((x) => x.id !== id), ...(c.defVeh === id ? { defVeh: "" } : {}) }, true); const bk = (this._modal || {}).back; this._modal = bk ? { type: bk } : null; this._renderModal(); }
    else if (a === "wbrvnew") { const nid = "v" + Date.now().toString(36), n = c.vehicles.length + 1; this._wbSave({ vehicles: [...c.vehicles, { id: nid, name: "Fahrzeug " + n, ids: [], mode: "pv", limit: 80, body: "limousine", color: "blue", cap: 0, ent: { soc: "", odo: "", range: "" } }], ...(!c.vehicles.length ? { defVeh: nid } : {}) }, true); this._modal = { type: "wbveh", id: nid, back: this._modal && this._modal.type === "evset" ? "evset" : "" }; this._renderModal(); return; }
    else if (a === "wbrvadd") { const n = c.vehicles.length + 1; this._wbSave({ vehicles: [...c.vehicles, { id: "v" + Date.now().toString(36), name: "Fahrzeug " + n, ids: [], mode: "pv", limit: 80 }] }, true); }
    else if (a === "wbrvdel") this._wbSave({ vehicles: c.vehicles.filter((x) => x.id !== id) }, true);
    if (this._modal && this._modal.type === "wbveh") this._renderModal();
    this._render();
  }
  /* Elektroauto & Wallbox (Beta) */
  _evState() { const s = this._mdState(); return s.ev || (s.ev = { brand: "", model: "", body: "limousine", color: "blue", ent: { soc: "", odo: "", range: "", plug: "", power: "", charging: "" } }); }
  _evNum(eid) { const st = eid && this._hass.states[eid]; if (!st) return null; const v = parseFloat(String(st.state).replace(",", ".")); return isFinite(v) ? (st.attributes.unit_of_measurement === "kW" ? v * 1000 : v) : null; }
  /* v0.6: jedes Fahrzeug hat eigene Sensoren und ein eigenes Aussehen. Es gilt das an der Karte erkannte Fahrzeug,
     sonst das Fahrzeug ohne Karte, sonst das einzige. Stecker und Ladeleistung kommen von der Wallbox. */
  _evVeh() { const sn = this._wbSnap(), vs = sn.cfg.vehicles || []; return vs.find((x) => x.id === sn.veh) || vs.find((x) => x.id === sn.cfg.defVeh) || (vs.length === 1 ? vs[0] : null) || vs[0] || null; }
  _evLook(v) { v = v === undefined ? this._evVeh() : v; const L = this._evState(); return v ? { brand: v.brand || "", model: v.model || "", body: v.body || "limousine", color: v.color || "blue", name: v.name } : { brand: L.brand, model: L.model, body: L.body, color: L.color, name: "" }; }
  _evTitle(v) { const L = this._evLook(v); return v || (v === undefined && this._evVeh()) ? (L.name || "Fahrzeug") : ([L.brand === "Andere" ? "" : L.brand, L.model].filter(Boolean).join(" ") || "Fahrzeug & Wallbox"); }
  _evVehLine(x, soc) { const st = this._hass.states, E = x.ent || {}, ok = (e) => e && st[e]; return [soc != null ? `${E.soc ? "" : "≈ "}${num(soc, 0)} %${E.soc ? "" : " geschätzt"}` : E.soc ? (ok(E.soc) ? "Ladestand ohne Wert" : "Ladestand-Sensor fehlt") : "kein Ladestand-Sensor", x.cap ? `Akku ${num(x.cap, 1)} kWh` : "", E.odo && ok(E.odo) ? `${num(this._evNum(E.odo), 0)} km` : ""].filter(Boolean).map(esc).join(" · "); }
  _evThumb(x, w = 96) { const L = this._evLook(x); return `<svg viewBox="282 96 428 164" width="${w}" height="${Math.round(w * 0.383)}" aria-hidden="true">${this._evCarHD(L.body, L.color, { uid: "t" + x.id, port: false }).svg}</svg>`; }
  /* Auto allein (für Fahrzeugliste und Bearbeiten): gleiche Formen und Farben wie die Szene */
  _evCar(L, sfx, chg = false, night = false) {
    const H = EV_SHAPES[L.body] || EV_SHAPES.limousine, C = EV_COLORS[L.color] || EV_COLORS.blue, [w1, w2] = H.wh, [px, py] = H.port, u = "evc" + String(sfx).replace(/[^a-z0-9]/gi, "");
    const wh = (cx) => `<circle cx="${cx}" cy="217" r="41" fill="#07090d"/><circle cx="${cx}" cy="217" r="33" fill="#0b0d11"/><circle cx="${cx}" cy="217" r="23" fill="url(#${u}r)"/><circle cx="${cx}" cy="217" r="18" fill="#161a21"/>${Array.from({ length: 10 }, (_, k) => k * 36).map((a) => `<line x1="${(cx + 5 * Math.sin(a * Math.PI / 180)).toFixed(1)}" y1="${(217 - 5 * Math.cos(a * Math.PI / 180)).toFixed(1)}" x2="${(cx + 19 * Math.sin((a + 8) * Math.PI / 180)).toFixed(1)}" y2="${(217 - 19 * Math.cos((a + 8) * Math.PI / 180)).toFixed(1)}" stroke="url(#${u}r)" stroke-width="3" stroke-linecap="round"/>`).join("")}<circle cx="${cx}" cy="217" r="6" fill="#2b313b"/>`;
    return `<defs><linearGradient id="${u}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C[1]}"/><stop offset=".45" stop-color="${C[2]}"/><stop offset="1" stop-color="${C[3]}"/></linearGradient>
      <linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b3e52"/><stop offset="1" stop-color="#0a1018"/></linearGradient><linearGradient id="${u}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e5e9ef"/><stop offset=".5" stop-color="#9aa3b1"/><stop offset="1" stop-color="#d7dce4"/></linearGradient><clipPath id="${u}b"><path d="${H.body}"/></clipPath></defs>
      <ellipse cx="${(H.rear + H.front) / 2}" cy="251" rx="${(H.front - H.rear) / 1.9}" ry="8" fill="#000" opacity=".4"/><path d="${H.body}" fill="url(#${u}p)"/>
      <g clip-path="url(#${u}b)"><rect x="${H.rear}" y="${H.gb + 14}" width="420" height="50" fill="#000" opacity=".18"/><path d="M${H.rear} ${H.gt + 36} C420 ${H.gt + 28} 560 ${H.gt + 36} ${H.front} ${H.gt + 62}" stroke="#fff" stroke-width="3" fill="none" opacity=".35"/><rect x="${H.rear}" y="224" width="420" height="16" fill="#10141b"/></g>
      <path d="${H.glass}" fill="url(#${u}g)" stroke="#05070a" stroke-width="2"/><path d="M${H.pil - 3} ${H.gt - 2} L${H.pil + 1} ${H.gb + 1} L${H.pil + 5} ${H.gb + 1} L${H.pil + 3} ${H.gt - 2} Z" fill="${C[3]}"/>
      <path d="M${H.front - 34} ${H.ly - 2} C${H.front - 18} ${H.ly - 2} ${H.front - 6} ${H.ly + 2} ${H.front} ${H.ly + 8} L${H.front} ${H.ly + 13} C${H.front - 10} ${H.ly + 8} ${H.front - 22} ${H.ly + 6} ${H.front - 34} ${H.ly + 6} Z" fill="${night ? "#fffbe6" : "#f8fbff"}"/>
      <path d="M${H.tl[0]} ${H.tl[1] - 9} L${H.tl[0] + 8} ${H.tl[1] - 11} L${H.tl[0] + 8} ${H.tl[1] + 9} L${H.tl[0]} ${H.tl[1] + 11} Z" fill="#d6192a"/><path d="${H.body}" fill="none" stroke="${C[4]}" stroke-width="1.6"/>
      <circle cx="${px}" cy="${py}" r="6" fill="#0d1426" stroke="#8aa0c8" stroke-width="1.5"/><circle cx="${px}" cy="${py}" r="3" fill="${chg ? "#22e06b" : "#9aa5b1"}"/>${wh(w1)}${wh(w2)}`;
  }
  _evData() {
    const v = this._evVeh(), L = this._evState().ent, E = { ...L, ...(v ? { soc: (v.ent || {}).soc, odo: (v.ent || {}).odo, range: (v.ent || {}).range } : {}) }, st = this._hass.states, S = (e) => (e && st[e] ? String(st[e].state).toLowerCase() : "");
    const sn = this._wbSnap(), wb = this._wbOn() && sn.ok ? sn.info : null;
    const est = v && !E.soc && (sn.est || {})[v.id] ? sn.est[v.id] : null;
    const power = E.power ? this._evNum(E.power) : wb && wb.power != null ? wb.power : null, soc = est ? est.soc : this._evNum(E.soc), odo = this._evNum(E.odo), range = this._evNum(E.range);
    if (wb && !E.plug && !E.charging && wb.car != null) return { soc, est, odo, range, power, charging: wb.car === 2, plugged: [2, 3, 4].includes(wb.car), any: true, veh: v };
    const ON = /^(on|true|yes|connected|plugged|plugged_in|ev_connected|vehicle_connected|charging|ready|waiting|complete|finished|preparing|suspended)/, OFF = /^(off|false|no|disconnected|unplugged|not_connected|available|unavailable|unknown|none)/;
    const chg = E.charging ? ON.test(S(E.charging)) && !OFF.test(S(E.charging)) : power != null && power >= 100;
    const plug = E.plug ? ON.test(S(E.plug)) && !OFF.test(S(E.plug)) : chg;
    return { soc, est, odo, range, power, charging: plug && chg, plugged: plug || chg, any: Object.values(E).some(Boolean) || !!v || this._wbOn(), veh: v };
  }
  _evScene(d) {
    const V = this._evLook(d.veh), H = EV_SHAPES[V.body] || EV_SHAPES.limousine, C = EV_COLORS[V.color] || EV_COLORS.blue, [px, py] = H.port, [w1, w2] = H.wh;
    const led = d.charging ? "#22e06b" : d.plugged ? "#ffa51f" : "#9aa5b1", cab = `M112 207 C108 272 196 270 236 248 C${px - 38} ${py + 49} ${px - 14} ${py + 19} ${px} ${py}`;
    const wheel = (cx) => `<g><ellipse cx="${cx}" cy="250" rx="30" ry="3" fill="#000" opacity=".5"/><circle cx="${cx}" cy="217" r="33" fill="#0b0d11"/><circle cx="${cx}" cy="217" r="33" fill="none" stroke="#1d222b" stroke-width="3"/><circle cx="${cx}" cy="217" r="27" fill="none" stroke="#252b36" stroke-width="1.5"/>
        <circle cx="${cx}" cy="217" r="23" fill="url(#evrim)"/><circle cx="${cx}" cy="217" r="23" fill="none" stroke="#4b5563" stroke-width="1.2"/><circle cx="${cx}" cy="217" r="19" fill="#161a21"/>
        <circle cx="${cx}" cy="217" r="17" fill="none" stroke="#9aa3b1" stroke-width="1" opacity=".5"/><path d="M${cx - 15} 212 A16 16 0 0 1 ${cx - 4} 202" stroke="#d7141f" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
        <g stroke="url(#evrim)" stroke-width="3" stroke-linecap="round">${Array.from({ length: 10 }, (_, k) => k * 36).map((ang) => `<line x1="${cx + 6 * Math.sin(ang * Math.PI / 180)}" y1="${217 - 6 * Math.cos(ang * Math.PI / 180)}" x2="${cx + 20 * Math.sin((ang + 8) * Math.PI / 180)}" y2="${217 - 20 * Math.cos((ang + 8) * Math.PI / 180)}"/>`).join("")}</g>
        <circle cx="${cx}" cy="217" r="7" fill="#2b313b"/><circle cx="${cx}" cy="217" r="3.2" fill="#b4bcc8"/><path d="M${cx - 24} 205 A26 26 0 0 1 ${cx + 6} 192" stroke="#fff" stroke-width="1.5" fill="none" opacity=".25"/></g>`;
    return `<svg class="evsvg" viewBox="0 0 760 290" role="img" aria-label="${d.charging ? "Fahrzeug lädt" : d.plugged ? "Ladekabel angesteckt" : "Ladekabel nicht angesteckt"}">
      <defs>
        <linearGradient id="evsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5aa7e6"/><stop offset=".62" stop-color="#bfe0f7"/><stop offset="1" stop-color="#eaf5fb"/></linearGradient>
        <radialGradient id="evsun" cx=".86" cy=".16" r=".45"><stop offset="0" stop-color="#fff7d1" stop-opacity=".95"/><stop offset=".35" stop-color="#fff2b0" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <linearGradient id="evpaint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C[1]}"/><stop offset=".45" stop-color="${C[2]}"/><stop offset="1" stop-color="${C[3]}"/></linearGradient>
        <linearGradient id="evglass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b3e52"/><stop offset=".5" stop-color="#16222f"/><stop offset="1" stop-color="#0a1018"/></linearGradient>
        <linearGradient id="evrim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e5e9ef"/><stop offset=".5" stop-color="#9aa3b1"/><stop offset="1" stop-color="#d7dce4"/></linearGradient>
        <linearGradient id="evwall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ece7df"/><stop offset="1" stop-color="#d6cfc4"/></linearGradient>
        <linearGradient id="evbox" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9dde3"/></linearGradient>
        <linearGradient id="evroad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b7280"/><stop offset="1" stop-color="#4b5563"/></linearGradient>
        <clipPath id="evbody"><path d="${H.body}"/></clipPath><clipPath id="evgl"><path d="${H.glass}"/></clipPath><linearGradient id="evrefl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".35" stop-color="#000" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>
        <filter id="evblur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
        <filter id="evglow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.5"/></filter></defs>
      <rect width="760" height="290" rx="16" fill="url(#evsky)"/><rect width="760" height="290" rx="16" fill="url(#evsun)"/>
      <g opacity=".9" fill="#fff"><ellipse cx="260" cy="58" rx="46" ry="12" opacity=".85"/><ellipse cx="292" cy="50" rx="30" ry="11" opacity=".9"/><ellipse cx="520" cy="46" rx="38" ry="9" opacity=".75"/></g>
      <g filter="url(#evblur)" opacity=".55"><ellipse cx="300" cy="244" rx="120" ry="16" fill="#6f9a74"/><ellipse cx="480" cy="246" rx="150" ry="13" fill="#5d8a66"/><ellipse cx="680" cy="244" rx="110" ry="15" fill="#7aa57f"/></g>
      <rect y="248" width="760" height="42" fill="url(#evroad)"/><rect y="248" width="760" height="3" fill="#8b93a0"/><g stroke="#e5e7eb" stroke-width="3" opacity=".75"><path d="M250 276H330M440 276H520M630 276H710" stroke-linecap="round"/></g>
      <rect x="20" y="30" width="170" height="218" fill="url(#evwall)"/><rect x="20" y="30" width="170" height="10" fill="#bdb5a8"/><rect x="190" y="30" width="6" height="218" fill="#a69d8f" opacity=".6"/>
      <g stroke="#c8c0b3" stroke-width="1" opacity=".7">${[70, 110, 150, 190, 230].map((y) => `<line x1="20" y1="${y}" x2="190" y2="${y}"/>`).join("")}</g>
      <rect x="96" y="102" width="86" height="118" rx="18" fill="#000" opacity=".22" filter="url(#evblur)"/>
      <g><rect x="86" y="92" width="76" height="116" rx="16" fill="url(#evbox)" stroke="#aeb5bf" stroke-width="1.5"/>
        <rect x="86" y="92" width="76" height="116" rx="16" fill="none" stroke="#fff" stroke-width="1" opacity=".9"/>
        <rect x="96" y="102" width="56" height="26" rx="8" fill="#0d141c"/><text x="124" y="120" text-anchor="middle" font-size="12" font-weight="700" fill="${d.charging ? "#4ade80" : "#8da0b3"}">${d.charging && d.power != null ? num(d.power / 1000, 1) + " kW" : d.plugged ? "bereit" : "frei"}</text>
        <circle cx="124" cy="152" r="14" fill="#eef0f3" stroke="#c4cad2"/><circle cx="124" cy="152" r="11" fill="none" stroke="${led}" stroke-width="3.5"/><circle cx="124" cy="152" r="11" fill="none" stroke="${led}" stroke-width="3.5" filter="url(#evglow)" class="${d.charging ? "evpulse" : ""}" opacity=".8"/>
        <path d="M121 146 L126 146 L123 152 L127 152 L121 160 L123 154 L119 154 Z" fill="${led}"/>
        <rect x="108" y="190" width="32" height="14" rx="6" fill="#1a1f26"/><circle cx="124" cy="197" r="4" fill="#050709"/></g>
      <ellipse cx="490" cy="251" rx="215" ry="9" fill="#000" opacity=".45" filter="url(#evblur)"/>
      <g class="evcable ${d.plugged ? "on" : ""}">
        ${d.charging ? `<path d="${cab}" fill="none" stroke="#22e06b" stroke-width="12" stroke-linecap="round" opacity=".45" filter="url(#evglow)" class="evpulse"/>` : ""}
        <path d="${cab}" fill="none" stroke="#0b0e12" stroke-width="9" stroke-linecap="round"/><path d="${cab}" fill="none" stroke="#3a424d" stroke-width="2" stroke-linecap="round" transform="translate(-1.5 -2)"/>
        <path d="${cab}" fill="none" stroke="${d.charging ? "#a7f3c0" : "none"}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="5 13" class="${d.charging ? "evflow" : ""}"/>
        <g transform="rotate(-52 ${px} ${py})"><rect x="${px - 10}" y="${py - 8}" width="24" height="16" rx="6" fill="#14181e" stroke="#2c333c"/><rect x="${px + 10}" y="${py - 5}" width="6" height="10" rx="2" fill="#0b0e12"/><rect x="${px - 8}" y="${py - 6}" width="10" height="3" rx="1.5" fill="${led}" opacity=".9"/></g></g>
      <g>
        <path d="${H.body}" fill="url(#evpaint)"/>
        <g clip-path="url(#evbody)">
          <rect x="${H.rear - 4}" y="${H.gb}" width="420" height="40" fill="url(#evrefl)"/>
          <path d="M${H.rear} ${H.gt + 36} C420 ${H.gt + 28} 560 ${H.gt + 36} ${H.front} ${H.gt + 62}" stroke="#fff" stroke-width="3" fill="none" opacity=".38"/>
          <path d="M${H.rear} ${H.gb + 12} C420 ${H.gb + 8} 560 ${H.gb + 10} ${H.front} ${H.gb + 24}" stroke="${C[4]}" stroke-width="2.2" fill="none" opacity=".4"/>
          <path d="M${H.rear} ${H.gb + 14} C420 ${H.gb + 10} 560 ${H.gb + 12} ${H.front} ${H.gb + 26}" stroke="#fff" stroke-width="1" fill="none" opacity=".3"/>
          <path d="M${H.rear - 2} 224 L700 224 L700 240 L${H.rear - 2} 240 Z" fill="#10141b"/><path d="M${H.rear - 2} 224 L700 224" stroke="#fff" stroke-width="1" opacity=".18"/>
          <g stroke="${C[4]}" stroke-width="1.3" opacity=".65" fill="none">${H.seams.map((x, k) => `<path d="M${x} ${H.gb} C${x - 2} 190 ${x - 4} 210 ${x - 5} 224"/>`).join("")}</g>
          ${H.handles.map(([x, y]) => `<rect x="${x}" y="${y}" width="22" height="3.4" rx="1.7" fill="#0b0e12" opacity=".55"/><rect x="${x}" y="${y - 1}" width="22" height="1.6" rx=".8" fill="#fff" opacity=".4"/>`).join("")}
          <ellipse cx="${(H.rear + H.front) / 2}" cy="${H.gt - 6}" rx="${(H.front - H.rear) / 3.2}" ry="10" fill="#fff" opacity=".2"/></g>
        <path d="${H.glass}" fill="url(#evglass)"/>
        <g clip-path="url(#evgl)"><path d="M${H.gx[0] + 10} ${H.gb} L${H.gx[0] + 58} ${H.gt - 2} L${H.gx[0] + 84} ${H.gt - 2} L${H.gx[0] + 38} ${H.gb} Z" fill="#fff" opacity=".24"/><path d="M${H.pil + 24} ${H.gb} L${H.pil + 62} ${H.gt - 2} L${H.pil + 78} ${H.gt - 2} L${H.pil + 40} ${H.gb} Z" fill="#fff" opacity=".15"/><rect x="${H.gx[0]}" y="${H.gb - 12}" width="${H.gx[1] - H.gx[0]}" height="12" fill="#000" opacity=".25"/></g>
        <path d="M${H.pil - 3} ${H.gt - 2} L${H.pil + 1} ${H.gb + 1} L${H.pil + 5} ${H.gb + 1} L${H.pil + 3} ${H.gt - 2} Z" fill="${C[3]}" stroke="#05070a" stroke-width="1"/>
        <path d="${H.glass}" fill="none" stroke="#05070a" stroke-width="2.2" stroke-linejoin="round"/><path d="${H.glass.replace(/ Z$/, "")}" fill="none" stroke="#c9d3e3" stroke-width="1" opacity=".55" transform="translate(0 -2.6)"/>
        <path d="M${H.mir[0]} ${H.mir[1]} L${H.mir[0] + 14} ${H.mir[1]} C${H.mir[0] + 20} ${H.mir[1]} ${H.mir[0] + 22} ${H.mir[1] + 6} ${H.mir[0] + 16} ${H.mir[1] + 9} L${H.mir[0] - 2} ${H.mir[1] + 10} Z" fill="${C[2]}" stroke="${C[4]}"/>
        <path d="M${H.tl[0]} ${H.tl[1] - 9} L${H.tl[0] + 8} ${H.tl[1] - 11} L${H.tl[0] + 8} ${H.tl[1] + 9} L${H.tl[0]} ${H.tl[1] + 11} Z" fill="#d6192a"/><path d="M${H.tl[0]} ${H.tl[1] - 9} L${H.tl[0] + 8} ${H.tl[1] - 11} L${H.tl[0] + 8} ${H.tl[1] + 9} L${H.tl[0]} ${H.tl[1] + 11} Z" fill="#ff5a66" opacity=".55" filter="url(#evglow)"/>
        <path d="M${H.front - 34} ${H.ly - 2} C${H.front - 18} ${H.ly - 2} ${H.front - 6} ${H.ly + 2} ${H.front} ${H.ly + 8} L${H.front} ${H.ly + 13} C${H.front - 10} ${H.ly + 8} ${H.front - 22} ${H.ly + 6} ${H.front - 34} ${H.ly + 6} Z" fill="#f8fbff"/><path d="M${H.front - 34} ${H.ly - 2} L${H.front} ${H.ly + 10} L${H.front} ${H.ly + 14} Z" fill="#fff6c8" opacity=".6" filter="url(#evglow)"/>
        <path d="M${H.front - 6} ${H.ly + 22} L${H.front - 2} ${H.ly + 22} L${H.front - 2} ${H.ly + 40} L${H.front - 8} ${H.ly + 42} Z" fill="#0b0f16" opacity=".8"/>
        <path d="${H.body}" fill="none" stroke="${C[4]}" stroke-width="1.6"/>
        <circle cx="${px}" cy="${py}" r="7" fill="#0d1426" stroke="#8aa0c8" stroke-width="1.5"/><circle cx="${px}" cy="${py}" r="3.2" fill="${led}" class="${d.charging ? "evpulse" : ""}"/>
        <circle cx="${w1}" cy="217" r="41" fill="#07090d"/><circle cx="${w1}" cy="217" r="41" fill="none" stroke="${C[4]}" stroke-width="2"/><circle cx="${w2}" cy="217" r="41" fill="#07090d"/><circle cx="${w2}" cy="217" r="41" fill="none" stroke="${C[4]}" stroke-width="2"/>
        ${wheel(w1)}${wheel(w2)}</g>
      <g><rect x="562" y="30" width="162" height="40" rx="20" fill="#0f172a" opacity=".82"/>
        ${d.charging ? `<path d="M590 40 L580 52 H588 L585 62 L598 49 H590 Z" fill="#facc15"/>` : `<circle cx="588" cy="50" r="6" fill="${led}"/>`}
        <text x="642" y="57" text-anchor="middle" font-size="22" font-weight="800" fill="#fff">${d.soc != null ? num(d.soc, 0) + " %" : "–"}</text></g></svg>`;
  }
  /* Fahrzeug bearbeiten: Name, Aussehen, Akku, eigene Sensoren, „ohne Karte“ */
  _wbVehModal() {
    const m = this._modal, c = this._wb(), x = (c.vehicles || []).find((v) => v.id === m.id);
    if (!x) return `<div class="ov" data-act="wbrvdone"></div><div class="sheet"><div class="mut">Fahrzeug nicht gefunden.</div><div class="foot2"><button class="btn2 pri" data-act="wbrvdone">Schließen</button></div></div>`;
    const st = this._hass.states, ks = Object.keys(st), soc = (this._wbSnap().socs || {})[x.id], L = this._evLook(x), rfid = !this._wbHa(c);
    const numS = ks.filter((e) => e.startsWith("sensor.") && !isNaN(parseFloat(st[e].state)));
    const sel = (k, h) => this._wzSel(numS, (x.ent || {})[k] || "", "wbve", `data-k="${k}" data-v="${x.id}"`, "– keiner –", h);
    const d = { soc, charging: false, plugged: false, power: null, veh: x };
    return `<div class="ov" data-act="wbrvdone"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${esc(x.name)}</b><span>Fahrzeug · Modul 8</span></div><button class="ibtn" data-act="wbrvdone" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="evprev">${this._evNew() ? this._evCarport(d, this._evNow(d), 760, 250, { sfx: "sh", sx: 760 - 610, s: 0.86 }) : this._evScene(d).replace(/(id="|url\(#)ev/g, "$1evm")}</div>
      <div class="mut sm" style="margin:8px 0 4px">Name</div><input class="otxt" type="text" maxlength="30" data-f="wbvn" data-v="${x.id}" value="${esc(x.name)}" aria-label="Name des Fahrzeugs">
      <div class="mut sm" style="margin:8px 0 4px">Marke (nur Beschriftung)</div><div class="gschips">${EV_BRANDS.map((b) => `<button class="gsch ${L.brand === b ? "sel" : ""}" data-act="wbrvbrand" data-v="${x.id}" data-k="${esc(b)}" aria-pressed="${L.brand === b}">${esc(b)}</button>`).join("")}</div>
      <div class="mut sm" style="margin:6px 0 4px">Modell (optional)</div><input class="otxt" type="text" maxlength="30" data-f="wbvm" data-v="${x.id}" value="${esc(x.model || "")}" placeholder="z. B. Modellname" aria-label="Modell">
      <div class="mut sm" style="margin:8px 0 4px">Form der Zeichnung</div><div class="gschips">${Object.entries(EV_BODIES).map(([k, t]) => `<button class="gsch ${L.body === k ? "sel" : ""}" data-act="wbrvbody" data-v="${x.id}" data-k="${k}" aria-pressed="${L.body === k}">${t}</button>`).join("")}</div>
      <div class="mut sm" style="margin:6px 0 4px">Farbe</div><div class="gschips">${Object.entries(EV_COLORS).map(([k, col]) => `<button class="evsw ${L.color === k ? "sel" : ""}" data-act="wbrvcol" data-v="${x.id}" data-k="${k}" style="--c:${col[2]};--c2:${col[1]}" aria-label="${col[0]}" aria-pressed="${L.color === k}" title="${col[0]}"></button>`).join("")}</div>
      <div class="vrow"><span>Akkugröße<small class="mut" style="display:block">Für Ladeplan und „noch … kWh“. Leer: ${num(c.cap, 1)} kWh aus der Laderegelung.</small></span><span style="flex:none;display:flex;align-items:center;gap:6px"><input class="otxt" style="width:84px;text-align:right" type="text" inputmode="decimal" data-f="wbvc" data-v="${x.id}" value="${x.cap ? num(x.cap, 1) : ""}" placeholder="${num(c.cap, 1)}" aria-label="Akkugröße in kWh"> kWh</span></div>
      <div class="lsec">${ic("energy", 15)}Sensoren dieses Fahrzeugs</div>
      <div class="mut sm" style="margin:2px 0 0">Ladestand (Prozent) – für Ladelimit und Ladeplan</div>${sel("soc", /soc|batter|ladestand|akku/i)}
      <div class="mut sm" style="margin:0">Kilometerstand (optional)</div>${sel("odo", /odo|kilometer|km|mileage|stand/i)}
      <div class="mut sm" style="margin:0">Reichweite (optional)</div>${sel("range", /reichweite|range/i)}
      ${!(x.ent || {}).soc ? (() => { const e = (this._wbSnap().est || {})[x.id]; return `<div class="evest"><div><b>Ohne Ladestand-Sensor: Ladestand schätzen</b><small class="mut">${e ? `Geschätzt <b>${num(e.soc, 0)} %</b> · eingegeben ${esc(new Date(e.set).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }))} mit ${num(e.at, 0)} %${e.stale ? " · seit dem Abstecken unsicher – bitte neu eingeben" : ""}` : "Gib einmal ein, wie voll der Akku gerade ist (Anzeige im Auto). Beim Laden rechnet Strom &amp; Wärme weiter: geladene kWh × 90 % ÷ Akkugröße."}</small></div>
        <span class="evesti"><input class="otxt" type="text" inputmode="decimal" data-f="wbvest" placeholder="${e ? num(e.soc, 0) : "z. B. 40"}" aria-label="Ladestand in Prozent"> %<button class="btn2 pri" data-act="wbvestok" data-v="${x.id}">Übernehmen</button></span></div>`; })() : ""}
      <div class="lsec">${ic("car", 15)}${rfid ? "Erkennung" : "An dieser Wallbox"}</div>
      <div class="vrow"><span>${rfid ? "Gilt, wenn keine Karte angelegt wird" : "Dieses Fahrzeug lädt hier"}<small class="mut" style="display:block">${rfid ? "Sonst wird das Fahrzeug an seiner Karte erkannt." : "Die Wallbox meldet keine Karten, deshalb wird das Fahrzeug fest zugeordnet."}</small></span><button class="sw ${c.defVeh === x.id ? "on" : ""}" data-act="wbrvdef" data-v="${c.defVeh === x.id ? "" : x.id}" aria-pressed="${c.defVeh === x.id}" aria-label="Fahrzeug ohne Karte"></button></div>
      <div class="gst">${ic("info", 15)}Die Zeichnung ist allgemein gehalten, ohne Logos und nicht dem Modell nachgebaut. Marke und Modell erscheinen nur als Text.</div>
      <div class="foot2" style="margin-top:12px"><button class="btn2 dng" data-act="wbrvdel2" data-v="${x.id}">${ic("trash", 16)} Entfernen</button><button class="btn2 pri" data-act="wbrvdone">Fertig</button></div></div>`;
  }
  _evPage() {
    const adm = this._admin(), d = this._evData();
    if (d.any && this._evNew()) return this._evPageNew(d);
    if (!d.any) return `${this._betaBox("Wähle in den Einstellungen die Sensoren deines Fahrzeugs und der Wallbox.")}
      <div class="card empty">${ic("car", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Noch kein Fahrzeug eingerichtet</div>
      <div class="sm" style="max-width:460px;margin:0 auto 14px">Zeigt Ladestand, Reichweite und Kilometerstand. Die Wallbox ist abgebildet, das Ladekabel erscheint beim Anstecken und leuchtet beim Laden.</div>
      ${adm ? `<button class="btn2 pri" data-act="mdevset" style="flex:none;padding:12px 22px">${ic("tools", 16)} Fahrzeug einrichten</button>` : "Ein Administrator kann das Modul einrichten."}</div>`;
    const stT = d.charging ? `Lädt${d.power != null ? " mit " + num(d.power / 1000, 1) + " kW" : ""}` : d.plugged ? "Angesteckt, lädt nicht" : "Nicht angesteckt";
    const tile = (ico, t, v, sub) => `<div class="luroom"><span class="mut lt"><span class="ti">${ic(ico, 15)}</span>${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    const bar = d.soc != null ? `<div class="gsbar" style="margin-top:6px" role="progressbar" aria-valuenow="${num(d.soc, 0)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.max(0, Math.min(100, d.soc))}%;background:${d.soc < 20 ? "#f87171" : "#34d399"}"></i></div>` : "";
    const wbOn = this._wbOn(), wbTabs = wbOn ? this._wbTabs() + this._wbBar() : "";
    if (wbOn && this._wbStT() === "plan") return `${this._betaBox("Die Darstellung nutzt die Sensoren, die du in den Einstellungen wählst.")}${wbTabs}${this._wbPlan(d)}`;
    if (wbOn && this._wbStT() === "set") return `${this._betaBox("Die Darstellung nutzt die Sensoren, die du in den Einstellungen wählst.")}${wbTabs}${this._wbCard(d, "set")}`;
    if (wbOn && this._wbStT() === "stat") return `${this._betaBox("Die Darstellung nutzt die Sensoren, die du in den Einstellungen wählst.")}${wbTabs}${this._wbStat()}`;
    return `${this._betaBox("Die Darstellung nutzt die Sensoren, die du in den Einstellungen wählst.")}${wbTabs}
      <div class="evtop"><div class="card evcard ${d.charging ? "chg" : d.plugged ? "plg" : ""}"><div class="evhead"><b>${ic("car", 18)}${esc(this._evTitle(d.veh))}</b><span class="gsst ${d.charging ? "on" : ""}">${stT}</span></div>${this._evScene(d)}</div>
      <div class="lugrid">${tile("energy", "Ladestand", d.soc != null ? num(d.soc, 0) + " %" : "–", bar || "kein Sensor")}${tile("car", "Reichweite", d.range != null ? num(d.range, 0) + " km" : "–", d.range != null ? "laut Fahrzeug" : "kein Sensor")}${tile("total", "Kilometerstand", d.odo != null ? num(d.odo, 0) + " km" : "–", d.odo != null ? "gesamt" : "kein Sensor")}${tile("bolt", "Ladeleistung", d.power != null ? num(d.power / 1000, 1) + " kW" : "–", stT)}</div></div>
      <div class="mcols">${wbOn ? this._wbxToday(d) : ""}${this._wbCard(d)}</div>`;
  }
  _evSetModal() {
    const V = this._evState(), E = V.ent, st = this._hass.states, ks = Object.keys(st), vs = this._wb().vehicles || [], socs = this._wbSnap().socs || {}, wbOn = this._wbOn();
    this._wbLoad();
    const num_ = ks.filter((e) => e.startsWith("sensor.") && !isNaN(parseFloat(st[e].state)));
    const pw = ks.filter((e) => e.startsWith("sensor.") && (st[e].attributes.device_class === "power" || /^k?W$/.test(st[e].attributes.unit_of_measurement || "")));
    const bin = ks.filter((e) => e.startsWith("binary_sensor.") || e.startsWith("sensor.") || e.startsWith("switch."));
    const sel = (k, o, none, h) => this._wzSel(o, E[k], "event", `data-k="${k}"`, none || "– keiner –", h);
    return `<div class="ov" data-act="evdone"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Elektroauto &amp; Wallbox</b><span>Einstellungen · Beta</span></div><button class="ibtn" data-act="evdone" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("car", 15)}Fahrzeuge</div>
      <div class="mut sm" style="margin:2px 0 6px">Jedes Fahrzeug hat eigene Sensoren (Ladestand, Kilometer, Reichweite), eine eigene Akkugröße und ein eigenes Aussehen.</div>
      ${vs.length ? vs.map((x) => `<div class="rfv"><div class="oper" style="padding:0"><span class="rfpic">${this._evThumb(x)}</span><div class="opi"><b>${esc(x.name)}</b><small>${this._evVehLine(x, socs[x.id])}</small></div><button class="btn2" data-act="wbrvedit" data-v="${x.id}" style="flex:none">${ic("pencil", 15)} Bearbeiten</button></div></div>`).join("") : `<div class="mut sm">Noch kein Fahrzeug angelegt.</div>`}
      ${vs.length < 6 ? `<button class="lnk" data-act="wbrvnew">${ic("plus", 16)}Fahrzeug hinzufügen</button>` : ""}
      <div class="lsec">${ic("bolt", 15)}Wallbox</div>
      ${wbOn ? `<div class="gst">${ic("check", 15)}<span>${esc(this._wbName())} ist verbunden: Stecker, Ladestatus und Leistung kommen direkt von der Wallbox. Die Sensoren hier brauchst du nur, wenn du andere Werte zeigen willst.</span></div>` : ""}
      <div class="mut sm" style="margin:2px 0 0">Ladekabel angesteckt (Sensor oder Status der Wallbox)</div>${sel("plug", bin, "", /plug|kabel|cable|connect|angesteckt|status/i)}
      <div class="mut sm" style="margin:0">Lädt gerade (optional, sonst aus der Ladeleistung)</div>${sel("charging", bin, "", /charging|l(ä|a)dt|lade/i)}
      <div class="mut sm" style="margin:0">Ladeleistung (Watt)</div>${sel("power", pw, "", /lade|charg|wallbox|power|leistung/i)}
      <div class="gst">${ic("info", 15)}Das Ladekabel erscheint, sobald „angesteckt“ meldet, und verschwindet beim Abstecken. Beim Laden leuchtet es und die Ladung läuft sichtbar.</div>
      <div class="foot2"><button class="btn2 pri" data-act="evdone">Fertig</button></div></div>`;
  }
