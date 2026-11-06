  /* ================= Sponsor-Lounge (Konzept Sponsor-Bereich 2.0, Stufen S1 + S2) und Sponsor Max 1 =================
     Eigene Seite statt Dialog, erreichbar über das Herz/den Stern im Kopf, die Startseite und die Einstellungen.
     Mit Schlüssel: B1 Begrüßung, B2 Neu für dich, B3 Deine Extras, B4 Mitreden & Abzeichen, ★ Max (Morgen-Briefing,
     Jahres-Poster). Ohne Schlüssel: „Sponsor werden“ (A1–A4). Entwickler und Verwaltung unauffällig ganz unten.
     Grundsatz: Nichts, was frei ist, wird gesperrt. Alle Zahlen kommen aus den eigenen Daten und bleiben im Browser. */
  _lgMax() { const s = this._spnS(); return !!(s.active && s.tier === "max"); }
  _lgBLoad(force) {
    if (!this._hass || (this._lgB && !force) || this._lgBBusy) return;
    this._lgBBusy = true;
    this._hass.callWS({ type: "fenster_heizung/brief_get" }).then((r) => { this._lgB = r; }).catch(() => { this._lgB = { cfg: null, err: true }; })
      .finally(() => { this._lgBBusy = false; if (this._loOpen) this._render(); if (this._modal && this._modal.type === "lgbrief") this._renderModal(); });
  }
  /* A2 / Poster: Zahlen aus den eigenen Daten (Modul 1 Pausen und Ersparnis, Modul 4 Läufe und Ersparnis) */
  _lgNums(sc = "total") {
    const rooms = this._collect(), fs = new Set(rooms.map((r) => r.fuel || "erdgas")), F = fs.size === 1 ? FUELS[[...fs][0]] : MIXED;
    const gas = rooms.reduce((a, r) => a + ((r.sc[sc] || {})[fs.size === 1 ? "gas" : "kwh"] || 0), 0), min = rooms.reduce((a, r) => a + ((r.sc[sc] || {}).min || 0), 0);
    const H = (this._gsD && this._gsD.hist) || {}, y = String(new Date().getFullYear());
    let sv = 0, n = 0, own = 0, kwh = 0;
    Object.values(H).forEach((L) => (L || []).forEach((r) => { if (sc === "year" && !String(r.d).startsWith(y)) return; sv += r.saved || 0; n += r.n || 0; own += (r.s || 0) + (r.b || 0); kwh += (r.s || 0) + (r.b || 0) + (r.g || 0); }));
    return { rooms: rooms.length, gas, F, min, sv, n, own: kwh > 0 ? own / kwh * 100 : null };
  }
  _lgNew() {
    /* nur echte Labs: was inzwischen ein Addon oder fest eingebaut ist (LAB_GONE, z. B. Licht & Lampen), gehört nicht hierher */
    const cat = (this._labCat0 ? this._labCat0() : []).filter((x) => this._labIsEarly(x) && !LAB_GONE.includes(x.id));
    let seen = 0; try { seen = +localStorage.getItem("fh_lg_seen") || 0; } catch (_) { /* egal */ }
    return { early: cat, fresh: seen ? cat.filter((x) => this._labEarlyTs(x) - 14 * 864e5 > seen).length : 0 };
  }
  _lgRender() {
    const sr = this.shadowRoot, mainEl = sr.getElementById("main"), s = this._spnS(), adm = this._admin();
    if (!this._gsD && this._gsLoad) this._gsLoad();
    if (s.active && this._lgMax()) this._lgBLoad();
    const sw = (act, on, label, k = "", dis = false) => `<button class="sw ${on ? "on" : ""}" data-act="${act}" ${k ? `data-k="${k}"` : ""} aria-pressed="${!!on}" aria-label="${esc(label)}" ${adm && !dis ? "" : "disabled"}></button>`;
    const foot = `<div class="lgfoot">${adm && s.active ? `<button class="lnk" data-act="spnkeydlg">Schlüssel ändern</button>` : ""}${adm && s.manage ? `${s.active ? "<span>·</span>" : ""}<button class="lnk" data-act="spnadm">Sponsoren verwalten</button>` : ""}${adm && !s.manage ? `${s.active ? "<span>·</span>" : ""}<button class="lnk" data-act="spnadm">Entwickler-Zugang</button>` : ""}</div>`;
    const dev = s.state === "dev", mx = s.tier === "max";
    const chips = s.active ? `<span class="lgchips">${dev ? `<em class="lgchip pk">Entwickler-Zugang</em>` : `<em class="lgchip ${mx ? "gd" : "pk"}">${mx ? "★ Sponsor Max" : "♥ Sponsor"}${s.since ? " seit " + esc(this._spnDate(s.since)) : ""}</em><em class="lgchip">Schlüssel gültig bis ${esc(this._spnDate(s.bis))}</em>`}</span>`
      : adm ? `<button class="lgchip btn" data-act="spnkeydlg">Ich habe schon einen Schlüssel</button>` : "";
    const bar = `<div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><img class="blogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false"><div><em class="pn">${esc(PRODUCT)}</em><b>${s.active ? "Sponsor-Lounge" : "Sponsor-Bereich"}</b><span>${this._verTag()}</span></div></div>
        ${this._narrow ? "" : chips}<button class="pillbtn pri" data-act="lgxback">${ic("check", 16)}<span class="bl">Fertig</span></button></div>`;
    mainEl.innerHTML = `${bar}<div class="wrap"><div class="sxw stow lgw${this._narrow ? " lgn" : ""}">${this._narrow && chips ? `<div class="lgchipsn">${chips}</div>` : ""}${s.active ? this._lgIn(s, sw) : this._lgOut(s)}${foot}</div></div>`;
    if (s.active) { try { localStorage.setItem("fh_lg_seen", String(Date.now())); } catch (_) { /* egal */ } }
  }
  /* Szene für den Kopf der Seite: Haus im Herkunfts-Ring, Flusslinien aus allen Richtungen (immer dunkel, wie im Konzept) */
  _lgScene(gold) {
    const hs = this._gx("house", 46, { on: true, lvl: 90 }).replace(/^<svg[^>]*>/, '<svg x="177" y="80" width="46" height="46" viewBox="0 0 64 64">');
    const ln = (d, c, w = 4) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w * 3}" stroke-linecap="round" opacity=".18"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
    const arc = (a0, a1, c) => { const r = 40, p = (a) => [200 + r * Math.cos(a * Math.PI / 180), 103 + r * Math.sin(a * Math.PI / 180)]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`; };
    const dots = [[40, 30], [92, 160], [140, 22], [262, 40], [318, 170], [360, 24], [70, 96], [300, 120], [380, 88], [230, 180]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#cbd5e1" opacity=".6"/>`).join("");
    const grid = Array.from({ length: 13 }, (_, i) => `<path d="M${i * 34} 0V206" stroke="#5eead4" stroke-opacity=".05"/>`).join("") + Array.from({ length: 7 }, (_, i) => `<path d="M0 ${i * 34}H400" stroke="#5eead4" stroke-opacity=".05"/>`).join("");
    return `<svg class="lgscene" viewBox="0 0 400 206" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><radialGradient id="lgsg" cx=".5" cy=".5" r=".55"><stop offset="0" stop-color="${gold ? "#3b2a0c" : "#0f3b3a"}"/><stop offset="1" stop-color="#0b1220"/></radialGradient></defs>
      <rect width="400" height="206" fill="url(#lgsg)"/>${grid}${dots}
      ${ln("M150 0C170 40 186 60 190 66", "#fbbf24", 5)}${ln("M400 46C330 52 270 72 238 92", "#fb923c")}${ln("M400 112C340 106 280 104 242 104", "#38bdf8", 3)}
      ${ln("M400 196C330 170 270 140 232 120", "#f472b6")}${ln("M0 160C60 150 120 130 162 114", "#a78bfa")}${ln("M60 70C100 80 130 92 160 98", "#fb7185", 2)}
      <circle cx="200" cy="103" r="40" fill="#0b1220" fill-opacity=".7"/>${arc(-80, 40, "#fbbf24")}${arc(48, 128, "#f472b6")}${arc(136, 200, "#a78bfa")}${arc(208, 272, "#fb923c")}${hs}</svg>`;
  }
  /* ---- mit Schlüssel: B1 Begrüßung, B2 Neu für dich, B3 Deine Extras, B4 Wunsch des Monats und Abzeichen ---- */
  _lgIn(s, sw) {
    const P = s.saved_prefs || s.prefs, mx = s.tier === "max", dev = s.state === "dev", nw = this._lgNew(), B = this._lgB, bc = (B && B.cfg) || {}, lc = this._labCfg();
    const first = dev ? "" : (s.name || "").split(" ")[0], yr = new Date().getFullYear(), dez = new Date().getMonth() === 11;
    const sub = [nw.fresh ? `${nw.fresh} ${nw.fresh === 1 ? "neue Vorabversion" : "neue Vorabversionen"} seit deinem letzten Besuch` : nw.early.length ? `${nw.early.length} ${nw.early.length === 1 ? "Vorabversion" : "Vorabversionen"} für dich vor allen anderen` : "Alles, was du nutzt, bleibt frei – deine Extras kommen obendrauf",
      dev ? "Entwickler-Zugang: alle Extras und Max sind frei" : s.max_ended ? `Max ist am ${esc(this._spnDate(s.max_ended))} ausgelaufen, Sponsor gilt weiter` : mx ? "Sponsor Max mit Morgen-Briefing und Jahres-Poster" : ""].filter(Boolean).join(" · ");
    const renew = !dev && s.days != null && s.days <= (mx ? 14 : 30) ? `<a class="btn2 ${mx ? "lggold" : "lgpk"}" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">${mx ? "★ Max verlängern" : "♥ Verlängern"}</a>` : "";
    const b1 = `<div class="lghero ${mx ? "mx" : ""}"><div class="lghl"><small class="lghi">${first ? `Hallo ${esc(first)} ` : "Hallo "}${mx ? `<span class="lggd">★</span>` : "♥"}</small><h2>Danke, dass du Strom &amp; Wärme trägst.</h2><p>${sub}</p>
      <div class="lgbtns">${renew}<button class="btn2 ${renew ? "" : "lgpk"}" data-act="lgxgo" data-k="lgnew">Was ist neu?</button><button class="btn2" data-act="lgxgo" data-k="lgwish">Wunsch des Monats</button></div></div><div class="lghr">${this._lgScene(mx)}</div></div>`;
    const row = (icon, t, subt, ctl) => `<div class="lgit">${icon}<span class="n">${t}<small>${subt}</small></span>${ctl}</div>`;
    const gi = (k) => `<span class="lgg">${this._gx(k, 30, { on: true, lvl: 80 })}</span>`;
    const opn = (act, t = "Öffnen") => `<button class="lgopen" data-act="${act}">${t}</button>`;
    const nItems = [
      ...nw.early.slice(0, 3).map((x) => row(gi(x.hd || "bolt"), esc(x.n || x.id), `Vorabversion · für alle ab ${esc(this._labEarlyDate(x))}`, sw("labtog", lc.on.includes(x.id), x.n || x.id, x.id))),
      ...(mx ? [row(gi("sun"), "Morgen-Briefing", bc.on ? `jeden Morgen um ${esc(bc.time || "06:30")}` : "★ Max · eine Meldung am Morgen", opn("lgxbrief", "Einstellen")), row(gi("house"), `Jahres-Poster ${yr}`, dez ? "fertig · als Bild teilen" : "ab 1. Dezember · Vorschau schon jetzt", opn("lgxposter", dez ? "Öffnen" : "Vorschau"))] : []),
    ];
    if (!nw.early.length) nItems.push(row(gi("forecast"), "Vorabversionen zuerst", P.early ? "an · neue Labs siehst du hier 14 Tage vor allen" : "neue Labs 14 Tage vor allen anderen", sw("spnearly", P.early, "Vorabversionen")));
    nItems.push(row(gi("price"), "Monatsbericht", "„Dein Haus im Monat“ als Bild · kommt mit Stufe S3", `<em class="lgsoon">bald</em>`));
    const b2 = `<div class="lgt lgnew" id="lgnew" style="--c:#fbbf24"><h4>Neu für dich – vor allen anderen</h4>${nItems.slice(0, 4).join("")}</div>`;
    const seg = (act, cur, opts) => `<span class="gschs">${opts.map(([k, t]) => `<button class="gsch ${String(cur) === String(k) ? "sel" : ""}" data-act="${act}" data-k="${k}">${t}</button>`).join("")}</span>`;
    const li = (t, ctl, small = "") => `<div class="lgli"><span><span>${t}</span>${small ? `<small>${small}</small>` : ""}</span>${ctl}</div>`;
    const soon = (t) => li(t, `<em class="lgsoon">bald</em>`);
    const b3 = `<div class="lgt" style="--c:#2dd4bf"><h4>Deine Extras</h4>
      ${li("Hausfluss (Modul 19)", sw("labtog", this._mdState().on.ef === true, "Hausfluss", "ef"))}
      ${li("Vorabversionen zuerst", sw("spnearly", P.early, "Vorabversionen"))}
      ${li("Farbverlauf im Kopf", seg("spngrad", P.grad, [["none", "Aus"], ["meer", "Meer"], ["abend", "Abend"]]))}
      ${li("Uhr-Stil im Ruhemodus", seg("spnclk", P.clock, [["standard", "Std."], ["duenn", "Dünn"], ["kraeftig", "Kräftig"], ["digital", "Digital"]]))}
      ${mx ? li(`Morgen-Briefing <span class="lggd">★</span>`, sw("lgxbon1", !!bc.on, "Morgen-Briefing", "", !B || !B.cfg)) : ""}
      ${soon("Energie-Coach")}${soon("Wohnklima-Zeugnis")}${soon("Heizkosten je Raum")}${soon("Wand-Tablet-Extras")}</div>`;
    const mon = new Date().toLocaleDateString("de-DE", { month: "long" });
    const wish = ["Gartenplan früher (Modul 10)", "Einkaufsliste im Tablet-Modus", "Pool nach Strompreis", "Saugroboter nach Abwesenheit"];
    const b4a = `<div class="lgt" id="lgwish" style="--c:#f472b6"><h4>Wunsch des Monats · ${esc(mon)}</h4>${wish.map((w) => `<div class="lgpoll"><span>${esc(w)}</span><i><b style="width:0"></b></i></div>`).join("")}
      <div class="lgnote2">Abstimmen kommt mit Stufe S3 – dann siehst du hier den Stand, der Gewinner kommt in die Roadmap. Bis dahin: Wunsch einfach per Mail.</div>
      <div class="lgbtns"><em class="lgsoon">bald</em><a class="lgopen" href="mailto:${SPN_MAIL}?subject=${encodeURIComponent("Wunsch für Strom & Wärme")}" style="text-decoration:none">Wunsch per Mail</a></div></div>`;
    const st = P.badge ? (P.badge_style === "gold" && !mx ? "heart" : P.badge_style) : "off";
    const bd = [["heart", "♥", "Herz", "#f472b6"], ["gold", "★", mx ? "Goldener Stern" : "Goldener Stern · nur Max", "#fbbf24"], ["sun", "☀", "Sonne", "#fbbf24"], ["snow", "❄", "Schneeflocke", "#38bdf8"]];
    const b4b = `<div class="lgt" style="--c:#a78bfa"><h4>Dein Abzeichen</h4><div class="lgbadges">${bd.map(([k, g, t, c]) => `<button class="lgbd ${st === k ? "sel" : ""} ${k === "gold" && !mx ? "lock" : ""}" style="--c:${c}" data-act="lgxbadge" data-k="${k}" aria-pressed="${st === k}" aria-label="${t}" title="${t}" ${this._admin() && (k !== "gold" || mx) ? "" : "disabled"}>${g}</button>`).join("")}</div>
      <div class="lgbdoff">${P.badge ? `<button class="lnk" data-act="lgxbadge" data-k="off">Abzeichen im Kopf ausblenden</button>` : `<span class="mut">Abzeichen ist ausgeblendet – tippe eins an</span>`}</div>
      ${li("Name im Kopf zeigen", sw("lgxname", P.name_head, "Name im Kopf"), first ? `„Hallo ${esc(first)}“ statt „Sponsor“` : "")}
      ${li("In der Danke-Liste (README) nennen", sw("lgxthanks", P.thanks, "Danke-Liste"), P.thanks ? "freiwillig · Bescheid per Mail ist vorbereitet" : "freiwillig")}</div>`;
    const up = mx ? "" : `<div class="lgt lgup"><span class="lgstar sm">★</span><span class="n"><b>Sponsor Max</b><small>Morgen-Briefing aufs Handy, Jahres-Poster und goldener Stern – nur monatlich, Schlüssel 3 Monate.</small></span><a class="btn2 lggold" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" style="flex:none;text-decoration:none">Mehr</a></div>`;
    return `<div class="lgtop">${b1}${b2}</div><div class="lg3">${b3}${b4a}${b4b}</div>${up}`;
  }
  /* ---- ohne Schlüssel: A1 Botschaft, A2 Ersparnis, A3 drei Schritte, A4 Extras als Kacheln ---- */
  _lgOut(s) {
    const N = this._lgNums(), hide = (() => { try { return localStorage.getItem("fh_lg_a2") === "1"; } catch (_) { return false; } })(), adm = this._admin();
    const nums = [N.rooms && N.gas > 0 ? ["eco", `${num(N.gas, N.gas >= 100 ? 0 : 1)} ${esc(unitOf(N.F))}`, `${esc(N.F.short)} gespart`] : null, N.sv > 0 ? ["euro", `${num(N.sv, N.sv >= 100 ? 0 : 2)} €`, "Vorteil durch Solar"] : null, N.rooms && N.min > 0 ? ["windowOpen", `${num(N.min / 60, 0)} h`, "Pausen beim Lüften"] : null].filter(Boolean);
    const mail = `mailto:${SPN_MAIL}?subject=${encodeURIComponent("Sponsor-Schlüssel Strom & Wärme")}&body=${encodeURIComponent("Hallo, ich habe auf GitHub gesponsert.\nMein GitHub-Name: \nStufe: Sponsor / Sponsor Max\n\nDanke!")}`;
    const hero = `<div class="lghero out"><div class="lghl"><em class="lgchip pk">♥ Strom &amp; Wärme bleibt kostenlos</em><h2>Mit dir wird es schneller besser.</h2><p>Alles, was heute frei ist, bleibt frei. Sponsoren bekommen Extras obendrauf – und bestimmen mit, was als Nächstes kommt.</p>
      <div class="lgbtns"><a class="btn2 lgpk" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">♥ Sponsor werden</a><button class="btn2" data-act="lgxgo" data-k="lgget">Extras ansehen</button></div></div><div class="lghr">${this._lgScene(false)}</div></div>`;
    const a2 = nums.length && !hide ? `<div class="lgt" style="--c:#fbbf24"><h4>Das hat Strom &amp; Wärme bei dir schon geschafft</h4><div class="lgnums">${nums.map(([k, v, l]) => `<div>${this._gx(k, 34, { on: true, lvl: 80 })}<span><b>${v}</b><small>${l}</small></span></div>`).join("")}</div>
      <div class="lgnote2">Aus deinen eigenen Daten seit der Installation. Wird nur hier angezeigt, nichts verlässt dein Home Assistant. <button class="lnk" data-act="lgxa2">ausblenden</button></div></div>` : "";
    const step = (n, t, sub, attr) => `<${attr ? attr[0] : "div"} class="lgstp" ${attr ? attr[1] : ""}><em>${n}</em><b>${t}</b><small>${sub}</small></${attr ? attr[0] : "div"}>`;
    const a3 = `<div class="lgt" style="--c:#f472b6"><h4>So wirst du Sponsor</h4><div class="lgsteps">
      ${step(1, "Auf GitHub sponsern", "einmalig oder monatlich", ["a", `href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"`])}
      ${step(2, "Kurze Mail", "Text ist schon fertig", ["a", `href="${mail}"`])}
      ${step(3, "Schlüssel einfügen", "Extras sofort an", adm ? ["button", `data-act="spnkeydlg"`] : null)}</div></div>`;
    const T = [["bolt", "Hausfluss (Modul 19)", "Dein Haus als Fluss-Bild mit HD-Bildern", "neu", "ef", "#2dd4bf"], ["forecast", "Vorabversionen", "Neue Funktionen 14 Tage vor allen", "", "early", "#38bdf8"],
      ["sun", "Morgen-Briefing", "Dein Tag jeden Morgen aufs Handy", "max", "brief", "#fbbf24"], ["house", "Jahres-Poster", "Dein Jahr als Poster zum Drucken", "max", "poster", "#fbbf24"],
      ["lamp", "Uhr-Stile & Verläufe", "Für Kopf und Tablet-Ruhemodus", "", "look", "#a78bfa"], ["euro", "Energie-Coach", "Jeden Montag 3 Tipps mit Euro-Betrag", "bald", "coach", "#fbbf24"],
      ["price", "Monatsbericht", "„Dein Haus im Monat“ als Bild", "bald", "report", "#2dd4bf"], ["person", "Wunsch des Monats", "Abstimmen, was als Nächstes kommt", "bald", "wish", "#f472b6"]];
    const tag = (t) => t === "neu" ? `<em class="lgtag neu">NEU</em>` : t === "max" ? `<em class="lgtag mx">★ MAX</em>` : t === "bald" ? `<em class="lgtag">BALD</em>` : "";
    const a4 = `<div class="lgh4" id="lgget">Was du bekommst – Auswahl</div><div class="lgget">${T.map(([k, t, sub, tg, id, c]) => `<button class="lgxt2" style="--c:${c}" data-act="lgxex" data-k="${id}">${tag(tg)}${this._gx(k, 36, { on: true, lvl: 80 })}<b>${esc(t)}</b><small>${sub}</small></button>`).join("")}</div>`;
    const tiers = `<div class="lgtiers"><div class="lgt"><b>♥ Sponsor</b><small>einmalig oder monatlich · Schlüssel 1 Jahr · alle Extras, Vorabversionen, Hausfluss</small></div><div class="lgt mx"><b><span class="lggd">★</span> Sponsor Max</b><small>nur monatlich · Schlüssel 3 Monate · zusätzlich Morgen-Briefing, Jahres-Poster, goldener Stern</small></div></div>`;
    return `${hero}<div class="lg2">${a2}${a3}</div>${a4}${tiers}`;
  }
  /* ---- Aktionen ---- */
  _lgAct(a, b) {
    const k = b.dataset.k, B = this._lgB;
    if (a === "lgxback") { this._loOpen = false; this._render(); return; }
    if (a === "lgxa2") { try { localStorage.setItem("fh_lg_a2", "1"); } catch (_) { /* egal */ } this._render(); return; }
    if (a === "lgxname") { this._spnPref({ name_head: !this._spnS().saved_prefs.name_head }); return; }
    if (a === "lgxbadge") { if (k === "off") this._spnPref({ badge: false }); else if (k !== "gold" || this._lgMax()) this._spnPref({ badge: true, badge_style: k }); return; }
    if (a === "lgxgo") { const el = this.shadowRoot.getElementById(k); if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); el.classList.add("hzflash"); setTimeout(() => el.classList.remove("hzflash"), 1600); } return; }
    if (a === "lgxthanks") { const s = this._spnS(), on = !s.saved_prefs.thanks; this._spnPref({ thanks: on }); if (on && s.state !== "dev") window.open(`mailto:${SPN_MAIL}?subject=${encodeURIComponent("Danke-Liste Strom & Wärme")}&body=${encodeURIComponent(`Hallo, bitte nenne mich in der Danke-Liste im README.\nName: ${s.name || ""}\n\nDanke!`)}`, "_self"); return; }
    if (a === "lgxex") { this._modal = { type: "lgex", k }; this._renderModal(); return; }
    if (a === "lgxposter") { this._modal = { type: "lgposter" }; this._renderModal(); return; }
    if (a === "lgxbrief") { this._modal = { type: "lgbrief" }; this._lgBLoad(true); this._renderModal(); return; }
    if (a === "lgxpng") { this._lgPosterPng(); return; }
    if (a === "lgxprint") { this._lgPosterPrint(); return; }
    if (!B || !B.cfg) return;
    const c = { ...B.cfg };
    if (a === "lgxbon" || a === "lgxbon1") c.on = !c.on;
    else if (a === "lgxbev") c.evening = !c.evening;
    else if (a === "lgxbt") { const [h, m] = c.time.split(":").map(Number), t = (h * 60 + m + Number(k) + 1440) % 1440; c.time = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; }
    else if (a === "lgxbblk") { const s = new Set(c.blocks); if (s.has(k)) s.delete(k); else s.add(k); c.blocks = [...s]; }
    else if (a === "lgxbnot") { const s = new Set(c.notify); if (s.has(k)) s.delete(k); else s.add(k); c.notify = [...s]; }
    else if (a === "lgxbtest") {
      this._hass.callWS({ type: "fenster_heizung/brief_test", kind: k === "evening" ? "evening" : "morning" }).then((r) => { this._lgB = r; this._renderModal(); this._toast(r.no_service ? "Probe erstellt – wähle noch einen Meldedienst" : r.sent ? "Probe gesendet" : "Senden hat nicht geklappt"); })
        .catch((e) => this._toast("Briefing: " + ((e && e.message) || "das hat nicht geklappt")));
      return;
    } else return;
    this._lgB = { ...B, cfg: c }; if (this._modal) this._renderModal(); else if (this._loOpen) this._render();
    this._hass.callWS({ type: "fenster_heizung/brief_set", cfg: c }).then((r) => { this._lgB = r; if (this._modal) this._renderModal(); if (this._loOpen) this._render(); }).catch(() => this._toast("Das ging nicht"));
  }
  /* ---- Fenster: Briefing, Poster, Beispiel ---- */
  _lgModal() {
    const m = this._modal, close = `<button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button>`, adm = this._admin();
    const wrap = (t, sub, body, wide = true) => `<div class="ov" data-act="close"></div><div class="sheet ${wide ? "wide" : ""}" role="dialog" aria-modal="true"><div class="sh"><div><b>${t}</b><span>${sub}</span></div>${close}</div>${body}</div>`;
    if (m.type === "lgex") {
      const X = { ef: ["bolt", "Hausfluss", "Dein Haus in der Mitte, Solar, Netz, Akku und Geräte als Kacheln drumherum. Die Linien zeigen live, wohin der Strom fließt – mit den neuen HD-Bildern."], brief: ["sun", "Morgen-Briefing ★", "Jeden Morgen eine Meldung aufs Handy: Sonne heute, günstigste Strom-Stunde, beste Startzeit für die Waschmaschine, Auto, Heizung und Auffälligkeiten. Bausteine einzeln wählbar."], poster: ["house", "Jahres-Poster ★", "Im Dezember dein Jahr als Poster: Heizöl gespart, Heizpausen, Gerätestrom mit eigenem Anteil und Ersparnis – A3 zum Drucken oder als Bild."], look: ["lamp", "Uhr-Stile & Verläufe", "Zusätzliche Farbverläufe für den Kopf und vier Uhr-Stile für den Ruhemodus im Tablet-Modus."], early: ["forecast", "Vorabversionen", "Neue Labs siehst du 14 Tage vor allen anderen – mit Datum, ab wann sie für alle kommen."], coach: ["euro", "Energie-Coach (bald)", "Jeden Montag drei Spartipps aus deinen Daten mit Euro-Betrag. Kommt mit Stufe S3."] }[m.k] || ["plug", "Extra", ""];
      return wrap(X[1], "Beispiel mit Musterdaten", `<div class="lgexd">${this._gx(X[0], 110, { on: true, lvl: 80 })}<p>${X[2]}</p></div><div class="gbtns" style="margin-top:12px"><a class="btn2 spnb pri" href="${esc(this._spnS().url)}" target="_blank" rel="noopener noreferrer" style="flex:none;text-decoration:none">${ic("heart", 16)} Sponsor werden</a></div>`, false);
    }
    if (m.type === "lgposter") {
      return wrap(`Jahres-Poster ${new Date().getFullYear()}`, "★ Sponsor Max · nur aus deinen Daten", `<div class="lgposter">${this._lgPosterSvg()}</div>
        <div class="gbtns" style="margin-top:12px"><button class="btn2 pri" data-act="lgxpng">${ic("download", 16)} Als Bild speichern</button><button class="btn2" data-act="lgxprint">${ic("image", 16)} Drucken (A3)</button></div>
        <div class="mut sm" style="margin-top:8px">Zahlen, die dir fehlen (zum Beispiel ohne Gerätestrom), lässt das Poster weg.${new Date().getMonth() === 11 ? "" : " Das fertige Jahres-Poster gibt es ab 1. Dezember."}</div>`);
    }
    if (m.type === "lgbrief") {
      const B = this._lgB, c = (B && B.cfg) || null;
      if (!c) return wrap("Morgen-Briefing", "★ Sponsor Max", `<div class="mut sm">${B && B.err ? "Das Briefing ist noch nicht bereit." : "Lädt …"}</div>`);
      const svc = Object.keys((this._hass.services || {}).notify || {}).filter((n) => n !== "send_message").sort().map((n) => "notify." + n), opts = [...svc, ...c.notify.filter((n) => !svc.includes(n))];
      const BL = { sun: "☀️ Sonne heute", price: "€ Strompreis", dev: "🧺 Bestes Geräte-Fenster", car: "🚗 Auto", heat: "🔥 Heizung & Fenster", warn: "⚠️ Auffälligkeiten", muell: "🗑️ Müll (Addon, bald)" };
      const row = (t, sub, ctl) => `<div class="vrow"><span>${t}${sub ? `<small class="mut" style="display:block">${sub}</small>` : ""}</span>${ctl}</div>`;
      const sw = (act, on) => `<button class="sw ${on ? "on" : ""}" data-act="${act}" aria-pressed="${!!on}" ${adm ? "" : "disabled"}></button>`;
      const L = B.last || {};
      return wrap("Morgen-Briefing", "★ Sponsor Max · eine Meldung am Morgen", `
        ${row("Briefing senden", "", sw("lgxbon", c.on))}
        ${row("Uhrzeit", "", `<span class="lgstep"><button class="ibtn" data-act="lgxbt" data-k="-15" aria-label="früher">${ic("minus", 16)}</button><b>${esc(c.time)}</b><button class="ibtn" data-act="lgxbt" data-k="15" aria-label="später">${ic("plus", 16)}</button></span>`)}
        ${row("Abend-Rückblick", `kurz um ${esc(c.evening_time)}: was heute gespart wurde`, sw("lgxbev", c.evening))}
        <div class="lsec">Bausteine</div><div class="gschips">${B.blocks.map((k) => `<button class="gsch ${c.blocks.includes(k) ? "sel" : ""}" data-act="lgxbblk" data-k="${k}" aria-pressed="${c.blocks.includes(k)}" ${k === "muell" ? "disabled" : ""}>${BL[k] || k}</button>`).join("")}</div>
        <div class="mut sm" style="margin:4px 0 0">Ein Baustein ohne Daten (zum Beispiel ohne Tibber oder ohne Auto) fällt einfach weg.</div>
        <div class="lsec">Senden an</div>${opts.length ? `<div class="gschips">${opts.map((n) => `<button class="gsch ${c.notify.includes(n) ? "sel" : ""}" data-act="lgxbnot" data-k="${esc(n)}" aria-pressed="${c.notify.includes(n)}">${esc(n.replace("notify.", ""))}</button>`).join("")}</div>` : `<div class="mut sm">Keine Benachrichtigungsdienste gefunden.</div>`}
        ${L.lines ? `<div class="lsec">Zuletzt${L.test ? " (Probe)" : ""} · ${esc(String(L.ts || "").replace("T", " "))}</div><div class="lgmsg"><b>${esc(L.title || "")}</b>${L.lines.map((x) => `<span>${esc(x)}</span>`).join("")}</div>` : ""}
        <div class="gbtns" style="margin-top:12px"><button class="btn2" data-act="lgxbtest" data-k="morning">${ic("bell", 16)} Probe senden</button>${c.evening ? `<button class="btn2" data-act="lgxbtest" data-k="evening">Probe Abend</button>` : ""}<button class="btn2 pri" data-act="close">Fertig</button></div>`);
    }
    return "";
  }
  /* ---- Jahres-Poster als SVG (zum Speichern als Bild und zum Drucken) ---- */
  _lgPosterSvg() {
    const y = new Date().getFullYear(), N = this._lgNums("year"), s = this._spnS(), W = 840, H = 1188;
    const cells = [N.rooms && N.gas > 0 ? [`${num(N.gas, N.gas >= 100 ? 0 : 1)} ${unitOf(N.F)}`, `${N.F.short} gespart`] : null, N.rooms && N.min > 0 ? [`${num(N.min / 60, 0)} h`, "Heizpausen beim Lüften"] : null,
      N.n > 0 ? [`${num(N.n)} ×`, "Geräte-Läufe"] : null, N.own != null ? [`${num(N.own, 0)} %`, "davon eigener Strom"] : null, N.sv > 0 ? [`${num(N.sv, 0)} €`, "durch eigenen Strom gespart"] : null].filter(Boolean);
    const inner = (k, x, yy, sz) => { const sv = this._gx(k, sz, { on: true, lvl: 90 }); return `<g transform="translate(${x} ${yy})">${sv.replace(/^<svg[^>]*>/, `<svg width="${sz}" height="${sz}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">`)}</g>`; };
    const cw = 360, chh = 112;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" style="max-width:420px;display:block;margin:0 auto;border-radius:10px">
      <defs><radialGradient id="pbg" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#134e4a"/><stop offset=".7" stop-color="#0f1419"/></radialGradient><linearGradient id="pyr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#5eead4"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#pbg)"/>
      <text x="60" y="110" font-family="Roboto,system-ui,sans-serif" font-size="24" letter-spacing="6" font-weight="700" fill="#5eead4">STROM &amp; WÄRME · MEIN JAHR</text>
      <text x="56" y="250" font-family="Roboto,system-ui,sans-serif" font-size="150" font-weight="900" fill="url(#pyr)">${y}</text>
      ${inner("house", 285, 290, 270)}${["pvRoof", "battery", "washer", "car"].map((k, i) => inner(k, 180 + i * 125, 570, 100)).join("")}
      ${cells.map(([v, l], i) => { const cx = 60 + (i % 2) * (cw + 0), cy = 700 + Math.floor(i / 2) * (chh + 16); return `<rect x="${cx}" y="${cy}" width="${cw - 16}" height="${chh}" rx="18" fill="#ffffff" fill-opacity=".07"/><text x="${cx + 22}" y="${cy + 40}" font-family="Roboto,system-ui,sans-serif" font-size="21" fill="#9aa7b4">${esc(l)}</text><text x="${cx + 22}" y="${cy + 92}" font-family="Roboto,system-ui,sans-serif" font-size="44" font-weight="800" fill="#e6edf3">${esc(v)}</text>`; }).join("")}
      ${cells.length ? "" : `<text x="${W / 2}" y="820" text-anchor="middle" font-family="Roboto,system-ui,sans-serif" font-size="26" fill="#9aa7b4">Noch keine Jahreswerte – Modul 1 und Gerätestrom füllen das Poster.</text>`}
      <text x="${W / 2}" y="${H - 50}" text-anchor="middle" font-family="Roboto,system-ui,sans-serif" font-size="20" fill="#9aa7b4">${esc(s.name && s.state !== "dev" ? s.name + " · " : "")}★ Sponsor Max · Strom &amp; Wärme</text></svg>`;
  }
  _lgPosterPng() {
    const svg = this._lgPosterSvg().replace('width="100%" style="max-width:420px;display:block;margin:0 auto;border-radius:10px"', 'width="1680" height="2376"');
    const img = new Image(), url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    img.onload = () => {
      try {
        const c = document.createElement("canvas"); c.width = 1680; c.height = 2376; c.getContext("2d").drawImage(img, 0, 0, 1680, 2376);
        c.toBlob((bl) => { if (!bl) { this._toast("Speichern nicht möglich"); return; } const a = document.createElement("a"); a.href = URL.createObjectURL(bl); a.download = `Jahres-Poster_${new Date().getFullYear()}.png`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); this._toast("Poster gespeichert"); }, "image/png");
      } catch (_) { this._toast("Speichern nicht möglich"); }
    };
    img.onerror = () => this._toast("Speichern nicht möglich");
    img.src = url;
  }
  _lgPosterPrint() {
    const w = window.open("", "_blank");
    if (!w) { this._toast("Bitte Pop-ups für Home Assistant erlauben"); return; }
    w.document.write(`<!DOCTYPE html><html><head><title>Jahres-Poster</title><style>@page{size:A3 portrait;margin:0}html,body{margin:0;background:#0f1419}svg{width:100vw;height:auto;display:block;max-width:none!important;border-radius:0!important}</style></head><body>${this._lgPosterSvg()}<script>setTimeout(function(){print()},400)<\/script></body></html>`);
    w.document.close();
  }
