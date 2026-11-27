  /* ================= Tablet-Modus · Stufe 6: Wartung & Erinnerungen (Modul 15) ohne Scrollen (2026.11.5b14) =================
     Reiter Termine (vier Zähler, bis zu 8 Termine mit „Erledigt“), Jahr (zwölf Monate auf einer Seite) und Erledigt (Verlauf, Kosten, Quote).
     „Erledigt“ und „Rückgängig“ gehen immer. Anlegen, Ändern und Löschen fragen nach der PIN, wenn das Tablet eine hat. */
  _tm2WaReady() { return !!this._wtD && !!(this._wt().tasks || []).length; }
  _tm2WaStatus() {
    if (!this._wtD) return "Wird geladen";
    const D = this._wt(), S = D.sum || {}, T = D.tasks || [];
    if (D.error && !D.tasks) return "Nicht geladen";
    if (!T.length) return "Noch keine Termine";
    const f = (S.over || 0) + (S.due || 0);
    if (f) return `${f} ${f === 1 ? "Termin" : "Termine"} fällig`;
    if (S.soon) return `${S.soon} bald fällig`;
    return S.next ? esc(`Als Nächstes: ${S.next.name} ${this._wtWhen(S.next)}`) : "Alles im Plan";
  }
  _tm2Wa() {
    this._wtLoad();
    if (!this._wtD) return this._tm2None("tools", "Termine werden geladen …");
    const D = this._wt(), T = D.tasks || [];
    if (D.error && !D.tasks) return this._tm2None("alert", "Termine nicht geladen", "Modul 15 antwortet nicht. Nach einem Update bitte Home Assistant neu starten.");
    if (!T.length) return `<div class="card empty tm2none">${ic("tools", 44)}<div>Noch keine Termine.</div><small>Lege Wartungen mit einem Abstand an, zum Beispiel „Heizungswartung jedes Jahr“. Ein Tipp auf „Erledigt“ setzt das Datum.</small>${this._tm2Set("tm2wtnew", "Neuer Termin")}</div>`;
    const t = this._tm2Tab("wa");
    return t === "year" ? this._tm2WaYear(D) : t === "done" ? this._tm2WaDone(D) : this._tm2WaDates(D);
  }
  _tm2WaCol(st) { return { ok: "#2dd4bf", soon: "#fbbf24", due: "#f87171", over: "#f87171", new: "#a78bfa", off: "#8e99ae" }[st] || "#2dd4bf"; }
  _tm2WaRow(t, adm, today) {
    const lbl = { ok: "im Plan", soon: "bald", due: "fällig", over: "überfällig", new: "offen", off: "pausiert" }, hi = t.hist || [], h = hi[hi.length - 1];
    const undo = adm && h && h.d === today && "prev" in h, when = t.st !== "new" && t.st !== "off" ? this._wtWhen(t) : "";
    const sub = [t.area, this._wtEvery(t), t.pro ? "Fachbetrieb" : ""].filter(Boolean).map(esc).join(" · ");
    const btn = !adm ? "" : undo ? `<button class="tm2wab un" data-act="waxtundo" data-id="${esc(t.id)}">Rückgängig</button>` : t.st !== "off" ? `<button class="tm2wab" data-act="waxtdone" data-id="${esc(t.id)}" aria-label="${esc(t.name)} erledigt">${ic("check", 20)}<span>Erledigt</span></button>` : "";
    const ed = adm ? `<button class="tm2wae" data-act="tm2g" data-g="tm2wted" data-id="${esc(t.id)}" aria-label="${esc(t.name)} bearbeiten">${ic(this._tmMe().has_pin ? "lock" : "pencil", 18)}</button>` : "";
    return `<div class="tm2war ${t.st}"><div class="wtring" style="--p:${this._wtPct(t)};--c:${this._tm2WaCol(t.st)}"><span>${ic(t.icon || "tools", 18)}</span></div>
      <span class="tm2wat"><b>${esc(t.name)}</b><small>${sub || "&nbsp;"}</small><em class="wtst ${t.st}">${lbl[t.st] || ""}${when ? ` · ${esc(when)}` : ""}</em></span><span class="tm2wax">${btn}${ed}</span></div>`;
  }
  _tm2WaDates(D) {
    const S = D.sum || {}, T = D.tasks || [], adm = this._admin(), today = D.today || "", yr = today.slice(0, 4), land = this._tm2Land(), H = window.innerHeight;
    const ord = { over: 0, due: 1, soon: 2, ok: 3, new: 4, off: 5 }, L = [...T].sort((a, b) => (ord[a.st] ?? 6) - (ord[b.st] ?? 6) || (a.days ?? 9e9) - (b.days ?? 9e9) || a.name.localeCompare(b.name, "de"));
    const per = land ? (H < 700 ? 6 : 8) : (H < 1000 ? 6 : 8), p = this._tm2Page("wadates", L.length, per), rows = Math.ceil(per / 2);
    const f = (S.over || 0) + (S.due || 0);
    const tiles = [this._tm2Tile4("Fällig", String(f), "", f ? "jetzt erledigen" : "nichts offen", "#f87171"), this._tm2Tile4("Bald", String(S.soon || 0), "", "in den nächsten Tagen", "#fbbf24"),
      this._tm2Tile4("Im Plan", String(S.ok || 0), "", "noch nicht dran", "#2dd4bf"), this._tm2Tile4(`Erledigt ${yr}`, String(S.done_year || 0), "", S.cost_year ? `${num(S.cost_year, 0)} € Kosten` : "bisher", "#a78bfa")].join("");
    return `<div class="tm2sums">${tiles}</div><div class="card tm2cc tm2wac" data-sw="wadates"><div class="tm2sh"><span>${ic("tools", 18)}Termine</span><em>${T.length}</em>${adm && T.length < (D.max || 100) ? this._tm2Set("tm2wtnew", "Neuer Termin") : ""}</div>
      <div class="tm2wag" style="--r:${rows}">${L.slice(p.from, p.to).map((t) => this._tm2WaRow(t, adm, today)).join("")}</div>${this._tm2Pager("wadates", p, "Termine")}</div>`;
  }
  _tm2WaAdd(d, n, unit) {
    const x = new Date(d);
    if (unit === "d") x.setDate(x.getDate() + n); else if (unit === "w") x.setDate(x.getDate() + 7 * n); else if (unit === "y") x.setFullYear(x.getFullYear() + n); else x.setMonth(x.getMonth() + n);
    return x;
  }
  /* Jahresplan: die nächsten zwölf Monate. Wiederkehrende Termine stehen in jedem Monat, in dem sie dran sind; Überfälliges steht im laufenden Monat. */
  _tm2WaMonths(D) {
    const today = D.today || new Date().toISOString().slice(0, 10), ty = +today.slice(0, 4), tm = +today.slice(5, 7) - 1;
    const M = Array.from({ length: 12 }, (_, i) => ({ y: ty + Math.floor((tm + i) / 12), m: (tm + i) % 12, it: [] })), end = new Date(ty, tm + 12, 1), td = new Date(`${today}T00:00:00`);
    (D.tasks || []).filter((t) => t.st !== "off" && t.due).forEach((t) => {
      let d = new Date(`${t.due}T12:00:00`), n = 0;
      while (isFinite(d) && d < end && n++ < 500) {
        const i = (d.getFullYear() - ty) * 12 + d.getMonth() - tm;
        if (i >= 0) { if (!M[i].it.some((x) => x.t === t)) M[i].it.push({ t, d, over: n === 1 && d < td }); } else if (n === 1) M[0].it.push({ t, d, over: true });
        d = this._tm2WaAdd(d, Math.max(1, +t.every || 1), t.unit);
      }
    });
    M.forEach((x) => x.it.sort((a, b) => (a.over === b.over ? a.d - b.d : a.over ? -1 : 1)));
    return M;
  }
  _tm2WaYear(D) {
    const M = this._tm2WaMonths(D), land = this._tm2Land(), cap = land && window.innerHeight < 700 ? 2 : 3, MN = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."];
    const cell = (x, i) => {
      const show = x.it.slice(0, x.it.length > cap ? cap - 1 : cap), more = x.it.length - show.length;
      return `<div class="tm2wam${i === 0 ? " now" : ""}"><b>${MN[x.m]}<small>${x.y}</small></b>${show.map((q) => `<span class="${q.over ? "o" : i === 0 && ["due", "soon"].includes(q.t.st) ? "w" : ""}">${ic(q.t.icon || "tools", 14)}<i>${esc(q.t.name)}</i>${q.over ? `<em>überfällig</em>` : `<em>${q.d.getDate()}.</em>`}</span>`).join("")}${more > 0 ? `<small class="mo">+${more} weitere</small>` : ""}${x.it.length ? "" : `<small class="no">nichts</small>`}</div>`;
    };
    return `<div class="card tm2cc tm2wayc"><div class="tm2sh"><span>${ic("plan", 18)}Nächste zwölf Monate</span>${this._tm2Set("tm2wtnew", "Neuer Termin")}</div><div class="tm2way">${M.map(cell).join("")}</div></div>`;
  }
  _tm2WaDone(D) {
    const T = D.tasks || [], S = D.sum || {}, today = D.today || "", yr = today.slice(0, 4), adm = this._admin(), land = this._tm2Land(), H = window.innerHeight;
    const A = T.flatMap((t) => (t.hist || []).map((h) => ({ t, h, last: h === (t.hist || [])[(t.hist || []).length - 1] }))).sort((a, b) => b.h.d.localeCompare(a.h.d));
    const act = T.filter((t) => t.st !== "off").length, good = (S.ok || 0) + (S.soon || 0), q = act ? Math.round((100 * good) / act) : null;
    const tiles = [this._tm2Tile4(`Erledigt ${yr}`, String(S.done_year || 0), "", "Termine abgehakt", "#a78bfa"), this._tm2Tile4(`Kosten ${yr}`, S.cost_year ? num(S.cost_year, 2) : "–", S.cost_year ? "€" : "", "aus den Einträgen", "#f59e0b"),
      this._tm2Tile4("Im Plan", q == null ? "–" : String(q), q == null ? "" : "%", "der Termine nicht fällig", "#2dd4bf")].join("");
    const per = land ? (H < 700 ? 6 : 8) : 6, p = this._tm2Page("wadone", A.length, per);
    const row = ({ t, h, last }) => {
      const undo = adm && last && h.d === today && "prev" in h;
      return `<div class="tm2war done"><div class="wtring" style="--p:100;--c:#2dd4bf"><span>${ic(t.icon || "tools", 18)}</span></div><span class="tm2wat"><b>${esc(t.name)}</b><small>${this._wtDay(h.d)}${h.note ? ` · ${esc(h.note)}` : ""}</small></span>
        <span class="tm2wax">${h.cost != null ? `<em class="tm2wac2">${num(h.cost, 2)} €</em>` : ""}${undo ? `<button class="tm2wab un" data-act="waxtundo" data-id="${esc(t.id)}">Rückgängig</button>` : ""}</span></div>`;
    };
    return `<div class="tm2sums three">${tiles}</div><div class="card tm2cc tm2wac" data-sw="wadone"><div class="tm2sh"><span>${ic("check", 18)}Zuletzt erledigt</span><em>${A.length}</em></div>${A.length ? `<div class="tm2wag${land ? "" : " one"}" style="--r:${land ? per / 2 : per}">${A.slice(p.from, p.to).map(row).join("")}</div>` : `<div class="tm2note" style="margin:auto;text-align:center">Noch nichts erledigt. Ein Tipp auf „Erledigt“ bei einem Termin trägt ihn hier ein.</div>`}${this._tm2Pager("wadone", p, "Einträge")}</div>`;
  }
  _tm2WtAct(a, b) {
    if (a === "tm2wtnew") { this._wtAct("waxtnew", b); this._modal = { type: "tm2s6wt" }; this._renderModal(); return true; }
    if (a === "tm2wted") { this._wtAct("waxtedit", b); if (this._wtEd) { this._modal = { type: "tm2s6wt" }; this._renderModal(); } return true; }
    return false;
  }
