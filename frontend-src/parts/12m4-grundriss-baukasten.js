  /* ================= Modul 0 Build 6: eine Optik überall, neuer Baukasten, Ebene „Jetzt“, Raum-Blatt =================
     Der Zeichner _grDraw liegt jetzt auch unter dem Baukasten und unter den Plänen von Modul 1 (Wärmekarte) und Modul 11: die Module legen
     nur noch ihre eigenen Elemente darüber (Griffe, Temperaturfarben, Melder). Neuer Baukasten: Leiste oben, schmale Werkzeugleiste links,
     Eigenschaften rechts neben dem Plan, Ablage unten (Lampen und Melder ohne Platz in den Plan ziehen). Im Plan von Modul 0 die Ebene „Jetzt“
     (Temperatur aus Modul 1, Bewegung) und das Raum-Blatt beim Antippen eines Raums. */
  _grEntArea(e) {
    const h = this._hass, en = (h.entities || {})[e];
    if (!en) return "";
    if (en.area_id) return en.area_id;
    const dv = en.device_id && (h.devices || {})[en.device_id];
    return (dv && dv.area_id) || "";
  }
  /* Unterlage im 800×480-Raster des Baukastens und von Modul 11 */
  _grUnder(P, fl, o) {
    const G = this._grDraw(P, fl, { style: this._grStyle(), dims: false, narrow: false, layers: { licht: false, sf: false, nf: true }, deco: false, cover: { x: -40, y: -40, w: 880, h: 560 }, ...(o || {}) });
    return `<g class="gdbase" pointer-events="none">${G.svg}</g>`;
  }
  _grEditSvg(fl) {
    const ed = this._sfEd;
    if (!ed) return this._sfPlanInner(fl, true);
    return this._grUnder(ed.plan, fl, { labels: true, bgImg: false, layers: { licht: false, sf: false, gt: true, ht: true } }) + this._sfPlanInner(fl, true) + (this._grEdOver ? this._grEdOver(fl) : "");
  }
  /* Ebene „Jetzt“: Temperatur (Modul 1) als Chip oben rechts im Raum, Bewegung als Puls */
  _grNow(P, fl, rs, o, T) {
    let d = "";
    const st = this._hass.states, rooms = this._collect ? this._collect(true) : [], all = this._gpAll ? this._gpAll(rooms) : [];
    const mot = Object.keys(st).filter((e) => e.startsWith("binary_sensor.") && ["motion", "occupancy", "presence"].includes((st[e].attributes || {}).device_class) && st[e].state === "on");
    rs.forEach((r) => {
      const m = this._gpMatch ? this._gpMatch(r, all) : null, s = m && !m.ms && this._rkState ? this._rkState(m) : null;
      if (s && s.cur != null) {
        const t = `${num(s.cur, 1)}°`, col = s.k === "aus" ? "#64748b" : this._rkCol(s.cur, 17, 22), w = t.length * 7.4 + 22, x = r.x + r.w - w - 10, y = r.y + 12;
        d += `<g pointer-events="none"><title>${esc(m.name)} · ${t}${s.ziel != null ? ` · Ziel ${num(s.ziel, 1)}°` : ""}</title><rect x="${x}" y="${y}" width="${w}" height="20" rx="10" fill="${col}"/><circle cx="${x + 10}" cy="${y + 10}" r="3.4" fill="#fff" opacity=".85"/><text x="${x + 17}" y="${y + 14.3}" font-size="12" font-weight="800" fill="#111">${t}</text>${s.heating ? `<text x="${x - 12}" y="${y + 15}" font-size="13">🔥</text>` : ""}</g>`;
      }
      const a = this._grArea ? this._grArea(r) : null, mv = a ? mot.filter((e) => this._grEntArea(e) === a.id) : [];
      if (mv.length) {
        const x = r.x + 18, y = r.y + r.h - 18;
        d += `<g pointer-events="none"><title>Bewegung: ${esc(mv.map((e) => this._wzName(e)).join(", "))}</title><circle cx="${x}" cy="${y}" r="7" fill="${T.accent}"/><circle cx="${x}" cy="${y}" r="7" fill="none" stroke="${T.accent}" stroke-width="2"><animate attributeName="r" values="7;22" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="1.8s" repeatCount="indefinite"/></circle></g>`;
      }
    });
    return d;
  }
  /* ---- Neuer Baukasten (nur in Modul 0, host „gr“) */
  _grEditView(T, X) {
    const ed = this._sfEd, fl = this._sfFl(), P = ed.plan, sf = this._mdList().some((m) => m.id === "sf"), li = !!(this._liOn && this._liOn()), sty = this._grStyle();
    const rb = (k, t, p, on) => `<button class="grtl${on ? " on" : ""}" data-act="sfxtool" data-k="${k}" aria-pressed="${on}" title="${t}"><svg viewBox="0 0 34 34" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg><span>${t}</span></button>`;
    const PP = X.PP, tl = ed.tool, mT = String(tl).startsWith("m:");
    const rail = `<div class="grrail">${rb("select", "Wählen", PP.select, tl === "select")}${rb("r", "Raum", PP.r, tl === "r")}${rb("w", "Wand", PP.w, tl === "w")}<i></i>${rb("d", "Tür", PP.d, tl === "d")}${rb("dg", "Durchgang", '<path d="M5 10h7M22 10h7M5 24h7M22 24h7M12 7v6M22 7v6M12 21v6M22 21v6"/>', tl === "dg")}${rb("f", "Fenster", PP.f, tl === "f")}${rb("s", "Treppe", PP.s, tl === "s")}<i></i>${sf ? rb(mT ? tl : "m:smoke", "Melder", PP.smoke, mT) : ""}${li ? rb("l", "Lampe", '<path d="M12 22a7 7 0 1 1 10 0c-1 1-1.5 2-1.5 3.5h-7c0-1.5-.5-2.5-1.5-3.5z"/><path d="M14 29h6"/>', tl === "l") : ""}${rb(String(tl).startsWith("g:") ? tl : "g:heizer", "Gerät", '<rect x="8" y="9" width="18" height="17" rx="4"/><path d="M13 13v9M17 13v9M21 13v9"/><path d="M12 6c-1.5 1.5 1.5 2 0 3.5M17 6c-1.5 1.5 1.5 2 0 3.5M22 6c-1.5 1.5 1.5 2 0 3.5"/>', String(tl).startsWith("g:"))}${rb("h", "Technik", '<rect x="7" y="7" width="20" height="20" rx="4"/><path d="M13 13v3M21 13v3M13 21h8"/>', tl === "h")}${rb("a", "Markise", '<path d="M5 10h24"/><path d="M6 10l3 12h16l3-12" stroke-dasharray="3 2"/><path d="M9 22h16"/>', tl === "a")}${rb("x", "Text", PP.x, tl === "x")}</div>`;
    const mk = mT && sf ? `<div class="grpsec"><b>Art des Melders</b><div class="grseg">${[["m:smoke", "Rauch"], ["m:co", "CO"], ["m:gas", "Gas"], ["m:water", "Wasser"], ["m:heat", "Hitze"]].map(([k, t]) => `<button class="${tl === k ? "on" : ""}" data-act="sfxtool" data-k="${k}">${t}</button>`).join("")}</div></div>` : "";
    const gS = String(tl).startsWith("g:") ? `<div class="grpsec"><b>Art des Geräts</b><div class="grseg">${[["g:heizer", "Mobiler Heizer"], ["g:entf", "Luftentfeuchter"]].map(([k, t]) => `<button class="${tl === k ? "on" : ""}" data-act="sfxtool" data-k="${k}">${t}</button>`).join("")}</div><small class="mut" style="display:block;margin-top:6px">Geräte kommen aus Modul 1 (Elektroheizer je Raum, Luftentfeuchter). Ein Entfeuchter folgt im Plan seinem Standort aus Modul 1.</small></div>` : "";
    const hint = { select: "Antippen und ziehen. Am Eckpunkt ändert sich die Größe.", r: "Im Plan ziehen, um einen Raum aufzuziehen.", s: "Im Plan ziehen, um eine Treppe aufzuziehen.", w: "Im Plan ziehen, um eine Wand zu zeichnen." }[tl] || "In den Plan tippen, um das Element zu setzen.";
    /* Ablage: Lampen und Melder ohne Platz – ziehen oder antippen */
    const pl = new Set(P.items.filter((i) => i.t === "l" && i.e).map((i) => i.e)), freeL = li && this._sfLampIds ? this._sfLampIds().filter((e) => !pl.has(e)) : [];
    const cnt = {}; freeL.forEach((e) => { const n = this._sfLampName(e); cnt[n] = (cnt[n] || 0) + 1; });
    const chips = [...freeL.slice(0, 40).map((e) => `<button class="grchip" data-act="sfxlplace" data-k="${esc(e)}" data-drag="l:${esc(e)}" title="${esc(e)}"><i style="background:#ffb36b"></i>${esc(this._sfLampName(e))}${cnt[this._sfLampName(e)] > 1 ? `<small> · ${esc(e.replace(/^light\./, ""))}</small>` : ""}</button>`),
      ...(this._grDevFree ? this._grDevFree(P) : []).map((x) => `<button class="grchip" data-act="grxgplace" data-k="${x.gk}" data-v="${esc(x.e)}" data-drag="g:${x.gk}:${esc(x.e)}"><i style="background:${x.gk === "entf" ? "#38bdf8" : "#f97316"}"></i>${esc(x.name)}<small> · ${x.gk === "entf" ? "Entfeuchter" : "Heizer"}</small></button>`),
      ...X.free.map((d2) => `<button class="grchip" data-act="sfxplace" data-k="${esc(d2.id)}" data-drag="m:${esc(d2.id)}"><i style="background:#f87171"></i>${esc(d2.name)}</button>`)];
    const tray = chips.length ? `<div class="grtray"><span>${ic("plus", 14)} Noch ohne Platz – in den Plan ziehen oder antippen:</span>${chips.join("")}</div>` : "";
    const bar = `<div class="grtop">${this._sfFloorBar(true)}<span class="grsp"></span><button class="grb" data-act="sfxundo" ${(ed.hist || []).length ? "" : "disabled"} title="Rückgängig">↶</button><button class="grb" data-act="sfxredo" ${(ed.fut || []).length ? "" : "disabled"} title="Wiederholen">↷</button><button class="grb${ed.mm ? " on" : ""}" data-act="sfxmm" aria-pressed="${!!ed.mm}">Mehrfach</button>
      <button class="grb" data-act="grxsty" data-k="${{ modern: "bauplan", bauplan: "hell", hell: "modern" }[sty]}" title="Stil wechseln"><i class="sw-${sty}"></i>${{ modern: "Modern", bauplan: "Bauplan", hell: "Hell" }[sty]}</button>
      ${this._grCheck ? (() => { const C = this._grCheck(P); return `<button class="grb${C.n ? " warn" : ""}" data-act="grxchk" title="Plan-Check">${ic(C.n ? "alert" : "check", 14)} Prüfen${C.n ? ` (${C.n})` : ""}</button>`; })() : ""}${this._grGridCm ? `<button class="grb" data-act="grxgrid" title="Raster beim Ziehen – tippen wechselt">▦ ${this._grGridCm()} cm</button>` : ""}
      <span class="grfill"></span>${ed.from && ed.from !== "gr" ? `<button class="grb" data-act="sfxcancel">← ${esc(this._grModName(ed.from))}</button>` : `<button class="grb" data-act="sfxcancel">Abbrechen</button>`}<button class="grb pri" data-act="sfxsave">${ic("check", 15)} Speichern</button></div>`;
    const hS = tl === "h" && this._grTechCat ? `<div class="grpsec"><b>Was setzen? Danach in den Plan tippen.</b>${this._grTechCat(this._grHkLast || "steckdose", "grxhkt")}</div>` : "";
    const props = `<div class="grprops">${mk}${gS}${hS}<div class="grpsec">${X.prop}</div><details class="grpsec"${this._grEdFl ? " open" : ""}><summary data-act="grxedfl">Etage &amp; Plan</summary>${X.flBox}${this._grB7Box ? this._grB7Box() : ""}${X.scaleBox}${X.bgBox}${X.ioBox}</details></div>`;
    return `<div class="gred2">${bar}<div class="grbody">${rail}<div class="grcv"><div class="sfpl edit"><svg class="sfpe gd" viewBox="0 0 800 480" role="img" aria-label="Grundriss bearbeiten">${this._grEditSvg(fl)}</svg></div>
      <div class="grhint">${ic("info", 14)}<span>${hint}</span></div>${tray}</div>${props}</div></div>`;
  }
  /* Ziehen aus der Ablage in den Plan (Maus, Finger, Stift) */
  _grDragBind(sr) {
    if (this._grDragOn) return; this._grDragOn = true;
    let dr = null;
    sr.addEventListener("pointerdown", (e) => { const b = e.target.closest && e.target.closest("[data-drag]"); if (!b || !this._sfEd) return; dr = { k: b.dataset.drag, x: e.clientX, y: e.clientY, moved: false, ghost: null, label: b.textContent.trim().slice(0, 30) }; }, true);
    window.addEventListener("pointermove", (e) => {
      if (!dr) return;
      if (!dr.moved && Math.hypot(e.clientX - dr.x, e.clientY - dr.y) < 8) return;
      if (!dr.moved) { dr.moved = true; const g = document.createElement("div"); g.textContent = dr.label; g.style.cssText = "position:fixed;z-index:99999;pointer-events:none;padding:6px 12px;border-radius:999px;background:#2dd4bf;color:#042f2e;font:600 13px system-ui;box-shadow:0 6px 18px #0006;transform:translate(-50%,-140%)"; document.body.appendChild(g); dr.ghost = g; }
      dr.ghost.style.left = e.clientX + "px"; dr.ghost.style.top = e.clientY + "px";
    });
    window.addEventListener("pointerup", (e) => {
      if (!dr) return; const d0 = dr; dr = null;
      if (d0.ghost) d0.ghost.remove();
      if (!d0.moved) return;
      this._grDragDone = Date.now();   /* der folgende Klick setzt nichts in die Raummitte */
      const svg = sr.querySelector("svg.sfpe"), ed = this._sfEd; if (!svg || !ed) return;
      const b = svg.getBoundingClientRect(); if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) return;
      const x = Math.round(((e.clientX - b.left) / b.width) * 80) * 10, y = Math.round(((e.clientY - b.top) / b.height) * 48) * 10, fl = this._sfFl(), [t, ...rest] = d0.k.split(":"), id = rest.join(":");
      this._sfSnap();
      if (t === "g" && this._grDevPlace) { const it = this._grDevPlace(ed.plan, fl, rest[0] === "entf" ? "entf" : "heizer", rest.slice(1).join(":"), x, y); it.fix = rest[0] === "entf" ? 1 : undefined; if (!it.fix) delete it.fix; ed.plan.items.push(it); ed.sel = it.id; ed.tool = "select"; this._render(); this._toast(`${d0.label} gesetzt`); return; }
      const it = t === "l" ? { id: "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), fl, t: "l", x, y, r: 0, n: "", e: id, k: "decke" } : { id: "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), fl, t: "m", x, y, r: 0, n: "", e: id };
      if (t === "l" && this._liCfg) { const c = this._liCfg()[id]; if (c && c.k) it.k = c.k; }
      ed.plan.items.push(it); ed.sel = it.id; ed.tool = "select"; this._render();
      this._toast(`${d0.label} gesetzt`);
    });
    sr.addEventListener("click", (e) => { if (this._grDragDone && Date.now() - this._grDragDone < 400 && e.target.closest && e.target.closest("[data-drag]")) { e.stopPropagation(); e.preventDefault(); } }, true);
  }
  /* ---- Raum-Blatt (Antippen eines Raums im Plan von Modul 0) */
  _grNiceName(e) {
    const s = this._hass.states[e], f = s && s.attributes && s.attributes.friendly_name;
    if (f) return f;
    const t = String(e || "").replace(/^[a-z_]+\./, "").replace(/_/g, " ");
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  _grRoomModal(m) {
    const P = this._grRaw(), r = P && (P.items || []).find((i) => i.id === m.k); if (!r) return `<div class="ov" data-act="close"></div>`;
    const st = this._hass.states, sc = P.scale > 0 ? P.scale : 40, a = this._grArea ? this._grArea(r) : null, fln = ((P.floors || []).find((f) => f.id === r.fl) || {}).n || "";
    const rooms = this._collect ? this._collect(true) : [], m1 = this._gpMatch ? this._gpMatch(r, this._gpAll(rooms)) : null, s = m1 && !m1.ms && this._rkState ? this._rkState(m1) : null;
    const inR = (x, y) => (this._sfInRoom ? this._sfInRoom(r, x, y) : x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h);
    const its = (P.items || []).filter((i) => i.fl === r.fl && inR(i.x, i.y));
    const lamps = this._liOn && this._liOn() && this._liLamps ? this._liLamps().filter((x) => (a && x.area === a.id) || its.some((i) => i.t === "l" && i.e === x.id)) : [];
    const mel = its.filter((i) => i.t === "m" && i.e), win = its.filter((i) => i.t === "f");
    const mot = a ? Object.keys(st).filter((e) => e.startsWith("binary_sensor.") && ["motion", "occupancy", "presence"].includes((st[e].attributes || {}).device_class) && this._grEntArea(e) === a.id) : [];
    const row = (i, t, v, c) => `<div class="grrb"><span class="i">${ic(i, 18)}</span><span class="t">${t}</span><b style="${c ? `color:${c}` : ""}">${v}</b></div>`;
    const tC = s && s.cur != null ? this._rkCol(s.cur, 17, 22) : "";
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>${esc(r.n || (a ? a.name : "Raum"))}</b><span>${esc([fln, `${num(this._grAreaM2(r, sc), 1)} m²`, a ? `Bereich ${a.name}` : "ohne Bereich"].filter(Boolean).join(" · "))}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <style>.grrb{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line)}.grrb .i{color:var(--mut)}.grrb .t{flex:1}.grrl{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 2px}.grrl button{border:1px solid var(--line);border-radius:999px;background:none;color:var(--primary-text-color);padding:6px 12px;font:inherit;cursor:pointer}.grrl button.on{border-color:#ffb36b;background:color-mix(in srgb,#ffb36b 18%,transparent)}</style>
      ${s ? row("thermo", "Temperatur" + (s.ziel != null ? ` · Ziel ${num(s.ziel, 1)}°` : ""), s.cur != null ? `${num(s.cur, 1)} °C` : "–", tC) : row("thermo", "Temperatur", "kein Raum aus Modul 1")}
      ${s ? row("windowOpen", "Fenster", s.anyOpen ? `${s.anyOpen} offen` : win.length ? "alle zu" : "–", s.anyOpen ? "#f59e0b" : "") : win.length ? row("window", "Fenster", `${win.length} im Plan`) : ""}
      ${s && s.heating ? row("flame", "Heizung", "heizt", "#fb923c") : ""}
      ${mot.length ? row("eye", "Bewegung", mot.some((e) => st[e].state === "on") ? "gerade" : "keine", mot.some((e) => st[e].state === "on") ? "var(--teal)" : "") : ""}
      ${this._grDevRow ? this._grDevRow(r, P) : ""}${mel.length ? row("shield", "Melder", mel.map((i) => `${this._grNiceName(i.e)}${st[i.e] && st[i.e].state === "on" ? " · ALARM" : ""}`).join(", "), mel.some((i) => st[i.e] && st[i.e].state === "on") ? "#ef4444" : "#34d399") : ""}
      ${lamps.length ? `<div class="grrb" style="border:0;padding-bottom:0"><span class="i">${ic("lamp", 18)}</span><span class="t">Lampen</span><b>${lamps.filter((x) => x.on).length} von ${lamps.length} an</b></div><div class="grrl">${lamps.map((x) => `<button class="${x.on ? "on" : ""}" data-act="grxrlamp" data-k="${esc(x.id)}" data-r="${esc(r.id)}">${esc(x.name)}</button>`).join("")}</div>` : ""}
      <div class="foot2" style="margin-top:14px;flex-wrap:wrap">${s ? `<button class="btn2" data-act="grxgo" data-k="fh">Wärmekarte</button>` : ""}${lamps.length ? `<button class="btn2" data-act="grxgo" data-k="li">Lichtkarte</button>` : ""}${mel.length ? `<button class="btn2" data-act="grxgo" data-k="sf">Modul 11</button>` : ""}${this._grFocus ? `<button class="btn2" data-act="grxfocus" data-k="${esc(r.id)}">◎ Heranzoomen</button>` : ""}${this._admin() ? `<button class="btn2 pri" data-act="grxedit">${ic("pencil", 15)} Bearbeiten</button>` : ""}</div></div>`;
  }
  _grB6Act(a, b) {
    if (this._grB7Act && this._grB7Act(a, b)) return true;
    if (this._grB8Act && this._grB8Act(a, b)) return true;
    if (this._grB9Act && (this._grB9Act(a, b) || this._grB9Act2(a, b))) return true;
    const k = b && b.dataset ? b.dataset.k : "";
    if (a === "grxroom") { this._modal = { type: "grxroom", k }; this._renderModal(); return true; }
    if (a === "grxrlamp") { const s = this._hass.states[k]; if (s) this._hass.callService("light", s.state === "on" ? "turn_off" : "turn_on", { entity_id: k }).catch(() => this._toast("Die Lampe hat nicht reagiert")); setTimeout(() => this._renderModal(), 600); return true; }
    if (a === "grxedfl") { this._grEdFl = !this._grEdFl; setTimeout(() => this._render(), 0); return true; }
    if (a === "grxnow") { const ly = this._grLy(); ly.now = ly.now === false; this._render(); return true; }
    return false;
  }
