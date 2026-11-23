  /* ================= Fehler-Statistik Build 1: Fehlerprotokoll (lokal) =================
     Programmfehler aus Backend, Befehlen und Oberfläche – bereinigt, zusammengefasst, 30 Tage. Einstellungen → System → Fehlerprotokoll.
     Die Oberfläche meldet fehlgeschlagene Befehle (Schema-Fehler wie „expected str at 'id'“, unbekannte Befehle, unerwartete Fehler)
     und eigene Anzeigefehler an fenster_heizung/err_report. In Build 1 wird nichts versendet. */
  _errWrap(h) {
    if (!h || typeof h.callWS !== "function" || h.__fhErr) return;
    const orig = h.callWS, self = this;
    try {
      Object.defineProperty(h, "__fhErr", { value: true });
      /* nur eigene Befehle; der Fehler wird unverändert weitergereicht */
      h.callWS = function (msg) { return orig.call(this, msg).catch((e) => { try { self._errCmd(msg, e); } catch (_) { /* nie stören */ } throw e; }); };
    } catch (_) { /* Objekt gesperrt: dann eben ohne */ }
    if (!this.constructor._errHook) {
      this.constructor._errHook = true;
      const mine = (s) => /fenster_heizung_static|fenster-heizung-panel/.test(String(s || ""));
      window.addEventListener("error", (ev) => { if (mine(ev.filename) || mine(ev.error && ev.error.stack)) this._errJs(ev.error || ev.message, "Fenster"); });
      window.addEventListener("unhandledrejection", (ev) => { const r = ev.reason; if (r && mine(r.stack)) this._errJs(r, "Versprechen"); });
    }
  }
  _errDev() { const w = window.innerWidth || 1000; return w < 600 ? "handy" : w < 1100 ? "tablet" : "pc"; }
  _errSend(p) {
    const t = Date.now(); this._errQ = (this._errQ || []).filter((x) => t - x < 60000);
    if (this._errQ.length >= 10 || !this._hass) return;   /* höchstens 10 Meldungen pro Minute */
    this._errQ.push(t);
    try { this._hass.callWS({ type: "fenster_heizung/err_report", dev: this._errDev(), ...p }).catch(() => { /* älteres Backend */ }); } catch (_) { /* egal */ }
  }
  /* Fehlgeschlagener Befehl: nur echte Programmfehler – „nicht bereit“, „nicht gefunden“ usw. sind erwartete Antworten */
  _errCmd(msg, e) {
    const type = String((msg && msg.type) || "");
    if (!type.startsWith("fenster_heizung/") || type === "fenster_heizung/err_report" || type === "fenster_heizung/err_list") return;
    const code = String((e && e.code) || "");
    if (!["invalid_format", "unknown_command", "unknown_error", "home_assistant_error"].includes(code)) return;
    this._errSend({ src: "befehl", kind: code, where: type.slice(16), cmd: type, msg: String((e && e.message) || "") });
  }
  /* Anzeigefehler (Neuaufbau, Fenster-Fehler aus panel.js): Fehlerart und innerste Funktion aus dem Stapel */
  _errJs(err, where) {
    const st = String((err && err.stack) || ""), fn = (st.split("\n").map((l) => (l.match(/at (?:FensterHeizungPanel\.)?([A-Za-z_$][\w$]*) \(/) || l.match(/^([A-Za-z_$][\w$]*)@/) || [])[1]).find((x) => x && !/^(Array|Object|Function|eval)$/.test(x))) || "";
    this._errSend({ src: "oberflaeche", kind: String((err && err.name) || "Fehler").slice(0, 60), where: (fn ? `${fn} · ` : "") + where, msg: String((err && err.message) || err || "") });
  }
  /* ---- Einstellungen → System */
  _errRow(row) {
    const n = this._errD ? this._errD.items.length : 0;
    return row("alert", "Fehlerprotokoll", "Programmfehler der letzten 30 Tage – zum Kopieren für den Support", "errxopen", "", n ? `<em class="sxc warn">${n}</em>` : `<em class="sxc ok">0</em>`);
  }
  _errLoad() { return this._hass.callWS({ type: "fenster_heizung/err_list" }).then((r) => { this._errD = r; return r; }); }
  _errModal() {
    const D = this._errD, m = this._modal, SRC = { backend: ["Backend", "#a78bfa"], befehl: ["Befehl", "#f59e0b"], oberflaeche: ["Oberfläche", "#38bdf8"] };
    const fd = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) : "");
    const list = !D ? `<div class="mut sm">Wird geladen …</div>` : !D.items.length ? `<div class="errempty">${ic("check", 22)}<b>Keine Programmfehler</b><span>In den letzten ${D.keep_days} Tagen ist nichts aufgetreten.</span></div>`
      : D.items.map((e) => `<div class="erri"><div class="errh"><span class="errs" style="--c:${(SRC[e.src] || ["", "#94a3b8"])[1]}">${(SRC[e.src] || [e.src])[0]}</span><b>${esc(e.mod)}</b><span class="errn">${num(e.n)}×</span><span class="mut sm">${e.first === e.last ? fd(e.last) : `${fd(e.first)} – ${fd(e.last)}`}</span></div>
          <div class="errm">${esc(e.kind)}: ${esc(e.msg || "–")}</div>${e.where ? `<div class="mut sm errw">${esc(e.where)}</div>` : ""}
          <div class="mut sm">Version ${esc((e.vers || []).join(", ") || "?")}${e.ha ? ` · Home Assistant ${esc(e.ha)}` : ""}</div>
          <div class="errb"><button class="lnk" data-act="errxcopy" data-k="${esc(e.fp)}">${ic("copy", 14)} Kopieren</button><button class="lnk" data-act="errxdel" data-k="${esc(e.fp)}">Entfernen</button></div></div>`).join("");
    const css = `<style>.erri{border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-bottom:8px}.errh{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin-bottom:4px}.errs{border-radius:999px;padding:1px 8px;font-size:.72rem;font-weight:700;color:var(--c);background:color-mix(in srgb,var(--c) 15%,transparent)}.errn{margin-left:auto;font-weight:700}
      .errm{font-family:ui-monospace,Menlo,monospace;font-size:.8rem;word-break:break-word;margin:2px 0}.errw{font-family:ui-monospace,Menlo,monospace}.errb{display:flex;gap:14px;margin-top:6px}.errb .lnk{display:inline-flex;align-items:center;gap:4px}
      .errempty{display:flex;flex-direction:column;align-items:center;gap:4px;padding:22px 0;color:var(--teal)}.errempty span{color:var(--mut);font-size:.86rem}.errnote{border-radius:12px;padding:10px 12px;margin-bottom:10px;background:color-mix(in srgb,var(--teal) 9%,transparent);font-size:.86rem}</style>`;
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Fehlerprotokoll">${css}<div class="sh"><div><b>Fehlerprotokoll</b><span>${D ? `${D.items.length} ${D.items.length === 1 ? "Fehler" : "Fehler"} · letzte ${D.keep_days} Tage` : ""}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="errnote">Nur Programmfehler von Strom &amp; Wärme, bereinigt: keine Entitäten, Namen, Werte oder Adressen. <b>Bleibt auf deinem Home Assistant</b> – mit „Kopieren“ kannst du einen Fehler für den Support oder ein GitHub-Issue weitergeben.</div>
      ${list}${D && D.items.length ? `<div class="gbtns" style="margin-top:6px"><button class="btn2" data-act="errxcopyall">Alle kopieren</button><button class="btn2" data-act="errxclear">Alle löschen</button></div>` : ""}</div>`;
  }
  _errAct(a, b) {
    const k = b && b.dataset ? b.dataset.k : "", D = this._errD, copy = (t) => { try { navigator.clipboard.writeText(t); this._toast("Kopiert"); } catch (_) { this._toast("Kopieren ging nicht"); } };
    if (a === "errxopen") { this._modal = { type: "errlog" }; this._renderModal(); this._errLoad().then(() => { if (this._modal && this._modal.type === "errlog") this._renderModal(); this._render(); }).catch(() => this._toast("Fehlerprotokoll nicht erreichbar")); return; }
    if (a === "errxcopy" && D) { const e = D.items.find((x) => x.fp === k); if (e) copy(e.text); return; }
    if (a === "errxcopyall" && D) { copy(D.items.map((e) => e.text).join("\n\n")); return; }
    if (a === "errxdel" || a === "errxclear") {
      this._hass.callWS({ type: "fenster_heizung/err_list", clear: true, ...(a === "errxdel" ? { fp: k } : {}) }).then((r) => { this._errD = r; this._renderModal(); this._render(); this._toast(a === "errxdel" ? "Entfernt" : "Fehlerprotokoll geleert"); }).catch(() => this._toast("Das ging nicht"));
    }
  }
