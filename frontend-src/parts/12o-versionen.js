  /* ---------------- Versionen und Builds der Module ---------------- */
  _mvChip(id) {
    const m = MV[id]; if (!m) return "";
    const o = this._mvO === id;
    return `<button class="mvb${o ? " on" : ""}" data-act="mvx" data-k="${id}" aria-expanded="${o}" aria-label="Versionen und Änderungen des Moduls">v${esc(m.v)} · Build ${m.b} ${o ? "▴" : "▾"}</button>`;
  }
  _mvVer(id) { const m = MV[id]; return m ? `${this._mvChip(id)}${this._verTag()}` : this._verTag(); }
  _mvStg(id) { const mm = this._mvAll().find((x) => x.id === id), s = mm && modSt(mm); return MV_STG.find((x) => x[0] === s) || null; }
  _mvPop(id) {
    const m = MV[id]; if (this._mvO !== id || !m) return "";
    const mm = this._mvAll().find((x) => x.id === id), st = this._mvStg(id);
    return `<div class="card mvpop"><div class="mvh"><b>${esc(mm ? "Modul " + mm.n + " · " + mm.name : id)}</b><button class="ibtn" data-act="mvx" data-k="${id}" aria-label="Schließen">${ic("close", 18)}</button></div>
      ${st ? `<div class="mvst"><em class="sxc ${STG[st[0]].c}">${STG[st[0]].t}</em> <span class="mut">Version ${st[1]}</span><br>${st[2]} ${st[3]}</div>${this._mvTrack(st[0])}<div class="mvnx"><b>Nächster Schritt:</b> ${st[4]}</div>` : ""}
      <ul class="mvlog">${m.log.map((l) => `<li><b>v${esc(l[0])} · Build ${l[1]}</b> <span class="mut">(Paket ${esc(l[2])})</span> – ${esc(l[3])}</li>`).join("")}</ul>
      <div class="mut sm">Alle Module und die Bedeutung der Stufen stehen unter Einstellungen → Versionen.</div></div>`;
  }
  _mvNew(id) { const m = MV[id]; return !!(m && this._ver && m.p === this._ver && m.log.length > 1); }
  _mvTrack(cur) { const i = MV_STG.findIndex((x) => x[0] === cur); return `<div class="mvtr">${MV_STG.map((x, k) => `<span class="${k < i ? "done" : k === i ? "now" : ""}"><em class="sxc ${STG[x[0]].c}">${STG[x[0]].t}</em><small>${x[1]}</small></span>`).join("<i>›</i>")}</div>`; }
  _mvTab(id) { const m = MV[id]; if (!m || this._narrow) return ["", ""]; return [`<span class="mvv"> · v${esc(m.v)}</span>`, this._mvNew(id) ? `<i class="mnew">neu</i>` : ""]; }
  _mvAll() { return [...MODS, MOD_MU, MOD_LI].filter((x) => MV[x.id]).sort((x, y) => x.n - y.n); }
  /* Versionshinweis in der Kopfzeile: stabil „Version 2026.1029.0“, Testversion „Beta 2026.1029.0b1“. Tipp öffnet Versionen. */
  _verTag() {
    if (!this._ver) return "";
    const b = vbeta(this._ver);
    return `<em class="ver vtag${b ? " vbeta" : ""}" data-act="mver" role="button" tabindex="0" title="Versionen anzeigen">${b ? "Beta" : "Version"} ${esc(this._ver)}</em>`;
  }
  _relDate(d) { try { return new Date(d + "T12:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }); } catch (_) { return d; } }
  /* Einstellungen → System → Versionen: letzte 5 stabile Versionen, Beta-Hinweis, Modulversionen, Erklärung des Schemas */
  _mvModal() {
    if (this._modal && this._modal.sub === "mod") return this._mvModModal();
    const cur = this._ver || "", beta = vbeta(cur);
    const list = REL.filter((r) => !vbeta(r.v)).slice(0, 5);
    const rels = list.map((r) => `<div class="rlr"><div class="rlh"><b class="rlv">${esc(r.v)}</b>${!beta && r.v === cur ? `<em class="rlin">Installiert</em>` : ""}<span class="mut">${esc(this._relDate(r.d))}</span></div>
        <ul class="rlt">${r.t.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>${r.c.length ? `<div class="rlc">${r.c.map((c) => `<em>${esc(c)}</em>`).join("")}</div>` : ""}</div>`).join("");
    const n = this._mvAll().length;
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Versionen</b><span>${beta ? "Beta" : "Version"} ${esc(cur || "–")}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${beta ? `<div class="rlbeta">${ic("flask", 18)}<div><b>Beta installiert: ${esc(cur)}</b><span>Testversion, die Änderungen folgen mit dem nächsten stabilen Update.</span></div></div>` : ""}
      <div class="lsec">${ic("puzzle", 15)}Integration · letzte ${list.length} Versionen</div>
      <div class="rll">${rels || `<div class="mut sm">Keine Einträge gefunden.</div>`}</div>
      <div class="rlrows"><button class="sxrow" data-act="mvsub" data-k="mod"><span class="sxi">${ic("layers", 20)}</span><span class="sxt"><b>Modulversionen</b><small>${n} Module: Version, Build und Reifegrad, so läuft der Aufstieg</small></span><span class="sxg">${ic("chev", 16)}</span></button>
      <a class="sxrow" href="https://github.com/Maddog3010/ha-fenster-heizung/releases" target="_blank" rel="noopener"><span class="sxi">${ic("link", 20)}</span><span class="sxt"><b>Alle Versionen auf GitHub</b><small>Vollständige Änderungen jeder Version</small></span><span class="sxg">${ic("chev", 16)}</span></a></div>
      <div class="lsec">${ic("info", 15)}So liest du die Hauptversion</div>
      <div class="rlx"><div class="rlxn"><i>2026</i>.<i>1029</i>.<i>0</i></div>
        <p><b>Jahr · Monat und Tag · Zähler.</b> Die Nummer zeigt, an welchem Tag das Update erschienen ist. Der Zähler beginnt bei 0 und steigt, wenn am selben Tag noch ein Update kommt.</p>
        <p>Ab Januar ohne führende Null: der 5. Januar 2027 ist 2027.105.0.</p>
        <p>Testversionen enden auf b1, b2 … und erscheinen nur, wenn in HACS Beta-Versionen eingeschaltet sind, nicht in dieser Liste.</p>
        <p>Was sich in einem Modul geändert hat, zeigen die Modulversionen.</p></div>
      <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _mvModModal() {
    const rows = this._mvAll().map((x) => { const m = MV[x.id], g = STG[modSt(x)];
      return `<tr><td><span class="mut">Modul ${x.n}</span> ${esc(x.short)}</td><td>${g ? `<em class="sxc ${g.c}">${g.t}</em>` : `<em class="sxc lab">Lab</em>`}</td><td><b>v${esc(m.v)}</b></td><td>${m.b}</td><td>${this._mvNew(x.id) ? `<span class="mvn">NEU</span>` : ""}</td></tr>`; }).join("");
    const leg = MV_STG.slice().reverse().map((s) => `<div class="mvl"><em class="sxc ${STG[s[0]].c}">${STG[s[0]].t}</em><div><b>Version ${s[1]}</b><br>${s[2]} ${s[3]}<br><span class="mut">${s[4]}</span></div></div>`).join("");
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><button class="ibtn" data-act="mvsub" data-k="" aria-label="Zurück zu Versionen">${ic("back", 20)}</button><div style="flex:1"><b>Modulversionen</b><span>Version ${esc(this._ver || "–")}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("layers", 15)}Module</div>
      <div class="mvt"><table><thead><tr><th>Modul</th><th>Stufe</th><th>Version</th><th>Build</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="mut sm" style="margin:6px 0 4px">Die Version zeigt den Reifegrad, der Build zählt Änderungen innerhalb der Version. Module ohne Änderung behalten ihre Nummer.</div>
      <div class="lsec">${ic("chart", 15)}So läuft der Aufstieg</div>
      ${this._mvTrack("")}
      <div class="mvrule"><div><b>Neue Funktion</b> Version +0.1, Build wieder 1</div><div><b>Fehlerbehebung</b> gleiche Version, Build +1</div><div><b>Aufstieg</b> Version springt auf den Start der nächsten Stufe, Build wieder 1</div></div>
      <div class="lsec">${ic("info", 15)}So unterscheiden sich die Stufen</div>
      <div class="mvlg">${leg}<div class="mvl"><em class="sxc lab">Lab</em><div><b>Version 0.0.1 und höher</b><br>Experimentelle Funktion in den Labs, kein eigenes Modul. Sie startet bei v0.0.1.<br><span class="mut">Wird sie als Modul übernommen, beginnt sie bei v0.1 und folgt den Stufen.</span></div></div></div>
      <div class="foot2"><button class="btn2" data-act="mvsub" data-k="">Zurück</button><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _mvAct(a, b) { if (a === "mvx") { this._mvO = this._mvO === b.dataset.k ? null : b.dataset.k; this._render(); } }
