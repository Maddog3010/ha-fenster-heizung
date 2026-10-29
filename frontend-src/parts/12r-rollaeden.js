  /* ================= Modul 6: Konzept zum Durchklicken (In Entwicklung, Coming soon) ================= */
  _rbTab() {
    let t = this._rbT; if (!t) { try { t = localStorage.getItem("fh_rb_tab"); } catch (_) { /* privater Modus */ } }
    return RB_TABS.some((x) => x[0] === t) ? t : "j";
  }
  _rbSel(k) { const s = (this._rbP || {})[k], n = RB_PINS[k].pins.length; return Number.isInteger(s) && s >= 0 && s < n ? s : 0; }
  _rbShot(k) {
    const d = RB_PINS[k], sel = this._rbSel(k), cur = d.pins[sel];
    const pins = d.pins.map((p, i) => `<button class="gapin${i === sel ? " on" : ""}" style="left:${p[0]}%;top:${p[1]}%" data-act="rbxpin" data-k="${k}" data-i="${i}" aria-label="${esc(p[2])}" aria-pressed="${i === sel}">${i + 1}</button>`).join("");
    const rows = d.pins.map((p, i) => i === sel ? "" : `<button class="garow" data-act="rbxpin" data-k="${k}" data-i="${i}"><span class="gan">${i + 1}</span>${esc(p[2])}</button>`).join("");
    return `<div class="card" style="padding:12px 16px"><b>${esc(d.t)}</b><div class="mut sm">${esc(d.alt)}</div></div>
      <div class="gamain"><div class="gashot"><img data-keep="1" src="${GA_IMG}${d.img}${this._ver ? "?v=" + encodeURIComponent(this._ver) : ""}" alt="${esc(d.alt)}" loading="lazy" decoding="async">${pins}<span class="gatip">Tippe auf eine Zahl</span></div>
      <div class="galist"><div class="card gacur"><div class="gah"><span class="gan">${sel + 1}</span><b>${esc(cur[2])}</b></div><p>${esc(cur[3])}</p></div>${rows}</div></div>`;
  }
  _rbPage() {
    const t = this._rbTab();
    const tabs = `<div class="sftabs gatabs" role="tablist">${RB_TABS.map(([k, l]) => `<button class="${k === t ? "on" : ""}" role="tab" aria-selected="${k === t}" data-act="rbxtab" data-k="${k}">${l}</button>`).join("")}</div>`;
    const body = t === "j" ? this._rbLive() : t !== "fp" ? this._rbShot(t) : `<div class="gast">${RB_STEPS.map(([n, tt, d], i) => `<div class="s"><b><span class="gastg ${i === 0 ? "d" : "s"}">Stufe ${n}</span>${tt}</b><span class="d">${d}</span></div>`).join("")}</div>
      <div class="card"><h2>${ic("puzzle", 18)}Weitere Ideen</h2><div class="gschips">${RB_IDEAS.map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</div></div>
      <div class="card"><h2>${ic("info", 18)}Noch offen</h2><ul style="margin:6px 0 0;padding-left:20px;line-height:1.6">${RB_OPEN.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
    return `${tabs}<div style="display:grid;gap:12px">${body}</div>
      <div class="gasoon" style="margin-top:12px">${ic("clock", 22)}<div><b>Coming soon …</b><br><span class="mut">Dieses Modul ist in Entwicklung. Der Reiter „Jetzt“ zeigt den echten Sonnenstand. Alles andere sind Entwürfe mit Beispielwerten, Rollläden werden noch nicht gesteuert.</span></div></div>`;
  }
  _rbAct(a, b) {
    if (a === "rbxtab") { this._rbT = b.dataset.k; try { localStorage.setItem("fh_rb_tab", this._rbT); } catch (_) { /* privater Modus */ } this._render(); }
    else if (a === "rbxpin") { this._rbP = { ...(this._rbP || {}), [b.dataset.k]: +b.dataset.i }; this._render(); }
  }
