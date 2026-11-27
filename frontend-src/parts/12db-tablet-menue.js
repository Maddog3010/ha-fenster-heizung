  /* ================= Tablet-Modus · Einstellungen in neuer Optik (2026.11.5b13) =================
     Kopf mit kleiner Vorschau des Tablets (Leiste, Startseite, Ausrichtung) und dem Zustand auf einen Blick.
     Fünf Reiter statt einer langen Liste: Tablet, Anzeige, Module, Display, Verwalten (nur Administratoren in der normalen Ansicht).
     Neu: Startseite wählbar, Ruhebild „Uhr“, Wetter-Szene abschaltbar, Nachtruhe (Ruhebild dunkler, Display-Licht gedimmt),
     Display testen, Ruhemodus jetzt, Seite neu laden, Leiste und Module mit einem Tipp zurücksetzen. */
  _tmHome() { const h = this._tmC().home; return h && h !== "st" && this._tmItems().some((x) => x.id === h) ? h : "st"; }
  _tmHm(d = new Date()) { return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }
  _tmNight() {
    const n = this._tmC().night || {}; if (!n.on || n.from === n.to) return false;
    const hm = this._tmHm(); return n.from < n.to ? hm >= n.from && hm < n.to : hm >= n.from || hm < n.to;
  }
  /* Kleine Vorschau: so sieht das Tablet mit diesen Einstellungen aus */
  _tmxPreview(c) {
    const items = this._tmItems(), land = window.innerWidth >= window.innerHeight, nw = c.look !== "classic";
    const rail = nw ? [items[0], ...this._tm2Rail(items)] : items.slice(0, land ? 7 : 5);
    const icons = rail.map((x) => `<i class="${x.id === this._tmHome() ? "on" : ""}">${ic(x.icon, 13)}</i>`).join("") + `<i>${ic("grid", 13)}</i>`;
    const home = items.find((x) => x.id === this._tmHome()) || items[0];
    const body = `<div class="tmxpb"><b>${esc(home.id === "st" ? "Start" : this._tm2Name ? this._tm2Name(home) : home.name)}</b><span></span><span></span><span class="w"></span></div>`;
    return `<div class="tmxpv ${land ? "land" : "port"} ${nw ? "nw" : "cl"}${c.size !== "auto" ? " big" : ""}" aria-hidden="true">${nw && land ? `<div class="tmxpr">${icons}</div>${body}` : `${body}<div class="tmxpd">${icons}</div>`}</div>`;
  }
  _tmxState(ent, onWord, offWord) {
    const s = ent && this._hass.states[ent]; if (!s) return ["", "–"];
    const on = s.state === "on", ago = s.last_changed ? this._hzSince(s.last_changed) : "";
    return [on ? "on" : "off", `${on ? onWord : offWord}${ago ? ` · ${ago}` : ""}`];
  }
  _tmSetHtml() {
    const m = this._modal, inT = m.type === "tmset", me = this._tmMe(), c = this._tmC(), kd = this._tmKind(), mode = this._tmMode(), adm = this._admin(), lock = this._tmLocked(), st = this._hass.states;
    const mods = this._mdList().filter((x) => x.id !== "st"), items = this._tmItems();
    const tabs = [["dev", "Tablet"], ["show", "Anzeige"], ["mods", "Module"], ["disp", "Display"], ...(!inT && adm ? [["adm", "Verwalten"]] : [])];
    const tab = tabs.some((t) => t[0] === this._tmxTab) ? this._tmxTab : "dev";
    const dis = lock ? " disabled" : "";
    const seg = (act, cur, opts) => `<div class="tmxseg" role="group">${opts.map(([k, t]) => `<button class="${String(cur) === String(k) ? "sel" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${String(cur) === String(k)}"${dis}>${t}</button>`).join("")}</div>`;
    const sw = (act, on, label) => `<button class="sw ${on ? "on" : ""}" data-act="${act}" aria-pressed="${!!on}" aria-label="${esc(label)}"${dis}></button>`;
    const row = (icon, t, s, ctl, wide) => `<div class="tmxr${wide ? " wide" : ""}"><span class="tmxri">${ic(icon, 20)}</span><span class="tmxrt"><b>${t}</b>${s ? `<small>${s}</small>` : ""}</span><span class="tmxrc">${ctl}</span></div>`;
    const card = (t, inner) => `<div class="tmxc">${t ? `<div class="tmxct">${t}</div>` : ""}${inner}</div>`;
    /* Kopf */
    const ms = this._tmxState(c.motion, "Bewegung", "ruhig"), ds = c.screen && st[c.screen] ? (st[c.screen].state === "on" ? "an" : "aus") : "";
    const chip = (ok, icon, t) => `<span class="tmxchip ${ok ? "ok" : ""}">${ic(icon, 14)}${t}</span>`;
    const chips = [inT ? chip(true, "tablet", "Tablet-Modus an") : chip(mode !== "off", "tablet", mode === "on" ? "Immer an" : mode === "auto" ? "Automatisch" : "Tablet-Modus aus"),
      chip(me.has_pin, "lock", me.has_pin ? "PIN gesetzt" : "ohne PIN"), chip(!!c.screen || !!c.notify, "lamp", c.screen ? `Display ${ds || "verbunden"}` : c.notify ? "HA-App weckt" : "kein Display-Schalter"),
      chip(!!c.motion, "eye", c.motion ? ms[1] : "kein Bewegungsmelder"), ...(c.night && c.night.on ? [chip(true, "moon", `Nachtruhe ${c.night.from}–${c.night.to}`)] : [])].join("");
    const head = `<div class="tmxh">${this._tmxPreview(c)}<div class="tmxhi"><b>${esc(me.name)}</b><small>${esc(kd.label)} · ${window.innerWidth} × ${window.innerHeight}</small><div class="tmxchips">${chips}</div></div></div>`;
    const lockBox = lock ? `<div class="tmxlock">${ic("lock", 18)}<span><b>Geschützt mit PIN</b><small>Ansehen geht, Ändern erst nach der PIN.</small></span><button class="btn2 pri" data-act="tmunl">${ic("lock", 16)}Entsperren</button></div>` : "";
    let body = "";
    if (tab === "dev") {
      const opts = items.map((x) => `<option value="${x.id}"${this._tmHome() === x.id ? " selected" : ""}>${esc(x.id === "st" ? "Start" : this._tm2Name ? this._tm2Name(x) : x.name)}</option>`).join("");
      body = card("", (inT ? "" : row("tablet", "Tablet-Modus", "Ersetzt die normale Ansicht. Automatisch: auf Touchgeräten ab 600 px Breite.", seg("tmmode", mode, [["off", "Aus"], ["auto", "Automatisch"], ["on", "Immer an"]]), true))
        + row("pencil", "Name", "Damit du die Tablets auseinanderhältst", `<input class="osel tmxin" data-f="tmname" value="${esc(me.name)}" maxlength="24" aria-label="Name"${dis}>`)
        + row("lock", "PIN", me.has_pin ? "6 Stellen · schützt die Einstellungen und Schalten mit Folgen" : "Ohne PIN kann jeder am Tablet alles ändern", lock ? "" : `<button class="btn2 ${me.has_pin ? "" : "pri"}" data-act="tmchg">${ic("lock", 16)}${me.has_pin ? "PIN ändern" : "PIN festlegen"}</button>`))
        + card("Startseite", row("home", "Startseite", "Öffnet beim Start und nach „Zurück nach“", `<select class="osel tmxin" data-f="tmsel" data-k="home" aria-label="Startseite"${dis}>${opts}</select>`)
        + row("clock", "Zurück zur Startseite nach", "Ohne Berührung", seg("tmih", c.idle_home, [[0, "Aus"], [2, "2 Min."], [5, "5 Min."], [15, "15 Min."]]), true))
        + (inT ? card("Jetzt", `<div class="tmxbtns"><button class="btn2" data-act="tmsleepnow">${ic("moon", 18)}Ruhemodus jetzt</button><button class="btn2" data-act="tmreload">${ic("refresh", 18)}Seite neu laden</button><button class="btn2" data-act="tmend"${dis}>${ic("close", 18)}Tablet-Modus beenden</button></div>`)
          : card("Start-Link", `<small class="tmxhint">Für Fully Kiosk (Start-URL) oder Kiosk Satellite: Dann startet das Tablet immer im Tablet-Modus.</small><div class="tmurl"><code>${esc(this._tmUrlStr())}</code><button class="ibtn" data-act="tmcopy" aria-label="Kopieren">${ic("copy", 18)}</button></div>`));
    } else if (tab === "show") {
      const look = (k, t, s) => `<button class="tmxlook ${c.look === k ? "sel" : ""}" data-act="tm2look" data-k="${k}" aria-pressed="${c.look === k}"${dis}><span class="tmxpv land ${k === "new" ? "nw" : "cl"} mini"><span class="${k === "new" ? "tmxpr" : "tmxpd"}">${"<i></i>".repeat(k === "new" ? 5 : 6)}</span><span class="tmxpb"><span></span><span></span></span></span><b>${t}</b><small>${s}</small></button>`;
      const rests = [["auto", "Auto"], ["clock", "Uhr"], ...[["en", "Energie"], ["ef", "Hausfluss"]].filter(([k]) => mods.some((x) => x.id === k) && (k !== "ef" || this._efxSp()))];
      const n = c.night || {}, wx = mods.some((x) => x.id === "wx");
      body = card("Aufbau", `<div class="tmxlooks">${look("new", "Neu", "Leiste links, jede Seite ohne Scrollen")}${look("classic", "Wie bisher", "Leiste unten, Seiten scrollen")}</div>${row("eye", "Größe", "Bedienelemente und Schrift", seg("tmsz", c.size, [["auto", "Auto"], ["large", "Groß"], ["xl", "Sehr groß"]]))}`)
        + card("Ruhemodus", row("moon", "Ruhemodus nach", "Ruhebild statt Inhalt. Berühren oder Bewegung weckt auf.", seg("tmsl", c.sleep, [[0, "Aus"], [5, "5 Min."], [15, "15 Min."], [30, "30 Min."]]), true)
          + (this._tm2On() ? row("image", "Ruhebild", "Auto: Wandanzeige, wenn Energie oder Hausfluss offen ist, sonst die Uhr", seg("tm2rest", c.rest, rests), true) : "")
          + (wx && this._tm2On() ? row("cloud", "Wetter-Szene bei einer Warnung", "Zeigt die Lage statt des Ruhebilds, solange eine Wetterwarnung läuft", sw("tmrestwx", c.rest_wx !== false, "Wetter-Szene bei Warnung")) : "")
          + row("bell", "Warnungen wecken auf", "Zum Beispiel ein Alarm oder ein Unwetter", sw("tmww", c.wake_warn, "Warnungen wecken auf")))
        + card("Nachtruhe", row("moon", "Nachts dunkler", "Ruhebild gedimmt, Display-Licht (Kiosk Satellite) mit weniger Helligkeit", sw("tmnight", n.on, "Nachtruhe"))
          + (n.on ? `<div class="tmxnight"><label>von <input type="time" class="osel" data-f="tmnf" value="${esc(n.from || "22:00")}"${dis}></label><label>bis <input type="time" class="osel" data-f="tmnt" value="${esc(n.to || "06:00")}"${dis}></label>${seg("tmnbri", n.bri, [[10, "10 %"], [20, "20 %"], [30, "30 %"], [50, "50 %"]])}</div><small class="tmxhint">${this._tmNight() ? "Gerade ist Nachtruhe." : "Gerade ist keine Nachtruhe."} Die Helligkeit gilt nur für einen Display-Schalter als Licht.</small>` : ""));
    } else if (tab === "mods") {
      const rail = this._tm2Rail(items).map((x) => x.id), own = (c.rail || []).length > 0, hid = c.dock_hide || [];
      const chipR = (x) => { const i = rail.indexOf(x.id); return `<button class="tmxm ${i >= 0 ? "sel" : ""}" data-act="tm2rail" data-k="${x.id}" aria-pressed="${i >= 0}"${dis}>${i >= 0 ? `<em>${i + 1}</em>` : ic(x.icon, 16)}${esc(this._tm2Name(x))}</button>`; };
      body = (this._tm2On() ? card("Leiste", `<small class="tmxhint">Start, bis zu vier Module und „Mehr“. Die Zahl zeigt den Platz. ${own ? "" : "Gerade automatisch: Modul 1–4."}</small><div class="tmxms">${items.filter((x) => x.id !== "st").map(chipR).join("")}</div>${own ? `<div class="tmxbtns"><button class="btn2" data-act="tmrailreset"${dis}>${ic("refresh", 16)}Automatisch</button></div>` : ""}`) : "")
        + card("Module anzeigen", `<small class="tmxhint">${this._tm2On() ? "Abgewählte Module erscheinen weder in der Leiste noch unter „Mehr“." : "Start ist immer dabei. Bei schmalen Bildschirmen steht der Rest unter „Mehr“."}</small><div class="tmxms">${mods.map((x) => `<button class="tmxm ${hid.includes(x.id) ? "" : "sel"}" data-act="tmdock" data-k="${x.id}" aria-pressed="${!hid.includes(x.id)}"${dis}>${ic(x.icon, 16)}${esc(x.short || x.name)}</button>`).join("")}</div>${hid.length ? `<div class="tmxbtns"><button class="btn2" data-act="tmdockall"${dis}>${ic("eye", 16)}Alle zeigen (${hid.length} aus)</button></div>` : ""}`);
    } else if (tab === "disp") {
      const motions = Object.keys(st).filter((e) => e.startsWith("binary_sensor.") && ["motion", "occupancy", "presence"].includes((st[e].attributes || {}).device_class)), sws = this._tmScreens(c.screen);
      const moAll = motions.length ? motions : Object.keys(st).filter((e) => e.startsWith("binary_sensor."));
      const live = (s, t) => `<span class="tmxlive ${s}"><i></i>${esc(t)}</span>`;
      const ds2 = c.screen ? (st[c.screen] ? ["" + (st[c.screen].state === "on" ? "on" : "off"), `Display ${st[c.screen].state === "on" ? "an" : "aus"}`] : ["bad", "Schalter fehlt in Home Assistant"]) : ["", "nicht gewählt"];
      body = `<div class="tmxdisp">${card("Bewegungsmelder", `${live(c.motion ? ms[0] : "", c.motion ? ms[1] : "nicht gewählt")}${lock ? "" : this._wzSel(moAll, c.motion, "tmsel", 'data-k="motion"', "– keiner –")}<small class="tmxhint">Home Assistant überwacht ihn, auch bei dunklem Display. Bewegung schaltet das Display an.</small>`)}
        ${card("Display-Schalter", `${live(ds2[0], ds2[1])}${lock ? "" : this._wzSel(sws, c.screen, "tmsel", 'data-k="screen"', "– keiner –", /screen|display|bildschirm/i)}<small class="tmxhint">Fully Kiosk: Schalter „Screen“ · Kiosk Satellite: Licht „Screen“</small>${c.screen || c.notify ? `<div class="tmxbtns"><button class="btn2" data-act="tmtest"${dis}>${ic("play", 16)}Display testen</button></div>` : ""}`)}</div>`
        + card("", row("clock", "Display ausschalten nach", "Ohne Bewegung · nur mit Display-Schalter", seg("tmoff", c.off_after, [[0, "Nie"], [10, "10 Min."], [30, "30 Min."]]), true)
          + row("bell", "HA-App (Android)", "Benachrichtigungsdienst, z. B. mobile_app_tablet. Schaltet nur ein.", `<input class="osel tmxin" data-f="tmnot" value="${esc(c.notify)}" placeholder="mobile_app_…" aria-label="Benachrichtigungsdienst"${dis}>`));
    } else {
      const T = (this._tm && this._tm.tablets) || [];
      body = card(`Tablets <em>${T.length}</em>`, T.length ? T.map((t) => `<div class="tmxt"><span class="tmxri">${ic("tablet", 20)}</span><span class="tmxrt"><b>${esc(t.name)}${t.id === me.id ? " · dieses" : ""}</b><small>${t.kind === "fully" ? "Fully Kiosk" : t.kind === "app" ? "HA-App" : "Browser"} · ${esc(t.size || "")} · ${t.has_pin ? "mit PIN" : "ohne PIN"} · zuletzt ${t.seen ? this._hzSince(new Date(t.seen * 1000).toISOString()) : "–"}</small></span><span class="tmxrc">${t.has_pin ? `<button class="btn2" data-act="tmreset" data-id="${esc(t.id)}">PIN zurücksetzen</button>` : ""}${t.id === me.id ? "" : `<button class="btn2" data-act="tmdel" data-id="${esc(t.id)}">Entfernen</button>`}</span></div>`).join("") : `<small class="tmxhint">Noch kein Tablet angemeldet.</small>`)
        + (this._mqOn && this._mqOn("tb") ? card(`<span class="lggd">★</span> Wand-Tablet-Extras`, row("sliders", "Raum, Nacht, Schnellaktionen, Alarm", "Sponsor Max · gilt für dieses Tablet", `<button class="btn2" data-act="mqxset" data-k="tb">Einstellen</button>`)) : "");
    }
    const bar = `<div class="tmxtabs" role="tablist">${tabs.map(([k, t]) => `<button role="tab" class="${tab === k ? "sel" : ""}" aria-selected="${tab === k}" data-act="tmxtab" data-k="${k}">${t}</button>`).join("")}</div>`;
    const foot = inT ? `<button class="btn2 pri" data-act="tmdone">${ic("check", 16)}Fertig</button>` : `<button class="btn2" data-act="close">Schließen</button><button class="btn2 pri" data-act="tmstart"${dis}>${ic("tablet", 16)}Tablet-Modus jetzt starten</button>`;
    return `<div class="ov" data-act="${inT ? "tmdone" : "close"}"></div><div class="sheet wide tmx" role="dialog" aria-modal="true" aria-label="Tablet-Modus">
      <div class="sh"><div><b>Tablet-Modus</b><span>Gilt nur für dieses Gerät</span></div><button class="ibtn" data-act="${inT ? "tmdone" : "close"}" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${head}${lockBox}${bar}<div class="tmxbody">${body}</div><div class="tmxfoot">${foot}</div></div>`;
  }
  _tmxAct(a, b) {
    const k = b.dataset.k, c = this._tmC();
    if (a === "tmxtab") { this._tmxTab = k; this._renderModal(); const sh = this.shadowRoot.querySelector(".sheet"); if (sh) sh.scrollTop = 0; return true; }
    if (a === "tmreload") { location.reload(); return true; }
    if (a === "tmsleepnow") { this._modal = null; this._renderModal(); this._tmSleep = true; this._tmGuard = Date.now() + 700; this._render(); return true; }
    if (this._tmLocked()) return false;
    if (a === "tmrestwx") { this._tmSave({ rest_wx: c.rest_wx === false }); return true; }
    if (a === "tmnight") { this._tmSave({ night: { ...(c.night || {}), on: !(c.night && c.night.on) } }); return true; }
    if (a === "tmnbri") { this._tmSave({ night: { ...(c.night || {}), bri: +k } }); return true; }
    if (a === "tmrailreset") { this._tmSave({ rail: [] }); return true; }
    if (a === "tmdockall") { this._tmSave({ dock_hide: [] }); return true; }
    if (a === "tmtest") {
      const me = this._tmMe();
      this._hass.callWS({ type: "fenster_heizung/tm_test", tid: me.id, ...(this._tmPin ? { pin: this._tmPin } : {}) })
        .then((r) => this._toast(r && r.ok ? (r.off ? "Display geht kurz aus und nach 3 Sekunden wieder an" : "Die HA-App bekommt den Befehl zum Einschalten") : r && r.error === "fehlt" ? "Der Display-Schalter fehlt in Home Assistant" : "Erst einen Display-Schalter wählen"))
        .catch(() => this._toast("Das ging nicht – ist die Integration aktuell?"));
      return true;
    }
    return false;
  }
