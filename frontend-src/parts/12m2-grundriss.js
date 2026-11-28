  /* ================= Modul 0 · Haus & Grundriss (Build 1) =================
     Der Grundriss gehört ab jetzt dem Kern (Speicher fenster_heizung_grundriss, WebSocket gr_get) statt Modul 11. Beim ersten Start wird er
     aus Modul 11 übernommen. Modul 0 zeigt den Plan mit allen Ebenen (Melder aus Modul 11, Lampen aus Modul 18). Modul 1 (Wärmekarte) und
     Modul 18 (Lichtkarte) lesen über _grPlan(). Bearbeitet wird in Build 1 noch im Baukasten von Modul 11 (zieht in Build 3 um).
     Build 2: Reiter „Räume“ – eine Liste für alle Module: Plan-Raum ↔ Bereich in Home Assistant (zentral in Modul 0, ersetzt pmap aus Modul 18)
     ↔ Raum in Modul 1 (bleibt im Layout gmap, wird hier bearbeitet) und „genutzt von“. Reiter „Einstellungen“ mit Rückfrage beim Ausschalten.
     Build 3: Der Baukasten zieht aus Modul 11 hierher (_grEdit, gespeichert über gr_set plan). „Bearbeiten“ in Modul 1, 11 und 18 öffnet ihn
     hier und kehrt nach Speichern oder Abbrechen zurück. Reiter „Ebenen“: Bauplan, Melder, Lampen, Wärme – mit Zahlen und Sprung ins Werkzeug.
     Build 4: Reiter „Sichern & Einlesen“ – Plan als Datei (mit oder ohne Hintergrundbilder, inkl. Raumliste), Datei einlesen mit Vorschau
     (ersetzen oder als weitere Etagen), Verlauf der letzten Stände und die Umzugs-Kopie aus Modul 11 zum Wiederherstellen. */
  _grS0() { return (this._grS = this._grS || { d: null, ts: 0, busy: false, err: false }); }
  _grLoad(force) {
    const S = this._grS0(), age = Date.now() - S.ts;
    if (!this._hass || S.busy || (!force && S.d && age < 60000) || (!force && S.err && age < 10000)) return;
    S.busy = true;
    this._hass.callWS({ type: "fenster_heizung/gr_get" }).then((r) => { S.d = r || null; S.err = false; })
      .catch(() => { S.err = true; })
      .finally(() => { S.busy = false; S.ts = Date.now(); if (this._grPend) { const q = this._grPend; this._grPend = null; if (S.d) { this._grEdit(q[0], q[1]); return; } this._toast("Der Grundriss ist gerade nicht erreichbar – bitte gleich nochmal versuchen"); } const a = this._mdActive && this._mdActive(); if (a === "gr" || a === "li" || (a === "fh" && this._view && this._view() === "plan")) this._render(); });
  }
  /* Plan für alle Module: null = lädt, { error: true } = nicht erreichbar, sonst der Plan */
  _grPlan() { this._grLoad(); const S = this._grS0(); return S.d ? S.d.plan : S.err ? { error: true } : null; }
  _grRaw() { const S = this._grS0(); return S.d && S.d.plan ? S.d.plan : null; }
  _grDirty() { if (this._grS) { this._grS.ts = 0; this._grS.d = this._grS.d && { ...this._grS.d }; } this._grLoad(true); }
  _grRooms() { const S = this._grS0(); return (S.d && S.d.rooms) || {}; }
  /* Plan-Raum → Bereich in Home Assistant: { id, auto } oder null. Von Hand (Raumliste), sonst über den Namen; „-“ = bewusst keiner */
  _grArea(item) {
    const v = this._grRooms()[item.id];
    if (v === "-") return null;
    const AR = this._hass.areas || {}, nmOf = (id) => (AR[id] && AR[id].name) || id;
    if (v) return { id: v, name: nmOf(v), auto: false };
    const nm = (x) => String(x || "").toLowerCase().replace(/zimmer|raum|[^a-zäöüß0-9]/g, ""), n = nm(item.n);
    if (!n) return null;
    const A = Object.values(this._hass.areas || {}).map((a) => ({ id: a.area_id, m: nm(a.name) }));
    const hit = A.find((a) => a.m === n) || A.find((a) => a.m.length > 2 && (a.m.includes(n) || n.includes(a.m)));
    return hit ? { id: hit.id, name: nmOf(hit.id), auto: true } : null;
  }
  _grAreaName(id) { const a = (this._hass.areas || {})[id]; return (a && a.name) || id; }
  _grFloors(P) { return P && P.floors && P.floors.length ? P.floors : [{ id: "eg", n: "EG" }]; }
  /* Banner: Haus im Schnitt, eine Reihe je Etage (oben die höchste), Zellen = Räume der Etage */
  _grHouse(P) {
    const fls = this._grFloors(P).slice().reverse().slice(0, 3), W = 200, X0 = 24, H0 = 46, rowH = Math.max(22, Math.min(34, 90 / fls.length)), H = fls.length * rowH;
    let s = `<svg class="grhs" viewBox="0 0 248 ${H0 + H + 14}" aria-hidden="true"><polygon points="${X0 - 8},${H0} ${X0 + W / 2},${H0 - 34} ${X0 + W + 8},${H0}" fill="#13233a" stroke="var(--teal,#2dd4bf)" stroke-width="2" stroke-linejoin="round"/><rect x="${X0}" y="${H0}" width="${W}" height="${H}" fill="#0f1b2d" stroke="var(--teal,#2dd4bf)" stroke-width="2"/>`;
    fls.forEach((f, i) => {
      const y = H0 + i * rowH, rs = (P.items || []).filter((x) => x.t === "r" && x.fl === f.id).slice(0, 6), n = Math.max(1, rs.length), cw = W / n;
      if (i) s += `<line x1="${X0}" y1="${y}" x2="${X0 + W}" y2="${y}" stroke="#1e3350" stroke-width="2"/>`;
      rs.forEach((r, j) => { const x = X0 + j * cw; if (j) s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + rowH}" stroke="#1e3350" stroke-width="2"/>`; s += `<rect x="${x + 3}" y="${y + 3}" width="${cw - 6}" height="${rowH - 6}" rx="3" fill="#2dd4bf" fill-opacity="${(0.12 + 0.08 * (j % 3)).toFixed(2)}" stroke="#2dd4bf" stroke-opacity=".35"><title>${esc(r.n || "Raum")}</title></rect>`; });
      s += `<text x="${X0 - 4}" y="${y + rowH / 2 + 3}" text-anchor="end" font-size="8" fill="#7f95ad">${esc(String(f.n || "").slice(0, 4))}</text>`;
    });
    return s + `<rect x="0" y="${H0 + H}" width="248" height="14" fill="#06101a" opacity=".55"/></svg>`;
  }
  _grBigOn() { if (this._grBig == null) { try { this._grBig = localStorage.getItem("fh_gr_big") === "1"; } catch (_) { this._grBig = false; } } return this._grBig; }
  _grLy() { return (this._grLys = this._grLys || { sf: true, licht: true, gt: true, ht: true, mo: true, sun: false }); }
  _grPage() {
    const tv = !!this._grTv;   /* Tablet-Modus: nur Anzeige, ohne Kopf, Reiter, Bearbeiten und Antippen */
    const S = this._grS0(), P = this._grPlan(), adm = this._admin() && !tv, sfOn = this._mdList().some((m) => m.id === "sf");
    const css = `<style>${this._grLookNew() ? this._grLookCss() : ""}.grh{position:relative;overflow:hidden;display:flex;align-items:center;gap:18px;padding:16px 18px;border-radius:18px;margin-bottom:14px;color:#e2e8f0;background:radial-gradient(120% 140% at 90% 0%,#0e7490 0%,transparent 55%),linear-gradient(135deg,#0f3d3a,#0b1a2c 70%)}
      .grh svg.grhs{width:min(40%,220px);flex:none;height:auto}.grh .k{font-size:.68rem;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:#5eead4}.grh .b{font-size:1.5rem;font-weight:750;color:#fff;margin:2px 0}.grh .s{color:#a5b8cc;font-size:.86rem}
      .grh .v{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}.grh .v button{border:1px solid #ffffff2e;background:#ffffff0f;color:inherit;border-radius:999px;padding:6px 13px;font:inherit;font-size:.8rem;font-weight:650;cursor:pointer}.grh .v button.pri{background:var(--teal);border-color:var(--teal);color:var(--on-acc,#042f2e)}
      .grt{display:flex;gap:8px;margin:0 0 12px;flex-wrap:wrap}.grt button{border:1px solid color-mix(in srgb,var(--primary-text-color) 14%,transparent);background:var(--card);color:var(--primary-text-color);border-radius:999px;padding:8px 16px;font:inherit;font-weight:650}.grt button.on{border-color:var(--teal);color:var(--teal);box-shadow:inset 0 0 0 1px var(--teal)}.grt button:disabled{opacity:.45}.grt small{font-weight:500;opacity:.8}
      .grl{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}.grl button{display:inline-flex;gap:6px;align-items:center;border:0;border-radius:999px;padding:5px 11px;font:inherit;font-size:.78rem;background:color-mix(in srgb,var(--primary-text-color) 7%,transparent);color:var(--mut);cursor:pointer}.grl button.on{background:color-mix(in srgb,var(--teal) 16%,transparent);color:var(--teal)}.grl i{width:9px;height:9px;border-radius:50%;display:inline-block}
      .grv{border-radius:14px;overflow:hidden;background:color-mix(in srgb,#020617 55%,var(--card,#111a2b))}.grv svg{display:block;width:100%;height:auto;max-height:66vh}.grv text{font-family:inherit}
      .grtb{display:inline-block;min-width:18px;padding:0 5px;border-radius:9px;background:#f59e0b;color:#1c1003;font-size:.72rem;margin-left:4px}
      .grtab{width:100%;border-collapse:collapse;font-size:.9rem}.grtab th{text-align:left;color:var(--mut);font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;padding:8px 10px;font-weight:700}.grtab td{padding:9px 10px;border-top:1px solid color-mix(in srgb,var(--primary-text-color) 9%,transparent);vertical-align:middle}
      .grsel{display:inline-flex;align-items:center;gap:8px;justify-content:space-between;min-width:150px;max-width:100%;border:1px solid color-mix(in srgb,var(--primary-text-color) 16%,transparent);border-radius:10px;padding:6px 10px;background:none;color:var(--primary-text-color);font:inherit;font-size:.86rem;cursor:pointer;text-align:left}
      .grsel.warn{border-color:#f59e0b;color:#fbbf24}.grsel.none{color:var(--mut)}.grsel small{color:var(--mut);font-size:.72rem}.grsel:disabled{cursor:default;opacity:.85}
      .grmods span{display:inline-block;margin:2px 4px 2px 0;border-radius:6px;padding:1px 7px;font-size:.72rem;background:color-mix(in srgb,var(--primary-text-color) 8%,transparent)}
      .grfl{font-size:.72rem;color:var(--mut)}
      .gred{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 16px;border-radius:16px;margin-bottom:12px;color:#e2e8f0;background:linear-gradient(135deg,#0f3d3a,#0b1a2c 75%);border:1px solid #2dd4bf55}
      .gred .t{flex:1;min-width:220px}.gred .k{font-size:.68rem;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:#5eead4}.gred b{display:block;font-size:1.05rem;color:#fff}.gred small{color:#a5b8cc}
      .gred .ch{display:flex;gap:6px;flex-wrap:wrap}.gred .ch span{border-radius:999px;padding:3px 10px;font-size:.74rem;background:#ffffff14}.gred .ch span.off{opacity:.5;text-decoration:line-through}
      .gred button{border:1px solid #ffffff33;background:#ffffff10;color:inherit;border-radius:999px;padding:7px 14px;font:inherit;font-size:.82rem;font-weight:650;cursor:pointer}
      .grsty{display:inline-flex;gap:6px;margin-left:auto;flex-wrap:wrap}.grsty button{display:inline-flex;align-items:center;gap:6px;border:1px solid color-mix(in srgb,var(--primary-text-color) 14%,transparent);background:none;color:var(--primary-text-color);border-radius:999px;padding:5px 11px;font:inherit;font-size:.8rem;cursor:pointer}
      .grsty button.on{border-color:var(--teal);color:var(--teal)}.grsty i{width:12px;height:12px;border-radius:4px;display:inline-block}.grsty .sw-modern{background:linear-gradient(135deg,#0d1524 50%,#d7dee8 50%)}.grsty .sw-bauplan{background:linear-gradient(135deg,#0a3566 50%,#e0f2fe 50%)}.grsty .sw-hell{background:linear-gradient(135deg,#f7f4ee 50%,#1f2430 50%)}
      .grv svg{display:block;width:100%;height:auto;border-radius:14px}.grv.grv-modern{background:#0d1524}.grv.grv-bauplan{background:#0a3566}.grv.grv-hell{background:#f7f4ee}
      .grio{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))}.grio .card{margin:0;display:flex;flex-direction:column;gap:8px}.grio .card h3{margin:0;font-size:1rem;display:flex;align-items:center;gap:8px}
      .grio .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.grio .row .btn2{flex:0 0 auto}.grio .nums{display:flex;gap:6px;flex-wrap:wrap}.grio .nums span{border-radius:8px;padding:3px 9px;font-size:.78rem;background:color-mix(in srgb,var(--primary-text-color) 7%,transparent)}
      .grio label.btn2{cursor:pointer;display:inline-flex;align-items:center;gap:6px}
      .grhist{display:grid;gap:0}.grhr{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;padding:10px 0;border-top:1px solid color-mix(in srgb,var(--primary-text-color) 8%,transparent)}
      .grhr:first-child{border-top:0}.grhr .dt{font-weight:700;font-variant-numeric:tabular-nums;min-width:92px}.grhr .dt small{display:block;font-weight:400;color:var(--mut);font-size:.74rem}.grhr .tx small{display:block;color:var(--mut);font-size:.76rem}
      @media (max-width:640px){.grhr{grid-template-columns:minmax(0,1fr) auto}.grhr .tx{grid-column:1/-1;grid-row:2}.grhr .btn2{grid-column:2;grid-row:1}}
      .grhr.cp{background:color-mix(in srgb,#f59e0b 9%,transparent);border-radius:10px;padding:10px;margin-top:6px;border:0}
      .grcmp{width:100%;border-collapse:collapse;font-size:.86rem}.grcmp td,.grcmp th{padding:6px 8px;text-align:left;border-bottom:1px solid color-mix(in srgb,var(--primary-text-color) 8%,transparent)}.grcmp th{color:var(--mut);font-weight:600;font-size:.76rem}.grcmp td.n{text-align:right;font-variant-numeric:tabular-nums}.grcmp td.up{color:var(--teal)}.grcmp td.dn{color:#fbbf24}
      .grly{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))}.grly .card{margin:0;display:flex;flex-direction:column;gap:8px}
      .grly .hd{display:flex;align-items:center;gap:10px}.grly .hd i{width:34px;height:34px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;flex:none}.grly .hd b{display:block;font-size:1rem}.grly .hd small{color:var(--mut)}
      .grly .nums{display:flex;gap:6px;flex-wrap:wrap}.grly .nums span{border-radius:8px;padding:3px 9px;font-size:.78rem;background:color-mix(in srgb,var(--primary-text-color) 7%,transparent)}.grly .nums span.w{background:color-mix(in srgb,#f59e0b 18%,transparent);color:#fbbf24}
      .grly .ft{display:flex;gap:8px;flex-wrap:wrap;margin-top:auto;padding-top:4px}.grly .ft .btn2{flex:0 0 auto}.grly .card.off{opacity:.62}
      @media (max-width:700px){.grtab thead{display:none}.grtab tr{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:10px 0;border-top:1px solid color-mix(in srgb,var(--primary-text-color) 9%,transparent)}.grtab td{border:0;padding:2px 4px}.grtab td:first-child{grid-column:1/-1}.grtab td[data-l]::before{content:attr(data-l);display:block;font-size:.7rem;color:var(--mut)}}
      .grtn{display:flex;gap:6px;align-items:center;margin:0 0 8px;flex-wrap:wrap}.grtn button{display:inline-flex;align-items:center;gap:5px;border:1px solid color-mix(in srgb,var(--primary-text-color) 14%,transparent);background:var(--card);color:var(--primary-text-color);border-radius:999px;padding:7px 12px;font:inherit;font-size:.84rem;font-weight:650;cursor:pointer}
      .grtn button.on{border-color:var(--teal);color:var(--teal)}.grtn .sp{margin-left:auto}.grtn .sffl{display:inline-flex;gap:4px}.grtn .grchk{padding:7px 10px}
      .grmn{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px;padding:8px;border-radius:14px;background:color-mix(in srgb,var(--primary-text-color) 5%,transparent)}.grmn button{border:1px solid color-mix(in srgb,var(--primary-text-color) 14%,transparent);background:var(--card);color:var(--primary-text-color);border-radius:999px;padding:6px 12px;font:inherit;font-size:.82rem;cursor:pointer}.grmn button.on{border-color:var(--teal);color:var(--teal)}
      .grl.rail{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;margin:0 0 8px;mask-image:linear-gradient(90deg,#000 88%,transparent)}.grl.rail::-webkit-scrollbar{display:none}.grl.rail button{flex:none}
      .card.grpc{padding-top:12px}
      .grinfo{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));margin-top:12px}.grinfo .card{margin:0}.grinfo b{display:block}.grinfo small{color:var(--mut)}
      @media (max-width:560px){.grh{flex-direction:column;align-items:flex-start}.grh svg.grhs{width:100%;max-width:240px}}</style>`;
    if (!P) return css + `<div class="card empty">${ic("home", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Grundriss wird geladen …</div></div>`;
    if (P.error) return css + `<div class="card empty">${ic("home", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Grundriss gerade nicht erreichbar</div>Meist direkt nach einem Neustart von Home Assistant. Es wird gleich von selbst erneut versucht.</div>`;
    const D = S.d || {}, st = D.stats || {}, meta = D.meta || {}, users = D.users || [], items = P.items || [], fls = this._grFloors(P);
    if (this._sfEd && this._sfEd.host === "gr" && adm) return css + this._grEditHead(this._sfEd) + this._sfPlan(this._grT());
    const UN = { fh: "Modul 1", sf: "Modul 11", li: "Modul 18" }, uTxt = users.map((u) => UN[u] || u).join(", ").replace(/, ([^,]*)$/, " und $1");
    const edit = adm ? `<button data-act="grxedit">${ic("pencil", 14)} Bearbeiten</button>` : "";
    const LN = this._grLookNew(), hero = LN ? this._grHeroNew(P, D, st, fls, uTxt, edit) : `<div class="grh">${this._grHouse(P)}<div style="flex:1;min-width:0"><div class="k">Modul 0 · Haus &amp; Grundriss</div><div class="b">${st.rooms ? `${fls.filter((f) => !f.ga).length} ${fls.filter((f) => !f.ga).length === 1 ? "Etage" : "Etagen"}${fls.some((f) => f.ga) ? " + Grundstück" : ""} · ${st.rooms} ${st.rooms === 1 ? "Raum" : "Räume"}` : "Noch kein Grundriss"}</div>
      <div class="s">${st.rooms ? `${st.layers ? `${st.layers.sf || 0} Melder · ${st.layers.licht || 0} Lampen im Plan · ` : ""}genutzt von ${esc(uTxt)}` : "Einmal zeichnen, in allen Modulen nutzen"}</div>${D.lock && D.lock.sid !== this._grSid() ? `<div class="s" style="color:var(--warning-color,#f59e0b)">${ic("pencil", 13)} Wird gerade von ${esc(D.lock.by)} bearbeitet</div>` : ""}<div class="v"><button class="pri" data-act="grxtab" data-k="plan">Plan ansehen</button>${edit}</div></div></div>`;
    const tab = tv ? "plan" : ["plan", "raeume", "ebenen", "io", "einst"].includes(this._grTab) ? this._grTab : "plan", rq = this._grRoomStats(P);
    const tb = (k, t) => `<button class="${tab === k ? "on" : ""}" data-act="grxtab" data-k="${k}" aria-pressed="${tab === k}">${t}</button>`;
    const narrow = this._narrow || (this.clientWidth || 999) < 600;
    let tabs = `<div class="grt">${tb("plan", "Plan")}${tb("raeume", `Räume (${rq.n})${rq.open ? ` <b class="grtb">${rq.open}</b>` : ""}`)}${tb("ebenen", "Ebenen")}${adm ? tb("io", "Sichern &amp; Einlesen") : ""}${adm ? tb("einst", "Einstellungen") : ""}</div>`;
    if (narrow || LN) tabs = this._grNav(tab, rq, adm, P, fls);   /* Build 3: Handy – eine Zeile statt fünf */
    if (tab === "einst" && adm) return css + hero + tabs + this._grSetView(D);
    if (tab === "io" && adm) return css + hero + tabs + this._grIoView(P, D);
    if (!items.some((i) => i.t === "r")) return css + (tv ? "" : hero + tabs) + `<div class="card empty">${ic("home", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Noch kein Grundriss</div>Zeichne Räume, Wände, Türen und Fenster einmal – Modul 1 (Wärmekarte), Modul 11 (Melder) und Modul 18 (Lichtkarte) nutzen ihn dann mit.<div style="margin-top:12px">${adm ? `<button class="btn2 pri" data-act="grxedit">${ic("pencil", 16)} Grundriss zeichnen</button>` : ""}</div></div>`;
    if (tab === "raeume") return css + hero + tabs + this._grRoomsView(P);
    if (tab === "ebenen") return css + hero + tabs + this._grLayersView(P);
    const fl = fls.some((f) => f.id === this._grFl) ? this._grFl : fls[0].id, ly = this._grLy(), here = items.filter((i) => i.fl === fl);
    const rs = here.filter((i) => i.t === "r"), B = rs.reduce((a, i) => ({ x0: Math.min(a.x0, i.x), y0: Math.min(a.y0, i.y), x1: Math.max(a.x1, i.x + i.w), y1: Math.max(a.y1, i.y + i.h) }), { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 });
    if (!rs.length) Object.assign(B, { x0: 0, y0: 0, x1: 800, y1: 480 });
    const sty = this._grStyle(), dims = this._grDimsOn(), cw = this._grFull ? (window.innerWidth || 390) : (this.clientWidth || 390);
    const big = narrow && this._grBigOn();   /* 2026.11.4.4b3: Handy zeigt den Plan wie im Bearbeiten – große Schrift + Symbolleiste nur auf Wunsch (Ansicht ▾) */
    const G = this._grDraw(P, fl, { style: sty, dims, narrow: big, click: !tv, strip: big ? { pw: Math.max(240, cw - 56), ph: (window.innerHeight || 800) * (this._grFull ? 0.86 : 0.66) } : null, now: ly.now !== false, layers: { licht: ly.licht && !!(this._liOn && this._liOn()), sf: ly.sf, gt: ly.gt !== false, ht: ly.ht !== false, mo: ly.mo !== false, sun: !!ly.sun } });
    const nL = items.filter((i) => i.t === "l").length, nM = items.filter((i) => i.t === "m").length, liOn = !!(this._liOn && this._liOn());
    const bar = fls.length > 1 ? `<span class="sffl">${fls.map((f) => `<button class="${f.id === fl ? "on" : ""}" data-act="grxfl" data-k="${esc(f.id)}">${esc(f.n)}</button>`).join("")}</span>` : "";
    const lyr = `<div class="grl">${liOn || nL ? `<button class="${ly.licht && liOn ? "on" : ""}" data-act="grxly" data-k="licht" ${liOn ? "" : "disabled title=\"Addon „licht“ ist aus\""}><i style="background:#ffb36b"></i>Lampen · Modul 18 (${nL})</button>` : ""}<button class="${ly.sf ? "on" : ""}" data-act="grxly" data-k="sf"><i style="background:#f87171"></i>Melder · Modul 11 (${nM})</button>${items.some((i) => i.t === "h") ? `<button class="${ly.ht !== false ? "on" : ""}" data-act="grxly" data-k="ht"><i style="background:#eab308"></i>Technik (${items.filter((i) => i.t === "h").length})</button>` : ""}${items.some((i) => i.t === "g") ? `<button class="${ly.gt !== false ? "on" : ""}" data-act="grxly" data-k="gt"><i style="background:#f97316"></i>Geräte (${items.filter((i) => i.t === "g").length})</button>` : ""}${items.some((i) => i.t === "o") ? `<button class="${ly.mo !== false ? "on" : ""}" data-act="grxly" data-k="mo"><i style="background:#94a3b8"></i>Möbel (${items.filter((i) => i.t === "o").length})</button>` : ""}<button class="${ly.sun ? "on" : ""}" data-act="grxly" data-k="sun" title="Sonnenlicht durch die Fenster"><i style="background:#fbbf24"></i>Sonne</button><button class="${ly.now !== false ? "on" : ""}" data-act="grxnow" title="Temperatur aus Modul 1 und Bewegung"><i style="background:#2dd4bf"></i>Jetzt</button><span class="grsty">${[["modern", "Modern"], ["bauplan", "Bauplan"], ["hell", "Hell"]].map(([k, t]) => `<button class="${sty === k ? "on" : ""}" data-act="grxsty" data-k="${k}" aria-pressed="${sty === k}"><i class="sw-${k}"></i>${t}</button>`).join("")}<button class="${dims ? "on" : ""}" data-act="grxdims" aria-pressed="${dims}">📐 Maße</button></span></div>`;
    const lyrN = `<div class="grl rail"><button class="${ly.now !== false ? "on" : ""}" data-act="grxnow"><i style="background:#2dd4bf"></i>Jetzt</button><button class="${ly.sf ? "on" : ""}" data-act="grxly" data-k="sf"><i style="background:#f87171"></i>Melder ${nM}</button>${liOn || nL ? `<button class="${ly.licht && liOn ? "on" : ""}" data-act="grxly" data-k="licht" ${liOn ? "" : "disabled"}><i style="background:#ffb36b"></i>Lampen ${nL}</button>` : ""}${items.some((i) => i.t === "g") ? `<button class="${ly.gt !== false ? "on" : ""}" data-act="grxly" data-k="gt"><i style="background:#f97316"></i>Geräte ${items.filter((i) => i.t === "g").length}</button>` : ""}${items.some((i) => i.t === "h") ? `<button class="${ly.ht !== false ? "on" : ""}" data-act="grxly" data-k="ht"><i style="background:#eab308"></i>Technik ${items.filter((i) => i.t === "h").length}</button>` : ""}${items.some((i) => i.t === "o") ? `<button class="${ly.mo !== false ? "on" : ""}" data-act="grxly" data-k="mo"><i style="background:#94a3b8"></i>Möbel ${items.filter((i) => i.t === "o").length}</button>` : ""}<button class="${ly.sun ? "on" : ""}" data-act="grxly" data-k="sun"><i style="background:#fbbf24"></i>Sonne</button></div>`;
    const VB = this._grVB ? this._grVB(G.vb, fl) : G.vb;
    const card = `<div class="card${this._grFull ? " grfull" : ""}${narrow ? " grpc" : ""}">${narrow ? (this._grFull ? this._grNav("plan", rq, adm, P, fls) : "") + lyrN : LN ? this._grLayerBar(lyr) : `<h2>${ic("home", 18)}Grundriss<span class="sfhr">${this._grChkChip ? this._grChkChip(P) : ""}${bar}${edit ? edit.replace("<button", '<button class="sfed"') : ""}</span></h2>${lyr}`}
      ${ly.sun && this._grSunBar ? this._grSunBar(P, fl) : ""}<div class="grv grv-${sty}">${this._grZoomBar ? this._grZoomBar(fl) : ""}<svg class="grzsvg${VB !== G.vb ? " zm" : ""}" data-fl="${esc(fl)}" data-vb="${G.vb.x} ${G.vb.y} ${G.vb.w} ${G.vb.h}" viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" role="img" aria-label="Grundriss ${esc((fls.find((f) => f.id === fl) || {}).n || "")}">${G.svg}</svg></div></div>`;
    const since = meta.since ? new Date(meta.since).toLocaleDateString("de-DE") : "", until = meta.copy_until ? new Date(meta.copy_until).toLocaleDateString("de-DE") : "";
    const info = `<div class="grinfo">
      <div class="card"><b>${ic("users", 15)} Genutzt von</b><small>${esc(uTxt)}. Einmal gezeichnet, überall derselbe Plan.</small></div>
      <div class="card"><b>${ic("shield", 15)} Umzug aus Modul 11</b><small>${since ? `Am ${since} übernommen${meta.src === "sf" ? " aus Modul 11" : ""}. Die Kopie vom alten Stand wird bis ${until} aufgehoben.` : "Der Plan liegt jetzt im Kern von Strom &amp; Wärme."}</small></div>
      <div class="card"><b>${ic("pencil", 15)} Bearbeiten</b><small>Im Baukasten hier in Modul 0 – auch „Bearbeiten“ in Modul 1, 11 und 18 führt hierher und danach zurück. Alle Module sehen die Änderung sofort.</small></div></div>`;
    return tv ? css + card : css + hero + tabs + card + (LN ? "" : info);
  }
  /* Build 3 (2026.11.4.1): Werkzeugleiste auf dem Handy – Etage, Ansicht, Bearbeiten und „⋯“ in einer Zeile.
     „Ansicht“ klappt Stil und Maße auf, „⋯“ die Reiter (Räume, Ebenen, Sichern, Einstellungen) und den Plan-Check. */
  _grNav(tab, rq, adm, P, fls) {
    const M = this._grMenu || "", fl = fls.some((f) => f.id === this._grFl) ? this._grFl : fls[0].id, sty = this._grStyle(), dims = this._grDimsOn();
    const chk = this._grChkChip ? this._grChkChip(P) : "", warn = /grchk w/.test(chk);
    const left = tab === "plan" ? (fls.length > 1 ? `<span class="sffl">${fls.map((f) => `<button class="${f.id === fl ? "on" : ""}" data-act="grxfl" data-k="${esc(f.id)}">${esc(f.n)}</button>`).join("")}</span>` : "") + `<button class="${M === "view" ? "on" : ""}" data-act="grxmenu" data-k="view" aria-expanded="${M === "view"}">Ansicht ${M === "view" ? "▴" : "▾"}</button>`
      : `<button data-act="grxtab" data-k="plan">‹ Plan</button><b style="font-size:.95rem">${{ raeume: "Räume", ebenen: "Ebenen", io: "Sichern &amp; Einlesen", einst: "Einstellungen" }[tab] || ""}</b>`;
    const row = `<div class="grtn">${left}${adm && tab === "plan" ? `<button data-act="grxedit" aria-label="Bearbeiten">${ic("pencil", 14)}</button>` : ""}<button class="sp${M === "more" ? " on" : ""}" data-act="grxmenu" data-k="more" aria-expanded="${M === "more"}" aria-label="Mehr">⋯${rq.open || warn ? ` <b class="grtb">${(rq.open || 0) + (warn ? 1 : 0) || "!"}</b>` : ""}</button></div>`;
    const t = (k, x) => `<button class="${tab === k ? "on" : ""}" data-act="grxtab" data-k="${k}">${x}</button>`;
    const menu = M === "more" ? `<div class="grmn">${t("plan", "Plan")}${t("raeume", `Räume (${rq.n})${rq.open ? ` <b class="grtb">${rq.open}</b>` : ""}`)}${t("ebenen", "Ebenen")}${adm ? t("io", "Sichern &amp; Einlesen") : ""}${adm ? t("einst", "Einstellungen") : ""}${chk}</div>`
      : M === "view" && tab === "plan" ? `<div class="grmn">${[["modern", "Modern"], ["bauplan", "Bauplan"], ["hell", "Hell"]].map(([k, x]) => `<button class="${sty === k ? "on" : ""}" data-act="grxsty" data-k="${k}" aria-pressed="${sty === k}">${x}</button>`).join("")}<button class="${dims ? "on" : ""}" data-act="grxdims" aria-pressed="${dims}">📐 Maße</button><button class="${this._grBigOn() ? "on" : ""}" data-act="grxbig" aria-pressed="${this._grBigOn()}" title="Größere Schrift, Temperatur und Symbole als Leiste oben im Raum">🔍 Groß</button></div>` : "";
    return row + menu;
  }
  /* ---- Baukasten in Modul 0 (Build 3) */
  _grT() { return this._mdList().some((m) => m.id === "sf") && this._sfStat ? this._sfStat() : { l: [], al: [] }; }
  _grModName(id) { return { fh: "Modul 1 · Wärmekarte", sf: "Modul 11 · Sicherheit", li: "Modul 18 · Licht", gr: "Modul 0" }[id] || "Modul 0"; }
  /* v0.13 (B4): Bearbeitungs-Sperre – pro Browser-Tab eine Kennung; das Backend hält die Sperre 15 Minuten ohne Aktion */
  _grSid() { if (!this._grSidV) this._grSidV = "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); return this._grSidV; }
  _grLockCall(action, force) { return this._hass.callWS({ type: "fenster_heizung/gr_lock", action, sid: this._grSid(), ...(force ? { force: true } : {}) }); }
  _grLockMine() { return !!(this._sfEd && this._sfEd.host === "gr"); }
  _grLockTick() {
    clearInterval(this._grLkT); this._grLkT = null;
    if (!this._grLockMine()) return;
    this._grLkT = setInterval(() => {
      if (!this._grLockMine()) { clearInterval(this._grLkT); this._grLkT = null; return; }
      this._grLockCall("keep").then((r) => { if (!r.ok && this._grLockMine()) this._grLockCall("take").then((r2) => { if (!r2.ok) this._toast("Die Bearbeitungs-Sperre gehört jetzt jemand anderem – Speichern kann abgelehnt werden"); }).catch(() => {}); }).catch(() => {});
    }, 4 * 60 * 1000);
  }
  _grLockErr(e, fallback) {
    const c = e && e.code, m = e && e.message;
    if (c === "locked" || c === "invalid_plan") return m || fallback;
    return fallback;
  }
  _grEdit(from, tool, force) {
    if (!this._admin()) return;
    if (this._mdState().on.gr === false) { this._modal = { type: "grxeditoff", from: from || "gr", tool: tool || "" }; this._renderModal(); return; }
    if (!this._grRaw()) { this._grPend = [from, tool]; this._grLoad(true); return; }   /* noch nicht geladen (z. B. aus Modul 11): nach dem Laden weiter */
    this._grLockCall("take", !!force).then((r) => {
      if (r.ok) { this._grEdit2(from, tool); return; }
      this._modal = { type: "grxlocked", from: from || "gr", tool: tool || "", by: (r.lock && r.lock.by) || "jemand anderem", since: r.lock && r.lock.since }; this._renderModal();
    }).catch(() => this._grEdit2(from, tool));   /* älteres Backend ohne Sperre: wie bisher */
  }
  _grEdit2(from, tool) {
    const P = this._grRaw();
    const plan = JSON.parse(JSON.stringify({ ...P, floors: P.floors && P.floors.length ? P.floors : [{ id: "eg", n: "EG" }], items: P.items || [], bg: P.bg || {} }));
    this._sfEd = { plan, sel: "", tool: tool || "select", host: "gr", from: from || "gr" };
    if (plan.floors.some((f) => f.id === this._grFl)) this._sfFlId = this._grFl;
    if (this._mdList().some((m) => m.id === "sf") && this._sfxLoad) this._sfxLoad();   /* Melder für die Werkzeuge */
    this._modal = null; this._renderModal(); this._grTab = "plan"; this._mdActiveSet("gr"); this._render(); this._grLockTick();
    try { this.shadowRoot.querySelector(".gred").scrollIntoView({ block: "start" }); } catch (_) { /* egal */ }
  }
  _grEditHead(ed) {
    const ms = this._mdList(), sf = ms.some((m) => m.id === "sf"), li = !!(this._liOn && this._liOn());
    return `<div class="gredh">${ic("pencil", 16)}<b>Grundriss bearbeiten</b><span>Modul 0 · ein Plan für Modul 1${sf ? ", 11" : ""}${li ? " und 18" : ""} – nach dem Speichern sofort überall${ed.from && ed.from !== "gr" ? `, danach zurück zu ${esc(this._grModName(ed.from))}` : ""}</span></div>`;
  }
  _grSavePlan(p) {
    const S = this._grS0();
    if (S.d) S.d = { ...S.d, plan: p };   /* sofort zeigen */
    if (this._sfxD && this._sfxD.d && this._sfxD.d.cfg) this._sfxD.d = { ...this._sfxD.d, cfg: { ...this._sfxD.d.cfg, plan: p } };
    this._hass.callWS({ type: "fenster_heizung/gr_set", plan: p, sid: this._grSid() })
      .then((r) => { S.d = r; S.ts = Date.now(); if (this._mdList().some((m) => m.id === "sf") && this._sfxLoad) this._sfxLoad(true); this._render(); const n = r.check && r.check.ids; if (n) this._toast(`${n} ${n === 1 ? "Element hatte" : "Elemente hatten"} eine doppelte Kennung und ${n === 1 ? "bekam" : "bekamen"} eine neue – nichts ging verloren`); })
      .catch((e) => { this._toast(this._grLockErr(e, "Der Grundriss konnte nicht gespeichert werden – bitte nochmal versuchen")); this._grDirty(); });
  }
  _grEditDone(ed, saved) {
    clearInterval(this._grLkT); this._grLkT = null;
    this._grLockCall("release").then((r) => { const S = this._grS0(); if (S.d) { S.d = { ...S.d, lock: r.lock || null }; this._render(); } }).catch(() => {});
    const to = ed && ed.from && ed.from !== "gr" && this._mdList().some((m) => m.id === ed.from) ? ed.from : "";
    if (to) { if (to === "sf") this._sfT = "pl"; this._mdActiveSet(to); }
    this._render();
    if (saved) this._toast(`Grundriss gespeichert${to ? ` – zurück in ${this._grModName(to)}` : ""}`);
  }
  /* Reiter „Ebenen“: was liegt auf dem Plan, wer nutzt es, wo wird es bearbeitet */
  _grLayersView(P) {
    const adm = this._admin(), it = P.items || [], ms = this._mdList(), sf = ms.some((m) => m.id === "sf"), li = !!(this._liOn && this._liOn()), ly = this._grLy();
    const c = (t) => it.filter((i) => i.t === t).length, nFl = this._grFloors(P).length, bgN = Object.values(P.bg || {}).filter(Boolean).length;
    const T = sf ? this._grT() : { l: [] }, pm = new Set(it.filter((i) => i.t === "m" && i.e).map((i) => i.e)), mFree = (T.l || []).filter((d) => !pm.has(d.id)).length;
    const lamps = li && this._liLamps ? this._liLamps() : [], lFree = lamps.filter((x) => !x.pe && !x.grp).length;
    const gm = (this._cfg.layout && this._cfg.layout.gmap) || {}, all = this._gpAll ? this._gpAll() : [], rs = it.filter((i) => i.t === "r"), fhN = rs.filter((r) => this._gpMatch && this._gpMatch(r, all)).length;
    const btn = (act, txt, k, t, pri) => adm ? `<button class="btn2${pri ? " pri" : ""}" data-act="${act}"${k ? ` data-k="${esc(k)}"` : ""}${t ? ` data-t="${esc(t)}"` : ""}>${txt}</button>` : "";
    const vis = (k, on, dis) => `<button class="btn2" data-act="grxly" data-k="${k}" ${dis ? "disabled" : ""} aria-pressed="${on}">${on ? "Im Plan sichtbar" : "Im Plan ausgeblendet"}</button>`;
    const card = (o) => `<div class="card${o.off ? " off" : ""}"><div class="hd"><i style="background:${o.c}22;color:${o.c}">${ic(o.i, 18)}</i><div><b>${o.n}</b><small>${o.s}</small></div></div><div class="nums">${o.nums.map((x) => `<span class="${x[1] ? "w" : ""}">${x[0]}</span>`).join("")}</div><div class="mut sm">${o.d}</div><div class="ft">${o.ft}</div></div>`;
    return `<div class="mut sm" style="margin:-2px 0 10px">Der Plan besteht aus Ebenen. Den <b>Bauplan</b> zeichnest du einmal, die Module legen ihre Ebenen darüber. Bearbeitet wird alles im Baukasten hier – Ebenen ausgeschalteter Module bleiben gespeichert.</div><div class="grly">
      ${card({ n: "Bauplan", s: "Modul 0 · Grundlage für alle", i: "home", c: "#2dd4bf", nums: [[`${nFl} ${nFl === 1 ? "Etage" : "Etagen"}`], [`${c("r")} Räume`], [`${c("w")} Wände`], [`${c("d")} Türen`], [`${c("f")} Fenster`], [`${c("s")} Treppen`], ...(bgN ? [[`${bgN} Hintergrundbild${bgN === 1 ? "" : "er"}`]] : [])], d: "Räume, Wände, Türen, Fenster, Treppen und Text. Räume bekommen im Reiter „Räume“ ihren Bereich aus Home Assistant.", ft: btn("grxedit", `${ic("pencil", 15)} Bauplan bearbeiten`, "gr", "r", true) + `<button class="btn2" data-act="grxtab" data-k="raeume">Räume zuordnen</button>` })}
      ${card({ n: "Melder", s: sf ? "Modul 11 · Sicherheit" : "Modul 11 ist aus", i: "shield", c: "#f87171", off: !sf, nums: [[`${c("m")} im Plan`], ...(sf ? [[`${(T.l || []).length} Melder gesamt`], ...(mFree ? [[`${mFree} noch ohne Platz`, 1]] : [])] : [])], d: sf ? "Rauch-, CO-, Gas-, Wasser- und Hitzemelder mit Reichweite. Modul 11 zeigt daraus Abdeckung und Fluchtweg." : "Die Melder bleiben im Plan gespeichert und erscheinen wieder, sobald Modul 11 an ist.", ft: (sf ? btn("grxedit", `${ic("pencil", 15)} Melder setzen`, "gr", "m:smoke", !!mFree) : "") + vis("sf", ly.sf, !sf) })}
      ${card({ n: "Lampen", s: li ? "Modul 18 · Licht" : "Addon „licht“ ist aus", i: "lamp", c: "#ffb36b", off: !li, nums: [[`${c("l")} im Plan`], ...(li ? [[`${lamps.length} Lampen in Modul 18`], ...(lFree ? [[`${lFree} noch ohne Platz`, 1]] : [])] : [])], d: li ? "Lichtkegel in echter Farbe für die Lichtkarte. Hinzufügen und benennen im Reiter „Lampen“ von Modul 18." : "Die Lampen bleiben im Plan gespeichert und erscheinen wieder, sobald das Addon an ist.", ft: (li ? btn("grxedit", `${ic("pencil", 15)} Lampen setzen`, "gr", "l", !!lFree) : "") + vis("licht", ly.licht && li, !li) })}
      ${card({ n: "Wärme", s: "Modul 1 · Wärmekarte", i: "flame", c: "#fb923c", nums: [[`${fhN} von ${rs.length} Räumen mit Raum aus Modul 1`, fhN < rs.length && rs.length ? 1 : 0]], d: "Keine eigenen Elemente: Modul 1 färbt die Räume des Bauplans nach Temperatur, Fenster zeigen offen oder zu.", ft: `<button class="btn2" data-act="grxtab" data-k="raeume">Räume zuordnen</button><button class="btn2" data-act="grxgo" data-k="fh">Wärmekarte öffnen</button>` })}
      </div>`;
  }
  /* ---- Sichern & Einlesen (Build 4) */
  _grSt(p) {
    const it = (p && p.items) || [], c = (t) => it.filter((i) => i.t === t).length;
    return { fl: ((p && p.floors) || []).length, r: c("r"), b: it.filter((i) => !["r", "m", "l"].includes(i.t)).length, m: c("m"), l: c("l"), bg: Object.values((p && p.bg) || {}).filter(Boolean).length };
  }
  _grStTxt(s) { return [`${s.fl || s.floors || 0} Et.`, `${s.r != null ? s.r : s.rooms} Räume`, `${s.b != null ? s.b : Math.max(0, (s.build || 0) - (s.rooms || 0))} Bauteile`, `${s.m != null ? s.m : (s.layers || {}).sf || 0} Melder`, `${s.l != null ? s.l : (s.layers || {}).licht || 0} Lampen`].join(" · "); }
  _grHLoad(force) {
    const H = (this._grH = this._grH || { d: null, ts: 0, busy: false });
    if (H.busy || (!force && H.d && Date.now() - H.ts < 30000)) return H;
    H.busy = true;
    this._hass.callWS({ type: "fenster_heizung/gr_hist" }).then((r) => { H.d = r; }).catch(() => { H.d = H.d || { hist: [], copy: null, err: true }; }).finally(() => { H.busy = false; H.ts = Date.now(); if (this._mdActive() === "gr") this._render(); });
    return H;
  }
  /* Plan als JSON-Text (Datei „Grundriss-….json“, auch Modul 11 „Plan sichern“). Eigener Name: _grExport ist der Export-Dialog in 12m7 */
  _grExportJson(P, withBg) {
    const D = this._grS0().d || {}, p = { ...P, bg: withBg ? P.bg || {} : {} };
    return JSON.stringify({ app: "fenster_heizung", modul: "grundriss", v: 1, date: new Date().toISOString(), stats: this._grSt(p), plan: p, rooms: D.rooms || {} });
  }
  _grIoView(P, D) {
    const st = this._grSt(P), bgB = Object.values(P.bg || {}).reduce((a, v) => a + String(v || "").length, 0), mb = (n) => (n / 1048576).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " MB";
    const H = this._grHLoad(), hd = H.d, BY = { gr: "Baukasten", sf: "Modul 11", import: "Datei eingelesen", restore: "Wiederhergestellt", umzug: "Umzug aus Modul 11", "": "–" };
    const dt = (t) => { const d = new Date(t); return isNaN(d) ? "–" : `${d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })} ${d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}<small>${this._ago((Date.now() - d) / 3600000)}</small>`; };
    const withBg = this._grExBg !== false;
    const hist = !hd ? `<div class="mut sm">Verlauf wird geladen …</div>` : !(hd.hist || []).length ? `<div class="mut sm">Noch kein früherer Stand. Ab jetzt merkt sich Modul 0 vor jedem Speichern, Einlesen oder Wiederherstellen den vorherigen Stand (die letzten 15).</div>`
      : `<div class="grhist">${hd.hist.map((h, i) => `<div class="grhr"><span class="dt">${dt(h.t)}</span><span class="tx">${esc(this._grStTxt(h.stats || {}))}${this._grChgTxt ? this._grChgTxt(h.chg) : ""}<small>gespeichert über ${esc(BY[h.by] || h.by)} · ersetzt durch ${esc(BY[h.next] || h.next || "–")}${i === 0 ? " · <b>letzter Stand vor jetzt</b>" : ""}</small></span><button class="btn2" data-act="grxrest" data-k="${esc(h.id)}">Wiederherstellen</button></div>`).join("")}</div>`;
    const cp = hd && hd.copy ? `<div class="grhr cp"><span class="dt">${ic("shield", 16)}</span><span class="tx"><b>Umzugs-Kopie aus Modul 11</b> · ${esc(this._grStTxt(hd.copy.stats || {}))}<small>Stand beim Umzug am ${esc(new Date(hd.copy.t).toLocaleDateString("de-DE"))} · aufgehoben bis ${esc(new Date(hd.copy.until).toLocaleDateString("de-DE"))}</small></span><button class="btn2" data-act="grxrest" data-k="umzug">Wiederherstellen</button></div>` : "";
    return `<div class="grio">
      <div class="card"><h3>${ic("download", 18)} Als Datei sichern</h3><div class="nums">${this._grStTxt(st).split(" · ").map((x) => `<span>${x}</span>`).join("")}${st.bg ? `<span>${st.bg} Hintergrundbild${st.bg === 1 ? "" : "er"}</span>` : ""}</div>
        <div class="mut sm">Eine JSON-Datei mit Etagen, Räumen, Bauteilen, Meldern und Lampen sowie der Raumliste. Zum Aufheben, für eine zweite Installation oder bevor du größer umbaust.</div>
        ${st.bg ? `<div class="vrow"><span>Hintergrundbilder mitnehmen<small class="mut" style="display:block">${st.bg} Bild${st.bg === 1 ? "" : "er"} · etwa ${mb(bgB * 0.75)}</small></span><button class="sw ${withBg ? "on" : ""}" data-act="grxexbg" aria-pressed="${withBg}"></button></div>` : ""}
        <div class="row" style="margin-top:auto"><button class="btn2 pri" data-act="grxexp">${ic("download", 15)} Datei herunterladen</button><span class="mut sm">Grundriss-${new Date().toISOString().slice(0, 10)}.json</span></div></div>
      <div class="card"><h3>${ic("upload", 18)} Datei einlesen</h3>
        <div class="mut sm">Liest eine gesicherte Datei aus Modul 0 – oder eine ältere aus dem Baukasten von Modul 11. Du siehst vorher, was sich ändert, und wählst: <b>ersetzen</b> oder <b>als weitere Etagen hinzufügen</b>. Der jetzige Stand landet im Verlauf.</div>
        <div class="row" style="margin-top:auto"><label class="btn2 pri">${ic("upload", 15)} Datei wählen<input type="file" accept="application/json,.json" data-f="grximp" hidden></label></div></div>
      </div>
      <div class="card" style="margin-top:12px"><h3 style="margin:0 0 6px;font-size:1rem;display:flex;gap:8px;align-items:center">${ic("clock", 18)} Verlauf</h3><div class="mut sm" style="margin-bottom:6px">Vor jedem Speichern legt Modul 0 den vorherigen Stand hier ab – ohne Hintergrundbilder, die bleiben beim Wiederherstellen wie sie sind.</div>${hist}${cp}</div>`;
  }
  /* Datei gelesen → Vorschau-Fenster */
  _grImpRead(file) {
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const o = JSON.parse(String(rd.result || "")), p = o && o.plan;
        if (!p || !Array.isArray(p.floors) || !p.floors.length || !Array.isArray(p.items)) throw new Error("form");
        const src = o.modul === "grundriss" ? "Modul 0 · Haus & Grundriss" : o.modul === "sicherheit" ? "Baukasten aus Modul 11 (ältere Datei)" : "unbekannt";
        this._modal = { type: "grximp", name: file.name, o, src, mode: "replace", rooms: !!(o.rooms && Object.keys(o.rooms).length) }; this._renderModal();
      } catch (_) { this._toast("Die Datei ist kein Grundriss aus Strom & Wärme"); }
    };
    rd.readAsText(file);
  }
  _grImpPlan(m) {
    const cur = this._grRaw() || { floors: [], items: [], bg: {} }, p = m.o.plan;
    if (m.mode === "replace") return { ...p, bg: p.bg || {}, scale: p.scale || cur.scale };
    const rnd = () => Math.random().toString(36).slice(2, 6), fmap = {}, imap = {};
    const nf = p.floors.slice(0, Math.max(0, 6 - (cur.floors || []).length)).map((f) => { const id = "f" + rnd(); fmap[f.id] = id; return { id, n: (cur.floors || []).some((x) => x.n === f.n) ? `${f.n} (neu)`.slice(0, 16) : f.n }; });
    const ni = p.items.filter((i) => fmap[i.fl]).map((i) => { const id = "i" + rnd() + rnd(); imap[i.id] = id; return { ...i, id, fl: fmap[i.fl] }; });
    const bg = { ...(cur.bg || {}) }; Object.entries(p.bg || {}).forEach(([k, v]) => { if (fmap[k] && v) bg[fmap[k]] = v; });
    m.imap = imap;
    const low = (f) => /keller|^ug$|^kg$|untergeschoss/i.test(f.n);   /* Keller kommt nach unten (zuerst), alles andere obendrauf */
    return { ...cur, floors: [...nf.filter(low), ...(cur.floors || []), ...nf.filter((f) => !low(f))], items: [...(cur.items || []), ...ni], bg };
  }
  _grImpModal(m) {
    const cur = this._grRaw() || { floors: [], items: [], bg: {} }, a = this._grSt(cur), np = this._grImpPlan(m), b = this._grSt(np), f = this._grSt(m.o.plan);
    const curN = (cur.floors || []).length, cut = m.mode === "add" && curN + f.fl > 6;
    const row = (t, k) => { const d = b[k] - a[k]; return `<tr><td>${t}</td><td class="n">${a[k]}</td><td class="n ${d > 0 ? "up" : d < 0 ? "dn" : ""}">${b[k]}${d ? ` <small>(${d > 0 ? "+" : ""}${d})</small>` : ""}</td></tr>`; };
    const seg = (k, t) => `<button class="${m.mode === k ? "sel" : ""}" data-act="grximpm" data-k="${k}">${t}</button>`;
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Grundriss einlesen</b><span>${esc(m.name)} · ${esc(m.src)}${m.o.date ? ` · gesichert am ${esc(new Date(m.o.date).toLocaleDateString("de-DE"))}` : ""}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="seg" style="margin-bottom:10px">${seg("replace", "Plan ersetzen")}${seg("add", `Als weitere Etage${f.fl === 1 ? "" : "n"} hinzufügen`)}</div>
      <table class="grcmp"><tr><th></th><th style="text-align:right">jetzt</th><th style="text-align:right">danach</th></tr>${row("Etagen", "fl")}${row("Räume", "r")}${row("Bauteile", "b")}${row("Melder (Modul 11)", "m")}${row("Lampen (Modul 18)", "l")}${row("Hintergrundbilder", "bg")}</table>
      ${cut ? `<div class="mut sm" style="color:#fbbf24;margin-top:8px">Es gehen höchstens 6 Etagen – ${curN + f.fl - 6} Etage${curN + f.fl - 6 === 1 ? "" : "n"} aus der Datei ${curN + f.fl - 6 === 1 ? "bleibt" : "bleiben"} draußen.</div>` : ""}
      ${m.mode === "replace" && m.o.rooms && Object.keys(m.o.rooms).length ? `<div class="vrow" style="margin-top:10px"><span>Raumliste übernehmen<small class="mut" style="display:block">${Object.keys(m.o.rooms).length} Zuordnungen Plan-Raum → Bereich aus der Datei</small></span><button class="sw ${m.rooms ? "on" : ""}" data-act="grximpr" aria-pressed="${m.rooms}"></button></div>` : ""}
      <div class="mut sm" style="margin-top:10px">${ic("info", 14)} Der jetzige Stand landet im Verlauf – du kannst jederzeit zurück. Melder und Lampen in der Datei werden mit ihren Entitäten übernommen; fehlt eine Entität hier, bleibt das Element ohne Zuordnung.</div>
      <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="grximpgo">${m.mode === "replace" ? "Plan ersetzen" : "Etagen hinzufügen"}</button></div></div>`;
  }
  _grChange(t) {
    if (t.dataset.f === "grximp") { const file = t.files && t.files[0]; if (file) this._grImpRead(file); t.value = ""; return true; }
    return false;
  }
  /* Zahlen für den Reiter „Räume“: n Räume, open = ohne Bereich und nicht bewusst „kein Bereich“ */
  _grRoomStats(P) {
    const rs = ((P && P.items) || []).filter((i) => i.t === "r"), R = this._grRooms();
    return { n: rs.length, open: rs.filter((i) => R[i.id] !== "-" && !this._grArea(i)).length };
  }
  _grRoomsView(P) {
    const adm = this._admin(), fls = this._grFloors(P), fo = fls.map((f) => f.id), fn = Object.fromEntries(fls.map((f) => [f.id, f.n]));
    const rs = (P.items || []).filter((i) => i.t === "r").sort((x, y) => fo.indexOf(y.fl) - fo.indexOf(x.fl) || String(x.n || "").localeCompare(String(y.n || ""), "de"));
    const all = this._gpAll ? this._gpAll() : [], gm = (this._cfg.layout && this._cfg.layout.gmap) || {}, R = this._grRooms(), st = this._hass.states;
    const inR = (r, i) => (this._sfInRoom ? this._sfInRoom(r, i.x, i.y) : i.x > r.x && i.x < r.x + r.w && i.y > r.y && i.y < r.y + r.h);
    const lampsByArea = {}; if (this._liOn && this._liOn()) Object.keys(st).filter((e) => e.startsWith("light.") && !Array.isArray((st[e].attributes || {}).entity_id)).forEach((e) => { const a = this._grEntArea(e); if (a) lampsByArea[a] = (lampsByArea[a] || 0) + 1; });
    let withA = 0, withF = 0;
    const rows = rs.map((i) => {
      const ar = this._grArea(i), none = R[i.id] === "-", f = this._gpMatch ? this._gpMatch(i, all) : null, fNone = gm[i.id] === "-", fAuto = f && !gm[i.id];
      if (ar || none) withA++; if (f || fNone) withF++;
      const mel = (P.items || []).filter((m) => m.t === "m" && m.fl === i.fl && inR(i, m)).length, lam = (P.items || []).filter((m) => m.t === "l" && m.fl === i.fl && inR(i, m)).length + (ar ? lampsByArea[ar.id] || 0 : 0);
      const mods = [f ? "M1" : "", mel ? `M11 · ${mel} Melder` : "", lam && this._liOn && this._liOn() ? `M18 · Licht` : ""].filter(Boolean);
      const aBtn = `<button class="grsel ${ar ? "" : none ? "none" : "warn"}" ${adm ? `data-act="grxarea" data-k="${esc(i.id)}"` : "disabled"}><span>${ar ? `${ar.auto ? "" : "✓ "}${esc(this._grAreaName(ar.id))}${ar.auto ? " <small>automatisch</small>" : ""}` : none ? "kein Bereich" : "Bereich wählen"}</span>${adm ? "▾" : ""}</button>`;
      const fBtn = `<button class="grsel ${f ? "" : "none"}" ${adm ? `data-act="gpmap" data-k="${esc(i.id)}"` : "disabled"}><span>${f ? `${esc(f.name)}${fAuto ? " <small>automatisch</small>" : ""}` : fNone ? "kein Raum" : "–"}</span>${adm ? "▾" : ""}</button>`;
      return `<tr><td><b>${esc(i.n || "Raum ohne Namen")}</b> <span class="grfl">${esc(fn[i.fl] || i.fl)}</span></td><td data-l="Bereich in Home Assistant">${aBtn}</td><td data-l="Raum in Modul 1">${fBtn}</td><td data-l="Genutzt von" class="grmods">${mods.map((x) => `<span>${x}</span>`).join("") || `<span class="mut" style="background:none">–</span>`}</td></tr>`;
    }).join("");
    if (!rs.length) return `<div class="card empty">${ic("home", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Noch keine Räume im Plan</div>Zeichne Räume mit dem Werkzeug „Raum“ und gib ihnen Namen. Dann erscheinen sie hier.</div>`;
    return `<div class="card"><h2>${ic("grid", 18)}Räume<span class="sfhr"><span class="mut sm">${withA} von ${rs.length} mit Bereich · ${withF} mit Raum aus Modul 1</span></span></h2>
      <div class="mut sm" style="margin:-4px 0 10px">Eine Liste für alle Module. Der <b>Bereich</b> gilt für Modul 18 (Lichtkarte) und kommende Ebenen, der <b>Raum aus Modul 1</b> färbt die Wärmekarte. Ohne Auswahl ordnet der Name zu („automatisch“).</div>
      <table class="grtab"><thead><tr><th>Raum im Plan</th><th>Bereich in Home Assistant</th><th>Raum in Modul 1</th><th>Genutzt von</th></tr></thead><tbody>${rows}</tbody></table></div>${this._grAreaBox ? this._grAreaBox(P) : ""}`;
  }
  _grSetView(D) {
    const meta = D.meta || {}, users = (D.users || []).filter((u) => u !== "gr"), on = this._mdState().on.gr !== false, UN = { fh: "Modul 1 (Wärmekarte)", sf: "Modul 11 (Melder)", li: "Modul 18 (Lichtkarte)" };
    const dt = (x) => (x ? new Date(x).toLocaleDateString("de-DE") : "");
    const lk = this._grLook();
    return `<div class="card"><h2>${ic("sliders", 18)}Einstellungen</h2>
      <div class="vrow"><span>Optik<small class="mut" style="display:block">Neu: Haus-Szene mit Kennzahlen, eine Kopfleiste, Ebenen zum Wischen. „Wie bisher“ zeigt die Reiter und den alten Banner. Gilt nur für diesen Browser.</small></span><span class="gschips"><button class="gsch ${lk === "new" ? "sel" : ""}" data-act="grxlook" data-k="new">Neue Optik</button><button class="gsch ${lk === "classic" ? "sel" : ""}" data-act="grxlook" data-k="classic">Wie bisher</button></span></div>
      <div class="vrow"><span>Modul 0 eingeschaltet<small class="mut" style="display:block">Wird von ${esc(users.map((u) => UN[u] || u).join(", "))} genutzt. Ausschalten blendet nur diese Seite aus – der Plan bleibt gespeichert und in den anderen Modulen sichtbar.</small></span><button class="sw ${on ? "on" : ""}" data-act="grxoff" aria-pressed="${on}" aria-label="Modul 0 ein- oder ausschalten"></button></div>
      <div class="vrow"><span>Umzug aus Modul 11<small class="mut" style="display:block">${meta.since ? `Am ${dt(meta.since)} übernommen.${meta.copy_until ? ` Die Kopie vom alten Stand wird bis ${dt(meta.copy_until)} aufgehoben.` : ""}` : "Kein Umzug nötig – der Plan wurde direkt hier angelegt."}${meta.pmap ? ` Zuordnungen aus Modul 18 am ${dt(meta.pmap)} übernommen.` : ""}</small></span></div>
      <div class="vrow"><span>Zuletzt geändert<small class="mut" style="display:block">${meta.changed ? `${new Date(meta.changed).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}${meta.by === "gr" ? " im Baukasten von Modul 0" : meta.by === "sf" ? " über Modul 11" : ""}` : "–"}</small></span></div>
      <div class="vrow"><span>Gespeichert<small class="mut" style="display:block">Im Kern von Strom &amp; Wärme (fenster_heizung_grundriss), mit automatischen Sicherungskopien. Ausschalten oder Deinstallieren eines Moduls löscht den Plan nicht.</small></span></div></div>${this._grEntBox ? this._grEntBox(D) : ""}${this._grCardInfo ? this._grCardInfo() : ""}`;
  }
  _grModal(m) {
    const P = this._grRaw();
    if (m.type === "grxarea") {
      const it = P && (P.items || []).find((i) => i.id === m.k); if (!it) return `<div class="ov" data-act="close"></div>`;
      const cur = this._grRooms()[it.id] || "", auto = cur ? null : this._grArea(it), A = Object.values(this._hass.areas || {}).sort((a, b) => String(a.name).localeCompare(String(b.name), "de"));
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Bereich zuordnen</b><span>Raum im Plan: ${esc(it.n || "ohne Namen")}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm" style="margin:0 0 10px">Welcher Bereich aus Home Assistant liegt hier? Das gilt für alle Module, die nach Bereichen arbeiten (z. B. Modul 18 · Lichtkarte).</div>
        <div class="gschips">${A.map((a) => `<button class="gsch ${cur === a.area_id || (!cur && auto && auto.id === a.area_id) ? "sel" : ""}" data-act="grxaset" data-k="${esc(it.id)}" data-v="${esc(a.area_id)}">${esc(a.name)}</button>`).join("") || `<span class="mut sm">In Home Assistant sind noch keine Bereiche angelegt.</span>`}</div>
        <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="grxaset" data-k="${esc(it.id)}" data-v="-">Kein Bereich</button>${cur ? `<button class="btn2" data-act="grxaset" data-k="${esc(it.id)}" data-v="">Automatisch</button>` : ""}<button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
    }
    if (m.type === "grxroom") return this._grRoomModal(m);
    if (m.type === "grxchk" && this._grChkModal) return this._grChkModal();
    if (m.type === "grxexp" && this._grExModal) return this._grExModal();
    if (m.type === "grxcal" && this._grCalModal) return this._grCalModal();
    if (m.type === "grximp") return this._grImpModal(m);
    if (m.type === "grxrest") { const H = this._grH && this._grH.d, h = m.k === "umzug" ? H && H.copy : H && (H.hist || []).find((x) => x.id === m.k); return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Stand wiederherstellen?</b><span>${m.k === "umzug" ? "Umzugs-Kopie aus Modul 11" : h ? esc(new Date(h.t).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })) : ""}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm">${h ? `Danach: <b style="color:var(--primary-text-color)">${esc(this._grStTxt(h.stats || {}))}</b>. ` : ""}Der jetzige Stand landet im Verlauf, du kannst also wieder zurück. Hintergrundbilder bleiben, wie sie jetzt sind. Modul 1, 11 und 18 sehen den Stand sofort.</div>
        <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="grxrestgo" data-k="${esc(m.k)}">Wiederherstellen</button></div></div>`; }
    if (m.type === "grxlocked") { const t = m.since ? new Date(m.since).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "";
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Grundriss wird bearbeitet</b><span>Modul 0 · Haus &amp; Grundriss</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm"><b style="color:var(--primary-text-color)">${esc(m.by)}</b> bearbeitet den Grundriss gerade${t ? ` (seit ${t} Uhr)` : ""}. Damit nichts überschrieben wird, ist der Baukasten für dich gesperrt. Die Sperre endet, sobald die Bearbeitung beendet ist oder 15 Minuten lang nichts passiert.</div>
        <div class="foot2" style="margin-top:14px"><button class="btn2 pri" data-act="close">Okay</button><button class="btn2" data-act="grxlockgo" data-from="${esc(m.from)}" data-tool="${esc(m.tool)}">Trotzdem übernehmen</button></div></div>`; }
    if (m.type === "grxeditoff") return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Modul 0 einschalten?</b><span>Haus &amp; Grundriss</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm">Der Baukasten liegt jetzt in <b style="color:var(--primary-text-color)">Modul 0 · Haus &amp; Grundriss</b>. Zum Bearbeiten wird Modul 0 eingeschaltet. ${m.from && m.from !== "gr" ? `Nach dem Speichern geht es zurück zu ${esc(this._grModName(m.from))}.` : ""}</div>
        <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="grxeditgo">Einschalten und bearbeiten</button></div></div>`;
    if (m.type === "grxoff") {
      const D = this._grS0().d || {}, UN = { fh: "Modul 1", sf: "Modul 11", li: "Modul 18" }, U = (D.users || []).map((u) => UN[u]).filter(Boolean);
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Modul 0 ausschalten?</b><span>Haus &amp; Grundriss</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm" style="margin-bottom:10px">${U.length ? `Der Grundriss wird von <b style="color:var(--primary-text-color)">${esc(U.join(", ").replace(/, ([^,]*)$/, " und $1"))}</b> genutzt.` : "Der Grundriss wird gerade von keinem anderen Modul genutzt."}</div>
        <div class="mut sm">Ausschalten blendet nur die Seite „Haus &amp; Grundriss“ aus. Der Plan bleibt gespeichert, die anderen Module zeigen ihn weiter. Einschalten geht jederzeit unter Einstellungen → Module.</div>
        <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="grxoffgo">Trotzdem ausschalten</button></div></div>`;
    }
    return `<div class="ov" data-act="close"></div>`;
  }
  _grAct(a, b) {
    if (this._grB6Act && this._grB6Act(a, b)) return true;
    const k = b && b.dataset ? b.dataset.k : "";
    if (a === "grxfl") { this._grFl = k; this._render(); return true; }
    if (a === "grxly") { const L = this._grLy(); if (k in L) { L[k] = !L[k]; this._render(); } return true; }
    if (a === "grxtab") { this._grTab = k || "plan"; this._grMenu = ""; this._render(); return true; }
    if (a === "grxmenu") { this._grMenu = this._grMenu === k ? "" : k; this._render(); return true; }
    if (a === "grxarea") { if (this._admin()) { this._modal = { type: "grxarea", k }; this._renderModal(); } return true; }
    if (a === "grxaset") {
      if (!this._admin()) return true;
      const S = this._grS0(), v = b.dataset.v || "";
      if (S.d) { const r = { ...(S.d.rooms || {}) }; if (v) r[k] = v; else delete r[k]; S.d = { ...S.d, rooms: r }; }   /* sofort zeigen */
      this._modal = null; this._renderModal(); this._render();
      this._hass.callWS({ type: "fenster_heizung/gr_set", rooms: { [k]: v } }).then((r) => { S.d = r; S.ts = Date.now(); this._render(); }).catch(() => { this._toast("Speichern fehlgeschlagen"); this._grDirty(); });
      return true;
    }
    if (a === "grxoff") {
      const s = this._mdState();
      if (s.on.gr === false) { s.on.gr = true; this._mdSave(); this._render(); this._renderModal(); return true; }
      this._modal = { type: "grxoff" }; this._renderModal(); return true;
    }
    if (a === "grxoffgo") { const s = this._mdState(); s.on.gr = false; this._modal = null; this._renderModal(); if (this._mdActive() === "gr") this._mdActiveSet("fh"); this._mdSave(); this._render(); this._toast("Modul 0 ist aus – der Grundriss bleibt in den anderen Modulen sichtbar"); return true; }
    if (a === "grxexbg") { this._grExBg = this._grExBg === false; this._render(); return true; }
    if (a === "grxexp") { const P = this._grRaw(); if (P) this._sfDeliver(this._grExportJson(P, this._grExBg !== false), `Grundriss-${new Date().toISOString().slice(0, 10)}.json`, "application/json", "Grundriss"); return true; }
    if (a === "grximpm") { const m = this._modal; if (m && m.type === "grximp") { m.mode = k === "add" ? "add" : "replace"; this._renderModal(); } return true; }
    if (a === "grximpr") { const m = this._modal; if (m && m.type === "grximp") { m.rooms = !m.rooms; this._renderModal(); } return true; }
    if (a === "grximpgo") {
      const m = this._modal; if (!m || m.type !== "grximp") return true;
      const p = this._grImpPlan(m), msg = { type: "fenster_heizung/gr_set", plan: p, src: "import", sid: this._grSid() }, S = this._grS0();
      if (m.mode === "replace" && m.rooms && m.o.rooms) msg.rooms = m.o.rooms;
      this._modal = null; this._renderModal();
      this._hass.callWS(msg).then((r) => { S.d = r; S.ts = Date.now(); this._grHLoad(true); if (this._mdList().some((x) => x.id === "sf") && this._sfxLoad) this._sfxLoad(true); this._render(); const s2 = this._grSt(r.plan); this._toast(`Eingelesen: ${s2.fl} Etagen, ${s2.r} Räume – der vorherige Stand liegt im Verlauf`); })
        .catch((e) => this._toast(this._grLockErr(e, "Einlesen hat nicht geklappt – die Datei passt nicht")));
      return true;
    }
    if (a === "grxrest") { this._grHLoad(); this._modal = { type: "grxrest", k }; this._renderModal(); return true; }
    if (a === "grxrestgo") {
      const S = this._grS0(); this._modal = null; this._renderModal();
      this._hass.callWS({ type: "fenster_heizung/gr_restore", bid: k, sid: this._grSid() }).then((r) => { const { h, ...d } = r; S.d = d; S.ts = Date.now(); if (this._grH) { this._grH.d = h; this._grH.ts = Date.now(); } if (this._mdList().some((x) => x.id === "sf") && this._sfxLoad) this._sfxLoad(true); this._render(); this._toast("Stand wiederhergestellt"); })
        .catch((e) => this._toast(this._grLockErr(e, "Dieser Stand ist nicht mehr da")));
      return true;
    }
    if (a === "grxchip") {   /* v0.14: Kennzahl-Chips der Haus-Szene springen in den Plan */
      const ly = this._grLy(); this._grTab = k === "rooms" ? "raeume" : "plan";
      if (k === "win") { ly.sf = true; ly.now = true; } else if (k === "lamp") { ly.licht = true; }
      if (k === "chk") { this._modal = { type: "grxchk" }; this._renderModal(); return true; }
      this._grMenu = ""; this._render(); return true;
    }
    if (a === "grxlook") { this._grLookV = k === "classic" ? "classic" : "new"; try { localStorage.setItem("fh_gr_look", this._grLookV); } catch (_) { /* privater Modus */ } this._render(); return true; }
    if (a === "grxsty") { this._grSty = ["modern", "bauplan", "hell"].includes(k) ? k : "modern"; try { localStorage.setItem("fh_gr_style", this._grSty); } catch (_) { /* privater Modus */ } this._render(); return true; }
    if (a === "grxdims") { this._grDim = !this._grDimsOn(); try { localStorage.setItem("fh_gr_dims", this._grDim ? "1" : "0"); } catch (_) { /* privater Modus */ } this._render(); return true; }
    if (a === "grxedit") { this._grEdit((b && b.dataset && b.dataset.k) || "gr", (b && b.dataset && b.dataset.t) || ""); return true; }
    if (a === "grxlockgo") { const m = this._modal || {}; this._modal = null; this._renderModal(); this._grEdit(m.from, m.tool, true); return true; }
    if (a === "grxeditgo") { const m = this._modal || {}, s = this._mdState(); s.on.gr = true; this._mdSave(); this._modal = null; this._grEdit(m.from, m.tool); return true; }
    if (a === "grxgo") { if (this._mdList().some((x) => x.id === k)) { this._mdActiveSet(k); this._render(); } return true; }
    if (a === "grxsfon") { this._toast("Der Baukasten liegt bis Build 3 noch in Modul 11. Schalte Modul 11 unter Einstellungen → Module ein."); return true; }
    return false;
  }
