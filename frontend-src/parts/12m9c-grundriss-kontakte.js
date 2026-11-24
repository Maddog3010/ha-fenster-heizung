  /* ================= Modul 0 v0.12 (2026.11.4.4b1): Fenster- und Türkontakte im Fenster bzw. in der Tür =================
     Der Kontakt gehört zum Element selbst (i.e, optional i.ek für die Kippstellung). Der Plan zeigt zu, gekippt, offen und
     „?“ (liefert nichts) – in Modul 0, in der Wärmekarte von Modul 1 und im Plan von Modul 11. Alte Kontakt-Elemente
     direkt an Fenstern und Türen lassen sich übernehmen; „Kontakte aus Modul 1 zuordnen“ verteilt die Raum-Kontakte. */
  _grKDc(e) { const s = this._hass.states[e]; return (s && s.attributes && s.attributes.device_class) || ""; }
  _grKCand(i) {
    const st = this._hass.states;
    return Object.keys(st).filter((e) => {
      const d = e.split(".")[0], dc = this._grKDc(e);
      if (d === "binary_sensor") return ["window", "door", "opening", "garage_door"].includes(dc) || /fenster|window|tür|tuer|door|kontakt|contact/i.test(e);
      if (d === "sensor") return /griff|handle|fenster|window|tilt|kipp/i.test(`${e} ${this._wzName(e)}`) && /^(open|opened|offen|tilted|tilt|gekippt|closed|zu|geschlossen|on|off)$/i.test(String(st[e].state)) ;
      if (d === "cover") return i.t === "d" && (i.dk === "garage" || dc === "garage" || /garage|tor/i.test(e));
      return false;
    });
  }
  /* Zustand: zu · gekippt · offen · ? (liefert nichts); seit = Zeitpunkt der letzten Änderung */
  _grKVal(e) {
    const s = e && this._hass.states[e]; if (!s) return null;
    const v = String(s.state).toLowerCase();
    if (["unavailable", "unknown", ""].includes(v)) return "?";
    if (/^(tilted|tilt|gekippt)$/.test(v)) return "gekippt";
    if (/^(on|open|opened|opening|offen)$/.test(v)) return "offen";
    if (/^(off|closed|closing|zu|geschlossen)$/.test(v)) return "zu";
    return "?";
  }
  _grKState(i) {
    if (!i || !i.e) return null;
    const a = this._grKVal(i.e), b = i.ek ? this._grKVal(i.ek) : null; if (!a) return { k: "?", t: 0 };
    const k = a === "?" ? "?" : b === "offen" || b === "gekippt" ? "gekippt" : a;
    const s = this._hass.states[i.ek && k === "gekippt" ? i.ek : i.e], t = s && s.last_changed ? Date.parse(s.last_changed) : 0;
    return { k, t };
  }
  _grKCol(k) { return k === "offen" ? "#ef4444" : k === "gekippt" ? "#f59e0b" : k === "?" ? "#94a3b8" : ""; }
  /* Chip „offen · 25 min“ (ab 5 Minuten; orange ab der Erinnerung aus Modul 1, sonst 15 min) – auf dem Handy nur die Farbe */
  _grKChip(i, P, T, hell) {
    const S = this._grKState(i); if (!S || (S.k !== "offen" && S.k !== "gekippt") || this._narrow || !S.t) return "";
    const min = Math.floor((Date.now() - S.t) / 60000); if (min < 5) return "";
    const lim = Math.max(5, Number((this._gen || {}).notify_after) || 15), lab = `${S.k} · ${min >= 120 ? Math.floor(min / 60) + " h" : min + " min"}`, lw = lab.length * 5.4 + 12;
    const R = this._grRoomSide(P, i, 22), d = 16 + Math.abs(R.nx) * (lw / 2) + Math.abs(R.ny) * 7.5, cx = i.x + R.nx * R.side * d, cy = i.y + R.ny * R.side * d, c = min >= lim ? "#f97316" : this._grKCol(S.k);
    return `<g pointer-events="none"><rect x="${cx - lw / 2}" y="${cy - 7.5}" width="${lw}" height="15" rx="7.5" fill="${hell ? "#fff" : "#0b1220"}" stroke="${c}" stroke-width="1" opacity=".95"/><text x="${cx}" y="${cy + 3.5}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${c}">${esc(lab)}</text></g>`;
  }
  /* Plan-Räume an beiden Seiten einer Öffnung → passende Modul-1-Räume */
  _grKRooms(i, P) {
    const an = ((i.r || 0) * Math.PI) / 180, nx = -Math.sin(an), ny = Math.cos(an), rs = (P.items || []).filter((q) => q.t === "r" && q.fl === i.fl), M = this._collect ? this._collect() : [], out = [];
    [1, -1].forEach((sg) => { const x = i.x + nx * sg * 18, y = i.y + ny * sg * 18, r = rs.find((q) => this._sfInRoom(q, x, y)); if (r) { const m = this._gpMatch ? this._gpMatch(r, M) : null; if (m && !out.includes(m)) out.push(m); } });
    return out;
  }
  _grKUsed(P, except) { return new Set((P.items || []).filter((x) => (x.t === "d" || x.t === "f") && x.id !== except).flatMap((x) => [x.e, x.ek]).filter(Boolean)); }
  _grKSug(sel, P) {
    const used = this._grKUsed(P, sel.id), isD = sel.t === "d";
    for (const m of this._grKRooms(sel, P)) {
      const free = (m.windows || []).filter((e) => !used.has(e) && this._hass.states[e]);
      const pick = free.find((e) => (isD ? /tür|tuer|door|terrass/i : /fenster|window/i).test(`${e} ${this._wzName(e)}`)) || (free.length === 1 ? free[0] : null);
      if (pick) return { e: pick, room: m.name };
    }
    return null;
  }
  /* Seitenfeld: Kontakt-Zeile für Fenster und Türen */
  _grKProps(sel) {
    if (sel.t === "d" && sel.dg) return "";
    const P = this._sfPl(), cand = this._grKCand(sel), S = this._grKState(sel), sg = !sel.e ? this._grKSug(sel, P) : null;
    const txt = S ? { zu: "zu", offen: "offen", gekippt: "gekippt", "?": "liefert nichts" }[S.k] : "";
    const since = S && S.t ? ` seit ${new Date(S.t).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}` : "";
    const hint = sel.t === "d" ? (sel.dk === "garage" ? /garage|tor/i : /tür|tuer|door|terrass|haus/i) : /fenster|window|griff/i;
    return `<div class="sffld"><label>Kontakt aus Home Assistant (optional)</label>${cand.length || sel.e ? this._wzSel(cand, sel.e || "", "grxpk", `data-k="e"`, "– kein Kontakt –", hint) : `<div class="mut sm">Kein Fenster- oder Türkontakt in Home Assistant gefunden.</div>`}
      ${sg ? `<div class="grksug"><span><b>${esc(this._wzName(sg.e))}</b><small>${esc(sg.e)} · in Modul 1 im Raum ${esc(sg.room)}</small></span><button class="btn2 pri" data-act="grxkuse" data-v="${esc(sg.e)}">Übernehmen</button></div>` : ""}
      ${S ? `<div class="grwall ${S.k === "zu" ? "ok" : ""}" style="margin-top:6px">${ic(S.k === "zu" ? "check" : S.k === "?" ? "alert" : "windowOpen", 14)}<span>Verbunden · <b style="color:${this._grKCol(S.k) || "inherit"}">${txt}</b>${S.k === "?" ? "" : since}</span></div>` : ""}</div>
      ${sel.t === "f" && sel.e ? `<div class="sffld"><label>Zweiter Kontakt für die Kippstellung (optional)</label>${this._wzSel(cand.filter((e) => e !== sel.e), sel.ek || "", "grxpk", `data-k="ek"`, "– keiner –", /kipp|tilt/i)}<small class="mut" style="display:block;margin-top:4px">Fenstergriffe, die selbst „gekippt“ melden (z. B. Homematic, Aqara), brauchen keinen zweiten Kontakt.</small></div>` : ""}`;
  }
  /* Alte Kontakt-Elemente direkt an Fenstern oder Türen (höchstens 60 cm) */
  _grKMigList(P) {
    const sc = P.scale > 0 ? P.scale : 40, ops = (P.items || []).filter((x) => (x.t === "d" && !x.dg) || x.t === "f"), out = [], taken = new Set();
    (P.items || []).filter((x) => x.t === "h" && x.hk === "kontakt" && x.e).forEach((k) => {
      let best = null; ops.filter((o) => o.fl === k.fl && !o.e && !taken.has(o.id)).forEach((o) => { const d = Math.hypot(o.x - k.x, o.y - k.y) - (this._grHw ? this._grHw(o, sc) : 40) * 0.6; if (d <= 0.6 * sc && (!best || d < best.d)) best = { o, d }; });
      if (best) { taken.add(best.o.id); out.push({ k, o: best.o }); }
    });
    return out;
  }
  _grKMigBar() {
    const ed = this._sfEd; if (!ed || this._grKMigLater) return "";
    const L = this._grKMigList(ed.plan); if (!L.length) return "";
    const nm = (o) => o.t === "d" ? ({ glas: "Terrassentür", garage: "Garagentor" }[o.dk] || "Tür") : "Fenster";
    const rn = (o) => { const r = (ed.plan.items || []).find((q) => q.t === "r" && q.fl === o.fl && (this._sfInRoom(q, o.x + 12, o.y + 12) || this._sfInRoom(q, o.x - 12, o.y - 12))); return r && r.n ? " " + r.n : ""; };
    return `<div class="grkmig">${ic("windowOpen", 18)}<span><b>${L.length === 1 ? "1 Kontakt liegt" : L.length + " Kontakte liegen"} direkt an Fenstern oder Türen</b><small>${esc(L.slice(0, 4).map((x) => nm(x.o) + rn(x.o)).join(" · "))}${L.length > 4 ? " …" : ""}. Sie werden in das Fenster bzw. die Tür übernommen, die Symbole verschwinden.</small></span><button class="btn2 pri" data-act="grxkmig">Übernehmen</button><button class="btn2" data-act="grxkmiglater">Später</button></div>`;
  }
  /* Etage & Plan: Kontakte aus Modul 1 auf Fenster und Türen verteilen – nur wenn eindeutig */
  _grKAuto() {
    const ed = this._sfEd, P = ed.plan, used = this._grKUsed(P, ""), res = [];
    const plRooms = (P.items || []).filter((q) => q.t === "r"), M = this._collect ? this._collect() : [];
    plRooms.forEach((r) => {
      const m = this._gpMatch ? this._gpMatch(r, M) : null; if (!m) return;
      const ops = (P.items || []).filter((o) => ((o.t === "d" && !o.dg) || o.t === "f") && o.fl === r.fl && !o.e && this._grKRooms(o, P).includes(m));
      const sens = (m.windows || []).filter((e) => !used.has(e) && this._hass.states[e]);
      if (!ops.length || !sens.length) return;
      const isDoor = (e) => /tür|tuer|door|terrass/i.test(`${e} ${this._wzName(e)}`), pairs = [];
      if (ops.length === 1 && sens.length === 1) pairs.push([ops[0], sens[0]]);
      else {
        const oD = ops.filter((o) => o.t === "d"), oF = ops.filter((o) => o.t === "f"), sD = sens.filter(isDoor), sF = sens.filter((e) => !isDoor(e));
        if (oD.length === 1 && sD.length === 1) pairs.push([oD[0], sD[0]]);
        if (oF.length === 1 && sF.length === 1) pairs.push([oF[0], sF[0]]);
      }
      pairs.forEach(([o, e]) => { o.e = e; used.add(e); });
      const left = ops.length - pairs.length;
      res.push({ room: r.n || m.name, n: pairs.length, open: left > 0 && sens.length > pairs.length ? left : 0 });
    });
    return res;
  }
  _grKAct(a, b) {
    const ed = this._sfEd, v = b && b.dataset ? b.dataset.v : "";
    if (a === "grxkmiglater") { this._grKMigLater = true; this._render(); return true; }
    if (!ed) return false;
    if (a === "grxkmig") {
      const L = this._grKMigList(ed.plan); if (!L.length) return true;
      this._sfSnap(); const drop = new Set(L.map((x) => x.k.id));
      L.forEach(({ k, o }) => { o.e = k.e; });
      ed.plan.items = ed.plan.items.filter((x) => !drop.has(x.id)); if (drop.has(ed.sel)) ed.sel = "";
      this._toast(`${L.length} ${L.length === 1 ? "Kontakt" : "Kontakte"} übernommen – Speichern nicht vergessen`); this._render(); return true;
    }
    if (a === "grxkauto") {
      this._sfSnap(); const R = this._grKAuto(), n = R.reduce((s, x) => s + x.n, 0), open = R.filter((x) => x.open);
      this._grKRes = R; this._toast(n ? `${n} ${n === 1 ? "Kontakt" : "Kontakte"} zugeordnet${open.length ? ` · offen: ${open.map((x) => x.room).join(", ")}` : ""}` : open.length ? `Nicht eindeutig: ${open.map((x) => x.room).join(", ")} – bitte am Fenster wählen` : "Nichts zuzuordnen – Räume in Modul 1 und im Plan gleich benennen");
      this._render(); return true;
    }
    const cur = (ed.plan.items || []).find((x) => x.id === ed.sel); if (!cur || (cur.t !== "d" && cur.t !== "f")) return false;
    if (a === "grxkuse") { this._sfSnap(); cur.e = v; this._render(); return true; }
    return false;
  }
  _grKAutoBox() {
    const R = this._grKRes;
    return `<div class="sffld"><label>Fenster- und Türkontakte</label><div class="mut sm" style="margin-bottom:6px">Verteilt die Fensterkontakte aus Modul 1 auf die Fenster und Türen im Plan – Raum für Raum, nur wenn es eindeutig ist.</div><button class="btn2" data-act="grxkauto" style="flex:none">${ic("windowOpen", 15)} Kontakte aus Modul 1 zuordnen</button>
      ${R && R.length ? `<div class="grkres">${R.map((x) => `<div><span>${esc(x.room)}</span><b>${x.n ? x.n + " zugeordnet" : ""}${x.open ? `${x.n ? " · " : ""}${x.open} offen` : ""}${!x.n && !x.open ? "nichts frei" : ""}</b></div>`).join("")}</div>` : ""}</div>`;
  }
