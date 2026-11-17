  /* Kontakt-Leiste unter jeder Seite (Start und alle Module): Chat und E-Mail. Wird nach dem Zeichnen angehängt, damit nicht jedes Modul sie einzeln braucht. */
  _kontaktLeiste() {
    const sr = this.shadowRoot, main = sr && sr.getElementById("main");
    if (!main || this._edit || this._blOn() || main.querySelector(".kontakt")) return;
    const wraps = main.querySelectorAll(".wrap"), w = wraps[wraps.length - 1];
    if (!w) return;
    const S = this._supS(), n = S.unread || 0, mail = `mailto:${SUPPORT_MAIL}?subject=${encodeURIComponent(PRODUCT + " – Frage / Fehler")}&body=${encodeURIComponent("\n\n---\nVersion: " + (this._ver || "–"))}`;
    w.insertAdjacentHTML("beforeend", `<div class="kontakt" role="group" aria-label="Kontakt"><span class="kt">Fragen, Fehler oder Wünsche?</span><span class="kb"><button class="btn2 kchat" data-act="supopen"><span class="ke" aria-hidden="true">💬</span> Chat${n ? ` <i class="supdot in">${n}</i>` : ""}</button><a class="btn2 kmail" href="${esc(mail)}" rel="noopener"><span class="ke" aria-hidden="true">✉️</span> E-Mail</a></span></div>`);
  }
