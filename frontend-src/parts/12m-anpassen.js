  /* ================= „Anpassen“ in Modul 2 bis 4 (wie in Modul 1, auf der Startseite und in der Müllabfuhr) =================
     Karten am Griff verschieben, mit dem Auge ausblenden, „Zurücksetzen“. In Modul 4 zusätzlich die Geräte sortieren und ausblenden.
     Gespeichert im Layout unter "mp" (für alle Nutzer, in Sicherungen enthalten). Kopf und Zeitraum bleiben fest oben. */
  static MP_NAMES = {
    ww: { speicher: "Speicher & Kennzahlen", verlauf: "Verlauf 24 Stunden", zeitplan: "Warmwasser-Zeitplan", zirk: "Zirkulation", leg: "Legionellenschutz", pv: "PV-Überschuss", zustand: "Zustand" },
    en: { kacheln: "Kennzahlen", fluss: "Energiefluss", verlauf: "Verlauf", verteilung: "Verteilung", kosten: "Kosten und Vorteil", heizung: "Heizung", hinweise: "Hinweise" },
    gs: { kacheln: "Kennzahlen", geraete: "Geräte", verlauf: "Verlauf nach Quelle" },
  };
  static MP_WIDE = { ww: ["speicher", "verlauf", "zustand"], en: ["kacheln"], gs: ["kacheln", "geraete", "verlauf"] };
  _mpCfg(mod) {
    const l = ((this._cfg && this._cfg.layout && this._cfg.layout.mp) || {})[mod] || {}, known = Object.keys(this.constructor.MP_NAMES[mod] || {});
    const o = (Array.isArray(l.order) ? l.order : []).filter((x) => known.includes(x));
    return { order: [...o, ...known.filter((x) => !o.includes(x))], hidden: (Array.isArray(l.hidden) ? l.hidden : []).filter((x) => known.includes(x)),
      dev: Array.isArray(l.dev) ? l.dev : [], devhid: Array.isArray(l.devhid) ? l.devhid : [] };
  }
  _mpSave(mod, patch) {
    const mp = { ...((this._cfg.layout && this._cfg.layout.mp) || {}) };
    mp[mod] = { ...(mp[mod] || {}), ...patch }; this._cfg.layout.mp = mp; this._saveLayout(); this._render();
  }
  _mpEdit() { return !!(this._edit && this._admin()); }
  _mpPill() { return this._edit ? `<button class="pillbtn pri" data-act="done">${ic("check", 16)}<span class="bl">Fertig</span></button>` : `<button class="pillbtn" data-act="edit">${ic("pencil", 16)}<span class="bl">Anpassen</span></button>`; }
  /* Karten eines Moduls in der gespeicherten Reihenfolge; B = { id: html } (leer = gerade nicht vorhanden, z. B. ohne Kosten) */
  _mpWrap(mod, B) {
    const edit = this._mpEdit(), c = this._mpCfg(mod), N = this.constructor.MP_NAMES[mod], W = this.constructor.MP_WIDE[mod] || [];
    const eb = edit ? `<div class="banner">${ic("grip", 18)}<div>Ziehe die Karten an den Griffen, um sie zu verschieben. Mit dem Auge blendest du eine Karte aus.${mod === "gs" ? " Die Geräte kannst du genauso sortieren und ausblenden." : ""} <button class="lnk" data-act="mpreset" data-m="${mod}">Zurücksetzen</button></div></div>` : "";
    const blocks = c.order.filter((id) => B[id] && (edit || !c.hidden.includes(id))).map((id) => {
      const hid = c.hidden.includes(id);
      return `<section class="blk mub mpb ${W.includes(id) ? "wide" : ""} ${edit ? "editing" : ""} ${hid ? "hid" : ""}" data-sort="mpblk" data-id="${id}">
      ${edit ? `<div class="etag"><span class="grip" data-handle title="Verschieben">${ic("grip", 18)}</span>${N[id]}<button class="eyeb" data-act="mphide" data-m="${mod}" data-k="${id}" aria-pressed="${!hid}" aria-label="${N[id]} ${hid ? "einblenden" : "ausblenden"}" title="${hid ? "Einblenden" : "Ausblenden"}">${ic(hid ? "eyeOff" : "eye", 18)}<span>${hid ? "Ausgeblendet" : "Sichtbar"}</span></button></div>` : ""}${B[id]}</section>`;
    }).join("");
    const nHid = c.hidden.filter((id) => B[id]).length;
    const foot = !edit && nHid && this._admin() ? `<div class="mphint">${nHid} ${nHid === 1 ? "Karte ist" : "Karten sind"} ausgeblendet · <button class="lnk" data-act="edit">Anpassen</button></div>` : "";
    return `${eb}<div class="mublks mpblks" data-m="${mod}">${blocks || `<div class="card empty">Alle Karten sind ausgeblendet. Über „Anpassen“ blendest du sie wieder ein.</div>`}</div>${foot}`;
  }
  /* Modul 4: Geräte in eigener Reihenfolge; im Anpassen-Modus mit Griff und Auge */
  _mpDevs(devs) {
    const c = this._mpCfg("gs"), edit = this._mpEdit(), pos = (id) => { const i = c.dev.indexOf(id); return i < 0 ? 1e3 : i; };
    return devs.map((d, i) => ({ d, i })).sort((a, b) => pos(a.d.id) - pos(b.d.id) || a.i - b.i).map((x) => x.d).filter((d) => edit || !c.devhid.includes(d.id));
  }
  _mpDevWrap(d, html) {
    if (!this._mpEdit()) return html;
    const hid = this._mpCfg("gs").devhid.includes(d.id);
    return `<div class="blk mub mpdv editing ${hid ? "hid" : ""}" data-sort="gsdv" data-id="${esc(d.id)}"><div class="etag"><span class="grip" data-handle title="Verschieben">${ic("grip", 18)}</span>${esc(d.name)}<button class="eyeb" data-act="mpdhide" data-k="${esc(d.id)}" aria-pressed="${!hid}" aria-label="${esc(d.name)} ${hid ? "einblenden" : "ausblenden"}">${ic(hid ? "eyeOff" : "eye", 18)}<span>${hid ? "Ausgeblendet" : "Sichtbar"}</span></button></div>${html}</div>`;
  }
  _mpAct(a, b) {
    const m = b.dataset.m, k = b.dataset.k;
    if (a === "mphide") { const h = this._mpCfg(m).hidden; this._mpSave(m, { hidden: h.includes(k) ? h.filter((x) => x !== k) : [...h, k] }); return; }
    if (a === "mpdhide") { const h = this._mpCfg("gs").devhid; this._mpSave("gs", { devhid: h.includes(k) ? h.filter((x) => x !== k) : [...h, k] }); return; }
    if (a === "mpreset") { this._mpSave(m, m === "gs" ? { order: [], hidden: [], dev: [], devhid: [] } : { order: [], hidden: [] }); this._toast("Anordnung zurückgesetzt"); }
  }
