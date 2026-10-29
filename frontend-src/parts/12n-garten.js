  /* ================= Modul 10: Konzept zum Durchklicken (In Entwicklung, Coming soon) ================= */
  _gaTab() {
    let t = this._gaT; if (!t) { try { t = localStorage.getItem("fh_ga_tab"); } catch (_) { /* privater Modus */ } }
    return GA_TABS.some((x) => x[0] === t) ? t : "an";
  }
  _gaSel(k) { const s = (this._gaP || {})[k], n = GA_PINS[k].pins.length; return Number.isInteger(s) && s >= 0 && s < n ? s : 0; }
  _gaShot(k) {
    const d = GA_PINS[k], sel = this._gaSel(k), cur = d.pins[sel];
    const pins = d.pins.map((p, i) => `<button class="gapin${i === sel ? " on" : ""}" style="left:${p[0]}%;top:${p[1]}%" data-act="gaxpin" data-k="${k}" data-i="${i}" aria-label="${esc(p[2])}" aria-pressed="${i === sel}">${i + 1}</button>`).join("");
    const rows = d.pins.map((p, i) => i === sel ? "" : `<button class="garow" data-act="gaxpin" data-k="${k}" data-i="${i}"><span class="gan">${i + 1}</span>${esc(p[2])}</button>`).join("");
    return `<div class="gamain"><div class="gashot"><img src="${GA_IMG}${d.img}${this._ver ? "?v=" + encodeURIComponent(this._ver) : ""}" alt="${esc(d.alt)}" loading="lazy" decoding="async">${pins}<span class="gatip">Tippe auf eine Zahl</span></div>
      <div class="galist"><div class="card gacur"><div class="gah"><span class="gan">${sel + 1}</span><b>${esc(cur[2])}</b></div><p>${esc(cur[3])}</p></div>${rows}</div></div>`;
  }
  _gaPage() {
    const t = this._gaTab();
    const tabs = `<div class="sftabs gatabs" role="tablist">${GA_TABS.map(([k, l]) => `<button class="${k === t ? "on" : ""}" role="tab" aria-selected="${k === t}" data-act="gaxtab" data-k="${k}">${l}</button>`).join("")}</div>`;
    let body = "";
    if (t === "an" || t === "bk") body = this._gaShot(t);
    else if (t === "hy") body = `<div class="card"><h2>${ic("tablet", 18)}Auch auf dem Handy</h2><div class="mut sm" style="margin:0 0 10px">Die Karte steht oben, Baukasten und Eigenschaften darunter. Bedient wird per Touch.</div><div class="gaph"><figure><div class="gashot"><img src="${GA_IMG}ga-handy1.jpg" alt="Gartenplan auf dem Handy" loading="lazy" decoding="async"></div><figcaption>Ansicht</figcaption></figure><figure><div class="gashot"><img src="${GA_IMG}ga-handy2.jpg" alt="Baukasten auf dem Handy" loading="lazy" decoding="async"></div><figcaption>Baukasten</figcaption></figure></div></div>`;
    else if (t === "te") body = `<div class="gafeat">${GA_TECH.map(([i, n, d]) => `<div class="gafc"><b>${ic(i, 18)}${n}</b><span>${d}</span></div>`).join("")}</div>`;
    else body = `<div class="gast">${GA_STEPS.map(([n, tt, d], i) => `<div class="s"><b><span class="gastg ${i === 0 ? "d" : "s"}">Stufe ${n}</span>${tt}</b><span class="d">${d}</span></div>`).join("")}</div>
      <div class="card"><h2>${ic("puzzle", 18)}Weitere Ideen</h2><div class="gschips">${GA_IDEAS.map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</div></div>
      <div class="card"><h2>${ic("info", 18)}Noch offen</h2><ul style="margin:6px 0 0;padding-left:20px;line-height:1.6">${GA_OPEN.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
    return `${tabs}<div style="display:grid;gap:12px">${body}</div>
      <div class="gasoon" style="margin-top:12px">${ic("clock", 22)}<div><b>Coming soon …</b><br><span class="mut">Dieses Modul ist in Entwicklung. Die Seite zeigt, wie es aussehen wird. Bewässern kann es noch nicht. Die Bilder sind Vorschauen, die Karte darin ist eine nachgezeichnete Skizze im OSM-Stil.</span></div></div>`;
  }
  _gaAct(a, b) {
    if (a === "gaxtab") { this._gaT = b.dataset.k; try { localStorage.setItem("fh_ga_tab", this._gaT); } catch (_) { /* privater Modus */ } this._render(); }
    else if (a === "gaxpin") { this._gaP = { ...(this._gaP || {}), [b.dataset.k]: +b.dataset.i }; this._render(); }
  }
