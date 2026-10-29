  _wbDef() { return { ip: "", enabled: false, mode: "off", minA: 6, maxA: 16, ph: "auto", startW: 1400, onMin: 1, offMin: 3, limit: 80, plan: false, planSoc: 80, planTime: "07:00", planDays: "all", cap: 60, batOn: true, batSoc: 30, priceOn: false, priceMax: 18, lock: false, reset: true, planOn: false, planStrat: "mix", planSrc: "auto", pvSrc: "forecast", baseW: 400, vehicles: [], guest: { mode: "off", limit: 80 }, guard: { on: false, maxA: 35 }, notify: { start: true, goal: true, plan: true, off: true, long: false, to: [] } }; }
  _wbSnap() { const s = (this._wbD && this._wbD.snap) || {}; return { ...s, cfg: { ...this._wbDef(), ...(s.cfg || {}) }, info: s.info || {}, want: s.want || {}, log: s.log || [], plan: s.plan || {} }; }
  _wb() { return this._wbSnap().cfg; }
  _wbVisible() { return !this._modal && ((this._igOpen && this._admin()) || (!this._stOpen && !this._ortOpen && this._mdActive() === "ev")); }
  _wbLoad(force) {
    if (!this._hass || this._wbBusy) return;
    if (!force && this._wbD && Date.now() - this._wbD.ts < 4000) return;
    this._wbBusy = true;
    this._hass.callWS({ type: "fenster_heizung/wb_get" }).then((r) => { if (!this._wbSaveT) this._wbD = { snap: r || {}, ts: Date.now() }; }).catch(() => { this._wbD = { snap: { ok: false, error: "Keine Antwort von Home Assistant" }, ts: Date.now() }; })
      .finally(() => { this._wbBusy = false; if (this._wbVisible()) this._render(); clearTimeout(this._wbT); this._wbT = setTimeout(() => { this._wbT = null; if (this._wbVisible()) this._wbLoad(true); }, 5000); });
  }
  _wbSave(patch, now) {
    if (!(this._wbD && this._wbD.snap && this._wbD.snap.cfg)) { this._toast("Noch nicht geladen, bitte kurz warten und nochmal versuchen"); return; } /* ohne geladenen Stand nicht speichern (sonst würden Standardwerte die Einstellungen überschreiben) */
    const sn = this._wbSnap(); this._wbD = { snap: { ...sn, cfg: { ...sn.cfg, ...patch } }, ts: Date.now() };
    clearTimeout(this._wbSaveT);
    this._wbSaveT = setTimeout(() => {
      this._wbSaveT = null; const cfg = this._wbSnap().cfg;
      this._hass.callWS({ type: "fenster_heizung/wb_set", cfg }).then((r) => { this._wbD = { snap: r, ts: Date.now() }; if (this._wbVisible()) this._render(); })
        .catch(() => this._toast("Wallbox-Einstellung konnte nicht gespeichert werden"));
    }, now ? 0 : 500);
  }
  _igChip() { const s = this._wbSnap(); this._wbLoad(); return s.cfg.ip ? (s.ok ? `<em class="sxc ok">go-e verbunden</em>` : `<em class="sxc">Nicht erreichbar</em>`) : `<em class="sxc">Nicht verbunden</em>`; }
  /* ===== Store: Katalog aller Dienste, Startseite (A) und Detailseite (C) ===== */
  _sto0() { return this._sto || (this._sto = { q: "", c: "all" }); }
  _stoCfg() { const t = (this._cfg && this._cfg.layout && this._cfg.layout.store) || {}; return { icon: t.icon !== false, tab: t.tab !== false }; }
  /* ===== Herstellerprofile für Heizkörperthermostate ===== */
  _hsProfiles() {
    const Z = "Zigbee-Integration (ZHA oder Zigbee2MQTT) einrichten und das Thermostat anlernen";
    const T3 = "In den Raumeinstellungen unter „Fenster & Thermostate“ das Thermostat auswählen, das Profil wird automatisch erkannt";
    return {
      tado: { n: "tado°", sub: "Thermostate · Cloud", c: "#f97316", d: "tado", conn: "Cloud", src: "Offiziell", desc: "Heizkörper- und Raumthermostate über die tado-Cloud, mit Zeitplan aus der tado-App.",
        feats: ["Heizung beim Lüften ausschalten und danach auf den Zeitplan zurück", "Zeitplan der tado-App bleibt erhalten", "Zieltemperatur und Heizstatus im Dashboard"],
        quirks: [["Zurück zum Zeitplan", "Eine geänderte Temperatur wirkt bei tado als manuelle Übersteuerung. Nach dem Lüften wird deshalb die Automatik erneut gesetzt, damit wieder der Zeitplan gilt."], ["Echtes Aus", "Beim Lüften wird das Thermostat ausgeschaltet, nicht nur abgesenkt."], ["Eigene Fensterfunktion", "tado erkennt offene Fenster teils selbst. Wenn du Fenstersensoren nutzt, ist es sinnvoll, diese Funktion in der tado-App auszuschalten, damit sich beides nicht in die Quere kommt."], ["Zeitlich begrenzt ändern", "Die tado-Aktion „Climate-Timer“ setzt eine Temperatur für eine Dauer, danach gilt wieder der Zeitplan."], ["Cloud", "Befehle laufen über die tado-Cloud und können einige Sekunden brauchen. Die Verzögerung für „Fenster offen“ nicht zu kurz wählen."]],
        steps: ["Unten „Einrichten“ tippen, Home Assistant öffnet die tado-Einrichtung", "Mit dem tado-Konto anmelden", T3], note: "" },
      hmip: { n: "Homematic IP", sub: "Thermostate · Access Point", c: "#0ea5e9", d: "homematicip_cloud", conn: "Cloud", src: "Offiziell", desc: "Heizkörperthermostate (z. B. HmIP-eTRV) über den Homematic-IP-Access-Point.",
        feats: ["Heizung beim Lüften auf die kleinste Temperatur und danach zurück auf Automatik", "Zeitprofile des Geräts bleiben erhalten", "Boost und Normal als Voreinstellung nutzbar"],
        quirks: [["Kein echtes Aus", "Die Thermostate kennen nur Automatik und Manuell. „Ausschalten“ setzt darum die kleinste Temperatur des Geräts (meist um 5 °C)."], ["Zurück zum Zeitplan", "Nach dem Lüften wird die Automatik erneut gesetzt, statt die alte Temperatur als manuelle Einstellung zu setzen."], ["Verknüpfung im Gerät", "Mit einem Homematic-IP-Fensterkontakt kann das Thermostat selbst absenken. Nutze entweder die Verknüpfung in der Homematic-IP-App oder Strom & Wärme, nicht beides für dasselbe Fenster."], ["Funk-Begrenzung", "Homematic IP darf nur begrenzt oft senden (Duty Cycle). Viele Befehle in kurzer Zeit werden verzögert."]],
        steps: ["Unten „Einrichten“ tippen und die Homematic-IP-Integration hinzufügen", "Am Access Point die Taste drücken, wenn Home Assistant danach fragt", T3], note: "" },
      fritz: { n: "AVM FRITZ!DECT", sub: "Thermostate · FRITZ!Box", c: "#ef4444", d: "fritzbox", conn: "Lokal", src: "Offiziell", desc: "FRITZ!DECT 301 und 302 sowie Comet DECT an der FRITZ!Box, ohne Cloud.",
        feats: ["Heizung beim Lüften ausschalten und danach zurück", "Läuft lokal über die FRITZ!Box", "Komfort- und Spar-Temperatur als Voreinstellung"],
        quirks: [["Eigene Fenstererkennung", "FRITZ!DECT-Thermostate erkennen einen Temperatursturz selbst als offenes Fenster. Das kann mit den Fenstersensoren zusammenfallen, schadet aber nicht."], ["Aus möglich", "Das Thermostat lässt sich ausschalten. Die FRITZ!Box setzt dafür den Aus-Wert des Geräts."], ["Zurück zum Zeitplan", "Falls das Thermostat im Automatikbetrieb lief, wird die Automatik nach dem Lüften erneut gesetzt."], ["Aktualität", "Die Werte kommen von der FRITZ!Box und können einige Sekunden alt sein."]],
        steps: ["Unten „Einrichten“ tippen, Home Assistant sucht die FRITZ!Box", "Einen FRITZ!Box-Benutzer mit Berechtigung für Smart Home verwenden", T3], note: "" },
      shelly: { n: "Shelly TRV", sub: "Thermostate · lokal", c: "#2563eb", d: "shelly", conn: "Lokal", src: "Offiziell", desc: "Shelly-Heizkörperthermostate, direkt im Heimnetz.",
        feats: ["Heizung beim Lüften auf die kleinste Temperatur und danach zurück", "Ventilstellung im Blick", "Optional mit externem Raumfühler"],
        quirks: [["Kein echtes Aus", "Das Gerät hat keinen eigenen Aus-Zustand. „Ausschalten“ bedeutet die kleinste Temperatur (meist 4 °C)."], ["Verzögerte Werte", "Bei Batteriegeräten kommen Werte und Befehle teils erst nach einigen Minuten an. Die Verzögerung für „Fenster offen“ nicht zu kurz wählen."], ["Externer Fühler", "Mit einem externen Raumfühler misst das Thermostat nicht mehr direkt am Heizkörper und regelt genauer."]],
        steps: ["Unten „Einrichten“ tippen und die Shelly-Integration hinzufügen", "Thermostat im selben Netz (BLU TRV über ein Shelly-Gateway)", T3], note: "" },
      aqara: { n: "Aqara E1", sub: "Thermostat · Zigbee", c: "#14b8a6", d: "zha", conn: "Lokal", src: "Zigbee", desc: "Aqara Radiator Thermostat E1 über Zigbee (ZHA oder Zigbee2MQTT).",
        feats: ["Heizung beim Lüften ausschalten und danach zurück", "Temperaturbereich 5 bis 30 °C", "Läuft lokal, ohne Cloud"],
        quirks: [["Echtes Aus", "Das Thermostat kennt Aus und Heizen. Beim Lüften wird es ausgeschaltet."], ["Eigene Fenstererkennung", "Die eingebaute Fenstererkennung kann zusätzlich eingreifen. Mit Fenstersensoren in Strom & Wärme ist es sinnvoll, sie im Gerät auszuschalten."], ["Kalibrieren", "Nach dem Einbau einmal kalibrieren, damit das Ventil sauber fährt."], ["Kindersicherung", "Ist sie an, sind die Tasten am Gerät gesperrt, die Steuerung über Home Assistant geht weiter."]],
        steps: [Z, "Zum Anlernen den Mittelring etwa 10 Sekunden gedrückt halten", T3], note: "" },
      danfoss: { n: "Danfoss Ally", sub: "Thermostat · Zigbee", c: "#dc2626", d: "zha", conn: "Lokal", src: "Zigbee", desc: "Danfoss Ally Heizkörperthermostat über Zigbee (ZHA oder Zigbee2MQTT).",
        feats: ["Heizung beim Lüften auf die kleinste Temperatur und danach zurück", "Temperaturbereich 5 bis 35 °C", "Läuft lokal, ohne Cloud"],
        quirks: [["Kein echtes Aus", "Das Thermostat kennt nur Heizen. „Ausschalten“ setzt darum die kleinste Temperatur (5 °C)."], ["Eigene Fensterfunktion", "Das Thermostat kann ein offenes Fenster selbst erkennen. Mit Fenstersensoren in Strom & Wärme ist es sinnvoll, diese Funktion im Gerät auszuschalten."], ["Heizkörper verdeckt", "Ist der Heizkörper verdeckt (Vorhang, Möbel), den Raumfühler-Modus einstellen, sonst misst das Thermostat zu warm."], ["Externer Raumfühler", "Ein externer Fühler muss regelmäßig neu gemeldet werden, sonst fällt das Thermostat auf den eigenen Fühler zurück."]],
        steps: [Z, "Heizkörper-Einbau mit dem mitgelieferten Adapter, danach Anpassungslauf abwarten", T3], note: "" },
    };
  }
  _hsOf(eid) {
    const H = this._hass, e = (H.entities || {})[eid]; if (!e) return null;
    const pl = String(e.platform || "").toLowerCase(), dev = e.device_id && H.devices ? H.devices[e.device_id] : null, man = String((dev && dev.manufacturer) || "").toLowerCase(), mod = String((dev && dev.model) || "").toLowerCase();
    const P = { tado: "tado", homematicip_cloud: "hmip", homematicip_local: "hmip", homematic: "hmip", fritzbox: "fritz", shelly: "shelly" };
    if (P[pl]) return P[pl];
    if (man.includes("danfoss")) return "danfoss";
    if (/aqara|lumi|xiaomi/.test(man) || mod.includes("srts")) return "aqara";
    return null;
  }
  _hsRoomNote(list) {
    const P = this._hsProfiles(), ids = [...new Set((list || []).map((e) => this._hsOf(e)).filter(Boolean))]; if (!ids.length) return "";
    return ids.map((id) => { const x = P[id]; return `<details class="ohint hsn"><summary><span class="hsd" style="background:${x.c}"></span>${esc(x.n)} erkannt · Besonderheiten (${x.quirks.length})</summary><ul class="stoul">${x.quirks.map(([t, d]) => `<li><b>${esc(t)}:</b> ${esc(d)}</li>`).join("")}</ul></details>`; }).join("");
  }
  _stoCat() {
    const H = this._hass, E = H.entities || {}, S = H.states, ids = Object.keys(S), byDom = (d) => ids.filter((k) => (E[k] || {}).platform === d);
    const wb = this._wbSnap(), c = wb.cfg, T = this._tb(), det = this._sfList(), out = [];
    const X = { xsense: ["Cloud", "Community"], zha: ["Lokal", "Offiziell"], mqtt: ["Lokal", "Offiziell"], homematicip_cloud: ["Cloud", "Offiziell"], fritzbox: ["Lokal", "Offiziell"], zwave_js: ["Lokal", "Offiziell"], matter: ["Lokal", "Offiziell"], tuya: ["Cloud", "Offiziell"], ecowitt: ["Lokal", "Offiziell"], tempest: ["Lokal", "Offiziell"], met: ["Cloud", "Offiziell"], dwd_weather_warnings: ["Cloud", "Offiziell"], nina: ["Cloud", "Offiziell"], meteoalarm: ["Cloud", "Offiziell"] };
    out.push({ id: "goe", n: "go-e Charger", sub: "Wallbox", cat: "auto", c: "#0ea5e9", i: "energy", mid: "ev", mods: ["Modul 8"], on: !!c.ip, bad: !!c.ip && !wb.ok, top: 1, act: "iggoe", conn: "Lokal", src: "Direkt",
      st: c.ip ? (wb.ok ? `${(wb.info && wb.info.type) || "go-e Charger"} · ${c.ip}` : `${c.ip} · ${wb.error || "keine Antwort"}`) : "", desc: "Wallbox direkt im Heimnetz lesen und steuern, ohne Cloud.",
      feats: ["Laden nach Sonne, Strompreis und Abfahrtszeit planen", "Status, Leistung und Ladestand direkt sehen", "Läuft lokal im Heimnetz, ohne Cloud"],
      steps: ["In der go-e-App: Einstellungen → Verbindung → API-Einstellungen → „Zugriff auf lokale HTTP API“ einschalten", "Dem go-e im Router eine feste IP-Adresse geben", "Hier „Einrichten“ tippen, IP-Adresse eintragen und die Verbindung testen"], note: "Die lokale API v2 gibt es nur bei neueren Geräten. Der go-e Charger Gemini unterstützt sie." });
    out.push({ id: "tibber", n: "Tibber", sub: "Stromtarif", cat: "tarif", c: "#6366f1", i: "energy", mid: "ev", mods: ["Modul 8"], on: !!T.connected, top: 1, act: "igtb", conn: "Cloud", src: "Offiziell",
      st: T.connected ? `${T.home || "Zuhause"}${T.price_now != null ? " · jetzt " + num(T.price_now, 1) + " ct/kWh" : ""}` : "", desc: "Stundenpreise direkt von Tibber, ohne zusätzliche Integration.",
      feats: ["Strompreise von heute und morgen (ab etwa 13 Uhr)", "Ladeplanung in Modul 8 zur günstigsten Zeit", "Preise als Stunde, Viertelstunde oder Preisstufe"],
      steps: ["Auf developer.tibber.com anmelden und einen Zugriffstoken erstellen", "Hier „Einrichten“ tippen und den Token eintragen", "Verbindung testen und speichern"], note: "Der Token wird nur in Home Assistant gespeichert und nur an api.tibber.com gesendet. Es werden nur Strompreise abgerufen." });
    const W = { warn: ["Amtliche Warnungen mit Stufe 1 bis 4 in Modul 9", "Meldung aufs Handy und Aktionen bei Warnung"], weather: ["Wetter und Vorhersage für Modul 9 und die Kopfkarte", "Vorwarnung aus der Stundenvorhersage"], station: ["Wind, Regen und Temperatur direkt vor Ort", "Genauer als eine Vorhersage für Sturmwarnungen"] };
    const WL = { warn: "Warnungen", weather: "Wetter", station: "Wetterstation" };
    for (const x of this._igWxCatalog()) { const n = byDom(x.d).length, cx = X[x.d] || ["Cloud", "Offiziell"];
      out.push({ id: x.d, d: x.d, n: x.n, sub: WL[x.k], cat: "wetter", c: x.c, i: x.i, mid: "wx", mods: ["Modul 9"], on: n > 0, top: x.top, conn: cx[0], src: cx[1], st: n ? `${n} ${n === 1 ? "Entität" : "Entitäten"} · genutzt von Modul 9` : "", desc: x.t, feats: W[x.k],
        steps: ["Unten „Einrichten“ tippen, Home Assistant öffnet die Einrichtung", "Dienst hinzufügen und die Angaben eintragen", "Modul 9 erkennt ihn automatisch. Bei mehreren Quellen wählst du die Zuordnung unter Einstellungen → Modul 9"], note: "" }); }
    const anyX = ids.some((k) => (E[k] || {}).platform === "xsense");
    for (const x of this._igSfCatalog()) { const n = det.filter((y) => (y.src || (E[y.id] || {}).platform) === x.d).length, up = n > 0 || (x.d === "xsense" && anyX), cx = X[x.d] || ["Cloud", "Offiziell"], isx = x.d === "xsense";
      out.push({ id: x.d, d: x.d, n: x.n, sub: "Melder", cat: "sicherheit", c: x.c, i: x.i, mid: "sf", mods: ["Modul 11"], on: up, top: x.top, feat: isx, hacs: x.hacs, conn: cx[0], src: cx[1], st: up ? (n ? `${n} Melder · genutzt von Modul 11` : "Verbunden, aber noch ohne Melder") : "", desc: x.t,
        feats: ["Alarm aufs Handy und Aktionen (Licht, Ventil, Sirene)", "Batteriestand und Erreichbarkeit im Blick", "Erinnerung an die regelmäßige Prüfung"],
        steps: isx ? ["Community-Integration in HACS als benutzerdefiniertes Repository (Kategorie „Integration“) hinzufügen, die Adresse steht hinter „Anleitung“", "Home Assistant neu starten und unter Geräte & Dienste „X-Sense“ hinzufügen, besser mit einem zweiten Konto, mit dem du nur die Melder teilst", "Fertig: Die Melder erscheinen in Modul 11, mit Batterie und, wenn vorhanden, Testknopf"] : ["Unten „Einrichten“ tippen und den Dienst in Home Assistant hinzufügen", "Melder anlernen", "Modul 11 erkennt alle Melder (Rauch, CO, Gas, Wasser, Hitze) automatisch"],
        note: isx ? "Inoffiziell und cloud-basiert, von der Community gepflegt. Nach Home-Assistant-Updates kann sie kurz ausfallen. Die Melder selbst alarmieren auch ohne Home Assistant weiter." : "" }); }
    const hp = this._hsProfiles(), cnt = {}; ids.filter((k) => k.startsWith("climate.")).forEach((k) => { const id = this._hsOf(k); if (id) cnt[id] = (cnt[id] || 0) + 1; });
    for (const id of Object.keys(hp)) { const x = hp[id], n = cnt[id] || 0;
      out.push({ id: "hs_" + id, d: x.d, n: x.n, sub: x.sub, cat: "heizung", c: x.c, i: "thermo", mid: "fh", mods: ["Modul 1"], on: n > 0, top: 1, nodot: 1, conn: x.conn, src: x.src, st: n ? `${n} ${n === 1 ? "Thermostat" : "Thermostate"} in Home Assistant gefunden` : "", desc: x.desc, feats: x.feats, quirks: x.quirks, steps: x.steps, note: x.note }); }
    if (this._labOn("mm")) { const n = ids.filter((k) => (E[k] || {}).platform === "waste_collection_schedule").length;
      out.push({ id: "wcs", d: "waste_collection_schedule", n: "Abfallkalender", sub: "waste_collection_schedule", cat: "haus", c: "#16a34a", i: "trash", mid: "mu", mods: ["Modul 17"], on: n > 0, top: 1, hacs: "https://github.com/mampfes/hacs_waste_collection_schedule", conn: "Cloud", src: "Community", st: n ? `${n} ${n === 1 ? "Entität" : "Entitäten"} · genutzt von Modul 17` : "",
        desc: "Holt die Abholtermine deines Entsorgers in einen Kalender von Home Assistant. Dafür gibt es Hunderte Anbieter.",
        feats: ["Termine für Restmüll, Bio, Papier und Gelben Sack als Kalender", "Modul 17 zeigt sie an und erinnert am Vorabend", "Kennt viele Entsorger in Deutschland, Österreich und der Schweiz"],
        steps: ["Community-Integration in HACS als benutzerdefiniertes Repository (Kategorie „Integration“) hinzufügen, die Adresse steht hinter „Anleitung“", "Home Assistant neu starten und unter Geräte & Dienste „Waste Collection Schedule“ hinzufügen, dann den Entsorger wählen", "Fertig: Der Kalender erscheint automatisch in Modul 17, oder du wählst ihn in den Einstellungen des Moduls"],
        note: "Inoffiziell, von der Community gepflegt. Der Eintrag erscheint nur, solange das Lab „Müllabfuhr“ eingeschaltet ist. Ausgeschaltet verschwindet er hier wieder, die Integration selbst bleibt in Home Assistant, bis du sie dort entfernst." }); }
    out.forEach((x) => { x.tag = x.src === "Community" ? "Inoffiziell" : x.conn === "Cloud" ? "Konto nötig" : "In HA einrichten"; });
    return out;
  }
  _stoTodo() {
    if (!this._hass || !this._admin()) return 0;
    if (this._stoT && Date.now() - this._stoT.ts < 4000) return this._stoT.n;
    let n = 0; try { const ml = this._mdList().map((m) => m.id); n = this._stoCat().filter((x) => !x.on && x.top && !x.nodot && ml.includes(x.mid)).length; } catch (_) { /* egal */ }
    this._stoT = { ts: Date.now(), n }; return n;
  }
  _stoBtn() {
    if (!this._admin() || !this._stoCfg().icon) return "";
    const n = this._stoTodo();
    return `<button class="pillbtn sto" data-act="igopen" aria-label="Store: Integrationen und Dienste" title="Store">${ic("puzzle", 17)}${n ? `<i class="sdot">${n}</i>` : ""}</button>`;
  }
  _stoCard(x) {
    return `<button class="stoc" data-act="stodet" data-k="${esc(x.id)}"><span class="stot"><span class="stoi" style="background:${x.c}">${ic(x.i, 24)}</span><span class="ston"><b>${esc(x.n)}</b><small>${esc(x.sub)} · ${esc(x.mods.join(", "))}</small></span></span><span class="stod">${esc(x.on ? x.st : x.desc)}</span><span class="stof">${x.on ? `<span class="stos ${x.bad ? "bad" : "ok"}">● ${x.bad ? "Nicht erreichbar" : "Verbunden"}</span><em>Ansehen</em>` : `<span class="stos wn">${esc(x.tag)}</span><em class="pri">Einrichten</em>`}</span></button>`;
  }
  _stoGrid() {
    const { q, c } = this._sto0(), cat = this._stoCat(), all = q || c !== "all";
    const hay = (x) => (x.n + " " + x.sub + " " + x.desc + " " + x.mods.join(" ") + " " + x.cat + " " + (x.quirks ? x.quirks.map((q) => q[0]).join(" ") : "")).toLowerCase();
    const vis = cat.filter((x) => (c === "all" || c === "on" ? c === "on" ? x.on : true : x.cat === c) && (!q || hay(x).includes(q.toLowerCase())) && (all || x.on || x.top));
    const on = vis.filter((x) => x.on), off = vis.filter((x) => !x.on);
    if (!vis.length) return `<div class="card empty">${ic("puzzle", 30)}<div style="margin-top:8px">Nichts gefunden. Wünsche kannst du auf GitHub melden.</div></div>`;
    return `${on.length ? `<h3 class="stoh">Verbunden<small>${on.length} ${on.length === 1 ? "Dienst" : "Dienste"}</small></h3><div class="stog">${on.map((x) => this._stoCard(x)).join("")}</div>` : ""}${off.length ? `<h3 class="stoh">${c === "all" && !q ? "Entdecken" : "Weitere Dienste"}<small>${c === "all" && !q ? "Passend zu deinen Modulen" : off.length + " Treffer"}</small></h3><div class="stog">${off.map((x) => this._stoCard(x)).join("")}</div>` : ""}`;
  }
  _stoFeat() {
    const { q, c } = this._sto0(); if (q || c !== "all") return "";
    const cat = this._stoCat(), x = ["xsense", "tibber", "nina"].map((id) => cat.find((y) => y.id === id)).find((y) => y && !y.on); if (!x) return "";
    return `<button class="stofe" data-act="stodet" data-k="${esc(x.id)}"><span class="stobig">${ic(x.i, 44)}</span><span class="stofx"><em>${x.id === "xsense" ? "Neu · Modul 11" : "Empfohlen · " + esc(x.mods[0])}</em><b>${esc(x.n)}${x.id === "xsense" ? " Rauchmelder" : ""}</b><span>${esc(x.id === "xsense" ? "Rauch- und CO-Melder aus der X-Sense-Cloud ins Dashboard holen. Alarm, Batterie und Prüf-Erinnerung inklusive." : x.desc)}</span><i class="stobt">Ansehen</i></span></button>`;
  }
  _igRender() {
    this._wbLoad(); this._tbLoad(); this._sfxLoad();
    const sr = this.shadowRoot, mainEl = sr.getElementById("main"), ae = sr.activeElement;
    if (ae && mainEl.contains(ae) && (ae.tagName === "SELECT" || ae.classList.contains("stoq"))) return; /* offene Auswahl und Suchfeld nicht durch das automatische Aktualisieren stören */
    const prevOpen = [...mainEl.querySelectorAll("details")].map((d) => d.open), st = this._sto0(), cat = this._stoCat();
    const chips = [["all", "Alle"], ["on", `Verbunden (${cat.filter((x) => x.on).length})`], ["tarif", "Strom & Tarife"], ["auto", "Elektroauto"], ["heizung", "Heizung"], ["wetter", "Wetter"], ["sicherheit", "Sicherheit"], ...(cat.some((x) => x.cat === "haus") ? [["haus", "Haus"]] : [])];
    const keep = mainEl.querySelector(".wrap") ? mainEl.scrollTop : 0;
    mainEl.innerHTML = `
      <div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><img class="blogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false"><div><em class="pn">${esc(PRODUCT)}</em><b>Store</b><span><em class="tag">Integrationen und Dienste</em>${this._ver ? `<em class="ver">Version ${esc(this._ver)}</em>` : ""}</span></div></div>
        <button class="pillbtn" data-act="mdmgr" aria-label="Module verwalten">${ic("layers", 16)}<span class="bl">Module</span></button>
        <button class="pillbtn" data-act="stoset" aria-label="Store anzeigen">${ic("sliders", 16)}<span class="bl">Anzeige</span></button>
        <button class="pillbtn pri" data-act="igback">${ic("check", 16)}<span class="bl">Fertig</span></button></div>
      <div class="wrap"><div class="sxw stow">
        <label class="stosr"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input class="stoq" type="search" data-f="stoq" value="${esc(st.q)}" placeholder="Suchen, z. B. Tibber, Rauchmelder, Wetter" aria-label="Suchen" autocomplete="off" spellcheck="false"></label>
        <div class="stoch">${chips.map(([k, t]) => `<button class="${st.c === k ? "on" : ""}" data-act="stoc" data-k="${k}" aria-pressed="${st.c === k}">${t}</button>`).join("")}</div>
        <div id="stofe">${this._stoFeat()}</div>
        <div id="stogrid">${this._stoGrid()}</div>
        <div class="mut sm" style="margin:6px 4px 0">Der Store ist ein Katalog: Er zeigt, was zu deinen Modulen passt, erkennt, was in Home Assistant schon läuft, und führt dich durch die Einrichtung.</div>
      </div></div>`;
    const ds = [...mainEl.querySelectorAll("details")]; if (prevOpen.length === ds.length) ds.forEach((d, n) => { d.open = prevOpen[n]; });
    const inp = mainEl.querySelector(".stoq"); if (inp) inp.addEventListener("input", () => { this._sto0().q = inp.value.trim(); const g = sr.getElementById("stogrid"), f = sr.getElementById("stofe"); if (g) g.innerHTML = this._stoGrid(); if (f) f.innerHTML = this._stoFeat(); });
  }
  _stoModal() {
    const m = this._modal, x = this._stoCat().find((y) => y.id === m.id); if (!x) return `<div class="ov" data-act="close"></div>`;
    const adm = this._admin(), add = `/config/integrations/dashboard/add?domain=${x.d}`, man = `/config/integrations/integration/${x.d}`;
    const btn = x.act ? `<button class="btn2 pri" data-act="stogo" data-k="${x.act}">${x.on ? "Verwalten" : "Einrichten"}</button>` : (adm ? `<a class="btn2 pri" href="${x.on ? man : add}" target="_blank" rel="noopener">${x.on ? "Verwalten" : "Einrichten"}</a>${!x.on && x.hacs ? `<a class="btn2" href="${x.hacs}" target="_blank" rel="noopener">Anleitung</a>` : ""}` : "");
    return `<div class="ov" data-act="close"></div><div class="sheet wide stosh" role="dialog" aria-modal="true">
      <div class="stohd"><span class="stoi big" style="background:${x.c}">${ic(x.i, 38)}</span><div><b>${esc(x.n)}</b><small>${esc(x.sub)}${x.src === "Community" ? " · Community" : ""}</small><div class="stoact">${btn}${x.on ? `<span class="stos ${x.bad ? "bad" : "ok"}">● ${x.bad ? "Nicht erreichbar" : "Verbunden"}</span>` : ""}</div></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${x.on && x.st ? `<div class="mut sm" style="margin:0 0 8px">${esc(x.st)}</div>` : ""}
      <div class="stofa"><div><b>${esc(x.mods.join(", "))}</b><small>wird genutzt von</small></div><div><b>${esc(x.conn)}</b><small>Verbindung</small></div><div><b>${esc(x.src === "Direkt" ? "Direkt" : x.src)}</b><small>Quelle</small></div></div>
      <div class="lsec">${ic("check", 15)}Was du bekommst</div><ul class="stoul">${x.feats.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      ${x.quirks ? `<div class="lsec">${ic("sliders", 15)}Besonderheiten dieses Herstellers</div><ul class="stoul stoq2">${x.quirks.map(([t, d]) => `<li><b>${esc(t)}:</b> ${esc(d)}</li>`).join("")}</ul>` : ""}
      <div class="lsec">${ic("tools", 15)}So geht es</div>${x.steps.map((t, n) => `<div class="stost"><b>${n + 1}</b><span>${esc(t)}</span></div>`).join("")}
      ${x.note ? `<div class="stowarn">${ic("info", 16)}<span>${esc(x.note)}</span></div>` : ""}
      ${x.quirks ? `<div class="mut sm" style="margin-top:10px">Die Hinweise stammen aus Herstellerangaben und Erfahrungen der Community. Bitte am eigenen Gerät prüfen, Firmware und Integration können sich unterscheiden.</div>` : ""}
      <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="close">Schließen</button></div></div>`;
  }
  _stoSetModal() {
    const t = this._stoCfg();
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Store anzeigen</b><span>gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut sm" style="margin:0 0 8px">Der Store bleibt immer unter Einstellungen → Allgemein erreichbar. Hier schaltest du die zusätzlichen Zugänge einzeln ein oder aus.</div>
      <div class="ltog"><span><b>Store-Symbol im Kopf</b><br><small class="mut">Puzzle-Symbol neben den Einstellungen, mit Zähler für Dienste, die noch fehlen</small></span><button class="sw ${t.icon ? "on" : ""}" data-act="stotog" data-k="icon" aria-pressed="${t.icon}" aria-label="Store-Symbol im Kopf"></button></div>
      <div class="ltog"><span><b>Tab „Store“ in der Modul-Leiste</b><br><small class="mut">Ersetzt den gestrichelten Tab „Erweitern“ am Ende der Leiste</small></span><button class="sw ${t.tab ? "on" : ""}" data-act="stotog" data-k="tab" aria-pressed="${t.tab}" aria-label="Tab Store in der Modul-Leiste"></button></div>
      <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _stoAct(a, b) {
    const k = b.dataset.k;
    if (a === "stoc") { this._sto0().c = k; this._render(); }
    else if (a === "stodet") { this._modal = { type: "stodet", id: k }; this._renderModal(); }
    else if (a === "stogo") { this._igAct(k, b); }
    else if (a === "stoset") { this._modal = { type: "stoset" }; this._renderModal(); }
    else if (a === "stotog") { const t = this._stoCfg(); this._cfg.layout.store = { ...t, [k]: !t[k] }; this._saveLayout(); this._render(); this._renderModal(); }
  }
  /* Integrationen für Wetter und Warnungen: Dienste mit Status. Eingerichtete Dienste nutzt Modul 9 automatisch (Zuordnung nur bei mehreren). */
  _wxOffAny() { const E = this._hass.entities || {}; return Object.keys(this._hass.states).some((k) => ["dwd_weather_warnings", "nina", "meteoalarm"].includes((E[k] || {}).platform)); }
  _igWxCatalog() {
    return [
      { d: "dwd_weather_warnings", n: "Deutscher Wetterdienst (DWD)", t: "Amtliche Unwetterwarnungen für deinen Landkreis", k: "warn", c: "#ef4444", i: "shield", top: 1 },
      { d: "nina", n: "NINA Bevölkerungsschutz", t: "Warnungen von Bund und Ländern (Unwetter, Hochwasser, Gefahren)", k: "warn", c: "#f97316", i: "alert", top: 1 },
      { d: "meteoalarm", n: "MeteoAlarm", t: "Europäische Wetterwarnungen", k: "warn", c: "#eab308", i: "shield" },
      { d: "met", n: "Met.no", t: "Wetter und Vorhersage, kostenlos und ohne Anmeldung", k: "weather", c: "#0ea5e9", i: "cloud", top: 1 },
      { d: "openweathermap", n: "OpenWeatherMap", t: "Wetter und Vorhersage, Schlüssel nötig", k: "weather", c: "#0ea5e9", i: "cloud" },
      { d: "open_meteo", n: "Open-Meteo", t: "Wetter und Stundenvorhersage, kostenlos", k: "weather", c: "#0ea5e9", i: "cloud" },
      { d: "accuweather", n: "AccuWeather", t: "Wetter und Vorhersage, Schlüssel nötig", k: "weather", c: "#0ea5e9", i: "cloud" },
      { d: "pirateweather", n: "Pirate Weather", t: "Wetter und Stundenvorhersage, Schlüssel nötig", k: "weather", c: "#0ea5e9", i: "cloud" },
      { d: "tomorrowio", n: "Tomorrow.io", t: "Wetter und Vorhersage, Schlüssel nötig", k: "weather", c: "#0ea5e9", i: "cloud" },
      { d: "ecowitt", n: "Ecowitt", t: "Eigene Wetterstation: Wind, Regen, Temperatur vor Ort", k: "station", c: "#64748b", i: "fan" },
      { d: "netatmo", n: "Netatmo", t: "Eigene Wetterstation: Temperatur, Regen, Wind", k: "station", c: "#64748b", i: "fan" },
      { d: "tempest", n: "WeatherFlow Tempest", t: "Eigene Wetterstation: Wind, Regen, Blitze", k: "station", c: "#64748b", i: "fan" },
    ];
  }
  /* Zuordnung der Wetter-Quellen: gehört zu Modul 9 und steht in dessen Einstellungen */
  _wxsAssign() {
    this._wxsLoad(); const H = this._hass, S = H.states, E = H.entities || {}, adm = this._admin(), W = this._wxs().cfg, L = this._wxCfg();
    const nm = (id) => esc((S[id].attributes || {}).friendly_name || id), un = (id) => (S[id].attributes || {}).unit_of_measurement || "";
    const ids = Object.keys(S), byDom = (d) => ids.filter((k) => (E[k] || {}).platform === d);
    const weather = ids.filter((k) => k.startsWith("weather.")), wind = ids.filter((k) => k.startsWith("sensor.") && (S[k].attributes.device_class === "wind_speed" || /^(km\/h|m\/s|mph|kn)$/i.test(un(k))) && !/gust|boe|böe/i.test(k)).slice(0, 12);
    const tmp = ids.filter((k) => k.startsWith("sensor.") && S[k].attributes.device_class === "temperature" && /au(ß|ss)en|outdoor|outside|garten|terrasse|balkon/i.test(k + " " + (S[k].attributes.friendly_name || ""))).slice(0, 12);
    const off = ids.filter((k) => /^(sensor|binary_sensor)\./.test(k) && ["dwd_weather_warnings", "nina", "meteoalarm"].includes((E[k] || {}).platform));
    const notify = [...new Set([...Object.keys((H.services || {}).notify || {}).filter((n) => !["send_message", "reload", "persistent_notification"].includes(n)).sort().map((n) => "notify." + n), ...W.notify.to])];
    const opt = (ids2, cur, auto, lab) => `<option value="" ${cur ? "" : "selected"}>${esc(auto)}</option>${ids2.map((id) => `<option value="${esc(id)}" ${cur === id ? "selected" : ""}>${lab(id)}</option>`).join("")}`;
    const sel = (ico, t, f, body, dis) => `<div class="vrow"><span>${ic(ico, 15)} ${t}</span><select class="osel" style="max-width:55%;margin:0" data-f="${f}" aria-label="${t}" ${adm && !dis ? "" : "disabled"}>${body}</select></div>`;
    const multi = weather.length > 1 || wind.length > 1 || tmp.length > 1 || off.length > 1;
    return `<div class="mut sm" style="margin:0 0 4px">${multi ? "Es gibt mehrere Quellen. Standard ist „Automatisch“, du kannst eine bestimmte wählen." : "Es ist jeweils nur eine Quelle da, deshalb passt „Automatisch“."} Die Wetter-Entität und die Außentemperatur gelten auch für die Wetter-Anzeige im Dashboard.</div>
      ${sel("cloud", "Wetter", "wxsselw", opt(weather, L.entity && S[L.entity] ? L.entity : "", weather[0] ? `Automatisch (${(S[weather[0]].attributes || {}).friendly_name || weather[0]})` : "Keine gefunden", (id) => nm(id)), !weather.length)}
      ${sel("fan", "Wind", "wxsselwind", opt(wind, W.wind && S[W.wind] ? W.wind : "", "Automatisch (aus der Wetter-Entität)", (id) => `${nm(id)} · ${esc(S[id].state)} ${esc(un(id))}`), !wind.length)}
      ${sel("thermo", "Außentemperatur", "wxsselout", opt(tmp, L.outdoor && S[L.outdoor] ? L.outdoor : "", "Automatisch (aus der Wetter-Entität)", (id) => `${nm(id)} · ${esc(S[id].state)} ${esc(un(id))}`), !tmp.length)}
      ${sel("shield", "Amtliche Warnung", "wxsseloff", `<option value="" ${W.official.on && !W.official.ent ? "selected" : ""}>${off[0] ? "Automatisch (" + esc((S[off[0]].attributes || {}).friendly_name || off[0]) + ")" : "Keine gefunden"}</option>${off.map((id) => `<option value="${esc(id)}" ${W.official.on && W.official.ent === id ? "selected" : ""}>${nm(id)}</option>`).join("")}<option value="__off" ${W.official.on ? "" : "selected"}>Nicht verwenden</option>`, !off.length)}`;
  }
  _igSfCatalog() {
    return [
      { d: "xsense", n: "X-Sense", t: "Rauch-, CO-, Hitze- und Wassermelder über die X-Sense-Basisstation. Inoffizielle Community-Integration (HACS), nutzt die X-Sense-Cloud.", c: "#e11d48", i: "flame", top: 1, hacs: "https://github.com/Jarnsen/ha-xsense-component_test" },
      { d: "zha", n: "Zigbee (ZHA)", t: "Zigbee-Melder direkt über Home Assistant, ohne Cloud", c: "#f59e0b", i: "shield", top: 1 },
      { d: "mqtt", n: "Zigbee2MQTT / MQTT", t: "Melder über Zigbee2MQTT oder MQTT-Bridges", c: "#a855f7", i: "shield", top: 1 },
      { d: "homematicip_cloud", n: "Homematic IP", t: "Rauch- und Wassermelder von Homematic IP", c: "#0ea5e9", i: "shield", top: 1 },
      { d: "fritzbox", n: "AVM FRITZ!SmartHome", t: "FRITZ!DECT-Geräte und Melder an der FRITZ!Box", c: "#ef4444", i: "shield" },
      { d: "zwave_js", n: "Z-Wave JS", t: "Z-Wave-Rauch- und CO-Melder", c: "#14b8a6", i: "shield" },
      { d: "matter", n: "Matter", t: "Melder über Matter", c: "#64748b", i: "shield" },
      { d: "tuya", n: "Tuya / Smart Life", t: "Rauch- und Wassermelder von Tuya-Marken, Cloud nötig", c: "#f97316", i: "shield" },
    ];
  }
  /* Tibber: Strompreise direkt über die Tibber-Schnittstelle */
  _tbLoad(force) {
    if (!this._hass || this._tbBusy) return;
    if (!force && this._tbD && Date.now() - this._tbD.ts < 20000) return;
    this._tbBusy = true;
    this._hass.callWS({ type: "fenster_heizung/tb_get" }).then((r) => { this._tbD = { d: r || {}, ts: Date.now() }; }).catch(() => { this._tbD = { d: { error: true }, ts: Date.now() }; })
      .finally(() => { this._tbBusy = false; if (this._igOpen || this._wbVisible()) this._render(); });
  }
  _tb() { return (this._tbD && this._tbD.d) || {}; }
  _tbMini(k) {
    const pr = [20, 19, 17, 15, 14, 14, 15, 18, 24, 30, 33, 31, 27, 22, 18, 16, 16, 18, 24, 28, 25, 21, 19, 18]; // Beispielverlauf
    if (k === "h") return pr.filter((_, i) => i % 4 === 0).map((v, i) => `<rect x="${3 + i * 19.5}" y="${42 - v}" width="16" height="${v}" rx="2" fill="#f59e0b"/>`).join("");
    if (k === "q") return pr.map((v, i) => `<rect x="${3 + i * 4.9}" y="${42 - v}" width="3.6" height="${v}" rx="1" fill="#f59e0b"/>`).join("");
    const col = (v) => v < 17 ? "#2dd4bf" : v < 25 ? "#a3a3a3" : "#f87171";
    return pr.filter((_, i) => i % 2 === 0).map((v, i) => `<rect x="${3 + i * 9.8}" y="${v < 17 ? 18 : v < 25 ? 26 : 34}" width="8.6" height="${v < 17 ? 24 : v < 25 ? 16 : 8}" rx="2" fill="${col(v)}"/>`).join("");
  }
  _igTbModal() {
    const I = this._igS, d = I.tb, t = I.tbTest, T = this._tb();
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Tibber</b><span>Strompreise über die Tibber-Schnittstelle</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("shield", 15)}Zugriffstoken</div>
      <input class="osel" type="password" data-f="igtbtok" maxlength="200" value="${esc(d.token)}" placeholder="${T.connected ? "Gespeichert – zum Ändern neu eingeben" : "Persönlicher Zugriffstoken von Tibber"}" aria-label="Zugriffstoken" autocomplete="off" spellcheck="false">
      <div class="mut sm">Den Token erstellst du auf developer.tibber.com nach der Anmeldung mit deinem Tibber-Konto (Bereich „Create token“).</div>
      <div class="foot2" style="margin:10px 0"><button class="btn2" data-act="igtbtest" ${I.busy || !d.token ? "disabled" : ""}>${ic("check", 16)} ${I.busy ? "Prüfe …" : "Verbindung testen"}</button></div>
      ${t ? `<div class="otr"><span class="oav" style="width:36px;height:36px;background:${t.ok ? "#22c55e" : "#f87171"}">${ic(t.ok ? "check" : "alert", 18)}</span><div class="opi"><b>${t.ok ? "Verbindung steht" : "Keine Verbindung"}</b><small>${t.ok ? `${esc(t.home || "Zuhause")} · jetzt ${num(t.price_now, 1)} ct/kWh · heute ${num(t.min, 1)} bis ${num(t.max, 1)} ct/kWh · morgen ${t.tomorrow ? "vorhanden" : "noch nicht veröffentlicht"}` : esc(t.error || "Der Token wurde nicht akzeptiert")}</small></div></div>` : ""}
      ${t && t.ok && (t.homes || []).length > 1 ? `<div class="lsec">${ic("energy", 15)}Zuhause wählen</div><div class="gschips">${t.homes.map((h) => `<button class="gsch ${d.home === h.id ? "sel" : ""}" data-act="igtbhome" data-k="${esc(h.id)}" aria-pressed="${d.home === h.id}">${esc(h.name)}</button>`).join("")}</div>` : ""}
      <div class="lsec" style="margin-top:12px">${ic("chart", 15)}Preisauflösung</div>
      <div class="tbvar">${[["h", "Stundenmittel", "Ein Preis pro Stunde (Mittel aus vier Viertelstunden). Übersichtlich und stabil, empfohlen."], ["q", "Viertelstunden", "Die genauen 15-Minuten-Preise von Tibber. Der Plan nutzt auch kurze Preistäler, braucht aber mehr Schaltvorgänge."], ["lvl", "Preisstufen", "Nur Tibbers Einstufung (sehr günstig bis teuer). Lädt in günstigen Stufen, ohne genaue Preise zu rechnen. Kosten in der Statistik sind dann grob."]].map(([k, t, x]) => `<button class="${d.res === k ? "sel" : ""}" data-act="igtbres" data-k="${k}" aria-pressed="${d.res === k}"><svg viewBox="0 0 120 44" width="100%" height="44" aria-hidden="true">${this._tbMini(k)}</svg><b>${t}</b><small>${x}</small></button>`).join("")}</div>
      <div class="gst">${ic("info", 15)}Der Token wird nur in Home Assistant gespeichert und nur an api.tibber.com gesendet. Es werden ausschließlich die Strompreise abgerufen, keine Verbrauchsdaten.</div>
      <div class="foot2" style="margin-top:14px">${T.connected ? `<button class="btn2 dng" data-act="igtbrm">${ic("trash", 16)} Entfernen</button>` : `<button class="btn2" data-act="close">Abbrechen</button>`}<button class="btn2 pri" data-act="igtbsave" ${(t && t.ok) || (T.connected && !d.token) ? "" : "disabled"}>Speichern</button></div></div>`;
  }
  _igGoeModal() {
    const I = this._igS, d = I.draft, t = I.test, c = this._wb();
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>go-e Charger</b><span>Direkte Verbindung im lokalen Netzwerk</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("energy", 15)}IP-Adresse</div>
      <input class="osel" type="text" inputmode="decimal" data-f="igip" maxlength="64" value="${esc(d.ip)}" placeholder="z. B. 192.168.1.45" aria-label="IP-Adresse" autocomplete="off">
      <div class="mut sm">Die Adresse findest du in der go-e-App oder in deinem Router. Es sind nur Adressen im lokalen Netz erlaubt.</div>
      <div class="foot2" style="margin:10px 0"><button class="btn2" data-act="igtest" ${I.busy ? "disabled" : ""}>${ic("check", 16)} ${I.busy ? "Prüfe …" : "Verbindung testen"}</button></div>
      ${t ? `<div class="otr"><span class="oav" style="width:36px;height:36px;background:${t.ok ? "#22c55e" : "#f87171"}">${ic(t.ok ? "check" : "alert", 18)}</span><div class="opi"><b>${t.ok ? "Verbindung steht" : "Keine Antwort"}</b><small>${t.ok ? `${esc(t.type || "go-e")} · Seriennummer ${esc(t.serial || "–")} · Firmware ${esc(t.fw || "–")}` : esc(t.error || "Prüfe IP-Adresse, WLAN der Wallbox und ob die lokale HTTP-API in der App aktiv ist.")}</small></div></div>` : ""}
      <div class="gst">${ic("info", 15)}Es werden nur Status und Ladeeinstellungen der Wallbox gelesen und gesetzt. Es werden keine Daten an Dritte gesendet.</div>
      <div class="foot2" style="margin-top:14px">${c.ip ? `<button class="btn2 dng" data-act="igrm">${ic("trash", 16)} Entfernen</button>` : `<button class="btn2" data-act="close">Abbrechen</button>`}<button class="btn2 pri" data-act="igsave" ${t && t.ok ? "" : "disabled"}>Speichern</button></div></div>`;
  }
  _igAct(a, b) {
    const I = this._igS || (this._igS = { draft: { ip: "" }, test: null, busy: false, tb: { token: "", home: "", res: "h" }, tbTest: null });
    if (!I.tb) I.tb = { token: "", home: "" };
    if (a === "igopen") { this._igOpen = true; this._stOpen = false; this._sto = { q: "", c: "all" }; this._modal = null; this._renderModal(); this._render(); }
    else if (a === "igback") { this._igOpen = false; this._render(); }
    else if (a === "iggoe") { I.draft = { ip: this._wb().ip }; I.test = null; this._modal = { type: "iggoe" }; this._renderModal(); }
    else if (a === "igtest") {
      I.busy = true; this._renderModal();
      this._hass.callWS({ type: "fenster_heizung/wb_test", ip: (I.draft.ip || "").trim() }).then((r) => { I.test = r; }).catch(() => { I.test = { ok: false, error: "Keine Antwort von Home Assistant" }; })
        .finally(() => { I.busy = false; if (this._modal && this._modal.type === "iggoe") this._renderModal(); });
    }
    else if (a === "igtb") { I.tb = { token: "", home: this._tb().home_id || "", res: this._tb().res || "h" }; I.tbTest = null; this._modal = { type: "igtb" }; this._renderModal(); }
    else if (a === "igtbtest") {
      I.busy = true; this._renderModal();
      this._hass.callWS({ type: "fenster_heizung/tb_test", token: (I.tb.token || "").trim() }).then((r) => { I.tbTest = r; if (r && r.ok && !I.tb.home) I.tb.home = ((r.homes || [])[0] || {}).id || ""; }).catch(() => { I.tbTest = { ok: false, error: "Keine Antwort von Home Assistant" }; })
        .finally(() => { I.busy = false; if (this._modal && this._modal.type === "igtb") this._renderModal(); });
    }
    else if (a === "igtbres") { I.tb.res = b.dataset.k; this._renderModal(); }
    else if (a === "igtbhome") { I.tb.home = b.dataset.k; this._renderModal(); }
    else if (a === "igtbsave") { this._hass.callWS({ type: "fenster_heizung/tb_set", ...(I.tb.token.trim() ? { token: I.tb.token.trim() } : {}), home: I.tb.home, res: I.tb.res || "h" }).then(() => this._tbLoad(true)).catch(() => {}); this._modal = null; this._renderModal(); this._toast("Tibber gespeichert"); }
    else if (a === "igtbrm") { this._hass.callWS({ type: "fenster_heizung/tb_set", token: "", home: "" }).then(() => this._tbLoad(true)).catch(() => {}); this._modal = null; this._renderModal(); this._toast("Tibber entfernt"); }
    else if (a === "igsave") { this._wbSave({ ip: I.draft.ip.trim() }, true); this._modal = null; this._renderModal(); this._render(); this._toast("go-e Charger gespeichert"); }
    else if (a === "igrm") { this._wbSave({ ip: "", enabled: false, mode: "off" }, true); this._modal = null; this._renderModal(); this._render(); this._toast("go-e Charger entfernt"); }
  }
  _igChange(t) { const I = this._igS; if (I && t.dataset.f === "igip") { I.draft.ip = t.value; I.test = null; return true; } if (I && t.dataset.f === "igtbtok") { I.tb.token = t.value; I.tbTest = null; if (this._modal && this._modal.type === "igtb") this._renderModal(); return true; } return false; }

  /* Modul 8: Heute, Schnellstart, Hausanschluss-Schutz, Benachrichtigungen */
