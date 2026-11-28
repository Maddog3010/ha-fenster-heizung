  /* Raum-Register (v0.17, Teil C): eine Stelle, die jedes Modul nach Räumen fragt – statt eigener Zuordnung (gmap).
     _grRoom(id) liefert den Eintrag, _grRoomOf(entity) den Raum eines Sensors, _grRegister() alle Räume. Ohne Plan: leer. */
  _grInRoom(r, x, y) {
    const p = r.pts;
    if (Array.isArray(p) && p.length >= 3) { let ins = false; p.forEach((a, i) => { const b = p[(i + 1) % p.length]; if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1] || 1e-9) + a[0]) ins = !ins; }); return ins; }
    return x >= r.x && x <= r.x + (r.w || 0) && y >= r.y && y <= r.y + (r.h || 0);
  }
  _grRegister() {
    const P = this._grPlan(); if (!P || P.error) return [];
    const sc = P.scale > 0 ? P.scale : 40, I = P.items || [], hh = this._hass || {}, ER = hh.entities || {}, DV = hh.devices || {};
    return I.filter((r) => r.t === "r" && String(r.n || "").trim()).map((r) => {
      const a = this._grArea(r), inn = (i) => i.fl === r.fl && this._grInRoom(r, i.x + (i.w || 0) / 2, i.y + (i.h || 0) / 2);
      const m2 = Math.round((Array.isArray(r.pts) && r.pts.length >= 3 ? Math.abs(r.pts.reduce((t, a, i) => { const b = r.pts[(i + 1) % r.pts.length]; return t + a[0] * b[1] - b[0] * a[1]; }, 0)) / 2 : (r.w || 0) * (r.h || 0)) / (sc * sc) * 10) / 10, h = (r.hh || 250) / 100;
      const win = I.filter((i) => i.t === "f" && inn(i)), ents = I.filter((i) => i.e && inn(i)).map((i) => i.e);
      return { id: r.id, n: r.n, fl: r.fl, area: a ? a.id : "", m2, vol: Math.round(m2 * h * 10) / 10, boden: r.fm || "", fenster: win.length, tueren: I.filter((i) => i.t === "d" && inn(i)).length, ents };
    });
  }
  _grRoom(id) { return this._grRegister().find((r) => r.id === id) || null; }
  _grRoomOf(entity) {
    const R = this._grRegister(); if (!R.length || !entity) return null;
    const hit = R.find((r) => r.ents.includes(entity)); if (hit) return hit;
    const hh = this._hass || {}, e = (hh.entities || {})[entity], d = e && e.device_id ? (hh.devices || {})[e.device_id] : null, aid = (e && e.area_id) || (d && d.area_id) || "";
    return (aid && R.find((r) => r.area === aid)) || null;
  }
