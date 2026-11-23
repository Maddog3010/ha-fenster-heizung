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
    const on = !!(this._errD && this._errD.cfg && this._errD.cfg.on);
    return row("alert", "Fehlerprotokoll", `Programmfehler der letzten 30 Tage${on ? " · Berichte an" : " · zum Kopieren für den Support"}`, "errxopen", "", n ? `<em class="sxc warn">${n}</em>` : `<em class="sxc ok">0</em>`);
  }
  _errLoad() { return this._hass.callWS({ type: "fenster_heizung/err_list" }).then((r) => { this._errD = r; return r; }); }
  _errModal() {
    const D = this._errD, m = this._modal, C = (D && D.cfg) || {}, SRC = { backend: ["Backend", "#a78bfa"], befehl: ["Befehl", "#f59e0b"], oberflaeche: ["Oberfläche", "#38bdf8"] };
    const fd = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) : "");
    const css = `<style>.erri{border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-bottom:8px}.erri.off{opacity:.6}.errh{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin-bottom:4px}.errs{border-radius:999px;padding:1px 8px;font-size:.72rem;font-weight:700;color:var(--c);background:color-mix(in srgb,var(--c) 15%,transparent)}.errn{margin-left:auto;font-weight:700}
      .errm{font-family:ui-monospace,Menlo,monospace;font-size:.8rem;word-break:break-word;margin:2px 0}.errw{font-family:ui-monospace,Menlo,monospace}.errb{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:6px;align-items:center}.errb .lnk{display:inline-flex;align-items:center;gap:4px}.errst{font-size:.74rem;color:var(--mut)}.errst.on{color:var(--teal)}
      .errempty{display:flex;flex-direction:column;align-items:center;gap:4px;padding:22px 0;color:var(--teal)}.errempty span{color:var(--mut);font-size:.86rem}.errnote{border-radius:12px;padding:10px 12px;margin-bottom:10px;background:color-mix(in srgb,var(--teal) 9%,transparent);font-size:.86rem}
      .errsend{border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:12px}.errsend .vrow{margin:0}</style>`;
    const wrap = (title, sub, body, ov) => `<div class="ov" data-act="${ov}"></div><div class="sheet stssh" role="dialog" aria-modal="true" aria-label="${esc(title)}">${css}<div class="sh"><div><b>${title}</b>${sub ? `<span>${sub}</span>` : ""}</div><button class="ibtn" data-act="${m.mode === "ask" ? "errxno" : "close"}" aria-label="Schließen">${ic("close", 20)}</button></div>${body}</div>`;
    if (m.mode === "ask") {
      return wrap(`${ic("alert", 18)} Fehlerberichte an den Entwickler?`, "",
        `<p class="stsp">Darf Strom &amp; Wärme Programmfehler einmal am Tag anonym an den Entwickler schicken? So werden Fehler gefunden und behoben, bevor du sie melden musst.</p>
         <div class="stsbox"><b class="stsh">Das wird gesendet (höchstens 1× pro Tag, nur wenn es neue Fehler gibt)</b>
           <ul><li>Zufällige Kennung – eine eigene, ohne Bezug zur Versions-Statistik</li><li>Version von Strom &amp; Wärme und Home Assistant</li><li>Je Fehler: Modul, Fehlerart, Stelle im Code, bereinigte Meldung, Anzahl, erstes und letztes Datum</li></ul></div>
         <div class="mut sm">Nicht gesendet: Entitäten, Raum- und Gerätenamen, Werte, Adressen, Standort. Du siehst vorher jede Zeile und kannst einzelne weglassen. Probleme der Geräte-Diagnose werden nie gesendet.</div>
         <div class="gbtns"><button class="btn2 pri" data-act="errxyes">Ja, Fehlerberichte senden</button><button class="btn2" data-act="errxno">Nein danke</button></div>
         <div class="mut sm" style="text-align:center;margin:2px 0 0">Jederzeit änderbar: Einstellungen → System → Fehlerprotokoll</div>`, "errxno");
    }
    if (m.mode === "data") {
      const R = D && D.report, real = C.on;
      return wrap("Das wird gesendet", real ? "Nächster Bericht, genau so" : "So sähe der Bericht aus (Beispiel-Kennung)",
        `<pre class="stsjs" aria-label="Bericht">${esc(JSON.stringify(R && R.errors && R.errors.length ? R : { ...(R || {}), errors: [] }, null, 2))}</pre>
         <div class="mut sm" style="margin:2px 0 10px">${R && R.errors && R.errors.length ? `${R.errors.length} ${R.errors.length === 1 ? "Fehler" : "Fehler"} seit dem letzten Bericht.` : "Gerade gibt es nichts zu senden – ohne neue Fehler wird auch nichts geschickt."} Weggelassene Fehler fehlen hier.</div>
         <div class="gbtns"><button class="btn2 pri" data-act="errxback">Zurück</button></div>`, "errxback");
    }
    if (m.mode === "del") {
      return wrap("Berichte auf dem Server löschen?", "", `<div class="stsbox">Der Server löscht alle Fehlerberichte deiner Kennung, hier wird die Kennung vergessen und das Senden schaltet sich aus. Das Fehlerprotokoll auf deinem Home Assistant bleibt.</div>
        <div class="gbtns"><button class="btn2" data-act="errxback">Abbrechen</button><button class="btn2 stsdan" data-act="errxdelok">Löschen und ausschalten</button></div>`, "errxback");
    }
    const skip = new Set(C.skip || []), on = !!C.on, when = (t, n) => this._stsWhen(t, n);
    const send = D ? `<div class="errsend"><div class="vrow"><span><b>Fehlerberichte senden</b><small class="mut" style="display:block">${on ? "1× am Tag anonym an den Entwickler – nur neue Fehler, bereinigt." : "Aus. Das Protokoll bleibt auf deinem Home Assistant."}</small></span><button class="sw ${on ? "on" : ""}" data-act="${on ? "errxoff" : "errxask"}" role="switch" aria-checked="${on}" aria-label="Fehlerberichte senden"></button></div>
        ${on ? `<div class="stsrows" style="margin-top:8px"><div><span>Zuletzt gesendet</span><b>${esc(when(C.last_ok))}${C.last_ok ? " ✓" : ""}</b></div><div><span>Nächster Bericht</span><b>${esc(when(C.next, true))}</b></div><div><span>Kennung</span><b>${esc(C.id)}</b></div></div>
          ${C.err && C.last_try > C.last_ok ? `<div class="stsnote">${C.err === "noch nicht" ? "Der Server nimmt Fehlerberichte noch nicht an. Die Berichte bleiben hier und werden später nachgeschickt." : "Der Server war zuletzt nicht erreichbar. Nichts geht verloren – der nächste Versuch kommt von selbst."}</div>` : ""}
          <div class="gbtns"><button class="btn2" data-act="errxdata">Das wird gesendet</button><button class="btn2" data-act="errxsend"${m.busy ? " disabled" : ""}>${m.busy ? "Sendet …" : "Jetzt senden"}</button></div>
          <div class="gbtns"><button class="btn2 stsdan" data-act="errxdel">Meine Berichte auf dem Server löschen</button></div>` : `<div class="stslks"><button class="lnk" data-act="errxdata">Was würde gesendet?</button></div>`}</div>` : "";
    const list = !D ? `<div class="mut sm">Wird geladen …</div>` : !D.items.length ? `<div class="errempty">${ic("check", 22)}<b>Keine Programmfehler</b><span>In den letzten ${D.keep_days} Tagen ist nichts aufgetreten.</span></div>`
      : D.items.map((e) => { const sk = skip.has(e.fp); return `<div class="erri${on && sk ? " off" : ""}"><div class="errh"><span class="errs" style="--c:${(SRC[e.src] || ["", "#94a3b8"])[1]}">${(SRC[e.src] || [e.src])[0]}</span><b>${esc(e.mod)}</b><span class="errn">${num(e.n)}×</span><span class="mut sm">${e.first === e.last ? fd(e.last) : `${fd(e.first)} – ${fd(e.last)}`}</span></div>
          <div class="errm">${esc(e.kind)}: ${esc(e.msg || "–")}</div>${e.where ? `<div class="mut sm errw">${esc(e.where)}</div>` : ""}
          <div class="mut sm">Version ${esc((e.vers || []).join(", ") || "?")}${e.ha ? ` · Home Assistant ${esc(e.ha)}` : ""}</div>
          <div class="errb">${on ? `<span class="errst ${sk ? "" : "on"}">${sk ? "wird nicht gesendet" : e.nd > 0 ? "kommt in den nächsten Bericht" : "schon gesendet"}</span><button class="lnk" data-act="errxskip" data-k="${esc(e.fp)}" data-v="${sk ? "0" : "1"}">${sk ? "wieder senden" : "weglassen"}</button>` : ""}<button class="lnk" data-act="errxcopy" data-k="${esc(e.fp)}">${ic("copy", 14)} Kopieren</button><button class="lnk" data-act="errxdelone" data-k="${esc(e.fp)}">Entfernen</button></div></div>`; }).join("");
    return wrap("Fehlerprotokoll", D ? `${D.items.length} Fehler · letzte ${D.keep_days} Tage` : "",
      `<div class="errnote">Nur Programmfehler von Strom &amp; Wärme, bereinigt: keine Entitäten, Namen, Werte oder Adressen. Mit „Kopieren“ kannst du einen Fehler für den Support oder ein GitHub-Issue weitergeben.</div>
      ${send}${list}${D && D.items.length ? `<div class="gbtns" style="margin-top:6px"><button class="btn2" data-act="errxcopyall">Alle kopieren</button><button class="btn2" data-act="errxclear">Alle löschen</button></div>` : ""}`, "close");
  }
  /* Einmal fragen (Build 2): wer bei der Versions-Statistik mitmacht oder eine Beta nutzt – sobald nichts anderes offen ist */
  _errInit() {
    this._errLoad().then((r) => { const C = (r && r.cfg) || {}; if (!C.asked && (C.stats_on || C.channel === "beta")) this._errTry(0); }).catch(() => { /* älteres Backend */ });
  }
  _errTry(n) {
    const C = (this._errD && this._errD.cfg) || {};
    if (C.asked || n > 12 || this._tmOn()) return;
    if (this._modal || this._blOn() || !this._stsS().asked) { setTimeout(() => this._errTry(n + 1), 20000); return; }   /* erst nach der Versions-Statistik */
    setTimeout(() => { if (!this._modal && !((this._errD || {}).cfg || {}).asked) { this._modal = { type: "errlog", mode: "ask", first: true }; this._renderModal(); } }, n ? 0 : 4000);
  }
  _errAct(a, b) {
    const k = b && b.dataset ? b.dataset.k : "", D = this._errD, m = this._modal, copy = (t) => { try { navigator.clipboard.writeText(t); this._toast("Kopiert"); } catch (_) { this._toast("Kopieren ging nicht"); } };
    const cfg = (act, extra = {}) => this._hass.callWS({ type: "fenster_heizung/err_cfg", act, ...extra }).then((r) => { this._errD = r; return r; });
    const re = () => { this._renderModal(); this._render(); }, fail = () => this._toast("Das ging nicht");
    if (a === "errxopen") { this._modal = { type: "errlog", mode: "main" }; this._renderModal(); this._errLoad().then(() => { if (this._modal && this._modal.type === "errlog") this._renderModal(); this._render(); }).catch(() => this._toast("Fehlerprotokoll nicht erreichbar")); return; }
    if (a === "errxcopy" && D) { const e = D.items.find((x) => x.fp === k); if (e) copy(e.text); return; }
    if (a === "errxcopyall" && D) { copy(D.items.map((e) => e.text).join("\n\n")); return; }
    if (a === "errxdelone" || a === "errxclear") {
      this._hass.callWS({ type: "fenster_heizung/err_list", clear: true, ...(a === "errxdelone" ? { fp: k } : {}) }).then((r) => { this._errD = r; re(); this._toast(a === "errxdelone" ? "Entfernt" : "Fehlerprotokoll geleert"); }).catch(fail);
      return;
    }
    if (!m || m.type !== "errlog") return;
    if (a === "errxask") { m.mode = "ask"; m.from = "main"; this._renderModal(); }
    else if (a === "errxyes") cfg("answer", { on: true }).then(() => { this._toast("Danke – Fehlerberichte sind an"); if (m.first) { this._modal = null; } else m.mode = "main"; re(); }).catch(fail);
    else if (a === "errxno") cfg("answer", { on: false }).then(() => { if (m.first || !m.from) this._modal = null; else m.mode = "main"; re(); }).catch(() => { this._modal = null; this._renderModal(); });
    else if (a === "errxoff") cfg("answer", { on: false }).then(() => { re(); this._toast("Fehlerberichte aus, auf dem Server gelöscht"); }).catch(fail);
    else if (a === "errxskip") cfg("skip", { fp: k, on: b.dataset.v === "1" }).then(re).catch(fail);
    else if (a === "errxdata") { m.back = m.mode || "main"; m.mode = "data"; this._renderModal(); }
    else if (a === "errxback") { m.mode = m.back && m.back !== "data" && m.back !== "del" ? m.back : "main"; m.back = ""; this._renderModal(); }
    else if (a === "errxsend") { m.busy = true; this._renderModal(); cfg("send").then((r) => { m.busy = false; re(); const S = r.send || {}; this._toast(S.sent ? `${S.n} ${S.n === 1 ? "Fehler" : "Fehler"} gesendet` : S.why === "nichts" ? "Nichts Neues zu senden" : S.why === "noch nicht" ? "Server nimmt Fehlerberichte noch nicht an" : "Server nicht erreichbar – später erneut"); }).catch(() => { m.busy = false; re(); fail(); }); }
    else if (a === "errxdel") { m.mode = "del"; this._renderModal(); }
    else if (a === "errxdelok") cfg("forget").then((r) => { m.mode = "main"; re(); this._toast(r.forgotten ? "Gelöscht, Senden aus" : "Hier gelöscht, Server nicht erreichbar"); }).catch(fail);
  }
