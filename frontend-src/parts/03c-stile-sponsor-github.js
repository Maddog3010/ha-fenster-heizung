/* Sponsor-Lounge · Mit GitHub freischalten (Konzept Sponsor-Freischaltung, Stufe 2) */
const CSS_GH = `
.ghhero{display:flex;gap:14px;align-items:center;margin:2px 0 12px}.ghhero b{display:block;font-size:1rem;margin-bottom:3px}.ghhero span{font-size:.84rem;color:var(--mut);line-height:1.4}
.ghlogo{flex:none;width:52px;height:52px;border-radius:16px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#ec4899,#2dd4bf)}
.ghsteps{display:flex;gap:6px;margin:4px 0 12px}.ghsteps span{flex:1;text-align:center;font-size:.72rem;font-weight:600;padding:6px 4px;border-radius:99px;background:color-mix(in srgb,var(--primary-text-color) 6%,transparent);color:var(--mut)}
.ghsteps .cur{background:color-mix(in srgb,#2dd4bf 22%,transparent);color:var(--primary-text-color)}.ghsteps .dn{color:#2dd4bf}
.ghlist{display:flex;flex-direction:column;gap:8px;margin:0 0 6px}.ghlist div{display:flex;gap:9px;align-items:flex-start;font-size:.84rem;line-height:1.4}.ghlist svg{flex:none;margin-top:2px;color:#2dd4bf}
.ghcodebox{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;background:color-mix(in srgb,var(--primary-text-color) 5%,transparent);border-radius:18px;padding:16px 12px 14px}
.ghcodebox small{font-size:.76rem;color:var(--mut)}.ghuri{font-weight:700;color:#5eead4;text-decoration:none;font-size:.95rem}
.ghcode{font:800 2rem/1.1 ui-monospace,Menlo,monospace;letter-spacing:.14em;color:var(--primary-text-color);padding:6px 0 4px;user-select:all}
.ghc{justify-content:center;margin-top:4px}.ghc .btn2{flex:none;white-space:nowrap}.ghwait{display:flex;align-items:center;gap:8px;font-size:.8rem;color:var(--mut);margin-top:8px}
.ghspin{width:14px;height:14px;border-radius:50%;border:2px solid color-mix(in srgb,#2dd4bf 30%,transparent);border-top-color:#2dd4bf;animation:ghsp 1s linear infinite}@keyframes ghsp{to{transform:rotate(360deg)}}
.ghres{display:flex;gap:12px;align-items:center;border-radius:16px;padding:12px 14px;margin:0 0 10px}.ghres div>b{display:block;font-size:.98rem}.ghres span{font-size:.82rem;color:var(--mut);line-height:1.4}
.ghres.ok{background:color-mix(in srgb,#22c55e 12%,transparent)}.ghres.ok>svg{color:#4ade80}.ghres.wa{background:color-mix(in srgb,#f59e0b 12%,transparent)}.ghres.wa>svg{color:#fbbf24}
.ghrows{border-radius:14px;background:color-mix(in srgb,var(--primary-text-color) 4%,transparent);padding:2px 12px}
.ghrow{display:flex;justify-content:space-between;gap:10px;padding:8px 0;font-size:.84rem;border-bottom:1px solid var(--line)}.ghrow:last-child{border-bottom:0}.ghrow span{color:var(--mut)}.ghrow b{text-align:right;font-weight:600}
.ghrow b.gd{color:#fbbf24}.ghrow b.pk{color:#f472b6}.ghrow b.okc{color:#4ade80}.ghrow b.wa{color:#fbbf24}
.ghalt{display:flex;justify-content:center;gap:8px;margin-top:10px;font-size:.78rem;color:var(--mut)}.ghalt .lnk{font-size:.78rem}
.ghfine{margin-top:10px;font-size:.72rem;line-height:1.4;text-align:center;opacity:.8}
.ghinfo{display:flex;gap:10px;align-items:flex-start;font-size:.86rem;line-height:1.45;background:color-mix(in srgb,#38bdf8 10%,transparent);border-radius:14px;padding:12px}
.lgchip.gh{display:inline-flex;align-items:center;gap:5px}.ghtiers{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end}
/* Kopf am Handy (schmale Ansicht): Name, Titel und Version lesbar, Knöpfe kompakter */
.bar.nar{gap:4px;padding:8px 8px}
.bar.nar .ib0{padding:4px}
.bar.nar .pillbtn{padding:6px;gap:0}.bar.nar .pillbtn svg{width:16px;height:16px}
.bar.nar .pillbtn.spnb.gold{box-shadow:0 0 8px rgba(251,191,36,.35)}
.bar.nar .brand{gap:7px}.bar.nar .blogo{width:34px;height:34px}
.bar.nar .brand .pn{font-size:.56rem;letter-spacing:.07em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:1px}
.bar.nar .brand b{font-size:.86rem;line-height:1.2;letter-spacing:-.01em}
.bar.nar .brand div span{font-size:.68rem;margin-top:1px}
.bar.nar .mvb{padding:0 6px;margin-right:4px;font-size:.66rem}.bar.nar .mvb .mvbb{display:none}
@media(max-width:360px){.bar.nar .brand .pn{display:none}}
/* Weg zurück, wenn der Entwickler-Zugang zum Testen aus ist (Beta-Sperre, Schlüssel-Fenster) */
.bldev{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;margin:12px 0;padding:12px 14px;border-radius:14px;background:color-mix(in srgb,#a78bfa 14%,transparent);border:1px solid color-mix(in srgb,#a78bfa 40%,transparent);font-size:.84rem;line-height:1.4}
.bldev>svg{color:#c4b5fd;flex:none}.bldev>span{flex:1;min-width:180px}.bldev .btn2{flex:none}.bldev .lnk{font-size:.8rem}
`;
