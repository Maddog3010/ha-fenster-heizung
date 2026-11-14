  /* ================= Modul 8 · Mehrere Ladungen auf einmal (2026.11.3b32) =================
     Auswählen → löschen oder einem Fahrzeug zuordnen; „Fahrzeug ändern“ für alle Ladungen einer Karte im Zeitraum;
     alle gespeicherten Ladungen löschen (nur die Liste oder mit Tageswerten). */
  _evSel() { return (this._evSelS = this._evSelS || { on: false, set: new Set() }); }
  _bulkModal() {
    const m = this._modal, close = `<button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button>`, n = (m.starts || []).length;
    const wrap = (t, sub, body) => `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>${t}</b><span>${sub}</span></div>${close}</div>${body}</div>`;
    const lad = (k) => `${k} ${k === 1 ? "Ladung" : "Ladungen"}`, busy = m.busy ? "disabled" : "";
    if (m.act === "delete") return wrap(`${lad(n)} löschen?`, "Mehrere auf einmal", `<div class="mut sm" style="margin:0 0 10px">Die Ladungen verschwinden aus der Liste, ihre Energie und Kosten werden aus den Tageswerten abgezogen. Aus go-e importierte Ladungen lassen sich später wieder importieren.</div>
      <div class="gbtns"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 dng" data-act="wbvbulkgo" ${busy}>${ic("trash", 16)} ${lad(n)} löschen</button></div>`);
    if (m.act === "veh") {
      const names = [...new Set([...(this._wb().vehicles || []).map((v) => v.name), "Unbekannt"])];
      return wrap("Fahrzeug ändern", `${lad(n)}${m.card ? ` · Karte ${esc(m.card)}` : ""}`, `<div class="gschips" style="margin:0 0 10px">${names.map((x) => `<button class="gsch ${m.veh === x ? "sel" : ""}" data-act="wbvbulkveh" data-k="${esc(x)}" aria-pressed="${m.veh === x}">${esc(x)}</button>`).join("")}</div>
        <div class="mut sm" style="margin:0 0 10px">Energie und Kosten werden in den Tageswerten mit umgebucht – „Fahrzeuge &amp; Karten“ stimmt danach mit der Liste überein.${m.card ? ` Damit künftige Ladungen mit dieser Karte gleich richtig zählen: Karte unter Einstellungen → Modul 8 → Fahrzeuge dem Fahrzeug zuordnen.` : ""}</div>
        <div class="gbtns"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="wbvbulkgo" ${m.veh && !m.busy ? "" : "disabled"}>${ic("car", 16)} ${lad(n)} zuordnen</button></div>`);
    }
    /* alle gespeicherten Ladungen */
    const tot = (((this._wbStD && this._wbStD.data) || {}).sessions || []).filter((x) => !x.running).length;
    return wrap("Alle Ladungen löschen", `${lad(tot)} gespeichert`, `
      <button class="evclr ${m.mode === "list" ? "sel" : ""}" data-act="wbvbulkmode" data-k="list"><b>Nur die Liste leeren</b><small>Die einzelnen Ladungen verschwinden. Tageswerte, Summen, Balken und km bleiben.</small></button>
      <button class="evclr ${m.mode === "all" ? "sel" : ""}" data-act="wbvbulkmode" data-k="all"><b>Alles zur geladenen Energie löschen</b><small>Auch kWh und Kosten aller Tage und Fahrzeuge – für einen sauberen Neustart, z. B. vor einem neuen Import aus go-e. km und Temperaturen bleiben.</small></button>
      <div class="gbtns" style="margin-top:12px"><button class="btn2" data-act="close">Abbrechen</button>${m.sure ? `<button class="btn2 dng" data-act="wbvbulkgo" ${busy}>${ic("trash", 16)} Wirklich löschen</button>` : `<button class="btn2 dng" data-act="wbvbulksure" ${m.mode ? "" : "disabled"}>${ic("trash", 16)} Löschen</button>`}</div>`);
  }
  _bulkAct(a, b) {
    const k = b.dataset.k, S = this._evSel();
    if (a === "wbvselon") { S.on = !S.on; S.set.clear(); this._render(); return true; }
    if (a === "wbvsel") { if (S.set.has(k)) S.set.delete(k); else S.set.add(k); this._render(); return true; }
    if (a === "wbvselall") { const L = String(b.dataset.all || "").split("|").filter(Boolean); const all = L.every((x) => S.set.has(x)); L.forEach((x) => (all ? S.set.delete(x) : S.set.add(x))); this._render(); return true; }
    if (a === "wbvseldel" || a === "wbvselveh") { if (!S.set.size) return true; this._modal = { type: "wbbulk", act: a === "wbvseldel" ? "delete" : "veh", starts: [...S.set], veh: "" }; this._renderModal(); return true; }
    if (a === "wbvcardveh") { const L = String(b.dataset.all || "").split("|").filter(Boolean); this._modal = { type: "wbbulk", act: "veh", starts: L, veh: "", card: k }; this._renderModal(); return true; }
    if (a === "wbvclear") { this._modal = { type: "wbbulk", act: "clear", mode: "", sure: false }; this._renderModal(); return true; }
    const m = this._modal; if (!m || m.type !== "wbbulk") return false;
    if (a === "wbvbulkveh") { m.veh = k; this._renderModal(); return true; }
    if (a === "wbvbulkmode") { m.mode = k; m.sure = false; this._renderModal(); return true; }
    if (a === "wbvbulksure") { m.sure = true; this._renderModal(); return true; }
    if (a === "wbvbulkgo") {
      m.busy = true; this._renderModal();
      this._hass.callWS({ type: "fenster_heizung/wb_sessions", act: m.act, starts: m.starts || [], veh: m.veh || "", mode: m.mode || "list" }).then((r) => {
        this._wbStD = { data: r || {}, ts: Date.now() }; S.on = false; S.set.clear(); this._modal = null; this._renderModal(); this._render();
        this._toast(m.act === "veh" ? `${r.n} ${r.n === 1 ? "Ladung" : "Ladungen"} zugeordnet` : `${r.n} ${r.n === 1 ? "Ladung" : "Ladungen"} gelöscht`);
      }).catch(() => { m.busy = false; this._renderModal(); this._toast("Das ging nicht"); });
      return true;
    }
    return false;
  }
