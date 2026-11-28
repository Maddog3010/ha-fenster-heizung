  /* D6 Nebengebäude: Garage, Gartenhaus oder Carport als eigenes kleines Gebäude mit eigenem Raum auf der Etage „Außen“ (Grundstück) */
  _grNbList() { return [["garage", "Garage", 240, 120, 1], ["gartenhaus", "Gartenhaus", 120, 120, 1], ["carport", "Carport", 200, 120, 0]]; }
  _grNbBox() {
    return `<div class="sffld"><label>Nebengebäude hinzufügen</label><div class="grseg">${this._grNbList().map(([k, n]) => `<button data-act="grxnb" data-v="${k}">${n}</button>`).join("")}</div><div class="mut sm">Kommt auf die Etage „Außen“ (wird bei Bedarf angelegt) – Größe und Lage änderst du danach im Plan.</div></div>`;
  }
  _grNbAdd(k) {
    const T = this._grNbList().find((x) => x[0] === k), ed = this._sfEd; if (!T || !ed) return;
    this._sfSnap(); const P = ed.plan; let f = P.floors.find((q) => q.ga); if (!f) { f = { id: P.floors.some((q) => q.id === "aussen") ? "aussen2" : "aussen", n: "Außen", ga: 1 }; P.floors.push(f); }
    const fl = f.id, n = P.items.filter((i) => i.fl === fl && i.t === "r").length, x = 40 + (n % 6) * 30, y = 40 + (n % 6) * 30, [, nm, w, h, walls] = T, uid = () => "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    P.items.push({ id: uid(), fl, t: "r", x, y, w, h, r: 0, n: nm, e: "" });
    if (walls) [[x, y, x + w, y], [x + w, y, x + w, y + h], [x, y + h, x + w, y + h], [x, y, x, y + h]].forEach(([a, b, c, d]) => P.items.push({ id: uid(), fl, t: "w", x: a, y: b, x2: c, y2: d, r: 0, n: "", e: "" }));
    this._sfFlId = fl; this._grFl = fl; this._render(); this._toast(`${nm} hinzugefügt (Etage „${f.n}“)`);
  }
