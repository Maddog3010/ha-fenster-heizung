  /* ================= Modul 0 Build 7: Treppenarten, mobile Geräte, Markise =================
     Treppen: gerade, L-Treppe, U-Treppe (halbgewendelt), Wendeltreppe, Dachbodentreppe.
     Mobile Heizer (Elektroheizer je Raum aus Modul 1) und mobile Luftentfeuchter (Modul 1): eigenes Element „g“ mit Zustand im Plan.
     Ein Entfeuchter folgt seinem Standort aus Modul 1 („Hierher stellen“, NFC), solange er nicht fest gesetzt ist.
     Markise (Element „a“) an der Wand, mit Ausfall und – falls vorhanden – Stand aus einer Rollo-Entität (cover). */
  _grDevList() {
    const st = this._hass.states, heizer = [], entf = [];
    try { (this._collect ? this._collect(true) : []).forEach((r) => { const h = r.htr; if (h && h.entity && !heizer.some((x) => x.e === h.entity)) { const w = Number(h.watt_now) || 0, s = st[h.entity]; heizer.push({ e: h.entity, name: this._grNiceName(h.entity), m1: r.id, room: r.name, on: w > 0 || !!(s && ["on", "heat"].includes(s.state)), txt: w > 0 ? `${num(w, 0)} W` : "aus" }); } }); } catch (_) { /* Modul 1 fehlt */ }
    try { (this._lfDevs ? this._lfDevs() : []).forEach((d) => { const L = (d.S && d.S.live) || {}, k = this._lfState ? this._lfState(L) : ["", ""]; entf.push({ e: d.ent, name: d.name || this._grNiceName(d.ent), m1: d.S && d.S.loc, room: d.S && d.S.loc && this._lfRoomName ? this._lfRoomName(d.S.loc) : "", on: k[0] === "run", txt: k[1] || "" }); }); } catch (_) { /* kein Entfeuchter */ }
    return { heizer, entf };
  }
  _grDevInfo(i) { const L = this._grDevList()[i.gk === "entf" ? "entf" : "heizer"]; return L.find((x) => x.e === i.e) || null; }
  /* Plan-Raum zu einem Raum aus Modul 1 */
  _grPlanRoomOf(P, m1) {
    if (!m1 || !this._gpMatch) return null;
    const all = this._gpAll ? this._gpAll() : [];
    return (P.items || []).find((r) => r.t === "r" && (this._gpMatch(r, all) || {}).id === m1) || null;
  }
  /* Wo steht das Gerät gerade? Entfeuchter folgen dem Standort aus Modul 1, wenn sie nicht fest gesetzt sind. */
  _grDevPos(i, P, D) {
    const inf = D ? D[i.gk === "entf" ? "entf" : "heizer"].find((x) => x.e === i.e) : null;
    if (i.gk === "entf" && !i.fix && inf && inf.m1 && !(this._sfEd && P === this._sfEd.plan)) {   /* im Baukasten an der gesetzten Stelle */
      const pr = this._grPlanRoomOf(P, inf.m1);
      if (pr && !(pr.fl === i.fl && this._sfInRoom(pr, i.x, i.y))) { const c = this._grCen ? this._grCen(pr) : [pr.x + pr.w / 2, pr.y + pr.h / 2]; return { x: Math.round(Math.max(pr.x + 24, c[0] - pr.w * 0.26)), y: Math.round(Math.min(pr.y + pr.h - 24, c[1] + pr.h * 0.22)), fl: pr.fl, moved: true, inf }; }
    }
    return { x: i.x, y: i.y, fl: i.fl, moved: false, inf };
  }
  _grDevSvg(P, fl, T, q, u, hell, skip) {
    const D = this._grDevList(); let d = "";
    (P.items || []).filter((i) => i.t === "g").forEach((i, n) => {
      if (skip && skip.has(i)) return;   /* Handy: steht in der Status-Leiste des Raums */
      const p = this._grDevPos(i, P, D); if (p.fl !== fl) return;
      const ent = i.gk === "entf", c = ent ? "#38bdf8" : "#f97316", on = !!(p.inf && p.inf.on), g = `${u}dg${n}`, x = p.x, y = p.y;
      const icon = ent ? `<path d="M${x} ${y - 6.5 * q}c${3 * q} ${4 * q} ${4.6 * q} ${6 * q} ${4.6 * q} ${8.4 * q}a${4.6 * q} ${4.6 * q} 0 0 1 ${-9.2 * q} 0c0 ${-2.4 * q} ${1.6 * q} ${-4.4 * q} ${4.6 * q} ${-8.4 * q}z" fill="${on ? c : "none"}" stroke="${c}" stroke-width="1.6"/>`
        : `<path d="M${x - 5 * q} ${y + 5 * q}V${y - 5 * q}M${x - 1.7 * q} ${y + 5 * q}V${y - 5 * q}M${x + 1.7 * q} ${y + 5 * q}V${y - 5 * q}M${x + 5 * q} ${y + 5 * q}V${y - 5 * q}M${x - 6.5 * q} ${y + 5 * q}H${x + 6.5 * q}" stroke="${c}" stroke-width="1.7" stroke-linecap="round"/>`;
      const waves = on && !ent ? [-5, 0, 5].map((o) => `<path d="M${x + o * q} ${y - 15 * q}c${-2 * q} ${-3 * q} ${2 * q} ${-5 * q} 0 ${-8 * q}" fill="none" stroke="${c}" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`).join("") : "";
      const lab = p.inf ? (p.moved ? `${p.inf.txt || ""} · Standort Modul 1`.replace(/^ · /, "") : p.inf.txt) : "nicht verbunden", lw = lab.length * 5.6 + 12;
      d += `<g><title>${esc(ent ? "Luftentfeuchter" : "Heizer")}${i.e ? ` · ${esc(p.inf ? p.inf.name : this._grNiceName(i.e))}` : ""}${p.inf && p.inf.txt ? ` · ${esc(p.inf.txt)}` : ""}${p.moved ? " · steht laut Modul 1 hier" : ""}</title>${on ? `<radialGradient id="${g}"><stop offset="0" stop-color="${c}" stop-opacity=".45"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient><circle cx="${x}" cy="${y}" r="${40 * q}" fill="url(#${g})"/>` : ""}
        <rect x="${x - 11 * q}" y="${y - 11 * q}" width="${22 * q}" height="${22 * q}" rx="${6 * q}" fill="${hell ? "#fff" : "#111827"}" stroke="${c}" stroke-width="${on ? 2.2 : 1.4}"${p.moved ? ' stroke-dasharray="4 3"' : ""}/>${icon}${waves}
        <rect x="${x - lw / 2}" y="${y + 13 * q}" width="${lw}" height="15" rx="7.5" fill="${hell ? "#fff" : "#0b1220"}" opacity=".9"/><text x="${x}" y="${y + 13 * q + 11}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${on ? c : T.sub}">${esc(lab)}</text></g>`;
    });
    return d;
  }
  /* Markise: Kasten an der Wand, Tuch nach außen (Ausfall), Stand aus der Rollo-Entität */
  _grAwnSvg(i, T, sc, st, u) {
    const x = i.x, y = i.y, h = ((i.b || 400) / 100) * sc / 2, D = ((i.tf || 300) / 100) * sc, s = i.e && st[i.e];
    const pos = s ? (s.attributes && s.attributes.current_position != null ? Number(s.attributes.current_position) : s.state === "open" ? 100 : 0) : null, ext = pos == null ? D : (D * Math.max(0, Math.min(100, pos))) / 100;
    const rot = i.r ? `rotate(${i.r} ${x} ${y})` : "", mir = i.mv ? ` translate(${x} ${y}) scale(1 -1) translate(${-x} ${-y})` : "";
    const ly = i.mv ? -14 : 14, an = ((i.r || 0) * Math.PI) / 180, cx = x - Math.sin(an) * ly, cy = y + Math.cos(an) * ly, lab = pos == null ? "Markise" : `Markise ${num(pos, 0)} %`, lw = lab.length * 6 + 14;
    return `<g><title>${esc(lab)}${i.e ? ` · ${esc(this._grNiceName(i.e))}` : ""}</title><pattern id="${u}awn${i.id}" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="${rot}"><rect width="8" height="16" fill="#f59e0b"/><rect x="8" width="8" height="16" fill="#fde68a"/></pattern>
      <g transform="${rot}${mir}"><rect x="${x - h}" y="${y}" width="${2 * h}" height="${D}" fill="none" stroke="${T.sub}" stroke-width="1.2" stroke-dasharray="5 4" opacity=".8"/>${ext > 0.5 ? `<rect x="${x - h}" y="${y}" width="${2 * h}" height="${ext}" fill="url(#${u}awn${i.id})" opacity="${pos == null ? 0.25 : 0.5}"/><path d="M${x - h} ${y + ext}H${x + h}" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>` : ""}<rect x="${x - h}" y="${y - 3}" width="${2 * h}" height="6" rx="2" fill="${T.sub}"/></g>
      <rect x="${cx - lw / 2}" y="${cy - 9}" width="${lw}" height="18" rx="9" fill="#0b1220" opacity=".85"/><text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#fcd34d">${esc(lab)}</text></g>`;
  }
  /* Treppen in allen Arten */
  _grStairSvg(i, T, u) {
    const x = i.x, y = i.y, w = i.w || 60, h = i.h || 90, rot = i.r ? ` transform="rotate(${i.r} ${x} ${y})"` : "", S = T.stair, mk = ` marker-end="url(#${u}ar)"`;
    const ln = (dd, o) => `<path d="${dd}" stroke="${S}" stroke-width="1" opacity="${o || 0.8}" fill="none"/>`;
    if (i.sk === "l") {
      const a = Math.min(w, h) * 0.4, n1 = Math.max(3, Math.round((w - a) / 14)), n2 = Math.max(3, Math.round((h - a) / 14));
      const st1 = Array.from({ length: n1 }, (_, k) => `M${x + a + ((k + 1) * (w - a)) / (n1 + 1)} ${y}v${a}`).join(""), st2 = Array.from({ length: n2 }, (_, k) => `M${x} ${y + a + ((k + 1) * (h - a)) / (n2 + 1)}h${a}`).join("");
      return `<g${rot}><path d="M${x} ${y}H${x + w}V${y + a}H${x + a}V${y + h}H${x}Z" fill="${T.bg}" stroke="${S}" stroke-width="1.6"/>${ln(st1 + st2 + `M${x + a} ${y + a}L${x} ${y}M${x + a} ${y + a}L${x} ${y + a * 0.45}M${x + a} ${y + a}L${x + a * 0.45} ${y}`)}<path d="M${x + a / 2} ${y + h - 8}V${y + a / 2}H${x + w - 10}" fill="none" stroke="${S}" stroke-width="1.8"${mk}/></g>`;
    }
    if (i.sk === "u") {
      const R = Math.min(w / 2, Math.max(20, h - 24)), a = w * 0.34, cx = x + w / 2, cy = y + R, ri = Math.max(4, R - a), n = Math.max(2, Math.round((h - R) / 14));
      const legs = Array.from({ length: n }, (_, k) => { const yy = cy + ((k + 1) * (h - R)) / (n + 1); return `M${x} ${yy}h${a}M${x + w - a} ${yy}h${a}`; }).join("");
      const wind = Array.from({ length: 7 }, (_, k) => { const an = Math.PI + ((k + 1) * Math.PI) / 8, c = Math.cos(an), s = Math.sin(an); return `M${cx + ri * c} ${cy + ri * s}L${cx + R * c * (w / 2 / R)} ${cy + R * s}`; }).join("");
      const am = R - a / 2;
      return `<g${rot}><path d="M${x} ${y + h}V${cy}A${w / 2} ${R} 0 0 1 ${x + w} ${cy}V${y + h}H${x + w - a}V${cy}A${ri} ${ri} 0 0 0 ${x + a} ${cy}V${y + h}Z" fill="${T.bg}" stroke="${S}" stroke-width="1.6"/>${ln(legs + wind)}<path d="M${x + a / 2} ${y + h - 8}V${cy}A${w / 2 - a / 2} ${am} 0 0 1 ${x + w - a / 2} ${cy}V${y + h - 12}" fill="none" stroke="${S}" stroke-width="1.8"${mk}/></g>`;
    }
    if (i.sk === "wendel") {
      const rr = Math.min(w, h) / 2 - 2, cx = x + w / 2, cy = y + h / 2, ra = Array.from({ length: 12 }, (_, k) => { const an = (k * Math.PI) / 6; return `M${cx + rr * 0.18 * Math.cos(an)} ${cy + rr * 0.18 * Math.sin(an)}L${cx + rr * Math.cos(an)} ${cy + rr * Math.sin(an)}`; }).join(""), am = rr * 0.62;
      return `<g${rot}><circle cx="${cx}" cy="${cy}" r="${rr}" fill="${T.bg}" stroke="${S}" stroke-width="1.6"/>${ln(ra)}<circle cx="${cx}" cy="${cy}" r="${rr * 0.18}" fill="${S}" opacity=".7"/><path d="M${cx} ${cy + am}A${am} ${am} 0 1 0 ${cx - am} ${cy}" fill="none" stroke="${S}" stroke-width="1.8"${mk}/></g>`;
    }
    if (i.sk === "boden") {
      const n = Math.max(3, Math.round(h / 16)), rail = `M${x + w * 0.3} ${y + 6}V${y + h - 6}M${x + w * 0.7} ${y + 6}V${y + h - 6}`, rungs = Array.from({ length: n }, (_, k) => `M${x + w * 0.3} ${y + ((k + 1) * h) / (n + 1)}H${x + w * 0.7}`).join("");
      return `<g${rot}><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${T.bg}" stroke="${S}" stroke-width="1.6" stroke-dasharray="6 4"/>${ln(rail + rungs, 0.9)}<text x="${x + w / 2}" y="${y + h - 4}" text-anchor="middle" font-size="9" fill="${S}">Bodenluke</text></g>`;
    }
    const n = Math.max(5, Math.round(h / 14)), vert = h >= w, steps = Array.from({ length: n - 1 }, (_, k) => vert ? `M${x} ${y + (k + 1) * h / n}h${w}` : `M${x + (k + 1) * w / n} ${y}v${h}`).join("");
    return `<g${rot}><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${T.bg}" stroke="${S}" stroke-width="1.6"/>${ln(steps)}${vert ? `<path d="M${x + w / 2} ${y + h - 8}V${y + 10}" stroke="${S}" stroke-width="1.8"${mk}/>` : `<path d="M${x + 8} ${y + h / 2}H${x + w - 10}" stroke="${S}" stroke-width="1.8"${mk}/>`}</g>`;
  }
  /* ---- Eigenschaften */
  _grStairProps(sel) {
    const K = [["", "gerade"], ["l", "L-Treppe"], ["u", "U-Treppe (halbgewendelt)"], ["wendel", "Wendeltreppe"], ["boden", "Dachbodentreppe"]];
    return `<div class="sffld"><label>Art der Treppe</label><div class="grseg">${K.map(([k, t]) => `<button class="${(sel.sk || "") === k ? "on" : ""}" data-act="grxsk" data-v="${k}">${t}</button>`).join("")}<button data-act="grxor" data-s="90">↻ 90°</button></div></div>`;
  }
  _grDevProps(sel) {
    const D = this._grDevList(), gk = sel.gk === "entf" ? "entf" : "heizer", L = D[gk], inf = L.find((x) => x.e === sel.e), P = this._sfPl(), pos = this._grDevPos(sel, P, D);
    const none = gk === "heizer" ? `Noch kein Elektroheizer in Modul 1.${this._admin() ? ` <button class="lnk" data-act="ehxnew">${ic("plus", 14)} Jetzt einrichten</button>` : ""}` : "Noch kein Luftentfeuchter in Modul 1. Er wird in Modul 1 unter „Luftentfeuchter“ eingerichtet.";
    return `<div class="sffld"><label>Art</label><div class="grseg"><button class="${gk === "heizer" ? "on" : ""}" data-act="grxgk" data-v="heizer">Mobiler Heizer</button><button class="${gk === "entf" ? "on" : ""}" data-act="grxgk" data-v="entf">Luftentfeuchter</button></div></div>
      <div class="sffld"><label>Gerät aus Modul 1</label>${L.length ? `<div class="gschips">${L.map((x) => `<button class="gsch ${sel.e === x.e ? "sel" : ""}" data-act="grxge" data-v="${esc(x.e)}">${esc(x.name)}${x.room ? `<small class="mut"> · ${esc(x.room)}</small>` : ""}</button>`).join("")}</div>` : `<div class="mut sm">${none}</div>`}</div>
      ${inf ? `<div class="grwall ok">${ic(inf.on ? "bolt" : "info", 14)}<span>${esc(inf.name)} · <b>${esc(inf.txt || (inf.on ? "läuft" : "aus"))}</b>${inf.room ? ` · Modul 1: ${esc(inf.room)}` : ""}</span></div>` : ""}
      ${gk === "entf" ? `<div class="sffld" style="margin-top:8px"><label>Standort</label><div class="grseg"><button class="${!sel.fix ? "on" : ""}" data-act="grxgfix" data-v="0">Folgt Modul 1</button><button class="${sel.fix ? "on" : ""}" data-act="grxgfix" data-v="1">Fest hier</button></div><small class="mut" style="display:block;margin-top:4px">${!sel.fix ? `Wird das Gerät in Modul 1 woanders hingestellt („Hierher stellen“, NFC), zeigt der Plan es dort.${pos.moved ? " Gerade steht es laut Modul 1 in einem anderen Raum." : ""}` : "Das Gerät bleibt im Plan an dieser Stelle."}</small></div>` : ""}`;
  }
  _grAwnProps(sel) {
    const st = this._hass.states, cov = Object.keys(st).filter((e) => e.startsWith("cover.")), inf = this._grOpenInfo(sel);
    return `<div class="vrow" style="margin:6px 0"><span>Breite</span><div class="step" style="flex:none"><button data-act="grxob" data-s="-25" aria-label="schmaler">${ic("minus", 16)}</button><b>${num((sel.b || 400) / 100, 2)} m</b><button data-act="grxob" data-s="25" aria-label="breiter">${ic("plus", 16)}</button></div></div>
      <div class="vrow" style="margin:6px 0"><span>Ausfall</span><div class="step" style="flex:none"><button data-act="grxatf" data-s="-25" aria-label="weniger">${ic("minus", 16)}</button><b>${num((sel.tf || 300) / 100, 2)} m</b><button data-act="grxatf" data-s="25" aria-label="mehr">${ic("plus", 16)}</button></div></div>
      <div class="grseg" style="margin:2px 0 8px"><button data-act="grxamv">Seite wechseln</button><button data-act="grxor" data-s="90">↻ 90°</button></div>
      <div class="sffld"><label>Markise in Home Assistant (optional)</label>${cov.length || sel.e ? this._grPick(sel, cov, /markise|awning|sonnen/i) : `<div class="mut sm">Keine Rollo-/Markisen-Entität (cover) gefunden.</div>`}<small class="mut" style="display:block;margin-top:4px">Mit Entität zeigt der Plan, wie weit sie ausgefahren ist.</small></div>
      ${inf ? `<div class="grwall ok">${ic("check", 14)}<span>An der Wand · Abstand zur Ecke <b>${num(Math.max(0, inf.a) / this._sfScale(), 2)} m</b> und <b>${num(Math.max(0, inf.b) / this._sfScale(), 2)} m</b></span></div>` : `<div class="grwall">${ic("alert", 14)}<span>Hängt nicht an einer Wand.</span><button class="grb" data-act="grxosnap">An Wand einrasten</button></div>`}`;
  }
  /* Raum-Blatt: Geräte im Raum */
  _grDevRow(r, P) {
    const D = this._grDevList(), its = (P.items || []).filter((i) => i.t === "g").map((i) => ({ i, p: this._grDevPos(i, P, D) })).filter((o) => o.p.fl === r.fl && this._sfInRoom(r, o.p.x, o.p.y));
    if (!its.length) return "";
    const t = its.map((o) => `${o.p.inf ? o.p.inf.name : o.i.gk === "entf" ? "Entfeuchter" : "Heizer"}${o.p.inf && o.p.inf.txt ? ` · ${o.p.inf.txt}` : ""}`).join(", "), on = its.some((o) => o.p.inf && o.p.inf.on);
    return `<div class="grrb"><span class="i">${ic("bolt", 18)}</span><span class="t">Geräte</span><b style="${on ? "color:#f97316" : ""}">${esc(t)}</b></div>`;
  }
  /* Ablage: Geräte ohne Platz */
  _grDevFree(P) {
    const D = this._grDevList(), pl = new Set((P.items || []).filter((i) => i.t === "g" && i.e).map((i) => i.e));
    return [...D.heizer.filter((x) => !pl.has(x.e)).map((x) => ({ ...x, gk: "heizer" })), ...D.entf.filter((x) => x.e && !pl.has(x.e)).map((x) => ({ ...x, gk: "entf" }))];
  }
  _grDevPlace(P, fl, gk, e, x, y) {
    const D = this._grDevList(), inf = D[gk].find((q) => q.e === e), pr = inf && inf.m1 ? this._grPlanRoomOf(P, inf.m1) : null, it = { id: "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), fl, t: "g", x: 400, y: 240, r: 0, n: "", e: e || "", gk };
    if (x != null) { it.x = x; it.y = y; }
    else if (pr) { const c = this._grCen ? this._grCen(pr) : [pr.x + pr.w / 2, pr.y + pr.h / 2]; it.fl = pr.fl; it.x = Math.round(c[0] + pr.w * 0.26); it.y = Math.round(c[1] + pr.h * 0.22); }
    return it;
  }
  _grB7bAct(a, b) {
    const ed = this._sfEd, v = b && b.dataset ? b.dataset.v : ""; if (!ed) return false;
    const P = ed.plan, cur = P.items.find((x) => x.id === ed.sel);
    if (a === "grxgplace") { this._sfSnap(); const it = this._grDevPlace(P, this._sfFl(), b.dataset.k === "entf" ? "entf" : "heizer", v); P.items.push(it); this._sfFlId = it.fl; ed.sel = it.id; ed.tool = "select"; this._render(); return true; }
    if (!cur) return false;
    if (a === "grxsk" && cur.t === "s") { this._sfSnap(); if (v) cur.sk = v; else delete cur.sk; if (v === "wendel") { const m = Math.max(cur.w, cur.h); cur.w = m; cur.h = m; } this._render(); return true; }
    if (cur.t === "g") {
      if (a === "grxgk") { this._sfSnap(); cur.gk = v === "entf" ? "entf" : "heizer"; cur.e = ""; delete cur.fix; this._render(); return true; }
      if (a === "grxge") { this._sfSnap(); cur.e = v; this._render(); return true; }
      if (a === "grxgfix") { this._sfSnap(); if (v === "1") cur.fix = 1; else delete cur.fix; this._render(); return true; }
    }
    if (cur.t === "a") {
      if (a === "grxatf") { this._sfSnap(); cur.tf = Math.max(50, Math.min(800, (cur.tf || 300) + Number(b.dataset.s || 0))); this._render(); return true; }
      if (a === "grxamv") { this._sfSnap(); if (cur.mv) delete cur.mv; else cur.mv = 1; this._render(); return true; }
      if (a === "grxae") { this._sfSnap(); cur.e = v; this._render(); return true; }
    }
    return false;
  }
