  /* Raum-Register (v0.17, Teil C): eine Stelle, die jedes Modul nach Räumen fragt – statt eigener Zuordnung (gmap).
     _grRoom(id) liefert den Eintrag, _grRoomOf(entity) den Raum eines Sensors, _grRegister() alle Räume. Ohne Plan: leer. */
  _grInRoom(r, x, y) {
    const p = r.pts;
    if (Array.isArray(p) && p.length >= 3) { let ins = false; p.forEach((a, i) => { const b = p[(i + 1) % p.length]; if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1] || 1e-9) + a[0]) ins = !ins; }); return ins; }
    return x >= r.x && x <= r.x + (r.w || 0) && y >= r.y && y <= r.y + (r.h || 0);
  }
  _grRegister() {
    const P = this._grPlan(); if (!P || P.error) return [];
    const c = this._grRegC; if (c && c.h === this._hass && c.P === P) return c.R;   /* je Zustandsstand nur einmal rechnen */
    const R = this._grRegister0(P); this._grRegC = { h: this._hass, P, R }; return R;
  }
  _grRegister0(P) {
    const sc = P.scale > 0 ? P.scale : 40, I = P.items || [], hh = this._hass || {}, ER = hh.entities || {}, DV = hh.devices || {};
    return I.filter((r) => r.t === "r" && String(r.n || "").trim()).map((r) => {
      const a = this._grArea(r), inn = (i) => i.fl === r.fl && this._grInRoom(r, i.x + (i.w || 0) / 2, i.y + (i.h || 0) / 2);
      const m2 = Math.round((Array.isArray(r.pts) && r.pts.length >= 3 ? Math.abs(r.pts.reduce((t, a, i) => { const b = r.pts[(i + 1) % r.pts.length]; return t + a[0] * b[1] - b[0] * a[1]; }, 0)) / 2 : (r.w || 0) * (r.h || 0)) / (sc * sc) * 10) / 10, h = (r.hh || 250) / 100;
      const win = I.filter((i) => i.t === "f" && inn(i)), ents = I.filter((i) => i.e && inn(i)).map((i) => i.e);
      return { id: r.id, n: r.n, fl: r.fl, area: a ? a.id : "", m2, vol: Math.round(m2 * h * 10) / 10, boden: r.fm || "", fenster: win.length, tueren: I.filter((i) => i.t === "d" && inn(i)).length, ents };
    });
  }
  /* Himmelsrichtung eines Fensters (Grad, 0 = Norden): vom Raum-Mittelpunkt nach außen, mit der Nordrichtung des Plans (P.north) */
  _grWinDeg(w, P) {
    const I = P.items || [], r = I.find((q) => q.t === "r" && q.fl === w.fl && this._grInRoom(q, w.x + (w.w || 0) / 2, w.y + (w.h || 0) / 2)); if (!r) return null;
    const c = Array.isArray(r.pts) && r.pts.length >= 3 ? [r.pts.reduce((t, a) => t + a[0], 0) / r.pts.length, r.pts.reduce((t, a) => t + a[1], 0) / r.pts.length] : [r.x + (r.w || 0) / 2, r.y + (r.h || 0) / 2];
    const dx = w.x + (w.w || 0) / 2 - c[0], dy = w.y + (w.h || 0) / 2 - c[1]; if (!dx && !dy) return null;
    const a = (Math.atan2(dx, -dy) * 180) / Math.PI; return (((a + (P.north || 0)) % 360) + 360) % 360;
  }
  /* offene Fenster (Kontakt an) mit Himmelsrichtung; Wetter: Wind kommt aus bearing, betroffen = Fenster auf der Windseite (±70°) */
  _grOpenWins(bearing) {
    const P = this._grPlan(), st = this._hass.states; if (!P || P.error) return [];
    return (P.items || []).filter((i) => i.t === "f" && i.e && st[i.e] && ["on", "open"].includes(st[i.e].state)).map((i) => ({ id: i.id, deg: this._grWinDeg(i, P) })).filter((x) => bearing == null || x.deg == null || Math.abs((((x.deg - bearing) % 360) + 540) % 360 - 180) <= 70);
  }
  _grRoom(id) { return this._grRegister().find((r) => r.id === id) || null; }
  _grRoomOf(entity) {
    const R = this._grRegister(); if (!R.length || !entity) return null;
    const hit = R.find((r) => r.ents.includes(entity)); if (hit) return hit;
    const hh = this._hass || {}, e = (hh.entities || {})[entity], d = e && e.device_id ? (hh.devices || {})[e.device_id] : null, aid = (e && e.area_id) || (d && d.area_id) || "";
    return (aid && R.find((r) => r.area === aid)) || null;
  }
