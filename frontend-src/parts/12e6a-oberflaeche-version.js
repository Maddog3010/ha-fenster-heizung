  /* ================= Version der Oberfläche (2026.11.5b12 / 2026.11.4.12) =================
     Nach einem Update läuft eine offene Seite (Wandtablet, App, Browser-Tab) mit dem alten panel.js weiter, bis sie neu geladen
     wird – Home Assistant verbindet sich nach dem Neustart einfach wieder. Alte Fehler tauchen dann unter der neuen Version auf.
     Die Seite vergleicht deshalb ihre eigene Version (FE_VER) mit der installierten und bittet ums Neuladen. */
  _feCheck() {
    if (!this._hass) return;
    this._hass.callWS({ type: "fenster_heizung/ver" }).then((r) => this._feChk(r && r.version)).catch(() => { /* älteres Backend */ });
  }
  _feChk(v) {
    if (!v || typeof FE_VER === "undefined" || !FE_VER || v === FE_VER) return;
    this._feNew = v;
    this._feShow();
    if (this._tmOn && this._tmOn()) this._feAuto(0);
  }
  /* Tablet-Modus: von allein neu laden – einmal je Version, nie mitten in einer Eingabe oder in einem offenen Fenster */
  _feAuto(n) {
    let done = ""; try { done = sessionStorage.getItem("fh_fe_reload") || ""; } catch (_) { /* gesperrt */ }
    if (done === this._feNew || n > 30) return;
    const ae = this.shadowRoot && this.shadowRoot.activeElement, busy = this._modal || this._edit || (ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName));
    if (busy || document.visibilityState === "hidden") { setTimeout(() => this._feAuto(n + 1), 60000); return; }
    try { sessionStorage.setItem("fh_fe_reload", this._feNew); } catch (_) { return; }   /* ohne Merker keine Schleife riskieren */
    setTimeout(() => location.reload(), 3000);
  }
  _feShow() {
    const sr = this.shadowRoot;
    if (!this._feNew || !sr || !this._built) return;
    let el = sr.getElementById("festale");
    if (this._feHide === this._feNew) { if (el) el.remove(); return; }
    if (el) return;
    el = document.createElement("div"); el.id = "festale"; el.className = "festale"; el.setAttribute("role", "status");
    el.innerHTML = `${ic("refresh", 20)}<span><b>Update installiert</b><small>Neu laden für ${esc(this._feNew)}</small></span><button class="btn2 pri">Neu laden</button><button class="ibtn" aria-label="Ausblenden">${ic("close", 16)}</button>`;
    const [go, x] = el.querySelectorAll("button");
    go.addEventListener("click", () => location.reload());
    x.addEventListener("click", () => { this._feHide = this._feNew; el.remove(); });
    sr.appendChild(el);
  }
