  /* ================= Tablet-Modus (3.0.2.12) =================
     Eine eigene Oberfläche für Wandtablets: große Bedienflächen, untere Knopfleiste, Ruhemodus, PIN für die Einstellungen.
     Was zum Gerät gehört (an/aus, Kennung) liegt im Browser, alles andere pro Tablet im Home Assistant (tablet.py). */
  _tmId() {
    try {
      let i = localStorage.getItem("fh_tm_id");
      if (!/^[a-z0-9]{6,20}$/.test(i || "")) { i = Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => (b % 36).toString(36)).join(""); localStorage.setItem("fh_tm_id", i); }
      return i;
    } catch (_) { return this._tmMem || (this._tmMem = Math.random().toString(36).slice(2, 10).padEnd(8, "x")); }
  }
  _tmKind() {
    const ua = navigator.userAgent || "", fully = /FullyKiosk|Fully\//i.test(ua) || !!window.fully, app = /HomeAssistant/i.test(ua);
    const os = /Silk|KFA|KFT|Fire/i.test(ua) ? "Fire OS" : /Android/i.test(ua) ? "Android" : /iPad|iPhone/i.test(ua) || (/Mac/i.test(ua) && navigator.maxTouchPoints > 1) ? "iPadOS/iOS" : "";
    return { kind: fully ? "fully" : app ? "app" : "browser", label: (fully ? "Fully Kiosk" : app ? "Home-Assistant-App" : "Browser") + (os ? " auf " + os : "") };
  }
  _tmTouch() { try { return window.matchMedia("(pointer:coarse)").matches; } catch (_) { return false; } }
  _tmMode() {
    if (!this._tmUrl) {
      this._tmUrl = true;
      try { const q = new URLSearchParams(location.search).get("tablet"); if (q === "1" || q === "0") localStorage.setItem("fh_tm_mode", q === "1" ? "on" : "off"); } catch (_) { /* kein Zugriff */ }
    }
    try { const m = localStorage.getItem("fh_tm_mode"); return m === "on" || m === "auto" ? m : "off"; } catch (_) { return "off"; }
  }
  _tmModeSet(m) { try { localStorage.setItem("fh_tm_mode", m); } catch (_) { /* privater Modus */ } this._tmSleep = false; this._tmLast = Date.now(); }
  _tmOn() { const m = this._tmMode(); return m === "on" || (m === "auto" && this._tmTouch() && window.innerWidth >= 600); }
  _tmMe() { const id = this._tmId(), t = ((this._tm && this._tm.tablets) || []).find((x) => x.id === id); return t || { id, name: "Tablet", has_pin: false, cfg: {} }; }
  _tmC() { return { size: "auto", idle_home: 2, sleep: 15, wake_warn: true, motion: "", screen: "", notify: "", off_after: 0, dock_hide: [], ...(this._tmMe().cfg || {}) }; }
  async _tmLoad() {
    if (this._tmBound !== true) { this._tmBound = true; this._tmBind(); }
    const k = this._tmKind();
    try { this._tm = await this._hass.callWS({ type: "fenster_heizung/tm_hello", tid: this._tmId(), name: k.kind === "fully" ? "Fully-Tablet" : "Tablet", kind: k.kind, size: `${window.innerWidth}x${window.innerHeight}` }); } catch (_) { this._tm = this._tm || { tablets: [] }; }
  }
  _tmBind() {
    this._tmLast = Date.now();
    const act = (e) => {
      this._tmLast = Date.now(); this._tmHomed = false;
      if (this._tmSleep) { e.stopPropagation(); e.preventDefault(); this._tmGuard = Date.now() + 500; this._tmWake(); }
    };
    ["pointerdown", "touchstart", "keydown"].forEach((ev) => this.addEventListener(ev, act, { capture: true, passive: false }));
    this.addEventListener("click", (e) => { if (this._tmSleep || Date.now() < (this._tmGuard || 0)) { e.stopPropagation(); e.preventDefault(); } }, true);
  }
  _tmWake() { this._tmSleep = false; this._tmLast = Date.now(); this._tmHomed = false; this._render(); }
  _tmWarnKey() { try { return this._hzHints().filter((h) => h.c === "bad").map((h) => h.t).join("|"); } catch (_) { return ""; } }
  _tmTick() {
    if (!this._hass || !this._tmOn()) return;
    const sr = this.shadowRoot, c = this._tmC(), d = new Date(), idle = Date.now() - (this._tmLast || Date.now());
    sr.querySelectorAll("[data-tmclk]").forEach((e) => { e.textContent = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }); });
    sr.querySelectorAll("[data-tmdate]").forEach((e) => { e.textContent = d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" }); });
    const mo = c.motion && this._hass.states[c.motion] ? this._hass.states[c.motion].state : "";
    const moved = mo === "on" && this._tmMo !== "on"; this._tmMo = mo;
    const wk = c.wake_warn ? this._tmWarnKey() : "", newWarn = wk && wk !== this._tmWk; this._tmWk = wk;
    if (this._tmSleep) { if (moved || newWarn) this._tmWake(); return; }
    if (newWarn && !this._modal) { this._tmView = "st"; this._tmLast = Date.now(); this._render(); return; }
    if (c.sleep && idle >= c.sleep * 60000) { this._tmSleep = true; this._modal = null; this._renderModal(); this._render(); return; }
    if (c.idle_home && idle >= c.idle_home * 60000 && !this._tmHomed) { this._tmHomed = true; if (this._tmV() !== "st" && !this._modal) { this._tmView = "st"; this._render(); } }
  }
  _tmV() { return this._tmView || "st"; }
  _tmItems() {
    const hide = this._tmC().dock_hide, mods = this._mdList().filter((m) => m.id !== "st").map((m) => ({ id: m.id, name: m.short || m.name, icon: m.icon }));
    return [{ id: "st", name: "Start", icon: "home" }, ...mods].filter((x) => x.id === "st" || !hide.includes(x.id));
  }
  _tmDock() {
    const all = this._tmItems(), w = window.innerWidth, max = w < 600 ? 4 : w < 1000 ? 5 : 7, v = this._tmV();
    let vis = all, more = [];
    if (all.length > max) { vis = all.slice(0, max - 1); more = all.slice(max - 1); const cur = more.find((x) => x.id === v); if (cur) { more = more.filter((x) => x !== cur); more.unshift(vis.pop()); vis.push(cur); } }
    const bad = this._wwProblems && this._mdState().on.ww && this._wwProblems().some((p) => p[0] === "bad" || p[0] === "warn");
    return `<nav class="tmdock" aria-label="Module">${vis.map((x) => `<button class="tmdk ${v === x.id ? "sel" : ""}" data-act="tmgo" data-k="${x.id}" aria-pressed="${v === x.id}">${ic(x.icon, 28)}<span>${esc(x.name)}</span>${x.id === "ww" && bad ? `<i class="tmdot"></i>` : ""}</button>`).join("")}${more.length ? `<button class="tmdk" data-act="tmmore">${ic("sliders", 28)}<span>Mehr</span></button>` : ""}</nav>`;
  }
  _tmBody(id) {
    const m = this._mdList().find((x) => x.id === id);
    if (id === "st" || !m) return this._tmStart();
    if (id === "fh") return this._tmHeiz();
    if (id === "ww") { this._wwLoad(); return this._wwPage(); }
    if (id === "gs") return this._gsPage();
    if (id === "mu") return this._muPage();
    if (id === "li") return this._liPage();
    if (m.beta) return this._betaPage(id);
    if (id === "en") return this._enPage();
    return `<div class="card empty">${ic("puzzle", 36)}<div style="margin:10px 0 4px;font-weight:700">${esc(m.name)}</div>Dieses Modul gibt es im Tablet-Modus noch nicht.</div>`;
  }
  _tmStart() {
    const hints = this._hzHints(), mods = this._mdList().filter((x) => x.id !== "st"), bubs = this._labOn("sb") ? this._hzBubs().replace(/data-act="hzbub"/g, 'data-act="tmbub"') : "";
    const rows = hints.slice(0, 3).map((h) => `<div class="tmhint ${h.c || ""}"><span class="tmhi">${ic(ICONS[h.i] ? h.i : "info", 20)}</span><span><b>${h.t}</b>${h.s ? `<small>${h.s}</small>` : ""}</span></div>`).join("");
    return `${bubs}<div class="tmgrid">${mods.map((m) => this._hzTile(m).replace('data-act="hzgo"', 'data-act="tmgo"')).join("")}</div>${rows ? `<div class="tmhints">${rows}</div>` : ""}`;
  }
  _tmRoom(r) {
    const st = this._hass.states, cl = (r.thermos || []).map((e) => st[e]).filter(Boolean), A = (cl[0] && cl[0].attributes) || {};
    const cur = cl.map((x) => parseFloat(x.attributes.current_temperature)).filter(isFinite), ist = cur.length ? cur.reduce((a, b) => a + b, 0) / cur.length : NaN;
    const o = (this._tmTgt || {})[r.id], tg = o && Date.now() < o.until ? o.v : parseFloat(A.temperature), paused = r.mode === "heizung_pausiert", off = r.mode === "regelung_aus";
    const sub = paused ? "Fenster offen, Heizung pausiert" : off ? "Regelung aus" : isFinite(ist) ? `Ist ${num(ist, 1)} °C` : "Kein Messwert";
    const can = cl.length && isFinite(tg) && !paused;
    return `<div class="tmroom ${paused ? "wa" : ""}"><div class="tmrt"><span class="hti">${ic(paused ? "windowOpen" : this._icon(r), 26)}</span><b>${esc(r.name)}</b></div><div class="tmrs">${sub}</div>
      <div class="tmpm"><button class="tmb2" data-act="tmt" data-id="${esc(r.id)}" data-d="-1" ${can ? "" : "disabled"} aria-label="kälter">${ic("minus", 26)}</button><div class="tmv">${isFinite(tg) ? num(tg, 1) : "–"}<small> °C</small></div><button class="tmb2" data-act="tmt" data-id="${esc(r.id)}" data-d="1" ${can ? "" : "disabled"} aria-label="wärmer">${ic("plus", 26)}</button></div></div>`;
  }
  _tmHeiz() {
    const rooms = this._collect();
    return rooms.length ? `<div class="tmrooms">${rooms.map((r) => this._tmRoom(r)).join("")}</div>` : `<div class="card empty">Noch keine Räume eingerichtet.</div>`;
  }
  _tmSleepHtml() {
    const facts = ["wetter", "alarm", "personen", "muell"].map((id) => this._hzBubDef(id)).filter((x) => x && x.i).map((x) => `<div>${ic(x.i, 26)}<span>${esc(x.b)}${x.s ? ` · ${esc(x.s)}` : ""}</span></div>`).join("");
    return `<div class="tmrest"><div class="tmrc ${this._spnEarlyClock()}" data-tmclk>${new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</div><div class="tmrd" data-tmdate>${new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</div><div class="tmrf">${facts}</div><div class="tmrw">Antippen zum Aufwecken</div></div>`;
  }
  _tmRender() {
    const sr = this.shadowRoot, v = this._mdList().some((m) => m.id === this._tmV()) || this._tmV() === "st" ? this._tmV() : "st", m = this._mdList().find((x) => x.id === v), c = this._tmC(), me = this._tmMe();
    this._w = this.clientWidth; this._tmView = v;
    if (this._tmSleep) { sr.getElementById("main").innerHTML = this._tmSleepHtml(); return; }
    const sc = { auto: 1, large: 1.15, xl: 1.3 }[c.size] || 1, title = v === "st" ? this._hzGreet().split(" · ")[0] : esc(m ? m.name : ""), hints = v === "st" ? this._hzHints().length : 0;
    const sub = v === "st" ? (hints ? `${hints} ${hints === 1 ? "Hinweis" : "Hinweise"}` : "Alles in Ordnung") : esc(m ? m.tag || "" : "");
    const x = sr.querySelector(".tmbody"), keep = x && this._tmVOld === v ? x.scrollTop : 0; this._tmVOld = v;
    sr.getElementById("main").innerHTML = `<div class="tmw"><header class="tmh"><img class="blogo" src="${LOGO_URL}" alt="" draggable="false"><div class="tmht"><b>${title}</b><span>${sub}</span></div>
      <div class="tmclk"><span data-tmclk>${new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</span><small data-tmdate>${new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</small></div>
      <button class="tmgear" data-act="tmlock" aria-label="${me.has_pin ? "Einstellungen (PIN)" : "Einstellungen"}">${ic(me.has_pin ? "lock" : "sliders", 22)}</button></header>
      <div class="tmbody" style="zoom:${sc}">${this._tmBody(v)}</div>${this._tmDock()}</div>`;
    const nb = sr.querySelector(".tmbody"); if (nb && keep) nb.scrollTop = keep;
  }
  /* Hinweis und Knopf in der normalen Ansicht */
  _tmBtn() { return window.innerWidth >= 600 ? `<button class="pillbtn" data-act="tmopen" aria-label="Tablet-Modus">${ic("tablet", 16)}<span class="bl">Tablet-Modus</span></button>` : ""; }
  _tmHint() {
    let no = false; try { no = localStorage.getItem("fh_tm_nohint") === "1"; } catch (_) { /* egal */ }
    if (no || this._tmHintHide || this._tmMode() !== "off" || !this._tmTouch() || window.innerWidth < 600) return "";
    return `<div class="tmbn">${ic("tablet", 26)}<div class="tmbt"><b>Dieses Gerät sieht aus wie ein Tablet.</b><span>Tablet-Modus einschalten? Große Bedienflächen, untere Leiste, Ruhemodus.</span></div><button class="pillbtn pri" data-act="tmstart">Einschalten</button><button class="pillbtn" data-act="tmno">Nicht mehr fragen</button></div>`;
  }
  /* Einstellungen speichern */
  _tmSave(patch, name) {
    const me = this._tmMe(), cfg = { ...this._tmC(), ...patch };
    if (!this._tm) this._tm = { tablets: [] };
    const i = this._tm.tablets.findIndex((x) => x.id === me.id), row = { ...me, cfg, ...(name != null ? { name } : {}) };
    if (i >= 0) this._tm.tablets[i] = row; else this._tm.tablets.push(row);
    this._hass.callWS({ type: "fenster_heizung/tm_set", tid: me.id, cfg, ...(name != null ? { name } : {}), ...(this._tmPin ? { pin: this._tmPin } : {}) })
      .then((r) => { if (r && r.tablets) this._tm = { tablets: r.tablets }; })
      .catch(() => this._toast("Das ging nicht. Ist die PIN noch gültig?"));
    this._renderModal(); this._render();
  }
  _tmAdminList() {
    this._hass.callWS({ type: "fenster_heizung/tm_get" }).then((r) => { this._tm = r; if (this._modal && this._modal.type === "tmnorm") this._renderModal(); }).catch(() => {});
  }
  _tmLocked() { const me = this._tmMe(); return me.has_pin && !this._tmPin && !this._admin(); }
  /* Tastenfeld */
  _tmPinOpen(mode, then) { this._tmPinThen = then || this._tmPinThen || ""; this._modal = { type: "tmpin", mode, buf: "", first: "", err: "" }; this._renderModal(); }
  async _tmKeyDone() {
    const m = this._modal, me = this._tmMe(), pin = m.buf; m.buf = "";
    if (m.mode === "unlock" || m.mode === "chgold") {
      let r; try { r = await this._hass.callWS({ type: "fenster_heizung/tm_check", tid: me.id, pin }); } catch (_) { r = { ok: false, error: "x" }; }
      if (!this._modal || this._modal.type !== "tmpin") return;
      if (r.ok) { this._tmPin = pin; if (m.mode === "chgold") { this._tmPinOpen("new"); return; } this._tmAfterPin(); return; }
      this._modal.err = r.error === "locked" ? `Zu viele Versuche. Bitte ${r.wait} Sekunden warten.` : r.error === "wrong" ? `PIN falsch, noch ${r.left} ${r.left === 1 ? "Versuch" : "Versuche"}.` : "Das hat nicht geklappt."; this._renderModal(); return;
    }
    if (m.mode === "new") { m.first = pin; m.mode = "new2"; m.err = ""; this._renderModal(); return; }
    if (m.mode === "new2") {
      if (pin !== m.first) { m.mode = "new"; m.first = ""; m.err = "Die beiden PINs waren verschieden. Bitte neu festlegen."; this._renderModal(); return; }
      let r; try { r = await this._hass.callWS({ type: "fenster_heizung/tm_pin", tid: me.id, pin, ...(this._tmPin ? { old: this._tmPin } : {}) }); } catch (_) { r = { ok: false }; }
      if (!r || !r.ok) { this._modal = null; this._renderModal(); this._toast("PIN konnte nicht gespeichert werden"); return; }
      this._tmPin = pin; await this._tmLoad(); this._toast("PIN gespeichert"); this._tmAfterPin(true); return;
    }
  }
  _tmAfterPin(fresh) {
    const then = this._tmPinThen; this._tmPinThen = "";
    if (then === "start") { this._tmModeSet("on"); this._tmView = "st"; this._modal = null; this._renderModal(); this._render(); return; }
    this._modal = { type: this._tmOn() ? "tmset" : "tmnorm" }; this._renderModal(); if (this._modal.type === "tmnorm" && this._admin()) this._tmAdminList();
    if (fresh) this._render();
  }
  _tmStartNow() { const me = this._tmMe(); if (!me.has_pin) { this._tmPinOpen("new", "start"); return; } this._tmModeSet("on"); this._tmView = "st"; this._modal = null; this._renderModal(); this._render(); }
  _tmAct(a, b) {
    const k = b.dataset.k, m = this._modal;
    if (a === "tmgo") { this._tmView = k; this._tmHomed = false; this._render(); }
    else if (a === "tmbub") { const d = this._hzBubDef(k) || {}; if (d.mod && this._mdList().some((x) => x.id === d.mod)) { this._tmView = d.mod; this._render(); } }
    else if (a === "tmgomore") { this._tmView = k; this._tmHomed = false; this._modal = null; this._renderModal(); this._render(); }
    else if (a === "tmmore") { this._modal = { type: "tmmore" }; this._renderModal(); }
    else if (a === "tmlock") { this._tmPin = ""; const me = this._tmMe(); if (me.has_pin) this._tmPinOpen("unlock"); else this._tmPinOpen("new"); }
    else if (a === "tmopen") { this._modal = { type: "tmnorm" }; this._renderModal(); if (this._admin()) this._tmAdminList(); }
    else if (a === "tmstart") this._tmStartNow();
    else if (a === "tmno") { try { localStorage.setItem("fh_tm_nohint", "1"); } catch (_) { /* egal */ } this._tmHintHide = true; this._render(); }
    else if (a === "tmkey") {
      if (!m || m.type !== "tmpin") return; if (k === "back") m.buf = m.buf.slice(0, -1); else if (m.buf.length < 6) m.buf += k;
      m.err = m.buf.length ? "" : m.err; this._renderModal(); if (m.buf.length === 6) this._tmKeyDone();
    }
    else if (a === "tmpinx") { this._tmPinThen = ""; this._modal = null; this._renderModal(); }
    else if (a === "tmdone") { this._tmPin = ""; this._modal = null; this._renderModal(); this._render(); }
    else if (a === "tmmode") { this._tmModeSet(k); this._renderModal(); this._render(); }
    else if (a === "tmend") { this._tmModeSet("off"); this._tmPin = ""; this._modal = { type: "tmnorm" }; this._renderModal(); this._render(); }
    else if (a === "tmunl") { this._tmPinOpen("unlock"); }
    else if (a === "tmchg") { this._tmPinOpen(this._tmPin || this._admin() || !this._tmMe().has_pin ? "new" : "chgold"); }
    else if (a === "tmsz") this._tmSave({ size: k });
    else if (a === "tmih") this._tmSave({ idle_home: +k });
    else if (a === "tmsl") this._tmSave({ sleep: +k });
    else if (a === "tmoff") this._tmSave({ off_after: +k });
    else if (a === "tmww") this._tmSave({ wake_warn: !this._tmC().wake_warn });
    else if (a === "tmdock") { const h = this._tmC().dock_hide, n = h.includes(k) ? h.filter((x) => x !== k) : [...h, k]; this._tmSave({ dock_hide: n }); }
    else if (a === "tmcopy") { const u = this._tmUrlStr(); this._clip(u, "Link kopiert"); }
    else if (a === "tmreset") { this._hass.callWS({ type: "fenster_heizung/tm_reset", tid: b.dataset.id }).then((r) => { this._tm = r; this._toast("PIN zurückgesetzt"); this._renderModal(); }).catch(() => this._toast("Das ging nicht")); }
    else if (a === "tmdel") { this._hass.callWS({ type: "fenster_heizung/tm_del", tid: b.dataset.id }).then((r) => { this._tm = r; this._renderModal(); }).catch(() => this._toast("Das ging nicht")); }
    else if (a === "tmt") {
      const r = this._collect().find((x) => x.id === b.dataset.id); if (!r) return; const st = this._hass.states, cl = (r.thermos || []).filter((e) => st[e]), A = (cl[0] && st[cl[0]].attributes) || {};
      const o = (this._tmTgt = this._tmTgt || {})[r.id], cur = o && Date.now() < o.until ? o.v : parseFloat(A.temperature); if (!isFinite(cur)) return;
      const step = parseFloat(A.target_temp_step) || 0.5, lo = isFinite(parseFloat(A.min_temp)) ? parseFloat(A.min_temp) : 5, hi = isFinite(parseFloat(A.max_temp)) ? parseFloat(A.max_temp) : 30;
      const v = Math.min(hi, Math.max(lo, Math.round((cur + (+b.dataset.d) * step) / step) * step));
      this._tmTgt[r.id] = { v, until: Date.now() + 8000 }; this._render(); clearTimeout(this._tmTT);
      this._tmTT = setTimeout(() => { cl.forEach((e) => this._hass.callService("climate", "set_temperature", { entity_id: e, temperature: v }).catch(() => this._toast("Temperatur konnte nicht gesetzt werden"))); }, 600);
    }
  }
  _tmChange(t) {
    const f = t.dataset.f;
    if (f === "tmname") { this._tmSave({}, String(t.value || "").trim().slice(0, 24) || "Tablet"); return true; }
    if (f === "tmsel") { const k = t.dataset.k; this._tmPkOpen = false; this._tmSave({ [k]: t.value || "" }); return true; }
    if (f === "tmnot") { this._tmSave({ notify: String(t.value || "").trim().replace(/^notify\./, "") }); return true; }
    return false;
  }
  _tmUrlStr() { try { return `${location.origin}${location.pathname}?tablet=1`; } catch (_) { return "?tablet=1"; } }
  _tmModal() {
    const m = this._modal, st = this._hass.states;
    const close = `<button class="ibtn" data-act="${m.type === "tmpin" ? "tmpinx" : "close"}" aria-label="Schließen">${ic("close", 20)}</button>`;
    if (m.type === "tmpin") {
      const T = { unlock: ["PIN eingeben", "Einstellungen des Tablet-Modus"], chgold: ["Aktuelle PIN", "Zuerst die bisherige PIN eingeben"], new: ["PIN festlegen", "Schritt 1 von 2: neue PIN mit 6 Ziffern"], new2: ["PIN wiederholen", "Schritt 2 von 2: dieselbe PIN noch einmal"] }[m.mode];
      const dots = Array.from({ length: 6 }, (_, i) => `<i class="${i < m.buf.length ? "f" : ""}"></i>`).join("");
      const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-act="tmkey" data-k="${n}" aria-label="${n}">${n}</button>`).join("");
      return `<div class="ov" data-act="tmpinx"></div><div class="sheet tmpad" role="dialog" aria-modal="true"><div class="sh"><div><b>${T[0]}</b><span>${T[1]}</span></div>${close}</div>
        <div class="tmdots">${dots}</div><div class="tmerr" role="alert">${esc(m.err || "")}</div>
        <div class="tmkeys">${keys}<button class="z" data-act="tmpinx">Abbrechen</button><button data-act="tmkey" data-k="0" aria-label="0">0</button><button class="z" data-act="tmkey" data-k="back" aria-label="Löschen">⌫</button></div></div>`;
    }
    if (m.type === "tmmore") {
      const rest = this._tmItems();
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Weitere Module</b><span>Tablet-Modus</span></div>${close}</div>
        <div class="tmmore">${rest.map((x) => `<button class="tmdk ${this._tmV() === x.id ? "sel" : ""}" data-act="tmgo" data-k="${x.id}">${ic(x.icon, 26)}<span>${esc(x.name)}</span></button>`).join("")}</div></div>`.replace(/data-act="tmgo"/g, 'data-act="tmgomore"');
    }
    const inT = m.type === "tmset", me = this._tmMe(), c = this._tmC(), kd = this._tmKind(), mode = this._tmMode(), adm = this._admin(), lock = this._tmLocked();
    const seg = (act, cur, opts) => `<span class="gschs">${opts.map(([k, t]) => `<button class="gsch ${String(cur) === String(k) ? "sel" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${String(cur) === String(k)}" ${lock ? "disabled" : ""}>${t}</button>`).join("")}</span>`;
    const row = (t, s, ctl) => `<div class="vrow"><span>${t}${s ? `<small class="mut" style="display:block">${s}</small>` : ""}</span>${ctl}</div>`;
    const sw = (act, on, label) => `<button class="sw ${on ? "on" : ""}" data-act="${act}" aria-pressed="${!!on}" aria-label="${esc(label)}" ${lock ? "disabled" : ""}></button>`;
    const motions = Object.keys(st).filter((e) => e.startsWith("binary_sensor.") && ["motion", "occupancy", "presence"].includes((st[e].attributes || {}).device_class)), sws = Object.keys(st).filter((e) => e.startsWith("switch.")).sort((a, b) => (/screen/.test(b) ? 1 : 0) - (/screen/.test(a) ? 1 : 0));
    const moAll = motions.length ? motions : Object.keys(st).filter((e) => e.startsWith("binary_sensor."));
    const mods = this._mdList().filter((x) => x.id !== "st");
    const pinRow = lock
      ? `<div class="gst on">${ic("lock", 15)}<span>Die Einstellungen dieses Tablets sind mit einer PIN geschützt.</span></div><div class="gbtns"><button class="btn2 pri" data-act="tmunl">${ic("lock", 16)} Mit PIN entsperren</button></div>`
      : row("PIN", me.has_pin ? "6 Stellen, schützt die Einstellungen" : "Noch keine PIN festgelegt", `<button class="btn2 ${me.has_pin ? "" : "pri"}" data-act="tmchg" style="flex:none">${ic("lock", 16)} ${me.has_pin ? "PIN ändern" : "PIN festlegen"}</button>`);
    const list = !inT && adm ? `<div class="lsec" style="margin-top:14px">${ic("tablet", 15)}Tablets verwalten</div>${((this._tm && this._tm.tablets) || []).map((t) => `<div class="vrow"><span><b>${esc(t.name)}${t.id === me.id ? " (dieses)" : ""}</b><small class="mut" style="display:block">${t.kind === "fully" ? "Fully Kiosk" : t.kind === "app" ? "HA-App" : "Browser"} · ${t.size || ""} · ${t.has_pin ? "mit PIN" : "ohne PIN"} · zuletzt ${t.seen ? this._hzSince(new Date(t.seen * 1000).toISOString()) : "–"}</small></span><span class="gschs">${t.has_pin ? `<button class="gsch" data-act="tmreset" data-id="${esc(t.id)}">PIN zurücksetzen</button>` : ""}${t.id === me.id ? "" : `<button class="gsch" data-act="tmdel" data-id="${esc(t.id)}">Entfernen</button>`}</span></div>`).join("")}` : "";
    return `<div class="ov" data-act="${inT ? "tmdone" : "close"}"></div><div class="sheet wide" role="dialog" aria-modal="true"><div class="sh"><div><b>Tablet-Modus</b><span>Gilt nur für dieses Gerät</span></div><button class="ibtn" data-act="${inT ? "tmdone" : "close"}" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${pinRow}
      <div class="lsec" style="margin-top:12px">${ic("tablet", 15)}${inT ? "Dieses Tablet" : "Aktivierung"}</div>
      ${inT ? "" : row("Tablet-Modus", "Ersetzt die normale Ansicht. Automatisch: auf Touchgeräten ab 600 px Breite.", seg("tmmode", mode, [["off", "Aus"], ["auto", "Automatisch"], ["on", "Immer an"]]))}
      <div class="vrow"><span>Name dieses Tablets<small class="mut" style="display:block">Erkannt: ${esc(kd.label)}, ${window.innerWidth} × ${window.innerHeight}</small></span><input class="osel" data-f="tmname" value="${esc(me.name)}" maxlength="24" style="width:46%;margin:0" ${lock ? "disabled" : ""} aria-label="Name"></div>
      ${row("Größe", "Bedienelemente und Schrift", seg("tmsz", c.size, [["auto", "Auto"], ["large", "Groß"], ["xl", "Sehr groß"]]))}
      ${row("Zurück zu Start nach", "Ohne Berührung", seg("tmih", c.idle_home, [[0, "Aus"], [2, "2 Min."], [5, "5 Min."], [15, "15 Min."]]))}
      ${row("Ruhemodus nach", "Dunkle Uhr statt Inhalt. Berühren oder Bewegung weckt auf.", seg("tmsl", c.sleep, [[0, "Aus"], [5, "5 Min."], [15, "15 Min."], [30, "30 Min."]]))}
      ${row("Warnungen wecken auf", "Zum Beispiel ein ausgelöster Alarm", sw("tmww", c.wake_warn, "Warnungen wecken auf"))}
      <div class="lsec" style="margin-top:12px">${ic("grid", 15)}Untere Leiste</div>
      <div class="mut sm" style="margin:0 0 6px">Start ist immer dabei. Bei schmalen Bildschirmen steht der Rest unter „Mehr“.</div>
      <div class="gschs" style="flex-wrap:wrap">${mods.map((x) => `<button class="gsch ${c.dock_hide.includes(x.id) ? "" : "sel"}" data-act="tmdock" data-k="${x.id}" aria-pressed="${!c.dock_hide.includes(x.id)}" ${lock ? "disabled" : ""}>${esc(x.short || x.name)}</button>`).join("")}</div>
      <div class="lsec" style="margin-top:14px">${ic("eye", 15)}Bewegung und Display</div>
      <div class="mut sm" style="margin:0 0 6px">Der Bewegungsmelder wird im Home Assistant überwacht und funktioniert auch bei ausgeschaltetem Display. Bei Bewegung geht das Display an, ohne Bewegung nach der eingestellten Zeit wieder aus.</div>
      ${lock ? "" : `<div class="of"><div class="ol"><b>Bewegungsmelder</b></div></div>${this._wzSel(moAll, c.motion, "tmsel", 'data-k="motion"', "– keiner –")}<div class="of"><div class="ol"><b>Display-Schalter</b><span>Fully: der Schalter „Screen“ der Fully-Integration</span></div></div>${this._wzSel(sws, c.screen, "tmsel", 'data-k="screen"', "– keiner –")}`}
      ${row("Display ausschalten nach", "Ohne Bewegung. Nur mit Display-Schalter.", seg("tmoff", c.off_after, [[0, "Nie"], [10, "10 Min."], [30, "30 Min."]]))}
      <div class="vrow"><span>HA-App (Android)<small class="mut" style="display:block">Benachrichtigungsdienst, z. B. mobile_app_tablet. Schaltet nur ein.</small></span><input class="osel" data-f="tmnot" value="${esc(c.notify)}" placeholder="mobile_app_…" style="width:46%;margin:0" ${lock ? "disabled" : ""} aria-label="Benachrichtigungsdienst"></div>
      ${inT ? "" : `<div class="lsec" style="margin-top:14px">${ic("copy", 15)}Fully Kiosk</div><div class="mut sm" style="margin:0 0 6px">Diesen Link in Fully unter Web Content Settings als Start-URL eintragen. Dann startet das Tablet immer im Tablet-Modus.</div><div class="tmurl"><code>${esc(this._tmUrlStr())}</code><button class="ibtn" data-act="tmcopy" aria-label="Kopieren">${ic("copy", 18)}</button></div>`}
      ${list}
      <div class="gbtns" style="margin-top:14px">${inT ? `<button class="btn2" data-act="tmend" ${lock ? "disabled" : ""}>Tablet-Modus beenden</button><button class="btn2 pri" data-act="tmdone">${ic("check", 16)} Fertig</button>` : `<button class="btn2" data-act="close">Schließen</button><button class="btn2 pri" data-act="tmstart" ${lock ? "disabled" : ""}>${ic("tablet", 16)} Tablet-Modus jetzt starten</button>`}</div></div>`;
  }
