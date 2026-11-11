/* Modul 1 · Raumkarte 2.0 */
const CSS_RK = `
.rk2art{--rk-w:#27303a;--rk-f:#1f262e;--rk-f2:#161c22;--rk-t:#3a4652;position:relative;display:block;width:100%;height:100%;overflow:hidden;background:var(--rk-w)}
.rk2art.nt::after{content:"";position:absolute;inset:0;background:#0b1026;opacity:.18;pointer-events:none}
.rk2art.ph.nt::after{display:none}
:host([style*="color-scheme: light"]) .rk2art{--rk-w:#d4dbe4;--rk-f:#c2cbd6;--rk-f2:#aeb9c6;--rk-t:#9aa7b5}
.rk2art svg{display:block;width:100%;height:100%}
.rk2art.gr{filter:saturate(.25) brightness(.92)}
.rk2art.ph{background-size:cover;background-position:center}
.rk2art.ph .rkv{position:absolute;inset:0;background:radial-gradient(120% 90% at 80% 10%,color-mix(in srgb,var(--c) 38%,transparent),transparent 70%),linear-gradient(180deg,transparent 45%,rgba(0,0,0,.35))}
.room.rk2{padding:0;gap:12px}
.room.rk2::before{display:none}
.room.rk2>*:not(.rk2top){margin-left:16px;margin-right:16px}
.rk2top{position:relative;height:150px;flex:none;border-radius:20px 20px 0 0;overflow:hidden;background:var(--rk-w,#27303a)}
.rk2top::after{content:"";position:absolute;inset:auto 0 0 0;height:56px;background:linear-gradient(180deg,transparent,rgba(8,12,16,.55));pointer-events:none}
.rk2eb{all:unset;display:block;width:100%;height:100%;cursor:pointer;position:relative}
.rk2pen{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:inline-flex;gap:6px;align-items:center;background:rgba(0,0,0,.6);color:#fff;font-size:.8rem;font-weight:600;padding:6px 12px;border-radius:99px;z-index:3}
.rk2ov{position:absolute;left:10px;right:10px;top:10px;display:flex;align-items:center;gap:8px;z-index:2}
.rk2ov .grip{background:rgba(0,0,0,.45);color:#fff;border-radius:10px;padding:4px}
.rk2sp{flex:1}
.rk2st{display:inline-flex;align-items:center;gap:7px;font-size:.78rem;font-weight:700;color:#fff;background:rgba(10,14,18,.58);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border-radius:99px;padding:5px 11px 5px 9px;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--c) 55%,transparent);white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.rk2st i{width:9px;height:9px;border-radius:50%;background:var(--c);box-shadow:0 0 8px var(--c);flex:none}
.rk2st i.ps{width:auto;height:auto;background:none;box-shadow:none;color:var(--c);font-style:normal;font-size:.7rem;letter-spacing:-1px}
.rk2swb{background:rgba(10,14,18,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border-radius:99px;padding:3px;display:inline-flex}
.rk2nm{position:absolute;left:14px;bottom:10px;right:110px;z-index:2;pointer-events:none}
.rk2nm b{display:block;color:#fff;font-size:1.15rem;font-weight:700;letter-spacing:-.2px;text-shadow:0 1px 8px rgba(0,0,0,.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk2bg{position:absolute;right:10px;bottom:10px;display:flex;flex-direction:column;align-items:flex-end;gap:5px;z-index:2}
.rk2bg .achip{backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);background:color-mix(in srgb,var(--card) 82%,transparent)}
.rk2mid{display:flex;align-items:center;gap:14px}
.rk2ring{position:relative;width:88px;height:88px;flex:none}
.rk2rv{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1}
.rk2rv b{font-size:1.32rem;font-weight:700;letter-spacing:-.4px}
.rk2rv small{font-size:.66rem;color:var(--mut)}
.rk2rw{position:absolute;right:2px;top:2px;width:17px;height:17px;border-radius:50%;background:#f59e0b;color:#1a1200;font-style:normal;font-weight:800;font-size:.72rem;display:grid;place-items:center}
.rk2ls{display:flex;flex-direction:column;gap:8px;min-width:0;flex:1}
.rk2l{display:flex;align-items:center;gap:10px;min-width:0}
.rk2i{flex:none;width:30px;height:30px;display:grid;place-items:center;color:var(--primary-text-color)}
.rk2t{display:flex;flex-direction:column;min-width:0;flex:1;line-height:1.2}
.rk2t small{font-size:.68rem;color:var(--mut);text-transform:uppercase;letter-spacing:.5px;font-weight:600}
.rk2t b{font-size:.92rem;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk2t em{display:block;font-style:normal;font-size:.74rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk2l.t-bl b{color:#60a5fa}.rk2l.t-or b{color:#fb923c}.rk2l.t-am b{color:var(--amber)}.rk2l.t-rd b{color:#f87171}
.rk2clk{color:var(--primary-text-color)}
.rk2pl{all:unset;display:block;box-sizing:border-box;cursor:pointer;border-radius:12px}
div.rk2pl{cursor:default}
.rk2pl:focus-visible{outline:2px solid var(--teal);outline-offset:4px}
.rk2pl.none{display:inline-flex;align-items:center;gap:6px;color:var(--teal);font-size:.85rem;font-weight:600;padding:4px 0}
.rk2bd{position:relative;display:flex;height:12px;border-radius:99px;overflow:visible}
.rk2bd i{display:block;height:100%}
.rk2bd i:first-child{border-radius:99px 0 0 99px}.rk2bd i:last-of-type{border-radius:0 99px 99px 0}
.rk2bd b{position:absolute;top:-4px;width:4px;height:20px;margin-left:-2px;border-radius:3px;background:var(--primary-text-color,#fff);box-shadow:0 0 0 2px var(--card)}
.rk2bd.off{opacity:.45}
.rk2pl .tla{margin-top:4px}
.rk2pc{display:flex;align-items:center;gap:6px;font-size:.78rem;color:var(--mut);margin-top:2px}
.rk2pc b{color:var(--primary-text-color);font-weight:650}.rk2pc .sun{color:#fbbf24}.rk2pc .nw{white-space:nowrap}
.rk2ft{display:flex;align-items:center;gap:10px;border-top:1px solid var(--line);padding:10px 0 12px;margin-top:auto}
.rk2fl{flex:1;display:flex;align-items:center;gap:7px;font-size:.82rem;color:var(--mut);min-width:0}
.rk2fl b{color:var(--primary-text-color)}
.rk2fl[data-since] b{color:#60a5fa}.rk2fl.done b{color:var(--amber)}.rk2fl .pre{font-style:normal}.rk2fl.done .pre{display:none}
.rk2more{flex:none;width:40px;height:34px;border-radius:12px;border:1px solid var(--line);background:none;color:var(--primary-text-color);font-size:1.3rem;line-height:1;cursor:pointer;padding:0 0 6px}
.rk2more:hover{background:color-mix(in srgb,var(--primary-text-color) 6%,transparent)}
.room.rk2 .airmsg,.room.rk2 .pnote,.room.rk2 .htr{margin-top:0}
.rk2mini{width:64px;height:44px;border-radius:12px;overflow:hidden;flex:none;box-shadow:inset 0 0 0 1px var(--line)}
.room.msr .rk2mini.msm{width:64px;height:46px}
.rk2minib{all:unset;position:relative;cursor:pointer;display:block}
.rk2minib .pen{position:absolute;right:-4px;bottom:-4px}
.crow.rkc{grid-template-columns:58px minmax(0,1fr) auto}.crow.rkc.ed{grid-template-columns:28px 58px minmax(0,1fr) auto}
.crow .rk2mini,.crow .rk2minib{grid-area:i;width:58px;height:42px}.crow .rk2minib .rk2mini{width:100%;height:100%}
@media(min-width:720px){.chead.rkc,.crow.rkc{grid-template-columns:58px minmax(0,1.5fr) minmax(0,1.1fr) minmax(0,1fr) minmax(0,1.4fr) minmax(0,.9fr) 108px 52px}.chead.rkc.ed,.crow.rkc.ed{grid-template-columns:28px 58px minmax(0,1.5fr) minmax(0,1.1fr) minmax(0,1fr) minmax(0,1.4fr) minmax(0,.9fr) 108px 52px}.crow .rk2mini,.crow .rk2minib{grid-area:auto}}
.rk2menu{display:flex;flex-direction:column;gap:6px;margin-bottom:6px}
.rk2mi{display:flex;align-items:center;gap:12px;text-align:left;background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:14px;padding:12px 14px;font:inherit;cursor:pointer;min-height:56px}
.rk2mi span{flex:1;display:flex;flex-direction:column}.rk2mi small{color:var(--mut);font-size:.76rem}
.rk2mi>svg:last-child{transform:rotate(-90deg);opacity:.5}
.rk2dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;vertical-align:1px}
.rk2tp{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:8px;margin:6px 0 10px}
.rk2tp button{display:flex;flex-direction:column;align-items:flex-start;gap:4px;background:none;border:2px solid var(--line);border-radius:14px;padding:5px 5px 7px;cursor:pointer;color:var(--primary-text-color);font:inherit;text-align:left}
.rk2tp button.sel{border-color:var(--teal)}
.rk2tp b{font-size:.8rem;padding:0 3px}.rk2tp small{font-size:.7rem;color:var(--mut);padding:0 3px;margin-top:-4px}
.ltog.rkan{flex-wrap:wrap;gap:8px}.ltog.rkan>span{flex:1 1 220px}.ltog.rkan .seg{flex:none;margin-left:auto}
.rk2art.sm{height:58px;border-radius:10px}
.rk2dvs{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}
.rk2dv{position:relative;display:flex;align-items:center;gap:8px;border-radius:16px;padding:6px 10px 6px 6px;background:color-mix(in srgb,var(--c) 9%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--c) 28%,transparent);min-width:0}
.rk2dv.run{background:linear-gradient(135deg,color-mix(in srgb,var(--c) 18%,transparent),color-mix(in srgb,var(--c) 6%,transparent))}
.rk2dvb{all:unset;flex:1;display:flex;align-items:center;gap:8px;cursor:pointer;min-width:0;border-radius:12px;position:relative}
.rk2dvb:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.rk2dvi{flex:none;width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--c) 14%,transparent)}
.rk2dvt{display:flex;flex-direction:column;min-width:0;flex:1;line-height:1.2}
.rk2dvt small{font-size:.68rem;color:var(--mut);text-transform:uppercase;letter-spacing:.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk2dvt small .sun{font-style:normal;color:#fbbf24}
.rk2dvt b{font-size:.9rem;font-weight:650;color:var(--c);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk2dv:not(.run) .rk2dvt b{color:var(--primary-text-color)}
.rk2dvt em{font-style:normal;font-size:.73rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rk2dvt em.am{color:var(--amber)}
.rk2stp{display:flex;gap:3px;margin-top:5px;max-width:120px}.rk2stp i{flex:1;height:5px;border-radius:3px;background:color-mix(in srgb,var(--primary-text-color) 15%,transparent)}.rk2stp i.on{background:var(--c)}
.rk2dv.run .rk2stp i.on:last-of-type{animation:rkGlow 1.6s ease-in-out infinite alternate}
.rk2tank{display:block;height:5px;border-radius:3px;margin-top:5px;max-width:120px;background:color-mix(in srgb,var(--primary-text-color) 15%,transparent);overflow:hidden}.rk2tank i{display:block;height:100%;background:#38bdf8;border-radius:3px}
.rk2dvn{position:absolute;right:-2px;top:-2px;min-width:17px;height:17px;border-radius:99px;background:var(--amber);color:#1a1200;font-size:.68rem;font-weight:800;display:grid;place-items:center;padding:0 4px}
.rk2dv .sw{flex:none}
.rk2sht{display:grid;place-items:center;margin:2px 0 8px}
.room.rk2 .lfmove{margin-top:0;width:auto;box-sizing:border-box}
@media(prefers-reduced-motion:reduce){.rk2stp i{animation:none!important}}
.rk2tag{font-size:.68rem;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:#fff;background:rgba(10,14,18,.5);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border-radius:99px;padding:5px 10px}
.rk2fl.warn{color:var(--amber)}
.lftile .rk2mini.lft{display:block;width:100%;height:54px;border-radius:10px;margin:-2px 0 8px}
.lftile.sel .rk2mini.lft{box-shadow:0 0 0 2px var(--teal)}
.pvr .rk2mini.pvm{width:44px;height:30px;border-radius:9px}
.pvr b{display:flex;flex-direction:column;gap:3px}.rk2stp.pv{margin-top:0;width:60px;--c:#fb923c}
.rk2pvb .pvh .pt{display:inline-flex;align-items:center;gap:8px}
.cell.rkw b{color:#60a5fa;display:flex;align-items:center;gap:6px}.cell.win b .gx,.cell.win b svg{display:inline-block;vertical-align:-4px;flex:none}
.crow .cell.w1 b{display:flex;align-items:center;gap:6px}
.rkdot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;vertical-align:2px;box-shadow:0 0 6px currentColor}
.rk2bd.sm{height:8px;margin-top:5px}.rk2bd.sm b{top:-3px;height:14px;width:3px}
.rk2gm .gm{padding:5px 12px 5px 5px;border-radius:14px;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--c) 40%,transparent)}
.rk2gm .gm .rk2mini.gmm{width:46px;height:32px;border-radius:9px}
.rk2gm .gm>span:last-child{display:flex;flex-direction:column;line-height:1.2}.rk2gm .gm b{font-size:.84rem}.rk2gm .gm small{font-size:.72rem}
.rk2gs{display:flex;gap:3px;align-items:flex-end;margin:0 6px;flex-wrap:wrap;max-width:40%}.rk2gs i{display:block;line-height:0}
@media(max-width:600px){.rk2gs{display:none}}
.rk2empty{max-width:420px;height:150px;margin:0 auto 16px;border-radius:18px;overflow:hidden}
.rk2empty svg{width:100%;height:100%;display:block}
.rk2art .rkgl{mix-blend-mode:screen}
:host([style*="color-scheme: light"]) .rk2art .rkgl{mix-blend-mode:multiply;opacity:.55}
/* Bewegung: nur transform und opacity (K5) */
@keyframes rkRise{0%{transform:translateY(6px);opacity:0}25%{opacity:.95}100%{transform:translateY(-16px);opacity:0}}
@keyframes rkAir{0%{transform:translateX(-8px);opacity:0}30%{opacity:.9}100%{transform:translateX(30px);opacity:0}}
@keyframes rkGlow{0%{opacity:.6}100%{opacity:1}}
.rk2art .hw path,.rk2art .aw path{transform-box:fill-box}
.rk2art[data-an=dezent] .hw path,.rk2art[data-an=voll] .hw path{animation:rkRise 4s linear infinite}
.rk2art[data-an=dezent] .aw path,.rk2art[data-an=voll] .aw path{animation:rkAir 3.4s ease-out infinite}
.rk2art .hw1,.rk2art .aw1{animation-delay:-1.3s!important}.rk2art .hw2,.rk2art .aw2{animation-delay:-2.6s!important}
.rk2art[data-an=voll] .lg{animation:rkGlow 2.8s ease-in-out infinite alternate}
.rk2art.mini .hw path,.rk2art.mini .aw path,.rk2art.sm *{animation:none!important}
@media(prefers-reduced-motion:reduce){.rk2art *{animation:none!important}}
@media(max-width:600px){.rk2top{height:128px}.rk2ring,.rk2ring svg{width:80px;height:80px}.rk2rv b{font-size:1.18rem}.rk2mid{gap:10px}.room.rk2>*:not(.rk2top){margin-left:14px;margin-right:14px}}
`;
