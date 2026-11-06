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
    const cat = (this._labCat0 ? this._labCat0() : []).filter((x) => this._labIsEarly(x));
    let seen = 0; try { seen = +localStorage.getItem("fh_lg_seen") || 0; } catch (_) { /* egal */ }
    return { early: cat, fresh: seen ? cat.filter((x) => this._labEarlyTs(x) - 14 * 864e5 > seen).length : 0 };
  }
  _lgRender() {
    const sr = this.shadowRoot, mainEl = sr.getElementById("main"), s = this._spnS(), adm = this._admin();
    if (!this._gsD && this._gsLoad) this._gsLoad();
    if (s.active && this._lgMax()) this._lgBLoad();
    const sw = (act, on, label, k = "") => `<button class="sw ${on ? "on" : ""}" data-act="${act}" ${k ? `data-k="${k}"` : ""} aria-pressed="${!!on}" aria-label="${esc(label)}" ${adm ? "" : "disabled"}></button>`;
    const foot = `<div class="lgfoot">${adm ? `<button class="lnk" data-act="spnkeydlg">Schlüssel ${s.active ? "ändern" : "eingeben"}</button>` : ""}${adm && s.manage ? `<span>·</span><button class="lnk" data-act="spnadm">Sponsoren verwalten</button>` : ""}${adm && !s.manage ? `<span>·</span><button class="lnk" data-act="spnadm">Entwickler-Zugang</button>` : ""}</div>`;
    const bar = `<div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><img class="blogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false"><div><em class="pn">${esc(PRODUCT)}</em><b>Sponsor-Lounge</b><span><em class="tag">${s.active ? (s.tier === "max" ? "★ Sponsor Max" : "♥ Sponsor") : "Sponsor werden"}</em>${this._verTag()}</span></div></div>
        <button class="pillbtn pri" data-act="lgxback">${ic("check", 16)}<span class="bl">Fertig</span></button></div>`;
    mainEl.innerHTML = `${bar}<div class="wrap"><div class="sxw stow lgw">${s.active ? this._lgIn(s, sw) : this._lgOut(s)}${foot}</div></div>`;
    if (s.active) { try { localStorage.setItem("fh_lg_seen", String(Date.now())); } catch (_) { /* egal */ } }
  }
  /* ---- mit Schlüssel: B1–B4 und Max ---- */
  _lgIn(s, sw) {
    const P = s.saved_prefs || s.prefs, mx = s.tier === "max", dev = s.state === "dev", nw = this._lgNew(), B = this._lgB, bc = (B && B.cfg) || {};
    const since = s.since ? new Date(s.since + "T12:00:00").toLocaleDateString("de-DE", { month: "short", year: "numeric" }) : "";
    const b1 = `<div class="lgban ${mx ? "mx" : ""}">${mx ? `<div class="lgstar">★</div>` : `<div class="lgstar hz">${ic("heart", 30)}</div>`}<div class="lgbt"><small>Sponsor-Lounge</small><b>${dev ? "Entwickler-Zugang" : `Willkommen zurück${s.name ? ", " + esc(s.name.split(" ")[0]) : ""}!`}</b>
      <span>${dev ? "Alle Extras und Max sind für dich frei, ohne Schlüssel." : `${mx ? "★ Sponsor Max" : "♥ Sponsor"}${since ? " seit " + esc(since) : ""} · gilt bis ${esc(this._spnDate(s.bis))}${s.max_ended ? " · Max ist am " + esc(this._spnDate(s.max_ended)) + " ausgelaufen, Sponsor gilt weiter" : ""}`}${nw.fresh ? ` · Seit deinem letzten Besuch: ${nw.fresh} neue Vorabversion${nw.fresh === 1 ? "" : "en"}` : ""}</span></div>
      ${!dev && s.days != null && s.days <= (mx ? 14 : 30) ? `<a class="btn2 ${mx ? "lggold" : "spnb"}" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" style="flex:none;text-decoration:none">${mx ? "★ Max verlängern" : "♥ Verlängern"}</a>` : ""}</div>`;
    const b2 = `<div class="lgt" style="--c:#34d399"><h3>${ic("flask", 17)}Neu für dich</h3>${nw.early.length ? nw.early.slice(0, 4).map((x) => `<div class="lgit"><span class="lgi">${ic("flask", 16)}</span><span class="n">${esc(x.n || x.t || x.id)}<small>Vorabversion · für alle ab ${esc(this._labEarlyDate(x))}</small></span><button class="btn2" data-act="labopen" style="flex:none">Öffnen</button></div>`).join("") : `<div class="mut sm">Gerade gibt es keine neuen Vorabversionen. Neue Labs siehst du hier 14 Tage vor allen anderen${P.early ? "" : " – schalte dafür unten „Vorabversionen zuerst“ ein"}.</div>`}
      <div class="lgit"><span class="lgi">${ic("chart", 16)}</span><span class="n">Monatsberichte<small>kommen mit Stufe S3</small></span><em class="lgsoon">bald</em></div></div>`;
    const b4 = `<div class="lgt" style="--c:#a78bfa"><h3>${ic("users", 17)}Mitreden &amp; Abzeichen</h3>
      <div class="vrow"><span>Abzeichen im Kopf<small class="mut" style="display:block">${mx ? "Herz oder goldener Stern" : "Herz neben den Knöpfen"}</small></span>${mx ? `<span class="gschs"><button class="gsch ${P.badge && P.badge_style === "heart" ? "sel" : ""}" data-act="lgxbadge" data-k="heart">${ic("heart", 12)} Herz</button><button class="gsch spng ${P.badge && P.badge_style !== "heart" ? "sel" : ""}" data-act="lgxbadge" data-k="gold">★ Gold</button><button class="gsch ${P.badge ? "" : "sel"}" data-act="lgxbadge" data-k="off">Aus</button></span>` : sw("spnbadge", P.badge, "Abzeichen")}</div>
      <div class="vrow"><span>Name im Kopf<small class="mut" style="display:block">„Hallo ${esc((s.name || "…").split(" ")[0])}“ statt „Sponsor“</small></span>${sw("lgxname", P.name_head, "Name im Kopf")}</div>
      <div class="vrow"><span>In der Danke-Liste stehen<small class="mut" style="display:block">freiwillig, im README – einfach kurz per Mail Bescheid geben</small></span><a class="btn2" href="mailto:${SPN_MAIL}?subject=${encodeURIComponent("Danke-Liste Strom & Wärme")}" style="flex:none;text-decoration:none">${ic("mail", 14)} Mail</a></div>
      <div class="vrow"><span>Wunsch des Monats<small class="mut" style="display:block">abstimmen über GitHub · kommt mit Stufe S3</small></span><em class="lgsoon">bald</em></div></div>`;
    const tile = (icon, t, sub, ctl, max) => `<div class="lgx ${max ? "mx" : ""}">${icon}<span class="n"><b>${t}${max ? ` <span class="lggd">★</span>` : ""}</b><small>${sub}</small></span>${ctl}</div>`;
    const seg = (act, cur, opts) => `<span class="gschs">${opts.map(([k, t]) => `<button class="gsch ${String(cur) === String(k) ? "sel" : ""}" data-act="${act}" data-k="${k}">${t}</button>`).join("")}</span>`;
    const maxT = mx ? [
      tile(this._gx("sun", 40), "Morgen-Briefing", bc.on ? `jeden Morgen um ${esc(bc.time || "06:30")}${(bc.notify || []).length ? "" : " · noch kein Meldedienst"}` : "aus · eine Meldung am Morgen", `<button class="btn2" data-act="lgxbrief" style="flex:none">Einstellen</button>`, true),
      tile(this._gx("house", 40), `Jahres-Poster ${new Date().getFullYear()}`, new Date().getMonth() === 11 ? "jetzt verfügbar · A3 zum Drucken oder als Bild" : "ab 1. Dezember · Vorschau schon jetzt", `<button class="btn2" data-act="lgxposter" style="flex:none">${new Date().getMonth() === 11 ? "Erstellen" : "Vorschau"}</button>`, true),
    ] : [];
    const b3 = `<div class="lgsec">${ic("heart", 15)}Deine Extras <span class="mut">– alle an einer Stelle, jedes abschaltbar</span></div><div class="lgxs">${[
      ...maxT,
      tile(`<span class="lgi big">${ic("palette", 20)}</span>`, "Farbverlauf im Kopf", "zusätzliche Verläufe", seg("spngrad", P.grad, [["none", "Aus"], ["meer", "Meer"], ["abend", "Abend"]])),
      tile(`<span class="lgi big">${ic("moon", 20)}</span>`, "Uhr-Stil im Ruhemodus", "Tablet-Modus", seg("spnclk", P.clock, [["standard", "Std."], ["duenn", "Dünn"], ["kraeftig", "Kräftig"], ["digital", "Digital"]])),
      tile(`<span class="lgi big">${ic("flask", 20)}</span>`, "Vorabversionen zuerst", "neue Labs 14 Tage früher", sw("spnearly", P.early, "Vorabversionen")),
      tile(this._gx("bolt", 40), "Hausfluss (Modul 19)", this._mdState().on.ef === true ? "eingeschaltet" : "unter Labs einschalten", `<button class="btn2" data-act="labopen" style="flex:none">Labs</button>`),
    ].join("")}</div>${mx ? "" : `<div class="lgt lgup"><span class="lgstar sm">★</span><span class="n"><b>Sponsor Max</b><small>Morgen-Briefing aufs Handy, Jahres-Poster und goldenes Abzeichen – nur monatlich, Schlüssel 3 Monate. Bald auch Wächter, Woche voraus und Was-wäre-wenn.</small></span><a class="btn2 lggold" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" style="flex:none;text-decoration:none">Mehr</a></div>`}`;
    return `${b1}<div class="lgcols">${b2}${b4}</div>${b3}`;
  }
  /* ---- ohne Schlüssel: A1–A4 ---- */
  _lgOut(s) {
    const N = this._lgNums(), hide = (() => { try { return localStorage.getItem("fh_lg_a2") === "1"; } catch (_) { return false; } })();
    const nums = [N.rooms && N.gas > 0 ? [`${num(N.gas, N.gas >= 100 ? 0 : 1)} ${esc(unitOf(N.F))}`, `${esc(N.F.short)} gespart`] : null, N.sv > 0 ? [`${num(N.sv, N.sv >= 100 ? 0 : 2)} €`, "Vorteil durch eigenen Strom"] : null, N.rooms && N.min > 0 ? [`${num(N.min / 60, 0)} h`, "Heizpausen beim Lüften"] : null].filter(Boolean);
    const exs = [["bolt", "Hausfluss", "Modul 19 · dein Haus als Fluss-Bild", "", "ef"], ["sun", "Morgen-Briefing", "jeden Morgen dein Tag aufs Handy", "max", "brief"], ["house", "Jahres-Poster", "dein Jahr als Poster zum Drucken", "max", "poster"], ["lamp", "Uhr-Stile & Verläufe", "für Kopf und Tablet-Ruhemodus", "", "look"], ["forecast", "Vorabversionen", "neue Labs 14 Tage früher", "", "early"], ["euro", "Energie-Coach", "drei Spartipps pro Woche", "bald", "coach"]];
    const mail = `mailto:${SPN_MAIL}?subject=${encodeURIComponent("Sponsor-Schlüssel Strom & Wärme")}&body=${encodeURIComponent("Hallo, ich habe auf GitHub gesponsert.\nMein GitHub-Name: \nStufe: Sponsor / Sponsor Max\n\nDanke!")}`;
    return `<div class="lgban out"><div class="lgbt"><small>Sponsor-Lounge</small><b>Strom &amp; Wärme bleibt kostenlos – mit dir wird es schneller besser.</b><span>Nichts, was du jetzt nutzt, wird gesperrt. Sponsoren bekommen Schönes obendrauf.</span></div></div>
      ${nums.length && !hide ? `<div class="lgt" style="--c:#2dd4bf"><h3>${ic("total", 17)}Das hat es dir schon gebracht</h3><div class="lgst">${nums.map(([v, l]) => `<div><b>${v}</b><small>${l}</small></div>`).join("")}</div><div class="lgnote"><span>seit der Installation · nur aus deinen Daten, nichts wird gesendet</span><button class="lnk" data-act="lgxa2">ausblenden</button></div></div>` : ""}
      <div class="lgt"><h3>${ic("heart", 17)}In 3 Schritten</h3>${["Auf GitHub Sponsors unterstützen", "Kurz per Mail Bescheid geben – der Text ist fertig", "Den Schlüssel aus der Antwort hier einfügen"].map((t, i) => `<div class="lgit"><span class="lgnum">${i + 1}</span><span class="n">${t}</span></div>`).join("")}
        <div class="gbtns" style="margin-top:8px"><a class="btn2 spnb pri" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" style="flex:none;text-decoration:none">${ic("heart", 16)} Sponsor werden</a><a class="btn2" href="${mail}" style="flex:none;text-decoration:none">${ic("mail", 16)} Mail schreiben</a>${this._admin() ? `<button class="btn2" data-act="spnkeydlg">${ic("key", 16)} Schlüssel einlösen</button>` : ""}</div></div>
      <div class="lgsec">${ic("heart", 15)}Die Extras <span class="mut">– antippen für ein Beispiel</span></div>
      <div class="lgex">${exs.map(([k, t, sub, tag, id]) => `<button class="lgxt" data-act="lgxex" data-k="${id}">${this._gx(k, 52)}<b>${t}${tag === "max" ? ` <span class="lggd">★</span>` : ""}</b><small>${sub}</small>${tag === "bald" ? `<em class="lgsoon">bald</em>` : tag === "max" ? `<em class="lgsoon mx">Max</em>` : ""}</button>`).join("")}</div>
      <div class="lgtiers"><div class="lgt"><b>${ic("heart", 15)} Sponsor</b><small>einmalig oder monatlich · Schlüssel 1 Jahr · alle Extras, Vorabversionen, Hausfluss</small></div><div class="lgt mx"><b><span class="lggd">★</span> Sponsor Max</b><small>nur monatlich · Schlüssel 3 Monate · zusätzlich Morgen-Briefing, Jahres-Poster, goldenes Abzeichen</small></div></div>`;
  }
  /* ---- Aktionen ---- */
  _lgAct(a, b) {
    const k = b.dataset.k, B = this._lgB;
    if (a === "lgxback") { this._loOpen = false; this._render(); return; }
    if (a === "lgxa2") { try { localStorage.setItem("fh_lg_a2", "1"); } catch (_) { /* egal */ } this._render(); return; }
    if (a === "lgxname") { this._spnPref({ name_head: !this._spnS().saved_prefs.name_head }); return; }
    if (a === "lgxbadge") { if (k === "off") this._spnPref({ badge: false }); else this._spnPref({ badge: true, badge_style: k }); return; }
    if (a === "lgxex") { this._modal = { type: "lgex", k }; this._renderModal(); return; }
    if (a === "lgxposter") { this._modal = { type: "lgposter" }; this._renderModal(); return; }
    if (a === "lgxbrief") { this._modal = { type: "lgbrief" }; this._lgBLoad(true); this._renderModal(); return; }
    if (a === "lgxpng") { this._lgPosterPng(); return; }
    if (a === "lgxprint") { this._lgPosterPrint(); return; }
    if (!B || !B.cfg) return;
    const c = { ...B.cfg };
    if (a === "lgxbon") c.on = !c.on;
    else if (a === "lgxbev") c.evening = !c.evening;
    else if (a === "lgxbt") { const [h, m] = c.time.split(":").map(Number), t = (h * 60 + m + Number(k) + 1440) % 1440; c.time = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; }
    else if (a === "lgxbblk") { const s = new Set(c.blocks); if (s.has(k)) s.delete(k); else s.add(k); c.blocks = [...s]; }
    else if (a === "lgxbnot") { const s = new Set(c.notify); if (s.has(k)) s.delete(k); else s.add(k); c.notify = [...s]; }
    else if (a === "lgxbtest") {
      this._hass.callWS({ type: "fenster_heizung/brief_test", kind: k === "evening" ? "evening" : "morning" }).then((r) => { this._lgB = r; this._renderModal(); this._toast(r.no_service ? "Probe erstellt – wähle noch einen Meldedienst" : r.sent ? "Probe gesendet" : "Senden hat nicht geklappt"); })
        .catch((e) => this._toast("Briefing: " + ((e && e.message) || "das hat nicht geklappt")));
      return;
    } else return;
    this._lgB = { ...B, cfg: c }; this._renderModal();
    this._hass.callWS({ type: "fenster_heizung/brief_set", cfg: c }).then((r) => { this._lgB = r; this._renderModal(); if (this._loOpen) this._render(); }).catch(() => this._toast("Das ging nicht"));
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
