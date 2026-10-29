  /* ---------------- Versionen und Builds der Module ---------------- */
  _mvChip(id) {
    const m = MV[id]; if (!m) return "";
    const o = this._mvO === id;
    return `<button class="mvb${o ? " on" : ""}" data-act="mvx" data-k="${id}" aria-expanded="${o}" aria-label="Versionen und Änderungen des Moduls">v${esc(m.v)} · Build ${m.b} ${o ? "▴" : "▾"}</button>`;
  }
  _mvVer(id) { const m = MV[id]; return m ? `${this._mvChip(id)}${this._ver ? `<em class="ver">Paket ${esc(this._ver)}</em>` : ""}` : (this._ver ? `<em class="ver">Version ${esc(this._ver)}</em>` : ""); }
  _mvStg(id) { const mm = MODS.find((x) => x.id === id), s = mm && modSt(mm); return MV_STG.find((x) => x[0] === s) || null; }
  _mvPop(id) {
    const m = MV[id]; if (this._mvO !== id || !m) return "";
    const mm = MODS.find((x) => x.id === id), st = this._mvStg(id);
    return `<div class="card mvpop"><div class="mvh"><b>${esc(mm ? "Modul " + mm.n + " · " + mm.name : id)}</b><button class="ibtn" data-act="mvx" data-k="${id}" aria-label="Schließen">${ic("close", 18)}</button></div>
      ${st ? `<div class="mvst"><em class="sxc ${STG[st[0]].c}">${STG[st[0]].t}</em> <span class="mut">Version ${st[1]}</span><br>${st[2]} ${st[3]}</div>${this._mvTrack(st[0])}<div class="mvnx"><b>Nächster Schritt:</b> ${st[4]}</div>` : ""}
      <ul class="mvlog">${m.log.map((l) => `<li><b>v${esc(l[0])} · Build ${l[1]}</b> <span class="mut">(Paket ${esc(l[2])})</span> – ${esc(l[3])}</li>`).join("")}</ul>
      <div class="mut sm">Alle Module und die Bedeutung der Stufen stehen unter Einstellungen → Versionen.</div></div>`;
  }
  _mvNew(id) { const m = MV[id]; return !!(m && this._ver && m.p === this._ver && m.log.length > 1); }
  _mvTrack(cur) { const i = MV_STG.findIndex((x) => x[0] === cur); return `<div class="mvtr">${MV_STG.map((x, k) => `<span class="${k < i ? "done" : k === i ? "now" : ""}"><em class="sxc ${STG[x[0]].c}">${STG[x[0]].t}</em><small>${x[1]}</small></span>`).join("<i>›</i>")}</div>`; }
  _mvTab(id) { const m = MV[id]; if (!m || this._narrow) return ["", ""]; return [`<span class="mvv"> · v${esc(m.v)}</span>`, this._mvNew(id) ? `<i class="mnew">neu</i>` : ""]; }
  _mvTable() {
    const rows = MODS.filter((x) => MV[x.id]).map((x) => { const m = MV[x.id], s = modSt(x), g = STG[s];
      return `<tr><td><span class="mut">Modul ${x.n}</span> ${esc(x.short)}</td><td>${g ? `<em class="sxc ${g.c}">${g.t}</em>` : ""}</td><td><b>v${esc(m.v)}</b></td><td>${m.b}</td><td class="mut mvd">${esc(new Date(m.d + "T12:00:00").toLocaleDateString("de-DE"))}</td><td>${this._mvNew(x.id) ? `<span class="mvn">NEU</span>` : ""}</td></tr>`; }).join("");
    const leg = MV_STG.slice().reverse().map((s) => `<div class="mvl"><em class="sxc ${STG[s[0]].c}">${STG[s[0]].t}</em><div><b>Version ${s[1]}</b><br>${s[2]} ${s[3]}<br><span class="mut">${s[4]}</span></div></div>`).join("");
    return `<div class="card mvt"><table><thead><tr><th>Modul</th><th>Stufe</th><th>Version</th><th>Build</th><th class="mvd">Geändert</th><th></th></tr></thead><tbody>${rows}</tbody></table>
      <div class="mut sm" style="margin-top:8px">Paket ${esc(this._ver || "")}. Die Version zeigt den Reifegrad, der Build zählt Änderungen innerhalb der Version. Module ohne Änderung behalten ihre Nummer.</div></div>
      <div class="card mvlg"><b>So läuft der Aufstieg</b>${this._mvTrack("")}<div class="mvrule"><div><b>Neue Funktion</b> Version +0.1, Build wieder 1</div><div><b>Fehlerbehebung</b> gleiche Version, Build +1</div><div><b>Aufstieg</b> Version springt auf den Start der nächsten Stufe, Build wieder 1</div></div><b style="margin-top:6px">So unterscheiden sich die Stufen</b>${leg}</div>`;
  }
  _mvAct(a, b) { if (a === "mvx") { this._mvO = this._mvO === b.dataset.k ? null : b.dataset.k; this._render(); } }
