  /* ================= Support-Chat für alle (wie WhatsApp), Sponsor Max bevorzugt =================
     Nachrichten gehen über einen kleinen Vermittler an den Telegram-Bot des Entwicklers (support.py, support-worker/).
     Max-Sponsoren sind dort als „bevorzugt“ markiert, Sponsoren mit ♥. Vor der ersten Nachricht: Datenschutz-Hinweis. */
  _supS() { return this._supD || { ready: false, msgs: [], privacy: false, unread: 0, access: { active: false, tier: "" }, notify: true }; }
  _supWS(act, extra = {}) {
    return this._hass.callWS({ type: "fenster_heizung/support", act, ...extra }).then((r) => { this._supD = r; return r; });
  }
  _supLoad() { return this._supWS("get").catch(() => null); }
  /* ungelesene Antworten für Kopf und Lounge: beim Start und alle 5 Minuten (lokal, der Abruf beim Vermittler läuft im Hintergrund der Integration) */
  _supWatch() {
    const chk = () => { const u = this._supS().unread; this._supLoad().then((r) => { if (r && r.unread !== u && !(this._modal && this._modal.type === "sup")) this._render(); }); };
    chk(); clearInterval(this._supW); this._supW = setInterval(() => { if (document.visibilityState === "visible") chk(); }, 300000);
  }
  _supOpen() {
    this._modal = { type: "sup", diag: false, showDiag: false, confirm: false };
    this._renderModal();
    this._supWS("poll").then(() => this._supRefresh()).catch(() => this._supRefresh());
    clearInterval(this._supTimer);
    this._supTimer = setInterval(() => {
      if (!this._modal || this._modal.type !== "sup") { clearInterval(this._supTimer); this._supTimer = null; this._render(); return; }
      if (document.visibilityState === "visible") this._supWS("poll").then(() => this._supRefresh()).catch(() => { /* nächster Versuch */ });
    }, 20000);
  }
  /* nur die Nachrichtenliste neu zeichnen – das Eingabefeld behält Text und Fokus */
  _supRefresh() {
    const box = this.shadowRoot.querySelector(".supmsgs");
    if (!box || !this._modal || this._modal.type !== "sup" || this._modal.privacy || !this._supS().privacy) { if (this._modal && this._modal.type === "sup") this._renderModal(); return; }
    const atEnd = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
    box.innerHTML = this._supList();
    if (atEnd) box.scrollTop = box.scrollHeight;
  }
  _supDay(ts) {
    const d = new Date(ts * 1000), t = new Date(), y = new Date(); y.setDate(t.getDate() - 1);
    const same = (a, b) => a.toDateString() === b.toDateString();
    return same(d, t) ? "Heute" : same(d, y) ? "Gestern" : d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "long" });
  }
  _supList() {
    const S = this._supS(), mx = S.access.tier === "max";
    if (!S.msgs.length) {
      return `<div class="supempty"><span class="supwave">👋</span><b>Schreib mir direkt</b><span>Frag, was dir unklar ist, melde einen Fehler oder schick einen Wunsch. Ich antworte hier im Chat${mx ? " – als Sponsor Max kommst du zuerst dran" : ""}.</span>${S.access.active ? "" : `<span class="supup">★ Mit <button class="lnk" data-act="spnopen">Sponsor Max</button> kommen deine Nachrichten zuerst dran.</span>`}
        <div class="supsugg">${["Ich habe eine Frage zu …", "Mir ist ein Fehler aufgefallen", "Ich wünsche mir …"].map((t) => `<button class="supchip" data-act="supsugg" data-k="${esc(t)}">${esc(t)}</button>`).join("")}</div></div>`;
    }
    let last = "", out = "";
    for (const m of S.msgs) {
      const day = this._supDay(m.ts);
      if (day !== last) { out += `<div class="supday"><span>${esc(day)}</span></div>`; last = day; }
      const me = m.from === "me", time = new Date(m.ts * 1000).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
      const tick = !me ? "" : m.state === "sending" ? `<span class="suptk" title="Wird gesendet">${ic("clock", 12)}</span>` : m.state === "failed" ? `<span class="suptk err" title="Nicht gesendet">!</span>` : m.state === "read" ? `<span class="suptk rd" title="Gelesen">✓✓</span>` : `<span class="suptk" title="Gesendet">✓</span>`;
      const txt = esc(m.text).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\n/g, "<br>");
      const im = m.img ? this._supImgTag(m.id) : m.img_gone ? `<span class="supimgx">${ic("image", 14)} Bild nicht mehr gespeichert</span>` : "";
      out += `<div class="supb ${me ? "me" : "dev"}${m.state === "failed" ? " fail" : ""}${m.img && !m.text ? " onlyimg" : ""}"><div class="supbt">${im}${txt}${m.diag ? `<span class="supatt">${ic("clip", 12)} Diagnose angehängt</span>` : ""}<span class="supmeta">${time}${tick}</span></div>
        ${m.state === "failed" ? `<div class="supfail">${esc(this._supErr(m.err))} <button class="lnk" data-act="supretry" data-k="${m.id}">Erneut senden</button> · <button class="lnk" data-act="supdrop" data-k="${m.id}">Löschen</button></div>` : ""}</div>`;
    }
    return out;
  }
  /* Bilder werden einzeln nachgeladen und im Speicher gehalten */
  _supImgTag(id) {
    const c = (this._supImgs = this._supImgs || {});
    if (c[id]) return `<img class="supimg" src="data:image/jpeg;base64,${c[id]}" alt="Bild" data-act="supimgbig" data-k="${esc(id)}">`;
    if (!c["_req" + id]) { c["_req" + id] = 1; this._supWS0("img", { mid: id }).then((r) => { if (r && r.img) { c[id] = r.img; this._supRefresh(); } }); }
    return `<span class="supimg ph">${ic("image", 22)}</span>`;
  }
  _supWS0(act, extra = {}) { return this._hass.callWS({ type: "fenster_heizung/support", act, ...extra }).catch(() => null); }
  /* Foto wählen → im Browser auf max. 1280 px verkleinern → JPEG */
  _supPick() {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*";
    inp.onchange = () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      const url = URL.createObjectURL(f), img = new Image();
      img.onload = () => {
        const k = Math.min(1, 1280 / Math.max(img.width, img.height)), cv = document.createElement("canvas");
        cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
        let q = 0.82, d = cv.toDataURL("image/jpeg", q); while (d.length > 1400000 && q > 0.4) { q -= 0.12; d = cv.toDataURL("image/jpeg", q); }
        if (this._modal && this._modal.type === "sup") { this._modal.img = d; this._renderModal(); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); this._toast("Das Bild ließ sich nicht öffnen"); };
      img.src = url;
    };
    inp.click();
  }
  _supErr(e) {
    return { too_big: "Das Bild ist zu groß.", bad_image: "Das Bild ließ sich nicht lesen.", no_sponsor: "Kein aktives Sponsoring gefunden.", offline: "Keine Verbindung.", too_many: "Zu viele Nachrichten in kurzer Zeit.", telegram: "Der Support ist gerade nicht erreichbar.", not_ready: "Chat ist noch nicht eingerichtet.", privacy: "Bitte erst den Hinweis bestätigen." }[e] || "Nicht gesendet.";
  }
  _supModal() {
    const S = this._supS(), m = this._modal, A = S.access, mx = A.tier === "max", close = `<button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button>`;
    const head = `<div class="suph"><img class="supav" src="${LOGO_URL}" alt=""><div class="suphn"><b>Support · Maddog3010</b><span>${mx ? `<em class="supmx">★ Bevorzugt</em> Max-Nachrichten kommen zuerst dran` : A.active ? `<em class="supsp">♥ Sponsor</em> Antwort direkt hier im Chat` : "Antwort direkt hier im Chat"}</span></div>${S.privacy && S.ready ? `<button class="ibtn" data-act="supset" aria-label="Mitteilungen" title="Mitteilungen">${ic("bell", 18)}</button>` : ""}${S.msgs.length && S.privacy ? `<button class="ibtn" data-act="supclear" aria-label="Verlauf löschen" title="Verlauf löschen">${ic("trash", 18)}</button>` : ""}${close}</div>`;
    const wrap = (b) => `<div class="ov" data-act="close"></div><div class="sheet wide supsh" role="dialog" aria-modal="true" aria-label="Support-Chat">${head}${b}</div>`;
    if (!S.ready) return wrap(`<div class="supgate"><span class="supgi">${ic("tools", 34)}</span><b>Der Support-Chat wird gerade eingerichtet</b><span>Er ist mit einem der nächsten Updates da. Bis dahin erreichst du mich per E-Mail an ${esc(SPN_MAIL)}.</span></div>`);
    if (!S.privacy) {
      return wrap(`<div class="supprv"><b>${ic("lock", 16)} Bevor du schreibst</b>
        <ul><li>Deine Nachrichten gehen über einen kleinen Vermittler (Cloudflare, EU/USA) an <b>Telegram</b> und landen dort beim Entwickler.</li>
        <li>Mitgeschickt werden nur: deine Nachricht (und ein Bild, wenn du eins anhängst), eine zufällige Nummer dieser Installation und – falls du Sponsor bist – dein Sponsor-Name und deine Stufe. ${ic("clip", 13)} Diagnosedaten nur, wenn du sie selbst anhängst – du siehst vorher, was drinsteht.</li>
        <li>Telegram ist ein Dienst der Telegram Group (Sitz in Dubai). Dort gelten deren Datenschutzregeln.</li>
        <li>Der Verlauf liegt in deinem Home Assistant und beim Vermittler höchstens 180 Tage. Mit ${ic("trash", 13)} löschst du ihn jederzeit an beiden Stellen.</li>
        <li>Bitte keine Passwörter, Schlüssel oder Zugangsdaten schreiben.</li></ul>
        <div class="gbtns" style="margin-top:12px"><button class="btn2 pri" data-act="supok">${ic("check", 16)} Verstanden, Chat starten</button></div></div>`);
    }
    if (m.set) {
      const T = S.push_targets || [], nm = (t) => t.replace(/^mobile_app_/, "").replace(/_/g, " ");
      return wrap(`<div class="supprv"><b>${ic("bell", 16)} Wenn eine Antwort kommt</b>
        <div class="vrow" style="margin-top:12px"><span>Meldung in Home Assistant<small class="mut" style="display:block">Glocke unten links in der Seitenleiste</small></span><button class="sw ${S.notify ? "on" : ""}" data-act="supnotify" aria-pressed="${!!S.notify}" aria-label="Meldung in Home Assistant"></button></div>
        <div class="vrow"><span>Mitteilung aufs Handy<small class="mut" style="display:block">über die Home-Assistant-App · Antippen öffnet den Chat</small></span></div>
        <div class="gschs" style="flex-wrap:wrap;margin:4px 0 0"><button class="gsch ${S.push ? "" : "sel"}" data-act="suppush" data-k="">Aus</button>${T.map((t) => `<button class="gsch ${S.push === t ? "sel" : ""}" data-act="suppush" data-k="${esc(t)}">${ic("tablet", 13)} ${esc(nm(t))}</button>`).join("")}</div>
        ${T.length ? "" : `<div class="mut sm" style="margin-top:6px">Kein Handy gefunden. Installiere die Home-Assistant-App und melde dich dort an – dann erscheint es hier.</div>`}
        ${S.push ? `<div class="gbtns" style="margin-top:10px"><button class="btn2" data-act="suppushtest">${ic("send", 15)} Test-Mitteilung senden</button></div>` : ""}
        <div class="gbtns" style="margin-top:16px"><button class="btn2 pri" data-act="supsetok">${ic("check", 16)} Fertig</button></div></div>`);
    }
    if (m.confirm) {
      return wrap(`<div class="supgate"><span class="supgi">${ic("trash", 30)}</span><b>Ganzen Verlauf löschen?</b><span>Die Nachrichten werden hier und beim Vermittler gelöscht. In Telegram beim Entwickler bleiben sie, bis er sie dort löscht.</span>
        <div class="gbtns" style="justify-content:center;margin-top:12px"><button class="btn2" data-act="supnoclear">Abbrechen</button><button class="btn2 pri" data-act="supdoclear">${ic("trash", 16)} Löschen</button></div></div>`);
    }
    const D = m.diagData;
    const diagBox = m.diag ? `<div class="supdiag"><span>${ic("clip", 14)} <b>Diagnose wird angehängt:</b> Version, Home-Assistant-Version, eingeschaltete Module, letzte Fehlermeldungen von Strom &amp; Wärme. <button class="lnk" data-act="supdiagshow">${m.showDiag ? "Ausblenden" : "Ansehen"}</button></span>
      ${m.showDiag ? `<pre class="supjson">${D ? esc(JSON.stringify(D, null, 2)) : "Lädt …"}</pre>` : ""}</div>` : "";
    const away = S.away ? `<div class="supaway">🌙 <span><b>Gerade abwesend: ${esc(S.away)}</b> Deine Nachricht kommt trotzdem an – die Antwort kann etwas dauern.</span></div>` : "";
    const imgPrev = m.img ? `<div class="supimgprev"><img src="${m.img}" alt="Ausgewähltes Bild"><span>Bild wird mitgeschickt</span><button class="ibtn" data-act="supimgx" aria-label="Bild entfernen">${ic("close", 16)}</button></div>` : "";
    return wrap(`${away}<div class="supmsgs" aria-live="polite">${this._supList()}</div>${S.err === "offline" ? `<div class="supnet">${ic("alert", 14)} Keine Verbindung zum Support – neue Antworten kommen, sobald sie wieder steht.</div>` : ""}${diagBox}${imgPrev}
      <div class="supin"><button class="supic ${m.diag ? "on" : ""}" data-act="supdiag" aria-pressed="${!!m.diag}" aria-label="Diagnose anhängen" title="Diagnose anhängen">${ic("clip", 20)}</button><button class="supic ${m.img ? "on" : ""}" data-act="supimg" aria-label="Bild anhängen" title="Bild anhängen">${ic("image", 20)}</button>
        <textarea class="supta" rows="1" maxlength="2000" placeholder="Nachricht" aria-label="Nachricht">${esc(this._supDraft || "")}</textarea>
        <button class="supsend" data-act="supsend" aria-label="Senden">${ic("send", 20)}</button></div>`);
  }
  _supBind(box) {
    const ta = box.querySelector(".supta"), list = box.querySelector(".supmsgs");
    if (list) list.scrollTop = list.scrollHeight;
    if (!ta) return;
    const fit = () => { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 140) + "px"; };
    fit();
    ta.addEventListener("input", () => { this._supDraft = ta.value; fit(); });
    ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey && !this._narrow) { e.preventDefault(); this._supSend(); } });
  }
  _supSend() {
    const ta = this.shadowRoot.querySelector(".supta"), text = String((ta && ta.value) || this._supDraft || "").trim();
    const m = this._modal, S = this._supS(), img = m.img || "";
    if ((!text && !img) || this._supBusy) return;
    this._supBusy = true;
    if (img) { (this._supImgs = this._supImgs || {}).tmp = img.split(",")[1]; m.img = ""; const p = this.shadowRoot.querySelector(".supimgprev"); if (p) p.remove(); }
    S.msgs = [...S.msgs, { id: "tmp", from: "me", text, ts: Date.now() / 1000, state: "sending", diag: !!m.diag, img: !!img }];
    this._supDraft = ""; if (ta) { ta.value = ""; ta.style.height = "auto"; }
    this._supRefresh(); const list = this.shadowRoot.querySelector(".supmsgs"); if (list) list.scrollTop = list.scrollHeight;
    this._supWS("send", { text, diag: !!m.diag, ...(img ? { image: img } : {}) }).then((r) => {
      if (img) { const mine = [...this._supS().msgs].reverse().find((x) => x.from === "me" && x.img); if (mine) this._supImgs[mine.id] = img.split(",")[1]; } if (r.ok) { m.diag = false; m.showDiag = false; this._renderModal(); } else this._supRefresh(); })
      .catch(() => { this._toast("Das ging nicht"); this._supLoad().then(() => this._supRefresh()); })
      .finally(() => { this._supBusy = false; });
  }
  _supAct(a, b) {
    const k = b.dataset.k, m = this._modal;
    if (a === "supopen") { this._supOpen(); return; }
    if (a === "supurl") { const el = this.shadowRoot.querySelector('[data-f="supurl"]'); this._supWS("opts", { url_dev: String((el && el.value) || "").trim() }).then(() => { this._renderModal(); this._toast("Gespeichert"); }).catch(() => this._toast("Das ging nicht")); return; }
    if (!m || m.type !== "sup") return;
    if (a === "supok") { this._supWS("privacy").then(() => this._renderModal()); }
    else if (a === "supsend") this._supSend();
    else if (a === "supsugg") { this._supDraft = k + " "; this._renderModal(); const ta = this.shadowRoot.querySelector(".supta"); if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); } }
    else if (a === "supdiag") { m.diag = !m.diag; if (!m.diag) m.showDiag = false; this._renderModal(); }
    else if (a === "supdiagshow") { m.showDiag = !m.showDiag; this._renderModal(); if (m.showDiag && !m.diagData) this._supWS("diag").then((r) => { m.diagData = r.diag; this._renderModal(); }); }
    else if (a === "supretry") this._supWS("retry", { mid: k }).then(() => this._supRefresh());
    else if (a === "supdrop") this._supWS("drop", { mid: k }).then(() => this._supRefresh());
    else if (a === "supimg") this._supPick();
    else if (a === "supimgx") { m.img = ""; this._renderModal(); }
    else if (a === "supimgbig") { const el = b; el.classList.toggle("big"); }
    else if (a === "supset") { m.set = true; this._renderModal(); }
    else if (a === "supsetok") { m.set = false; this._renderModal(); }
    else if (a === "supnotify") this._supWS("opts", { notify: !this._supS().notify }).then(() => this._renderModal());
    else if (a === "suppush") this._supWS("opts", { push: k || "" }).then(() => this._renderModal());
    else if (a === "suppushtest") this._supWS("pushtest").then((r) => this._toast(r.ok ? "Test-Mitteilung gesendet" : "Das ging nicht – ist die App angemeldet?"));
    else if (a === "supclear") { m.confirm = true; this._renderModal(); }
    else if (a === "supnoclear") { m.confirm = false; this._renderModal(); }
    else if (a === "supdoclear") this._supWS("clear").then(() => { m.confirm = false; this._renderModal(); this._toast("Verlauf gelöscht"); });
  }
  /* Karte in der Sponsor-Lounge bzw. im Sponsor-Bereich (für alle) */
  _supCard(mx) {
    const S = this._supS(), last = [...S.msgs].reverse().find((x) => x.from === "dev");
    const sub = S.unread ? `<b class="supnew">${S.unread} ${S.unread === 1 ? "neue Antwort" : "neue Antworten"}</b>` : last ? `Letzte Antwort: „${esc(last.text.slice(0, 60))}${last.text.length > 60 ? "…" : ""}“` : "Frag, melde Fehler oder schick Wünsche – ich antworte hier im Chat.";
    return `<div class="lgt lgsup" style="--c:#25d366"><span class="lgsupi">${ic("chat", 26)}${S.unread ? `<i class="supdot">${S.unread}</i>` : ""}</span><span class="n"><b>Support-Chat${mx ? ` <em class="supmx">★ Bevorzugt</em>` : ""}</b><small>${sub}</small></span><button class="btn2 lgsupb" data-act="supopen">${ic("chat", 16)} Chat öffnen</button></div>`;
  }
