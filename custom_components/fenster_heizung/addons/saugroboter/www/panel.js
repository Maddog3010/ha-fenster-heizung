/* Modul 21 Saugroboter – Seite des Addons (Addon-API 1).
   Der Kern lädt diese Datei per import() und ruft die Funktionen mit seiner Panel-Instanz p auf.
   Daten kommen aus dem Python-Teil über api.call("saugroboter", "get" | "set" | "act").
   Grafik nach Konzept: Variante 3 Roboter-Karte im Kopf, Variante 1 Raum-Kacheln als Hauptbild,
   Variante 2 Karte automatisch dazu, Variante 4 im Zeitraum „Woche“, Variante 5 für Start und Tablet (summary im Backend). */
const ID = "saugroboter";

export default (api) => {
  const { ic, esc, num } = api;
  const ROBO_COL = ["#38bdf8", "#a78bfa", "#f472b6", "#fbbf24"];
  const ST_COL = { ok: "#34d399", soon: "#a3e635", due: "#f59e0b", over: "#ef4444", never: "#64748b", live: "#38bdf8" };
  const ST_TXT = { ok: "sauber", soon: "bald fällig", due: "fällig", over: "überfällig", never: "noch nie" };
  const EMO = [["kuch", "🍳"], ["wohn", "🛋️"], ["schlaf", "🛏️"], ["bad", "🛁"], ["dusch", "🚿"], ["flur", "🚪"], ["diele", "🚪"], ["eingang", "🚪"], ["kind", "🧸"], ["buro", "💻"], ["arbeit", "💻"], ["ess", "🍽️"], ["hwr", "🧺"], ["wasch", "🧺"], ["wc", "🚽"], ["gast", "🛏️"], ["keller", "📦"], ["balkon", "🌿"], ["terrasse", "🌿"]];
  const norm = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
  const emo = (n) => { const k = norm(n); const x = EMO.find((e) => k.includes(e[0])); return x ? x[1] : "🏠"; };
  const S = (p) => (p._adX = p._adX || {})[ID] || (p._adX[ID] = { d: null, ts: 0, busy: false, tab: "now", sel: [], stab: "rob" });
  const visible = (p) => (p._mdActive && p._mdActive() === ID && !p._stOpen) || (p._modal && p._modal.type === "adx" && p._modal.id === ID) || (p._tmOn && p._tmOn() && p._tmV && p._tmV() === ID);
  const load = (p, force, data) => {
    const s = S(p); if (s.busy) return;
    const live = s.d && (s.d.robots || []).some((r) => ["cleaning", "returning"].includes(r.state));
    if (!force && s.d && Date.now() - s.ts < (live ? 6000 : 20000)) return;
    s.busy = true;
    api.call(ID, "get", data || {}).then((d) => { s.d = d; s.ts = Date.now(); s.err = ""; })
      .catch((e) => { s.err = (e && e.message) || "Keine Antwort"; s.ts = Date.now(); })
      .finally(() => { s.busy = false; if (visible(p)) { p._render(); if (p._modal && p._modal.type === "adx") p._renderModal(); } });
  };
  const act = (p, data, okMsg) => api.call(ID, "act", data).then((d) => { const s = S(p); s.d = d; s.ts = Date.now(); if (okMsg) p._toast(okMsg); p._render(); }).catch((e) => p._toast((e && e.message) || "Das hat nicht geklappt"));
  let saveT = null;
  const save = (p, patch) => {
    const s = S(p); if (!s.d) return;
    const cfg = JSON.parse(JSON.stringify(s.d.cfg)); patch(cfg); s.d.cfg = cfg;
    clearTimeout(saveT);
    saveT = setTimeout(() => api.call(ID, "set", { cfg }).then((d) => { s.d = d; s.ts = Date.now(); if (visible(p)) { p._render(); p._renderModal(); } }).catch((e) => p._toast((e && e.message) || "Speichern fehlgeschlagen")), 450);
    p._render(); p._renderModal();
  };
  const ago = (t, now) => {
    if (!t) return "noch nie";
    const d = new Date(t * 1000), m = (now - t) / 60;
    if (m < 2) return "gerade eben";
    if (m < 60) return `vor ${Math.round(m)} Min.`;
    const hm = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }), td = new Date(now * 1000);
    if (d.toDateString() === td.toDateString()) return `heute ${hm}`;
    if (d.toDateString() === new Date(now * 1000 - 864e5).toDateString()) return `gestern ${hm}`;
    return `vor ${Math.max(2, Math.round((now - t) / 86400))} Tagen`;
  };
  const dtxt = (x) => (x < 1 ? `${num(x * 24, 0)} Std.` : x === 1 ? "1 Tag" : `${num(x, x % 1 ? 1 : 0)} Tage`);
  const rcol = (D, ent) => ROBO_COL[Math.max(0, (D.robots || []).findIndex((r) => r.ent === ent)) % ROBO_COL.length];
  const aname = (D, id) => ((D.all_areas || []).find((a) => a.id === id) || {}).name || id;

  /* ---------- Variante 3: Roboter-Karte ---------- */
  const robotCard = (p, D, r, i) => {
    const busy = ["cleaning", "returning", "paused"].includes(r.state), cl = r.state === "cleaning";
    const pct = cl && r.prog != null ? r.prog : r.battery != null ? r.battery : 0, lbl = cl && r.prog != null ? "geschafft" : "Akku";
    const C = 2 * Math.PI * 42, col = r.state === "error" ? "#ef4444" : cl ? ROBO_COL[i % 4] : "#34d399";
    const ring = `<div class="srring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" class="rb"/><circle cx="50" cy="50" r="42" class="rf" style="stroke:${col}" stroke-dasharray="${(C * Math.max(0, Math.min(100, pct)) / 100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 50 50)"/></svg><div><b>${num(pct, 0)}<small>%</small></b><span>${lbl}</span></div></div>`;
    const runA = r.run && r.run.areas && r.run.areas.length ? r.run.areas.map((a) => aname(D, a)).join(", ") : "";
    const where = r.state === "error" ? (r.err || "Fehler") : cl ? (r.room ? `${aname(D, r.room)}` : r.room_txt || "reinigt") + (runA ? ` · Plan: ${runA}` : "") : r.state === "docked" ? (r.battery != null && r.battery < 100 ? "lädt" : "geladen, bereit") : r.st_txt;
    const chip = (t) => `<span class="srchip">${t}</span>`;
    const chips = [r.battery != null && lbl !== "Akku" ? chip(`🔋 ${num(r.battery, 0)} %`) : "", busy && r.run ? chip(`⏱ ${num((D.now - r.run.t0) / 60, 0)} Min.`) : r.min != null ? chip(`⏱ ${num(r.min, 0)} Min.`) : "", r.m2 != null ? chip(`📐 ${num(r.m2, 0)} m²`) : "", r.fan ? chip(`🌀 ${esc(r.fan)}`) : "", r.floor ? chip(`🏠 ${esc(r.floor)}`) : ""].join("");
    const b = (a, icn, t, pri) => `<button class="srbtn${pri ? " pri" : ""}" data-act="adxa" data-ad="${ID}" data-a="${a}" data-k="${r.ent}">${ic(icn, 16)}<span>${t}</span></button>`;
    const btns = [cl ? b("pause", "pause", "Pause", true) : b("start", "play", r.state === "paused" ? "Weiter" : "Start", true), r.state !== "docked" ? b("dock", "dock", "Zur Station") : "", r.caps.locate ? b("locate", "bell", "Finden") : ""].join("");
    return `<div class="srrob ${r.state}" style="--rc:${ROBO_COL[i % 4]}">${ring}<div class="srrm"><div class="srrn"><b>${esc(r.name)}</b><em class="srst ${r.state}">${esc(r.st_txt)}</em></div><div class="srwh">${esc(where)}</div><div class="srchips">${chips}</div><div class="srbtns">${btns}</div></div></div>`;
  };

  /* ---------- Variante 1: Raum-Kacheln ---------- */
  const tiles = (p, D, s) => {
    const A = D.areas || [], sel = s.sel.filter((x) => A.some((a) => a.id === x));
    if (!A.length) return "";
    const due = A.filter((a) => ["due", "over", "never"].includes(a.st)), live = A.filter((a) => a.live);
    const lead = live.length ? `<b>Wird gerade gereinigt: ${live.map((a) => esc(a.name)).join(", ")}</b>` : due.length ? `<b>${due.length} ${due.length === 1 ? "Raum ist" : "Räume sind"} fällig</b><span>${due.map((a) => esc(a.name)).join(", ")}</span>` : `<b>Alles sauber</b><span>Kein Raum ist fällig. Tippe Räume an, um sie extra zu reinigen.</span>`;
    const tile = (a) => {
      const st = a.live ? "live" : a.st, pc = a.ratio == null ? 0 : Math.max(4, Math.round((1 - Math.min(1, a.ratio)) * 100));
      const on = sel.includes(a.id), robs = a.robs.length > 1 || (D.robots || []).length > 1 ? `<i class="srdots">${a.robs.map((e) => `<u style="background:${rcol(D, e)}"></u>`).join("")}</i>` : "";
      return `<button class="srtile ${st}${on ? " on" : ""}" data-act="adxa" data-ad="${ID}" data-a="tsel" data-k="${esc(a.id)}" aria-pressed="${on}" style="--sc:${ST_COL[st]}"><span class="sre">${emo(a.name)}</span><b>${esc(a.name)}</b><small>${a.live ? "läuft gerade" : esc(ago(a.last, D.now))}</small><em>${a.live ? "jetzt" : ST_TXT[a.st]} · alle ${dtxt(a.days)}</em><i class="srbar"><u style="width:${a.live ? 100 : pc}%"></u></i>${robs}${on ? `<span class="srck">${ic("check", 14)}</span>` : ""}</button>`;
    };
    const anyR = (D.robots || []).some((r) => r.caps.rooms);
    const bar = `<div class="srsel">${sel.length ? `<button class="btn2 pri" data-act="adxa" data-ad="${ID}" data-a="cleansel">${ic("play", 16)} ${sel.length} ${sel.length === 1 ? "Raum" : "Räume"} reinigen</button><button class="btn2" data-act="adxa" data-ad="${ID}" data-a="selnone">Auswahl aufheben</button>` : due.length && anyR ? `<button class="btn2 pri" data-act="adxa" data-ad="${ID}" data-a="cleandue">${ic("play", 16)} Fällige Räume reinigen</button>` : ""}</div>`;
    return `<div class="card"><h2>${ic("home", 18)}Räume<span class="srh2r">${A.length} ${A.length === 1 ? "Raum" : "Räume"} · Ziel je Raum in den Einstellungen</span></h2><div class="srlead">${lead}</div><div class="srgrid">${A.map(tile).join("")}</div>${anyR ? bar : `<div class="gst">${ic("info", 15)}<span>Dieser Roboter kann in Home Assistant keine einzelnen Räume reinigen. Start und Station gehen trotzdem.</span></div>`}</div>`;
  };

  /* ---------- Variante 2: Karte ---------- */
  const mapCard = (p, D) => {
    const R = (D.robots || []).filter((r) => r.maps && r.maps.length);
    if (!R.length) return "";
    const A = D.areas || [];
    return `<div class="card"><h2>${ic("pin", 18)}Karte<span class="srh2r">vom Roboter</span></h2>${R.map((r) => `<div class="srmap">${r.maps.slice(0, 1).map((m) => `<img src="${esc(m.pic)}" alt="Karte ${esc(r.name)}" loading="lazy">`).join("")}<div class="srmapl"><b>${esc(r.name)}</b>${r.room ? `<span>📍 ${esc(aname(D, r.room))}</span>` : ""}</div></div>`).join("")}
      <div class="srleg">${A.map((a) => `<span style="--sc:${ST_COL[a.live ? "live" : a.st]}"><i></i>${esc(a.name)}</span>`).join("")}</div></div>`;
  };

  /* ---------- Letzte Fahrten ---------- */
  const lastRuns = (p, D) => {
    const L = D.last_runs || [];
    if (!L.length) return `<div class="card"><h2>${ic("clock", 18)}Letzte Fahrten</h2><div class="mut sm">Noch keine Fahrt erkannt. Jede Fahrt wird gezählt, auch aus der App des Herstellers.</div></div>`;
    const rn = (e) => ((D.robots || []).find((r) => r.ent === e) || {}).name || e;
    return `<div class="card"><h2>${ic("clock", 18)}Letzte Fahrten</h2><div class="wxl">${L.slice(0, 5).map((r) => `<div class="wxr ${r.err ? "hot" : ""}"><span class="wxi" style="color:${rcol(D, r.rob)}">${ic("robot", 18)}</span><div class="wxm"><div class="wxt"><b>${esc((r.credit && r.credit.length ? r.credit : r.areas || []).map((a) => aname(D, a)).join(", ") || "Reinigung")}</b><em>${esc(ago(r.t1, D.now))}</em></div><small>${esc(rn(r.rob))} · ${num((r.t1 - r.t0) / 60, 0)} Min.${r.m2 ? ` · ${num(r.m2, 0)} m²` : ""}${r.src === "app" ? " · aus App oder Taste" : " · von Strom & Wärme"}${r.err ? ` · ${esc(r.err)}` : ""}</small></div></div>`).join("")}</div></div>`;
  };

  /* ---------- Variante 4: Woche ---------- */
  const weekCard = (p, D) => {
    const W = D.week || [], st = D.stats || {};
    let h0 = 6; W.forEach((d) => d.runs.forEach((r) => { if (r.h0 < h0) h0 = Math.floor(r.h0); }));
    const span = 24 - h0, x = (h) => ((Math.max(h0, h) - h0) / span) * 100;
    const nowH = ((D.now % 86400) / 3600 + new Date().getTimezoneOffset() / -60 + 24) % 24;
    const ticks = []; for (let h = h0; h <= 24; h += span > 16 ? 4 : 2) ticks.push(h);
    const rows = W.map((d, i) => {
      const dt = new Date(d.day * 864e5), today = i === W.length - 1;
      const lab = dt.toLocaleDateString("de-DE", { weekday: "short" }).slice(0, 2) + " " + dt.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
      const bars = d.runs.map((r) => `<i class="srwb${r.err ? " err" : ""}${r.open ? " open" : ""}" style="left:${x(r.h0)}%;width:${Math.max(1.4, x(r.h1) - x(r.h0))}%;background:${r.err ? "#ef4444" : rcol(D, r.rob)}" title="${esc(r.areas.map((a) => aname(D, a)).join(", ") || "Reinigung")}"></i>`).join("");
      return `<div class="srwr${today ? " today" : ""}"><span>${today ? "Heute" : esc(lab)}</span><div class="srwl">${bars}${today ? `<b class="srnow" style="left:${x(nowH)}%"></b>` : ""}</div><em>${d.runs.length || ""}</em></div>`;
    }).join("");
    const leg = (D.robots || []).length > 1 ? `<div class="srleg">${D.robots.map((r) => `<span style="--sc:${rcol(D, r.ent)}"><i></i>${esc(r.name)}</span>`).join("")}<span style="--sc:#ef4444"><i></i>mit Fehler</span></div>` : "";
    const kp = (v, t) => `<div><b>${v}</b><span>${t}</span></div>`;
    return `<div class="card"><h2>${ic("today", 18)}Woche<span class="srh2r">letzte 7 Tage</span></h2><div class="srkp">${kp(num(st.n || 0), "Fahrten")}${kp(num(st.min || 0), "Minuten")}${kp(st.m2 ? num(st.m2) + " m²" : "–", "Fläche")}${kp(num(st.err || 0), "mit Fehler")}</div>
      <div class="srweek"><div class="srwr srwh"><span></span><div class="srwl">${ticks.map((h) => `<em style="left:${x(h)}%">${String(h).padStart(2, "0")}</em>`).join("")}</div><em></em></div>${rows}</div>${leg}
      <div class="gst">${ic("info", 15)}<span>Geplante Fahrten (wenn alle weg sind, Ruhezeiten, günstiger Strom) kommen mit Version 0.3 und erscheinen dann hier vorab.</span></div></div>`;
  };

  /* ---------- Wartung ---------- */
  const partsCard = (p, D) => (D.robots || []).map((r) => {
    const P = r.parts || [];
    const row = (x) => { const c = x.pct == null ? "#64748b" : x.pct < 10 ? "#ef4444" : x.pct < 25 ? "#f59e0b" : "#34d399"; return `<div class="srpart"><div class="srpt"><b>${esc(x.name)}</b><em style="color:${c}">${x.pct != null ? num(x.pct, 0) + " %" : "–"}</em></div><i class="srbar"><u style="width:${x.pct || 0}%;background:${c}"></u></i><small>${x.left_h != null ? `noch etwa ${num(x.left_h, 0)} Betriebsstunden` : ""}${x.pct != null && x.pct < 10 ? " · bald wechseln" : ""}</small></div>`; };
    const how = r.amap === "area" ? "über Bereiche in Home Assistant (vacuum.clean_area)" : r.amap === "seg" ? "über die Räume des Roboters, zugeordnet nach Namen" : "keine Raumreinigung möglich";
    return `<div class="card"><h2>${ic("tools", 18)}${esc(r.name)}<span class="srh2r">${esc([r.maker, r.model].filter(Boolean).join(" ") || r.platform)}</span></h2>${P.length ? `<div class="srparts">${P.map(row).join("")}</div>` : `<div class="mut sm">Dieser Roboter meldet keine Verschleißteile an Home Assistant.</div>`}
      <div class="adkv" style="margin-top:12px"><span>Räume</span><b>${esc(how)}</b><span>Zugeordnet</span><b>${(r.mapped || []).length ? r.mapped.map((a) => esc(aname(D, a))).join(", ") : "noch keine"}</b><span>Karte</span><b>${r.caps.map ? "ja" : "nein"}</b></div>
      <div class="gst">${ic("info", 15)}<span>Nach dem Wechsel setzt du den Zähler in der App des Herstellers zurück. Ab Version 0.5 geht das hier, mit Erinnerung über Modul 15.</span></div></div>`;
  }).join("");

  const setupHint = (D) => {
    const R = D.robots || [];
    if (R.some((r) => r.caps.rooms) && (D.areas || []).length) return "";
    const rr = R.find((r) => r.platform === "roborock");
    return `<div class="card"><h2>${ic("info", 18)}Räume zuordnen</h2><div class="srhow"><p>Damit Modul 21 weiß, welcher Raum wann gereinigt wurde, müssen die Räume des Roboters zu den Bereichen in Home Assistant passen.</p>
      <ol><li><b>Am besten:</b> in Home Assistant unter Einstellungen › Geräte › Entitäten › ${esc(rr ? rr.name : "dein Roboter")} › Zahnrad › <i>Segmente des Saugroboters Bereichen zuordnen</i> (ab HA 2026.3).</li><li><b>Oder:</b> gib den Räumen in der App des Herstellers die gleichen Namen wie deinen Bereichen in Home Assistant. Bei Roborock ordnet Modul 21 sie dann selbst zu, auch „Kitchen“ zu „Küche“.</li></ol>
      <button class="btn2" data-act="adxa" data-ad="${ID}" data-a="refresh">${ic("refresh", 16)} Räume neu einlesen</button></div></div>`;
  };

  const page = (p, m) => {
    load(p); const s = S(p), D = s.d;
    if (!D) return `<div class="card empty">${s.err ? esc(s.err) : "Lädt …"}</div>`;
    const R = D.robots || [];
    if (!R.length) return `${hero(p, D)}<div class="card empty">${ic("robot", 36)}<div style="margin:10px 0 4px;font-weight:700">Noch kein Saugroboter gefunden</div>Richte zuerst die Integration deines Roboters in Home Assistant ein, zum Beispiel Roborock. Danach erscheint er hier von selbst.<div class="gbtns" style="margin-top:12px;justify-content:center"><button class="btn2" data-act="igopen">${ic("puzzle", 16)} Zum Store</button></div></div>`;
    const tab = s.tab, seg = `<div class="seg srseg" role="group" aria-label="Ansicht">${[["now", "Jetzt"], ["week", "Woche"], ["parts", "Wartung"]].map(([k, l]) => `<button class="${tab === k ? "sel" : ""}" data-act="adxa" data-ad="${ID}" data-a="tab" data-k="${k}" aria-pressed="${tab === k}">${l}${k === "parts" && R.some((r) => (r.parts || []).some((x) => x.pct != null && x.pct < 10)) ? ` <i class="srdot"></i>` : ""}</button>`).join("")}</div>`;
    const robs = `<div class="srrobs n${Math.min(2, R.length)}">${R.map((r, i) => robotCard(p, D, r, i)).join("")}</div>`;
    const main = D.cfg.main === "map" ? mapCard(p, D) + tiles(p, D, s) : D.cfg.main === "tiles" ? tiles(p, D, s) : tiles(p, D, s) + mapCard(p, D);
    const body = tab === "week" ? weekCard(p, D) : tab === "parts" ? partsCard(p, D) : `${main}${setupHint(D)}${lastRuns(p, D)}`;
    return `${hero(p, D)}${robs}${seg}${body}<div class="stleg srfoot">${ic("package", 14)} Addon · Modul 21 · v${esc((m.ad || {}).version || "")} Build ${(m.ad || {}).build || 1} · zuerst für Roborock, Grundfunktionen für jeden Saugroboter</div>`;
  };

  const hero = (p, D) => {
    const R = D.robots || [], A = D.areas || [], cl = R.filter((r) => r.state === "cleaning"), er = R.filter((r) => r.state === "error");
    const due = A.filter((a) => ["due", "over", "never"].includes(a.st)), okN = A.filter((a) => a.st === "ok" || a.st === "soon").length;
    const big = er.length ? "Braucht Hilfe" : cl.length ? "Reinigt" : !R.length ? "Kein Roboter" : due.length ? `${due.length} fällig` : "Alles sauber";
    const sub = er.length ? `${er.map((r) => r.name).join(", ")}: ${er[0].err || "Fehler"}` : cl.length ? `${cl[0].name} · ${cl[0].room ? aname(D, cl[0].room) : "unterwegs"}` : A.length ? `${okN} von ${A.length} Räumen sauber` : R.length ? `${R.length} ${R.length === 1 ? "Roboter" : "Roboter"} bereit` : "Richte deinen Roboter in Home Assistant ein";
    const pct = A.length ? Math.round((okN / A.length) * 100) : 0;
    const ring = A.length ? p._modRing(pct, "sauber") : "";
    const st = D.stats || {}, chips = [R.length ? `${R.length} ${R.length === 1 ? "Roboter" : "Roboter"}` : "", st.n ? `${st.n} Fahrten in 7 Tagen` : "", st.m2 ? `${num(st.m2)} m²` : ""].filter(Boolean);
    return `<div class="card hero mh hr a-${ID}${er.length ? " srbad" : ""}">${p._modLogo(ID)}${ring}<div class="lbl">${ic("robot", 16)}Saugroboter</div><div class="big bs">${esc(big)}</div><div class="sub">${esc(sub)}</div>${chips.length ? `<div class="chips">${chips.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>` : ""}</div>`;
  };

  /* ---------- Einstellungen (Admin) ---------- */
  const modal = (p, m) => {
    const s = S(p);
    if (m.tab) { s.stab = m.tab; m.tab = ""; }  // aus der Suche oder dem Messwerk: gleich den passenden Reiter
    const D = s.d, hd = `<div class="sh"><div><b>Saugroboter</b><span>Modul 21 · Addon · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>`;
    if (!D) return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">${hd}<div class="mut">Lädt …</div></div>`;
    const C = D.cfg, t = s.stab, sw = (a, k, on, lbl) => `<button class="sw ${on ? "on" : ""}" data-act="adxa" data-ad="${ID}" data-a="${a}" data-k="${esc(k)}" aria-pressed="${!!on}" aria-label="${esc(lbl)}"></button>`;
    const tabs = `<div class="seg">${[["rob", "Roboter"], ["area", "Räume"], ["msg", "Meldungen"], ["view", "Anzeige"]].map(([k, l]) => `<button class="${t === k ? "sel" : ""}" data-act="adxa" data-ad="${ID}" data-a="stab" data-k="${k}">${l}</button>`).join("")}</div>`;
    let body = "";
    if (t === "rob") {
      body = (D.all_vac || []).map((e, i) => { const rc = C.robots[e] || {}, on = rc.on !== false, st = p._hass.states[e], r = (D.robots || []).find((x) => x.ent === e);
        return `<div class="srset"><div class="srsr"><span class="sre" style="color:${ROBO_COL[i % 4]}">${ic("robot", 22)}</span><span class="sxt"><b>${esc(rc.name || (st && st.attributes.friendly_name) || e)}</b><small>${esc(e)}${r ? " · " + esc([r.maker, r.model].filter(Boolean).join(" ")) : ""}</small></span>${sw("robon", e, on, "Roboter nutzen")}</div>
          ${on ? `<div class="srfl"><label>Name<input data-f="adxf" data-ad="${ID}" data-k="name" data-r="${esc(e)}" value="${esc(rc.name || "")}" placeholder="${esc((st && st.attributes.friendly_name) || "")}" maxlength="24"></label><label>Etage<input data-f="adxf" data-ad="${ID}" data-k="floor" data-r="${esc(e)}" value="${esc(rc.floor || "")}" placeholder="z. B. EG" maxlength="24"></label></div>
          <div class="lsec">${ic("home", 15)}Räume dieses Roboters</div><div class="srchk">${(D.all_areas || []).filter((a) => !r || (r.mapped || []).includes(a.id) || (rc.areas || []).includes(a.id)).map((a) => { const own = rc.areas || [], sel = own.length ? own.includes(a.id) : (r && r.mapped || []).includes(a.id); return `<button class="gsch ${sel ? "sel" : ""}" data-act="adxa" data-ad="${ID}" data-a="robarea" data-r="${esc(e)}" data-k="${esc(a.id)}">${emo(a.name)} ${esc(a.name)}</button>`; }).join("") || `<span class="mut sm">Noch keine Räume zugeordnet (siehe Hinweis auf der Seite).</span>`}</div>` : ""}</div>`; }).join("") || `<div class="mut">Kein Saugroboter in Home Assistant.</div>`;
    } else if (t === "area") {
      const A = D.areas || [], step = (v, d) => { const n = v + d * (v < 2 || (v === 2 && d < 0) ? 0.5 : 1); return Math.min(30, Math.max(0.5, n)); };
      body = `<div class="gst">${ic("info", 15)}<span>Wie oft soll jeder Raum gereinigt werden? Danach gilt er als fällig und färbt sich gelb, ab dem Doppelten rot.</span></div>${A.map((a) => `<div class="srsr srar"><span class="sre">${emo(a.name)}</span><span class="sxt"><b>${esc(a.name)}</b><small>zuletzt ${esc(ago(a.last, D.now))}</small></span><div class="srstep"><button data-act="adxa" data-ad="${ID}" data-a="days" data-k="${esc(a.id)}" data-v="${step(a.days, -1)}" aria-label="Seltener">−</button><b>alle ${dtxt(a.days)}</b><button data-act="adxa" data-ad="${ID}" data-a="days" data-k="${esc(a.id)}" data-v="${step(a.days, 1)}" aria-label="Häufiger">+</button></div></div>`).join("") || `<div class="mut sm">Noch keine Räume zugeordnet.</div>`}
        ${Object.entries(C.areas).filter(([, x]) => x.off).length ? `<div class="lsec">Ausgeblendet</div><div class="srchk">${Object.entries(C.areas).filter(([, x]) => x.off).map(([k]) => `<button class="gsch" data-act="adxa" data-ad="${ID}" data-a="areaoff" data-k="${esc(k)}">${esc(aname(D, k))} einblenden</button>`).join("")}</div>` : ""}
        ${A.length ? `<div class="lsec">Raum ausblenden</div><div class="srchk">${A.map((a) => `<button class="gsch" data-act="adxa" data-ad="${ID}" data-a="areaoff" data-k="${esc(a.id)}">${esc(a.name)}</button>`).join("")}</div>` : ""}`;
    } else if (t === "msg") {
      const svc = [...new Set([...Object.keys((p._hass.services || {}).notify || {}).filter((n) => !["send_message", "reload", "persistent_notification"].includes(n)).sort().map((n) => "notify." + n), ...C.notify.to])];
      body = `<div class="srsr"><span class="sxt"><b>Roboter braucht Hilfe</b><small>Festgefahren, Fehler, Rad blockiert</small></span>${sw("nstuck", "", C.notify.stuck, "Meldung bei Fehler")}</div>
        <div class="srsr"><span class="sxt"><b>Reinigung fertig</b><small>mit den gereinigten Räumen</small></span>${sw("ndone", "", C.notify.done, "Meldung wenn fertig")}</div>
        <div class="lsec">${ic("bell", 15)}An wen</div><div class="srchk">${svc.map((x) => `<button class="gsch ${C.notify.to.includes(x) ? "sel" : ""}" data-act="adxa" data-ad="${ID}" data-a="nto" data-k="${esc(x)}">${esc(x.replace("notify.", ""))}</button>`).join("") || `<span class="mut sm">Kein Benachrichtigungsdienst gefunden.</span>`}</div>
        <div class="gst">${ic("info", 15)}<span>Ruhezeiten und Personen kommen mit dem zentralen Meldungs-Dienst.</span></div>`;
    } else {
      body = `<div class="lsec">Hauptbild</div><div class="srchk">${[["auto", "Kacheln, Karte dazu"], ["tiles", "Nur Kacheln"], ["map", "Karte zuerst"]].map(([k, l]) => `<button class="gsch ${C.main === k ? "sel" : ""}" data-act="adxa" data-ad="${ID}" data-a="main" data-k="${k}">${l}</button>`).join("")}</div><div class="gst">${ic("info", 15)}<span>Die Karte erscheint nur, wenn der Roboter eine liefert (Roborock, Dreame, Valetudo).</span></div>`;
    }
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">${hd}${tabs}${body}</div>`;
  };

  const actFn = (p, a, el) => {
    const s = S(p), D = s.d, k = el.dataset.k;
    if (a === "settings") { load(p, true); p._modal = { type: "adx", id: ID }; p._renderModal(); return; }
    if (a === "tab") { s.tab = k; p._render(); return; }
    if (a === "stab") { s.stab = k; p._renderModal(); return; }
    if (a === "refresh") { load(p, true, { refresh: true }); p._toast("Räume werden neu eingelesen"); return; }
    if (["start", "pause", "dock", "locate"].includes(a)) { act(p, { a, rob: k }, { start: "Reinigung startet", pause: "Pausiert", dock: "Fährt zur Station", locate: "Der Roboter meldet sich" }[a]); return; }
    if (a === "tsel") { s.sel = s.sel.includes(k) ? s.sel.filter((x) => x !== k) : [...s.sel, k]; p._render(); return; }
    if (a === "selnone") { s.sel = []; p._render(); return; }
    if (a === "cleansel" || a === "cleandue") {
      const ids = a === "cleansel" ? s.sel : (D.areas || []).filter((x) => ["due", "over", "never"].includes(x.st)).map((x) => x.id);
      const by = {}; ids.forEach((id) => { const ar = (D.areas || []).find((x) => x.id === id); const r = ar && (D.robots || []).find((rb) => ar.robs.includes(rb.ent) && rb.caps.rooms && !["cleaning", "error"].includes(rb.state)); if (r) (by[r.ent] = by[r.ent] || []).push(id); });
      const ents = Object.keys(by);
      if (!ents.length) { p._toast("Kein freier Roboter für diese Räume"); return; }
      Promise.all(ents.map((e) => api.call(ID, "act", { a: "clean", rob: e, areas: by[e] }))).then((r) => { s.d = r[r.length - 1]; s.ts = Date.now(); s.sel = []; p._toast(`${ids.length} ${ids.length === 1 ? "Raum wird" : "Räume werden"} gereinigt`); p._render(); }).catch((e) => p._toast((e && e.message) || "Das hat nicht geklappt"));
      return;
    }
    if (!p._admin()) return;
    if (a === "robon") save(p, (c) => { const r = c.robots[k] = c.robots[k] || { name: "", floor: "", on: true, areas: [] }; r.on = !(r.on !== false); });
    else if (a === "robarea") save(p, (c) => { const e = el.dataset.r, r = c.robots[e] = c.robots[e] || { name: "", floor: "", on: true, areas: [] }; const rb = (D.robots || []).find((x) => x.ent === e); let L = r.areas && r.areas.length ? r.areas : [...((rb && rb.mapped) || [])]; L = L.includes(k) ? L.filter((x) => x !== k) : [...L, k]; r.areas = L; });
    else if (a === "days") save(p, (c) => { c.areas[k] = { ...(c.areas[k] || {}), days: +el.dataset.v }; });
    else if (a === "areaoff") save(p, (c) => { const x = c.areas[k] || { days: 3 }; x.off = !x.off; c.areas[k] = x; });
    else if (a === "nstuck") save(p, (c) => { c.notify.stuck = !c.notify.stuck; });
    else if (a === "ndone") save(p, (c) => { c.notify.done = !c.notify.done; });
    else if (a === "nto") save(p, (c) => { c.notify.to = c.notify.to.includes(k) ? c.notify.to.filter((x) => x !== k) : [...c.notify.to, k]; });
    else if (a === "main") save(p, (c) => { c.main = k; });
  };
  const change = (p, el) => {
    if (!p._admin()) return;
    save(p, (c) => { const e = el.dataset.r, r = c.robots[e] = c.robots[e] || { name: "", floor: "", on: true, areas: [] }; r[el.dataset.k] = String(el.value || "").trim().slice(0, 24); });
  };

  const css = `
.a-${ID}{--a1:#7dd3fc;--a2:#0c3b5c}.hero.mh.srbad{--a1:#fca5a5;--a2:#4c1515}
.srrobs{display:grid;gap:12px;margin:0 0 12px}.srrobs.n2{grid-template-columns:1fr 1fr}@media(max-width:760px){.srrobs.n2{grid-template-columns:1fr}}
.srrob{display:flex;gap:16px;align-items:center;padding:16px;border-radius:20px;background:var(--card-background-color,#151e28);border:1px solid var(--line);border-left:4px solid var(--rc)}
.srrob.error{border-color:#ef4444;background:color-mix(in srgb,#ef4444 10%,var(--card-background-color,#151e28))}
.srring{position:relative;width:96px;height:96px;flex:none}.srring svg{width:100%;height:100%}.srring .rb{fill:none;stroke:var(--line);stroke-width:9}.srring .rf{fill:none;stroke-width:9;stroke-linecap:round;transition:stroke-dasharray .6s}
.srring>div{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}.srring b{font-size:1.45rem;font-weight:800;line-height:1}.srring b small{font-size:.7rem;margin-left:1px}.srring span{font-size:.68rem;color:var(--mut);margin-top:2px}
.srrm{flex:1;min-width:0}.srrn{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.srrn b{font-size:1.05rem}
.srst{font-style:normal;font-size:.72rem;font-weight:700;padding:2px 9px;border-radius:999px;background:var(--line);color:var(--mut)}.srst.cleaning{background:color-mix(in srgb,#38bdf8 22%,transparent);color:#7dd3fc}.srst.docked{background:color-mix(in srgb,#34d399 18%,transparent);color:#6ee7b7}.srst.error{background:#ef4444;color:#fff}.srst.returning,.srst.paused{background:color-mix(in srgb,#f59e0b 20%,transparent);color:#fbbf24}
.srwh{font-size:.86rem;color:var(--mut);margin:4px 0 6px}.srchips{display:flex;flex-wrap:wrap;gap:6px}.srchip{font-size:.74rem;padding:3px 9px;border-radius:999px;border:1px solid var(--line);white-space:nowrap}
.srbtns{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.srbtn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:transparent;color:inherit;border-radius:12px;padding:7px 12px;font:inherit;font-size:.82rem;font-weight:650;cursor:pointer}.srbtn.pri{background:var(--teal);border-color:var(--teal);color:#042f2e}
.srseg{max-width:420px}.srh2r{margin-left:auto;font-size:.74rem;font-weight:500;color:var(--mut)}
.srlead{margin:-2px 0 12px}.srlead b{display:block}.srlead span{font-size:.84rem;color:var(--mut)}
.srgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.srtile{position:relative;text-align:left;display:flex;flex-direction:column;gap:2px;padding:12px 12px 14px;border-radius:16px;border:1px solid color-mix(in srgb,var(--sc) 45%,var(--line));background:color-mix(in srgb,var(--sc) 9%,transparent);color:inherit;font:inherit;cursor:pointer}
.srtile.on{outline:2px solid var(--teal);outline-offset:1px}.srtile.live{background:color-mix(in srgb,#38bdf8 18%,transparent);animation:srpulse 2.4s ease-in-out infinite}
@keyframes srpulse{50%{box-shadow:0 0 0 4px color-mix(in srgb,#38bdf8 25%,transparent)}}
.srtile .sre{font-size:1.3rem;line-height:1.2}.srtile b{font-size:.95rem}.srtile small{font-size:.78rem;color:var(--mut)}.srtile em{font-style:normal;font-size:.72rem;font-weight:650;color:var(--sc)}
.srbar{display:block;height:5px;border-radius:9px;background:var(--line);overflow:hidden;margin-top:7px}.srbar u{display:block;height:100%;background:var(--sc,#34d399);border-radius:9px}
.srck{position:absolute;top:8px;right:8px;width:22px;height:22px;border-radius:50%;background:var(--teal);color:#042f2e;display:grid;place-items:center}
.srdots{position:absolute;top:12px;right:12px;display:flex;gap:3px}.srtile.on .srdots{display:none}.srdots u{width:8px;height:8px;border-radius:50%}
.srsel{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.srsel .btn2{flex:none;display:inline-flex;align-items:center;gap:7px;padding:10px 16px}
.srmap{position:relative;border-radius:16px;overflow:hidden;background:#0b1118;margin-bottom:10px}.srmap img{display:block;width:100%;max-height:420px;object-fit:contain}
.srmapl{position:absolute;left:10px;top:10px;display:flex;gap:8px;font-size:.8rem}.srmapl>*{background:rgba(3,12,22,.7);padding:4px 10px;border-radius:999px}
.srleg{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:.78rem;color:var(--mut);margin-top:8px}.srleg i{display:inline-block;width:10px;height:10px;border-radius:3px;background:var(--sc);margin-right:5px;vertical-align:-1px}
.srkp{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}.srkp div{border:1px solid var(--line);border-radius:14px;padding:10px}.srkp b{display:block;font-size:1.2rem}.srkp span{font-size:.74rem;color:var(--mut)}
.srweek{display:flex;flex-direction:column;gap:6px}.srwr{display:grid;grid-template-columns:78px 1fr 18px;gap:8px;align-items:center;font-size:.78rem}.srwr>span{color:var(--mut)}.srwr.today>span{color:var(--primary-text-color);font-weight:700}.srwr>em{font-style:normal;color:var(--mut);text-align:right}
.srwl{position:relative;height:18px;border-radius:6px;background:color-mix(in srgb,var(--line) 55%,transparent)}.srwh .srwl{background:none;height:14px}.srwh .srwl em{position:absolute;transform:translateX(-50%);font-style:normal;font-size:.68rem;color:var(--mut)}
.srwb{position:absolute;top:2px;bottom:2px;border-radius:4px}.srwb.open{animation:srpulse 2.4s infinite}.srnow{position:absolute;top:-3px;bottom:-3px;width:2px;background:#f87171;border-radius:2px}
.srparts{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px 16px}.srpt{display:flex;justify-content:space-between}.srpt em{font-style:normal;font-weight:700}.srpart small{font-size:.74rem;color:var(--mut)}
.srdot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#ef4444;vertical-align:2px}
.srhow p{margin:0 0 8px;font-size:.88rem}.srhow ol{margin:0 0 12px;padding-left:20px;font-size:.86rem;line-height:1.5;color:var(--mut)}.srhow ol b{color:var(--primary-text-color)}.srhow .btn2{width:auto;display:inline-flex;gap:7px;align-items:center}
.srfoot{margin-top:6px}
@media(max-width:600px){.srrob{padding:12px;gap:12px;align-items:flex-start}.srring{width:72px;height:72px}.srring b{font-size:1.15rem}.srbtn{padding:6px 10px;font-size:.78rem}.srbtns{gap:6px}.srgrid{grid-template-columns:1fr 1fr}.srkp{grid-template-columns:1fr 1fr}.srwr{grid-template-columns:62px 1fr 14px}}
.srset{border:1px solid var(--line);border-radius:16px;padding:12px;margin-bottom:10px}.srsr{display:flex;gap:12px;align-items:center;padding:8px 0}.srsr .sxt{flex:1;min-width:0}.srsr .sxt b{display:block}.srsr .sxt small{color:var(--mut);font-size:.78rem}.srar{border-bottom:1px solid var(--line)}
.srfl{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:6px 0}.srfl label{font-size:.76rem;color:var(--mut);display:flex;flex-direction:column;gap:4px}.srfl input{font:inherit;font-size:.9rem;padding:8px 10px;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--primary-text-color)}
.srchk{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}.srstep{display:flex;align-items:center;gap:6px}.srstep button{width:32px;height:32px;border-radius:50%;border:1px solid var(--line);background:transparent;color:inherit;font-size:1.1rem;cursor:pointer}.srstep b{min-width:88px;text-align:center;font-size:.84rem}
`;
  const art = `<circle cx="32" cy="34" r="22" class="f"/><circle cx="32" cy="34" r="22"/><circle cx="32" cy="26" r="6"/><path d="M20 44h24"/><path d="M14 22l-4-4M50 22l4-4"/>`;
  /* Einträge für die Suche in den Einstellungen */
  const robs = (p) => ((S(p).d || {}).robots || []).map((r) => r.name).join(", ");
  const search = [
    { id: "robots", t: "Saugroboter: Roboter", k: "roboter staubsauger saugroboter roborock name etage räume zuordnen", tab: "rob", h: "Welche Saugroboter Modul 21 nutzt, ihre Namen, Etagen und welche Räume jeder reinigt.", v: robs },
    { id: "areas", t: "Saugroboter: Wie oft je Raum", k: "raum räume ziel tage fällig überfällig reinigen intervall", tab: "area", h: "Nach wie vielen Tagen ein Raum als fällig gilt. Ab dem Doppelten wird er rot." },
    { id: "notify", t: "Saugroboter: Meldungen", k: "meldung benachrichtigung handy festgefahren fehler fertig", tab: "msg", h: "Meldung aufs Handy, wenn ein Roboter Hilfe braucht oder fertig ist." },
    { id: "view", t: "Saugroboter: Hauptbild", k: "karte kacheln anzeige hauptbild", tab: "view", h: "Raum-Kacheln, Karte dazu oder Karte zuerst." },
  ];
  return { id: ID, page, modal, act: actFn, change, css, art, settings: true, settingsTxt: "Roboter, Räume, wie oft reinigen, Meldungen", search, icons: { robot: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="9" r="2.2"/><path d="M7.5 15.5h9"/>' } };
};
