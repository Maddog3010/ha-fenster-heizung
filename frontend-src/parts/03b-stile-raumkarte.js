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
.achip.prc{color:var(--teal);background:color-mix(in srgb,var(--teal) 14%,transparent)}.rk2l.t-pr b{color:var(--teal)}.rk2pc .pr{color:var(--teal);font-weight:650}.rk2l.t-bl b{color:#60a5fa}.rk2l.t-or b{color:#fb923c}.rk2l.t-am b{color:var(--amber)}.rk2l.t-rd b{color:#f87171}
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
.hero.hsx{min-height:210px}
.hs2{position:absolute;right:16px;top:14px;bottom:14px;width:min(46%,420px);border-radius:18px;overflow:hidden;z-index:1;box-shadow:0 10px 26px rgba(0,0,0,.25),inset 0 0 0 1px rgba(255,255,255,.18)}
.hs2 svg{display:block;width:100%;height:100%;background:#9fb1c6}
.hero.hsx .chips,.hero.hsx .wx{max-width:calc(100% - min(46%,420px) - 24px)}
.hero.hsx .chips{padding-right:0}
.hsr:hover rect:first-of-type{opacity:.6}
.room.hsflash,.crow.hsflash{animation:hsFlash 1.4s ease-out}
@keyframes hsFlash{0%{box-shadow:0 0 0 0 var(--teal)}25%{box-shadow:0 0 0 4px var(--teal)}100%{box-shadow:0 0 0 0 transparent}}
@keyframes hsSm{0%{transform:translateY(4px);opacity:0}40%{opacity:.7}100%{transform:translateY(-10px);opacity:0}}
@keyframes hsDrift{0%{transform:translateX(-10px)}100%{transform:translateX(10px)}}
@keyframes hsFall{0%{transform:translateY(-20px)}100%{transform:translateY(40px)}}
.hs2 .hssm circle,.hs2 .hshw path,.hs2 .hsaw,.hs2 .hsfl{transform-box:fill-box}
.hs2[data-an=dezent] .hssm circle,.hs2[data-an=voll] .hssm circle{animation:hsSm 3.6s linear infinite}.hs2 .hssm1{animation-delay:-1.8s!important}
.hs2[data-an=dezent] .hshw path,.hs2[data-an=voll] .hshw path{animation:rkRise 3.4s linear infinite}.hs2 .hshw1{animation-delay:-1.7s!important}
.hs2[data-an=dezent] .hsaw,.hs2[data-an=voll] .hsaw{animation:rkAir 3s ease-out infinite}
.hs2[data-an=voll] .hscl{animation:hsDrift 14s ease-in-out infinite alternate}
.hs2[data-an=voll] .hsrn,.hs2[data-an=voll] .hssn{animation:hsFall 2.6s linear infinite}
.hs2[data-an=voll] .hspv{animation:rkGlow 2.4s ease-in-out infinite alternate}
@media(prefers-reduced-motion:reduce){.hs2 *{animation:none!important}}
@media(max-width:600px){.hero.hsx{min-height:0}.hs2{position:relative;right:auto;top:auto;bottom:auto;width:auto;height:auto;aspect-ratio:268/194;margin:0 0 12px}.hero.hsx .chips,.hero.hsx .wx{max-width:none}}
.gpc h2{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.gpv{border-radius:18px;overflow:hidden;background:linear-gradient(180deg,color-mix(in srgb,var(--primary-text-color) 4%,transparent),color-mix(in srgb,var(--primary-text-color) 1.5%,transparent));border:1px solid var(--line);margin-top:10px;padding:6px}
.gpv svg{display:block;width:100%;height:auto;max-height:560px}
.gpw{stroke:var(--primary-text-color);stroke-width:5;stroke-linecap:round;fill:none;opacity:.55}
.gpr.on,.gpr[data-act]{cursor:pointer}.gpr{transition:filter .15s}.gpr[data-act]:hover{filter:brightness(1.15)}
.gpbase{fill:color-mix(in srgb,var(--primary-text-color) 5%,var(--card-background-color,#1c1f26))}.gpbase.un{fill:color-mix(in srgb,var(--primary-text-color) 3%,var(--card-background-color,#1c1f26))}
.gpz{font-weight:600;fill:var(--mut);font-family:inherit}
.gppl rect{fill:rgba(8,12,20,.55);stroke:rgba(255,255,255,.12);stroke-width:1}.gppl text{fill:#fff;font-weight:700;font-family:inherit}
.gpdo path{stroke:var(--mut)}.gpgapr{fill:var(--card-background-color,#1c1f26)}
.gpv[data-an=dezent] .gpglow,.gpv[data-an=voll] .gpglow{animation:gpGlow 2.6s ease-in-out infinite alternate}@keyframes gpGlow{from{stroke-opacity:.12}to{stroke-opacity:.4}}
.gpsum{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}.gpsum span{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:99px;border:1px solid var(--line);background:color-mix(in srgb,var(--primary-text-color) 4%,transparent);font-size:.82rem;color:var(--mut)}
.gpsum b{color:var(--primary-text-color)}.gpsum .h{border-color:color-mix(in srgb,#fb923c 50%,var(--line));color:#fb923c}.gpsum .o{border-color:color-mix(in srgb,#3b82f6 55%,var(--line));color:#60a5fa}.gpsum .u{border-style:dashed}.gpsum button.u{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:99px;border:1px dashed var(--line);background:transparent;font:inherit;font-size:.82rem;color:var(--mut);cursor:pointer}.gpsum button.u:hover{color:var(--primary-text-color);border-color:var(--teal)}
.gpn{font-weight:700;fill:var(--primary-text-color);opacity:.9;font-family:inherit}
.gpt{font-weight:800;fill:var(--primary-text-color);font-family:inherit;letter-spacing:-.5px}
.gps{font-weight:700;fill:var(--mut);font-family:system-ui,sans-serif}
.gptx{font-size:14px;font-weight:700;fill:var(--mut)}
.gplg{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;font-size:.8rem;color:var(--mut);margin-top:12px}
.gplg span{display:inline-flex;align-items:center;gap:6px}.gpk{width:16px;height:6px;border-radius:3px;display:inline-block}.gpk.un{background:repeating-linear-gradient(45deg,var(--line) 0 3px,transparent 3px 6px);height:12px;width:16px}
.gpsc{position:relative;padding-bottom:14px}.gpsc i{display:block;width:150px;height:8px;border-radius:4px}.gpsc small{position:absolute;bottom:-1px;font-size:.66rem}.gpsc small:first-of-type{left:0}.gpsc small:last-of-type{right:0}
.gpnote{margin-top:6px}
.msloc{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:2px 0 8px}.msloc button{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;gap:2px 10px;align-items:center;text-align:left;font:inherit;color:inherit;padding:10px 12px;border-radius:14px;border:1.5px solid var(--line);background:transparent;cursor:pointer}
.msloc button .gx{grid-row:1/3}.msloc button b{font-size:.95rem}.msloc button span{font-size:.76rem;color:var(--mut);line-height:1.3}.msloc button.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 12%,transparent)}
@media (max-width:520px){.msloc{grid-template-columns:1fr}}
.gpmsb small{font-size:.72rem;color:var(--mut)}.gpmsi{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;background:color-mix(in srgb,var(--c) 18%,transparent);margin:0 auto 4px}
@media(max-width:600px){.vbar{flex-wrap:wrap;gap:8px}.vbar .vseg{flex:1 1 100%;display:flex}.vbar .vseg button{flex:1;justify-content:center;padding-left:6px;padding-right:6px}}
.gpempty{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:24px}.gpempty span{max-width:460px}.gpempty .btn2{flex:none;padding:10px 20px}
.gpv .gphw path{transform-box:fill-box}
.gpv[data-an=dezent] .gphw path,.gpv[data-an=voll] .gphw path{animation:rkRise 3.4s linear infinite}.gpv .gphw1{animation-delay:-1.1s!important}.gpv .gphw2{animation-delay:-2.2s!important}
.gpv[data-an=dezent] .gpaw,.gpv[data-an=voll] .gpaw{animation:rkGlow 1.4s ease-in-out infinite alternate}
@media(prefers-reduced-motion:reduce){.gpv *{animation:none!important}}
.wtl{position:relative;display:flex;flex-direction:column;gap:2px;margin:4px 0 12px;padding-left:4px}
.wti{position:relative;display:grid;grid-template-columns:52px 14px 1fr;gap:8px;align-items:start;font-size:.86rem;padding:5px 0;--c:var(--mut)}
.wti time{color:var(--mut);font-size:.76rem;font-variant-numeric:tabular-nums;padding-top:1px;text-align:right}
.wti i{width:11px;height:11px;border-radius:50%;background:var(--c);margin-top:3px;box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 22%,transparent);position:relative;z-index:1}
.wti:not(:last-child)::after{content:"";position:absolute;left:69px;top:16px;bottom:-8px;width:2px;background:var(--line)}
.wti small{display:block;color:var(--mut);font-size:.74rem}
.wti.ok{--c:#34d399}.wti.am{--c:#f59e0b}.wti.bl{--c:#60a5fa}.wti.pl{--c:#a78bfa}.wti.pr{--c:var(--teal)}.wti.in{--c:#94a3b8}
.wti.now{background:color-mix(in srgb,var(--c) 10%,transparent);border-radius:10px;padding:7px 0}.wti.now time{color:var(--primary-text-color);font-weight:700}
.wti.fut i{background:transparent;border:2px dashed var(--c);box-shadow:none;width:7px;height:7px}.wti.fut span{color:var(--mut)}.wti.fut:not(:last-child)::after{background:repeating-linear-gradient(var(--line) 0 4px,transparent 4px 7px)}
.wt0{padding:4px 0 4px 66px}
/* Modul 3 · Stufe 1 */
.m3tiles .m3t{display:flex;flex-direction:column;text-align:left;background:linear-gradient(160deg,color-mix(in srgb,var(--a) 13%,var(--card)),var(--card) 70%);border:1px solid color-mix(in srgb,var(--a) 22%,var(--line));padding:12px 14px 0;cursor:pointer;font:inherit;color:inherit}
.m3tiles .m3t.sel{border:2px solid var(--a);padding:11px 13px 0}
.m3h{display:flex;align-items:center;gap:10px;min-width:0}.m3l{flex:1;font-size:.8rem;font-weight:650;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.m3ic{position:relative;flex:none;width:40px;height:40px}.m3ic .gx{width:40px;height:40px}
.m3sub{position:absolute;right:-6px;bottom:-4px;width:20px;height:20px;border-radius:6px;background:var(--card);box-shadow:0 0 0 1.5px var(--card)}.m3ic .m3sub .gx{width:20px;height:20px}
.m3ar{position:absolute;right:-4px;bottom:-3px;width:17px;height:17px;border-radius:50%;color:#fff;font-style:normal;font-weight:800;font-size:.72rem;display:grid;place-items:center;box-shadow:0 0 0 2px var(--card)}
.m3pl{flex:none;font-size:.7rem;font-weight:750;border-radius:99px;padding:3px 8px;background:color-mix(in srgb,var(--mut) 18%,transparent);color:var(--mut)}
.m3pl.up{background:color-mix(in srgb,#34d399 18%,transparent);color:#34d399}.m3pl.dn{background:color-mix(in srgb,#f87171 18%,transparent);color:#f87171}
.m3t .v{margin-top:10px}.m3t .g{min-height:1.2em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
.m3sp{position:relative;margin:8px -14px 0;height:46px}.m3sp svg{position:absolute;left:0;right:0;top:0;width:100%;height:34px;display:block}
.m3now{position:absolute;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#fff;box-shadow:0 0 0 2px var(--c),0 0 8px var(--c);max-height:34px}
.m3ax{position:absolute;left:14px;right:14px;bottom:2px;display:flex;justify-content:space-between;font-size:.62rem;color:var(--mut)}
.m3ring .m3b{fill:none;stroke:rgba(255,255,255,.18);stroke-width:7}.m3ring .m3b.i{stroke-width:6}
.m3ring .m3o{fill:none;stroke:#2dd4bf;stroke-width:7;stroke-linecap:round}.m3ring .m3i{fill:none;stroke:#fbbf24;stroke-width:6;stroke-linecap:round}
.m3ring .rv b{font-size:1.6rem}.m3ring .rv span{font-size:.72rem;font-weight:650;line-height:1.15}.m3ring .rv .m3rs{font-weight:500;opacity:.85}
.m3ring .m3in{position:absolute;left:50%;top:calc(100% + 6px);transform:translateX(-50%);white-space:nowrap;font-style:normal;font-size:.72rem;font-weight:750;color:#fde68a;background:rgba(0,0,0,.28);border-radius:99px;padding:2px 9px}
.m3rel{margin-left:6px;color:#1a1200;border-radius:99px;padding:1px 7px;font-size:.72rem}
.m3rl{position:absolute;right:28px;bottom:14px;display:flex;flex-direction:column;gap:2px;font-size:.7rem;color:#fff;opacity:.9;z-index:1;text-align:right}.m3rl span{display:inline-flex;gap:5px;align-items:center;justify-content:flex-end}.m3rl i{width:8px;height:8px;border-radius:50%}
.m3pr{position:relative;padding-bottom:9px}.m3sc{position:absolute;left:12px;right:12px;bottom:4px;height:3px;border-radius:2px;background:linear-gradient(90deg,#34d399,#fbbf24,#f87171)}.m3sc i{position:absolute;top:-2.5px;width:8px;height:8px;margin-left:-4px;border-radius:50%;background:#fff;box-shadow:0 0 0 1.5px #111}
@media(max-width:600px){.m3rl{display:none}.m3h{flex-wrap:wrap;justify-content:space-between}.m3l{order:3;flex:1 1 100%;margin-top:2px}.m3ring .m3in{top:auto;bottom:calc(100% + 4px);left:auto;right:-6px;transform:none;font-size:.66rem}.m3ring .m3in .m3inx{display:none}.m3sub{right:-4px}.m3tiles .m3t .g{font-size:.7rem}.m3h{gap:7px}.m3ic,.m3ic .gx{width:32px;height:32px}}
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
/* Modul 3 · Stufe 2: Energiefluss HD und Hinweise */
.m3fc h2{flex-wrap:wrap}.m3big{margin-left:auto;font-size:.8rem}
.m3fl{max-width:470px}.m3fl .m3tr{fill:none;stroke:var(--line);stroke-width:2;stroke-linecap:round;opacity:.9}
.m3fl .m3gl{fill:none;stroke-linecap:round;opacity:.32}.m3fl .m3ln{fill:none;stroke-linecap:round}
.m3fl .m3dt{fill:none;stroke:#fff;stroke-linecap:round;stroke-dasharray:0 15;opacity:0}
.m3fl[data-an=dezent] .m3dt,.m3fl[data-an=voll] .m3dt{opacity:.85;animation:m3run 1.6s linear infinite}
@keyframes m3run{to{stroke-dashoffset:-30}}
.m3fl .m3pq{fill:color-mix(in srgb,var(--c) 12%,var(--card));stroke-width:2.2}
.m3fl .m3nd{cursor:pointer;outline:none}.m3fl .m3nd:not(.on) .gx{opacity:.55;filter:saturate(.5)}
.m3fl .m3nd.sel .m3pq{stroke-width:3.6}.m3fl .m3nd:focus-visible .m3pq{stroke-width:3.6;stroke:var(--primary-color)!important}
.m3fl[data-an=voll] .m3nd.on .gx{animation:rkGlow 2.4s ease-in-out infinite alternate}
.m3fn1{font-size:12px;font-weight:700;text-anchor:middle;fill:var(--primary-text-color)}.m3fn2{font-size:11.5px;font-weight:700;text-anchor:middle}
.m3fd{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;margin:8px 0 0;padding:10px 12px;border-radius:14px;background:color-mix(in srgb,var(--c) 10%,var(--card));border:1px solid color-mix(in srgb,var(--c) 40%,var(--line))}
.m3fd>b{font-size:.95rem}.m3fd span{display:flex;flex-direction:column;font-weight:700;font-size:.88rem}.m3fd small{font-weight:500;color:var(--mut);font-size:.7rem}
.m3fd .m3go{flex:none;padding:6px 12px;margin-left:auto}.m3fd .m3fx{flex:none}.m3fd em{flex:1 1 100%;font-style:normal}
.m3hl{display:flex;flex-direction:column;gap:8px}
.m3hn{display:grid;grid-template-columns:38px 1fr auto;gap:12px;align-items:center;padding:10px 12px 10px 14px;border-radius:14px;background:color-mix(in srgb,var(--c) 7%,var(--card));border:1px solid var(--line);border-left:4px solid var(--c)}
.m3hn b{display:block;font-size:.9rem}.m3hn span{display:block;color:var(--mut);font-size:.8rem;margin-top:2px}
.m3hb{font:inherit;font-size:.75rem;font-weight:750;padding:5px 11px;border-radius:99px;border:1px solid color-mix(in srgb,var(--c) 55%,transparent);background:color-mix(in srgb,var(--c) 16%,transparent);color:var(--primary-text-color);cursor:pointer;white-space:nowrap}
@media(prefers-reduced-motion:reduce){.m3fl *{animation:none!important}}
@media(max-width:600px){.m3hn{grid-template-columns:32px 1fr;gap:10px}.m3hn .gx{width:32px;height:32px}.m3hb{grid-column:2;justify-self:start}.m3fd span{font-size:.82rem}}
/* Modul 3 · Stufe 3: Energie-Szene im Banner */
.hero.m3x{min-height:230px}
.m3ss{position:absolute;right:16px;top:14px;bottom:14px;aspect-ratio:360/200;width:auto;max-width:min(52%,560px);border-radius:18px;overflow:hidden;z-index:1;box-shadow:0 10px 26px rgba(0,0,0,.25),inset 0 0 0 1px rgba(255,255,255,.18)}
.m3ss svg{display:block;width:100%;height:100%;background:#9fb1c6}
.hero.m3x .mring{right:calc(var(--m3w,46%) + 34px)}
.hero.m3x .lbl,.hero.m3x .big,.hero.m3x .sub,.hero.m3x .enbil,.hero.m3x .chips{max-width:calc(100% - var(--m3w,46%) - 170px)}
.m3ss .m3tap{cursor:pointer;outline:none}.m3ss .m3tap:hover,.m3ss .m3tap:focus-visible{filter:brightness(1.12) drop-shadow(0 0 4px #fff)}
.m3ss .m3dt{fill:none;stroke:#fff;stroke-linecap:round;stroke-dasharray:0 11;opacity:0}
.m3ss[data-an=dezent] .m3dt,.m3ss[data-an=voll] .m3dt{opacity:.9;animation:m3run 1.6s linear infinite}
.m3ss[data-an=dezent] .m3bz,.m3ss[data-an=voll] .m3bz{animation:rkGlow 1.2s ease-in-out infinite alternate}
.m3ss[data-an=voll] .m3gls{animation:rkGlow 3s ease-in-out infinite alternate}
.m3ss[data-an=voll] .hscl{animation:hsDrift 14s ease-in-out infinite alternate}.m3ss[data-an=voll] .hsrn,.m3ss[data-an=voll] .hssn{animation:hsFall 2.6s linear infinite}
.m3ss.m3mini{position:relative;right:auto;top:auto;bottom:auto;width:auto;max-width:none;height:auto;aspect-ratio:360/130;margin:0;border-radius:14px;box-shadow:none}
.m3mrow{display:grid;grid-template-columns:minmax(0,340px) 1fr;gap:12px;align-items:center}.m3mrow .lugrid{margin:0;grid-template-columns:repeat(2,minmax(0,1fr))}
@media(max-width:700px){.m3mrow{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.m3ss *{animation:none!important}}
@media(max-width:900px) and (min-width:601px){.hero.m3x .mring{display:none}.hero.m3x .lbl,.hero.m3x .big,.hero.m3x .sub,.hero.m3x .enbil,.hero.m3x .chips{max-width:calc(100% - var(--m3w,46%) - 30px)}}
@media(max-width:600px){.hero.m3x{min-height:0}.m3ss{position:relative;right:auto;top:auto;bottom:auto;width:auto;max-width:none;height:auto;aspect-ratio:360/128;margin:0 0 12px;border-radius:14px}.hero.m3x .mring{right:16px;top:auto;bottom:16px}.hero.m3x .lbl,.hero.m3x .big,.hero.m3x .sub{max-width:calc(100% - 96px)}.hero.m3x .enbil,.hero.m3x .chips{max-width:none}}
/* Modul 3 · Stufe 4: Diagramme & Kosten */
.m3bandl{display:flex;justify-content:space-between;align-items:center;gap:4px 12px;flex-wrap:wrap;font-size:.76rem;color:var(--mut);margin:2px 0 8px}.m3bsc{display:inline-flex;align-items:center;gap:6px;font-size:.7rem}.m3bsc i{width:64px;height:7px;border-radius:4px;background:linear-gradient(90deg,#4ade80,#a3e635,#facc15,#fb923c,#f87171)}
.m3cseg{margin:0 0 10px;width:max-content}
.m3cal{display:grid;grid-template-columns:14px repeat(31,minmax(0,1fr));gap:3px;align-items:center}.m3cal b{font-size:.62rem;color:var(--mut);font-weight:600}
.m3cal i{aspect-ratio:1;border-radius:3px;display:grid;place-items:center;font-size:.55rem;font-style:normal;color:#422006;cursor:pointer;line-height:1}.m3cal i.em{background:color-mix(in srgb,var(--mut) 12%,transparent);cursor:default}.m3cal i.nx{visibility:hidden}
.m3cal i[data-act]:hover{outline:2px solid #fde047}
.m3call{display:flex;align-items:center;gap:8px;font-size:.72rem;color:var(--mut);margin:10px 0 0}.m3call i{flex:none;width:120px;height:8px;border-radius:4px;background:linear-gradient(90deg,#3a3320,#fbbf24)}
.m3wf{max-height:none}
.m3pg{display:flex;align-items:center;gap:16px}.m3pg>div{display:flex;flex-direction:column;gap:2px}.m3pig{flex:none;width:78px;height:78px}.m3pgv{font-size:2rem;font-weight:800;line-height:1.05;letter-spacing:-.02em}
.m3pgb{height:12px;border-radius:6px;background:color-mix(in srgb,var(--mut) 18%,transparent);margin:14px 0 6px;overflow:hidden}.m3pgb i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#f472b6,#fbbf24)}
.m3pgl{display:flex;justify-content:space-between;font-size:.78rem;color:var(--mut)}
.m3dist{display:grid;grid-template-columns:130px 1fr;gap:16px;align-items:center}
.m3dr{position:relative;width:130px;height:130px}.m3dr svg{width:100%;height:100%}.m3dr>div{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}.m3dr b{font-size:1.7rem;line-height:1}.m3dr span{font-size:.72rem;color:var(--mut)}
.m3dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:6px}
.m3di{display:grid;grid-template-columns:32px 1fr auto;gap:10px;align-items:center;padding:6px 10px;border-radius:12px;background:color-mix(in srgb,var(--c) 8%,var(--card));border:1px solid var(--line);border-left:3px solid var(--c)}
.m3di small{display:block;font-size:.7rem;color:var(--mut)}.m3di b{font-size:.86rem}.m3di em{font-style:normal;color:#fbbf24}.m3de{font-size:.78rem;color:var(--mut)}
.m3di.rest{cursor:pointer}.m3di .m3dx{color:var(--primary-color);font-weight:650}
.m3dsub{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:6px;margin:10px 0 0;padding:10px;border-radius:12px;background:color-mix(in srgb,#2dd4bf 6%,transparent)}.m3dsub>div{display:grid;grid-template-columns:22px 1fr auto;gap:8px;align-items:center;font-size:.82rem}.m3dsub span{color:var(--mut)}.m3dsub em{grid-column:1/-1;font-style:normal}
@media(max-width:700px){.m3dist{grid-template-columns:1fr;justify-items:center}.m3dl{grid-template-columns:1fr;width:100%}.m3cal{gap:1.5px}.m3cal i{border-radius:2px;font-size:.45rem}}
/* W7 · Haus-Stil und Himmel */
.hsxr{margin:8px 0}.hsxr>b{display:block;font-size:.78rem;color:var(--mut);margin-bottom:6px}.hsxc{display:flex;flex-wrap:wrap;gap:6px}
.hsxb{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:.8rem;padding:6px 10px;border-radius:99px;border:1px solid var(--line);background:var(--card);color:var(--primary-text-color);cursor:pointer}.hsxb i{width:16px;height:16px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.2)}
.hsxb.sel{border-color:var(--primary-color);box-shadow:0 0 0 1px var(--primary-color)}.hsxb.lk{opacity:.65}
.hs2[data-an=voll] .hsau,.m3ss[data-an=voll] .hsau{animation:rkGlow 4s ease-in-out infinite alternate}
/* Bewegung nur, wenn sichtbar (H2) */
[data-vis="0"],[data-vis="0"] *{animation-play-state:paused!important}
/* Karten lückenlos (Mauerwerk) */
.mublks.msn{grid-auto-rows:2px;row-gap:0}.mublks.msn>*{align-self:start}
`;
