/* Tablet-Modus · Modulseiten ohne Scrollen (Stufe 2: Modul 1 und 2, Stufe 3: Modul 3, 4 und 19) */
const CSS_TM2M = `
.tm2tabs{flex:none;display:flex;gap:4px;padding:4px;border-radius:16px;border:1px solid var(--line);background:var(--card)}
.tm2tabs button{min-width:96px;min-height:44px;padding:0 16px;border:0;border-radius:12px;background:none;color:var(--mut);font:inherit;font-weight:700;cursor:pointer}
.tm2tabs button.sel{background:var(--teal);color:var(--on-acc,#04201d)}
.tm2h .tm2tabs{margin-right:14px}
.tm2tr{flex:none;display:flex;padding:6px 16px 0}.tm2tr .tm2tabs{flex:1}.tm2tr .tm2tabs button{flex:1}
.tm2 .tmbody.tm2mod{display:flex;flex-direction:column;gap:10px}
.tm2mod>.card,.tm2mod .tm2four>.card,.tm2mod .tm2stat>.card,.tm2mod .tm2wwh>.card,.tm2mod .tm2wwr>.card{margin:0;min-width:0;min-height:0}
.tm2none{margin:auto;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;padding:32px 48px}
.tm2none .btn2{display:inline-flex;align-items:center;gap:8px}
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
/* ---------- Stufe 3: gemeinsam ---------- */
.tm2bar{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.tm2bar .tm2seg{width:380px;max-width:100%}
.tm2per{display:flex;align-items:center;gap:6px;margin-left:auto}.tm2per b{min-width:180px;text-align:center}
.tm2per button{display:grid;place-items:center;width:48px;height:44px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:inherit;cursor:pointer}.tm2per button:disabled{opacity:.35;cursor:default}.tm2per .nx svg{transform:rotate(180deg)}
.tm2legend{display:inline-flex;align-items:center;gap:6px;font-size:.78rem;color:var(--mut);white-space:nowrap}.tm2legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-left:6px}
.tm2ring{flex:none;width:104px;height:104px}
.tm2chip.go{border-color:color-mix(in srgb,var(--teal) 65%,transparent);color:var(--teal);font-weight:700}
.tm2use{flex:none;width:100%;min-width:0;min-height:48px;display:flex;align-items:center;gap:12px;padding:6px 12px;border-radius:14px;border:1px solid var(--line);border-left:4px solid var(--a,var(--teal));background:none;color:inherit;font:inherit;text-align:left}button.tm2use{cursor:pointer}
.tm2use>span{flex:1;min-width:0}.tm2use b,.tm2use small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tm2use small{font-size:.76rem;color:var(--mut)}.tm2use strong{flex:none;font-size:1.15rem;white-space:nowrap}
/* ---------- Modul 3: Jetzt ---------- */
.tm2enn{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);grid-template-rows:minmax(0,1fr);gap:10px}
.tm2enn>.card,.tm2cost>.card,.tm2efs>.card{margin:0;min-width:0;min-height:0}
.tm2flow{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;gap:6px}
.tm2flow>svg{flex:1 1 0;min-height:0;width:100%!important;height:auto!important;max-width:none!important;margin:0!important}
.tm2flow>*:not(svg):not(.m3flw){flex:none;max-width:100%;margin:0}
.tm2flow>.m3flw{flex:1 1 0;min-height:0;width:100%;position:relative}.tm2flow>.m3flw>svg{position:absolute;inset:0;width:100%!important;height:100%!important;max-width:none!important;margin:0!important}
.tm2.land:not(.short) .tm2ens .tm2sum b,.tm2.land:not(.short) .tm2side4 .tm2sum b{font-size:2.3rem}.tm2.land:not(.short) .tm2ens .tm2sum span,.tm2.land:not(.short) .tm2side4 .tm2sum span{font-size:.95rem}
.tm2ens{min-width:0;min-height:0;display:flex;flex-direction:column;gap:10px}
.tm2.tm2 .tm2sums.two{grid-template-columns:repeat(2,minmax(0,1fr))}.tm2ens .tm2sums{flex:1;min-height:0;grid-auto-rows:minmax(0,1fr)}
.tm2ens .tm2sum,.tm2side4 .tm2sum{min-height:0;overflow:hidden;display:flex;flex-direction:column;justify-content:center}
.tm2.tm2 .tm2aut{flex:none;margin:0;display:flex;align-items:center;gap:16px;padding:12px 16px}.tm2aut>div{min-width:0}.tm2aut b,.tm2aut small,.tm2aut em{display:block}.tm2aut b{font-size:1.1rem}.tm2aut small{color:var(--mut);font-size:.85rem}.tm2aut em{font-style:normal;font-weight:700;color:var(--teal)}
.tm2.port .tm2enn{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto}.tm2.port .tm2ens .tm2sums{flex:none;grid-auto-rows:auto}
.tm2.short .tm2sum{padding:3px 10px}.tm2.short .tm2sum b{font-size:1.2rem}.tm2.short .tm2sum span,.tm2.short .tm2sum em{font-size:.72rem;line-height:1.2}.tm2.short .tm2ring{width:66px;height:66px}.tm2.tm2.short .tm2aut{padding:4px 12px;gap:10px}.tm2.short .tm2aut b{font-size:.95rem}.tm2.short .tm2aut small,.tm2.short .tm2aut em{font-size:.76rem}.tm2.short .tm2ens,.tm2.short .tm2ens .tm2sums{gap:6px}
/* ---------- Modul 3: Verlauf und Kosten ---------- */
.tm2side4{min-width:0;min-height:0;display:grid;grid-template-rows:repeat(4,minmax(0,1fr));gap:10px}
.tm2.port .tm2side4{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:auto auto}
.tm2ch .legend{margin:6px 0 0;justify-content:center}.tm2 .tm2ch button{min-height:44px}.tm2ch .m3cal{margin-top:8px}.tm2ch .enchw svg{display:block;width:100%;height:auto}
.tm2cost{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);grid-template-rows:minmax(0,1fr);gap:10px}
.tm2.port .tm2cost{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) minmax(0,1fr)}
.tm2water{flex:1;min-height:0;position:relative}.tm2water>svg{position:absolute;inset:0;width:100%!important;height:100%!important;max-width:none!important;margin:0!important}
.tm2dist{flex:none;display:flex;height:22px;margin:2px 0 8px;border-radius:11px;overflow:hidden;background:var(--line)}.tm2dist i{display:block;height:100%}
.tm2uses{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:space-evenly;gap:6px;overflow:hidden}
.tm2cost .tm2note{flex:none;margin-top:6px}
.tm2.short .tm2use{min-height:44px;padding:2px 10px}.tm2.short .tm2use svg{width:26px;height:26px}.tm2.short .tm2uses{gap:3px}.tm2.short .tm2dist{height:12px;margin:0 0 4px}
/* ---------- Modul 4: Geräte ---------- */
.tm2gsh{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;min-height:40px}.tm2gsh>span b{font-size:1.25rem}.tm2gsh>small{font-size:.85rem;color:var(--mut)}.tm2gsh .tm2chip{margin-left:auto}
.tm2.port .tm2gsh .tm2legend{display:none}.tm2.port .tm2gsh .tm2chip{flex:1 1 100%;margin:0}
.tm2dvs-grid{flex:1;min-height:0;display:grid;grid-template-columns:repeat(var(--c),minmax(0,1fr));grid-template-rows:repeat(var(--r),minmax(0,1fr));gap:10px}.tm2dvs-grid.r1{grid-template-rows:minmax(0,360px);align-content:start}
.tm2dv{min-width:0;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:6px;padding:10px;border-radius:18px;border:1px solid var(--line);background:var(--card)}
.tm2dv.k-run{border-color:color-mix(in srgb,var(--amber) 70%,transparent)}.tm2dv.k-done{border-color:color-mix(in srgb,var(--teal) 70%,transparent)}
.tm2dvm{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:4px;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
.tm2dvh{flex:none;display:flex;align-items:center;gap:10px;width:100%}.tm2dvh>span:last-child{flex:1;min-width:0}.tm2dvh b,.tm2dvh small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tm2dvh b{font-size:1.05rem}.tm2dvh small{font-size:.8rem;color:var(--mut)}.tm2dv.k-run .tm2dvh small{color:var(--amber)}.tm2dv.k-done .tm2dvh small{color:var(--teal)}
.tm2dvv{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;gap:6px;width:100%;font-size:2.4rem;font-weight:800;line-height:1;white-space:nowrap}.tm2dvv small{font-size:.85rem;font-weight:500;color:var(--mut)}
.tm2dvs{flex:none;display:flex;width:100%;height:8px;border-radius:4px;overflow:hidden;background:var(--line)}.tm2dvs i{display:block;height:100%}
.tm2dvf,.tm2dvb,.tm2wb{flex:none;display:flex;align-items:center;justify-content:center;gap:6px;min-height:44px;padding:0 8px;border-radius:12px;font-size:.84rem;color:var(--mut);white-space:nowrap;overflow:hidden}
.tm2dvf.done{background:color-mix(in srgb,var(--teal) 14%,transparent);color:var(--teal);font-weight:700}.tm2dvf.go{color:var(--teal);font-weight:700}
.tm2dvf .g2prog{display:block;width:100%;height:10px;margin:0;border-radius:5px;overflow:hidden;background:var(--line)}.tm2dvf .g2prog i{display:block;height:100%;background:var(--amber)}
.tm2dvb,button.tm2wb{border:1px solid var(--line);background:rgba(127,127,127,.12);color:inherit;font:inherit;font-size:.84rem;font-weight:700;cursor:pointer}.tm2dvb span,.tm2wb span{overflow:hidden;text-overflow:ellipsis}
.tm2dvb.on,button.tm2wb.on{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 18%,transparent)}
.tm2.short .tm2dv{padding:7px;gap:3px}.tm2.short .tm2dvh>:first-child{zoom:.72}.tm2.short .tm2dvv{font-size:1.5rem}.tm2.short .tm2dvs{height:5px}
.tm2.sz-large .tm2dvh b{font-size:1.2rem}.tm2.sz-large .tm2dvh small,.tm2.sz-large .tm2dvf{font-size:.95rem}
.tm2.sz-xl .tm2dvh b{font-size:1.3rem}.tm2.sz-xl .tm2dvh small,.tm2.sz-xl .tm2dvf,.tm2.sz-xl .tm2dvb{font-size:1rem}.tm2.sz-xl .tm2dvv{font-size:2.8rem}
/* ---------- Modul 4: Startfenster ---------- */
.tm2gsf{flex:1 1 0;min-height:110px}.tm2.tm2 .tm2gsf .tm2sh .tm2chip{margin-left:auto}
.tm2gsw{flex:none;gap:6px;touch-action:pan-y}.tm2rows{display:flex;flex-direction:column;gap:6px}
.tm2wr{display:grid;grid-template-columns:minmax(150px,230px) minmax(40px,1fr) 150px 52px 220px;align-items:center;gap:12px;min-height:48px;border-top:1px solid var(--line);padding-top:4px}.tm2wr:first-child{border-top:0;padding-top:0}
.tm2wn{display:flex;align-items:center;gap:10px;min-width:0;min-height:44px;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}.tm2wn b,.tm2wr.plain b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tm2wt{position:relative;height:14px;border-radius:7px;background:var(--line)}.tm2wt i{position:absolute;top:0;bottom:0;border-radius:7px;background:var(--teal)}
.tm2wz{font-size:.85rem;color:var(--mut);white-space:nowrap}.tm2wr strong{color:var(--amber);text-align:right}
.tm2wb.off{color:var(--teal);font-weight:700}
.tm2wr.plain{grid-template-columns:auto minmax(0,1fr) auto 60px}.tm2wr.plain span{font-size:.85rem;color:var(--mut);white-space:nowrap}
.tm2.port .tm2wr:not(.plain){grid-template-columns:minmax(0,1fr) auto 44px minmax(0,190px);gap:8px}.tm2.port .tm2wt{display:none}.tm2.port .tm2gsf{min-height:150px}
@media(max-width:1100px){.tm2.land .tm2wr:not(.plain){grid-template-columns:minmax(110px,170px) minmax(30px,1fr) auto 48px 180px;gap:8px}}
@media(max-width:700px){.tm2.port .tm2wr:not(.plain){grid-template-columns:minmax(0,1fr) 44px minmax(0,170px)}.tm2.port .tm2wz{display:none}}
/* ---------- Modul 4: Statistik und Gerätefenster ---------- */
.tm2gsx{gap:6px}.tm2goal{flex:none;display:flex;align-items:center;gap:12px}.tm2goal small{color:var(--mut)}.tm2gsx .tm2ring{width:88px;height:88px}
.tm2.port .tm2gsx{max-height:300px}.tm2.short .tm2gsx{gap:3px}.tm2.short .tm2gsx .tm2ring{width:56px;height:56px}
.tm2dayr{height:100%;display:grid;grid-template-rows:repeat(var(--n),minmax(0,1fr))}
.tm2dayr button{display:grid;grid-template-columns:34px minmax(70px,180px) minmax(0,1fr) auto;align-items:center;gap:10px;min-height:44px;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
.tm2dayr b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.9rem}.tm2dayr button>span{display:block;min-width:0}.tm2dayr button>span>span{display:flex;height:16px;border-radius:8px;overflow:hidden}.tm2dayr em{font-style:normal;font-size:.82rem;color:var(--mut);white-space:nowrap}
.tm2gsi{flex:none;display:flex}.tm2kpis.four{grid-template-columns:repeat(4,minmax(0,1fr))}
.tm2cv{margin:6px 0}.tm2cv svg.s3svg,.tm2cv>svg{max-height:34vh}.tm2rm .tm2cv svg{max-width:100%}
.tm2runs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:6px 0}.tm2runs button{min-width:0;min-height:48px;padding:4px 10px;border-radius:12px;border:1px solid var(--line);background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}.tm2runs button.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 14%,transparent)}.tm2runs b,.tm2runs small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.85rem}.tm2runs small{color:var(--mut);font-size:.76rem}
.tm2adv{display:flex;align-items:center;gap:12px;margin-top:6px;padding:6px 12px;border-radius:14px;border:1px solid var(--line)}.tm2adv>span{flex:1;min-width:0}.tm2adv small{display:block;color:var(--mut);font-size:.78rem}
@media(max-width:899px){.tm2kpis.four,.tm2runs{grid-template-columns:repeat(2,minmax(0,1fr))}}
/* ---------- Modul 19 ---------- */
.tm2efb{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;justify-content:center}
.tm2.port .tm2efb .efgrid{row-gap:clamp(8px,3.2vh,44px)}
.tm2efb .efx{width:100%;max-width:none;margin:0;padding:0}.tm2efb .efboard{display:flex;flex-direction:column;justify-content:center;margin:0;box-sizing:border-box}.tm2efb .efgrid{width:100%}
.tm2efs{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);grid-template-rows:minmax(0,1fr);gap:10px}
.tm2.port .tm2efs{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto}.tm2.port .tm2efl{flex:none;grid-auto-rows:62px;grid-template-rows:none}
.tm2efcols{flex:1;min-height:0;display:flex;justify-content:center;gap:18px;padding:4px 0}
.tm2efc{flex:1;max-width:130px;min-width:0;min-height:0;display:flex;flex-direction:column;align-items:center;gap:2px}.tm2efc>b{font-size:1.6rem;color:var(--c)}.tm2efc>em{font-style:normal;font-weight:700}.tm2efc>small{color:var(--mut)}
.tm2efc>span{flex:1;min-height:20px;width:100%;display:flex;align-items:flex-end;border-radius:14px;background:color-mix(in srgb,var(--c) 10%,transparent)}.tm2efc>span>i{display:block;width:100%;border-radius:14px;background:linear-gradient(180deg,var(--c),color-mix(in srgb,var(--c) 45%,transparent));box-shadow:0 0 24px -6px var(--c)}
.tm2efl{flex:1;min-height:0;display:grid;grid-template-rows:repeat(var(--n),minmax(0,1fr));gap:4px}
.tm2efr{min-width:0;min-height:0;overflow:hidden;display:flex;align-items:center;gap:12px;border-top:1px solid var(--line)}.tm2efr:first-child{border-top:0}
.tm2efn{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}.tm2efn>b{color:var(--c);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tm2efn>b small{margin-left:8px;font-weight:500;font-size:.72rem;color:var(--mut)}.tm2efn>span{display:flex;gap:2px;height:10px;border-radius:5px;overflow:hidden;background:var(--line)}.tm2efn>span>i{display:block;height:100%}
.tm2efr>strong{min-width:58px;text-align:right;font-size:1.15rem;color:#fbbf24}.tm2efr>strong small{display:block;font-size:.68rem;font-weight:500;color:var(--mut)}.tm2efr>em{min-width:86px;text-align:right;font-style:normal;font-size:.85rem;color:var(--mut);white-space:nowrap}
.tm2.short .tm2efc>b{font-size:1.15rem}.tm2.short .tm2efr .efq{zoom:.75}.tm2.short .tm2efl{gap:0}
/* ---------- Ruhebilder: Energie und Hausfluss ---------- */
.tmrest.tm2rw{justify-content:flex-start;align-items:stretch;gap:14px;padding:16px 22px 10px;overflow:hidden;text-align:left}
.tm2rwh{flex:none;display:flex;align-items:center;justify-content:space-between;gap:20px}.tm2rwt b{display:block;font-size:2.6rem;line-height:1.1}.tm2rwt small{opacity:.7;font-size:1rem}.tm2rw .tm2rh{max-width:62%;margin:0}
.tm2rw.port .tm2rwh{flex-direction:column;align-items:flex-start;gap:8px}.tm2rw.port .tm2rh{max-width:100%}
.tmrest.tm2rw .tmrw{position:static;flex:none;margin:0;text-align:center;line-height:1.2}
.tm2rwen{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto;gap:14px}
.tm2rw.port .tm2rwen{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1.1fr) minmax(0,1fr) auto}
.tm2rwbig{min-height:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:28px;background:linear-gradient(165deg,#0f766e,#115e59 55%,#0f3f3b);color:#fff;text-align:center}.tm2rwbig small{font-size:1.4rem;opacity:.85}.tm2rwbig b{font-size:min(11vw,18vh);line-height:1.1;white-space:nowrap}.tm2rwbig em{font-style:normal;font-size:1.7rem;font-weight:700}
.tm2rwl{min-height:0;display:flex;flex-direction:column;gap:14px}.tm2rwv{flex:1;min-height:0;overflow:hidden;display:flex;align-items:center;gap:20px;padding:6px 22px;border-radius:22px;border:1px solid rgba(255,255,255,.14);border-left:6px solid var(--a)}.tm2rwv>svg{flex:none}.tm2rwv small,.tm2rwv b,.tm2rwv em{display:block}.tm2rwv small{opacity:.75;font-size:1rem}.tm2rwv b{font-size:min(2.8rem,7vh);line-height:1.15;white-space:nowrap}.tm2rwv em{font-style:normal;font-size:.9rem;opacity:.7}
.tm2rwaut{grid-column:1/-1;display:flex;align-items:center;gap:18px;padding:10px 22px;border-radius:18px;border:1px solid rgba(255,255,255,.14);font-size:1.15rem}.tm2rwaut>i{flex:1;height:14px;border-radius:7px;overflow:hidden;background:rgba(255,255,255,.12)}.tm2rwaut>i>i{display:block;height:100%;background:#2dd4bf}.tm2rwaut b{font-size:1.6rem}
.tm2rwef{flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:minmax(0,.85fr) minmax(0,1.15fr);grid-template-areas:". pv ." "bat hub net";gap:14px}
.tm2rw.port .tm2rwef{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:minmax(0,.8fr) minmax(0,1.4fr) minmax(0,.8fr);grid-template-areas:"pv pv" "hub hub" "bat net"}
.tm2rwn{min-width:0;min-height:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:26px;border:2px solid color-mix(in srgb,var(--a,#2dd4bf) 50%,transparent);text-align:center}.tm2rwn.pv{grid-area:pv}.tm2rwn.hub{grid-area:hub}.tm2rwn.bat{grid-area:bat}.tm2rwn.net{grid-area:net}.tm2rwn.empty{border:0}
.tm2rwn>svg{flex:0 1 auto;min-height:0}.tm2rwn.hub>svg{flex:1 1 0;width:100%;max-height:220px}.tm2rwn small{font-size:1.1rem;opacity:.75}.tm2rwn b{font-size:min(3.8rem,8vh);line-height:1.1;white-space:nowrap}.tm2rwn em{font-style:normal;font-size:.95rem;opacity:.75}
@media(max-height:660px),(max-width:700px){.tm2rwv{gap:12px;padding:2px 14px}.tm2rwv>svg{width:34px;height:34px}.tm2rwv small{font-size:.8rem;line-height:1.2}.tm2rwv b{font-size:1.4rem;line-height:1.15}.tm2rwv em{font-size:.72rem;line-height:1.2}}
@media(max-height:660px){.tm2rwt b{font-size:1.8rem}.tm2rwn>svg{width:44px;height:44px}.tm2rwn.hub>svg{width:100%;height:auto}.tm2rwl,.tm2rwen,.tm2rwef{gap:8px}}
@media(max-height:660px),(max-width:700px){.tm2rwn>svg{width:40px;height:40px}.tm2rwn.hub>svg{width:100%;height:auto}.tm2rwn small{font-size:.85rem;line-height:1.15}.tm2rwn b{font-size:min(2.6rem,6vh);line-height:1.05}.tm2rwn em{font-size:.75rem;line-height:1.15}}
/* Stufe 4: Modul 8, 14, 16 */
.tm2ax{font-size:12px;fill:var(--mut)}.tm2ax.b{font-weight:700;fill:var(--primary-text-color)}
.tm2gl{stroke:var(--line);stroke-dasharray:3 5}.tm2dl{stroke:var(--primary-text-color);stroke-width:1.5;stroke-dasharray:6 5;opacity:.7}
.tm2note{flex:none;display:block;color:var(--mut);font-size:.8rem;margin-top:-6px}.tm2nox{padding:8px 0}
.tm2sums.three,.tm2.tm2 .tm2sums.three{grid-template-columns:repeat(3,minmax(0,1fr))}
.tm2shr .tm2legend{display:flex;align-items:center;gap:5px;font-size:.76rem;color:var(--mut)}.tm2sh .tm2legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-left:8px}.tm2sh>.tm2legend{display:flex;align-items:center;gap:5px;font-size:.76rem;color:var(--mut)}
.tm2.port .tm2sh .tm2legend{display:none}
.tm2dseg{width:190px}.tm2ckseg.tm2seg{width:240px}
.tm2evsc{flex:1 1 0;min-height:150px;position:relative;overflow:hidden;border-radius:20px;background:#3f86d6}.tm2evsc.nt{background:#0b1530}
.tm2evpic{position:absolute;inset:0}.tm2evsvg{display:block;width:100%;height:100%}
.tm2evbadge{position:absolute;left:14px;bottom:14px;max-width:46%;padding:10px 18px;border-radius:16px;background:rgba(9,17,27,.76);color:#fff}
.tm2evbadge b{display:block;font-size:1.7rem;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tm2evbadge small{display:block;font-size:.9rem;color:#d5e0ea}.tm2evbadge small.d{font-size:.78rem;color:#a9bccb}
.tm2.port .tm2evbadge{top:62px;bottom:auto;max-width:70%}
.tm2evtr{position:absolute;right:12px;top:10px;display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:8px;max-width:calc(100% - 24px)}
.tm2evtr .tm2mini,.tm2evtr .chip{background:rgba(9,17,27,.76);color:#fff;border-color:rgba(255,255,255,.14)}
.tm2evw{position:absolute;left:14px;top:62px;max-width:60%;display:flex;gap:8px;align-items:center;padding:8px 14px;border-radius:12px;background:rgba(120,53,15,.92);color:#fff;font-size:.86rem;z-index:1}
.tm2evw svg{flex:none}.tm2.port .tm2evw{top:auto;bottom:12px;max-width:calc(100% - 28px)}
.tm2.tm2 .card.tm2sur{flex:none;margin:0;padding:6px 16px 10px}.tm2sur .tm2sh{min-height:34px}.tm2sur .tm2sh .tm2mini{min-height:44px}
.tm2sur .tm2sh em{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm2surb{position:relative;height:20px;border-radius:999px;background:rgba(127,127,127,.18);overflow:hidden}.tm2surb i{position:absolute;left:0;top:0;bottom:0}.tm2surb i.s{background:#fbbf24}.tm2surb i.g{background:#f97316;opacity:.75}.tm2surb span{position:absolute;top:0;bottom:0;width:3px;margin-left:-1px;background:var(--primary-text-color)}
.tm2surx{position:relative;display:flex;justify-content:space-between;margin-top:5px;font-size:.74rem;color:var(--mut)}.tm2surx span.m{position:absolute;transform:translateX(-50%);white-space:nowrap}
.tm2lbl{flex:none;display:flex;justify-content:space-between;gap:10px;font-size:.74rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);margin:0 2px -4px}.tm2lbl em{font-style:normal;text-transform:none;letter-spacing:0;color:var(--teal)}
.tm2evm,.tm2evq{flex:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.tm2evq{grid-template-columns:repeat(3,minmax(0,1fr))}
.tm2evm button,.tm2evq button{min-width:0;border:1px solid var(--line);border-radius:16px;background:var(--card);color:inherit;font:inherit;display:flex;align-items:center;justify-content:center;cursor:pointer}
.tm2evm button{height:86px;flex-direction:column;gap:4px}.tm2evq button{min-height:58px;gap:10px;padding:0 8px}
.tm2evm button b,.tm2evq button b{font-size:1rem;line-height:1.15}
.tm2evm button.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 17%,var(--card));color:var(--teal)}
.tm2evm button:disabled,.tm2evq button:disabled{opacity:.5;cursor:default}.tm2evm button.sel:disabled{opacity:.8}
.tm2evq.on{display:flex;align-items:center;gap:12px;min-height:58px;padding:0 8px 0 16px;border:1px solid var(--teal);border-radius:16px;background:color-mix(in srgb,var(--teal) 13%,var(--card))}
.tm2evq.on>span{flex:1;min-width:0}.tm2evq.on b{display:block}.tm2evq.on small{display:block;color:var(--mut);font-size:.8rem}.tm2evq.on button.stop{min-height:44px;padding:0 24px;font-weight:700;color:#f87171;border-color:#f8717180}
.tm2.port .tm2evm{grid-template-columns:repeat(2,minmax(0,1fr))}.tm2.port .tm2evq button{flex-direction:column;gap:2px;min-height:74px;text-align:center}
.tm2.short .tm2evm button{height:64px}.tm2.short .tm2evq button{min-height:46px}.tm2.short .tm2lbl{display:none}.tm2.short .tm2evsc{min-height:90px}.tm2.short .tm2evbadge b{font-size:1.25rem}.tm2.short .tm2evbadge small.d{display:none}
.tm2.tm2 .card.tm2evpl,.tm2.tm2 .card.tm2dtb,.tm2.tm2 .card.tm2ckc,.tm2.tm2 .card.tm2spc{flex:1;min-height:0;margin:0;gap:6px}
.tm2sesc{touch-action:pan-y}.tm2sesl{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column}
.tm2ses{flex:0 0 auto;display:flex;align-items:center;gap:12px;padding:6px 0;border-top:1px solid var(--line)}.tm2ses span{min-width:0}.tm2ses b{display:block;font-size:.9rem;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tm2ses small{display:block;font-size:.74rem;color:var(--mut)}.tm2ses .n{flex:1}.tm2ses .v{text-align:right}
.tm2.port .tm2stat .tm2sesc{height:330px}
.tm2band{height:100%;padding:0 8px}.tm2band .tfax{font-size:.76rem}.tm2band .tfl{font-size:.76rem}
.tm2dtg .tm2cc{touch-action:pan-y}.tm2dtl{flex:1;min-height:0;display:grid;grid-auto-rows:minmax(0,86px);align-content:start;gap:8px}
.tm2dtd{display:grid;grid-template-columns:34px minmax(0,1fr) auto 150px;align-items:center;gap:12px;padding:4px 12px;border:1px solid var(--line);border-left:4px solid var(--lc);border-radius:14px;min-height:0;overflow:hidden}
.tm2dtd .i{color:var(--mut);display:grid;place-items:center}.tm2dtd span{min-width:0}.tm2dtd b{display:block;font-size:1.02rem;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tm2dtd small{display:block;font-size:.78rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tm2dtd .w{text-align:right}
.tm2dtn{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px}.tm2dtn.go{color:#34d399;font-weight:700}
button.tm2dtn{border-radius:12px;border:1px solid color-mix(in srgb,var(--teal) 50%,transparent);background:color-mix(in srgb,var(--teal) 13%,transparent);color:var(--teal);font:inherit;font-size:.86rem;font-weight:700;cursor:pointer}button.tm2dtn.on{background:var(--teal);color:#06241f}
.tm2dtsl{flex:1;min-height:0;display:grid;grid-auto-rows:minmax(0,64px);align-content:start;gap:4px}.tm2dts{display:flex;align-items:center;gap:12px;border-top:1px solid var(--line);min-height:0;overflow:hidden}.tm2dts i{font-style:normal;color:var(--mut);width:18px}.tm2dts b{flex:1}.tm2dts span{font-weight:800}
.tm2.port .tm2dtg{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) 250px}.tm2.port .tm2dtd{grid-template-columns:30px minmax(0,1fr) auto 132px;gap:8px;padding:4px 8px}.tm2.port .tm2dtsl{grid-auto-rows:minmax(0,1fr)}
.tm2.tm2 .tm2spn{grid-template-columns:repeat(4,minmax(0,1fr))}.tm2.tm2.port .tm2spn{grid-template-columns:repeat(2,minmax(0,1fr))}
.tm2big4{min-width:0;display:flex;flex-direction:column;align-items:center;padding:8px 10px;border-radius:18px;border:1px solid var(--line);border-top:4px solid var(--a);background:var(--card);text-align:center}
.tm2big4 span{font-size:.9rem;color:var(--mut)}.tm2big4 b{font-size:3rem;line-height:1.1;white-space:nowrap}.tm2big4 b small{font-size:1rem;margin-left:5px;color:var(--mut)}.tm2big4 em{font-style:normal;font-size:.8rem;color:var(--mut);max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tm2.short .tm2big4 b{font-size:1.7rem}.tm2.short .tm2big4{padding:3px 6px}.tm2.port .tm2big4 b{font-size:2.5rem}
@media(max-width:1100px) and (orientation:landscape){.tm2big4 b{font-size:2.3rem}}
.tm2spf{flex:none;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:10px}.tm2.port .tm2spf{grid-template-columns:minmax(0,1fr)}
.tm2.tm2 .tm2spf>.card{margin:0;display:flex;align-items:center;gap:14px;padding:8px 14px;min-height:64px;min-width:0}
.tm2spf span{flex:1;min-width:0}.tm2spf b{display:block;font-size:1.02rem;line-height:1.25}.tm2spf small{display:block;font-size:.8rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}button.tm2spa{color:inherit;font:inherit;text-align:left;cursor:pointer}.tm2spa>svg:last-child{transform:rotate(-90deg)}
.tm2warn .tm2mini{margin-left:auto}
.tm2stat.tm2spac{grid-template-columns:minmax(0,1fr) 400px}.tm2.port .tm2stat.tm2spac{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) minmax(0,1fr)}
.tm2calh,.tm2calg{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}.tm2calh{flex:none;margin-bottom:4px}.tm2calh i{font-style:normal;text-align:center;font-size:.72rem;color:var(--mut)}
.tm2calg{flex:1;min-height:0;grid-template-rows:repeat(4,minmax(0,1fr))}
.tm2calg>*{min-width:0;min-height:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:10px;border:0;padding:0;color:inherit;font:inherit;background:rgba(127,127,127,.1)}.tm2calg button{cursor:pointer}
.tm2calg small{font-size:.68rem;color:var(--mut);line-height:1.1}.tm2calg b{font-size:.98rem;line-height:1.2}
.tm2calg .g{background:color-mix(in srgb,#34d399 38%,transparent)}.tm2calg .y{background:color-mix(in srgb,#f59e0b 40%,transparent)}.tm2calg .r{background:color-mix(in srgb,#f87171 42%,transparent)}.tm2calg .f{opacity:.35}
.tm2.short .tm2calg{gap:3px}.tm2.short .tm2calg small{display:none}
.tm2gsh .tm2mini.end{margin-left:auto}
.tm2sites{flex:1;min-height:0;display:grid;grid-template-columns:repeat(var(--c),minmax(0,1fr));grid-template-rows:repeat(var(--r),minmax(0,1fr));gap:10px}
.tm2.tm2 .card.tm2site{margin:0;min-width:0;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:6px;border-top:4px solid var(--a)}
.tm2site .h{flex:none;display:flex;justify-content:space-between;gap:10px}.tm2site .h b{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tm2site .h em{font-style:normal;color:var(--mut)}
.tm2site .v{flex:none}.tm2site .v b{display:block;font-size:2.4rem;line-height:1.1}.tm2site .v small{font-size:.85rem;font-weight:500;color:var(--mut);margin-left:6px}.tm2site .v span{font-size:.85rem;color:var(--mut)}
.tm2site .sl{flex:1;min-height:0;width:100%;max-height:240px;margin-top:auto}
/* ---------- Stufe 5 · Modul 9 Wetter, 11 Melder, 17 Müll ---------- */
.tm2wxk{display:flex;align-items:center;gap:6px;font-size:.78rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--mut)}
.tm2wxln{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-top:8px}.tm2wxln>span:not(.wxlvp):not(.tm2chip){display:inline-flex;align-items:center;gap:6px;font-size:.95rem}
.tm2wxlb{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.tm2wxlb .btn2,.tm2wxv .btn2{min-height:48px;display:inline-flex;align-items:center;gap:8px}
.tm2wxok{display:inline-flex;align-items:center;gap:6px;min-height:48px;color:var(--teal);font-weight:700}
.tm2wxn{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1.65fr) minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);gap:10px}
.tm2wxl{grid-column:1;grid-row:1;margin:0;display:flex;align-items:stretch;overflow:hidden;padding:0;border-left:5px solid var(--wc)}
.tm2wxl.ok{border-left-color:var(--teal)}.tm2wxl.on{background:color-mix(in srgb,var(--wc) 9%,var(--card))}
.tm2wxlt{flex:1;min-width:0;padding:14px 16px;display:flex;flex-direction:column}.tm2wxlt>b{font-size:1.6rem;line-height:1.2;margin-top:4px}.tm2wxlt>small{color:var(--mut);font-size:.92rem}
.tm2wxsc{flex:none;width:38%;max-width:300px;position:relative;overflow:hidden}.tm2wxsc svg{position:absolute;inset:0;width:100%;height:100%}
.tm2wxt{grid-column:1;grid-row:2;min-height:0;display:flex}.tm2wxt .wxtiles{flex:1;min-height:0;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:10px}
.tm2wxt .wxtl{min-height:0;overflow:hidden;justify-content:center}
.tm2wxr{grid-column:2;grid-row:1/3;min-height:0;display:flex;flex-direction:column;gap:10px}.tm2wxr>.card{margin:0;min-height:0}
.tm2wxoc{flex:none;gap:6px}.tm2wxo{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;background:color-mix(in srgb,var(--wc,var(--teal)) 10%,transparent)}
.tm2wxo i{flex:none;width:10px;height:36px;border-radius:5px;background:var(--wc,var(--teal))}.tm2wxo.ok{--wc:#34d399}.tm2wxo span{min-width:0}.tm2wxo b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tm2wxo small{display:block;font-size:.8rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tm2wxvc{flex:1}.tm2wxvl{flex:1;min-height:0;display:grid;grid-template-rows:repeat(var(--n),minmax(0,1fr));gap:8px}
.tm2wxv{min-height:0;overflow:hidden;display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;border:1px solid var(--line)}.tm2wxv.done{opacity:.6}
.tm2wxv .i{flex:none;display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:rgba(127,127,127,.12);color:var(--teal)}
.tm2wxv .t{flex:1;min-width:0}.tm2wxv .t b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tm2wxv .t small{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:.82rem;color:var(--mut)}
.tm2wxv em{flex:none;display:inline-flex;align-items:center;gap:4px;font-style:normal;font-size:.82rem;color:var(--teal)}
.tm2wx48{flex:1;min-height:0}.tm2wx48 .tm2ch{flex:1;min-height:0}.tm2legend{display:flex;align-items:center;gap:6px;font-size:.82rem;color:var(--mut)}.tm2legend i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-left:8px}.tm2legend i.ln{height:3px}
.tm2wxax{font-size:12px;fill:var(--mut)}.tm2wxg{stroke:var(--line);stroke-width:1}.tm2wxlim{stroke-width:2;stroke-dasharray:6 5}.tm2wxlt{font-size:12px;font-weight:700}.tm2wxtm{fill:rgba(127,127,127,.07)}
.tm2wxm{flex:1;min-height:0;gap:8px}.tm2wxm .tm2sh{flex-wrap:wrap}.tm2wxmb{flex:1;min-height:0;position:relative}
.tm2wxmi{position:absolute;inset:0;aspect-ratio:auto}.tm2wxmi img{object-fit:fill}.tm2wxmf{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px}
.tm2seg{display:flex;gap:4px;padding:4px;border-radius:14px;border:1px solid var(--line)}.tm2seg button{min-height:44px;min-width:64px;padding:0 14px;border:0;border-radius:10px;background:none;color:var(--mut);font:inherit;font-weight:700;cursor:pointer}.tm2seg button.sel{background:color-mix(in srgb,var(--teal) 20%,transparent);color:var(--primary-text-color)}
.tm2.port .tm2wxn{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1.25fr) minmax(0,1fr)}
.tm2.port .tm2wxl{grid-row:1}.tm2.port .tm2wxt{grid-row:2}.tm2.port .tm2wxt .wxtiles{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(3,minmax(0,1fr))}
.tm2.port .tm2wxr{grid-column:1;grid-row:3;flex-direction:row}.tm2.port .tm2wxr>.card{flex:1;min-width:0}
.tm2.short .tm2wxlt>b{font-size:1.3rem}.tm2.short .wxtl .wxtg{display:none}
/* Ruhebild bei einer Wetterwarnung */
.tm2rwwx{flex:1;min-height:0;display:flex;align-items:center;gap:32px;padding:0 4vw}.tm2rw.port .tm2rwwx{flex-direction:column;justify-content:center;gap:16px}
.tm2rwwxs{flex:1;min-width:0;align-self:stretch;position:relative;border-radius:28px;overflow:hidden;border:2px solid var(--wc)}.tm2rwwxs svg{position:absolute;inset:0;width:100%;height:100%}.tm2rw.port .tm2rwwxs{flex:none;width:100%;height:42vh}
.tm2rwwxt{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}.tm2rwwxt>b{font-size:2.6rem;line-height:1.15}.tm2rwwxt>small{font-size:1.15rem;color:var(--mut)}.wxlvp.big{align-self:flex-start;font-size:1rem;padding:6px 14px}
.tm2rwwxl{display:flex;flex-direction:column;gap:6px;margin-top:10px}.tm2rwwxl div{display:flex;align-items:center;gap:10px;font-size:1.15rem}.tm2rwwxl .ok svg{color:var(--teal)}.tm2rwwxl .no svg{color:var(--amber)}
/* Melder */
.tm2sfo{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:auto auto minmax(0,1fr);gap:10px}
.tm2sfo>.tm2sums{grid-column:1/3}.tm2sfst{grid-column:1/3;margin:0;display:flex;align-items:center;gap:18px;padding:14px 18px;border-left:5px solid #34d399}
.tm2sfst.warn{border-left-color:#f59e0b}.tm2sfst.alarm{border-left-color:#ef4444;background:color-mix(in srgb,#ef4444 12%,var(--card))}
.tm2sfst>div{min-width:0;display:flex;flex-direction:column}.tm2sfst b{font-size:1.6rem;line-height:1.2;margin-top:4px}.tm2sfst small{color:var(--mut);font-size:.92rem}.tm2sfsi{flex:none;display:grid;place-items:center}
.tm2sf2{grid-column:1/3;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}.tm2sf2>.card{margin:0;min-height:0}
.tm2sfdl{flex:1;min-height:0;display:flex;flex-direction:column;gap:6px}
.tm2sfdr{flex:none;display:flex;align-items:center;gap:10px;min-height:48px;padding:4px 12px;border-radius:12px;border:1px solid var(--line);background:none;color:inherit;font:inherit;text-align:left;width:100%}
button.tm2sfdr{cursor:pointer}.tm2sfdr>svg{flex:none;color:var(--c,var(--mut))}.tm2sfdr>span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tm2sfdr>b{flex:none;font-size:.85rem;color:var(--c,var(--teal))}
.tm2sfdr.open{border-color:color-mix(in srgb,var(--amber) 60%,transparent);background:color-mix(in srgb,var(--amber) 10%,transparent)}.tm2sfdr.open>b,.tm2sfdr.open>svg{color:var(--amber)}
.tm2sfd em.wa{color:var(--amber)}.tm2sfhint{flex:none;display:flex;align-items:center;gap:8px;margin-top:6px;font-size:.85rem;color:#93c5fd}
.tm2sfg{flex:1;min-height:0;display:grid;grid-template-columns:repeat(var(--c),minmax(0,1fr));grid-template-rows:repeat(var(--r),minmax(0,1fr));gap:10px}
.tm2sfm{min-width:0;min-height:0;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;gap:4px;padding:10px 12px;border-radius:16px;border:1px solid var(--line);border-top:4px solid var(--c);background:var(--card);color:inherit;font:inherit;text-align:left;cursor:pointer}
.tm2sfm.alarm{background:color-mix(in srgb,#ef4444 14%,var(--card))}.tm2sfm.warn{background:color-mix(in srgb,#f59e0b 8%,var(--card))}.tm2sfm.pause,.tm2sfm.off{opacity:.75}
.tm2sfmh{display:flex;align-items:center;gap:10px;min-width:0}.tm2sfmh .i{flex:none}.tm2sfmh .n{min-width:0}.tm2sfmh b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tm2sfmh small{display:block;font-size:.78rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tm2sfms{display:flex;align-items:center;gap:6px;font-size:.85rem;font-weight:700;color:var(--c)}.tm2sfms i{width:9px;height:9px;border-radius:50%;background:var(--c)}
.tm2sfmb{display:flex;align-items:center;gap:8px}.tm2sfmb>i{flex:1;height:8px;border-radius:4px;background:rgba(127,127,127,.18);overflow:hidden}.tm2sfmb>i>i{display:block;height:100%}.tm2sfmb em{font-style:normal;font-size:.82rem;color:var(--mut)}
.tm2sfp{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,2.2fr) minmax(0,1fr);gap:10px}.tm2sfp>.card{margin:0;min-height:0}
.tm2sfpv{flex:1;min-height:0;display:flex}.tm2sfpv svg{flex:1;width:100%;height:100%}
.tm2.port .tm2sf2,.tm2.port .tm2sfp{grid-template-columns:minmax(0,1fr)}.tm2.port .tm2sfp{grid-template-rows:minmax(0,1.6fr) minmax(0,1fr)}
.tm2.short .tm2sfst b{font-size:1.3rem}.tm2.short .tm2sfst{padding:8px 14px}
/* Müll */
.tm2muo{flex:1;min-height:0;display:flex;flex-direction:column;gap:10px}
.tm2mut{margin:0;flex:none;display:flex;align-items:center;gap:22px;padding:16px 20px;border-left:5px solid var(--teal)}
.tm2mut.today,.tm2mut.due{border-left-color:var(--amber);background:color-mix(in srgb,var(--amber) 9%,var(--card))}.tm2mut.back{border-left-color:#7dd3fc}
.tm2mupic{flex:none;display:flex;align-items:flex-end;gap:4px}.tm2mutx{flex:1;min-width:0;display:flex;flex-direction:column}.tm2mutx>b{font-size:1.9rem;line-height:1.15;margin-top:4px}.tm2mutx>small{color:var(--mut);font-size:1rem}
.tm2mubs{flex:none;display:flex;flex-direction:column;gap:8px}.tm2mub{min-height:64px;padding:0 26px;font-size:1.15rem;display:inline-flex;align-items:center;justify-content:center;gap:10px}.tm2mubs .btn2{min-height:48px}
.tm2mubc{flex:1;min-height:0}.tm2mubg{flex:1;min-height:0;display:grid;grid-template-columns:repeat(var(--c),minmax(0,1fr));grid-template-rows:repeat(var(--r),minmax(0,1fr));gap:10px}
.tm2mub1{min-width:0;min-height:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:10px;border-radius:16px;border:1px solid var(--line);border-bottom:4px solid var(--c);background:rgba(127,127,127,.06);color:inherit;font:inherit;text-align:center}
button.tm2mub1{cursor:pointer}.tm2mub1 b{font-size:1.05rem}.tm2mub1 em{font-style:normal;font-weight:800;font-size:.9rem;color:var(--green,#34d399)}.tm2mub1 small{font-size:.8rem;color:var(--mut)}
.tm2mub1.s-out,.tm2mub1.s-today{background:color-mix(in srgb,var(--amber) 14%,transparent)}.tm2mub1.s-out em,.tm2mub1.s-today em{color:var(--amber)}.tm2mub1.s-soon em{color:#facc15}
.tm2mub1.s-done{background:color-mix(in srgb,var(--teal) 11%,transparent)}.tm2mub1.s-done em{color:var(--teal)}.tm2mub1.s-back em{color:#7dd3fc}.tm2mub1.s-none{opacity:.55}
.tm2muc{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:10px}.tm2muc>.card{margin:0;min-height:0}
.tm2mucal{min-height:0;display:flex}.tm2mucal>.card{flex:1;margin:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}.tm2mucal .mucal2{flex:1;min-height:0;grid-auto-rows:minmax(0,1fr)}
.tm2mucal .mucd2{min-height:0;overflow:hidden;font-size:.95rem}.tm2mucal .mucd2 u{height:6px}.tm2mucal .muyg{flex:1;min-height:0}.tm2mucal .ibtn{width:44px;height:44px}.tm2mucal .gsch{min-height:40px}
.tm2mul{flex:1;min-height:0;display:flex;flex-direction:column;gap:6px}.tm2mur{flex:none;display:flex;align-items:center;gap:10px;min-height:48px;padding:4px 10px;border-radius:12px;background:rgba(127,127,127,.06)}
.tm2mur .t{flex:1;min-width:0}.tm2mur .t b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tm2mur .t small{display:block;font-size:.8rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tm2mur>em{flex:none;font-style:normal;font-weight:700;color:var(--teal)}.tm2mur .k{flex:none;display:flex;gap:2px}.tm2mur .h{flex:none;text-align:right}.tm2mur .h b{display:block;font-size:.88rem}.tm2mur .h small{display:block;font-size:.74rem;color:var(--mut)}
.tm2mur .h.ok b{color:var(--teal)}.tm2mur .h.sk b{color:var(--mut)}.tm2mur .h.no b{color:var(--amber)}.tm2muyb{flex:0 0 28%;height:10px}
.tm2muhm{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}.tm2muhm.one{grid-template-columns:minmax(0,1fr)}.tm2muhm>.card{margin:0;min-height:0}
.tm2muy .muleg{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:.74rem;color:var(--mut)}.tm2muy .muleg u{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:4px}
.tm2.port .tm2mut{flex-wrap:wrap}.tm2.port .tm2mubs{flex-direction:row;width:100%}.tm2.port .tm2mubs .btn2{flex:1}
.tm2.port .tm2muc,.tm2.port .tm2muhm{grid-template-columns:minmax(0,1fr)}.tm2.port .tm2muc{grid-template-rows:minmax(0,1.5fr) minmax(0,1fr)}
.tm2.short .tm2mutx>b{font-size:1.4rem}.tm2.short .tm2mut{padding:8px 14px}.tm2.short .tm2mub{min-height:52px}
.tm2wxt .wxtv{font-size:2rem;line-height:1.15}.tm2wxt .wxtv small{font-size:.9rem}.tm2wxt .wxtn{font-size:.95rem;line-height:1.35;overflow:visible}.tm2wxt .wxts{font-size:.85rem}.tm2wxt .wxtg{font-size:.78rem}
.tm2.port .tm2wxt .wxtv{font-size:1.5rem}.tm2.port .tm2wxt .wxtl{padding:8px 12px}
.tm2mub1 svg{width:auto;height:46%;max-height:170px}.tm2mub1 b{font-size:1.2rem}.tm2mub1 em{font-size:1rem}
.tm2sf2 .tm2sfdr{min-height:56px;font-size:1.02rem}
/* ---------- Tablet-Einstellungen in neuer Optik (2026.11.5b13) ---------- */
.sheet.tmx{display:flex;flex-direction:column;gap:12px;max-width:980px}
.tmxh{display:flex;align-items:center;gap:18px;padding:14px 16px;border-radius:18px;border:1px solid var(--line);background:linear-gradient(135deg,color-mix(in srgb,var(--teal) 12%,var(--card)),var(--card))}
.tmxhi{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.tmxhi b{font-size:1.35rem}.tmxhi small{color:var(--mut)}
.tmxchips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.tmxchip{display:inline-flex;align-items:center;gap:6px;min-height:30px;padding:0 10px;border-radius:999px;border:1px solid var(--line);font-size:.8rem;color:var(--mut)}
.tmxchip.ok{color:var(--primary-text-color);border-color:color-mix(in srgb,var(--teal) 55%,transparent);background:color-mix(in srgb,var(--teal) 10%,transparent)}.tmxchip.ok svg{color:var(--teal)}
.tmxpv{flex:none;display:flex;gap:4px;padding:6px;border-radius:12px;border:3px solid #475569;background:#0b1117;box-shadow:0 6px 18px rgba(0,0,0,.35)}
.tmxpv.land{width:150px;height:96px}.tmxpv.port{width:84px;height:124px;flex-direction:column}.tmxpv.cl{flex-direction:column}
.tmxpr{flex:none;display:flex;flex-direction:column;gap:3px;width:18px}.tmxpd{flex:none;display:flex;justify-content:center;gap:3px;height:16px}
.tmxpr i,.tmxpd i{display:grid;place-items:center;width:18px;height:14px;border-radius:4px;background:rgba(127,127,127,.18);color:var(--mut)}.tmxpr i.on,.tmxpd i.on{background:var(--teal);color:#04201d}
.tmxpr i svg,.tmxpd i svg{width:10px;height:10px}
.tmxpb{flex:1;min-width:0;min-height:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto 1fr 1fr;gap:3px}.tmxpb b{grid-column:1/3;font-size:.55rem;color:#cbd5e1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tmxpb span{border-radius:4px;background:rgba(127,127,127,.18)}.tmxpb span.w{grid-column:1/3;background:color-mix(in srgb,var(--teal) 25%,transparent)}
.tmxpv.big .tmxpb b{font-size:.68rem}.tmxpv.mini{width:96px;height:60px;padding:4px;border-width:2px}.tmxpv.mini .tmxpr{width:10px}.tmxpv.mini .tmxpr i{width:10px;height:7px}.tmxpv.mini .tmxpd{height:8px}.tmxpv.mini .tmxpd i{width:10px;height:7px}.tmxpv.mini .tmxpb{grid-template-rows:1fr 1fr}
.tmxlock{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:14px;border:1px solid color-mix(in srgb,var(--amber) 55%,transparent);background:color-mix(in srgb,var(--amber) 9%,transparent)}
.tmxlock>span{flex:1;min-width:0;display:flex;flex-direction:column}.tmxlock small{color:var(--mut)}.tmxlock>svg{color:var(--amber)}
.tmxtabs{display:flex;gap:4px;padding:4px;border-radius:16px;border:1px solid var(--line);background:var(--card);overflow-x:auto}
.tmxtabs button{flex:1;min-width:96px;min-height:46px;padding:0 14px;border:0;border-radius:12px;background:none;color:var(--mut);font:inherit;font-weight:700;cursor:pointer;white-space:nowrap}.tmxtabs button.sel{background:var(--teal);color:var(--on-acc,#04201d)}
.tmxbody{display:flex;flex-direction:column;gap:12px}
.tmxc{display:flex;flex-direction:column;gap:2px;padding:6px 14px 10px;border-radius:18px;border:1px solid var(--line);background:var(--card)}
.tmxct{padding:8px 0 4px;font-size:.78rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--mut)}.tmxct em{font-style:normal;color:var(--teal);margin-left:4px}
.tmxr,.tmxt{display:flex;align-items:center;gap:12px;min-height:60px;padding:6px 0;flex-wrap:wrap}.tmxr+.tmxr,.tmxt+.tmxt{border-top:1px solid var(--line)}
.tmxri{flex:none;display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:rgba(127,127,127,.12);color:var(--teal)}
.tmxrt{flex:1 1 220px;min-width:0;display:flex;flex-direction:column}.tmxrt small{font-size:.82rem;color:var(--mut)}
.tmxrc{flex:none;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;max-width:100%}.tmxr.wide .tmxrc{flex:1 1 300px}
.tmxin{width:min(320px,100%);margin:0;min-height:44px}
.tmxseg{display:flex;flex-wrap:wrap;gap:4px;padding:4px;border-radius:14px;border:1px solid var(--line);background:rgba(127,127,127,.05)}
.tmxseg button{min-height:42px;min-width:64px;padding:0 14px;border:0;border-radius:10px;background:none;color:var(--mut);font:inherit;font-weight:700;cursor:pointer}.tmxseg button.sel{background:var(--teal);color:var(--on-acc,#04201d)}.tmxseg button:disabled{opacity:.5;cursor:default}
.tmxlooks{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:2px 0 6px}
.tmxlook{display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:14px;border:2px solid var(--line);background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}.tmxlook.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 8%,transparent)}
.tmxlook small{color:var(--mut);font-size:.8rem}.tmxlook .tmxpv{margin-bottom:6px}
.tmxnight{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:4px 0 6px 52px}.tmxnight label{display:flex;align-items:center;gap:6px;color:var(--mut)}.tmxnight input{margin:0;min-height:44px;width:auto;color-scheme:dark}
.tmxhint{display:block;font-size:.82rem;color:var(--mut);margin:2px 0 6px}
.tmxms{display:flex;flex-wrap:wrap;gap:8px;padding:4px 0 6px}
.tmxm{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 14px;border-radius:999px;border:1px solid var(--line);background:none;color:var(--mut);font:inherit;font-weight:600;cursor:pointer}
.tmxm.sel{border-color:color-mix(in srgb,var(--teal) 65%,transparent);background:color-mix(in srgb,var(--teal) 14%,transparent);color:var(--primary-text-color)}.tmxm.sel svg{color:var(--teal)}
.tmxm em{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--teal);color:#04201d;font-style:normal;font-size:.78rem;font-weight:800}
.tmxbtns{display:flex;flex-wrap:wrap;gap:8px;padding:4px 0 2px}.tmxbtns .btn2{display:inline-flex;align-items:center;gap:8px;min-height:46px}
.tmxdisp{display:grid;grid-template-columns:1fr 1fr;gap:12px}.tmxdisp .tmxc{gap:6px}.tmxdisp .osel{margin:0}
.tmxlive{display:inline-flex;align-items:center;gap:8px;font-weight:700}.tmxlive i{width:10px;height:10px;border-radius:50%;background:var(--gray,#64748b)}.tmxlive.on i{background:#34d399;box-shadow:0 0 0 4px rgba(52,211,153,.2)}.tmxlive.bad{color:var(--amber)}.tmxlive.bad i{background:var(--amber)}
.tmxfoot{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}.tmxfoot .btn2{min-height:48px;display:inline-flex;align-items:center;gap:8px}
@media(max-width:700px){.tmxdisp,.tmxlooks{grid-template-columns:1fr}.tmxh{flex-direction:column;align-items:flex-start}.tmxnight{padding-left:0}}
.tmrest.tmnight{filter:brightness(.45)}
.sheet.tmx>*{flex-shrink:0}.tmx .btn2{display:inline-flex;align-items:center;justify-content:center;gap:8px}.tmxfoot .btn2{flex:none;width:auto}.tmxtabs button{flex:1 0 auto}
`;
