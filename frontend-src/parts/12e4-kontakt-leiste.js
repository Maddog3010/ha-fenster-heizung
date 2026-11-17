  /* Kontakt-Leiste unter jeder Seite (Start und alle Module): Chat und E-Mail. Wird nach dem Zeichnen angehängt, damit nicht jedes Modul sie einzeln braucht. */
  _kontaktLeiste() { /* Chat und E-Mail stehen jetzt im Kopf (siehe _stoBtn) */ }
  /* E-Mail: Mail-Programm öffnen (je nach App/Browser nicht überall möglich) und die Adresse immer in die Zwischenablage legen */
  _kontaktMail() {
    const mail = `mailto:${SUPPORT_MAIL}?subject=${encodeURIComponent(PRODUCT + " – Frage / Fehler")}&body=${encodeURIComponent("\n\n---\nVersion: " + (this._ver || "–"))}`;
    this._clip(SUPPORT_MAIL, `E-Mail-Adresse kopiert: ${SUPPORT_MAIL}`);
    try { const a = document.createElement("a"); a.href = mail; a.style.display = "none"; document.body.appendChild(a); a.click(); a.remove(); } catch (_) { try { window.location.href = mail; } catch (__) { /* Adresse ist kopiert */ } }
  }
