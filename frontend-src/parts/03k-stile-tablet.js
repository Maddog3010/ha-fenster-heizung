/* Tablet-Modus · Neuer Aufbau (Stufe 1): Leiste links bzw. unten, Startseite auf einer Seite */
const CSS_TM2 = `
.tmw.tm2.land{flex-direction:row}
.tm2main{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column}
.tm2rail{width:104px;flex:none;display:flex;flex-direction:column;align-items:center;gap:8px;padding:calc(8px + env(safe-area-inset-top,0px)) 8px calc(10px + env(safe-area-inset-bottom,0px)) calc(8px + env(safe-area-inset-left,0px));border-right:1px solid var(--line);background:var(--card)}
.tm2rail .blogo{width:50px;height:50px;flex:none}
.tm2rl{flex:1;min-height:0;width:100%;display:flex;flex-direction:column;gap:8px}
.tm2rail .tmdk{flex:1 1 0;min-height:44px;max-height:86px;height:auto;width:100%;overflow:hidden}
.tm2 .tm2h{padding:calc(8px + env(safe-area-inset-top,0px)) 16px 2px;min-height:62px}
.tm2 .tm2h .blogo{width:44px;height:44px}
.tm2h .tmht span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm2 .tmclk span{font-size:2.2rem}.tm2 .tmclk small{margin-top:1px;font-size:.78rem}
.tm2.port .tm2dock{gap:6px;padding:8px 10px calc(10px + env(safe-area-inset-bottom,0px))}.tm2.port .tm2dock .tmdk{height:72px;border-radius:16px}
.tm2 .tmbody{padding:8px 16px 14px}
/* Startseite: füllt genau die Resthöhe */
.tm2 .tmbody.tm2fit{display:flex;flex-direction:column;overflow:hidden}
.tm2fit>.hzpg{flex:1;min-height:0;display:flex;flex-direction:column;gap:10px}
.tm2fit .mqstrip,.tm2fit .hzqa{flex:none;margin:0}
.tm2fit .mqqa{min-height:44px}
.tm2sc{flex:1 1 0;min-height:0;position:relative;overflow:hidden;border-radius:20px;background:var(--card)}
.tm2sc svg.hzsc{position:absolute;right:0;top:0;width:100%;height:100%;display:block}
.tm2sc.plain{flex:0 0 auto;border:1px solid var(--line)}.tm2sc.plain .tm2amp{position:static;margin:8px;background:none;color:inherit}.tm2sc.plain small{color:var(--mut)}
.tm2amp{position:absolute;left:14px;bottom:14px;max-width:min(54%,520px);display:flex;gap:12px;align-items:flex-start;padding:12px 18px;border-radius:16px;background:rgba(9,17,27,.74);color:#fff}
.tm2amp i{width:14px;height:14px;border-radius:50%;background:var(--zc);box-shadow:0 0 12px var(--zc);flex:none;margin-top:8px}
.tm2amp b{display:block;font-size:1.5rem;line-height:1.2}.tm2amp small{display:block;font-size:.95rem;color:#d5e0ea;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.tm2amp small.d{color:#a9bccb;font-size:.85rem}
.tm2bubs{flex:none;display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:8px}
.tm2.port .tm2bubs{grid-template-columns:repeat(4,minmax(0,1fr))}
.tm2b{min-width:0;height:54px;display:flex;align-items:center;gap:8px;padding:0 10px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:inherit;font:inherit;text-align:left;cursor:pointer}
.tm2b.z-warn,.tm2b.z-hint{border-color:color-mix(in srgb,var(--zc) 65%,transparent)}
.tm2b svg{flex:none}.tm2b span{min-width:0}.tm2b b{display:block;font-size:.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tm2b small{display:block;font-size:.72rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tm2low{flex:2.1 1 0;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 320px;grid-template-rows:minmax(0,1fr);gap:10px}
.tm2col{min-width:0;min-height:0;display:flex;flex-direction:column;gap:8px;touch-action:pan-y}
.tm2grid{flex:1;min-height:0;display:grid;grid-template-columns:repeat(var(--c),minmax(0,1fr));grid-template-rows:repeat(var(--r),minmax(0,1fr));gap:10px}
.tm2t{position:relative;min-width:0;min-height:0;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:3px;padding:10px 14px;border-radius:18px;border:1px solid var(--line);border-bottom:3px solid var(--zc);background:var(--card);color:inherit;font:inherit;text-align:left;cursor:pointer}
.tm2tp{display:block;flex:0 1 auto;min-height:0;color:var(--zc)}.tm2tp svg{display:block;max-height:100%}
.tm2t b{font-size:1.05rem;line-height:1.2;max-width:100%;flex:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tm2t small{font-size:.85rem;line-height:1.25;color:var(--mut);flex:none;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.tm2t:not(.z-off) small{color:var(--zc)}
.tm2t em{position:absolute;top:8px;right:10px;font-style:normal;font-size:.66rem;font-weight:700;text-transform:uppercase;color:var(--mut)}
.tm2t:active,.tm2b:active,.tm2hm:active,.tm2m:active{filter:brightness(1.15)}
.tm2side{min-width:0;min-height:0;display:flex;flex-direction:column;gap:8px;touch-action:pan-y}
.tm2hl{flex:1;min-height:0;display:grid;grid-template-rows:repeat(var(--h),minmax(0,1fr));gap:10px}
.tm2h1{min-height:0;overflow:hidden;display:flex;flex-direction:column;justify-content:center;border-radius:18px;border:1px solid var(--line);background:var(--card)}
.tm2h1.z-hint,.tm2h1.z-warn{border-color:color-mix(in srgb,var(--zc) 60%,transparent);background:color-mix(in srgb,var(--zc) 9%,var(--card))}
.tm2hm{flex:1;min-height:0;display:flex;align-items:center;gap:12px;padding:6px 12px;border:0;background:none;color:inherit;font:inherit;text-align:left}button.tm2hm{cursor:pointer}
.tm2hp{flex:none;display:grid;place-items:center;width:42px;color:var(--zc)}
.tm2hx{min-width:0}.tm2hx b{font-size:.98rem;line-height:1.25;font-weight:600;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.tm2hx small{font-size:.8rem;color:var(--mut);overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}
.tm2hb{flex:none;min-height:44px;margin:0 10px 8px;display:flex;align-items:center;justify-content:center;gap:8px;border-radius:12px;border:1px solid color-mix(in srgb,var(--teal) 50%,transparent);background:color-mix(in srgb,var(--teal) 13%,transparent);color:var(--teal);font:inherit;font-weight:700;cursor:pointer}
.tm2ok{grid-row:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border-radius:18px;border:1px solid var(--line);background:var(--card);text-align:center;padding:12px}
.tm2later{flex:none;min-height:44px;display:flex;align-items:center;justify-content:center;gap:8px;border:0;background:none;color:var(--mut);font:inherit;font-size:.85rem;cursor:pointer}
.tm2pg{flex:none;display:flex;align-items:center;justify-content:center;gap:12px;min-height:44px}
.tm2pg button{width:56px;height:44px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:inherit;display:grid;place-items:center;cursor:pointer}.tm2pg button:disabled{opacity:.3}
.tm2pg button:first-child svg{transform:none}.tm2pg button:last-of-type svg{transform:rotate(-90deg)}
.tm2dots{display:flex;gap:7px}.tm2dots i{width:8px;height:8px;border-radius:999px;background:var(--line)}.tm2dots i.on{width:24px;background:var(--teal)}
.tm2pg small{font-size:.78rem;color:var(--mut)}
/* Hochkant: Hinweise unter den Kacheln */
.tm2.port .tm2sc{flex:1.1 1 0}
.tm2.port .tm2low{flex:3 1 0;grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,2.2fr) minmax(154px,1fr)}
.tm2.port .tm2amp{max-width:54%;top:12px;bottom:auto}
.tm2.port .tm2t,.tm2.short .tm2t{justify-content:flex-start;align-items:center;display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-rows:auto auto;align-content:center;column-gap:12px}
.tm2.port .tm2tp,.tm2.short .tm2tp{grid-row:1/span 2}
.tm2.port .tm2h1{flex-direction:row;align-items:center}.tm2.port .tm2hm{align-self:stretch}.tm2.port .tm2hb{margin:0 10px 0 0;padding:0 14px}
.tm2.port .tm2low.nohint{grid-template-rows:minmax(0,3fr) minmax(0,.7fr)}
@media(max-width:1100px) and (orientation:landscape){.tm2b{padding:0 6px;gap:5px}.tm2b svg{width:22px;height:22px}.tm2b b{font-size:.84rem}.tm2b small{font-size:.66rem}}
/* Größe */
.tm2.sz-large .tm2t b{font-size:1.25rem}.tm2.sz-large .tm2t small{font-size:1rem}.tm2.sz-large .tm2hx b{font-size:1.12rem}.tm2.sz-large .tm2b b{font-size:1.1rem}
.tm2.sz-xl .tm2t b{font-size:1.45rem}.tm2.sz-xl .tm2t small{font-size:1.15rem}.tm2.sz-xl .tm2hx b{font-size:1.25rem}.tm2.sz-xl .tm2hx small{font-size:.95rem}.tm2.sz-xl .tm2b b{font-size:1.15rem}.tm2.sz-xl .tmdk{font-size:.92rem}
/* „Mehr“ */
@media(min-width:720px){.sheet.wide.tm2all{width:min(1060px,94vw);max-height:94vh}}
.tm2all .sh>div{flex:1}.tm2ed{flex:none;margin-right:10px}
.tm2mg{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:6px 0 10px;touch-action:pan-y}
@media(max-width:900px){.tm2mg{grid-template-columns:repeat(2,minmax(0,1fr))}}
.tm2m{min-width:0;min-height:84px;display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:16px;border:1px solid var(--line);background:rgba(127,127,127,.07);color:inherit;font:inherit;text-align:left;cursor:pointer}
.tm2m.inr{border-color:color-mix(in srgb,var(--teal) 45%,var(--line))}.tm2m.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 13%,transparent)}
.tm2m svg{flex:none}.tm2m span{min-width:0}.tm2m b{display:block;font-size:.98rem;line-height:1.2}.tm2m small{display:block;font-size:.76rem;color:var(--mut)}
/* Ruhebild */
.tmrest.hzst.tm2r{padding-top:5vh}.tmrest.hzst.tm2r>.tmsc{height:43%}.tmrest.hzst.tm2r .tmrw{color:#fff;opacity:.85;text-shadow:0 1px 4px #000}
.tmrest .tm2rh{order:3}.tm2rh{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:12px;padding:0 20px;max-width:1100px}
.tm2rh>div{display:flex;align-items:center;gap:10px;max-width:340px;padding:10px 16px;border-radius:14px;background:rgba(13,19,27,.88);border:1px solid rgba(255,255,255,.1);text-align:left;color:#d7dde4}
.tm2rh i{width:10px;height:10px;border-radius:50%;background:var(--zc);flex:none}.tm2rh b{display:block;font-size:.98rem;font-weight:600}.tm2rh small{display:block;font-size:.8rem;color:#98a4af}
`;
