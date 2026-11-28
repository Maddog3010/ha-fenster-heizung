/* Strom & Wärme – Dashboard-Karte „Grundriss“ (custom:sw-grundriss-card), Modul 0 Build 8.
   Klein und ohne Abhängigkeiten: Der Zeichner (_grDraw) steckt in panel.js und wird erst geladen, wenn die Karte wirklich im Dashboard steht.
   Daten: WebSocket fenster_heizung/gr_get (für alle Benutzer lesbar).

   type: custom:sw-grundriss-card
   titel: Unser Haus          # optional
   etage: EG                  # Name oder Kürzel der Etage, ohne = Umschalter
   stil: modern               # modern | bauplan | hell | karte
   ebenen: [jetzt, licht, melder, geraete]
   tippen: raum               # raum (Raum-Blatt) | modul0 | nichts
*/
const SWG_V = new URL(import.meta.url).search;
const SWG_ESC = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let SWG_LOAD = null;
const swgRenderer = () => {
  if (!SWG_LOAD) SWG_LOAD = (customElements.get("fenster-heizung-panel") ? Promise.resolve() : import(new URL("panel.js" + SWG_V, import.meta.url).href)).then(() => customElements.whenDefined("fenster-heizung-panel"));
  return SWG_LOAD;
};

class SwGrundrissCard extends HTMLElement {
  static getStubConfig() { return { type: "custom:sw-grundriss-card", stil: "modern", ebenen: ["jetzt", "licht", "melder", "geraete"], tippen: "raum" }; }
  static getConfigForm() {
    return {
      schema: [
        { name: "titel", selector: { text: {} } },
        { name: "etage", selector: { text: {} } },
        { name: "stil", selector: { select: { mode: "dropdown", options: [{ value: "modern", label: "Modern" }, { value: "bauplan", label: "Bauplan" }, { value: "hell", label: "Hell" }, { value: "karte", label: "Karte" }] } } },
        { name: "ebenen", selector: { select: { multiple: true, options: [{ value: "jetzt", label: "Jetzt (Temperatur, Bewegung)" }, { value: "licht", label: "Lampen" }, { value: "melder", label: "Melder" }, { value: "geraete", label: "Mobile Geräte" }] } } },
        { name: "tippen", selector: { select: { mode: "dropdown", options: [{ value: "raum", label: "Raum-Blatt" }, { value: "modul0", label: "Modul 0 öffnen" }, { value: "nichts", label: "Nichts" }] } } },
      ],
      computeLabel: (s) => ({ titel: "Titel", etage: "Etage (leer = Umschalter)", stil: "Stil", ebenen: "Ebenen", tippen: "Antippen eines Raums" })[s.name] || s.name,
    };
  }
  setConfig(c) { this._c = { stil: "modern", ebenen: ["jetzt", "licht", "melder", "geraete"], tippen: "raum", ...(c || {}) }; this._z = null; this._draw(); }
  getCardSize() { return 6; }
  getGridOptions() { return { columns: 12, min_columns: 6, rows: 6, min_rows: 3 }; }
  set hass(h) {
    this._h = h;
    const now = Date.now();
    if (!this._d || now - (this._dt || 0) > 300000) this._load();
    if (now - (this._last || 0) > 2000) { this._last = now; this._draw(); }
    else if (!this._tm) this._tm = setTimeout(() => { this._tm = null; this._last = Date.now(); this._draw(); }, 2000);
  }
  connectedCallback() { if (this._h) this._draw(); }
  _load() {
    if (this._busy || !this._h) return; this._busy = true;
    this._h.callWS({ type: "fenster_heizung/gr_get" }).then((d) => { this._d = d || {}; this._err = false; }).catch(() => { this._err = true; }).finally(() => { this._busy = false; this._dt = Date.now(); this._draw(); });
    swgRenderer().then(() => this._draw()).catch(() => { this._rerr = true; this._draw(); });
  }
  _r() {
    if (!customElements.get("fenster-heizung-panel")) return null;
    if (!this._R) { this._R = document.createElement("fenster-heizung-panel"); this._R._toast = () => {}; this._R._render = () => {}; }
    const R = this._R; R._hass = this._h; R._grS = { d: this._d, ts: Date.now(), busy: false, err: false }; R._grSty = this._c.stil;
    if (!R._liLampHex) R._liLampHex = (e) => { const a = (this._h.states[e] || {}).attributes || {}, c = a.rgb_color; return Array.isArray(c) ? `rgb(${c.join(",")})` : "#ffd27a"; };
    return R;
  }
  _root() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `<style>
        :host{display:block}ha-card{overflow:hidden;padding:12px}.hd{display:flex;align-items:center;gap:8px;margin:0 2px 8px}.hd b{font-size:1.05rem;flex:1}
        .fl{display:flex;gap:4px}.fl button{border:1px solid var(--divider-color,#3334);background:none;color:var(--primary-text-color);border-radius:999px;padding:4px 11px;font:inherit;font-size:.8rem;font-weight:700;cursor:pointer}.fl button.on{border-color:var(--primary-color);color:var(--primary-color)}
        .pl{position:relative;border-radius:12px;overflow:hidden}svg{display:block;width:100%;height:auto;touch-action:pan-y}svg.zm{touch-action:none}
        .msg{padding:28px 12px;text-align:center;color:var(--secondary-text-color)}
        .ov{position:absolute;inset:0;background:#0007;display:flex;align-items:flex-end;justify-content:center}.sh{background:var(--card-background-color,#1c1c1c);color:var(--primary-text-color);border-radius:16px 16px 0 0;width:100%;max-width:460px;padding:14px 16px 16px;box-shadow:0 -6px 24px #0006}
        .sh .t{display:flex;align-items:center}.sh .t b{flex:1;font-size:1.05rem}.sh .t small{display:block;color:var(--secondary-text-color);font-weight:400}.x{border:0;background:none;color:inherit;font-size:20px;cursor:pointer}
        .row{display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid var(--divider-color,#3334);font-size:.9rem}.row span{color:var(--secondary-text-color)}
        .lp{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.lp button{border:1px solid var(--divider-color,#3334);background:none;color:inherit;border-radius:999px;padding:5px 12px;font:inherit;font-size:.82rem;cursor:pointer}.lp button.on{border-color:#f59e0b;background:#f59e0b22}
        .go{margin-top:12px;width:100%;border:0;border-radius:10px;padding:10px;background:var(--primary-color);color:var(--text-primary-color,#fff);font:inherit;font-weight:700;cursor:pointer}</style><ha-card><div id="c"></div></ha-card>`;
      this._bind();
    }
    return this.shadowRoot.getElementById("c");
  }
  _fls() { const P = this._d && this._d.plan; return P && P.floors && P.floors.length ? P.floors : [{ id: "eg", n: "EG" }]; }
  _fl() {
    const F = this._fls(), want = String(this._c.etage || "").toLowerCase();
    if (want) { const f = F.find((x) => x.id.toLowerCase() === want || String(x.n).toLowerCase() === want); if (f) return f.id; }
    return F.some((f) => f.id === this._sel) ? this._sel : F[0].id;
  }
  _draw() {
    if (!this._c || !this._h) return;
    const c = this._root(), P = this._d && this._d.plan;
    if (this._rerr) { c.innerHTML = `<div class="msg">Die Karte passt nicht zur installierten Version von Strom &amp; Wärme – bitte die Seite neu laden.</div>`; return; }
    if (this._err) { c.innerHTML = `<div class="msg">Grundriss gerade nicht erreichbar.</div>`; return; }
    if (!P) { c.innerHTML = `<div class="msg">Grundriss wird geladen …</div>`; return; }
    if (!(P.items || []).some((i) => i.t === "r")) { c.innerHTML = `<div class="msg">Noch kein Grundriss – zeichnen in Strom &amp; Wärme → Modul 0.</div>`; return; }
    const R = this._r(); if (!R) { c.innerHTML = `<div class="msg">Grundriss wird geladen …</div>`; return; }
    const fl = this._fl(), E = new Set(this._c.ebenen || []), sty = ["modern", "bauplan", "hell", "karte"].includes(this._c.stil) ? this._c.stil : "modern";
    let G;
    const opt = { style: sty, dims: false, narrow: (this.clientWidth || 600) < 420, click: this._c.tippen !== "nichts", layers: { licht: E.has("licht"), sf: E.has("melder"), gt: E.has("geraete") } };
    try { G = R._grDraw(P, fl, { ...opt, now: E.has("jetzt") }); } catch (_) { try { G = R._grDraw(P, fl, { ...opt, now: false }); } catch (e) { c.innerHTML = `<div class="msg">Der Grundriss konnte nicht gezeichnet werden.</div>`; return; } }
    const vb = G.vb, z = this._z && this._z.fl === fl ? this._z : null, w = z ? vb.w / z.s : vb.w, h = z ? vb.h / z.s : vb.h;
    const cx = z ? Math.max(vb.x + w / 2, Math.min(vb.x + vb.w - w / 2, z.cx)) : vb.x + vb.w / 2, cy = z ? Math.max(vb.y + h / 2, Math.min(vb.y + vb.h - h / 2, z.cy)) : vb.y + vb.h / 2;
    const F = this._fls(), bar = !this._c.etage && F.length > 1 ? `<span class="fl">${F.map((f) => `<button class="${f.id === fl ? "on" : ""}" data-fl="${SWG_ESC(f.id)}">${SWG_ESC(f.n)}</button>`).join("")}</span>` : "";
    const open = this._open ? this._sheet(P, this._open) : "";
    c.innerHTML = `${this._c.titel || bar ? `<div class="hd"><b>${SWG_ESC(this._c.titel || "")}</b>${bar}</div>` : ""}<div class="pl"><svg class="${z && z.s > 1 ? "zm" : ""}" data-vb="${vb.x} ${vb.y} ${vb.w} ${vb.h}" data-fl="${SWG_ESC(fl)}" viewBox="${cx - w / 2} ${cy - h / 2} ${w} ${h}" role="img" aria-label="Grundriss">${G.svg}</svg>${open}</div>`;
  }
  _sheet(P, id) {
    const R = this._R, r = (P.items || []).find((i) => i.id === id); if (!r || !R) return "";
    const st = this._h.states, a = R._grArea ? R._grArea(r) : null, sc = P.scale > 0 ? P.scale : 40;
    let temp = "–";
    try { const m = R._gpMatch(r, R._gpAll()), s = m && !m.ms ? R._rkState(m) : null; if (s && s.cur != null) temp = `${String(s.cur.toFixed(1)).replace(".", ",")} °C`; } catch (_) { /* Modul 1 fehlt */ }
    const lamps = Object.keys(st).filter((e) => e.startsWith("light.") && ((a && R._grEntArea(e) === a.id) || (P.items || []).some((i) => i.t === "l" && i.e === e && i.fl === r.fl && R._sfInRoom(r, i.x, i.y)))).slice(0, 12);
    return `<div class="ov" data-close="1"><div class="sh"><div class="t"><b>${SWG_ESC(r.n || (a && a.name) || "Raum")}<small>${String((R._grAreaM2(r, sc)).toFixed(1)).replace(".", ",")} m²${a ? ` · ${SWG_ESC(a.name)}` : ""}</small></b><button class="x" data-close="1" aria-label="Schließen">✕</button></div>
      <div class="row"><span>Temperatur</span><b>${temp}</b></div>
      ${lamps.length ? `<div class="row" style="border-bottom:0"><span>Lampen</span><b>${lamps.filter((e) => st[e].state === "on").length} von ${lamps.length} an</b></div><div class="lp">${lamps.map((e) => `<button class="${st[e].state === "on" ? "on" : ""}" data-lamp="${SWG_ESC(e)}">${SWG_ESC((st[e].attributes || {}).friendly_name || e)}</button>`).join("")}</div>` : ""}
      <button class="go" data-go="1">In Strom &amp; Wärme öffnen</button></div></div>`;
  }
  _bind() {
    const sr = this.shadowRoot, ptrs = new Map(); let st = null, lastTap = 0, moved = 0;
    const svgOf = (e) => e.target.closest && e.target.closest("svg");
    const toPlan = (svg, x, y) => { const b = svg.getBoundingClientRect(), v = svg.viewBox.baseVal; return [v.x + ((x - b.left) / b.width) * v.width, v.y + ((y - b.top) / b.height) * v.height]; };
    const zoom = (fl, s, cx, cy) => { this._z = { fl, s: Math.max(1, Math.min(8, s)), cx, cy }; this._draw(); };
    sr.addEventListener("click", (e) => {
      const t = e.target;
      if (Date.now() - moved < 350) return;
      const fb = t.closest && t.closest("[data-fl]"); if (fb && fb.tagName === "BUTTON") { this._sel = fb.dataset.fl; this._z = null; this._draw(); return; }
      const lb = t.closest && t.closest("[data-lamp]"); if (lb) { const en = lb.dataset.lamp, s = this._h.states[en]; this._h.callService("light", s && s.state === "on" ? "turn_off" : "turn_on", { entity_id: en }); return; }
      if (t.closest && t.closest("[data-go]")) { try { localStorage.setItem("fh_mod_active", "gr"); } catch (_) { /* egal */ } history.pushState(null, "", "/fenster-heizung"); window.dispatchEvent(new CustomEvent("location-changed")); return; }
      if (t.dataset && t.dataset.close) { this._open = null; this._draw(); return; }
      const rk = t.closest && t.closest('[data-act="grxroom"]');
      if (rk) { const now = Date.now(); if (now - lastTap < 320) { this._z = null; this._open = null; this._draw(); lastTap = 0; return; } lastTap = now;
        if (this._c.tippen === "modul0") { try { localStorage.setItem("fh_mod_active", "gr"); } catch (_) { /* egal */ } history.pushState(null, "", "/fenster-heizung"); window.dispatchEvent(new CustomEvent("location-changed")); return; }
        if (this._c.tippen === "raum") { setTimeout(() => { if (lastTap === now) { this._open = rk.dataset.k; this._draw(); } }, 330); } }
      else if (svgOf(e)) { const now = Date.now(); if (now - lastTap < 320) { this._z = null; this._draw(); } lastTap = now; }
    });
    sr.addEventListener("pointerdown", (e) => { const svg = svgOf(e); if (!svg) return; ptrs.set(e.pointerId, [e.clientX, e.clientY]); const v = svg.viewBox.baseVal, z = this._z && this._z.fl === svg.dataset.fl ? this._z : { s: 1 };
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; st = { pinch: true, d0: Math.hypot(a[0] - b[0], a[1] - b[1]), s0: z.s, mid: toPlan(svg, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2), fl: svg.dataset.fl }; }
      else st = { x: e.clientX, y: e.clientY, cx: v.x + v.width / 2, cy: v.y + v.height / 2, s: z.s, sc: v.width / svg.getBoundingClientRect().width, fl: svg.dataset.fl, mv: false }; });
    sr.addEventListener("pointermove", (e) => { if (!st || !ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (st.pinch && ptrs.size >= 2) { const [a, b] = [...ptrs.values()]; zoom(st.fl, st.s0 * Math.hypot(a[0] - b[0], a[1] - b[1]) / Math.max(20, st.d0), st.mid[0], st.mid[1]); moved = Date.now(); return; }
      if (st.pinch || st.s <= 1.001) return; const dx = e.clientX - st.x, dy = e.clientY - st.y; if (!st.mv && Math.hypot(dx, dy) < 6) return; st.mv = true; moved = Date.now(); zoom(st.fl, st.s, st.cx - dx * st.sc, st.cy - dy * st.sc); });
    const up = (e) => { ptrs.delete(e.pointerId); if (!ptrs.size) st = null; };
    sr.addEventListener("pointerup", up); sr.addEventListener("pointercancel", up);
    sr.addEventListener("wheel", (e) => { const svg = svgOf(e); if (!svg || !(e.ctrlKey || e.metaKey)) return; e.preventDefault(); const fl = svg.dataset.fl, z = this._z && this._z.fl === fl ? this._z : { s: 1 }, [px, py] = toPlan(svg, e.clientX, e.clientY), s = Math.max(1, Math.min(8, z.s * Math.exp(-e.deltaY * 0.0025))), v = svg.viewBox.baseVal, cx = v.x + v.width / 2, cy = v.y + v.height / 2; zoom(fl, s, px + (cx - px) * (z.s / s), py + (cy - py) * (z.s / s)); }, { passive: false });
  }
}
if (!customElements.get("sw-grundriss-card")) customElements.define("sw-grundriss-card", SwGrundrissCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "sw-grundriss-card")) window.customCards.push({ type: "sw-grundriss-card", name: "Grundriss (Strom & Wärme)", description: "Der Plan aus Modul 0 mit Temperaturen, Lampen, Meldern und Geräten.", preview: true, documentationURL: "https://github.com/Maddog3010/ha-fenster-heizung" });
