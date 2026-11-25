/* Tablet-Modus · Modulseiten ohne Scrollen (Stufe 2: Modul 1 und 2) */
const CSS_TM2M = `
.tm2tabs{flex:none;display:flex;gap:4px;padding:4px;border-radius:16px;border:1px solid var(--line);background:var(--card)}
.tm2tabs button{min-width:96px;min-height:44px;padding:0 16px;border:0;border-radius:12px;background:none;color:var(--mut);font:inherit;font-weight:700;cursor:pointer}
.tm2tabs button.sel{background:var(--teal);color:var(--on-acc,#04201d)}
.tm2h .tm2tabs{margin-right:14px}
.tm2tr{flex:none;display:flex;padding:6px 16px 0}.tm2tr .tm2tabs{flex:1}.tm2tr .tm2tabs button{flex:1}
.tm2 .tmbody.tm2mod{display:flex;flex-direction:column;gap:10px}
.tm2mod>.card,.tm2mod .tm2four>.card,.tm2mod .tm2stat>.card,.tm2mod .tm2wwh>.card,.tm2mod .tm2wwr>.card{margin:0;min-width:0;min-height:0}
.tm2none{margin:auto;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;padding:32px 48px}
.tm2mini{flex:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:44px;padding:0 14px;border-radius:12px;border:1px solid var(--line);background:rgba(127,127,127,.08);color:inherit;font:inherit;font-size:.85rem;font-weight:600;cursor:pointer}
.tm2sh{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:44px}
.tm2sh>span:first-child{display:flex;align-items:center;gap:8px;font-weight:700;min-width:0}
.tm2sh em{font-style:normal;font-size:.76rem;font-weight:600;color:var(--mut)}.tm2sh em.on{color:var(--teal)}
.tm2swr{display:inline-flex;align-items:center;gap:8px}.tm2shr{display:flex;align-items:center;gap:14px}
/* ---------- Modul 1: Räume ---------- */
.tm2top{flex:none;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.tm2pres{display:flex;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--card)}
.tm2pres button{display:flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 18px;border:0;background:none;color:var(--mut);font:inherit;font-weight:700;cursor:pointer}
.tm2pres button+button{border-left:1px solid var(--line)}
.tm2pres button.sel{background:color-mix(in srgb,var(--teal) 18%,transparent);color:var(--primary-text-color)}
.tm2pres button[disabled]{cursor:default;opacity:.65}
.tm2chips{flex:1;min-width:0;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}
.tm2chip{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:inherit;font:inherit;font-size:.85rem;white-space:nowrap}
button.tm2chip{min-height:44px;cursor:pointer}.tm2chip.wa{border-color:color-mix(in srgb,var(--amber) 65%,transparent);color:var(--amber)}
.tm2swb{flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;touch-action:pan-y}
.tm2rooms{flex:1;min-height:0;display:grid;grid-template-columns:repeat(var(--c),minmax(0,1fr));grid-template-rows:repeat(var(--r),minmax(0,1fr));gap:10px}
.tm2rooms.r1{grid-template-rows:minmax(0,380px);align-content:start}
.tm2room{min-width:0;min-height:0;overflow:hidden;display:flex;flex-direction:column;border-radius:18px;border:1px solid var(--line);background:var(--card);padding:10px;gap:6px}
.tm2room.k-offen,.tm2room.k-gekippt,.tm2room.k-pause,.tm2room.k-heizt{border-color:color-mix(in srgb,var(--c) 65%,transparent)}
.tm2room.k-offen,.tm2room.k-gekippt,.tm2room.k-pause{background:color-mix(in srgb,var(--c) 10%,var(--card))}
.tm2ri{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;border:0;background:none;color:inherit;font:inherit;text-align:left;padding:0;cursor:pointer}div.tm2ri{cursor:default}
.tm2rn{flex:none;display:flex;align-items:center;gap:10px;width:100%}
.tm2rn .hti{flex:none;display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:rgba(127,127,127,.12);color:var(--c,var(--teal))}
.tm2rn>span:nth-child(2){flex:1;min-width:0}
.tm2rn b{display:block;font-size:1.05rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tm2rn small{display:block;font-size:.8rem;color:var(--c,var(--mut));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tm2rn i.b{flex:none;display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:rgba(127,127,127,.18);color:var(--teal)}
.tm2rv{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;gap:4px;width:100%;font-size:3rem;font-weight:700;line-height:1}
.tm2rv small{font-size:1rem;font-weight:500;color:var(--mut);align-self:center}
.tm2rf{flex:none;display:block;width:100%;text-align:center;font-size:.82rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tm2pm{flex:none;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.tm2pm button{display:grid;place-items:center;height:56px;border-radius:14px;border:1px solid var(--line);background:rgba(127,127,127,.12);color:inherit;cursor:pointer}
.tm2pm button:disabled{opacity:.3;cursor:default}.tm2pm button:active:not(:disabled){filter:brightness(1.3)}
/* Zwei oder mehr Zeilen auf niedrigen Bildschirmen: enger */
.tm2.short .tm2room{padding:7px;gap:4px}.tm2.short .tm2rn .hti{width:32px;height:32px}.tm2.short .tm2rv{font-size:2.1rem}.tm2.short .tm2pm button{height:44px}
@media(max-height:560px){.tm2.short .tm2rooms.r2 .tm2rf{display:none}}
.tm2.sz-large .tm2rn b{font-size:1.2rem}.tm2.sz-large .tm2rn small,.tm2.sz-large .tm2rf{font-size:.95rem}.tm2.sz-large .tm2rv{font-size:3.4rem}.tm2.sz-large .tm2pm button{height:64px}
.tm2.sz-xl .tm2rn b{font-size:1.35rem}.tm2.sz-xl .tm2rn small,.tm2.sz-xl .tm2rf{font-size:1.05rem}.tm2.sz-xl .tm2rv{font-size:3.6rem}.tm2.sz-xl .tm2pm button{height:64px}.tm2.sz-xl .tm2chip,.tm2.sz-xl .tm2pres button{font-size:1rem}
.tm2.short.sz-large .tm2rv,.tm2.short.sz-xl .tm2rv{font-size:2.2rem}.tm2.short.sz-large .tm2pm button,.tm2.short.sz-xl .tm2pm button{height:48px}
.tm2.port .tm2pres{flex:1 1 100%}.tm2.port .tm2pres button{flex:1}.tm2.port .tm2chips{flex:1 1 100%;justify-content:flex-start;flex-wrap:nowrap;overflow:hidden}
/* ---------- Modul 1: Statistik ---------- */
.tm2sums{flex:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.tm2sum{min-width:0;padding:10px 14px;border-radius:16px;border:1px solid var(--line);border-left:4px solid var(--a);background:var(--card)}
.tm2sum span{display:flex;align-items:center;gap:6px;font-size:.82rem;color:var(--mut)}.tm2sum b{display:block;font-size:1.7rem;line-height:1.25}.tm2sum b small{font-size:.85rem;font-weight:500;color:var(--mut)}.tm2sum em{display:block;font-style:normal;font-size:.8rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tm2.port .tm2mod .tm2sums,.tm2.port.tm2 .tm2sums{grid-template-columns:repeat(2,minmax(0,1fr))}
.tm2stat{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 330px;grid-template-rows:minmax(0,1fr);gap:10px}
.tm2.port .tm2stat{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto}
.tm2cc{display:flex;flex-direction:column;overflow:hidden}.tm2cc h2{flex:none}
.tm2ch{flex:1;min-height:0;overflow:hidden}.tm2ch>svg{display:block}
.tm2sl{display:flex;flex-direction:column;gap:6px;overflow:hidden;touch-action:pan-y}.tm2sl h2{flex:none;margin-bottom:0}
.tm2srs{flex:1;min-height:0;display:grid;grid-template-rows:repeat(var(--n),minmax(44px,1fr));gap:6px}
.tm2.port .tm2srs{flex:none;grid-template-rows:none;grid-auto-rows:54px}
.tm2sr{min-height:0;overflow:hidden;display:flex;align-items:center;gap:10px;padding:0 10px;border-radius:12px;border:1px solid var(--line);background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
.tm2sr i{flex:none;width:10px;height:28px;border-radius:5px}.tm2sr span{flex:1;min-width:0}.tm2sr b{display:block;font-size:.95rem;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tm2sr small{display:block;font-size:.75rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tm2sr>svg{flex:none;transform:rotate(-90deg);color:var(--mut)}
.tm2htr{flex:none;display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;background:color-mix(in srgb,var(--amber) 12%,transparent)}.tm2htr b{display:block;font-size:.9rem}.tm2htr small{display:block;font-size:.75rem;color:var(--mut)}
@media(max-height:1100px){.tm2.port .tm2sum{padding:3px 12px}.tm2.port .tm2sum b{font-size:1.25rem}.tm2.port .tm2sum span,.tm2.port .tm2sum em{font-size:.72rem}.tm2.port .tm2srs{grid-auto-rows:46px;gap:4px}}
/* ---------- Raumfenster ---------- */
@media(min-width:720px){.sheet.wide.tm2rm{width:min(1040px,94vw);max-height:94vh}}
.tm2rm .sh{align-items:center;gap:12px}.tm2rm .sh>div:not(.tm2tabs){flex:1;min-width:0}.tm2rm .sh>.hti{flex:none}
.tm2ctl{display:grid;grid-template-columns:260px minmax(0,1fr);gap:18px}
@media(max-width:899px){.tm2ctl{grid-template-columns:minmax(0,1fr)}.tm2rm .sh{flex-wrap:wrap}.tm2rm .sh .tm2tabs{order:5;flex:1 1 100%}.tm2rm .sh .tm2tabs button{flex:1}}
.tm2cl{display:flex;flex-direction:column;align-items:stretch;justify-content:center;gap:10px}
.tm2dial{position:relative;width:230px;max-width:100%;align-self:center}.tm2dial svg{display:block;width:100%}.tm2dial>div{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}.tm2dial b{font-size:3.1rem;line-height:1}.tm2dial span{color:var(--mut)}
.tm2pm.big button{height:64px}.tm2cl .tm2swr{justify-content:space-between;min-height:44px}
.tm2cr{display:flex;flex-direction:column;gap:10px;min-width:0}
.tm2kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.tm2kpi{min-width:0;padding:8px 12px;border-radius:14px;border:1px solid var(--line);border-left:4px solid var(--a)}.tm2kpi span,.tm2kpi small{display:block;font-size:.76rem;color:var(--mut)}.tm2kpi b{display:block;font-size:1.4rem;white-space:nowrap}
.tm2sec .pnow{margin-top:4px}
.tm2ev{display:flex;gap:12px;align-items:center;padding:7px 12px;margin-top:6px;border-radius:12px;border:1px solid var(--line);font-size:.9rem}.tm2ev time{flex:none;color:var(--teal);font-weight:700}
.tm2dev{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px;align-items:start}
.tm2rch{flex:none;height:min(300px,38vh);margin:12px 0}.tm2rm .tm2sums{margin-top:4px}.tm2wide{width:100%;min-height:48px}
@media(max-width:899px){.tm2rm .tm2sums{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-height:700px){.tm2dial{width:150px}.tm2dial b{font-size:2.2rem}.tm2pm.big button{height:48px}.tm2cr{gap:6px}.tm2kpi{padding:5px 10px}.tm2kpi b{font-size:1.15rem}.tm2ctl{gap:12px}.tm2cl{gap:6px}}
.tm2rm .ibtn,.tm2cc .ibtn{width:44px;height:44px}
.tm2dev .why,.tm2dev button:not(.sw):not(.ibtn){min-height:44px}
@media(max-height:1000px) and (max-width:899px){.tm2dial{width:180px}.tm2dial b{font-size:2.5rem}}
/* ---------- Modul 2: Jetzt ---------- */
.tm2wwn{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,.75fr) minmax(0,1.25fr);grid-template-rows:minmax(0,1fr);gap:10px}
.tm2tank{min-height:0;display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px;border-radius:20px;background:linear-gradient(165deg,#0d6e8c,#0a4a6b 70%,#093a58);color:#fff;overflow:hidden}
.tm2tank .chip{flex:none;display:inline-flex;align-items:center;gap:6px}
.tm2tk{flex:1;min-height:0;width:100%;position:relative}.tm2tk svg.wwtank{position:absolute;inset:0;width:100%;height:100%;max-width:none;margin:0;transform:none}
.tm2tf{flex:none;text-align:center}.tm2tf b{display:block;font-size:1.25rem}.tm2tf small{display:block;font-size:.85rem;opacity:.8}
.tm2wwr{min-width:0;min-height:0;display:flex;flex-direction:column;gap:10px}
.tm2acts{flex:1 1 0;min-height:72px;max-height:140px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.tm2act{min-width:0;min-height:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:6px 8px;border-radius:18px;border:1px solid var(--line);background:var(--card);color:inherit;font:inherit;text-align:center;cursor:pointer}
.tm2act b{display:block;font-size:.95rem;line-height:1.2}.tm2act small{display:block;font-size:.72rem;color:var(--mut)}
.tm2act.on{border-color:var(--amber);background:color-mix(in srgb,var(--amber) 18%,var(--card))}.tm2act:disabled{opacity:.45;cursor:default}
.tm2warn{flex:none;display:flex;align-items:center;gap:10px;min-height:48px;padding:6px 12px;border-radius:14px;border:1px solid var(--amber);background:color-mix(in srgb,var(--amber) 14%,var(--card));color:inherit;font:inherit;text-align:left;cursor:pointer}
.tm2warn.bad{border-color:#ef4444;background:color-mix(in srgb,#ef4444 16%,var(--card))}.tm2warn>span{flex:1;min-width:0}.tm2warn b{display:block;font-size:.92rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tm2warn em{font-style:normal;font-size:.8rem;color:var(--mut)}
.tm2vals{flex:1.4 1 0;min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:10px}
.tm2val{min-width:0;min-height:0;overflow:hidden;display:flex;align-items:center;gap:12px;padding:6px 14px;border-radius:16px;border:1px solid var(--line);border-left:4px solid var(--a);background:var(--card)}
.tm2val .ti{flex:none;color:var(--a)}.tm2val>span:nth-child(2){min-width:0}.tm2val small,.tm2val em{display:block;font-style:normal;font-size:.76rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tm2val b{display:block;font-size:1.5rem;line-height:1.2;white-space:nowrap}.tm2val b i{font-style:normal;font-size:.85rem;font-weight:500;color:var(--mut)}
.tm2sched{flex:none;padding:10px 14px}.tm2sched>div{display:grid;grid-template-columns:104px minmax(0,1fr);align-items:start;gap:8px}.tm2sched>div>b{font-size:.85rem;line-height:30px}.tm2sched .wwax{margin-bottom:4px}
.tm2.port .tm2wwn{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,.8fr) minmax(0,1fr)}
.tm2.short .tm2act{flex-direction:row;gap:8px}.tm2.short .tm2acts{min-height:56px;max-height:76px}.tm2.short .tm2wwr{gap:6px}.tm2.short .tm2val b{font-size:1.15rem}.tm2.short .tm2sched{padding:6px 10px}.tm2.short .tm2sched .wwbar{height:20px}.tm2.short .tm2sched>div>b{line-height:20px}.tm2.short .tm2sched .wwax{margin:1px 1px 2px}
/* ---------- Modul 2: Zeiten ---------- */
.tm2four{flex:1;min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:10px}
.tm2f{display:flex;flex-direction:column;justify-content:flex-start;gap:8px;overflow:hidden;padding:10px 14px}
.tm2f .wwax{margin-bottom:0}.tm2f .wwbar{height:34px}
.tm2seg{flex:none;display:flex;border:1px solid var(--line);border-radius:12px;overflow:hidden}
.tm2seg button{flex:1 1 0;min-width:0;min-height:44px;padding:0 4px;border:0;background:none;color:var(--mut);font:inherit;font-size:.86rem;font-weight:700;cursor:pointer}
.tm2seg button+button{border-left:1px solid var(--line)}.tm2seg button.sel{background:color-mix(in srgb,var(--teal) 18%,transparent);color:var(--primary-text-color)}
.tm2note{font-size:.82rem;color:var(--mut);line-height:1.3}
.tm2days{flex:none;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}.tm2days button{min-height:44px;border-radius:999px;border:1px solid var(--line);background:none;color:var(--mut);font:inherit;font-weight:700;cursor:pointer;padding:0}.tm2days button.sel{background:var(--teal);border-color:var(--teal);color:var(--on-acc,#04201d)}
.tm2last{margin-top:auto;display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:14px;border:1px solid var(--line)}.tm2last.ok{border-color:color-mix(in srgb,var(--teal) 55%,transparent);background:color-mix(in srgb,var(--teal) 10%,transparent)}.tm2last.warn{border-color:var(--amber)}.tm2last>span{min-width:0}.tm2last b{display:block;font-size:.9rem}.tm2last small{display:block;font-size:.76rem;color:var(--mut)}
.tm2tri{flex:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.tm2tri>div{min-width:0;padding:6px 10px;border-radius:12px;border:1px solid var(--line);border-left:4px solid var(--a)}.tm2tri small{display:block;font-size:.72rem;color:var(--mut)}.tm2tri b{display:block;font-size:1.15rem;white-space:nowrap}
.tm2miss{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;color:var(--mut);font-size:.9rem}.tm2miss .btn2{flex:none;min-height:44px;padding:0 18px}
.tm2.port .tm2four{grid-template-columns:minmax(0,1fr);grid-template-rows:repeat(4,minmax(0,1fr))}
.tm2.short .tm2f{gap:4px;padding:6px 12px}.tm2.short .tm2f .wwbar{height:22px}.tm2.short .tm2note{font-size:.74rem}.tm2.short .tm2last{padding:4px 10px}
@media(max-height:1100px){.tm2.port .tm2f{gap:3px;padding:3px 12px}.tm2.port .tm2f .wwbar{height:20px}.tm2.port .tm2note{font-size:.72rem;line-height:1.2}.tm2.port .tm2last{padding:2px 10px}.tm2.port .tm2last svg{width:18px;height:18px}.tm2.port .tm2last b{font-size:.8rem;line-height:1.2}.tm2.port .tm2last small{font-size:.68rem;line-height:1.2}.tm2.port .tm2tri>div{padding:2px 8px}.tm2.port .tm2tri b{font-size:1rem}}
/* ---------- Modul 2: Verlauf ---------- */
.tm2wwh{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 290px;grid-template-rows:minmax(0,1fr);gap:10px}
.tm2wws{min-height:0;display:flex;flex-direction:column;gap:10px}
.tm2big{flex:none;display:flex;flex-direction:column;align-items:center;padding:14px;border-radius:18px;background:linear-gradient(165deg,#0d6e8c,#0a4a6b);color:#fff}.tm2big small{opacity:.8}.tm2big b{font-size:2.8rem;line-height:1.15}.tm2big span{font-size:.85rem;opacity:.85}
.tm2wws .tm2acts{flex:1 1 0;min-height:0;max-height:none;grid-template-columns:minmax(0,1fr);grid-template-rows:repeat(3,minmax(0,1fr))}.tm2wws .tm2act{flex-direction:row;justify-content:flex-start;gap:12px;padding:4px 14px;text-align:left}
.tm2two{flex:none;display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:auto}.tm2two>div{padding:8px 12px;border-radius:14px;border:1px solid var(--line);border-left:4px solid var(--a);background:var(--card)}.tm2two small{display:block;color:var(--mut);font-size:.76rem}.tm2two b{font-size:1.35rem}
.tm2.port .tm2wwh{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto}.tm2.port .tm2wws{display:grid;grid-template-columns:1fr 1fr;gap:10px}.tm2.port .tm2wws .tm2acts{grid-row:span 2;grid-column:2;grid-template-rows:repeat(3,minmax(52px,1fr))}.tm2.port .tm2big{grid-column:1;grid-row:1}.tm2.port .tm2two{grid-column:1;grid-row:2;margin:0}
.tm2.short .tm2wws .tm2acts{min-height:0;max-height:none;gap:6px}.tm2.short .tm2big{padding:4px}.tm2.short .tm2big span,.tm2.short .tm2big small{font-size:.72rem}.tm2.short .tm2big b{font-size:1.9rem}.tm2.short .tm2wws{gap:6px}.tm2.short .tm2two>div{padding:4px 10px}.tm2.short .tm2two b{font-size:1.1rem}
.tm2.sz-large .tm2act b,.tm2.sz-large .tm2tabs button{font-size:1.08rem}.tm2.sz-large .tm2val small,.tm2.sz-large .tm2val em{font-size:.88rem}
.tm2.sz-xl .tm2act b,.tm2.sz-xl .tm2tabs button{font-size:1.18rem}.tm2.sz-xl .tm2val small,.tm2.sz-xl .tm2val em{font-size:.95rem}.tm2.sz-xl .tm2note{font-size:.95rem}
`;
