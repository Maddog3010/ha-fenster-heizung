  /* ================= Modul 11 · v0.9 Build 11: Quellen-Wächter und Wochen-Selbsttest ================= */
  /* Übersicht: ganze Quelle weg (z. B. X-Sense-Cloud) – eine Karte statt vieler „nicht erreichbar“ */
  _sfSrcCard(S) {
    const L = (S && S.src_off) || [];
    if (!L.length) return "";
    return L.map((q) => `<div class="card sfc"><h2>${ic("wave", 18)}Quelle ausgefallen<small class="mut">${esc(q.name)}</small></h2><div class="sfhint">${ic("info", 15)}<span>Alle Melder von <b>${esc(q.name)}</b> melden sich seit ${esc(this._sfDate(q.since))} nicht. Meist liegt es an der Cloud, dem Gateway oder dem Internet, nicht an den Meldern. <b>Die Melder warnen vor Ort weiter selbst.</b> Du bekommst dazu eine Meldung statt einer je Melder.</span></div></div>`).join("");
  }
  /* „Als Nächstes“: Ergebnis oder Termin des Wochen-Selbsttests */
  _sfSelfRow(S) {
    const st = S && S.selftest, nx = S && S.selftest_next;
    if (st && !st.ok) return [0, "alert", `Selbsttest: ${st.p.length} ${st.p.length === 1 ? "Hinweis" : "Hinweise"}`, "ansehen", "a", ""];
    if (!nx) return null;
    const d = new Date(nx), days = Math.round((d - Date.now()) / 86400000);
    return [3, "check", st ? "Selbsttest: alles in Ordnung" : "Wochen-Selbsttest", days <= 0 ? "heute " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }), "g", ""];
  }
  /* Einstellungen → Prüfung: Wochen-Selbsttest */
  _sfSelfCard(S, C, sw, vr) {
    const st = S && S.selftest, on = C.selftest && C.selftest.on;
    const res = st ? `<div class="sfhint ${st.ok ? "sfhe" : ""}">${ic(st.ok ? "check" : "alert", 15)}<span><b>Zuletzt ${esc(this._sfDate(st.t))}:</b> ${st.ok ? `alle ${st.n} Melder erreichbar, Batterien gut.` : esc(st.p.join(" · "))}</span></div>` : `<div class="mut sm">Noch kein Selbsttest gelaufen.</div>`;
    return `<div class="card sfc"><h2>${ic("check", 18)}Wochen-Selbsttest</h2>${vr("Sonntags um 18 Uhr prüfen", "Sind alle Melder erreichbar, die Batterien gut, Prüfung und Austausch im Plan? Nur Anzeige, das Modul schaltet nichts. Eine Meldung kommt nur bei Hinweisen.", sw("sfxself", "", on, "Wochen-Selbsttest"))}${res}<button class="btn2" data-act="sfxselfnow" style="flex:none;width:100%;margin-top:10px">${ic("check", 15)} Jetzt prüfen</button></div>`;
  }
  _sfxB11(a, b) {
    if (a === "sfxguard") { this._sfxPatch((c) => { c.guard = { src: !(c.guard && c.guard.src !== false) }; }); return true; }
    if (a === "sfxself") { this._sfxPatch((c) => { c.selftest = { on: !(c.selftest && c.selftest.on !== false) }; }); return true; }
    if (a === "sfxselfnow") {
      this._hass.callWS({ type: "fenster_heizung/sf_selftest" }).then((r) => { this._sfxD = { d: r || {}, ts: Date.now() }; this._render(); const st = (r || {}).selftest; this._toast(!st ? "Modul 11 ist aus" : st.ok ? "Selbsttest: alles in Ordnung" : `Selbsttest: ${st.p.length} ${st.p.length === 1 ? "Hinweis" : "Hinweise"}`); }).catch(() => this._toast("Das hat nicht geklappt"));
      return true;
    }
    return false;
  }
