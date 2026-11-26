  /* ================= Umfragen =================
     Popup beim Öffnen (nur Administratoren, nie im Tablet-Modus), Karte auf der Startseite, Punkt am Einstellungen-Knopf und
     Liste unter Einstellungen → System → Umfragen. Was gesendet wird und wann das Popup erscheinen darf, entscheidet surveys.py.
     Titel und Texte kommen vom Server und werden immer als reiner Text gezeigt (esc), ohne Links. */
  _umfS() { return this._umfD || { ok: false, on: true, popup: true, surveys: [], prompt: "", mine: 0, version: "", channel: "stable", last_ok: 0, err: "", code: "" }; }
  _umfWS(act, extra = {}) {
    return this._hass.callWS({ type: "fenster_heizung/surveys", act, ...extra }).then((r) => { this._umfD = r; this._umfTs = Date.now(); return r; });
  }
  _umfFind(id) { return this._umfS().surveys.find((s) => s.id === id); }
  _umfInit() {
    this._umfWS("get").then((r) => { this._render(); if (r.prompt) setTimeout(() => this._umfTry(0), 6000); }).catch(() => { /* Umfragen sind optional */ });
  }
  /* Stand ab und zu neu holen (lokal, ohne Internet), damit Karte und Punkt auch bei lange offener Seite stimmen */
  _umfFresh() {
    if (!this._admin() || !this._umfTs || Date.now() - this._umfTs < 600000) return;
    this._umfTs = Date.now();
    const sig = (r) => JSON.stringify((r.surveys || []).map((s) => [s.id, s.rev, s.status, s.card])), old = sig(this._umfS());
    this._umfWS("get").then((r) => { if (sig(r) !== old) this._render(); }).catch(() => {});
  }
  /* Popup: nie zusammen mit der Frage zur Versions-Statistik oder zu Fehlerberichten, nie über einem anderen Fenster */
  _umfTry(n) {
    const S = this._umfS(), id = S.prompt;
    if (!id || n > 12 || this._umfAsked || this._askShown || !this._admin() || this._tmOn()) return;
    const sts = this._stsD, C = (this._errD && this._errD.cfg) || null;
    if (sts && !sts.asked) return;   /* erst die Statistik-Frage; die Umfrage kommt beim nächsten Öffnen */
    if (C && !C.asked && (C.stats_on || C.channel === "beta")) return;
    const typing = this.shadowRoot && this.shadowRoot.activeElement && /INPUT|TEXTAREA|SELECT/.test(this.shadowRoot.activeElement.tagName);
    if ((!sts && n < 3) || this._modal || this._blOn() || this._edit || typing || !this.isConnected || document.visibilityState === "hidden") { setTimeout(() => this._umfTry(n + 1), 20000); return; }
    const s = this._umfFind(id);
    if (!s || s.status !== "open") return;
    this._umfAsked = true;
    this._umfOpen(id, { popup: true });
    this._umfWS("shown", { sid: id }).catch(() => {});
  }
  _umfDay(d) { return d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.` : ""; }
  _umfCount(s) { return s.questions.length === 1 ? "Eine Frage" : `${s.questions.length} Fragen`; }
  _umfMin(s) { const m = Math.max(1, Math.round(s.questions.length / 3)); return `etwa ${m} ${m === 1 ? "Minute" : "Minuten"}`; }
  _umfOpenList() { return this._umfS().surveys.filter((s) => s.dot); }
  /* ---- Startseite, Kopfzeile, Einstellungen */
  _umfCard() {
    this._umfFresh();
    if (!this._admin() || this._edit) return "";
    const s = this._umfS().surveys.find((x) => x.card);
    if (!s) return "";
    const pend = s.status === "pending", test = s.state === "test" ? "Test · " : "";
    const sub = pend ? "Deine Antwort ist noch nicht angekommen." : `${test}${this._umfCount(s)} · ${this._umfMin(s)}${s.to ? ` · bis ${this._umfDay(s.to)}` : ""}`;
    return `<div class="card umfc"><div class="umfct"><span class="umfci">${ic("poll", 26)}</span><div><b>Umfrage: ${esc(s.title)}</b><span>${sub}</span></div></div>
      <div class="gbtns umfcb"><button class="btn2 pri" data-act="${pend ? "umfsend" : "umfopen1"}" data-id="${s.id}"${s.busy ? " disabled" : ""}>${pend ? "Erneut senden" : "Mitmachen"}</button><button class="btn2" data-act="umfsnooze" data-id="${s.id}">Später</button></div></div>`;
  }
  _umfDot() {
    const main = this.shadowRoot && this.shadowRoot.getElementById("main");
    if (!main) return;
    const on = this._admin() && this._umfOpenList().length > 0;
    main.querySelectorAll('.bar .pillbtn[data-act="mdst"]').forEach((b) => { b.classList.toggle("umfdot", on); b.setAttribute("aria-label", on ? "Einstellungen · Umfrage offen" : "Einstellungen"); });
  }
  _umfRow(row) {
    const S = this._umfS(), n = this._umfOpenList().length;
    const sub = !S.on ? "Aus · es wird nichts abgerufen" : n ? `${n === 1 ? "Eine Umfrage ist" : `${n} Umfragen sind`} offen` : "Fragen des Entwicklers · Mitmachen ist freiwillig";
    return row("poll", "Umfragen", sub, "umfopen", "", n ? `<em class="sxc ok umfnew">Neu</em>` : S.on ? "" : `<em class="sxc off">Aus</em>`);
  }
  /* ---- Fenster */
  _umfOpen(id, o = {}) {
    const s = this._umfFind(id);
    if (!s) { this._toast("Diese Umfrage gibt es nicht mehr"); return; }
    const m = { type: "umf", id, rev: s.rev, popup: !!o.popup, from: o.from || "", mode: "q", step: 0, ans: {}, err: "", busy: false };
    if (s.status === "ended" || s.status === "answered") m.mode = "res";
    else {
      const d = (this._umfDraft || {})[id];
      m.ans = JSON.parse(JSON.stringify((d && d.rev === s.rev ? d.ans : s.mine) || {}));
      m.step = s.status === "pending" ? s.questions.length - 1 : d && d.rev === s.rev ? Math.min(d.step, s.questions.length - 1) : 0;
      if (s.status === "pending") m.err = "offline";
    }
    this._modal = m;
    this._renderModal();
  }
  _umfList() { this._modal = { type: "umf", mode: "list" }; this._renderModal(); }
  _umfDone(q, v) { return q.type === "text" ? true : q.type === "multi" ? Array.isArray(v) && v.length > 0 : v !== undefined && v !== null; }
  _umfAnswers(s, ans) {
    const out = {};
    for (const q of s.questions) { const v = ans[q.id]; if (q.type === "text") { if (String(v || "").trim()) out[q.id] = String(v).trim(); } else if (v !== undefined && this._umfDone(q, v)) out[q.id] = v; }
    return out;
  }
  _umfReady(s, ans) { return s.questions.every((q) => this._umfDone(q, ans[q.id])) && Object.keys(this._umfAnswers(s, ans)).length > 0; }
  _umfSendBox(s, ans) {
    const S = this._umfS(), n = Object.keys(this._umfAnswers(s, ans)).length;
    return `Deine ${n === 1 ? "Antwort" : `${n} Antworten`}, die Version ${esc(S.version)}, Kanal ${S.channel === "beta" ? "Beta" : "Stabil"}${s.state === "test" ? ", dein Testcode" : ""} und ein Zufallscode nur für diese Umfrage.`;
  }
  _umfErr(e) {
    return { offline: "Der Server ist gerade nicht erreichbar. Deine Antworten sind gespeichert.", kurz: "Bitte kurz warten und noch einmal senden.",
      voll: "Diese Umfrage nimmt keine Antworten mehr an.", beendet: "Diese Umfrage ist inzwischen beendet.", veraltet: "Die Fragen wurden geändert. Bitte öffne die Umfrage neu.",
      unbekannt: "Diese Umfrage gibt es nicht mehr.", abgelehnt: "Der Server hat die Antwort nicht angenommen. Vielleicht hilft ein Update der Integration.",
      antworten: "Bitte alle Fragen beantworten.", laeuft: "Wird gerade gesendet …" }[e] || "Das hat nicht geklappt. Bitte später noch einmal versuchen.";
  }
  _umfWrap(title, sub, body, x = "umfx") {
    return `<div class="ov" data-act="${x}"></div><div class="sheet stssh umfsh" role="dialog" aria-modal="true" aria-label="${title}"><div class="sh"><div><b>${title}</b>${sub ? `<span>${sub}</span>` : ""}</div><button class="ibtn" data-act="${x}" aria-label="Schließen">${ic("close", 20)}</button></div>${body}</div>`;
  }
  _umfModal() {
    const m = this._modal, S = this._umfS();
    if (m.mode === "list") return this._umfListHtml();
    if (m.mode === "del") {
      return this._umfWrap("Antworten löschen?", "", `<div class="stsbox">Alle Antworten, die diese Installation gesendet hat, werden auf dem Server gelöscht – auch zu beendeten Umfragen.</div>
        <div class="gbtns"><button class="btn2" data-act="umflist">Abbrechen</button><button class="btn2 stsdan" data-act="umfdelok"${m.busy ? " disabled" : ""}>${m.busy ? "Löscht …" : "Löschen"}</button></div>`, "umflist");
    }
    const s = this._umfFind(m.id);
    if (!s || s.rev !== m.rev) return this._umfWrap("Umfrage", "", `<div class="stsbox">${this._umfErr(m.err || (s ? "veraltet" : "unbekannt"))}</div><div class="gbtns"><button class="btn2 pri" data-act="umfx">Schließen</button></div>`);
    if (m.mode === "wd") {
      return this._umfWrap("Antwort zurückziehen?", esc(s.title), `<div class="stsbox">Deine Antwort wird auf dem Server und hier gelöscht. Solange die Umfrage läuft, kannst du später neu antworten.</div>
        <div class="gbtns"><button class="btn2" data-act="umfwdno">Abbrechen</button><button class="btn2 stsdan" data-act="umfwdok"${m.busy ? " disabled" : ""}>${m.busy ? "Löscht …" : "Zurückziehen"}</button></div>`, "umfwdno");
    }
    return m.mode === "res" ? this._umfResHtml(s) : this._umfQHtml(s);
  }
  _umfQHtml(s) {
    const m = this._modal, n = s.questions.length, i = Math.min(m.step, n - 1), q = s.questions[i], v = m.ans[q.id], last = i === n - 1;
    const pick = (on, round, t, val) => `<button class="ehchk${on ? " on" : ""}" data-act="umfpick" data-k="${val}" role="${round ? "radio" : "checkbox"}" aria-checked="${on}"><i class="${round ? "umfr" : ""}">${on ? ic("check", 16) : ""}</i><span>${t}</span></button>`;
    let body = "";
    if (q.type === "one" || q.type === "multi") {
      body = `<div role="${q.type === "one" ? "radiogroup" : "group"}">${q.options.map((o, k) => pick(q.type === "one" ? v === k : (v || []).includes(k), q.type === "one", esc(o), k)).join("")}</div>`;
    } else if (q.type === "stars") {
      body = `<div class="umfstars" role="radiogroup">${[1, 2, 3, 4, 5].map((k) => `<button class="${typeof v === "number" && k <= v ? "on" : ""}" data-act="umfstar" data-k="${k}" role="radio" aria-checked="${v === k}" aria-label="${k} von 5 Sternen">★</button>`).join("")}</div>
        <div class="umfscale"><span>gar nicht</span><span>sehr</span></div>${q.na ? pick(v === "na", true, "Nutze ich nicht", "na") : ""}`;
    } else {
      body = `<textarea class="umfta" data-f="umftext" maxlength="500" rows="4" aria-label="${esc(q.text)}" placeholder="Deine Antwort">${esc(v || "")}</textarea><div class="mut sm umfhint">Bitte keine Namen oder Adressen. <span id="umfn">${String(v || "").length}</span> / 500</div>`;
    }
    const ready = this._umfReady(s, m.ans), next = this._umfDone(q, v);
    const dead = ["voll", "beendet", "veraltet", "unbekannt"].includes(m.err);
    const back = i ? `<button class="btn2" data-act="umfprev">Zurück</button>` : m.popup && s.status === "open" ? `<button class="btn2" data-act="umfx">Später</button>` : `<button class="btn2" data-act="umfx">Abbrechen</button>`;
    const go = last
      ? `<button class="btn2 pri" id="umfgo" data-act="umfsubmit"${!ready || m.busy ? " disabled" : ""}>${m.busy ? "Sendet …" : m.err ? "Erneut senden" : "Absenden"}</button>`
      : `<button class="btn2 pri" id="umfgo" data-act="umfnext"${next ? "" : " disabled"}>Weiter</button>`;
    const sub = `${s.state === "test" ? "Test · " : ""}${n > 1 ? `Frage ${i + 1} von ${n}` : "Eine Frage"}${i ? "" : ` · ${this._umfMin(s)}`}`;
    return this._umfWrap(esc(s.title), sub, `${n > 1 ? `<div class="umfprog" aria-hidden="true">${s.questions.map((_, k) => `<i class="${k <= i ? "on" : ""}"></i>`).join("")}</div>` : ""}
      <div class="umfq">${esc(q.text)}${q.type === "text" ? ` <small>(freiwillig)</small>` : q.type === "multi" ? ` <small>(mehrere möglich)</small>` : ""}</div>${body}
      ${last ? `<div class="gbox"><b>Das wird gesendet</b><span id="umfbox">${this._umfSendBox(s, m.ans)}</span><br><span class="mut">Kein Name, keine Räume, keine Geräte, keine Messwerte.</span></div>` : ""}
      ${m.err ? `<div class="umfmsg" role="alert">${this._umfErr(m.err)}</div>` : ""}
      <div class="gbtns umffoot">${dead ? `<button class="btn2 pri" data-act="umfx">Schließen</button>` : back + go}</div>
      ${!i && s.status === "open" && !dead ? `<div class="umfctr"><button class="lnk" data-act="umfnever">Bei dieser Umfrage nicht mehr fragen</button></div>` : ""}`);
  }
  /* Ergebnis als Balken (nur Zahlen, wenn der Entwickler es freigegeben hat) */
  _umfBars(s) {
    const R = s.result, mine = s.mine || {};
    if (!R) return "";
    const bar = (t, pct, me) => `<div class="umfbar${me ? " me" : ""}"><div><span>${t}${me ? " · deine Wahl" : ""}</span><b>${pct} %</b></div><i><u style="width:${pct}%"></u></i></div>`;
    const part = s.questions.filter((q) => R.q[q.id]).map((q) => {
      const x = R.q[q.id], pct = (c) => (x.n ? Math.round((c / x.n) * 100) : 0), v = mine[q.id];
      const rows = q.type === "stars"
        ? [5, 4, 3, 2, 1].map((k) => { const sum = x.counts.reduce((a, c) => a + c, 0); return bar(`${k} ${k === 1 ? "Stern" : "Sterne"}`, sum ? Math.round((x.counts[k - 1] / sum) * 100) : 0, v === k); }).join("")
        : q.options.map((o, k) => bar(esc(o), pct(x.counts[k]), q.type === "multi" ? Array.isArray(v) && v.includes(k) : v === k)).join("");
      const extra = q.type === "stars" && x.avg ? `Durchschnitt ${num(x.avg, 1)} von 5` : q.type === "multi" ? "Mehrfachauswahl" : "";
      return `${s.questions.length > 1 ? `<div class="umfrq">${esc(q.text)}</div>` : ""}${extra ? `<div class="mut sm umfex">${extra}</div>` : ""}${rows}`;
    }).join("");
    return `<div class="lsec umfls">${s.status === "ended" ? "Ergebnis" : "Zwischenstand"} · ${R.n} Antworten</div>${part}`;
  }
  _umfMine(s) {
    const mine = s.mine || {};
    const val = (q) => { const v = mine[q.id]; if (v === undefined) return "–"; if (q.type === "one") return esc(q.options[v]); if (q.type === "multi") return v.map((k) => esc(q.options[k])).join(", "); if (q.type === "stars") return v === "na" ? "Nutze ich nicht" : `${v} von 5 Sternen`; return esc(v); };
    return `<div class="lsec umfls">Deine Antworten</div><div class="stsrows umfmine">${s.questions.map((q) => `<div><span>${esc(q.text)}</span><b>${val(q)}</b></div>`).join("")}</div>`;
  }
  _umfResHtml(s) {
    const m = this._modal, ended = s.status === "ended", mine = !!(s.mine && s.sent), bars = this._umfBars(s);
    if (ended) {
      return this._umfWrap(esc(s.title), `Beendet${s.to ? ` · Ende ${this._umfDay(s.to)}` : ""}`, `${bars || `<div class="stsbox">Diese Umfrage ist beendet. Zu ihr wird kein Ergebnis gezeigt.</div>`}${mine && !bars ? this._umfMine(s) : ""}
        <div class="gbtns umffoot"><button class="btn2 pri" data-act="umfx">Schließen</button></div>`);
    }
    return this._umfWrap(m.just ? "Danke!" : esc(s.title), m.just ? "Deine Antwort ist angekommen" : `Gesendet am ${this._umfDay(new Date(s.sent * 1000).toLocaleDateString("sv-SE"))}`,
      `<div class="umfok">${ic("check", 34)}</div><div class="mut sm umfuntil">${s.to ? `Bis zum ${this._umfDay(s.to)}` : "Solange die Umfrage läuft,"} kannst du sie ändern oder zurückziehen.</div>${bars || this._umfMine(s)}
       <div class="gbtns umffoot"><button class="btn2" data-act="umfedit">Antwort ändern</button><button class="btn2 pri" data-act="umfx">Fertig</button></div>
       <div class="umfctr"><button class="lnk" data-act="umfwd">Antwort zurückziehen</button></div>`);
  }
  _umfListHtml() {
    const S = this._umfS(), L = S.surveys;
    const row = (s) => {
      const st = s.status, open = st === "open" || st === "pending";
      const sub = st === "ended" ? `${s.to ? `Ende ${this._umfDay(s.to)} · ` : ""}${s.result ? "Ergebnis ansehen" : "beendet"}` : st === "answered" ? (s.to ? `Ändern bis ${this._umfDay(s.to)}` : "Ändern, solange sie läuft") : st === "pending" ? "Noch nicht angekommen · erneut senden" : `${this._umfCount(s)}${s.to ? ` · bis ${this._umfDay(s.to)}` : ""}`;
      const chip = s.state === "test" ? ["wa", "Test"] : st === "ended" ? ["off", "Vorbei"] : st === "answered" ? ["ok", "Gesendet"] : st === "pending" ? ["wa", "Offen"] : st === "declined" ? ["", "Offen"] : ["ok", "Neu"];
      return `<button class="sxrow" data-act="umfitem" data-id="${s.id}"><span class="sxi">${ic("poll", 20)}</span><span class="sxt"><b>${esc(s.title)}</b><small>${open && s.state === "test" ? "Nur mit deinem Testcode · " : ""}${sub}</small></span><em class="sxc ${chip[0]}">${chip[1]}</em><span class="sxg">${ic("chev", 16)}</span></button>`;
    };
    const sec = (t, st) => { const l = L.filter((s) => st.includes(s.status)); return l.length ? `<div class="lsec umfls">${t}</div><div class="umfrows">${l.map(row).join("")}</div>` : ""; };
    const seg = (label, on, act, hint) => `<div class="of"><div class="ol"><b>${label}</b>${hint ? `<small class="mut sm umfhint">${hint}</small>` : ""}</div><div class="oc"><div class="seg oseg" role="group" aria-label="${label}"><button class="${on ? "" : "sel"}" data-act="${act}" data-k="0" aria-pressed="${!on}">Aus</button><button class="${on ? "sel" : ""}" data-act="${act}" data-k="1" aria-pressed="${on}">An</button></div></div></div>`;
    const lists = sec("Offen", ["open", "pending", "declined"]) + sec("Beantwortet", ["answered"]) + sec("Beendet", ["ended"]);
    const empty = !S.on ? "„Umfragen laden“ ist aus. Es wird nichts abgerufen." : S.err && S.err !== "noch nicht" ? "Die Umfragen konnten zuletzt nicht abgerufen werden. Der nächste Versuch kommt von allein." : "Gerade gibt es keine Umfrage.";
    return this._umfWrap("Umfragen", "Einstellungen › System", `${S.on && lists ? lists : `<div class="stsbox">${empty}</div>`}
      <div class="umfopts">${seg("Umfragen laden", S.on, "umfon", "Etwa 1× pro Tag, ohne Angaben zu dir")}${S.on ? seg("Neue Umfragen als Popup zeigen", S.popup, "umfpop", "") : ""}</div>
      ${S.mine ? `<button class="lnk" data-act="umfdel">Meine Antworten auf dem Server löschen</button>` : ""}
      <div class="stslks"><a class="stslk" href="https://github.com/Maddog3010/ha-fenster-heizung/blob/beta/README.md#umfragen-und-datenschutz" target="_blank" rel="noopener noreferrer">Datenschutz</a></div>`, "close");
  }
  /* Beim Schließen merken, was schon ausgefüllt war */
  _umfKeep() {
    const m = this._modal;
    if (m && m.type === "umf" && m.mode === "q" && Object.keys(m.ans).length) { this._umfDraft = this._umfDraft || {}; this._umfDraft[m.id] = { rev: m.rev, step: m.step, ans: m.ans }; }
  }
  _umfInput(t) {
    const m = this._modal;
    if (!m || m.type !== "umf" || m.mode !== "q") return;
    const s = this._umfFind(m.id); if (!s) return;
    const q = s.questions[m.step]; if (!q || q.type !== "text") return;
    m.ans[q.id] = t.value;
    const sr = this.shadowRoot, n = sr.getElementById("umfn"), box = sr.getElementById("umfbox"), go = sr.getElementById("umfgo");
    if (n) n.textContent = String(t.value.length);
    if (box) box.innerHTML = this._umfSendBox(s, m.ans);
    if (go && go.dataset.act === "umfsubmit") go.disabled = m.busy || !this._umfReady(s, m.ans);
  }
  _umfSubmit(act, id, extra = {}) {
    const m = this._modal && this._modal.type === "umf" ? this._modal : null, mine = () => this._modal === m;
    if (m) { m.busy = true; m.err = ""; this._renderModal(); }
    this._umfWS(act, { sid: id, ...extra }).then((r) => {
      if (r.sent) {
        if (this._umfDraft) delete this._umfDraft[id];
        if (m && mine()) { m.busy = false; m.mode = "res"; m.just = true; this._renderModal(); } else this._toast("Antwort gesendet – danke!");
      } else if (m && mine()) { m.busy = false; m.err = r.error || "offline"; this._renderModal(); }
      else this._toast(this._umfErr(r.error));
      this._render();
    }).catch(() => { if (m && mine()) { m.busy = false; m.err = "x"; this._renderModal(); } else this._toast("Das ging nicht"); });
  }
  _umfAct(a, b) {
    const m = this._modal, id = b.dataset.id, k = b.dataset.k, fail = () => this._toast("Das ging nicht");
    const re = () => { if (this._modal && this._modal.type === "umf") this._renderModal(); this._render(); };
    if (a === "umfopen") { this._umfList(); this._umfWS("get").then(re).catch(() => {}); return; }
    if (a === "umfopen1") { this._umfOpen(id); return; }
    if (a === "umfsnooze") { this._umfWS("later", { sid: id }).then(() => { this._render(); this._toast("Du findest sie unter Einstellungen → System → Umfragen"); }).catch(fail); return; }
    if (a === "umfsend") { this._umfSubmit("send", id); return; }
    if (a === "umfcode") {
      const el = this.shadowRoot.querySelector('[data-f="umfcode"]'), code = String((el && el.value) || "").trim();
      this._umfWS("code", { code: code.slice(0, 20) }).then((r) => {
        this._renderModal(); this._render();
        this._toast(r.error === "code" ? "Format: T-XXXX-XXXX" : !r.on ? "„Umfragen laden“ ist aus" : !r.fetched ? "Gespeichert – Server nicht erreichbar" : !r.code ? "Testcode entfernt" : r.tests ? `${r.tests} Test-Umfrage${r.tests === 1 ? "" : "n"} gefunden` : "Keine Test-Umfrage – stimmt der Code?");
      }).catch(fail);
      return;
    }
    if (!m || m.type !== "umf") return;
    const s = m.id ? this._umfFind(m.id) : null, q = s && s.questions[m.step];
    if (a === "umfx") { this._umfKeep(); if (m.from === "list") this._umfList(); else { this._modal = null; this._renderModal(); } this._render(); }
    else if (a === "umflist") { this._umfList(); }
    else if (a === "umfitem") this._umfOpen(id, { from: "list" });
    else if (a === "umfpick" && q) { const v = k === "na" ? "na" : +k; if (q.type === "multi") { const l = m.ans[q.id] || []; m.ans[q.id] = l.includes(v) ? l.filter((x) => x !== v) : [...l, v].sort(); } else m.ans[q.id] = v; this._renderModal(); }
    else if (a === "umfstar" && q) { m.ans[q.id] = +k; this._renderModal(); }
    else if (a === "umfnext" && s) { if (this._umfDone(q, m.ans[q.id])) { m.step = Math.min(s.questions.length - 1, m.step + 1); m.err = ""; this._renderModal(); const sh = this.shadowRoot.querySelector("#modal .sheet"); if (sh) sh.scrollTop = 0; } }
    else if (a === "umfprev") { m.step = Math.max(0, m.step - 1); this._renderModal(); }
    else if (a === "umfsubmit" && s) { if (this._umfReady(s, m.ans) && !m.busy) this._umfSubmit("answer", m.id, { answers: this._umfAnswers(s, m.ans) }); }
    else if (a === "umfnever") this._umfWS("never", { sid: m.id }).then(() => { if (this._umfDraft) delete this._umfDraft[m.id]; if (m.from === "list") this._umfList(); else { this._modal = null; this._renderModal(); } this._render(); this._toast("Alles klar – sie bleibt unter Einstellungen → System → Umfragen"); }).catch(fail);
    else if (a === "umfedit" && s) { m.mode = "q"; m.step = 0; m.ans = JSON.parse(JSON.stringify(s.mine || {})); m.err = ""; m.just = false; this._renderModal(); }
    else if (a === "umfwd") { m.mode = "wd"; this._renderModal(); }
    else if (a === "umfwdno") { m.mode = "res"; this._renderModal(); }
    else if (a === "umfwdok") {
      m.busy = true; this._renderModal();
      this._umfWS("withdraw", { sid: m.id }).then((r) => {
        m.busy = false;
        if (!r.withdrawn) { this._renderModal(); this._toast("Server nicht erreichbar – bitte später noch einmal"); return; }
        if (this._modal === m) this._umfList();
        this._render(); this._toast("Antwort gelöscht");
      }).catch(() => { m.busy = false; this._renderModal(); fail(); });
    }
    else if (a === "umfon" || a === "umfpop") this._umfWS("opts", a === "umfon" ? { on: k === "1" } : { popup: k === "1" }).then(re).catch(fail);
    else if (a === "umfdel") { m.mode = "del"; this._renderModal(); }
    else if (a === "umfdelok") {
      m.busy = true; this._renderModal();
      this._umfWS("forget").then((r) => { if (this._modal === m) this._umfList(); this._render(); this._toast(r.failed ? "Server nicht erreichbar – bitte später noch einmal" : "Deine Antworten sind gelöscht"); }).catch(() => { m.busy = false; this._renderModal(); fail(); });
    }
  }
