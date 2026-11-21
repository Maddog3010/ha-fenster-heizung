/* Modul 15 · Wartung & Erinnerungen (v0.2 Build 2): Termine, Ampel, Bearbeiten */
const CSS_WT = `
.wtk{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.wtk>div{position:relative;border:1px solid var(--line);border-radius:16px;padding:12px 14px 12px 18px;background:color-mix(in srgb,var(--primary-text-color) 4%,var(--card));overflow:hidden}
.wtk>div::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--wtc,#2dd4bf)}
.wtk small{display:block;color:var(--mut);font-size:.74rem}.wtk b{display:block;font-size:1.45rem;font-weight:800;color:var(--wtc,inherit);margin-top:2px}
.wtk .r{--wtc:#f87171}.wtk .a{--wtc:#fbbf24}.wtk .g{--wtc:#2dd4bf}.wtk .l{--wtc:#a78bfa}
.wtbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}.wtbar .btn2{flex:none;padding:10px 16px}
.wtl{display:grid;gap:8px}
.wtr{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;border:1px solid var(--line);border-radius:16px;padding:10px 12px;background:color-mix(in srgb,var(--primary-text-color) 3%,var(--card))}
.wtr.over{border-color:rgba(248,113,113,.55)}.wtr.off{opacity:.55}
.wtring{--p:0;--c:#2dd4bf;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--c) calc(var(--p)*1%),color-mix(in srgb,var(--primary-text-color) 12%,transparent) 0)}
.wtring>span{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--card);color:var(--c)}
.wtr .t{min-width:0}.wtr .t b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wtr .t small{display:block;color:var(--mut);font-size:.78rem;line-height:1.35}
.wtst{display:inline-block;font-size:.68rem;font-weight:800;border-radius:999px;padding:2px 9px;margin-top:4px}
.wtst.ok{background:rgba(45,212,191,.16);color:#2dd4bf}.wtst.soon{background:rgba(251,191,36,.16);color:#fbbf24}.wtst.due,.wtst.over{background:rgba(248,113,113,.18);color:#f87171}.wtst.new,.wtst.off{background:rgba(167,139,250,.16);color:#c4b5fd}
.wtbtns{display:flex;gap:6px;align-items:center}.wtbtns button{border:1px solid var(--line);background:transparent;color:inherit;border-radius:12px;padding:8px 11px;font:inherit;font-weight:700;font-size:.8rem;cursor:pointer;display:inline-flex;gap:5px;align-items:center}
.wtbtns .wtok{background:#2dd4bf;color:#06201c;border-color:#2dd4bf}.wtbtns .wtun{border:0;padding:4px 6px;color:var(--mut);text-decoration:underline;font-weight:600}
.wted{display:grid;gap:10px}.wted .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.wted label{display:block;font-size:.78rem;color:var(--mut);margin-bottom:2px}
.wted .inl{display:grid;grid-template-columns:90px 1fr;gap:8px}.wted .ck{display:flex;gap:8px;align-items:center;font-size:.88rem}
.wtic{display:flex;flex-wrap:wrap;gap:6px}.wtic button{width:38px;height:38px;border-radius:12px;border:1px solid var(--line);background:transparent;color:inherit;display:grid;place-items:center;cursor:pointer}.wtic button.on{border-color:#2dd4bf;color:#2dd4bf;background:rgba(45,212,191,.12)}
.wttpl{display:flex;flex-wrap:wrap;gap:6px}.wttpl button{border:1px dashed var(--line);background:transparent;color:inherit;border-radius:999px;padding:6px 11px;font:inherit;font-size:.78rem;cursor:pointer}
.wtacts{display:flex;flex-wrap:wrap;gap:8px}.wtacts .btn2{flex:none;padding:10px 16px}.wtacts .wtdel{margin-left:auto;border-color:#c0504d;color:#e88a87}
.wtempty{text-align:center;padding:22px 12px}.wtempty p{color:var(--mut);margin:6px auto 12px;max-width:420px;line-height:1.45}
@media(max-width:640px){.wtk{grid-template-columns:repeat(2,minmax(0,1fr))}.wtr{grid-template-columns:auto 1fr}.wtbtns{grid-column:1/-1;justify-content:flex-end}.wted .row{grid-template-columns:1fr}}
`;
