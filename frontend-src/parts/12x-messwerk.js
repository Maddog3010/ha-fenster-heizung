  /* ================= Messwerk (M1): alle Sensoren der Module 1–19 an einer Stelle, „genutzt in“ ================= */
  _mwLoad(force) {
    if (!this._hass || this._mwBusy) return;
    if (!force && this._mwD && Date.now() - this._mwTs < 20000) return;
    this._mwBusy = true;
    this._hass.callWS({ type: "fenster_heizung/mw_get" }).then((r) => { this._mwD = r && r.ready ? r : null; this._mwTs = Date.now(); })
      .catch(() => { this._mwD = null; this._mwTs = Date.now(); })
      .finally(() => { this._mwBusy = false; if (this._stOpen) this._render(); if (this._modal && this._modal.type === "mwdet") this._renderModal(); });
  }
  _mwMod(m) { return m === 0 ? "Allgemein" : `Modul ${m}`; }
  _mwModName(m) { const x = MODS.find((y) => y.n === m) || [MOD_MU, MOD_LI].find((y) => y && y.n === m); return m === 0 ? "Start, Tablet, Personen, Labs" : x ? x.name : ((this._mwD || {}).mods || {})[m] || ""; }
  _mwVal(eid) {
    const s = eid && this._hass.states[eid]; if (!s) return "fehlt";
    if (["unavailable", "unknown"].includes(String(s.state))) return "kein Wert";
    const u = (s.attributes || {}).unit_of_measurement || "", v = parseFloat(s.state), dom = eid.split(".")[0];
    if (dom === "binary_sensor") return { on: "an", off: "aus" }[s.state] || s.state;
    if (dom === "climate") return s.attributes.current_temperature != null ? `${num(s.attributes.current_temperature, 1)} °C` : s.state;
    if (dom === "weather") return (WX[s.state] || ["", s.state])[1];
    return isFinite(v) && /^-?[\d.]+$/.test(String(s.state)) ? `${num(v, Math.abs(v) >= 100 || u === "%" ? 0 : Math.abs(v) < 1 && v !== 0 ? 2 : 1)}${u ? " " + u : ""}` : String(s.state).slice(0, 18);
  }
  _mwChips(uses) { const ms = [...new Set((uses || []).map((u) => u.m))].sort((a, b) => a - b); return `<span class="mwms">${ms.map((m) => `<i class="${(uses.find((u) => u.m === m) || {}).on === false ? "off" : ""}" title="${esc(this._mwMod(m) + " " + this._mwModName(m))}">${m === 0 ? "A" : m}</i>`).join("")}</span>`; }
  _mwIcon(g) { return { strom: "bolt", klima: "thermo", fenster: "window", wetter: "partly", wasser: "boiler", geraete: "laundry", auto: "car", sicher: "shield", alltag: "month", person: "users", sonst: "tablet" }[g] || "info"; }
  _mwPage(card) {
    this._mwLoad();
    const D = this._mwD;
    if (!D) return card(`<div class="stck"><span class="stdot in"></span><span class="sxt"><b>Messwerk wird geladen …</b><small>Alle Sensoren aller Module werden gesammelt.</small></span></div>`);
    const S = D.stats, G = D.groups, f = this._mwG || "", only = !!this._mwBad;
    const by = {}; D.tasks.forEach((t) => (by[t.g] = by[t.g] || []).push(t));
    const order = Object.keys(G).filter((g) => by[g]);
    const list = D.tasks.filter((t) => (!f || t.g === f) && (!only || t.st !== "ok"));
    const stc = { ok: "", dead: "bad", missing: "bad", unit: "wa" };
    const rows = (ts) => ts.map((t) => `<button class="sxrow mwr" data-act="mdmwd" data-k="${esc(t.id)}"><span class="sxi">${ic(this._mwIcon(t.g), 18)}</span><span class="sxt"><b>${esc(t.n)}</b><small>${esc(t.ents.map((e) => this._wzName(e)).join(", "))} · ${esc(t.where)}</small></span><em class="hsv ${stc[t.st] || ""}">${esc(t.st === "ok" ? this._mwVal(t.ents[0]) : t.chk.find((c) => c.st !== "ok").txt)}</em>${this._mwChips(t.uses)}<span class="sxg">${ic("chev", 16)}</span></button>`).join("");
    const groups = (f ? [f] : order).map((g) => { const ts = list.filter((t) => t.g === g); return ts.length ? card(rows(ts), `${esc(G[g])} <small>· ${ts.length}</small>`) : ""; }).join("");
    const hints = (D.hints || []).length ? card(D.hints.map((h) => `<${h.go ? `button class="stck" data-act="mdmwgo" data-k="${esc(h.go)}"` : 'div class="stck"'}><span class="stdot ${h.lvl || "wn"}"></span><span class="sxt"><b>${esc(h.t)}</b><small>${esc(h.x)}</small></span>${h.go ? `<span class="stgo">Ansehen ${ic("chev", 14)}</span>` : ""}</${h.go ? "button" : "div"}>`).join(""), "Hinweise des Messwerks") : "";
    return `<div class="hsuse">Jeder Sensor, der in einem Modul eingestellt ist, mit Aufgabe, Live-Wert und den Modulen, die ihn nutzen · <em class="stlv l1">🏠 für alle</em></div>
      <div class="sxsum"><div><b>${S.sensors}</b><span>Sensoren</span></div><div><b>${S.ok}</b><span>liefern</span></div><div><b class="${S.bad ? "wa" : ""}">${S.bad}</b><span>${S.bad === 1 ? "Aufgabe mit Problem" : "Aufgaben mit Problem"}</span></div><div><b>${S.mods}</b><span>Module versorgt</span></div></div>
      ${hints}
      <div class="chips mwf"><button class="chip ${!f && !only ? "sel" : ""}" data-act="mdmwg" data-k="">Alle ${D.tasks.length}</button>${S.bad ? `<button class="chip ${only ? "sel" : ""} wa" data-act="mdmwbad">⚠ Probleme ${S.bad}</button>` : ""}${order.map((g) => `<button class="chip ${f === g ? "sel" : ""}" data-act="mdmwg" data-k="${g}">${esc(G[g])} ${by[g].length}</button>`).join("")}</div>
      ${groups || card(`<div class="stck"><span class="stdot ok"></span><span class="sxt"><b>Keine Probleme</b><small>Alle Sensoren liefern Werte.</small></span></div>`)}
      <div class="stleg">Die Zahlen rechts sind die Module, die den Sensor nutzen (A = Allgemein: Start, Tablet, Personen, Labs). Grau = Modul ist aus. Eingestellt wird in M1 noch an der genannten Stelle, Zuordnen und Tauschen direkt im Messwerk folgen.</div>`;
  }
  _mwDetModal() {
    const D = this._mwD || { tasks: [], sensors: {} }, t = D.tasks.find((x) => x.id === (this._modal || {}).k);
    if (!t) return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Messwerk</b></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div><div class="mut">Nicht gefunden.</div></div>`;
    const ago = (ts) => { if (!ts) return "noch nie"; const m = Math.round((Date.now() / 1000 - ts) / 60); return m < 2 ? "gerade eben" : m < 60 ? `vor ${m} Min.` : m < 1440 ? `vor ${Math.round(m / 60)} Std.` : `vor ${Math.round(m / 1440)} Tagen`; };
    const sens = t.ents.map((e, i) => { const c = t.chk[i] || {}, s = D.sensors[e] || { uses: [], tasks: [] }, other = s.tasks.filter((x) => x !== t.id).map((x) => (D.tasks.find((y) => y.id === x) || {}).n).filter(Boolean);
      return `<div class="mwsen"><div class="sxrow stinfo hsr"><span class="sxi">${ic(this._mwIcon(t.g), 20)}</span><span class="sxt"><b>${esc(this._wzName(e))}</b><small>${esc(e)}${c.unit ? " · " + esc(c.unit) : ""}</small></span><em class="hsv ${c.st === "ok" ? "" : c.st === "unit" ? "wa" : "bad"}">${esc(c.st === "ok" ? this._mwVal(e) : c.txt)}</em></div>
        <div class="stck"><span class="stdot ${c.st === "ok" ? "ok" : "wn"}"></span><span class="sxt"><b>Prüfung: ${esc(c.txt || "")}</b><small>zuletzt mit Wert ${ago(t.since[i])}${other.length ? ` · auch Aufgabe: ${esc(other.join(", "))}` : ""}</small></span></div></div>`; }).join("");
    const all = [...new Map(t.ents.flatMap((e) => (D.sensors[e] || { uses: [] }).uses).map((u) => [u.m + "|" + u.why, u])).values()].sort((a, b) => a.m - b.m);
    const nm = new Set(all.map((u) => u.m)).size;
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Messwerk › ${esc(t.n)}</b><span>${esc((D.groups || {})[t.g] || "")} · 🏠 für alle</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mwbox">${sens}</div>
      <div class="lsec">${ic("layers", 15)}Genutzt in ${nm} ${nm === 1 ? "Modul" : "Modulen"}</div>
      <div class="mwbox">${all.map((u) => `<div class="sxrow stinfo mwu ${u.on === false ? "off" : ""}"><span class="mwn">${u.m === 0 ? "A" : u.m}</span><span class="sxt"><b>${esc(this._mwMod(u.m))} ${esc(this._mwModName(u.m))}${u.on === false ? " · aus" : ""}</b><small>${esc(u.why)}</small></span></div>`).join("")}</div>
      <div class="lsec">${ic("pencil", 15)}Eingestellt in</div>
      <div class="mwbox"><button class="sxrow hslink" data-act="mdmwgo" data-k="${esc(t.go)}"><span class="sxi">${ic("sliders", 20)}</span><span class="sxt"><b>${esc(t.where)}</b><small>Dort ändern · gilt danach für alle oben genannten Module</small></span><span class="sxg">${ic("chev", 16)}</span></button></div>
      <div class="gst">${ic("info", 15)}<span>Ab der nächsten Stufe (M2) ordnest du Sensoren direkt hier zu und tauschst sie für alle Module auf einmal.</span></div>
      <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _mwGo(go) {
    const [k, v] = String(go || "").split(":"); const b = document.createElement("button"); b.dataset.k = "";
    this._modal = null; this._renderModal();
    if (k === "hs") { this._stOpen = true; this._stA = "hs"; this._stS = v; this._render(); return; }
    if (k === "room") { this._optOpen(v); return; }
    if (k === "mess") { this._msOpen(v); return; }
    if (k === "mod") { const m = { mu: "muxopen", li: "lixopen" }[v] || (MOD_SET[v] || {}).act; if (m) this._act(m, b); return; }
    const a = { diag: "diag", lfx: "lfxset", tgx: "tgxopen", tm: "tmopen", ort: "ortopen", hz: "hzopen" }[k]; if (a) this._act(a, b);
  }
  /* Suche: Sensoren nach Name oder ID */
  _mwFind(q) {
    const D = this._mwD; if (!D || !q) return [];
    const w = this._stNorm(q).split(/\s+/).filter(Boolean);
    return D.tasks.filter((t) => { const all = this._stNorm(`${t.n} ${t.ents.join(" ")} ${t.ents.map((e) => this._wzName(e)).join(" ")}`); return w.every((x) => all.includes(x)); }).slice(0, 8);
  }
  _mwChecks() {
    const D = this._mwD; if (!D) return [];
    const bad = D.tasks.filter((t) => t.st !== "ok"), out = [];
    if (bad.length) out.push(["wn", `Messwerk: ${bad.length === 1 ? "1 Sensor hat" : bad.length + " Sensoren haben"} ein Problem`, bad.slice(0, 3).map((t) => esc(`${t.n} (${t.chk.find((c) => c.st !== "ok").txt})`)).join(", ") + (bad.length > 3 ? " …" : ""), "mdmwopen", "bad"]);
    (D.hints || []).filter((h) => h.lvl !== "in").forEach((h) => out.push(["wn", esc(h.t), esc(h.x), "mdmwgo", h.go]));
    return out;
  }
