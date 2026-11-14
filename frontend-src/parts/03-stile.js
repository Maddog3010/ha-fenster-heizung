const CSS_MAIN = `
.room.hph,.crow.hph{background-size:cover;background-position:center}
.room.hph{background-image:linear-gradient(180deg,color-mix(in srgb,var(--card) 50%,transparent) 0,color-mix(in srgb,var(--card) 84%,transparent) 34%,color-mix(in srgb,var(--card) 95%,transparent) 100%),var(--ph)}
.crow.hph{background-image:linear-gradient(90deg,color-mix(in srgb,var(--card) 97%,transparent) 0,color-mix(in srgb,var(--card) 84%,transparent) 50%,color-mix(in srgb,var(--card) 58%,transparent) 100%),var(--ph)}
.room.hph .rn b{text-shadow:0 1px 8px color-mix(in srgb,var(--card) 80%,transparent)}
.wx{position:relative;display:flex;align-items:center;gap:12px;margin-top:12px;max-width:calc(100% - 140px);background:rgba(255,255,255,.12);backdrop-filter:blur(4px);border-radius:16px;padding:9px 16px 9px 10px;width:fit-content}
.wx .wxi{width:44px;height:44px;border-radius:13px;background:rgba(255,255,255,.16);display:grid;place-items:center;flex:none}
.wx .wxt{font-size:1.5rem;font-weight:700;line-height:1.05;letter-spacing:-.3px;white-space:nowrap}.wx .wxt small{font-size:.85rem;font-weight:500;opacity:.8;margin-left:2px}
.wx .wxc{font-size:.8rem;opacity:.92;margin-top:2px}.wx .wxd{font-size:.72rem;opacity:.72;margin-top:1px}
.swatches{display:flex;flex-wrap:wrap;gap:9px;margin:6px 0 12px;align-items:center}
.sw2{width:34px;height:34px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0;position:relative;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}
.sw2.sel{border-color:var(--primary-text-color)}.sw2.sel::after{content:"";position:absolute;inset:9px;border-radius:50%;background:#fff;box-shadow:0 0 0 1.5px rgba(0,0,0,.35)}
.sw2.auto{background:conic-gradient(#2dd4bf,#f59e0b,#a78bfa,#f472b6,#60a5fa,#2dd4bf)}
.cpick{display:inline-flex;align-items:center;gap:7px;font-size:.78rem;color:var(--mut)}
.cpick input{width:34px;height:34px;border:0;border-radius:50%;padding:0;background:none;cursor:pointer}
.phbox{display:flex;gap:12px;align-items:center;margin:6px 0 12px}
.phbox .pth{width:112px;height:63px;border-radius:12px;background:var(--primary-background-color) center/cover;border:1px solid var(--line);display:grid;place-items:center;color:var(--mut);flex:none}
.phbox .pbs{display:flex;flex-direction:column;gap:2px;align-items:flex-start}
.pkbtn{width:100%;display:flex;align-items:center;gap:10px;justify-content:space-between;text-align:left;background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:9px 12px;font:inherit;margin:4px 0 10px;cursor:pointer;min-height:46px}
.pkbtn.set{border-color:var(--primary-color)}.pkt{display:flex;flex-direction:column;min-width:0}.pkt b{font-weight:600;font-size:.92rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pkt small,.pkrow small{display:block;color:var(--secondary-text-color);font-size:.74rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pkbox{border:1px solid var(--line);border-radius:12px;margin:-4px 0 10px;padding:8px;background:var(--card-background-color,var(--primary-background-color))}
.pksearch{width:100%;box-sizing:border-box;background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:9px;padding:9px;font:inherit;font-size:.9rem;margin-bottom:6px}
.pklist{max-height:260px;overflow:auto;display:flex;flex-direction:column;gap:2px}
.pkrow{display:flex;justify-content:space-between;align-items:center;gap:10px;text-align:left;background:none;border:0;color:var(--primary-text-color);font:inherit;padding:8px;border-radius:8px;cursor:pointer;min-height:44px}.pkrow[hidden]{display:none}.pkrow:hover,.pkrow.cur{background:color-mix(in srgb,var(--primary-color) 14%,transparent)}
.pkrow>span:first-child{min-width:0}.pkv{flex:none;font-size:.8rem;color:var(--secondary-text-color);text-align:right}.pkv i{display:block;font-style:normal;font-size:.68rem;color:var(--primary-color);font-weight:600}
.pkclr{color:var(--secondary-text-color)}.pkno{padding:12px;text-align:center;color:var(--secondary-text-color);font-size:.85rem}
.lsel{width:100%;background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:9px;font:inherit;font-size:.9rem;margin:4px 0 10px}
.ltog{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:6px 0 10px;font-size:.92rem}
.lsec{font-size:.78rem;color:var(--mut);margin:12px 0 0;display:flex;gap:6px;align-items:center;font-weight:600}
@media(max-width:520px){.wx{max-width:100%}}

:host{display:block;min-height:100%;background:var(--primary-background-color,#0f1419);color:var(--primary-text-color,#e6edf3);
  font-family:var(--paper-font-body1_-_font-family,Roboto,"Segoe UI",system-ui,sans-serif);
  --card:var(--card-background-color,#1a2129);--mut:var(--secondary-text-color,#9aa7b4);--line:var(--divider-color,#2a3440);
  --green:#34d399;--amber:#f59e0b;--slate:#7dd3fc;--gray:#94a3b8;--teal:#2dd4bf;--on-acc:#042f2e}
*{box-sizing:border-box}
button{font:inherit;color:inherit}
.bar{display:flex;align-items:center;gap:10px;padding:10px 14px;position:sticky;top:0;z-index:5;
  background:var(--app-header-background-color,var(--card));color:var(--app-header-text-color,var(--primary-text-color));border-bottom:1px solid var(--line)}
.bar .ib0{background:none;border:0;padding:6px;border-radius:50%;cursor:pointer;display:grid;place-items:center}
.brand{display:flex;align-items:center;gap:10px;flex:1;min-width:0}
.logo{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;color:#fff;flex:none;
  background:linear-gradient(135deg,#14b8a6,#0e6a82);box-shadow:0 4px 12px rgba(20,184,166,.35)}
.blogo{width:40px;height:40px;border-radius:50%;object-fit:cover;flex:none;background:#000;box-shadow:0 3px 12px rgba(0,0,0,.4),0 0 0 2px rgba(255,255,255,.14)}.bar:not(.nar) .blogo{width:52px;height:52px}.brand .pn{display:block;font-style:normal;font-size:.66rem;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:var(--teal,#2dd4bf);line-height:1.1;margin-bottom:2px}.brand b .mn{font-style:normal}.brand>div{min-width:0}.brand b{display:block;font-size:1.12rem;font-weight:700;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.brand div span em{font-style:normal}.brand .ver:not(:first-child)::before{content:" · "}
.brand div span{display:block;font-size:.72rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar:not(.nar){position:static;background:none;border:0;max-width:1180px;margin:0 auto;padding:18px 14px 0;gap:14px}
.bar:not(.nar) .logo{width:46px;height:46px;border-radius:14px}
.bar:not(.nar) .brand{gap:14px}
.bar:not(.nar) .brand b{font-size:1.3rem}
.bar:not(.nar) .brand div span{font-size:.82rem;margin-top:2px}
.pillbtn{flex:none;display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:transparent;border-radius:999px;padding:7px 12px;font-size:.82rem;font-weight:600;cursor:pointer}
.pillbtn.pri{background:var(--teal);border-color:var(--teal);color:var(--on-acc)}
.wrap{max-width:1180px;margin:0 auto;padding:16px 14px calc(28px + env(safe-area-inset-bottom,0px));display:grid;gap:14px}
.banner{display:flex;gap:10px;align-items:flex-start;border:1px dashed var(--teal);border-radius:14px;padding:11px 13px;font-size:.84rem;color:var(--mut);background:color-mix(in srgb,var(--teal) 8%,transparent)}
.banner .ic{color:var(--teal);flex:none;margin-top:1px}
.blk.editing{outline:2px dashed var(--line);outline-offset:4px;border-radius:20px;position:relative}
.etag{display:flex;align-items:center;gap:8px;font-size:.78rem;font-weight:600;color:var(--mut);margin:0 0 8px 2px}
.grip{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:10px;background:var(--card);border:1px solid var(--line);color:var(--primary-text-color);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;flex:none}
.ghost{position:fixed!important;margin:0!important;outline:0!important;z-index:40;pointer-events:none;opacity:.97;box-shadow:0 20px 44px rgba(0,0,0,.5);border-radius:20px;background:var(--primary-background-color)}
.dragging{opacity:.28}
.drop-before{box-shadow:0 -5px 0 0 var(--teal);border-radius:4px}.drop-after{box-shadow:0 5px 0 0 var(--teal);border-radius:4px}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px}
.card h2{font-size:.95rem;margin:0 0 12px;font-weight:600;display:flex;align-items:center;gap:8px}
.card h2 .ic{color:var(--teal)}
.hero{position:relative;overflow:hidden;border:0;color:#ecfeff;padding:20px 18px;min-height:168px;
  background:radial-gradient(120% 140% at 85% 0%,color-mix(in srgb,var(--teal) 82%,#000) 0%,transparent 55%),linear-gradient(135deg,color-mix(in srgb,var(--teal) 34%,#0b2c43) 0%,color-mix(in srgb,var(--teal) 10%,#0b2c43) 60%,#0b2c43 100%)}
.hero.hs{background:#0b2c43}.hero .hbg{position:absolute;inset:0;width:100%;height:100%;z-index:0;display:block}.hero .hbg.hph{background-size:cover;background-position:center}
.hero.hs::after{content:"";position:absolute;inset:0;z-index:0;background:linear-gradient(90deg,rgba(3,12,22,.55) 0%,rgba(3,12,22,.18) 62%,transparent 100%),linear-gradient(0deg,rgba(3,12,22,.35),transparent 45%);pointer-events:none}
.hero.hs>.lbl,.hero.hs>.big,.hero.hs>.sub,.hero.hs>.wx,.hero.hs>.chips{position:relative;z-index:1}.hero.hs>.art,.hero.hs>.hlogo{z-index:1}.hero.hs .big,.hero.hs .lbl,.hero.hs .sub{text-shadow:0 1px 10px rgba(0,0,0,.45)}
.hsl{display:flex;gap:10px;overflow-x:auto;padding:4px 2px 8px;margin:0 -2px;scroll-snap-type:x proximity}.hsc{flex:none;width:132px;scroll-snap-align:start}.hsc b{display:block;font-size:.8rem;margin:5px 0 0}
.hth{position:relative;height:72px;border-radius:12px;overflow:hidden;border:2px solid transparent}.hsc.on .hth{border-color:var(--teal)}.hth .hbg{position:absolute;inset:0}.hth em{position:absolute;left:6px;top:6px;font-style:normal;font-size:.66rem;font-weight:700;background:var(--teal);color:var(--on-acc,#042f2e);border-radius:999px;padding:1px 7px}
.hac{display:flex;align-items:center;justify-content:space-between}.hac .lnk{font-size:.74rem;padding:2px 0}
.hero .art{position:absolute;right:10px;top:14px;height:104px;width:auto;max-width:44%;opacity:.95}
.hero .hlogo{position:absolute;right:14px;bottom:14px;width:48px;height:48px;border-radius:50%;object-fit:cover;box-shadow:0 4px 14px rgba(0,0,0,.45),0 0 0 2px rgba(255,255,255,.16);background:#000}
.hero .lbl{max-width:calc(100% - 150px);font-size:.82rem;opacity:.85;display:flex;gap:6px;align-items:center}
.hero .big{font-size:2.7rem;font-weight:700;line-height:1.05;margin:6px 0 2px;letter-spacing:-.5px}
.hero .big small{font-size:1.2rem;font-weight:500;opacity:.85;margin-left:4px}
.hero .sub{font-size:.8rem;opacity:.75;max-width:55%}
.chips{position:relative;display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.chip{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.14);backdrop-filter:blur(4px);border-radius:999px;padding:6px 11px;font-size:.8rem;font-weight:500}
.tiles{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.tile{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 14px;position:relative;overflow:hidden}
.tile .t{display:flex;align-items:center;gap:6px;color:var(--mut);font-size:.78rem}
.tile .v{font-size:1.45rem;font-weight:700;margin-top:6px}
.tile .v small{font-size:.8rem;font-weight:500;color:var(--mut);margin-left:3px}
.tile .g{font-size:.78rem;color:var(--mut);margin-top:2px;display:flex;gap:5px;align-items:center}
.tile .g .ic{color:var(--amber)}
.tile::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--a,var(--teal))}
.legend{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;font-size:.78rem;color:var(--mut)}
.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.rooms{display:grid;grid-template-columns:1fr;gap:14px}
.room{display:grid;gap:12px;position:relative}
.rh{display:flex;align-items:center;gap:12px}
.rico{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;color:#fff;flex:none;border:0;position:relative}
button.rico{cursor:pointer;outline:2px dashed rgba(255,255,255,.55);outline-offset:2px}
button.rico::after{content:"";position:absolute;right:-5px;bottom:-5px;width:18px;height:18px;border-radius:50%;background:var(--card);border:1px solid var(--line)}
.rico .pen{position:absolute;right:-4px;bottom:-4px;width:16px;height:16px;color:var(--primary-text-color);z-index:1;display:grid;place-items:center}
.rn{flex:1;min-width:0}
.rn b{font-size:1.05rem;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:.76rem;font-weight:600;margin-top:3px;color:var(--c)}
.pill::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--c);box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 25%,transparent)}
.green{--c:var(--green)}.amber{--c:var(--amber)}.slate{--c:var(--slate)}.gray{--c:var(--gray)}
.sw{width:46px;height:26px;border-radius:999px;background:var(--line);position:relative;border:0;cursor:pointer;flex:none;transition:.2s}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:.2s}
.sw.on{background:var(--teal)}.sw.on::after{left:23px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.box{border-radius:14px;padding:11px 12px;background:color-mix(in srgb,var(--c,var(--gray)) 12%,transparent);border:1px solid color-mix(in srgb,var(--c,var(--gray)) 30%,transparent);min-width:0}
.box .t{display:flex;align-items:center;gap:7px;font-size:.78rem;color:var(--mut)}
.box .t .ic{color:var(--c,var(--mut))}
.box .v{font-weight:700;font-size:1rem;margin-top:5px}
.box .s{font-size:.75rem;color:var(--mut);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.plan{border-top:1px solid var(--line);padding-top:12px;display:grid;gap:8px}
.ph{display:flex;align-items:center;gap:8px}
.pt{display:flex;gap:7px;align-items:center;font-weight:600;font-size:.9rem;flex:1}
.pt .ic{color:var(--teal)}
.ph .pill{margin:0}
.ibtn{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:10px;border:1px solid var(--line);background:transparent;cursor:pointer;color:var(--primary-text-color);flex:none}
.pnow{font-size:.82rem;color:var(--mut)}.pnow b{color:var(--primary-text-color)}
.tlw{position:relative}
.tl{display:flex;height:14px;border-radius:7px;overflow:hidden;background:var(--line)}
.tl i{display:block;height:100%}
.tlw b{position:absolute;top:-4px;bottom:-4px;width:3px;margin-left:-1.5px;border-radius:2px;background:#fff;box-shadow:0 0 0 2px rgba(0,0,0,.4)}
.tla{display:flex;justify-content:space-between;font-size:.68rem;color:var(--mut);margin-top:3px;padding:0 1px}
.off .tl,.off .pnow{opacity:.45}
.plnk{display:flex;flex-wrap:wrap;gap:2px 22px}
.lnk{background:none;border:0;color:var(--teal);font-weight:600;font-size:.86rem;cursor:pointer;padding:6px 2px;display:inline-flex;gap:6px;align-items:center;text-align:left}
.foot{display:flex;align-items:center;gap:12px;border-top:1px solid var(--line);padding-top:12px}
.foot .a{flex:1;min-width:0}
.foot .a b{font-size:1.1rem}
.foot .a span{display:block;font-size:.76rem;color:var(--mut);margin-top:2px}
.note{text-align:center;color:var(--mut);font-size:.76rem;padding:2px 10px}
.empty{text-align:center;color:var(--mut);padding:40px 10px}
/* Dialoge */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:20}
.sheet{position:fixed;z-index:21;left:0;right:0;bottom:0;max-height:90vh;overflow:auto;background:var(--card);border-radius:22px 22px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line);box-shadow:0 -10px 40px rgba(0,0,0,.45)}
.sh{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.sh>div{flex:1}.sh b{font-size:1.15rem;display:block}.sh span{font-size:.82rem;color:var(--mut)}
.row{display:flex;align-items:center;justify-content:space-between;padding:6px 0 12px;font-weight:600}
.dchips{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 10px}
.dc{border:1px solid var(--line);background:transparent;border-radius:999px;min-width:38px;padding:6px 8px;font-size:.8rem;font-weight:600;cursor:pointer;color:var(--mut)}
.dc.sel{background:var(--teal);border-color:var(--teal);color:#042f2e}
.dchips.sm .dc{min-width:34px;padding:5px 6px;font-size:.74rem}
.mut{color:var(--mut)}.sm{font-size:.76rem;margin:4px 0 12px}
.seg{display:flex;border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-bottom:12px}.seg button{flex:1;background:transparent;border:0;padding:9px 6px;font-weight:600;font-size:.84rem;cursor:pointer;color:var(--mut)}.seg button.sel{background:var(--teal);color:#042f2e}
.quick{display:flex;flex-wrap:wrap;gap:4px 16px;margin:0 0 2px}.quick .lnk{font-size:.78rem;padding:2px 0}
.sp{border:1px solid var(--line);border-radius:14px;padding:11px;margin-bottom:10px;background:color-mix(in srgb,var(--primary-background-color) 55%,transparent)}
.sp1{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.sp input[type=time]{background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:8px 10px;font:inherit;font-size:1.05rem;font-weight:700;width:112px}
.step{display:flex;align-items:center;gap:8px;flex:1;justify-content:center}
.step button{width:34px;height:34px;border-radius:50%;border:1px solid var(--line);background:transparent;cursor:pointer;display:grid;place-items:center}
.step b{min-width:72px;text-align:center;font-size:1.05rem}
.btns{display:flex;justify-content:space-between;gap:10px;margin:2px 0 12px}
.foot2{display:flex;gap:10px}
.btn2{flex:1;border-radius:14px;border:1px solid var(--line);background:transparent;padding:12px;font-weight:700;cursor:pointer}
.btn2.pri{background:var(--teal);border-color:var(--teal);color:#042f2e}
.igrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(58px,1fr));gap:8px;margin:6px 0 10px}
.igt{font-size:.7rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--mut);margin:12px 0 0}
.igrid button{aspect-ratio:1;border:1px solid var(--line);background:color-mix(in srgb,var(--primary-text-color) 7%,transparent);border-radius:14px;display:grid;place-items:center;cursor:pointer;padding:0;transition:transform .12s,background .12s}
.igrid button:hover{background:color-mix(in srgb,var(--primary-text-color) 13%,transparent);transform:translateY(-1px)}
.ic2{display:block}
.igrid button.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 20%,transparent);box-shadow:0 0 0 1.5px var(--teal) inset}
.toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:60;background:#111827;color:#fff;border:1px solid #334155;padding:10px 16px;border-radius:999px;font-size:.86rem;box-shadow:0 8px 24px rgba(0,0,0,.4)}
.pres h2{margin-bottom:12px}
.seg3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.seg3 button{display:grid;justify-items:center;gap:5px;padding:11px 4px;border-radius:14px;border:1px solid var(--line);background:transparent;font-weight:600;font-size:.8rem;color:var(--mut);cursor:pointer}
.seg3 button[disabled]{cursor:default;opacity:.7}
.seg3 button.sel{background:color-mix(in srgb,var(--teal) 16%,transparent);border-color:var(--teal);color:var(--primary-text-color)}
.seg3 button.sel .ic{color:var(--teal)}
.pstat{font-size:.88rem;color:var(--mut);margin-bottom:10px}.pstat b{color:var(--primary-text-color)}
.pers{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.per{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line);border-radius:999px;padding:5px 12px;font-size:.8rem}
.per i{width:9px;height:9px;border-radius:50%;background:var(--gray)}.per.home i{background:var(--green)}
.pnote{display:flex;gap:8px;align-items:center;font-size:.8rem;color:var(--amber);background:color-mix(in srgb,var(--amber) 12%,transparent);border-radius:10px;padding:7px 10px}
.sheet input[type=date]{background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:8px;font:inherit;font-size:.95rem}
.vrow{display:flex;gap:10px;align-items:center;justify-content:space-between;margin:10px 0}
.vrow>span{font-size:.92rem}
.pl{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.why{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--line);background:transparent;border-radius:999px;padding:2px 9px;font-size:.72rem;color:var(--mut);cursor:pointer;margin-top:3px}
.why-l{display:grid;gap:11px;margin:6px 0 14px}
.wl{display:flex;gap:10px;align-items:flex-start;font-size:.92rem}.wl i{flex:none;width:10px;height:10px;border-radius:50%;margin-top:6px}
.wl.ok i{background:var(--green)}.wl.warn i{background:var(--amber)}.wl.info i{background:var(--gray)}
.vbar{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:0 0 10px}
.myb{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:transparent;color:var(--mut);border-radius:999px;padding:7px 12px;font-size:.82rem;font-weight:600;cursor:pointer}
.myb.on{border-color:var(--teal);color:var(--teal);background:color-mix(in srgb,var(--teal) 10%,transparent)}
.air{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:10px 0 0}
@media(max-width:420px){.air{gap:5px}.air .ac{padding:7px 7px!important}.air .ac .t{font-size:.66rem;gap:3px}.air .ac .v{font-size:.92rem}.air .ac .s{font-size:.66rem}}
.air .ac{background:color-mix(in srgb,var(--c) 9%,transparent);border:1px solid color-mix(in srgb,var(--c) 28%,transparent);border-radius:12px;padding:8px 10px;min-width:0}
.air .ac .t{font-size:.7rem;color:var(--mut);display:flex;gap:5px;align-items:center;overflow-wrap:anywhere}
.air .ac .v{font-weight:700;font-size:1.02rem;margin-top:2px;overflow-wrap:anywhere}
.air .ac .s{font-size:.7rem;color:var(--mut);line-height:1.25;overflow-wrap:anywhere}
.air .gauge{height:5px;border-radius:3px;background:color-mix(in srgb,var(--mut) 25%,transparent);margin-top:6px;position:relative;overflow:hidden}
.air .gauge i{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:var(--c)}
.red{--c:#f87171}
.airmsg{display:flex;gap:8px;align-items:flex-start;font-size:.8rem;border-radius:10px;padding:8px 10px;margin-top:8px;color:var(--c);background:color-mix(in srgb,var(--c) 12%,transparent)}
.airmsg>div{flex:1;min-width:0;color:var(--primary-text-color)}.airmsg>div b{color:var(--c)}
.airmsg .ic{flex:none;margin-top:1px}
.airmsg .pr{height:5px;border-radius:3px;background:color-mix(in srgb,var(--c) 22%,transparent);margin-top:6px;overflow:hidden}.airmsg .pr i{display:block;height:100%;background:var(--c);transition:width 1s linear}
.airmsg.done{--c:var(--green)}
.achip{display:inline-flex;align-items:center;gap:4px;font-size:.72rem;font-weight:600;color:var(--c);background:color-mix(in srgb,var(--c) 13%,transparent);border-radius:999px;padding:2px 8px;margin-top:4px;white-space:nowrap}
.crow .rn{display:flex;flex-direction:column;align-items:flex-start}
.upd{display:flex;align-items:center;gap:12px;border:1px solid color-mix(in srgb,var(--teal) 55%,transparent);background:color-mix(in srgb,var(--teal) 11%,transparent);border-radius:16px;padding:11px 12px 11px 14px;margin:0 0 12px}
.upd>.ic{color:var(--teal);flex:none}.upd>div{flex:1;min-width:0}.upd b{display:block;font-size:.92rem}.upd span{font-size:.78rem;color:var(--mut)}
.upd .lnk{white-space:nowrap}
.news{margin:6px 0 4px;padding:0;list-style:none;display:grid;gap:8px}
.news li{display:flex;gap:10px;align-items:flex-start;font-size:.9rem}.news li .ic{color:var(--teal);flex:none;margin-top:2px}
.myrow{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);font-size:.92rem}
.myrow>span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.myrow.off>span{opacity:.45}
.myrow .ibtn{width:34px;height:34px}
.gbox{border:1px solid var(--line);border-radius:14px;padding:11px 12px;margin:8px 0;font-size:.84rem;background:color-mix(in srgb,var(--teal) 6%,transparent)}
.gbox b{display:block;margin-bottom:3px}
.gst{display:flex;gap:8px;align-items:center;font-size:.82rem;margin:2px 0 8px;color:var(--mut)}.gst.on{color:var(--amber)}
.gbtns{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.gbtns .btn2{flex:1;min-width:150px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px}
.chip.sum{background:rgba(251,191,36,.28)}
@media(max-width:520px){.upd{flex-wrap:wrap}}
.pnote.wxa{margin-top:8px;color:var(--teal);background:color-mix(in srgb,var(--teal) 11%,transparent)}.pnote.wxa.fr{color:var(--slate);background:color-mix(in srgb,var(--slate) 12%,transparent)}
.learn{border:1px solid var(--line);border-radius:16px;padding:12px 14px;margin:0 0 12px;background:color-mix(in srgb,var(--teal) 6%,transparent)}
.learn .lt{display:flex;gap:7px;align-items:center;font-weight:700;font-size:.9rem}.learn .lt em{font-style:normal;font-weight:500;font-size:.74rem;color:var(--mut);margin-left:auto}
.learn .lbig{margin:8px 0 10px;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px}.learn .lbig b{font-size:1.7rem;letter-spacing:-.3px}.learn .lbig span{font-size:.8rem;color:var(--mut)}
.lrow{display:grid;grid-template-columns:104px 1fr 78px 30px;gap:8px;align-items:center;font-size:.78rem;margin:5px 0}.lrow span{color:var(--mut)}.lrow b{text-align:right;font-size:.78rem}.lrow small{color:var(--mut);text-align:right}
.lbar{height:8px;border-radius:4px;background:color-mix(in srgb,var(--mut) 22%,transparent);overflow:hidden}.lbar i{display:block;height:100%;border-radius:4px;background:linear-gradient(90deg,var(--slate),var(--amber))}
.lhint{display:flex;gap:7px;align-items:flex-start;font-size:.78rem;color:var(--mut);margin-top:9px}.lhint .ic{flex:none;margin-top:1px}
.htr{margin-top:10px;border:1px solid color-mix(in srgb,var(--c) 32%,transparent);background:color-mix(in srgb,var(--c) 8%,transparent);border-radius:14px;padding:10px 12px}
.htrh{display:flex;align-items:center;gap:10px}.htri{width:34px;height:34px;border-radius:10px;background:color-mix(in srgb,var(--c) 22%,transparent);color:var(--c);display:grid;place-items:center;flex:none}
.htrt{flex:1;min-width:0}.htrt b{display:block;font-size:.92rem}.htrt span{font-size:.78rem;color:var(--c);font-weight:600}
.htrm{display:flex;flex-wrap:wrap;gap:3px 14px;font-size:.74rem;color:var(--mut);margin-top:8px}
.pvb .pvh{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}.pvb .pt{display:flex;gap:8px;align-items:center;font-weight:700}.pvb .pt .ic{color:#fbbf24}
.pvbig{display:flex;align-items:baseline;flex-wrap:wrap;gap:2px 10px;margin:4px 0 8px}.pvbig b{font-size:2.1rem;letter-spacing:-.4px;color:#fbbf24}.pvbig span{font-size:.8rem;color:var(--mut)}
.pvbar{display:flex;gap:2px;height:14px;border-radius:7px;background:color-mix(in srgb,var(--mut) 22%,transparent);overflow:hidden}.pvbar i{display:block;height:100%}
.pvlg{display:flex;justify-content:space-between;font-size:.74rem;color:var(--mut);margin:5px 0 8px}
.pvrows{border-top:1px solid var(--line)}.pvr{display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid var(--line);font-size:.86rem}.pvr>i{width:10px;height:10px;border-radius:3px;flex:none}.pvr b{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pvr em{font-style:normal;font-weight:700;min-width:58px;text-align:right}.pvr .pill{font-size:.72rem}
.pvt{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.pvt div{background:var(--primary-background-color);border:1px solid var(--line);border-radius:12px;padding:8px 10px}.pvt b{display:block;font-size:1.05rem}.pvt span{font-size:.7rem;color:var(--mut)}
.hrds{display:flex;gap:6px;margin:0 0 12px}.hrd{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;background:transparent;border:1px solid var(--line);border-radius:12px;padding:7px 2px 6px;cursor:pointer;color:var(--mut);font:inherit}
.hrd.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 12%,transparent);color:var(--primary-text-color)}.hrd span{font-size:.72rem;font-weight:600}.hrd em{font-style:normal;font-size:.7rem}
.hrd i{display:flex;align-items:flex-end;width:16px;height:34px}.hrd i b{display:block;width:100%;border-radius:3px;background:var(--teal)}
.hrt{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px}.hrt>div{border:1px solid var(--line);border-left:3px solid var(--a);border-radius:12px;padding:8px 10px;background:var(--primary-background-color)}
.hrt span{display:flex;gap:5px;align-items:center;font-size:.7rem;color:var(--mut)}.hrt b{display:block;font-size:1.25rem;margin-top:2px}.hrt small{font-size:.7rem;font-weight:500;color:var(--mut)}
.hlg{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:.74rem;color:var(--mut);margin:4px 0 6px}.hlg i,.hxr i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:5px}
.hcw{width:100%}.hchart{width:100%;height:auto;display:block;touch-action:pan-y}
.hxr{display:flex;flex-wrap:wrap;gap:3px 14px;font-size:.78rem;min-height:20px;margin-top:4px;color:var(--mut)}.hxr b{color:var(--primary-text-color)}
.hre{display:flex;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid var(--line);font-size:.86rem}.hre em{font-style:normal;color:var(--mut);min-width:42px}.hre>i{width:9px;height:9px;border-radius:50%;flex:none}.hre b{display:block}.hre span{font-size:.76rem;color:var(--mut)}
.hac-w{display:flex;gap:6px;align-items:flex-end;margin:4px 0 8px}.hac{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}.hac em{font-style:normal;font-size:.7rem;color:var(--mut)}.hac span{font-size:.72rem;color:var(--mut);font-weight:600}
.hab{display:flex;flex-direction:column-reverse;justify-content:flex-start;width:100%;max-width:38px;height:110px;border-radius:6px;overflow:hidden;background:color-mix(in srgb,var(--mut) 12%,transparent)}.hab b{display:block;width:100%}
@media(max-width:520px){.hrt{grid-template-columns:1fr 1fr}.pvt{grid-template-columns:1fr 1fr 1fr}.pvt b{font-size:.92rem}.hrds{gap:3px}}
.stp{display:flex;gap:6px;margin-top:9px}.stp span{flex:1;display:flex;flex-direction:column;align-items:center;gap:1px;padding:5px 2px;border-radius:10px;border:1px solid var(--line);font-size:.72rem;color:var(--mut)}.stp span b{font-size:.68rem}.stp span small{font-size:.66rem;opacity:.75}
.stp span.on{border-color:var(--c);background:color-mix(in srgb,var(--c) 20%,transparent);color:var(--primary-text-color);font-weight:700}
.htrn{display:flex;gap:6px;align-items:center;font-size:.74rem;margin-top:8px;color:var(--c)}.htrn.mut{color:var(--mut)}
.stpv{display:flex;gap:6px;margin:2px 0 8px}.stpv span{display:flex;gap:6px;align-items:center;font-size:.78rem;padding:4px 10px;border-radius:99px;border:1px solid var(--line)}.stpv b{color:var(--teal)}
.stsc{margin-top:10px}.stbar{position:relative;height:10px;border-radius:6px;background:color-mix(in srgb,var(--mut) 22%,transparent);margin-bottom:22px}
.stbar i{position:absolute;left:0;top:0;bottom:0;border-radius:6px;background:#fbbf24}
.stbar u{position:absolute;top:-3px;width:2px;height:16px;background:var(--mut);text-decoration:none;transform:translateX(-1px)}.stbar u.ok{background:var(--primary-text-color)}
.stbar u b{position:absolute;top:17px;left:50%;transform:translateX(-50%);font-size:.66rem;color:var(--mut);font-weight:600}.stbar u.ok b{color:var(--primary-text-color)}
.stlb{display:flex;justify-content:space-between;font-size:.72rem;color:var(--mut)}
@media(max-width:520px){.brand .mn{display:none}.pillbtn .bl{display:none}.pillbtn{padding:8px}.brand .tag{display:none}.brand b{font-size:.94rem}.brand{gap:8px}.hero .hlogo{width:42px;height:42px;right:12px;bottom:12px}.hero .chips{padding-right:50px}.brand .ver::before{content:""!important}.brand .logo{width:34px;height:34px}}
/* Modul 1: neues Aussehen (Raumkarten, Kopf, Anwesenheit, Kennzahlen) */
.hero{border-radius:22px;padding:22px 22px 18px}.chip{background:rgba(3,12,22,.34);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(6px);font-weight:600}
.seg3{gap:0;border:1px solid var(--line);border-radius:14px;overflow:hidden}.seg3 button{display:flex;flex-direction:row;justify-content:center;align-items:center;gap:8px;border:0;border-radius:0;padding:12px 6px}.seg3 button+button{border-left:1px solid var(--line)}
.tile{border-radius:18px;padding:14px 16px}.tile::before{left:auto;top:14px;right:14px;bottom:auto;width:8px;height:8px;border-radius:50%}.tile .v{font-size:1.7rem;letter-spacing:-.02em;margin-top:8px}
.rooms{align-items:stretch}
.room{display:flex;flex-direction:column;gap:14px;padding:16px;overflow:hidden;border-radius:20px}
.room::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--st,var(--line))}
.room[data-m=green]{--st:var(--green)}.room[data-m=amber]{--st:var(--amber)}.room[data-m=slate]{--st:var(--slate)}.room[data-m=gray]{--st:var(--gray)}
.rh{align-items:flex-start}.rico{width:48px;height:48px;border-radius:15px}
.rn b{font-size:1.12rem;font-weight:700;letter-spacing:-.01em;line-height:1.25}
.pl{gap:3px 12px;margin-top:3px}.pill{margin:0}
.why{border:0;background:none;padding:0;margin:0;font-size:.76rem;text-decoration:underline;text-decoration-color:color-mix(in srgb,var(--mut) 45%,transparent);text-underline-offset:3px}
.two{gap:0;border:1px solid var(--line);border-radius:16px;overflow:hidden}.two .box{border:0;border-radius:0;background:none;padding:12px 14px}
.two .box:nth-child(2){order:-1;border-right:1px solid var(--line)}.two .box .v{font-size:1.08rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.box .v{font-size:1.4rem;font-weight:700;letter-spacing:-.02em;margin-top:4px}.box.amber .v{color:var(--amber)}.box.green .t .ic{color:var(--green)}
.room .plan{border-top:0;padding-top:0}.room .foot{margin-top:auto}

/* Modul 3: neues Aussehen */
.enh{position:relative;border-radius:22px;padding:22px 22px 18px;background:radial-gradient(120% 140% at 100% 0%,#14b8a6 0%,transparent 55%),linear-gradient(135deg,#064e3b,#0f766e 60%,#155e75)}
.enring{position:absolute;right:26px;top:50%;transform:translateY(-50%);width:132px;height:132px}
.enring svg{width:100%;height:100%}.enring .rb{fill:none;stroke:rgba(255,255,255,.16);stroke-width:10}.enring .rf{fill:none;stroke:#fff;stroke-width:10;stroke-linecap:round}
.enring .rv{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff}.enring .rv b{font-size:1.9rem;line-height:1;letter-spacing:-.02em}.enring .rv small{font-size:.9rem;font-weight:600;margin-left:1px}.enring .rv span{font-size:.72rem;opacity:.8;margin-top:3px}
@media(max-width:560px){.enring{top:20px;right:18px;transform:none;width:88px;height:88px}.enring .rv b{font-size:1.2rem}.enring .rv span{display:none}}
.enseg{max-width:none;width:100%}
.tiles .tile{position:relative;padding:14px 14px 16px;border-radius:18px;overflow:hidden}
.tiles .tile::before{display:none}
.tile .t{gap:8px;font-weight:600}.tile .ti{display:grid;place-items:center;width:28px;height:28px;border-radius:9px;color:var(--a);background:color-mix(in srgb,var(--a) 16%,transparent)}
.tile .v{font-size:1.7rem;margin-top:10px}.tile .g{font-size:.74rem}
.tile .tbar{height:4px;border-radius:4px;background:color-mix(in srgb,var(--a) 16%,transparent);margin-top:11px;overflow:hidden}.tile .tbar i{display:block;height:100%;background:var(--a);border-radius:4px}
.enc{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}
.enco{display:flex;flex-direction:column;gap:14px;min-width:0}
@media(max-width:860px){.enc{display:flex;flex-direction:column;align-items:stretch}.enco{display:contents}}
.enc .card{border-radius:20px;padding:18px}.enc .card h2{display:flex;align-items:center;gap:10px;font-size:1rem;margin:0 0 14px}
.enc .card h2>svg:first-child{box-sizing:content-box;padding:7px;width:18px;height:18px;border-radius:10px;background:color-mix(in srgb,var(--teal,#2dd4bf) 15%,transparent);color:var(--teal,#2dd4bf)}
.enflow{width:100%;max-width:460px;display:block;margin:0 auto}
.enrows>div{padding:10px 0}
.enrows .sum{margin-top:2px}
.enrows .sum:last-child,.enrows>div:last-child.sum{padding:12px 14px;border:0;border-radius:12px;background:color-mix(in srgb,var(--teal,#2dd4bf) 12%,transparent)}
.pvbar.endist{height:14px;border-radius:8px;margin-bottom:8px}

/* Modul 4: neues Aussehen */
.gshero{position:relative;border-radius:22px;padding:22px 22px 20px;background:radial-gradient(120% 150% at 100% 0%,#fcd34d 0%,transparent 55%),linear-gradient(135deg,#d97706,#f59e0b 60%,#b45309)}
.gsbig{font-size:3rem;font-weight:800;letter-spacing:-.03em;line-height:1.1;margin:6px 0 4px}
.gsring{position:absolute;right:24px;top:50%;transform:translateY(-50%);width:116px;height:116px}
.gsring svg{width:100%;height:100%}.gsring .rb{fill:none;stroke:rgba(27,21,0,.16);stroke-width:10}.gsring .rf{fill:none;stroke:#1b1500;stroke-width:10;stroke-linecap:round}
.gsring .rv{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#1b1500}.gsring .rv b{font-size:1.6rem;line-height:1}.gsring .rv small{font-size:.8rem;margin-left:1px}.gsring .rv span{font-size:.68rem;font-weight:600;margin-top:3px;opacity:.8}
@media(max-width:560px){.gsring{top:18px;right:16px;transform:none;width:78px;height:78px}.gsring .rv b{font-size:1.1rem}.gsring .rv span{display:none}.gsbig{font-size:2.4rem}}
.gstiles{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}@media(max-width:720px){.gstiles{grid-template-columns:1fr 1fr}}
.gstile{border:1px solid var(--line);border-left:1px solid var(--line);border-radius:18px;padding:14px;position:relative;overflow:hidden}
.gstile::after{content:"";position:absolute;left:14px;right:14px;bottom:0;height:3px;border-radius:3px 3px 0 0;background:var(--c)}
.gst{display:flex;align-items:center;gap:8px;font-weight:600;font-size:.82rem;color:var(--mut)}
.gsi{display:grid;place-items:center;width:28px;height:28px;border-radius:9px;color:var(--c,var(--amber));background:color-mix(in srgb,var(--c,var(--amber)) 16%,transparent)}
.gsi.big{width:40px;height:40px;border-radius:13px;--c:var(--amber)}
.gstile .gsv{font-size:1.6rem;font-weight:800;letter-spacing:-.02em;margin:8px 0 2px}
.gsdev{border-radius:20px;padding:16px;gap:14px}
.gsh{gap:12px}.gsh b{flex:1;font-size:1.1rem}
.gsst{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:4px 12px;font-size:.8rem;font-weight:700;border:1px solid var(--line);color:var(--mut)}
.gsst.on{color:var(--green);border-color:color-mix(in srgb,var(--green) 45%,transparent);background:color-mix(in srgb,var(--green) 12%,transparent)}
.gsst.on::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--green)}
.gsbar{display:flex;height:14px;border-radius:8px;overflow:hidden;gap:2px}.gsbar i{display:block;height:100%}
.gsdev .gsleg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0}
.gsdev .gsleg span{display:grid;grid-template-columns:auto 1fr;column-gap:6px;align-items:center;font-size:.76rem;color:var(--mut)}
.gsdev .gsleg span i{width:8px;height:8px;border-radius:50%}.gsdev .gsleg em{font-style:normal}
.gsdev .gsleg b{grid-column:1/3;font-size:1rem;color:var(--primary-text-color);margin-top:2px}
.gsrows{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid var(--line);border-radius:14px;overflow:hidden}
.gsrow{display:flex;flex-direction:column;gap:2px;padding:10px 12px;font-size:.78rem}.gsrow+.gsrow{border-left:1px solid var(--line)}
.gsrow b{font-size:.92rem}.gsrow em{font-style:normal;color:var(--green);font-size:.76rem;min-height:1em}
.gsadv{border-radius:14px;padding:10px 14px}
.gsc{border-radius:20px;padding:18px}.gsc h2{display:flex;align-items:center;gap:10px;margin:0 0 12px}
.gsc h2>svg:first-child{box-sizing:content-box;padding:7px;width:18px;height:18px;border-radius:10px;background:color-mix(in srgb,var(--amber) 16%,transparent);color:var(--amber)}
.gsch{padding:7px 16px}
.gstiles .gstile{border-left:1px solid var(--line)!important}.gshero{padding:18px 22px 16px}.gsc svg{max-height:280px}
@media(max-width:720px){.gstiles{grid-template-columns:1fr 1fr!important}.gstile .gsv{font-size:1.3rem}.gstile .mut.sm{font-size:.72rem}}

/* Modul 2: neues Aussehen */
.wwh{position:relative;border-radius:22px;padding:22px 22px 18px;background:radial-gradient(110% 150% at 100% 0%,#22d3ee 0%,transparent 52%),linear-gradient(135deg,#0c4a6e,#075985 55%,#0e7490);overflow:hidden}
.wwh .big{font-size:4rem;letter-spacing:-.03em;line-height:1.05}
.wwh .wwtk{transform:scale(1.12);transform-origin:right center;margin-right:8px}
.wwh .chip{background:rgba(3,12,22,.34);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(6px);font-weight:600}
.wwacts{gap:10px;margin-top:14px}
.wwacts .wwa{border-radius:16px;padding:12px 14px;background:rgba(3,12,22,.3);border:1px solid rgba(255,255,255,.16);justify-content:center}
.wwacts .wwa .ic{opacity:.9}
.wwc,.enc .card{border-radius:20px;padding:18px}
.wwc h2{display:flex;align-items:center;gap:10px;font-size:1rem;margin:0 0 14px}
.wwc h2>svg:first-child{box-sizing:content-box;padding:7px;width:18px;height:18px;border-radius:10px;background:color-mix(in srgb,var(--teal,#2dd4bf) 15%,transparent);color:var(--teal,#2dd4bf)}
.wwc .wwlegend,.wwc .wwleg{gap:8px}
.wwseg{border-radius:14px}
.wwrs{margin-top:8px}
.dgs{border-radius:14px}
@media(max-width:560px){.wwh .big{font-size:3rem}.wwh .wwtk{transform:none}.wwacts{grid-template-columns:1fr}}

/* Modul 8: neues Aussehen */
.wbtabs{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;width:100%!important;max-width:100%;box-sizing:border-box;gap:4px;border-radius:16px;padding:4px;margin:0 0 14px}
.wbtabs button{justify-content:center;border-radius:12px;padding:10px 8px;white-space:nowrap}
@media(max-width:560px){.wbtabs{grid-template-columns:auto auto auto auto!important;justify-content:space-between}.wbtabs button{flex-direction:column;gap:3px;font-size:.62rem;letter-spacing:-.01em;padding:8px 1px;min-width:0}.evtop{grid-template-columns:minmax(0,1fr)}}
.evtop>*,.mcols>*{min-width:0}
.wbbar{gap:8px;margin:0 0 14px}.wbchip{background:var(--card);padding:6px 14px;font-weight:650}
.evtop{display:grid;grid-template-columns:1.6fr 1fr;gap:14px;align-items:stretch;margin:0 0 14px}
@media(max-width:860px){.evtop{grid-template-columns:1fr}}
.evtop .lugrid{grid-template-columns:1fr 1fr;grid-auto-rows:1fr}
.evcard{border-radius:22px;padding:18px;gap:12px;background:radial-gradient(110% 120% at 0% 0%,color-mix(in srgb,var(--c8,#64748b) 18%,transparent),transparent 60%),var(--card)}
.evcard.chg{--c8:#2dd4bf;border-color:color-mix(in srgb,#2dd4bf 40%,var(--line))}.evcard.plg{--c8:#f59e0b}
.evhead b{font-size:1.3rem;letter-spacing:-.01em;gap:10px}
.evhead b>svg{box-sizing:content-box;padding:8px;width:20px;height:20px;border-radius:12px;background:color-mix(in srgb,var(--teal,#2dd4bf) 15%,transparent);color:var(--teal,#2dd4bf)}
.evcard svg.evs,.evcard>svg{border-radius:16px}
.luroom{border-radius:18px;padding:14px;gap:4px;align-content:space-between}
.luroom .lv{font-size:1.65rem;letter-spacing:-.02em}
.luroom .lt{display:flex;align-items:center;gap:8px;font-weight:600}
.luroom .ti{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;color:var(--teal,#2dd4bf);background:color-mix(in srgb,var(--teal,#2dd4bf) 15%,transparent)}
.mcols{column-count:2;column-gap:14px}
.mcols>.card{break-inside:avoid;margin:0 0 14px!important}
@media(max-width:860px){.mcols{column-count:1}}
.ocard{border-radius:20px;padding:18px}.ocard h2{gap:10px;margin:0 0 14px}
.ocard h2>svg:first-child{box-sizing:content-box;padding:7px;width:18px;height:18px;border-radius:10px;background:color-mix(in srgb,var(--teal,#2dd4bf) 15%,transparent);color:var(--teal,#2dd4bf)}
.mcols .lugrid{grid-template-columns:1fr 1fr}
.mcols .luroom{padding:12px}.mcols .luroom .lv{font-size:1.4rem}

/* Einstellungen: neue Gliederung */
.sxw{max-width:860px}
.sxsum{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:6px 0 4px}
.sxsum>div{border:1px solid var(--line);border-radius:16px;padding:12px 14px;background:var(--card);display:flex;flex-direction:column;gap:2px}
.sxsum b{font-size:1.4rem;font-weight:800;letter-spacing:-.02em}.sxsum span{font-size:.74rem;color:var(--mut)}
.sxh2{display:flex;align-items:center;gap:10px;margin:24px 4px 10px}
.sxh2 b{font-size:1.05rem}.sxh2 small{color:var(--mut);font-size:.8rem;margin-left:2px}
.sxhi{display:grid;place-items:center;width:30px;height:30px;border-radius:10px;color:var(--teal);background:color-mix(in srgb,var(--teal) 15%,transparent)}
.sxl{border-radius:20px;overflow:hidden}
.sxi{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:13px;color:var(--teal);background:color-mix(in srgb,var(--teal) 14%,transparent)}
.sxgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sxoff{display:flex;align-items:center;gap:10px;border:1px dashed var(--line);border-radius:16px;background:transparent;color:inherit;font:inherit;text-align:left;padding:10px 12px;cursor:pointer}
.sxoff:hover{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 6%,transparent)}
.sxoff .sxi{width:34px;height:34px;border-radius:11px;color:var(--mut);background:color-mix(in srgb,var(--mut) 12%,transparent)}
.sxoff .sxt b{font-size:.88rem}.sxoff.soon{opacity:.5;cursor:default}
.sxoff .sxc{font-size:.68rem}
@media(max-width:620px){.sxsum{grid-template-columns:repeat(4,1fr);gap:6px}.sxsum>div{padding:9px 10px;border-radius:14px}.sxsum b{font-size:1.05rem}.sxsum span{font-size:.64rem}.sxh2{flex-wrap:wrap;row-gap:0}.sxh2 small{flex-basis:100%;margin:-2px 0 0 40px}.sxoff{padding:8px 10px;gap:8px}.sxoff .sxi{display:none}.sxoff .sxt b{font-size:.8rem}.sxoff .sxc{display:none}.sxoff .sxt small{font-size:.68rem}}

/* Modul 11: Sicherheit */
.sfh{position:relative;border-radius:22px;padding:22px 22px 18px;overflow:hidden;background:radial-gradient(110% 150% at 100% 0%,#34d399 0%,transparent 52%),linear-gradient(135deg,#064e3b,#0f766e 60%,#155e75)}
.sfh.warn{background:radial-gradient(110% 150% at 100% 0%,#fbbf24 0%,transparent 52%),linear-gradient(135deg,#78350f,#b45309 60%,#92400e)}
.sfh.alarm{background:radial-gradient(110% 150% at 100% 0%,#f87171 0%,transparent 52%),linear-gradient(135deg,#7f1d1d,#b91c1c 60%,#991b1b);animation:sfp 1.6s ease-in-out infinite}
@keyframes sfp{50%{box-shadow:0 0 0 6px rgba(239,68,68,.25)}}
@media(prefers-reduced-motion:reduce){.sfh.alarm{animation:none}}
.sfh .big{font-size:2rem;letter-spacing:-.02em;line-height:1.15;margin:6px 0 4px;max-width:calc(100% - 100px)}
.sfh .sub{max-width:calc(100% - 100px)}
.sfi{position:absolute;right:24px;top:22px;width:84px;height:84px;border-radius:26px;display:grid;place-items:center;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);color:#fff}
@media(max-width:560px){.sfh .big{font-size:1.5rem;max-width:calc(100% - 70px)}.sfh .sub{max-width:calc(100% - 70px)}.sfi{width:58px;height:58px;border-radius:18px;right:16px}.sfi svg{width:34px;height:34px}}
.sfc{border-radius:20px;padding:18px}.sfc h2{display:flex;align-items:center;gap:10px;font-size:1rem;margin:0 0 14px}.sfc h2 small{margin-left:auto;font-weight:600}
.sfc h2>svg:first-child{box-sizing:content-box;padding:7px;width:18px;height:18px;border-radius:10px;background:color-mix(in srgb,var(--teal,#2dd4bf) 15%,transparent);color:var(--teal,#2dd4bf)}
.sfg{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr));gap:10px}.sfd{min-width:0}.sfc .wxlog>div{grid-template-columns:104px 1fr}
.sfd{border:1px solid var(--line);border-radius:16px;padding:12px 14px;display:grid;gap:10px;background:var(--card);position:relative;overflow:hidden}
.sfd::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:#34d399}.sfd.alarm::before{background:#ef4444}.sfd.off::before{background:#64748b}
.sfd.alarm{border-color:#ef444488;background:color-mix(in srgb,#ef4444 9%,var(--card))}
.sfdh{display:flex;align-items:center;gap:10px}.sfdt{flex:1;min-width:0;display:flex;flex-direction:column}.sfdt b{font-size:.95rem;line-height:1.25}.sfdt small{color:var(--mut);font-size:.76rem}
.sfdi{display:grid;place-items:center;flex:none;width:38px;height:38px;border-radius:12px;color:#34d399;background:color-mix(in srgb,#34d399 14%,transparent)}.sfd.alarm .sfdi{color:#ef4444;background:color-mix(in srgb,#ef4444 16%,transparent)}.sfd.off .sfdi{color:var(--mut);background:color-mix(in srgb,var(--mut) 14%,transparent)}
.sfs{flex:none;font-size:.72rem;font-weight:700;padding:3px 10px;border-radius:999px;border:1px solid color-mix(in srgb,#34d399 45%,transparent);color:#34d399}.sfs.alarm{background:#ef4444;border-color:#ef4444;color:#fff}.sfs.off{border-color:var(--line);color:var(--mut)}
.sfb{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:.78rem;color:var(--mut)}.sfb span{display:inline-flex;align-items:center;gap:5px}.sfbar{flex:1 1 70px;min-width:60px;height:6px;border-radius:6px;background:color-mix(in srgb,var(--mut) 20%,transparent);overflow:hidden}.sfbar i{display:block;height:100%;border-radius:6px}
.sfsince{color:#ef4444;font-weight:600}
/* Store */
.pillbtn.sto{position:relative;padding:8px}.sdot{position:absolute;top:-5px;right:-5px;min-width:19px;height:19px;border-radius:10px;background:#f59e0b;color:#1a1200;font-size:.7rem;font-weight:700;line-height:19px;font-style:normal;text-align:center;padding:0 5px}
.mtab.sto{background:linear-gradient(120deg,#0f766e,#1e3a8a);border-color:transparent;color:#fff}.mtab.sto small{color:rgba(255,255,255,.75)}.mtab.sto .sdot{top:-6px;right:-4px}
.labp{display:inline-flex;align-items:center;gap:4px;font-style:normal;font-size:.68rem;font-weight:700;letter-spacing:.02em;padding:2px 8px 2px 6px;border-radius:999px;background:color-mix(in srgb,#8b5cf6 20%,transparent);color:#a78bfa;border:1px solid color-mix(in srgb,#8b5cf6 45%,transparent);white-space:nowrap;vertical-align:middle}
.labp.tr{position:absolute;top:10px;right:12px}
.card.labc{position:relative;border:1.5px dashed color-mix(in srgb,#8b5cf6 60%,transparent);background:linear-gradient(180deg,color-mix(in srgb,#8b5cf6 7%,var(--card-background-color,#1c1c1c)),var(--card-background-color,#1c1c1c) 60%)}
.card.labc h2{padding-right:70px}.labfoot{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:10px}.labfoot .lnk{margin-left:auto}
.lugrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}.luroom{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border-radius:12px;background:color-mix(in srgb,var(--primary-text-color,#fff) 6%,transparent);font-size:.8rem}.luroom .lv{font-size:1.15rem;font-weight:700;color:var(--primary-text-color)}
.luroom.green{box-shadow:inset 3px 0 #22c55e}.luroom.amber{box-shadow:inset 3px 0 #f59e0b}.luroom.red{box-shadow:inset 3px 0 #ef4444}
.vrow.labf{border-left:3px solid #8b5cf6;padding-left:10px;background:color-mix(in srgb,#8b5cf6 7%,transparent);border-radius:0 10px 10px 0}
.pillbtn.lab{color:#a78bfa}.ldot{background:#8b5cf6!important;color:#fff!important}
.mtab.labt{background:linear-gradient(120deg,#6d28d9,#a21caf);border-color:transparent;color:#fff}.mtab.labt small{color:rgba(255,255,255,.75)}.mtab.labt .sdot{top:-6px;right:-4px}
.labban{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border-radius:14px;border:1.5px dashed color-mix(in srgb,#8b5cf6 55%,transparent);background:color-mix(in srgb,#8b5cf6 8%,transparent);margin-bottom:12px;font-size:.85rem;color:var(--mut)}.labban b{display:block;color:var(--primary-text-color);margin-bottom:2px}.labban>svg{flex:none;color:#a78bfa}
.labk{position:relative;display:flex;flex-direction:column;gap:6px;border-radius:16px;border:1px solid var(--line);background:var(--card-background-color,#1c1c1c);padding:12px}.mbadge.sp,.sxc.sp{display:inline-flex;align-items:center;gap:4px;color:#f472b6;border-color:color-mix(in srgb,#f472b6 55%,transparent);background:color-mix(in srgb,#f472b6 12%,transparent)}
.labk.spk{border-color:color-mix(in srgb,#f472b6 55%,var(--line));background:linear-gradient(160deg,color-mix(in srgb,#f472b6 9%,var(--card)),var(--card) 60%)}.labk.spk.on{border-color:#f472b6;box-shadow:0 0 0 1px #f472b6 inset}
.spkb{display:inline-flex;align-items:center;gap:5px;align-self:flex-start;margin-bottom:2px;padding:4px 10px;border-radius:999px;background:#f472b6;color:#3b0a24;font-size:.72rem;font-weight:800;letter-spacing:.03em}
.spnote{display:flex;align-items:center;gap:10px;margin:0 0 10px;padding:10px 12px;border-radius:14px;border:1px solid color-mix(in srgb,#f472b6 55%,transparent);background:color-mix(in srgb,#f472b6 12%,transparent);color:var(--primary-text-color)}.spnote>span{flex:1;min-width:0;font-size:.86rem}.spnote b{display:block;color:#f472b6}.spnote svg{color:#f472b6;flex:none}.spnote .btn2{width:auto;flex:none;padding:8px 14px}
/* Einheitliches Banner aller Module: Text links, Logo-Feld rechts */
.hero.mh{min-height:168px;background:radial-gradient(120% 140% at 88% 0%,color-mix(in srgb,var(--a1,#14b8a6) 78%,#000) 0%,transparent 58%),linear-gradient(135deg,color-mix(in srgb,var(--a1,#14b8a6) 34%,var(--a2,#0b3b45)) 0%,var(--a2,#0b3b45) 100%)}
.hero.mh.hs{background:#0b2c43}
.mlogo{position:absolute;right:20px;top:50%;transform:translateY(-50%);width:108px;height:108px;border-radius:30px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(255,255,255,.2),rgba(255,255,255,.07));border:1px solid rgba(255,255,255,.28);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 10px 26px rgba(0,0,0,.22);color:#fff;z-index:1}
.mlogo svg{width:66%;height:66%;filter:drop-shadow(0 2px 3px rgba(0,0,0,.25))}.mlogo .f{fill:rgba(255,255,255,.24)}
.hero.mh .lbl,.hero.mh .sub{max-width:calc(100% - 160px)}.hero.mh .big{max-width:calc(100% - 150px)}.hero.mh .big.bs{font-size:2.1rem;line-height:1.15;letter-spacing:-.02em}
.hero.mh .chips{position:relative;z-index:1;margin-top:12px}
.hero.mh .chips .chip{white-space:nowrap}
.a-ev{--a1:#818cf8;--a2:#1e1b4b}.a-ga{--a1:#4ade80;--a2:#0b2e1a}.a-pl{--a1:#22d3ee;--a2:#0a2f3b}.a-bt{--a1:#a3e635;--a2:#1a2e0a}.a-dt{--a1:#a78bfa;--a2:#2a1458}.a-wa{--a1:#fb923c;--a2:#3b1d0a}.a-sp{--a1:#fbbf24;--a2:#3b2a05}.a-ef{--a1:#2dd4bf;--a2:#0b3b45}.a-lu{--a1:#5eead4;--a2:#0f4c5c}.a-rb{--a1:#94a3b8;--a2:#1e293b}.a-wp{--a1:#fb7185;--a2:#4c0519}.a-mu{--a1:#86efac;--a2:#14532d}.a-li{--a1:#fde047;--a2:#422006}.sxc.lab{color:#a78bfa;border-color:color-mix(in srgb,#a78bfa 50%,transparent)}.a-wx{--a1:#38bdf8;--a2:#0c2a43}.a-sf{--a1:#34d399;--a2:#064e3b}.a-fh{--a1:#2dd4bf;--a2:#0b2c43}.a-ww{--a1:#22d3ee;--a2:#0c4a6e}.a-en{--a1:#14b8a6;--a2:#064e3b}.a-gs{--a1:#fbbf24;--a2:#d97706}
.gshero .mlogo{color:#1b1500;background:linear-gradient(145deg,rgba(255,255,255,.45),rgba(255,255,255,.18));border-color:rgba(27,21,0,.18);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 8px 22px rgba(120,53,15,.25)}.gshero .mlogo svg{filter:none}.gshero .mlogo .f{fill:rgba(27,21,0,.16)}.gshero.mh{background:linear-gradient(135deg,#e9a413,#f59e0b 60%,#d97706)}.gshero .chip{background:rgba(27,21,0,.12);border-color:rgba(27,21,0,.18);color:#1b1500}
.a-wx.wxsoon{--a1:#fbbf24;--a2:#3b2a07}.a-wx.wxhot{--a1:#f87171;--a2:#3b0d0d}.a-wx.wxok{--a1:#38bdf8;--a2:#0c2a43}
.sfh.mh .big{max-width:calc(100% - 150px)}.sfh.mh .sub{max-width:calc(100% - 160px)}
@media(min-width:720px){.hero.mh .big{font-size:3.3rem}.hero.mh .big.bs,.sfh.mh .big{font-size:2.4rem}.mlogo{width:128px;height:128px;right:28px;border-radius:34px}}
@media(max-width:560px){.hero.mh{min-height:150px;padding-top:20px}.mlogo{width:76px;height:76px;border-radius:22px;right:14px;top:18px;transform:none}.hero.mh .lbl,.hero.mh .sub,.hero.mh .big,.sfh.mh .big,.sfh.mh .sub{max-width:calc(100% - 96px)}.hero.mh .big.bs,.sfh.mh .big{font-size:1.5rem}.hero.mh .big{font-size:2.3rem}}
.mring{position:absolute;right:164px;top:50%;transform:translateY(-50%);width:112px;height:112px;z-index:1}
.mring svg{width:100%;height:100%}.mring .rb{fill:none;stroke:rgba(255,255,255,.2);stroke-width:10}.mring .rf{fill:none;stroke:#fff;stroke-width:10;stroke-linecap:round}
.mring .rv{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff}.mring .rv b{font-size:1.7rem;line-height:1;letter-spacing:-.02em}.mring .rv small{font-size:.8rem;font-weight:600;margin-left:1px}.mring .rv span{font-size:.7rem;opacity:.85;margin-top:3px}
.gshero .mring .rb{stroke:rgba(27,21,0,.16)}.gshero .mring .rf{stroke:#1b1500}.gshero .mring .rv{color:#1b1500}
.hero.mh.hr .lbl,.hero.mh.hr .sub,.hero.mh.hr .big{max-width:calc(100% - 320px)}
.wwh .mlogo{top:24px;transform:none}
.wwrow{display:grid;grid-template-columns:minmax(210px,260px) 1fr;gap:12px;align-items:stretch}.wwrow .tiles{grid-template-columns:repeat(2,1fr);align-content:stretch}
.wwtkc{display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0}.wwtkc h2{align-self:flex-start}.wwtkc .wwtank{width:100%;max-width:230px}
@media(max-width:720px){.wwrow{grid-template-columns:1fr}.wwrow .tiles{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.hero.mh.hr{min-height:200px}.wwh .mlogo{top:18px}.mring{right:auto;left:auto;top:auto;bottom:16px;right:16px;transform:none;width:78px;height:78px}.mring .rv b{font-size:1.15rem}.mring .rv span{display:none}.hero.mh.hr .lbl,.hero.mh.hr .sub,.hero.mh.hr .big{max-width:calc(100% - 96px)}.hero.mh.hr .chips{padding-right:92px}}
.spnmail{display:flex;gap:11px;align-items:flex-start;margin:12px 0 0;padding:12px 13px;border-radius:14px;border:1px solid color-mix(in srgb,#f472b6 45%,var(--line));background:color-mix(in srgb,#f472b6 9%,transparent)}.spnmail>.ic{color:#f472b6;flex:none;margin-top:2px}.spnmail b{display:block;font-size:.9rem}.spnmail span{display:block;font-size:.8rem;color:var(--mut);margin:2px 0 8px}.spnma{display:inline-flex;gap:6px;align-items:center;font-size:.82rem;font-weight:700;color:var(--primary-text-color);text-decoration:none;border:1px solid var(--line);border-radius:99px;padding:6px 12px;background:var(--card);word-break:break-all}.spnma .ic{color:#f472b6}
.labk.on{border-color:#8b5cf6;box-shadow:0 0 0 1px #8b5cf6 inset}.labk.soon{opacity:.75}
.labkt{display:flex;justify-content:space-between;align-items:center}.labkt .ico{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#6d28d9,#a21caf);color:#fff}
.labkb{all:unset;cursor:pointer;display:flex;flex-direction:column;gap:6px;font-size:.82rem;color:var(--mut)}.labkb b{font-size:.98rem;color:var(--primary-text-color)}.labkb:focus-visible{outline:2px solid #8b5cf6;outline-offset:4px;border-radius:8px}
.labtg{display:flex;flex-wrap:wrap;gap:6px}.labtg em{font-style:normal;font-size:.68rem;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--primary-text-color,#fff) 10%,transparent)}
.risk{font-style:normal;font-size:.68rem;font-weight:600;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--primary-text-color,#fff) 10%,transparent);color:var(--mut)}.risk.g{background:color-mix(in srgb,#f59e0b 22%,transparent);color:#fbbf24}.stowarn.dng{border-color:#ef4444;background:color-mix(in srgb,#ef4444 12%,transparent)}.risk.s{background:color-mix(in srgb,#22c55e 18%,transparent);color:#4ade80}
.stoi.labi{background:linear-gradient(135deg,#6d28d9,#a21caf)}
.stow{display:flex;flex-direction:column;gap:12px;max-width:1100px}
.stosr{display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:0 14px;color:var(--mut)}.stoq{flex:1;min-width:0;background:transparent;border:0;outline:0;color:var(--primary-text-color);font:inherit;padding:13px 0}.stosr:focus-within{border-color:var(--teal)}
.stoch{display:flex;gap:8px;flex-wrap:wrap}.stoch button{border:1px solid var(--line);background:var(--card);color:inherit;border-radius:999px;padding:8px 14px;font:inherit;font-size:.88rem;cursor:pointer}.stoch button.on{background:var(--teal);border-color:var(--teal);color:var(--on-acc,#042);font-weight:700}
.stofe{display:flex;gap:20px;align-items:center;width:100%;text-align:left;border:0;border-radius:22px;padding:24px;background:linear-gradient(120deg,#0f766e,#1e3a8a);color:#fff;cursor:pointer;font:inherit}.stobig{flex:none;width:88px;height:88px;border-radius:22px;background:rgba(255,255,255,.18);display:grid;place-items:center}
.stofx{display:flex;flex-direction:column;gap:6px;align-items:flex-start}.stofx em{font-style:normal;font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;opacity:.8}.stofx b{font-size:1.4rem}.stofx>span{opacity:.92;max-width:520px}.stobt{font-style:normal;background:#fff;color:#000;font-weight:700;border-radius:999px;padding:8px 18px;margin-top:4px}
.stoh{display:flex;justify-content:space-between;align-items:baseline;margin:10px 2px 0;font-size:1.05rem}.stoh small{color:var(--mut);font-weight:400;font-size:.82rem}
.stog{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,250px),1fr));gap:12px}
.stoc{display:flex;flex-direction:column;gap:10px;text-align:left;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px;color:inherit;font:inherit;cursor:pointer;min-width:0}.stoc:hover{border-color:var(--teal)}
.stot{display:flex;gap:12px;align-items:center}.stoi{flex:none;width:52px;height:52px;border-radius:14px;display:grid;place-items:center;color:#fff}.stoi.big{width:78px;height:78px;border-radius:20px}.ston{display:flex;flex-direction:column;min-width:0}.ston b{font-size:1rem}.ston small{color:var(--mut);font-size:.8rem}
.stod{color:var(--mut);font-size:.88rem;flex:1;display:block}.stof{display:flex;justify-content:space-between;align-items:center;gap:8px}.stof em{font-style:normal;font-weight:700;font-size:.86rem;border:1px solid var(--line);border-radius:999px;padding:7px 14px}.stof em.pri{background:var(--teal);border-color:var(--teal);color:var(--on-acc,#042)}
.stos{font-size:.82rem;font-weight:600}.stos.ok{color:#4ade80}.stos.wn{color:#fbbf24}.stos.bad{color:#f87171}
.stosh{max-height:90vh}.stohd{display:flex;gap:16px;align-items:center;margin-bottom:10px}.stohd>div{flex:1;min-width:0}.stohd b{font-size:1.3rem;display:block}.stohd small{color:var(--mut)}.stoact{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:8px}.stoact .btn2{text-decoration:none;display:inline-flex;flex:none;width:auto;padding:10px 22px}
.stofa{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--line);border-radius:14px;margin:10px 0 14px;text-align:center}.stofa div{padding:10px 6px;border-right:1px solid var(--line);min-width:0}.stofa div:last-child{border:0}.stofa b{font-size:.88rem}.stofa small{display:block;color:var(--mut);font-size:.7rem}
.stoul{margin:4px 0 12px;padding-left:18px;color:var(--mut)}.stost{display:flex;gap:10px;margin:8px 0;color:var(--mut);font-size:.9rem}.stost b{flex:none;width:22px;height:22px;border-radius:50%;background:var(--teal);color:var(--on-acc,#042);display:grid;place-items:center;font-size:.75rem}
.stowarn{display:flex;gap:10px;background:color-mix(in srgb,#f59e0b 14%,var(--card));border:1px solid color-mix(in srgb,#f59e0b 50%,var(--line));border-radius:12px;padding:10px 12px;color:#fbbf24;font-size:.86rem;margin-top:10px}
@media(max-width:600px){.stofe{flex-direction:column;align-items:flex-start;padding:18px}.stobig{width:64px;height:64px}.stohd .stoi.big{width:60px;height:60px}}
.hsn{margin-top:8px}.hsn summary{display:flex;align-items:center;gap:8px}.hsd{width:10px;height:10px;border-radius:50%;flex:none}.stoq2 li{margin-bottom:4px}.stoq2 b,.hsn li b{color:var(--primary-text-color)}
.vab{line-height:1.35;font-style:normal;font-size:.66rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,#0ea5e9 18%,transparent);color:#0ea5e9;border:1px solid color-mix(in srgb,#0ea5e9 50%,transparent);margin-right:8px;white-space:nowrap}
.mtab .vab{margin:0 0 0 2px;padding:1px 6px;font-size:.6rem}.mbadge.vab,.sxc.vab{color:#0ea5e9;border-color:color-mix(in srgb,#0ea5e9 50%,transparent)}
.vabox{display:flex;gap:12px;align-items:flex-start;border:1px solid color-mix(in srgb,#0ea5e9 55%,transparent);background:color-mix(in srgb,#0ea5e9 9%,transparent);border-radius:14px;padding:12px 14px;margin-bottom:12px;font-size:.84rem;line-height:1.45}
.vabox>svg{flex:none;color:#0ea5e9;margin-top:1px}.vabox b{display:block;color:var(--primary-text-color);margin-bottom:3px;font-size:.92rem}.vabox a{color:#0ea5e9}
.dvl{line-height:1.35;font-style:normal;font-size:.66rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--secondary-text-color) 16%,transparent);color:var(--secondary-text-color);border:1px solid color-mix(in srgb,var(--secondary-text-color) 45%,transparent);margin-right:8px;white-space:nowrap}
.mtab .dvl{margin:0 0 0 2px;padding:1px 6px;font-size:.6rem}.betabox.dvbox{border-color:color-mix(in srgb,var(--secondary-text-color) 50%,transparent);background:color-mix(in srgb,var(--secondary-text-color) 9%,transparent)}.dvbox>svg{color:var(--secondary-text-color)}.dvbox a{color:var(--primary-text-color)}
.stb{line-height:1.35;font-style:normal;font-size:.66rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,#22c55e 16%,transparent);color:#22c55e;border:1px solid color-mix(in srgb,#22c55e 50%,transparent);margin-right:8px;white-space:nowrap}
.mtab .stb{margin:0 0 0 2px;padding:1px 6px;font-size:.6rem}
@media(max-width:719px){.mtab .stb,.mtab .vab,.mtab .beta,.mtab .dvl{display:none}}
@media(min-width:720px){.tiles{grid-template-columns:repeat(4,1fr)}.rooms{grid-template-columns:repeat(2,1fr)}.hero .big{font-size:3.3rem}
  .hero .art{top:50%;transform:translateY(-50%);height:88%;max-height:190px;max-width:34%;right:84px}.hero .hlogo{width:60px;height:60px;right:20px;bottom:18px}.hero .chips{padding-right:0}.hero .lbl{max-width:none}
  .sheet{left:50%;right:auto;bottom:auto;top:50%;transform:translate(-50%,-50%);width:min(580px,92vw);border-radius:22px;max-height:86vh}}
@media(min-width:1080px){.rooms{grid-template-columns:repeat(3,1fr)}}

.grp{display:grid;gap:10px;min-width:0;max-width:100%}.grp>*{min-width:0}
.grp+.grp{margin-top:22px}
.gh{display:flex;align-items:center;gap:12px;padding:2px 2px}
.gico{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;flex:none;color:#fff;background:linear-gradient(135deg,#14b8a6,#0e6a82)}
.gn{flex:1;min-width:0}.gn b{display:block;font-size:1.05rem;line-height:1.2}
.gn span{display:block;font-size:.76rem;color:var(--mut)}
.gtog,.gedit,.gmv{border:1px solid var(--line);background:transparent;border-radius:10px;width:34px;height:34px;display:grid;place-items:center;cursor:pointer;color:var(--primary-text-color);flex:none}
.gtog{transition:transform .2s}.grp.col .gtog{transform:rotate(-90deg)}
.gmv.up .ic{transform:rotate(180deg)}.gmv[disabled]{opacity:.35;cursor:default}
.gmini{display:flex;flex-wrap:wrap;gap:8px}
.gm{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);background:var(--card);border-radius:999px;padding:7px 12px;font-size:.84rem}
.gm i{width:9px;height:9px;border-radius:50%;background:var(--c);box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 25%,transparent)}
.gm small{color:var(--mut)}
.gadd{border:1.5px dashed var(--line);background:transparent;border-radius:16px;padding:14px;color:var(--teal);font-weight:600;cursor:pointer;display:flex;gap:8px;align-items:center;justify-content:center;margin-top:10px;width:100%}
.gsw{display:flex;align-items:center;gap:8px;flex:none;font-size:.72rem;color:var(--mut)}
.gsw span{display:none}
@media(min-width:720px){.gsw span{display:inline}}
.gname{width:100%;background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:12px;padding:11px 12px;font:inherit;font-size:1rem;margin:4px 0 12px}
.gicons{display:flex;gap:8px;margin:4px 0 12px}
.gicons button{width:46px;height:46px;border-radius:14px;border:1px solid var(--line);background:transparent;color:var(--primary-text-color);display:grid;place-items:center;cursor:pointer}
.gicons button.sel{background:var(--teal);border-color:var(--teal);color:#042f2e}
.btn2.del{flex:0 0 auto;color:#f87171;border-color:color-mix(in srgb,#f87171 40%,var(--line))}
.sheet.wide{padding-bottom:calc(14px + env(safe-area-inset-bottom,0px))}
@media(min-width:720px){.sheet.wide{width:min(780px,94vw)}}
.rdays{display:flex;gap:2px;overflow-x:auto;margin:0 -6px 8px;padding:2px 6px 6px;scrollbar-width:none}
.rdays::-webkit-scrollbar{display:none}
.rd{flex:none;width:44px;border:0;background:transparent;border-radius:14px;padding:4px 0 2px;cursor:pointer;color:var(--mut);display:grid;justify-items:center;gap:3px}
.rd small{font-size:.72rem;font-weight:600}
.rd b{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;font-size:.95rem;color:var(--primary-text-color);font-weight:600}
.rd.sel b{background:var(--teal);color:#042f2e}
.rd.today small::after{content:"•";margin-left:2px;color:var(--teal)}
.rtiles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:2px 0 10px}
.rtiles .tile{padding:10px 12px 10px 14px;border-radius:14px}
.rtiles .tile .v{font-size:1.2rem;margin-top:4px}
.rtiles .tile .g{font-size:.72rem}
.rleg{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:.76rem;color:var(--mut);margin:4px 0 6px}
.rleg span{display:inline-flex;align-items:center;gap:6px}
.rleg i{display:inline-block;width:16px;height:0;border-top:2.5px solid var(--c)}
.rleg i.d{border-top-style:dashed;border-top-width:2px}
.rleg i.b{height:10px;width:14px;border:0;border-radius:3px;background:color-mix(in srgb,var(--c) 28%,transparent)}
.rleg i.o{width:10px;height:10px;border:2.2px solid var(--c);border-radius:50%;background:var(--card)}
.rwrap{position:relative;touch-action:pan-y;user-select:none;-webkit-user-select:none}
.wwempty{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 14px;margin:0 0 10px;border:1px dashed var(--line);border-radius:14px;background:color-mix(in srgb,var(--amber) 8%,transparent)}.wwempty>svg{flex:none;color:var(--amber)}.wwempty>div{flex:1 1 200px;min-width:0}.wwempty b{display:block;font-size:14px}.wwempty span{display:block;font-size:12.5px;color:var(--secondary-text-color);margin-top:2px;line-height:1.4}.wwempty.big{flex-direction:column;text-align:center;padding:26px 16px;gap:10px}.wwempty.big>div{flex:none}.wwdim{opacity:.45;filter:saturate(.5)}.wwa{flex-wrap:wrap}.wwa small{flex-basis:100%;font-size:10.5px;opacity:.75;font-weight:500}.rchart,.wwc2{display:block;width:100%;height:auto;cursor:crosshair}
.rtip{position:absolute;top:6px;transform:translateX(-50%);background:var(--primary-background-color);border:1px solid var(--line);border-radius:12px;padding:8px 12px;box-shadow:0 8px 24px rgba(0,0,0,.35);pointer-events:none;min-width:128px;font-size:.76rem;color:var(--mut)}
.rtip b{display:block;font-size:1.25rem;color:var(--primary-text-color);margin:1px 0 3px}
.rtip .st{display:flex;align-items:center;gap:6px;color:var(--primary-text-color);font-size:.78rem;font-weight:600}
.rtip .st i{width:8px;height:8px;border-radius:50%;background:var(--c)}
.rtip .wo{margin-top:3px;color:#60a5fa;font-weight:600}
.rbar{display:flex;height:10px;border-radius:6px;overflow:hidden;background:var(--line);margin:6px 0 2px}
.rbar i{display:block;height:100%}
.rev{display:grid;gap:0;margin:6px 0 4px}
.rev>div{display:grid;grid-template-columns:48px 14px 1fr;gap:8px;align-items:start;padding:7px 0;border-top:1px solid var(--line);font-size:.86rem}
.rev>div:first-child{border-top:0}
.rev time{color:var(--mut);font-variant-numeric:tabular-nums}
.rev i{width:10px;height:10px;border-radius:50%;background:var(--c);margin-top:5px}
.rev small{display:block;color:var(--mut);font-size:.74rem;margin-top:1px}
.rnav{display:flex;justify-content:space-between;margin-top:6px}
.rmsg{padding:34px 8px;text-align:center;color:var(--mut);font-size:.9rem;border:1px dashed var(--line);border-radius:14px;margin:6px 0 8px}

.vseg{display:inline-flex;border:1px solid var(--line);border-radius:12px;overflow:hidden}
.vseg button{display:inline-flex;align-items:center;gap:6px;background:transparent;border:0;padding:8px 13px;font-weight:600;font-size:.82rem;cursor:pointer;color:var(--mut)}
.vseg button.sel{background:var(--teal);color:#042f2e}
.rooms.list{display:grid;grid-template-columns:1fr;gap:8px}
.chead{display:none}
.crow{display:grid;grid-template-columns:36px minmax(0,1fr) auto;grid-template-areas:"i n s" "w w w" "a a a";gap:10px 12px;align-items:center;padding:12px 14px;border-radius:16px}
.crow .rico{width:40px;height:40px;border-radius:12px;grid-area:i}
.crow .rn{grid-area:n;min-width:0}.crow>.sw{grid-area:s}
.crow .rn b{font-size:1rem}
.crow .cells{grid-area:w;display:grid;grid-template-columns:1fr 1fr;gap:10px 14px}
.crow .cell{min-width:0;font-size:.8rem;color:var(--mut);line-height:1.25}
.crow .cell b{display:block;font-size:.95rem;color:var(--primary-text-color);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.crow .cell.win b{color:var(--green)}.crow .cell.win.amber b{color:var(--amber)}
.crow .cell .ic{vertical-align:-3px;margin-right:4px}
.crow .cell .tlw{margin:6px 0 1px}.crow .cell .tl{height:8px;border-radius:4px}.crow .cell .tlw b{top:-3px;bottom:-3px;width:2px;margin-left:-1px;font-size:0;overflow:visible}
.crow .acts{grid-area:a;display:flex;gap:6px;justify-content:flex-end;border-top:1px solid var(--line);padding-top:10px}
.crow .acts .ibtn{width:32px;height:32px;border-radius:9px}
.crow .grip{display:none}
.crow .pill{margin-top:1px}
.crow.ed{grid-template-columns:28px 36px minmax(0,1fr) auto;grid-template-areas:"g i n s" "w w w w" "a a a a"}
.crow.ed .grip{display:grid;grid-area:g}
@media(min-width:720px){
 .chead{display:grid;grid-template-columns:36px minmax(0,1.5fr) minmax(0,1.1fr) minmax(0,1fr) minmax(0,1.4fr) minmax(0,.9fr) 108px 52px;gap:14px;padding:0 16px;font-size:.72rem;font-weight:600;letter-spacing:.03em;text-transform:uppercase;color:var(--mut);margin-bottom:6px}
 .chead.ed{grid-template-columns:28px 36px minmax(0,1.5fr) minmax(0,1.1fr) minmax(0,1fr) minmax(0,1.4fr) minmax(0,.9fr) 108px 52px}
 .crow,.crow.ed{grid-template-columns:36px minmax(0,1.5fr) minmax(0,1.1fr) minmax(0,1fr) minmax(0,1.4fr) minmax(0,.9fr) 108px 52px;grid-template-areas:none;gap:14px;padding:10px 16px}
 .crow.ed{grid-template-columns:28px 36px minmax(0,1.5fr) minmax(0,1.1fr) minmax(0,1fr) minmax(0,1.4fr) minmax(0,.9fr) 108px 52px}
 .crow .rico,.crow .rn,.crow>.sw,.crow .acts,.crow.ed .grip{grid-area:auto}
 .crow .cells{display:contents}
 .crow .acts{border:0;padding:0}
 .crow>.sw{justify-self:end}
}
.week{display:grid;gap:5px;margin:2px 0 6px}
.wd{display:grid;grid-template-columns:30px 1fr 56px;gap:10px;align-items:center;border:1px solid transparent;background:transparent;border-radius:10px;padding:5px 6px;cursor:pointer;color:var(--primary-text-color);text-align:left;font:inherit}
.wd>span{font-size:.8rem;font-weight:700;color:var(--mut)}
.wd.today>span{color:var(--teal)}
.wd.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 9%,transparent)}
.wd em{font-style:normal;font-size:.72rem;color:var(--mut);text-align:right;white-space:nowrap}
.wd .tl{height:16px;border-radius:8px}
.wax{display:grid;grid-template-columns:30px 1fr 56px;gap:10px;padding:0 6px;font-size:.68rem;color:var(--mut)}
.wax div{display:flex;justify-content:space-between}
.sp.dim{opacity:.45}

.ibtn.gear{width:32px;height:32px;border-radius:10px}
.osecs{display:grid;gap:8px;margin:2px 0 8px}
.osec{border:1px solid var(--line);border-radius:14px;overflow:hidden}
.osec.open{border-color:color-mix(in srgb,var(--teal) 40%,var(--line))}
.oh{display:grid;grid-template-columns:34px 1fr 20px;gap:12px;align-items:center;width:100%;padding:11px 12px;background:transparent;border:0;color:var(--primary-text-color);cursor:pointer;text-align:left;font:inherit}
.oh b{display:block;font-size:.95rem}.oh span:not(.oi){display:block;font-size:.76rem;color:var(--mut);margin-top:1px}
.oi{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:color-mix(in srgb,var(--teal) 16%,transparent);color:var(--teal)}
.oh>.ic:last-child{transition:transform .2s;color:var(--mut)}.osec.open .oh>.ic:last-child{transform:rotate(180deg)}
.ob{display:grid;gap:2px;padding:2px 12px 12px;border-top:1px solid var(--line)}
.of{display:grid;gap:6px;padding:10px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 60%,transparent)}.of:last-child{border-bottom:0}
.ol b{display:block;font-size:.88rem;font-weight:600}.ol span{display:block;font-size:.74rem;color:var(--mut);margin-top:1px}
.oc{min-width:0}
@media(min-width:720px){.of{grid-template-columns:minmax(0,1fr) minmax(220px,300px);align-items:center;gap:16px}}
.onum{display:flex;align-items:center;gap:8px}.onum i{font-style:normal;font-size:.8rem;color:var(--mut);white-space:nowrap}
.onum input,.otxt,.osel,.oadd{background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:9px 10px;font:inherit;font-size:.95rem;min-width:0}
.onum input{width:110px}.onum input[type=time]{width:150px}.otxt,.osel{width:100%}
.oclr{width:26px;height:26px;border-radius:50%;border:1px solid var(--line);background:transparent;color:var(--mut);display:grid;place-items:center;cursor:pointer}
.oseg{margin:0}.oseg button{padding:9px 8px}
.ochips{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.och{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;padding:5px 6px 5px 11px;font-size:.82rem;background:color-mix(in srgb,var(--teal) 10%,transparent);word-break:break-all}
.och button{width:20px;height:20px;border-radius:50%;border:0;background:color-mix(in srgb,var(--primary-text-color) 12%,transparent);color:inherit;display:grid;place-items:center;cursor:pointer;padding:0;flex:none}
.oadd{border-style:dashed;color:var(--teal);font-weight:600;padding:6px 10px;border-radius:999px;font-size:.82rem}
.olinks{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 16px;margin:4px 0 6px}.lnk.dng{color:#f87171}
.btn2[disabled]{opacity:.6;cursor:default}
button.achip{border:0;cursor:pointer;font-family:inherit}.achip.red{--c:#f87171}
.vc{border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin:0 0 10px}.vc.warn{border-color:color-mix(in srgb,#fbbf24 50%,var(--line))}.vc.bad{border-color:color-mix(in srgb,#f87171 55%,var(--line))}
.vh{display:grid;grid-template-columns:12px 1fr auto;gap:10px;align-items:center;margin-bottom:6px}.vh b{display:block;overflow-wrap:anywhere}.vh span{font-size:.76rem;color:var(--mut)}.vh em{font-style:normal;font-size:.76rem;color:var(--mut)}
.vb{display:flex;align-items:center;gap:10px;padding:5px 0;border-top:1px solid color-mix(in srgb,var(--line) 45%,transparent);font-size:.84rem;flex-wrap:wrap}.vl{color:var(--mut);min-width:98px;font-size:.78rem}.vb b{font-weight:600}.vbad{color:#f87171}
.batbar{flex:1;min-width:70px;max-width:180px;height:8px;border-radius:4px;background:color-mix(in srgb,var(--mut) 25%,transparent);overflow:hidden}.batbar i{display:block;height:100%;background:#22c55e;border-radius:4px}.batbar.warn i{background:#fbbf24}.batbar.bad i{background:#f87171}
.vm{display:grid;grid-template-columns:18px 1fr;gap:8px;margin-top:8px;padding:9px 10px;border-radius:10px;font-size:.84rem}.vm b{display:block}.vm span{font-size:.78rem;color:var(--mut)}.vm.warn{background:color-mix(in srgb,#fbbf24 12%,transparent)}.vm.warn .ic{color:#fbbf24}.vm.bad{background:color-mix(in srgb,#f87171 12%,transparent)}.vm.bad .ic{color:#f87171}
.dg .seg button{font-size:.78rem;padding:9px 3px;white-space:nowrap}@media(max-width:380px){.dg .seg button{font-size:.68rem;padding:9px 0}}
.vsrc{font-size:.72rem;color:var(--mut);overflow-wrap:anywhere}.vbs{padding-top:0;border-top:0;margin-top:-2px}.vch{margin-left:auto;font-size:.78rem;padding:2px 4px}.vbe{padding:4px 0 6px}.vinv{display:flex;gap:8px;align-items:center;font-size:.8rem;color:var(--mut);margin:0 0 6px}.vwarn{color:#fbbf24}
.dgs{display:grid;grid-template-columns:28px 1fr auto;gap:10px;align-items:center;border:1px solid var(--line);border-radius:14px;padding:11px 12px;margin:4px 0 12px}.dgs b{display:block}.dgs span{font-size:.78rem;color:var(--mut)}.dgs .btn2{flex:none;padding:8px 12px;font-size:.82rem}
.dgs.ok{border-color:color-mix(in srgb,#22c55e 45%,var(--line));background:color-mix(in srgb,#22c55e 8%,transparent)}.dgs.ok .ic{color:#22c55e}.dgs.warn{border-color:color-mix(in srgb,#fbbf24 50%,var(--line));background:color-mix(in srgb,#fbbf24 8%,transparent)}.dgs.warn .ic{color:#fbbf24}.dgs.bad{border-color:color-mix(in srgb,#f87171 50%,var(--line));background:color-mix(in srgb,#f87171 8%,transparent)}.dgs.bad .ic{color:#f87171}
.dgd{width:10px;height:10px;border-radius:50%;background:#22c55e;display:inline-block;flex:none}.dgd.warn{background:#fbbf24}.dgd.bad{background:#f87171}
.dgb{margin-top:2px}.dgr{border:1px solid var(--line);border-radius:14px;padding:4px 12px 6px;margin:0 0 10px}.dgh{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 60%,transparent)}.dgh span{margin-left:auto;font-size:.76rem;color:var(--mut)}
.dgl,.dgt,.dgg{display:grid;grid-template-columns:12px 1fr auto;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 45%,transparent)}.dgl:last-child{border-bottom:0}
.dgl b,.dgt b,.dgg b{display:block;font-size:.88rem;overflow-wrap:anywhere}.dgl span,.dgt span,.dgg span{display:block;font-size:.74rem;color:var(--mut);overflow-wrap:anywhere}.dgl em,.dgg em{font-style:normal;font-size:.76rem;color:var(--mut);text-align:right;max-width:46%}.dgl.warn em{color:#fbbf24}.dgl.bad em{color:#f87171}
.dgv{text-align:right}.dgv b{white-space:nowrap}.dgf{display:flex;gap:8px;margin:2px 0 8px;flex-wrap:wrap}.chipb{display:inline-flex;gap:6px;align-items:center;border:1px solid var(--line);background:transparent;color:var(--primary-text-color);border-radius:999px;padding:6px 12px;font:inherit;font-size:.8rem;font-weight:600;cursor:pointer}.chipb.sel{background:color-mix(in srgb,var(--teal) 18%,transparent);border-color:var(--teal)}
.dgg.error em{color:#f87171}.dgg.warning em{color:#fbbf24}.dgempty{display:grid;justify-items:center;text-align:center;gap:6px;padding:26px 10px;color:var(--mut)}.dgempty .ic{color:#22c55e}.dgempty b{color:var(--primary-text-color)}.dgempty span{font-size:.82rem;max-width:340px}
.wzp{display:flex;gap:4px;margin:2px 0 14px}.wzp i{flex:1;height:5px;border-radius:3px;background:var(--line);cursor:pointer}.wzp i.on{background:var(--teal)}
.wzt{margin:0 0 6px;font-size:1.15rem}.wzhero{width:64px;height:64px;border-radius:20px;display:grid;place-items:center;background:color-mix(in srgb,var(--teal) 18%,transparent);color:var(--teal);margin:6px 0 12px}.wzhero.ok{background:color-mix(in srgb,#22c55e 20%,transparent);color:#22c55e}
.wzb{min-height:260px;padding-bottom:10px}.wzf{position:sticky;bottom:0;padding-top:10px;background:var(--card)}.wzskip{display:block;margin:8px auto 0}
.wzc{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;padding:4px 6px 4px 10px;font-size:.8rem}.wzc.ok{padding:4px 10px;color:var(--teal);border-color:color-mix(in srgb,var(--teal) 50%,var(--line))}.wzc button{border:0;background:transparent;color:var(--mut);cursor:pointer;padding:2px;display:grid}
.wzch,.wzex{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 6px}.wzex{margin:0 0 6px}
.wzs{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin:8px 0}.wzs b{display:block}.wzs span{font-size:.78rem;color:var(--mut)}.wzs .btn2{flex:none;padding:8px 14px}
.wzr{border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin:8px 0}.wzr.inc{border-style:dashed}.wzrh{display:flex;gap:8px;align-items:center;margin-bottom:6px}
.wzsum{display:grid;gap:8px}.wzsum>div{display:grid;grid-template-columns:30px 1fr;column-gap:10px;border:1px solid var(--line);border-radius:14px;padding:10px 12px}.wzsum em{grid-row:span 2;color:var(--teal);display:grid;place-items:center}.wzsum span{font-size:.8rem;color:var(--mut);overflow-wrap:anywhere}
.wzres{display:grid;grid-template-columns:20px 1fr;gap:2px 8px;padding:8px 0;border-bottom:1px solid var(--line)}.wzres.ok .ic{color:#22c55e}.wzres.bad .ic{color:#f87171}.wzres span{grid-column:2;font-size:.8rem;color:var(--mut)}

/* Module */
.sxw{max-width:760px;margin:0 auto;width:100%}.sxh{font-size:.74rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);margin:18px 4px 8px}
.omap{position:relative;height:300px;overflow:hidden;border-radius:14px;border:1px solid var(--line);background:#e8e4da;touch-action:none;cursor:grab;user-select:none}.omap.sm{height:240px;cursor:default}.omap:active{cursor:grabbing}.omap.sm:active{cursor:default}
.otile{position:absolute;width:256px;height:256px;max-width:none;pointer-events:none}.ozone{position:absolute;left:50%;top:50%;border-radius:50%;border:2px solid #0d9488;background:rgba(45,212,191,.22);transform:translate(-50%,-50%);pointer-events:none}
.opin{position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-34px 0 0 -17px;color:#0d9488;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45));pointer-events:none}.opin svg{width:34px;height:34px;fill:#14b8a6;stroke:#fff;stroke-width:1.4}
.odot{position:absolute;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;color:#fff;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5);pointer-events:none}
.oatt{position:absolute;right:6px;bottom:4px;font-size:.62rem;background:rgba(255,255,255,.78);color:#333;padding:1px 6px;border-radius:6px}.ozb{position:absolute;left:10px;top:10px;display:flex;flex-direction:column;gap:6px}.ozb button{width:34px;height:34px;border-radius:9px;border:1px solid rgba(0,0,0,.2);background:#fff;color:#222;font-size:1.2rem;cursor:pointer}
.ocard{padding:14px 16px}.ocard h2{display:flex;align-items:center;gap:8px;margin:0 0 10px;font-size:1.02rem}.oper{display:flex;align-items:center;gap:12px;padding:12px 0}.oper+.oper{border-top:1px solid var(--line)}.oav{flex:none;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:1.05rem}
.opi{flex:1;min-width:0}.opi b{display:block}.opi small{display:block;color:var(--mut);margin-top:2px}.ost{font-size:.74rem;font-weight:700;padding:3px 10px;border-radius:99px;border:1px solid var(--line);white-space:nowrap}.ost.home{color:#22c55e;border-color:#22c55e}.ost.away{color:var(--mut)}.ost.off{color:#f59e0b;border-color:#f59e0b}
.ocp{display:inline-flex;align-items:center;gap:5px;font-size:.72rem;padding:2px 8px;border-radius:99px;background:color-mix(in srgb,var(--teal) 14%,transparent);color:var(--teal);font-weight:700}.otr{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;margin:6px 0}.otr .opi small{font-size:.76rem}
.osel{width:100%;background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:10px;font:inherit;margin:4px 0}.ohint{margin-top:10px;border:1px solid var(--line);border-radius:12px;padding:2px 14px}.ohint summary{cursor:pointer;padding:10px 0;font-weight:700}.ohint ol{margin:0 0 12px;padding-left:20px;color:var(--mut);font-size:.86rem;line-height:1.5}.ohint li{margin:6px 0}.ohint b{color:var(--primary-text-color)}
.orng{width:100%;accent-color:var(--teal);margin:6px 0}.ocoord{display:flex;gap:14px;flex-wrap:wrap;color:var(--mut);font-size:.84rem;margin-top:8px}.ocoord b{color:var(--primary-text-color)}
.rfv{border:1px solid var(--line);border-radius:14px;padding:12px;margin:10px 0}.sxl{padding:4px 0}.sxrow{display:flex;align-items:center;gap:12px;width:100%;border:0;background:transparent;color:inherit;text-align:left;padding:12px 14px;cursor:pointer;font:inherit}
.sxrow+.sxrow{border-top:1px solid var(--line)}.sxrow:hover{background:color-mix(in srgb,var(--teal) 6%,transparent)}.sxrow.soon{opacity:.55;cursor:default}.sxrow.soon:hover{background:none}
.sxi{flex:none;width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--teal) 14%,transparent);color:var(--teal)}
.sxt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.sxt b{font-size:.95rem;font-weight:650}.sxt b i{font-style:normal;font-weight:500;color:var(--mut);font-size:.8rem;margin-right:4px}.sxt small{color:var(--mut);font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sxc{flex:none;font-style:normal;font-size:.72rem;font-weight:650;padding:3px 9px;border-radius:999px;border:1px solid var(--line);color:var(--mut)}.sxc.ok{color:var(--teal);border-color:color-mix(in srgb,var(--teal) 40%,transparent)}.sxc.off{opacity:.7}
.sxrow .sxg{flex:none;transform:rotate(-90deg);color:var(--mut);display:grid}.fhs{border:1px solid var(--line);border-radius:16px;margin:0 0 10px;overflow:hidden}.fhs.open{border-color:color-mix(in srgb,var(--teal) 40%,var(--line))}.fhs.open .sxg{transform:rotate(0)}.fhb{padding:2px 14px 14px;border-top:1px solid var(--line)}.fhb>.mut:first-child{margin-top:10px}
@media(max-width:520px){.sxt small{white-space:normal}}
.beta{line-height:1.35;font-style:normal;font-size:.66rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,#f59e0b 20%,transparent);color:#f59e0b;border:1px solid color-mix(in srgb,#f59e0b 50%,transparent);margin-right:8px;white-space:nowrap}
.mtab .beta{margin:0 0 0 2px;padding:1px 6px;font-size:.6rem}.mbadge.beta,.sxc.beta{color:#f59e0b;border-color:color-mix(in srgb,#f59e0b 50%,transparent)}
.betabox{display:flex;gap:12px;align-items:flex-start;border:1px solid color-mix(in srgb,#f59e0b 55%,transparent);background:color-mix(in srgb,#f59e0b 10%,transparent);border-radius:16px;padding:14px 16px;font-size:.84rem;color:var(--mut)}
.betabox>svg{flex:none;color:#f59e0b;margin-top:1px}.betabox b{display:block;color:var(--primary-text-color);margin-bottom:3px;font-size:.92rem}.betabox a{color:#f59e0b}
.gshero{background:linear-gradient(135deg,#e9a413,#f59e0b 60%,#d97706);color:#1b1500}.gshero .mut{color:inherit}.gsbig{font-size:2.6rem;font-weight:800;line-height:1.1;margin:4px 0}
.gstiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}.gstile{border-left:4px solid var(--c)}.gsv{font-size:1.5rem;font-weight:750;margin:2px 0}
.gsgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}.gsdev{display:grid;gap:10px}.gsh{display:flex;justify-content:space-between;align-items:center}.gsh b{font-size:1.05rem}
.gsst{font-size:.75rem;font-weight:700;padding:3px 10px;border-radius:999px;border:1px solid var(--line);color:var(--mut)}.gsst.on{color:#34d399;border-color:color-mix(in srgb,#34d399 50%,transparent)}
.gsbar{display:flex;height:12px;border-radius:99px;overflow:hidden;background:var(--line)}.gsbar i{display:block;height:100%}
.gsleg{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:.78rem;color:var(--mut)}.gsleg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}
.gsrow{display:grid;gap:1px;font-size:.82rem}.gsrow b{font-weight:600}.gsadv{display:flex;align-items:center;gap:8px;font-size:.84rem;font-weight:650;padding:8px 12px;border-radius:12px;background:color-mix(in srgb,var(--c,#64748b) 14%,transparent)}
.gsadv.green{--c:#34d399;color:#34d399}.gsadv.amber{--c:#f59e0b;color:#f59e0b}.gsadv.slate{--c:#94a3b8;color:var(--mut)}
.gsdc{display:grid;gap:8px;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:8px}.gsdh{display:flex;gap:8px;align-items:center}.gsdh .otxt{flex:1}
.gsnums{display:flex;gap:12px;flex-wrap:wrap}.gsnums label{display:grid;gap:4px;font-size:.76rem;color:var(--mut)}.gsnums .onum{display:inline-flex;align-items:center;gap:6px}.gsnums input{width:80px}.onum u,.gsnums u{text-decoration:none;color:var(--mut)}
.wbtabs{display:flex;gap:6px;margin:0 0 12px;border:1px solid var(--line);border-radius:999px;padding:4px;width:max-content;max-width:100%}.wbtabs button{display:flex;align-items:center;gap:7px;border:0;background:transparent;color:var(--mut);border-radius:999px;padding:8px 16px;font:inherit;font-weight:600;font-size:.88rem;cursor:pointer}.wbtabs button.sel{background:var(--teal);color:var(--on-acc)}
.wbsh{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px 14px}.wbnav{display:flex;align-items:center;gap:8px}.wbnav button{border:1px solid var(--line);background:transparent;color:var(--primary-text-color);border-radius:10px;width:34px;height:34px;display:grid;place-items:center;cursor:pointer}.wbnav b{min-width:120px;text-align:center}.card.wsec{padding:0;margin-bottom:10px}.wsec>button{display:flex;align-items:center;gap:12px;width:100%;background:transparent;border:0;color:inherit;font:inherit;text-align:left;padding:14px 16px;cursor:pointer;border-radius:inherit}.wsec>button>svg{flex:none;color:var(--teal)}.wsec .wst{flex:1;min-width:0}.wsec .wst b{display:block;font-size:1rem}.wsec .wst span{display:block;color:var(--mut);font-size:.84rem;margin-top:2px}.wsec .wch{flex:none;transition:transform .2s;color:var(--mut);display:grid}.wsec.open .wch{transform:rotate(180deg)}.wsec .wbody{padding:4px 16px 16px;border-top:1px solid var(--line)}.wbbar{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}.wbchip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;padding:5px 12px;font-size:.84rem;font-weight:600}.wbchip i{width:8px;height:8px;border-radius:50%;background:#64748b}.wbchip.ok i{background:#2dd4bf}.wbchip.warn i{background:#f59e0b}.wbchip.bad i{background:#f87171}.wbchip.ok{border-color:#2dd4bf66}.wbchip.warn{border-color:#f59e0b66}.wbchip.bad{border-color:#f8717166}.wbchip svg{color:var(--mut)}.wdot{font-style:normal;display:inline-grid;place-items:center;width:18px;height:18px;margin-left:8px;border-radius:50%;background:#f59e0b;color:#1a1204;font-size:.72rem;font-weight:800;vertical-align:1px}.wck{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line)}.wck:first-of-type{border-top:0}.wcki{flex:none;display:grid}.wckt{flex:1;min-width:0}.wckt b{display:block;font-size:.92rem}.wckt small{display:block}.wsall{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px;margin:0 0 10px}.wsall .lnk{margin-left:12px}.rfa{margin:0 0 10px}.rfc{padding:10px 0;border-top:1px solid var(--line)}.rfc:first-of-type{border-top:0}.rfn{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px}.rfn small{flex-basis:100%}
.wxfc{display:grid;grid-template-columns:repeat(auto-fit,minmax(54px,1fr));gap:6px;margin-top:8px}.wxfc>div{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 2px;border-radius:12px;border:1px solid var(--line);background:rgba(127,127,127,.06)}.wxfc>div.bad{border-color:var(--warning-color,#f59e0b);background:rgba(245,158,11,.14)}.wxfc b{font-size:.95rem}.wxfc small{font-size:.7rem}
.wxhero{padding:18px 18px 12px;border-color:color-mix(in srgb,var(--green) 40%,var(--line));background:linear-gradient(180deg,color-mix(in srgb,var(--green) 9%,var(--card)),var(--card) 70%)}.wxhero.soon{border-color:color-mix(in srgb,var(--slate) 45%,var(--line));background:linear-gradient(180deg,color-mix(in srgb,var(--slate) 10%,var(--card)),var(--card) 70%)}.wxhero.hot{border-color:color-mix(in srgb,var(--amber) 55%,var(--line));background:linear-gradient(180deg,color-mix(in srgb,var(--amber) 13%,var(--card)),var(--card) 70%)}
.wxhead{display:flex;gap:14px;align-items:center}.wxhead b{display:block;font-size:1.6rem;font-weight:800;line-height:1.15;letter-spacing:-.01em}.wxhead small{display:block;margin-top:3px;font-size:.92rem;color:var(--mut)}
.wxdot{flex:none;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--green) 22%,transparent);color:var(--green)}.wxhero.soon .wxdot{background:color-mix(in srgb,var(--slate) 22%,transparent);color:var(--slate)}.wxhero.hot .wxdot{background:color-mix(in srgb,var(--amber) 24%,transparent);color:var(--amber)}
.wxnow{display:flex;flex-wrap:wrap;gap:6px 18px;margin:14px 0 4px;font-size:.9rem}.wxnow span{display:inline-flex;align-items:center;gap:6px;color:var(--primary-text-color);font-variant-numeric:tabular-nums}.wxnow .ic{color:var(--mut)}
.wxc{margin-top:8px}.wxc svg{display:block;width:100%;height:auto;overflow:visible}.wxbad{fill:var(--amber);opacity:.15}.wxar{fill:var(--teal);opacity:.12}.wxln{fill:none;stroke:var(--teal);stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round}.wxd{fill:var(--teal)}.wxdb{fill:var(--amber)}.wxlim{stroke:var(--amber);stroke-width:1.4;stroke-dasharray:5 4}.wxlt{fill:var(--amber);font-size:11px;font-weight:600}
.wxh{display:grid;padding:0 1.33%;margin-top:4px}.wxh svg,.wxnow svg,.wxnote svg{width:18px;height:18px;flex:none}.wxh>div{display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 0;border-radius:10px;font-variant-numeric:tabular-nums}.wxh>div.bad{background:rgba(245,158,11,.13)}.wxh small{font-size:.7rem;color:var(--mut)}.wxh b{font-size:.82rem;font-weight:600}.wxh .ic{color:var(--mut)}
.wxcols{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));align-items:start}
.wxl{display:grid;gap:0}.wxr{display:flex;gap:12px;align-items:flex-start;padding:11px 0;border-top:1px solid var(--line)}.wxr:first-child{border-top:0}.wxr.off{opacity:.55}
.wxi{flex:none;width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:rgba(127,127,127,.12);color:var(--mut)}.wxr.hot .wxi{background:color-mix(in srgb,var(--amber) 22%,transparent);color:var(--amber)}.wxr.soon .wxi{background:color-mix(in srgb,var(--slate) 22%,transparent);color:var(--slate)}
.wxm{flex:1;min-width:0}.wxt{display:flex;justify-content:space-between;gap:10px;align-items:baseline}.wxt b{font-size:.98rem;font-weight:700}.wxt em{font-style:normal;font-size:.82rem;color:var(--mut);white-space:nowrap}.wxr.hot .wxt em{color:var(--amber);font-weight:700}.wxr.soon .wxt em{color:var(--slate);font-weight:700}.wxm small{display:block;margin-top:4px;font-size:.8rem;color:var(--mut)}
.wxg{position:relative;height:7px;border-radius:99px;background:rgba(127,127,127,.18);margin-top:8px}.wxg i{position:absolute;inset:0 auto 0 0;border-radius:99px;background:var(--teal)}.wxr.hot .wxg i{background:var(--amber)}.wxr.soon .wxg i{background:var(--slate)}.wxg u{position:absolute;top:-4px;bottom:-4px;width:2px;margin-left:-1px;background:var(--primary-text-color);opacity:.7;border-radius:2px}
.wxp{display:flex;gap:4px;margin-top:8px}.wxp i{flex:1;height:7px;border-radius:99px;background:rgba(127,127,127,.18)}.wxp i.on{background:var(--amber)}.wxp i.on.l3,.wxp i.on.l4{background:#ef4444}
.wxr.hot.l3 .wxi{background:color-mix(in srgb,#ef4444 22%,transparent);color:#ef4444}.wxr.hot.l3 .wxt em{color:#ef4444}
.wxtx{display:block;margin-top:4px;color:var(--mut);font-size:.8rem;line-height:1.35}.wxr small{display:block;margin-top:4px;font-size:.8rem;color:var(--mut)}
.wxp i.on.l1{background:#facc15}.wxp i.on.l2{background:#fb923c}.wxp i.on.l4{background:#a855f7}
.wxcnt{margin-left:6px;font-size:.72rem;font-weight:800;background:color-mix(in srgb,var(--amber) 22%,transparent);color:var(--amber);border-radius:99px;padding:1px 8px}
.wxstale{display:flex;gap:12px;align-items:center;border-color:color-mix(in srgb,var(--amber) 55%,var(--line));background:color-mix(in srgb,var(--amber) 8%,var(--card));margin-bottom:12px}.wxstale>svg{color:var(--amber);flex:none}.wxstale>div{flex:1;min-width:0}.wxstale small{display:block;color:var(--mut);font-size:.82rem;margin-top:2px}
.wxvr{margin-bottom:0}.wxlvs{display:flex;flex-wrap:wrap;gap:8px 14px;margin:2px 0 10px}.wxlv{display:flex;flex-direction:column;gap:3px}.wxlv small{font-size:.74rem;color:var(--mut)}.wxsub{margin:0 0 10px 14px;padding-left:10px;border-left:2px solid var(--line)}
.wxbn{display:flex;padding:0;overflow:hidden;position:relative;min-height:210px;border:0;background:linear-gradient(90deg,color-mix(in srgb,var(--wc) 16%,var(--card)) 0,var(--card) 55%)}.wxbn::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--wc);z-index:2}
.wxbt{flex:1;min-width:0;padding:18px 18px 16px 24px;display:flex;flex-direction:column;justify-content:center;gap:2px;position:relative;z-index:1}
.wxbl{display:flex;gap:6px;align-items:center;font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}.wxbl svg{color:var(--wc)}
.wxbb{font-size:1.9rem;font-weight:800;line-height:1.12;margin:4px 0 2px;overflow-wrap:anywhere}.wxbs{font-size:.9rem;color:var(--mut)}
.wxbc{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.wxbc .chip{background:color-mix(in srgb,var(--primary-text-color,#fff) 8%,transparent);border:1px solid var(--line);color:var(--primary-text-color);font-size:.76rem;padding:3px 10px;border-radius:99px;backdrop-filter:none}
.wxlvp{font-size:.76rem;font-weight:800;border-radius:99px;padding:3px 11px;background:color-mix(in srgb,var(--wc) 20%,transparent);color:var(--wc);border:1px solid color-mix(in srgb,var(--wc) 55%,transparent)}
.wxbi{width:42%;flex:none;position:relative;min-height:210px}.wxbi .wxsc{position:absolute;inset:0;width:100%;height:100%;display:block}.wxbi::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg,var(--card) 0,transparent 22%)}
.wxbi .mlv{position:absolute;right:10px;bottom:8px;left:auto;top:auto;width:auto;z-index:2;font-size:.66rem;font-weight:700;background:rgba(3,12,22,.55);color:#e2e8f0;border-radius:99px;padding:2px 8px}
.wxbi[data-an=voll] .hscl{animation:hsDrift 14s ease-in-out infinite alternate}.wxbi[data-an=voll] .hsrn,.wxbi[data-an=voll] .hssn{animation:hsFall 2.6s linear infinite}
.wxbi:not([data-an=aus]) .wxlt{animation:wxFlash 5s ease-in-out infinite}.wxbi:not([data-an=aus]) .wxwd{animation:wxWind 3.2s ease-in-out infinite}.wxbi[data-an=voll] .wxtree{animation:wxSway 3s ease-in-out infinite}
@keyframes wxFlash{0%,84%,100%{opacity:1}86%{opacity:.15}88%{opacity:1}90%{opacity:.3}}@keyframes wxWind{0%,100%{transform:translateX(-6px);opacity:.35}50%{transform:translateX(8px);opacity:.85}}@keyframes wxSway{0%,100%{rotate:0deg}50%{rotate:-4deg}}
@media (prefers-reduced-motion:reduce){.wxbi .wxlt,.wxbi .wxwd,.wxbi .wxtree,.wxbi .hscl,.wxbi .hsrn,.wxbi .hssn{animation:none}}
.wxsec{margin:14px 0}.wxsec h3{display:flex;gap:8px;align-items:center;font-size:1rem;margin:0 0 10px}.wxsec h3 svg{color:var(--teal)}.wxsec h3 small{font-weight:500;color:var(--mut);font-size:.8rem}
.wxtiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:10px}
.wxtl{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 13px;min-width:0;display:flex;flex-direction:column;gap:1px;transition:background .4s}
.wxtl.hot{background:color-mix(in srgb,var(--tc) 9%,var(--card))}.wxtl.off{opacity:.55}
.wxth{display:flex;align-items:flex-start;gap:6px;margin-bottom:6px}.wxti{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--tc) 16%,transparent);color:var(--tc);flex:none}
.wxarc{width:50px;height:30px;margin-left:auto}.wxarc .ab{stroke:rgba(127,127,127,.22);stroke-width:6;fill:none;stroke-linecap:round}.wxarc .af{stroke-width:6;fill:none;stroke-linecap:round}.wxarc .am{fill:var(--primary-text-color,#e5e7eb)}
.wxdot{width:9px;height:9px;border-radius:50%;background:var(--tc);flex:none;margin-left:auto;margin-top:2px;box-shadow:0 0 0 3px color-mix(in srgb,var(--tc) 18%,transparent)}.wxarc+.wxdot{margin-left:0}
.wxtl.hot .wxdot{animation:wxPulse 2s ease-in-out infinite}@keyframes wxPulse{50%{box-shadow:0 0 0 6px color-mix(in srgb,var(--tc) 8%,transparent)}}
.wxtn{font-size:.8rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wxtv{font-size:1.45rem;font-weight:800;line-height:1.15;white-space:nowrap}.wxtv small{font-size:.74rem;color:var(--mut);font-weight:600;margin-left:3px}
.wxts{font-size:.76rem;font-weight:700;color:var(--tc)}.wxtg{font-size:.72rem;color:var(--mut);margin-top:3px}
.wxhero h2{margin-bottom:6px}
@media (max-width:640px){.wxbn{flex-direction:column-reverse;min-height:0}.wxbi{width:100%;min-height:170px;height:170px}.wxbi::before{background:linear-gradient(0deg,var(--card) 0,transparent 30%)}.wxbt{padding:4px 16px 16px 20px}.wxbb{font-size:1.5rem}.wxtiles{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.wxtv{font-size:1.25rem}.wxarc{width:42px}}
.wxtlh{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px}.wxtlh h2{margin:0}.wxseg{margin:0;flex:none}.wxseg button{padding:5px 12px;font-size:.78rem}
.wxtlw{display:grid;gap:6px}.wxtlx{display:grid;grid-template-columns:112px 1fr;gap:8px;align-items:center}.wxtln{display:flex;gap:5px;align-items:center;font-size:.8rem;font-weight:600;white-space:nowrap;overflow:hidden}.wxtln svg{color:var(--mut);flex:none}
.wxtlr{position:relative;height:16px;border-radius:99px;background:rgba(127,127,127,.14)}.wxtm{position:absolute;top:-4px;bottom:-4px;background:rgba(127,127,127,.08);border-radius:4px}
.wxbd{position:absolute;top:0;bottom:0;border-radius:99px;background:var(--bc)}.wxbd.vorab{background:repeating-linear-gradient(135deg,var(--bc) 0 6px,color-mix(in srgb,var(--bc) 45%,transparent) 6px 12px)}
.wxbt2{position:absolute;top:0;font-style:normal;font-size:.66rem;font-weight:800;color:#111;line-height:16px;padding-left:7px;white-space:nowrap;pointer-events:none}
.wxnow2{position:absolute;top:-5px;bottom:-5px;width:2px;background:var(--teal);border-radius:2px}
.wxtk,.wxtlf{position:relative;height:14px;font-size:.68rem;color:var(--mut)}.wxtk span,.wxtlf span{position:absolute;transform:translateX(-50%);white-space:nowrap}.wxtlf span{color:var(--teal);font-weight:700;transform:none}.wxtlf span.mo{color:var(--mut);font-weight:500}
.wxflows{display:grid;gap:8px;margin-bottom:6px}.wxflow{border:1px solid var(--line);border-radius:13px;padding:8px 10px;background:color-mix(in srgb,var(--primary-text-color,#fff) 2%,transparent)}
.wxfr{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:.86rem}.wxft{display:inline-flex;gap:5px;align-items:center;font-weight:800;background:rgba(127,127,127,.16);border-radius:8px;padding:2px 8px;font-size:.78rem}.wxfa{color:var(--mut)}
.wxfs{display:inline-flex;gap:5px;align-items:center;min-width:0}.wxfs svg{color:var(--teal);flex:none}
.wxfst{margin-left:auto;font-size:.74rem;font-weight:700;border-radius:99px;padding:2px 9px;white-space:nowrap}.wxfst.done{background:color-mix(in srgb,#34d399 18%,transparent);color:#34d399}.wxfst.wait{background:color-mix(in srgb,var(--amber) 18%,transparent);color:var(--amber)}.wxfst.hot{background:color-mix(in srgb,#ef4444 18%,transparent);color:#ef4444}.wxfst.idle{background:rgba(127,127,127,.16);color:var(--mut)}
.wxflow.hot{border-color:color-mix(in srgb,#ef4444 45%,var(--line))}
.wxfc{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.wxfc span{font-size:.7rem;color:var(--mut);border:1px dashed var(--line);border-radius:99px;padding:1px 8px}
.wxbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0 0}.wxbar .pillbtn small{opacity:.75;font-weight:500;margin-left:4px}.wxok{display:inline-flex;gap:6px;align-items:center;color:#34d399;font-weight:700;font-size:.86rem;padding:6px 10px}
.wxtabs{margin:4px 0 12px}.wxord{display:flex;gap:4px}
@media (max-width:640px){.wxtlx{grid-template-columns:74px 1fr}.wxtln{font-size:.72rem}.wxfst{margin-left:0}}
.wxvor{margin-top:12px}.wxvor h2 small{font-weight:500;font-size:.8rem;margin-left:4px}.wxvl{display:grid;gap:8px}
.wxvi{display:flex;gap:12px;align-items:center;border:1px solid var(--line);border-radius:14px;padding:10px 12px;background:color-mix(in srgb,var(--teal) 5%,transparent)}.wxvi.done{opacity:.7}
.wxvic{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--teal) 16%,transparent);color:var(--teal);flex:none}
.wxvm{flex:1;min-width:0}.wxvm b{display:block;font-size:.94rem}.wxvm small{display:block;color:var(--mut);font-size:.8rem;margin-top:2px;line-height:1.35}
.wxlf{margin:0 0 8px}.wxlog span svg{width:14px;height:14px;vertical-align:-2px;margin-right:6px;color:var(--mut)}
.wxalov{position:fixed;inset:0;z-index:40;background:rgba(2,6,12,.82)}
.wxal{position:fixed;z-index:41;inset:4vh 4vw;display:flex;border-radius:24px;overflow:hidden;background:var(--card);border:3px solid var(--wc);box-shadow:0 0 0 6px color-mix(in srgb,var(--wc) 25%,transparent),0 30px 80px rgba(0,0,0,.6)}
.wxalsc{width:44%;position:relative;flex:none}.wxalsc .wxsc{position:absolute;inset:0;width:100%;height:100%}
.wxalt{flex:1;padding:4vh 3vw;display:flex;flex-direction:column;gap:6px;min-width:0}.wxalt>b{font-size:clamp(1.8rem,4vw,3rem);line-height:1.1}.wxalt>small{color:var(--mut);font-size:1.05rem}
.wxlvp.big{align-self:flex-start;font-size:.95rem;letter-spacing:.06em;padding:6px 14px}
.wxalm{display:flex;flex-wrap:wrap;gap:6px}.wxalm span{font-size:.85rem;border:1px solid var(--line);border-radius:99px;padding:3px 10px}
.wxalc{display:grid;gap:8px;margin:10px 0;font-size:1.05rem}.wxalc div{display:flex;gap:10px;align-items:center}.wxalc .ok svg{color:#34d399}.wxalc .no svg{color:#ef4444}
.wxalb{display:flex;gap:12px;margin-top:auto}.wxalb .btn2{flex:1;font-size:1.1rem;padding:16px;border-radius:16px;justify-content:center}
@media (max-width:640px),(orientation:portrait){.wxal{flex-direction:column}.wxalsc{width:100%;height:32vh}}
.wxnote{display:flex;gap:8px;align-items:center;margin-top:10px;font-size:.82rem;color:var(--mut)}
.wxlog{display:grid;gap:0;position:relative}.wxlog>div{display:grid;grid-template-columns:78px 1fr;gap:12px;padding:8px 0;font-size:.9rem;position:relative}.wxlog time{color:var(--mut);font-variant-numeric:tabular-nums;font-size:.82rem;padding-top:1px}.wxlog span{position:relative;padding-left:18px}.wxlog span::before{content:"";position:absolute;left:0;top:.45em;width:8px;height:8px;border-radius:50%;background:var(--teal)}.wxlog>div:not(:last-child) span::after{content:"";position:absolute;left:3.5px;top:1.4em;bottom:-1.1em;width:1px;background:var(--line)}
.tbvar{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:6px 0 10px}.tbvar button{display:grid;gap:5px;text-align:left;padding:10px;border-radius:14px;border:1px solid var(--line);background:transparent;color:var(--mut);font:inherit;cursor:pointer;align-content:start}.tbvar button b{color:var(--primary-text-color);font-size:.88rem}.tbvar button small{font-size:.74rem;line-height:1.35}.tbvar button.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 12%,transparent)}@media(max-width:560px){.tbvar{grid-template-columns:1fr}}
.wbsc{overflow-x:auto}.wbsc svg{min-width:520px}.wbst{margin:12px 0 4px}.wbst b{font-size:1.05rem}
.wbses{display:grid;gap:8px}.wbse{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:12px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}.wbse:first-child{border-top:0}.wbse>div{display:grid;gap:2px}.wbsb{height:8px;border-radius:99px;background:#f59e0b;overflow:hidden;display:block!important}.wbsb i{display:block;height:100%;background:#2dd4bf}.wbsv{text-align:right}
@media(max-width:560px){.wbse{grid-template-columns:1fr 1fr}.wbsb{grid-column:1/-1;order:3}}
.gsch{border:1px solid var(--line);background:transparent;color:var(--mut);border-radius:999px;padding:6px 14px;font:inherit;font-size:.82rem;font-weight:600;cursor:pointer}.gsch.sel{background:var(--teal);border-color:var(--teal);color:var(--on-acc)}
.gschips{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0}.gsq{margin:8px 0}
.evsw{width:30px;height:30px;border-radius:50%;border:2px solid var(--line);background:linear-gradient(135deg,var(--c2),var(--c));cursor:pointer;padding:0}.evsw.sel{border-color:var(--teal);box-shadow:0 0 0 2px var(--teal)}
.evcard{display:grid;gap:8px}.evhead{display:flex;justify-content:space-between;align-items:center}.evhead b{display:flex;align-items:center;gap:8px}
.evsvg{width:100%;max-height:300px}.evcable{opacity:0;transition:opacity .5s ease}.evcable.on{opacity:1}
.evflow{animation:evflow 1s linear infinite}.evpulse{animation:evpulse 1.4s ease-in-out infinite}@keyframes evpulse{50%{opacity:.45}}@keyframes evflow{to{stroke-dashoffset:-36}}
@media(prefers-reduced-motion:reduce){.evflow,.evpulse{animation:none}.evcable{transition:none}}
.lugrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
.luroom{display:grid;gap:3px;border:1px solid var(--line);border-radius:14px;padding:12px 14px;font-size:.8rem}.luroom b{font-size:.92rem}.luroom .lv{font-size:1.5rem;font-weight:750}
.luroom .lv.green{color:#34d399}.luroom .lv.amber{color:#f59e0b}.luroom .lv.red{color:#f87171}.luroom.off{opacity:.55}
.lusoon{display:flex;align-items:center;gap:14px;opacity:.65;border-style:dashed}.lusoon>svg{flex:none;color:var(--mut)}.lusoon div{flex:1;display:grid;gap:2px}.lusoon .beta{margin:0}
.mbar{display:flex;gap:8px;overflow-x:auto;max-width:1180px;margin:0 auto;padding:12px 14px 0;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;touch-action:pan-x pan-y}
.mbar::-webkit-scrollbar{display:none}
.mtab{position:relative;flex:none;display:flex;align-items:center;gap:10px;border:1px solid var(--line);background:var(--card);border-radius:16px;padding:8px 14px 8px 11px;cursor:pointer;text-align:left;color:var(--mut)}
.mtab span{display:block;line-height:1.15}.mtab small{display:block;font-size:.68rem;opacity:.85}.mtab b{display:block;font-size:.9rem;color:var(--primary-text-color);white-space:nowrap}
.mtab.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 13%,var(--card));color:var(--teal)}
.mtab.add{border-style:dashed;background:transparent}
.mdot{position:absolute;top:7px;right:8px;width:9px;height:9px;border-radius:50%;background:var(--amber);box-shadow:0 0 0 2px var(--card)}
.logo.ww{background:linear-gradient(135deg,#38bdf8,#1d4ed8);box-shadow:0 4px 12px rgba(56,189,248,.35)}
.mrow{display:flex;align-items:center;gap:12px;border:1px solid var(--line);border-radius:14px;padding:11px 12px;margin:8px 0}
.mrow .mi{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--teal) 14%,transparent);color:var(--teal);flex:none}
.mrow .mt{flex:1;min-width:0}.mrow .mt b{display:block;font-size:.92rem}.mrow .mt span{display:block;font-size:.76rem;color:var(--mut);margin-top:1px;word-break:break-all}
.mact{display:flex;align-items:center;gap:10px;flex:none}.mact .btn2{flex:none;padding:7px 12px;font-size:.8rem}
.mbadge{font-size:.72rem;font-weight:700;border:1px solid var(--line);border-radius:999px;padding:4px 10px;color:var(--mut);white-space:nowrap}
.mrow:has(.soon){opacity:.72}
.murl{display:flex;gap:8px;margin:6px 0}.murl .otxt{flex:1}.murl .btn2{flex:none;padding:0 16px}
.minfo{border:1px solid var(--line);border-radius:14px;padding:10px 14px;font-size:.84rem;margin:6px 0 10px;background:color-mix(in srgb,var(--teal) 6%,transparent)}.minfo ul{margin:6px 0 0;padding-left:18px;display:grid;gap:4px}
code{font-family:ui-monospace,monospace;font-size:.78rem}
.wwh{background:linear-gradient(135deg,#0c4a6e,#075985 55%,#0e7490);display:grid;grid-template-columns:1fr auto;gap:4px 10px;align-items:center}
.wwh .wwl1 .lbl{max-width:none}.wwh .wwl1 .sub{max-width:none}
.wwh .wwtk{grid-column:2;grid-row:1}.wwtank{width:min(230px,50vw);height:auto;display:block}
.wwh .chips,.wwh .wwacts{grid-column:1/-1}
.wwh .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;padding-right:0}
.chip.st.ok{background:rgba(52,211,153,.3)}.chip.st.warn{background:rgba(251,146,60,.34)}
.wwacts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
.wwa{display:flex;align-items:center;justify-content:center;gap:7px;border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff;border-radius:14px;padding:10px 8px;font-size:.82rem;font-weight:600;cursor:pointer;text-align:center;line-height:1.15}
.wwa.on{background:#fff;color:#075985;border-color:#fff}.wwa[disabled]{opacity:.45;cursor:default}
.wwchart{width:100%;height:auto;display:block;color:var(--primary-text-color)}
.wwseg{margin-bottom:10px}
.wwbar{position:relative;height:30px;border-radius:10px;overflow:hidden;border:1px solid var(--line);background:color-mix(in srgb,var(--line) 55%,transparent)}
.wwbar.heat{background:color-mix(in srgb,var(--low) 34%,var(--card))}
.wwbar .seg1{position:absolute;top:0;bottom:0;display:grid;place-items:center}.wwbar .seg1.circ{background:var(--teal)}.wwbar .seg1 em{font-style:normal;font-size:.72rem;font-weight:700;color:#06202b}
.wwbar u{position:absolute;top:0;bottom:0;width:2px;background:var(--primary-text-color);text-decoration:none;opacity:.9}
.wwax{display:flex;justify-content:space-between;font-size:.68rem;color:var(--mut);margin:3px 1px 8px}
.wwrs{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;margin-bottom:6px}.wwr{border:1px solid var(--line);border-radius:999px;padding:4px 10px;font-size:.8rem}
.wwnote{display:flex;gap:8px;align-items:flex-start;font-size:.8rem;color:var(--mut);margin-top:6px}.wwnote .ic{flex:none;margin-top:1px}
.wwhint{display:flex;gap:8px;align-items:flex-start;font-size:.8rem;color:var(--mut);margin:0 0 10px}.wwhint .ic{flex:none;margin-top:1px}
.wwst{margin-left:auto;font-size:.75rem;font-weight:600;color:var(--mut);border:1px solid var(--line);border-radius:999px;padding:3px 10px}.wwst.on{color:var(--teal);border-color:var(--teal)}
.wwg2{display:grid;gap:14px}
@media(min-width:900px){.wwg2{grid-template-columns:1fr 1fr;align-items:start}}
.wsr{display:flex;align-items:center;gap:8px;margin:8px 0;flex-wrap:wrap}.wsr input{background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:8px;font:inherit;width:112px}.wsr .onum input{width:70px}
.wwe .t1{font-size:1.1rem;font-weight:700;color:var(--primary-text-color);margin:10px 0 6px}
.wwl{list-style:none;padding:0;margin:0 auto;display:inline-grid;gap:8px;text-align:left}.wwl li{display:flex;gap:8px;align-items:center}
.enh{background:linear-gradient(135deg,#064e3b,#0f766e 55%,#155e75)}
.enflow{width:100%;height:auto;display:block;max-width:460px;margin:0 auto}
.fl{fill:none;stroke-linecap:round;opacity:.16}.fl.on{opacity:1;stroke-dasharray:7 9;animation:flowdash 1.1s linear infinite}
@keyframes flowdash{to{stroke-dashoffset:-16}}
@media(prefers-reduced-motion:reduce){.fl.on{animation:none;stroke-dasharray:none}}
.fll{font-size:11px;font-weight:700;text-anchor:middle;paint-order:stroke;stroke:var(--card);stroke-width:3px}
.fln{font-size:12px;font-weight:700;text-anchor:middle;fill:var(--primary-text-color)}.fls{font-size:11.5px;text-anchor:middle;fill:var(--mut)}
.enseg{max-width:420px}
.endist{height:16px;margin:2px 0 10px}
.endr{display:grid;grid-template-columns:12px 1fr auto auto auto;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 60%,transparent);font-size:.86rem}.endr:last-of-type{border-bottom:0}
.endr span:not(.endot){color:var(--mut);text-align:right;min-width:52px}.endot{width:12px;height:12px;border-radius:4px}
.enrows>div{display:flex;justify-content:space-between;gap:12px;align-items:baseline;padding:8px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 60%,transparent);font-size:.88rem}.enrows>div:last-child{border-bottom:0}
.enrows span{color:var(--mut)}.enrows em{font-style:normal;font-size:.76rem}.enrows b{white-space:nowrap}.enrows .sum{font-weight:700}.enrows .sum span{color:var(--primary-text-color)}
.enrows .pos{color:#34d399}.enrows .neg{color:#f87171}
.bin{display:inline-block;position:relative;width:26px;height:30px;border-radius:4px 4px 8px 8px;flex:none;margin-top:5px}.bin:before{content:"";position:absolute;left:-2px;right:-2px;top:-5px;height:6px;border-radius:3px;background:inherit;filter:brightness(1.18)}.bin.sm{width:16px;height:18px;margin-top:4px;border-radius:2px 2px 5px 5px}.bin.sm:before{top:-3px;height:4px;left:-1px;right:-1px}
.mulead{margin:0 0 12px}.mulead b{display:block;font-size:1.05rem}.mulead span{color:var(--mut);font-size:.88rem}.mulead:not(.ok) b{color:var(--amber)}
.mugrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));gap:10px}
.mubin{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px 12px;border-radius:16px;border:1px solid var(--line);background:rgba(127,127,127,.07);color:var(--primary-text-color);font:inherit;text-align:center}
button.mubin{cursor:pointer}button.mubin:hover{border-color:color-mix(in srgb,var(--teal) 60%,var(--line))}button.mubin:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.mubin b{font-size:.92rem}.mubin small{font-size:.8rem;font-weight:700;color:var(--mut)}
.mubin.out,.mubin.today{border-color:color-mix(in srgb,var(--amber) 70%,var(--line));background:color-mix(in srgb,var(--amber) 12%,transparent)}.mubin.out small,.mubin.today small{color:var(--amber)}
.mubin.ok small,.mubin.done small{color:var(--green)}.mubin.none{opacity:.5}.mubin.soon small{color:var(--teal)}
.mucal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center}.mucal em{font-style:normal;font-size:.72rem;color:var(--mut);padding:2px 0}
.mucd{font-style:normal;display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 0 4px;min-height:42px;border-radius:9px;background:rgba(127,127,127,.07);font-size:.82rem}.mucd.e{background:none}.mucd.today{outline:1.5px solid var(--teal)}
.mucd span{display:flex;gap:3px;min-height:7px}.mucd u{width:7px;height:7px;border-radius:50%;display:block}
.mublks{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));align-items:start}.mub.wide{grid-column:1/-1}
.mub.editing{padding:8px 10px 10px;margin:4px}.mub .etag{margin:0 0 8px 2px}.mub.hid>:not(.etag){opacity:.4;filter:grayscale(.6);pointer-events:none}.mub.hid{outline-style:dotted}
.eyeb{margin-left:auto;display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:transparent;color:var(--primary-text-color);border-radius:999px;padding:5px 12px 5px 10px;font:inherit;font-size:.78rem;font-weight:600;cursor:pointer}.eyeb:hover{border-color:var(--teal)}.mub.hid .eyeb{color:var(--mut)}
.mublks .dragging{opacity:.35}
.labsec{display:flex;align-items:center;gap:8px;margin:4px 2px 8px;font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#e07aa6}
.labtease{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:14px 0;padding:12px 14px;border-radius:16px;border:1px dashed color-mix(in srgb,#e07aa6 55%,transparent);background:color-mix(in srgb,#e07aa6 6%,transparent);color:#e07aa6}
.labtease>div{flex:1;min-width:200px;color:var(--primary-text-color)}.labtease b{display:block}.labtease span{display:block;font-size:.84rem;color:var(--mut)}
.risk.vab{color:#e07aa6;border-color:color-mix(in srgb,#e07aa6 55%,transparent);background:color-mix(in srgb,#e07aa6 10%,transparent)}
.lixgrid{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));align-items:start;margin-top:14px}
.tgxrow{display:flex;align-items:center;gap:6px;padding-right:12px}.tgxrow+.tgxrow{border-top:1px solid var(--line)}.tgxrow .sxrow{flex:1;min-width:0}.tgxl{border:1px solid var(--line);border-radius:14px;margin:8px 0;overflow:hidden}
.tgxscan{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;border:1px dashed color-mix(in srgb,var(--teal) 60%,transparent);border-radius:14px;padding:16px;margin:8px 0;background:color-mix(in srgb,var(--teal) 7%,transparent)}.tgxscan.found{border-style:solid}
.tgxpulse{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;color:var(--teal);background:color-mix(in srgb,var(--teal) 18%,transparent);animation:tgxp 1.6s ease-in-out infinite}@keyframes tgxp{50%{box-shadow:0 0 0 12px color-mix(in srgb,var(--teal) 0%,transparent);transform:scale(1.06)}}@media(prefers-reduced-motion:reduce){.tgxpulse{animation:none}}
.tgxlog{display:flex;flex-direction:column;font-size:.8rem}.tgxlog>div{display:flex;flex-wrap:wrap;gap:2px 10px;padding:6px 0;border-top:1px solid var(--line)}
.efx{display:grid;gap:14px;max-width:1000px;margin:0 auto;width:100%}
.efhero{container-type:inline-size;min-height:150px;border-radius:20px;padding:20px 22px;background:linear-gradient(120deg,#14b8a6 0%,#0f766e 45%,#0b3b45 100%);position:relative;overflow:hidden;color:#fff}
.efhero::after{content:"";position:absolute;right:-40px;top:-40px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.2),transparent 70%)}
.efhero small{font-size:12px;opacity:.85}.efbig{font-size:44px;font-weight:800;line-height:1.1;letter-spacing:-.02em}.efbig span{font-size:18px;font-weight:500;margin-left:4px;opacity:.9}
.efchips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;position:relative;z-index:1}.efchips span{background:rgba(255,255,255,.14);border-radius:999px;padding:6px 12px;font-size:12px}
.efx.nar .efbig{font-size:40px}
.efboard{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:18px;position:relative}
.efgrid{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:12px;z-index:1}
.eflines{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;overflow:visible}
.efc{display:flex;justify-content:center;align-items:center}.efc.hb .efn,.efc.bt .efn{width:calc(50% - 6px)}
.efn{--c:#2dd4bf;container-type:inline-size;width:100%;aspect-ratio:1;position:relative;border-radius:20px;background:color-mix(in srgb,var(--primary-text-color) 5%,var(--card));border:0;overflow:hidden;transition:background .2s,box-shadow .2s;box-shadow:inset 0 1px 0 color-mix(in srgb,var(--primary-text-color) 6%,transparent)}
.efn::before{content:"";position:absolute;top:0;left:16%;right:16%;height:2px;border-radius:0 0 3px 3px;background:var(--c);opacity:.35;transition:opacity .2s}
.efn::after{content:"";position:absolute;left:50%;top:50%;width:62%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--c) 30%,transparent),transparent 68%);opacity:.45;pointer-events:none;transition:opacity .2s}
.efg{width:100%;aspect-ratio:1;visibility:hidden}.efc.bt .efg{width:calc(50% - 6px)}.efx.nar .efc.bt .efg{width:clamp(92px,27%,130px)}.efn.on{background:color-mix(in srgb,var(--c) 14%,color-mix(in srgb,var(--primary-text-color) 7%,var(--card)));box-shadow:inset 0 1px 0 color-mix(in srgb,var(--primary-text-color) 8%,transparent),0 10px 30px -14px var(--c)}.efn.on::before{opacity:1;height:3px}.efn.on::after{opacity:1;width:72%}
.efn:not(.on)::before{opacity:.2}.efn:not(.on)::after{opacity:.2}.efn:not(.on) .efs{opacity:.75}
.efi{position:absolute;left:50%;top:50%;width:30%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;display:grid;place-items:center;font-size:14cqw;overflow:hidden;z-index:1}
.efi svg{width:64%;height:64%}.efi svg.efhd{width:100%;height:100%}.efi.hd{width:40%;border-radius:0;overflow:visible}.efs{z-index:1}.efpi.hd{padding:3px}.efpi .gx{width:100%;height:100%}.efi img{width:100%;height:100%;object-fit:cover}.efi ha-icon{--mdc-icon-size:14cqw}.efn:not(.on) .efi{filter:saturate(.35) brightness(.8);opacity:.85}
.efnm{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.efs{position:absolute;font:inherit;font-size:8.5cqw;font-weight:700;color:var(--mut);white-space:nowrap;line-height:1.15;text-align:center;background:none;border:0;padding:0;cursor:pointer}span.efs{cursor:default}
.efn.on .efs{color:var(--primary-text-color)}.efs i{display:block;font-style:normal;font-size:.72em;font-weight:500;color:var(--mut);overflow:hidden;text-overflow:ellipsis}
.efs.t{top:8%;left:50%;transform:translateX(-50%)}.efs.b{bottom:8%;left:50%;transform:translateX(-50%)}.efs.l{left:3%;top:50%;transform:translateY(-50%);width:28%}.efs.r{right:3%;top:50%;transform:translateY(-50%);width:28%}
.efn.hub .efs.t{font-size:10cqw}.efn.hub .efs.b{font-size:9cqw}
.efseg{display:flex;gap:8px;align-items:center}.efseg button{font:inherit;font-weight:700;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--mut);padding:7px 20px;cursor:pointer}.efseg button.on{color:#2dd4bf;border-color:#2dd4bf;background:color-mix(in srgb,#2dd4bf 16%,var(--card))}.efseg .efszb{margin-left:auto;padding:5px 14px;font-weight:600;font-size:.82rem}
.efn.hub[data-act]{cursor:pointer}.efx:not(.nar) .efc.ct .efn,.efx:not(.nar) .efc.ct .efg{width:calc(50% - 5px)}
.efx:not(.nar){max-width:1100px}.efx:not(.nar)>.hero{min-height:0;padding-top:10px;padding-bottom:12px}.efx:not(.nar)>.hero .mlogo{display:none}.efx:not(.nar)>.hero .lbl{max-width:none}.efx:not(.nar)>.hero .big{font-size:2.3rem}
.efx:not(.nar) .efboard{padding:10px;--eft:128px}.efx:not(.nar) .efgrid{grid-template-columns:repeat(4,minmax(0,var(--eft)));justify-content:center;gap:6px 10px}
.efx:not(.nar) .efn,.efx:not(.nar) .efg{aspect-ratio:1.15/1}.efx:not(.nar) .efc.z>.efg{aspect-ratio:auto;height:0}
.efc.hu.hb .efn{transform:translateY(calc(-50% - 3px))}.efc.hd.hb .efn{transform:translateY(calc(50% + 3px))}.efx.nar .efc.hu.hb .efn{transform:translateY(calc(-50% - 6px))}.efx.nar .efc.hd.hb .efn{transform:translateY(calc(50% + 6px))}.efx.nar .efc.z>.efg{aspect-ratio:auto;height:0}.efx.nar .efc.ct .efn,.efx.nar .efc.ct .efg{width:100%}.efx.nar .efc.tp{gap:10px}.efx.nar .efc.tp .efn{width:clamp(92px,27%,130px)}
.efx.nar .efboard{padding:12px 10px}.efx.nar .efgrid{grid-template-columns:minmax(0,1fr) clamp(92px,27%,130px) minmax(0,1fr);column-gap:clamp(26px,9%,44px);row-gap:8px}.efx.nar .efn,.efx.nar .efg{aspect-ratio:1.1/1}
.efx.nar .efc.hb .efn{width:100%}.efx.nar .efc.bt .efn{width:clamp(92px,27%,130px)}
.efx.nar .efs{font-size:max(10.5px,11cqw)}.efx.nar .efs i{font-size:max(9px,.82em)}.efx.nar .efn.hub .efs.t{font-size:max(10.5px,11.5cqw)}.efx.nar .efn.hub .efs.b{font-size:max(10.5px,10.5cqw)}
.efx.nar .efs.l,.efx.nar .efs.r{width:30%}.efx.nar .efs.t{top:7%}.efx.nar .efs.b{bottom:7%}
.efrow{display:flex;align-items:center;gap:6px;padding-right:12px;border-top:1px solid var(--line)}.efrow .sxrow{flex:1;min-width:0}.efl{border:1px solid var(--line);border-radius:14px;overflow:hidden}.efl .efrow:first-child{border-top:0}
.efmini{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:color-mix(in srgb,var(--c) 22%,transparent);font-size:16px;overflow:hidden}.efmini svg{width:20px;height:20px}.efmini img{width:100%;height:100%;object-fit:cover}
.efli{background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:9px 10px;font:inherit;width:100%;margin:4px 0}.vrow .efli{width:auto;flex:1}
.efpick{border:1px solid var(--line);border-radius:14px;padding:8px 10px;margin:6px 0}.efgal{display:grid;grid-template-columns:repeat(auto-fill,minmax(46px,1fr));gap:6px;max-height:210px;overflow:auto;margin:6px 0}
.efpi{aspect-ratio:1;border-radius:12px;border:1px solid var(--line);background:transparent;color:var(--primary-text-color);display:grid;place-items:center;font-size:22px;cursor:pointer;padding:6px}.efpi svg{width:100%;height:100%}.efpi.sel{border-color:var(--teal);box-shadow:0 0 0 2px color-mix(in srgb,var(--teal) 40%,transparent)}
.efsw{display:flex;gap:8px;flex-wrap:wrap}.efsw button{width:28px;height:28px;border-radius:50%;border:2px solid transparent;cursor:pointer;color:var(--mut);font-weight:700;font-size:.7rem}.efsw button.sel{border-color:var(--primary-text-color)}
.efv{align-items:flex-start;flex-direction:column;gap:2px}.efv>*{width:100%}.efside{margin:2px 0}.efinfo{border:1px solid var(--line);border-radius:12px;padding:2px 12px;margin:8px 0}.efinfo summary{cursor:pointer;padding:8px 0;font-weight:650;font-size:.9rem}
@media (prefers-reduced-motion:reduce){.efn{transition:none}}
/* Modul 19 v0.7: Leuchtlinien, Herkunfts-Ring, Ladestand-Ring, Status-Punkt, „keine Daten“ */
.eflines .eftr{fill:none;stroke-width:1.5;stroke-dasharray:1.5 6;stroke-linecap:round;opacity:.38}
.eflines .efgl{fill:none;stroke-linecap:round;opacity:.2}.eflines .efln{fill:none;stroke-linecap:round;opacity:.95}
.efboard[data-an=voll] .efgl{animation:efglp 2.8s ease-in-out infinite alternate}@keyframes efglp{to{opacity:.36}}
.efhr{position:absolute;left:50%;top:50%;width:44%;aspect-ratio:1;transform:translate(-50%,-50%);z-index:1;pointer-events:none}
.efhr::before{content:"";position:absolute;inset:-14%;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--c) 26%,transparent) 30%,transparent 68%)}
.efhrs{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.efht{fill:none;stroke:color-mix(in srgb,var(--primary-text-color) 12%,transparent);stroke-width:7}
.efha{fill:none;stroke-width:7;stroke-linecap:round;transform:rotate(-90deg);transform-origin:50% 50%;transition:stroke-dasharray .9s ease,stroke-dashoffset .9s ease}
.efhri{position:absolute;inset:17%;border-radius:50%;display:grid;place-items:center;overflow:hidden;font-size:16cqw;background:color-mix(in srgb,var(--primary-text-color) 4%,transparent)}.efhri svg{width:84%;height:84%}.efhri img{width:100%;height:100%;object-fit:cover}.efhri ha-icon{--mdc-icon-size:16cqw}
.efn.hub .efs.t{top:4%}.efn.hub .efs.b{bottom:4%}.efn.hub:has(.efhr) .efs{font-size:9cqw}
.efpr{position:absolute;left:50%;top:50%;width:39%;aspect-ratio:1;transform:translate(-50%,-50%);z-index:1;overflow:visible;pointer-events:none}
.efpr circle{fill:none;stroke-width:3.4}.efpr circle:first-child{stroke:color-mix(in srgb,var(--primary-text-color) 12%,transparent)}.efpr circle+circle{stroke:var(--c);stroke-linecap:round;transform:rotate(-90deg);transform-origin:50% 50%;transition:stroke-dasharray .9s ease}
.efn:has(.efpr) .efi.hd{width:28%}
.efdot{position:absolute;top:9%;right:9%;width:9px;height:9px;border-radius:50%;z-index:2;background:#64748b}.efdot.ok{background:#22c55e;box-shadow:0 0 8px #22c55e}.efdot.wait{background:#facc15;box-shadow:0 0 8px #facc15}.efdot.err{background:#ef4444;box-shadow:0 0 8px #ef4444}
.efn.nd{background:color-mix(in srgb,var(--primary-text-color) 4%,var(--card))}.efn.nd .efi{filter:grayscale(1);opacity:.5}.efn.nd .efs{opacity:.6}
.efhb{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:6px 0}.efhbb{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;border-radius:12px;border:1px solid var(--line);background:transparent;color:var(--primary-text-color);font:inherit;font-size:.72rem;cursor:pointer}.efhbb.sel{border-color:var(--teal);box-shadow:0 0 0 2px color-mix(in srgb,var(--teal) 40%,transparent)}
/* Modul 19 v0.8 · A Lichtband-Banner */
.efband{position:relative;overflow:hidden;min-height:170px;padding:18px 22px;border-radius:20px;color:#fff;background:radial-gradient(ellipse at 72% 50%,rgba(45,212,191,.28),transparent 60%),linear-gradient(120deg,#0f4c4f 0%,#0b2f3a 55%,#0a1f2e 100%);border:0}
.efband.nt{background:radial-gradient(ellipse at 72% 50%,rgba(45,212,191,.16),transparent 60%),linear-gradient(120deg,#0b2730 0%,#081822 55%,#060f1a 100%)}
.efbs{position:absolute;right:0;top:0;height:100%;width:100%;pointer-events:none}
.efband .efbg{opacity:.18}.efband .efbm{opacity:.85}.efband .efbd{stroke:#fff;stroke-dasharray:0 16;opacity:.85;animation:efbr 1.6s linear infinite}@keyframes efbr{to{stroke-dashoffset:-16}}
.efbt{position:relative;z-index:1;max-width:46%;display:flex;flex-direction:column;gap:6px}.efbt .lbl{display:flex;align-items:center;gap:6px;font-size:.85rem;opacity:.85}
.efbt .big{font-size:2.6rem;font-weight:800;line-height:1.05;letter-spacing:-.02em}.efbt .big small{font-size:1rem;font-weight:500;margin-left:5px;opacity:.85}
.efbar{display:flex;gap:2px;height:9px;border-radius:99px;overflow:hidden;background:rgba(255,255,255,.12);max-width:300px}.efbar i{display:block;height:100%}
.efleg{font-size:.78rem;font-weight:650}.efband .efleg span:not([style]){opacity:.8}
.efbt .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}.efbt .chip{background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.14);color:#fff;border-radius:99px;padding:4px 10px;font-size:.75rem}
.efband.nar{min-height:0;padding:12px 14px}.efband.nar .efbs{width:100%;opacity:.8}.efband.nar .efbt{max-width:70%}.efband.nar .efbt .big{font-size:2rem}.efband.nar .chips{display:none}
@media (prefers-reduced-motion:reduce){.efband .efbd{animation:none}}
/* F · Themen fürs Brett */
.efboard.th-nacht,.efcol.th-nacht,.efthv.th-nacht{background:radial-gradient(circle at 50% 52%,rgba(45,212,191,.16),transparent 52%),var(--card)}
.th-plan{background-color:#0c2340!important;background-image:linear-gradient(rgba(96,165,250,.13) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,.13) 1px,transparent 1px)!important;background-size:22px 22px!important;border-color:#1e3a5f!important}
.th-sterne{background:radial-gradient(1.6px 1.6px at 4% 40%,#fff,transparent),radial-gradient(1.2px 1.2px at 30% 8%,#fff,transparent),radial-gradient(1.6px 1.6px at 60% 70%,#fff,transparent),radial-gradient(1.2px 1.2px at 96% 6%,#fff,transparent),radial-gradient(1.2px 1.2px at 72% 94%,#fff,transparent),radial-gradient(1.2px 1.2px at 8% 14%,#fff,transparent),radial-gradient(1px 1px at 23% 62%,#fff,transparent),radial-gradient(1.4px 1.4px at 37% 28%,#fff,transparent),radial-gradient(1px 1px at 52% 86%,#fff,transparent),radial-gradient(1.2px 1.2px at 66% 12%,#fff,transparent),radial-gradient(1px 1px at 78% 47%,#fff,transparent),radial-gradient(1.4px 1.4px at 91% 74%,#fff,transparent),radial-gradient(1px 1px at 14% 90%,#fff,transparent),radial-gradient(1px 1px at 86% 26%,#fff,transparent),radial-gradient(1.2px 1.2px at 45% 46%,#fff,transparent),radial-gradient(circle at 50% 52%,rgba(129,140,248,.25),transparent 55%),linear-gradient(165deg,#1e1b4b,#0b1026)!important;border-color:#312e81!important}
.th-garten{background:radial-gradient(ellipse at 80% 8%,rgba(254,240,138,.35),transparent 30%),linear-gradient(180deg,#0e7490 0%,#155e75 58%,#166534 58.2%,#14532d 100%)!important;border-color:#155e75!important}
.efx.lt .efboard.th-nacht,.efx.lt .efcol.th-nacht{background:radial-gradient(circle at 50% 52%,rgba(45,212,191,.12),transparent 52%),var(--card)}
.efx.lt .th-plan{background-color:#eff6ff!important;background-image:linear-gradient(rgba(37,99,235,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.1) 1px,transparent 1px)!important;border-color:#bfdbfe!important}
.efx.lt .th-garten{background:linear-gradient(180deg,#bae6fd 0%,#e0f2fe 58%,#bbf7d0 58.2%,#86efac 100%)!important;border-color:#bae6fd!important}
.efthp{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:8px}.efth{display:flex;flex-direction:column;gap:3px;padding:6px;border-radius:12px;border:1px solid var(--line);background:transparent;color:var(--primary-text-color);font:inherit;text-align:left;cursor:pointer}.efth.sel{border-color:var(--teal);box-shadow:0 0 0 2px color-mix(in srgb,var(--teal) 40%,transparent)}.efth b{font-size:.78rem}.efth small{font-size:.66rem;color:var(--mut);line-height:1.2}.efthv{display:block;height:46px;border-radius:8px;border:1px solid var(--line)}
@media (max-width:560px){.efthp{grid-template-columns:repeat(2,minmax(0,1fr))}}
/* F · Hell-Variante: weiße Kacheln mit feinem Rand und farbiger Linie oben, kein Licht hinter dem Bild, Linien kräftiger */
.efx.lt .efn{background:#fff;border:1px solid #e5e7eb;box-shadow:0 1px 2px rgba(0,0,0,.04)}.efx.lt .efn::after{display:none}.efx.lt .efn::before{opacity:1;height:3px}
.efx.lt .efn.on{background:#fff;box-shadow:0 8px 20px -12px var(--c)}.efx.lt .efn:not(.on){background:#f8fafc}.efx.lt .eflines .efln{opacity:1}.efx.lt .eflines .efgl{opacity:.12}.efx.lt .efhr::before{display:none}
/* F · Kachelform „Rund“ */
.efx.sh-rund .efn{border-radius:50%}.efx.sh-rund .efn::before{display:none}.efx.sh-rund .efs.l,.efx.sh-rund .efs.r{display:none}.efx.sh-rund .efs.t{top:13%}.efx.sh-rund .efs.b{bottom:13%}
.efx.sh-rund:not(.nar) .efn:not(.hub){aspect-ratio:1;width:87%}.efx.sh-rund.nar .efn:not(.hub){aspect-ratio:1;width:91%}.efx.sh-rund:not(.nar) .efc.bt .efn,.efx.sh-rund:not(.nar) .efc.ct .efn{width:calc(43.5% - 3px)}.efx.sh-rund.nar .efc.bt .efn{width:clamp(84px,25%,118px)}.efx.sh-rund.nar .efc.tp .efn{width:clamp(84px,25%,118px)}
.efx.sh-rund .efn.hub{background:transparent;box-shadow:none}.efx.sh-rund .efn.hub::before,.efx.sh-rund .efn.hub::after{display:none}
/* H1 · Handy A Fluss-Spalte */
.efcol{position:relative;border:1px solid var(--line);border-radius:20px;padding:12px;display:flex;flex-direction:column;gap:8px}
.efsec{font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}
.efsrc{position:relative;z-index:1;display:grid;gap:6px}.efsq{display:flex;flex-direction:column;align-items:center;gap:2px;background:none;border:0;color:var(--primary-text-color);font:inherit;padding:2px;cursor:pointer;position:relative}
.efsq b{font-size:.9rem}.efsq small{font-size:.68rem;color:var(--mut);text-align:center;line-height:1.15}.efsq:not(.on) .efq{opacity:.55;filter:saturate(.4)}.efsq .efdot{top:2px;right:10%}
.efq{position:relative;display:grid;place-items:center;width:58px;height:58px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--c) 28%,transparent),color-mix(in srgb,var(--primary-text-color) 6%,transparent) 70%);border:1px solid color-mix(in srgb,var(--primary-text-color) 10%,transparent)}
.efq.sm{width:46px;height:46px;flex:none}.efqi{display:grid;place-items:center;width:66%;height:66%;font-size:22px}.efqi svg{width:100%;height:100%}.efqi img{width:100%;height:100%;object-fit:cover;border-radius:50%}.efq .efpr{width:100%}
.efcl{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:0}.efcl .eftr{fill:none;stroke-width:1.5;stroke-dasharray:1.5 6;stroke-linecap:round;opacity:.38}.efcl .efgl{fill:none;opacity:.2;stroke-linecap:round}.efcl .efln{fill:none;stroke-linecap:round;opacity:.95}
.efhouse{position:relative;z-index:1;align-self:center;display:flex;flex-direction:column;align-items:center;background:none;border:0;color:var(--primary-text-color);font:inherit;cursor:pointer;margin:26px 0 4px;container-type:inline-size;width:150px}
.efhouse .efhr{position:relative;left:auto;top:auto;transform:none;width:118px}.efhouse b{font-size:1.25rem;margin-top:4px}.efhouse small{font-size:.72rem;color:var(--mut)}.efhouse .efhri{font-size:40px}
.efcons{display:flex;flex-direction:column;gap:6px}.efpill{position:relative;display:flex;align-items:center;gap:10px;padding:7px 10px 7px 7px;border-radius:99px;border:1px solid var(--line);background:color-mix(in srgb,var(--primary-text-color) 4%,var(--card));color:var(--primary-text-color);font:inherit;text-align:left;cursor:pointer;box-shadow:inset 3px 0 0 var(--c)}
.efpill.on{background:color-mix(in srgb,var(--c) 10%,var(--card))}.efpt{display:flex;flex-direction:column;min-width:0;flex:1}.efpt small{font-size:.72rem;font-weight:700;color:var(--c)}.efpt b{font-size:1.05rem}.efpt span{font-size:.72rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.efpill .efdot{position:static;flex:none;margin-right:6px}
.efpill:not(.on) .efq{opacity:.55;filter:saturate(.4)}.efpill.nd .efq,.efsq.nd .efq,.efrt.nd .efq{filter:grayscale(1);opacity:.5}
.efmore{display:flex;justify-content:space-between;background:none;border:0;color:var(--mut);font:inherit;font-size:.8rem;padding:4px 6px;cursor:pointer}.efmore span{color:var(--teal);font-weight:650}
/* H1 · Handy B Kachel-Raster */
.efhc{display:flex;align-items:center;gap:14px;padding:14px;cursor:pointer;container-type:inline-size}.efhc .efhr{position:relative;left:auto;top:auto;transform:none;width:96px;flex:none}.efhc .efhri{font-size:34px}.efhc .lbl{font-size:.8rem;color:var(--mut)}.efhc .big{font-size:2rem;font-weight:800}.efhc .big small{font-size:.9rem;font-weight:500;margin-left:4px}.efhc .efleg{font-size:.74rem}
.efras{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:10px;border-radius:20px;border:1px solid var(--line)}
.efrt{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 6px;border-radius:16px;border:0;background:color-mix(in srgb,var(--primary-text-color) 5%,var(--card));color:var(--primary-text-color);font:inherit;cursor:pointer;box-shadow:inset 0 2px 0 color-mix(in srgb,var(--c) 70%,transparent)}
.efrt.on{background:color-mix(in srgb,var(--c) 12%,var(--card))}.efrt b{font-size:1rem}.efrt small{font-size:.72rem;font-weight:700;color:var(--c)}.efra{align-self:flex-start;font-size:.66rem;color:var(--mut)}.efrt.on .efra{color:var(--c)}.efrt:not(.on) .efq{opacity:.55;filter:saturate(.4)}.efrt .efdot{top:10px;right:10px}
.efrt.add{--c:var(--line);color:var(--mut);justify-content:center;border:1px dashed var(--line);background:transparent;min-height:120px}
/* H2 · Tablet-Modus: Wand-Ansicht */
.efx.wall{max-width:none}.efwall{display:grid;gap:12px}.efx.quer .efwall{grid-template-columns:minmax(0,1fr) 270px;align-items:start}
.efx.wall .efn:not(.hub){aspect-ratio:2.3/1!important;width:100%!important;border-radius:16px}.efx.wall .efc.bt .efn:not(.hub),.efx.wall .efc.ct .efn:not(.hub){width:calc(50% - 6px)!important}
.efx.wall .efn:not(.hub) .efi{left:21%;width:24%}.efx.wall .efn:not(.hub) .efpr{left:21%;width:31%}.efx.wall .efn:not(.hub):has(.efpr) .efi.hd{width:20%}
.efx.wall .efn:not(.hub) .efs.l,.efx.wall .efn:not(.hub) .efs.r{display:none}
.efx.wall .efn:not(.hub) .efs.b{left:42%;right:4%;top:52%;bottom:auto;transform:translateY(-50%);text-align:left;font-size:11cqw;color:var(--primary-text-color)}.efx.wall .efn:not(.hub) .efs.b i{font-size:.5em}
.efx.wall .efn:not(.hub) .efs.t{left:42%;right:4%;top:auto;bottom:8%;transform:none;text-align:left;font-size:5.4cqw;font-weight:600;display:flex;gap:4px;overflow:hidden}.efx.wall .efn:not(.hub) .efs.t i{display:inline;font-size:1em}
.efx.wall .efn:not(.hub) .efnm{left:42%;top:9%;width:auto;height:auto;clip:auto;overflow:hidden;right:12%;white-space:nowrap;text-overflow:ellipsis;font-size:5.6cqw;font-weight:700;color:var(--c)}
.efx.wall .efn.hub{aspect-ratio:1.05/1!important;background:transparent!important;box-shadow:none!important}.efx.wall .efn.hub::before,.efx.wall .efn.hub::after{display:none}.efx.wall .efn.hub .efhr{width:66%}
.efx.wall .efn:not(.hub) .efgb{left:12%;right:auto;bottom:9%;font-size:4.6cqw}.efcr.sub{font-weight:600}
.efx.wall .efn .efdot{top:7%;right:3.5%;width:8px;height:8px}
.efws{display:flex;flex-direction:column;gap:12px}.efws .card{padding:14px;display:flex;flex-direction:column;gap:8px}.efws .efbar{max-width:none;height:12px}.efws .efleg{font-size:.85rem}
.efwr{display:flex;justify-content:space-between;align-items:baseline;padding:4px 0;border-top:1px solid var(--line);font-size:.92rem}.efwr:first-of-type{border-top:0}.efwr b{font-size:1.15rem}
.efwf{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.efwf>div{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 14px;display:flex;flex-direction:column}.efwf small{color:var(--mut);font-size:.8rem}.efwf b{font-size:1.5rem}
.tmrest.efst{background:radial-gradient(1px 1px at 12% 20%,#fff8,transparent),radial-gradient(1px 1px at 30% 70%,#fff6,transparent),radial-gradient(1.2px 1.2px at 70% 15%,#fff8,transparent),radial-gradient(1px 1px at 85% 60%,#fff6,transparent),radial-gradient(1px 1px at 55% 88%,#fff5,transparent),linear-gradient(165deg,#0f0d2b,#04050d)}
.tmrest .tmrc{order:0}.tmrest .tmrd{order:1}.tmef{order:2;display:flex;flex-direction:column;align-items:center;gap:2px;margin:14px 0 6px;opacity:.9}.tmef b{font-size:2rem}.tmef small{font-size:.95rem;opacity:.75}.tmrest .tmrf{order:3}.tmrest .tmrw{order:4}
/* Modul 19 v0.9 · G Animationen „Voll“: Geräte bewegen sich, Sterne funkeln */
.efboard[data-an=voll] .efn.on .efi[data-g=washer] svg,.efboard[data-an=voll] .efn.on .efi[data-g=dryer] svg,.efboard[data-an=voll] .efn.on .efi[data-g=dishwasher] svg{animation:efshake .9s ease-in-out infinite}
@keyframes efshake{0%,100%{transform:translate(0,0)}20%{transform:translate(-.6px,.3px) rotate(-.6deg)}40%{transform:translate(.6px,-.3px) rotate(.6deg)}60%{transform:translate(-.4px,.2px)}80%{transform:translate(.4px,-.2px)}}
.efboard[data-an=voll] .efn.on .efi[data-g=lamp] svg{animation:eflamp 2.4s ease-in-out infinite alternate}@keyframes eflamp{from{filter:drop-shadow(0 0 2px #fde047)}to{filter:drop-shadow(0 0 10px #fde047) brightness(1.12)}}
.efboard[data-an=voll] .efn.on .efi[data-g=pvRoof] svg,.efboard[data-an=voll] .efn.on .efi[data-g=balcony] svg{animation:efsun 3.2s ease-in-out infinite alternate}@keyframes efsun{to{filter:drop-shadow(0 0 7px rgba(250,204,21,.7)) brightness(1.08)}}
.efboard[data-an=voll] .efn.on .efi[data-g=heatpump] svg,.efboard[data-an=voll] .efn.on .efi[data-g=heater] svg,.efboard[data-an=voll] .efn.on .efi[data-g=boiler] svg,.efboard[data-an=voll] .efn.on .efi[data-g=radiator] svg{animation:efheat 2.6s ease-in-out infinite alternate}@keyframes efheat{to{filter:drop-shadow(0 0 8px rgba(249,115,22,.65))}}
.efboard[data-an=voll] .efn.on .efi[data-g=car] svg,.efboard[data-an=voll] .efn.on .efi[data-g=wallbox] svg,.efboard[data-an=voll] .efn.on .efi[data-g=battery] svg{animation:efchg 1.8s ease-in-out infinite alternate}@keyframes efchg{to{filter:drop-shadow(0 0 7px var(--c))}}
.efband[data-an=voll] .efstar{animation:eftw 3s ease-in-out infinite alternate}@keyframes eftw{from{opacity:.15}to{opacity:1}}
.efboard[data-an=voll].th-sterne::after,.efboard[data-an=voll] .th-sterne::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(1.6px 1.6px at 18% 30%,#fff,transparent),radial-gradient(1.4px 1.4px at 62% 22%,#fff,transparent),radial-gradient(1.6px 1.6px at 82% 82%,#fff,transparent),radial-gradient(1.2px 1.2px at 33% 78%,#fff,transparent);animation:eftw 2.4s ease-in-out infinite alternate}
@media (prefers-reduced-motion:reduce){.efboard .efi svg,.efband .efstar,.efboard::after{animation:none!important}}
/* W1 Anordnen */
.efab.on{color:#2dd4bf;border-color:#2dd4bf}.efboard.arr .efn *{pointer-events:none}.efboard.arr .efn:not(.hub){cursor:grab;touch-action:none;outline:2px dashed color-mix(in srgb,var(--c) 55%,transparent);outline-offset:2px}
.efboard.arr .efn.drag{z-index:5;cursor:grabbing;opacity:.92;box-shadow:0 18px 40px -10px #000;transition:none}.efboard.arr .efn.pick{outline:3px solid #2dd4bf}
.efslot{width:100%;aspect-ratio:1.15/1;border-radius:20px;border:2px dashed var(--line);background:transparent;color:var(--mut);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font:inherit;cursor:pointer}.efslot small{font-size:.72rem}.efslot.pk{border-color:color-mix(in srgb,#2dd4bf 60%,transparent);color:#2dd4bf}
[data-slot].over .efslot,[data-slot].over .efn{outline:3px solid #2dd4bf;outline-offset:2px;border-radius:20px}
/* W3 Gruppe, W4 Tageswerte, W7 Sponsor-Abzeichen, W2 Vorlagen */
.efgb{position:absolute;right:9%;bottom:30%;z-index:3;border:0;border-radius:99px;padding:1px 6px;font:inherit;font-size:max(9px,6cqw);font-weight:800;background:var(--c);color:#0b1220;cursor:pointer}
.efgm{width:100%;background:none;border:0;border-top:1px solid var(--line);color:var(--primary-text-color);font:inherit;text-align:left;cursor:pointer}
.eftd{display:flex;flex-wrap:wrap;align-items:center;gap:6px 16px;padding:8px 14px;border-radius:14px;border:1px solid var(--line);background:var(--card);font-size:.85rem}.eftd b{color:var(--mut);font-weight:700;text-transform:uppercase;font-size:.7rem;letter-spacing:.08em}.eftd span{display:inline-flex;align-items:center;gap:6px}.eftd i{width:8px;height:8px;border-radius:50%}
.efspb{position:absolute;top:12px;right:14px;z-index:2;display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:99px;font-size:.7rem;font-weight:700;color:#fda4af;background:rgba(0,0,0,.3);border:1px solid rgba(251,113,133,.45)}.efband.nar .efspb{top:8px;right:8px}
.eftpl{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}.eftpb{display:flex;align-items:center;gap:10px;padding:10px;border-radius:14px;border:1px solid var(--line);background:color-mix(in srgb,var(--primary-text-color) 3%,transparent);color:var(--primary-text-color);font:inherit;text-align:left;cursor:pointer}.eftpb span{display:flex;flex-direction:column}.eftpb b{font-size:.85rem}.eftpb small{font-size:.72rem;color:var(--mut)}
/* E Strom-Reiter */
.efpn{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}.efpnv{display:flex;align-items:center;gap:6px}.efpnv b{min-width:120px;text-align:center}.efpnv .ibtn{font-size:1.3rem;line-height:1}
.efsum{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.efsum>div{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:10px 14px;display:flex;flex-direction:column}.efsum small{color:var(--mut);font-size:.78rem}.efsum b{font-size:1.35rem}
.efsgrid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:12px;align-items:start}.efsgrid.nar{grid-template-columns:1fr}
@media (max-width:640px){.efsum{grid-template-columns:repeat(2,minmax(0,1fr))}}
.efh2{display:flex;align-items:center;gap:6px;font-weight:700;margin-bottom:10px}
.efcols{display:flex;align-items:stretch;gap:3px;height:190px;padding-bottom:16px;position:relative}.efcols.nm{gap:2px}
.efsc{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:flex-end;align-items:stretch;position:relative;background:none;border:0;padding:0;cursor:pointer;font:inherit}
.efsb{display:flex;flex-direction:column;border-radius:5px 5px 2px 2px;overflow:hidden;min-height:1px;box-shadow:0 0 12px -4px rgba(251,191,36,.45)}.efsb i{display:block;min-height:0}
.efsc small{position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);font-size:.65rem;color:var(--mut)}.efsc.sel .efsb{outline:2px solid var(--primary-text-color);outline-offset:1px}.efsc:hover .efsb{filter:brightness(1.15)}
.efleg2{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:.75rem;margin-top:8px}.efleg2 span{display:inline-flex;align-items:center;gap:5px}.efleg2 i{width:9px;height:9px;border-radius:3px}
.efsd{margin-top:8px;font-size:.85rem;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,var(--primary-text-color) 4%,transparent)}
.efsv{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line)}.efsv:first-of-type{border-top:0}.efsvt{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}.efsvt b{font-size:.9rem;color:var(--c)}
.efsvb{height:7px;border-radius:99px;background:color-mix(in srgb,var(--primary-text-color) 10%,transparent);overflow:hidden}.efsvb i{display:block;height:100%;background:linear-gradient(90deg,#fbbf24,#facc15);border-radius:99px}
.efsvv{display:flex;flex-direction:column;align-items:flex-end}.efsvv small{font-size:.72rem;color:#fbbf24}
/* Modul 19 v1.0: Prüfung, Schnellstart, Kosten */
.efckl{display:flex;flex-direction:column;gap:6px}.efck{display:flex;align-items:flex-start;gap:8px;width:100%;padding:9px 11px;border-radius:12px;border:1px solid var(--line);background:transparent;color:var(--primary-text-color);font:inherit;font-size:.84rem;text-align:left;cursor:pointer}.efck span{flex:1}.efck>svg:last-child{transform:rotate(-90deg);opacity:.5;flex:none;align-self:center}.efck b{display:block;font-size:.85rem}
.efck.ok{cursor:default;color:#4ade80;border-color:color-mix(in srgb,#4ade80 40%,transparent);background:color-mix(in srgb,#4ade80 8%,transparent)}.efck.ok span{color:var(--primary-text-color)}.efck.bad{border-color:color-mix(in srgb,#f87171 55%,transparent);background:color-mix(in srgb,#f87171 8%,transparent)}.efck.bad>svg:first-child{color:#f87171}
.efck.warn{border-color:color-mix(in srgb,#fbbf24 50%,transparent);background:color-mix(in srgb,#fbbf24 7%,transparent)}.efck.warn>svg:first-child{color:#fbbf24}.efck.info>svg:first-child{color:#60a5fa}
.efhs .btn2{flex:none}.efhs{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px}.efhsi{display:flex;flex-wrap:wrap;gap:6px}.efhsi span{display:inline-flex;align-items:center;gap:4px;padding:3px 9px 3px 4px;border-radius:99px;border:1px solid var(--line);font-size:.78rem}.efhsi span.used{opacity:.45;text-decoration:line-through}
.efsside{display:flex;flex-direction:column;gap:12px}.efsmain{display:flex;flex-direction:column;gap:12px;min-width:0}
.efmix .efh2{flex-wrap:wrap}.efmix .efh2 small{margin-left:auto;font-weight:500;font-size:.78rem}
.efmx{display:flex;height:14px;border-radius:8px;overflow:hidden;background:var(--line);margin:10px 0 6px}.efmx i{display:block;height:100%}.efmx i+i{box-shadow:-1px 0 0 var(--card)}
.efmxrs{display:flex;flex-direction:column}.efmxr{display:grid;grid-template-columns:12px minmax(0,1fr) auto;gap:10px;align-items:start;padding:9px 0;border-top:1px solid var(--line)}.efmxr:first-child{border-top:0}
.efmxd{width:12px;height:12px;border-radius:4px;background:var(--c);margin-top:4px;box-shadow:0 0 10px color-mix(in srgb,var(--c) 55%,transparent)}
.efmxt b{color:var(--c)}.efmxt small,.efmxv small{display:block;color:var(--mut);font-size:.76rem;margin-top:1px}.efmxv{text-align:right;white-space:nowrap}.efmxv b{font-size:1.02rem}
.efmxs{display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:3px;font-size:.76rem;color:var(--mut)}.efmxs b{color:var(--primary-text-color);font-weight:600}
.efmxk{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:8px 0 4px}.efmxk>div{background:color-mix(in srgb,var(--line) 45%,transparent);border-radius:12px;padding:8px 10px}.efmxk small{display:block;color:var(--mut);font-size:.72rem}.efmxk b{font-size:1.15rem}
.efmxh{margin-top:12px;font-size:.86rem;color:var(--mut)}.efmxh b{color:var(--primary-text-color)}
.efmxl{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:.76rem;color:var(--mut)}.efmxl i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:5px;vertical-align:0}
@media (max-width:640px){.efmxk{grid-template-columns:1fr 1fr}.efmxk>div:last-child{grid-column:1/-1}}.efcost .efh2{flex-wrap:wrap}.efcost .efh2 small{flex-basis:100%;font-weight:500;font-size:.72rem}
.efcr{display:flex;justify-content:space-between;align-items:baseline;padding:6px 0;border-top:1px solid var(--line);font-size:.88rem}.efcr b{font-size:1rem}.efcr .pos{color:#4ade80}.efcr .neg{color:#f87171}.efcr.sum{border-top:2px solid var(--line);font-weight:700}.efcr.sum b{font-size:1.2rem}
.efseg .efsh{margin-left:auto;display:inline-flex;align-items:center;gap:5px}.efseg .efszb+.efszb{margin-left:0}
/* Modul 19 v1.0 Build 2 · Feinschliff: ruhige Kacheln, klare Schrift-Rangfolge, Haus als freier Ring */
.efx:not(.lt) .efn.on{background:linear-gradient(180deg,color-mix(in srgb,var(--c) 10%,var(--card)) 0%,color-mix(in srgb,var(--primary-text-color) 5%,var(--card)) 78%);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--primary-text-color) 9%,transparent),0 8px 22px -18px var(--c)}
.efn.on::after{background:radial-gradient(circle,color-mix(in srgb,var(--c) 34%,transparent),transparent 66%)}
.efx:not(.lt) .efn:not(.on):not(.hub){background:color-mix(in srgb,var(--primary-text-color) 3%,var(--card))}.efn:not(.on):not(.hub) .efi{filter:saturate(.25) brightness(.85);opacity:.6}.efn:not(.on):not(.hub) .efs.b{color:var(--mut)}
.efs.b{font-size:10.5cqw;font-weight:800;letter-spacing:-.01em}.efs.b i{font-size:.6em;font-weight:600;letter-spacing:0}.efs.t{font-size:8cqw}.efs.l,.efs.r{font-size:7.5cqw}.efs i{opacity:.85}
.efn.on .efs.t,.efn.on .efs.l,.efn.on .efs.r{color:color-mix(in srgb,var(--primary-text-color) 82%,var(--mut))}
.efx.nar .efs.b{font-size:max(12px,12.5cqw)}.efx.nar .efs.b i{font-size:max(9px,.62em)}
/* Haus: kein Kasten mehr, der Ring ist das Herzstück; Wert im Ring, Tageswert schräg oben rechts (dort kommt keine Linie an) */
.efx .efn.hub{background:transparent!important;box-shadow:none!important;border:0!important;overflow:visible}
.efx .efn.hub::before{display:none}.efx .efn.hub::after{width:96%;opacity:.85;background:radial-gradient(circle,color-mix(in srgb,var(--c) 26%,transparent),transparent 62%)}
.efx .efn.hub .efhr{width:68%}.efx .efn.hub .efhr::before{display:none}
.efx .efn.hub .efhri{inset:13%;background:radial-gradient(circle at 50% 35%,color-mix(in srgb,var(--c) 16%,var(--card)),var(--card) 75%);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--primary-text-color) 10%,transparent)}
.efx .efn.hub .efhri svg{width:46%;height:46%;transform:translateY(-34%)}.efx .efn.hub .efhri img{transform:none}
.efx .efn.hub .efs{z-index:3}.efx .efn.hub .efs.b{bottom:auto;top:52%;font-size:8.6cqw;line-height:1.05}.efx .efn.hub .efs.b i{font-size:.62em;color:var(--mut)}
.efx .efn.hub .efs.t{top:1%;left:auto;right:-6%;transform:none;font-size:6.6cqw;text-align:left;padding:2px 8px;border-radius:99px;background:color-mix(in srgb,var(--primary-text-color) 7%,var(--card));border:1px solid var(--line)}.efx .efn.hub .efs.t i{display:inline;margin-left:3px}
.efx.nar .efn.hub .efs.t{font-size:max(9px,7cqw);right:-14%;top:-4%}.efx.nar .efn.hub .efs.b{font-size:max(11px,10cqw)}
.efx.lt .efn.hub .efhri{background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.08)}
/* Punkte mit leichtem Schein, Raster und Pillen ruhiger */
.eflines circle{filter:drop-shadow(0 0 2px rgba(255,255,255,.7))}
.efpill{box-shadow:none!important;border-radius:18px;border-color:color-mix(in srgb,var(--c) 24%,var(--line))}.efpill.on{background:linear-gradient(90deg,color-mix(in srgb,var(--c) 11%,var(--card)),color-mix(in srgb,var(--primary-text-color) 4%,var(--card)) 70%)}.efpill:not(.on){border-color:var(--line)}
.efseg button{white-space:nowrap}.efx.nar .efseg{gap:6px}.efx.nar .efseg button{padding:7px 14px}.efx.nar .efseg .efszb{padding:5px 10px;font-size:.78rem}
.efx.nar .efn.hub .efhr{width:92%}.efx.nar .efn.hub .efs.b{top:50%;font-size:max(10px,9.5cqw)}.efx.nar .efn.hub .efs.t{top:-14%;right:-30%}
.efrt.on{background:linear-gradient(180deg,color-mix(in srgb,var(--c) 10%,var(--card)),color-mix(in srgb,var(--primary-text-color) 5%,var(--card)) 80%)}.efpill.on{background:color-mix(in srgb,var(--c) 6%,var(--card))}
/* Modul 16 · Neue Optik Stufe 1 (v0.9 Build 3) */
.spban{position:relative;overflow:hidden;min-height:190px;color:#fff;background:radial-gradient(ellipse at 74% 62%,rgba(245,158,11,.32),transparent 58%),linear-gradient(120deg,#3a2a07 0%,#221b0b 45%,#121820 100%)!important;border:0}
.spban.nt{background:radial-gradient(ellipse at 74% 62%,rgba(129,140,248,.18),transparent 58%),linear-gradient(120deg,#131a33 0%,#0c1222 55%,#080d18 100%)!important}
.spban .spbow{position:absolute;right:0;top:0;height:100%;width:62%;pointer-events:none}.spban .spt{font-size:11px;fill:rgba(255,255,255,.75)}
.spbl{position:relative;z-index:1;max-width:44%;display:flex;flex-direction:column;gap:6px}.spbl .lbl{display:flex;align-items:center;gap:6px;font-size:.85rem;opacity:.9}.spbl .big{font-size:2.8rem;font-weight:800;line-height:1.02;letter-spacing:-.02em}.spbl .big small{font-size:1rem;font-weight:600;margin-left:5px;opacity:.85}
.spbar{height:8px;border-radius:99px;background:rgba(255,255,255,.14);overflow:hidden;max-width:300px}.spbar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#f59e0b,#fde047)}
.spsub{font-size:.85rem;opacity:.95}.spsub .g,.spx .g{color:#4ade80}.spsub .w,.spx .w{color:#fb923c}
.spbl .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}.spbl .chip{background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.16);color:#fff;font-size:.75rem;padding:4px 10px;border-radius:99px}
.spx{display:grid;gap:14px}
.sptiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:12px}
.sptile{position:relative;overflow:hidden;border-radius:18px;padding:14px;background:linear-gradient(180deg,color-mix(in srgb,var(--c) 10%,var(--card)) 0%,color-mix(in srgb,var(--primary-text-color) 4%,var(--card)) 78%);border:1px solid var(--line);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--primary-text-color) 7%,transparent)}
.sptile::before{content:"";position:absolute;top:0;left:18%;right:18%;height:3px;border-radius:0 0 3px 3px;background:var(--c)}
.sptile.dim{background:color-mix(in srgb,var(--primary-text-color) 3%,var(--card))}.sptile.dim .spti span{filter:saturate(.3);opacity:.6}
.spti{position:relative;width:60px;height:60px;display:grid;place-items:center;margin-bottom:6px}.spti::after{content:"";position:absolute;inset:-8px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--c) 30%,transparent),transparent 66%)}.spti span{position:relative;z-index:1;display:grid}
.sptr{position:absolute;inset:-6px;width:72px;height:72px;z-index:2}.sptr circle{fill:none;stroke-width:5}.sptr circle:first-child{stroke:color-mix(in srgb,var(--primary-text-color) 12%,transparent)}.sptr circle+circle{stroke:var(--c);stroke-linecap:round;transform:rotate(-90deg);transform-origin:50% 50%;transition:stroke-dasharray .9s ease}
.sptl{font-size:.8rem;color:var(--mut);font-weight:600}.sptv{font-size:1.8rem;font-weight:800;letter-spacing:-.02em;line-height:1.1}.sptv small{font-size:.8rem;font-weight:600;margin-left:4px;color:var(--mut)}.spts{font-size:.8rem;color:color-mix(in srgb,var(--primary-text-color) 80%,var(--mut));margin-top:2px}
.spbd{position:absolute;top:10px;right:10px;font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:99px;color:var(--c);border:1px solid color-mix(in srgb,var(--c) 45%,transparent);background:color-mix(in srgb,var(--c) 12%,transparent)}
.spcard h2{margin-bottom:8px}.spseg{display:flex;gap:8px;align-items:center;margin-bottom:6px}.spseg button{font:inherit;font-weight:700;font-size:.85rem;border-radius:99px;border:1px solid var(--line);background:var(--card);color:var(--mut);padding:5px 16px;cursor:pointer}.spseg button.on{color:#2dd4bf;border-color:#2dd4bf;background:color-mix(in srgb,#2dd4bf 14%,var(--card))}.spseg .mut{margin-left:auto}
.spch{width:100%;height:auto;display:block}.spgl{stroke:color-mix(in srgb,var(--primary-text-color) 8%,transparent)}.spax{font-size:11px;fill:var(--mut)}
.spfa{fill:color-mix(in srgb,#f59e0b 20%,transparent)}.spfl{fill:none;stroke:#f59e0b;stroke-width:2.2;stroke-dasharray:6 5}
.spaa{fill:color-mix(in srgb,#facc15 55%,transparent)}.spal{fill:none;stroke:#fde047;stroke-width:3;stroke-linecap:round}
.spbz{fill:color-mix(in srgb,#4ade80 9%,transparent)}.spbbg{fill:color-mix(in srgb,var(--card) 88%,transparent);stroke:color-mix(in srgb,#4ade80 45%,transparent)}.spbt{font-size:11px;font-weight:700;fill:#4ade80}.spnow{stroke:var(--primary-text-color);stroke-opacity:.5;stroke-dasharray:3 4}
.spdet{margin-top:6px;font-size:.85rem;padding:7px 10px;border-radius:10px;background:color-mix(in srgb,var(--primary-text-color) 4%,transparent)}
.spleg{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:.75rem;color:var(--mut);margin-top:8px}.spleg span{display:inline-flex;align-items:center;gap:5px}.spleg i{display:inline-block;width:16px;height:8px;border-radius:3px}
.spleg .lf{background:color-mix(in srgb,#f59e0b 30%,transparent);border:1.5px dashed #f59e0b}.spleg .la{background:#facc15}.spleg .lb{background:color-mix(in srgb,#4ade80 35%,transparent);border-top:2px solid #4ade80}.spleg .lp{background:linear-gradient(90deg,#4ade80,#facc15,#f87171)}
.sprec{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:10px;padding:10px 12px;border-radius:14px;border:1px solid color-mix(in srgb,#4ade80 35%,var(--line));background:color-mix(in srgb,#4ade80 6%,var(--card))}.sprec>svg{color:#4ade80}
.sprb{display:inline-flex;align-items:center;gap:6px;padding:4px 10px 4px 5px;border-radius:99px;border:1px solid var(--line);background:var(--card);color:var(--primary-text-color);font:inherit;font-size:.8rem;cursor:pointer}
.sphist{display:flex;gap:6px;align-items:flex-end}.sphc{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:3px}.sphb{display:flex;align-items:flex-end;gap:3px;height:120px}.sphb i{display:block;width:14px;border-radius:4px 4px 2px 2px;min-height:2px}
.sphb .f{background:color-mix(in srgb,#f59e0b 26%,transparent);border:1.5px dashed #f59e0b}.sphb .a{background:linear-gradient(180deg,#fde047,#f59e0b)}.sphc small{font-size:.72rem;color:var(--mut)}.sphc.now small{color:var(--primary-text-color);font-weight:700}.sphc em{font-style:normal;font-size:.72rem;font-weight:700}
.sphd{font-size:.68rem;font-weight:800;min-height:14px}.sphd.g{color:#4ade80}.sphd.y{color:#facc15}.sphd.r{color:#f87171}.sphc.now .sphb .a{opacity:.6}
@media (max-width:640px){.spban{min-height:0;padding:12px 14px}.spban .spbow{width:58%;opacity:.55}.spban .spt{display:none}.spbl .lbl{font-size:.78rem}.spsub{font-size:.78rem}.spch.nar .spax{font-size:12px}.spch.nar .spbt{font-size:11px}.spbl{max-width:72%}.spbl .big{font-size:2.1rem}.spbl .chips{display:none}.sptiles{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.sptile{padding:10px}.sptv{font-size:1.4rem}.spts{font-size:.72rem}.spti{width:48px;height:48px}.spti svg{width:38px;height:38px}.sptr{inset:-5px;width:58px;height:58px}.sphb i{width:9px}.sphb{height:90px}.sprec{font-size:.85rem}}
/* Hell: weiße Kacheln, kein Licht hinter dem Bild, Prognose-Fläche etwas kräftiger */
.spsrc{display:grid;grid-template-columns:1fr 1fr;gap:6px 14px;margin:8px 0;padding:10px 12px;border:1px solid var(--line);border-radius:12px;font-size:.82rem}.spsrc>div{display:flex;flex-direction:column}.spsrc b{font-weight:650}.spsrcw{grid-column:1/-1;flex-direction:row!important;align-items:center;gap:6px;color:#fbbf24}
.sphctl .seg button{white-space:nowrap}.sphctl{display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;margin-bottom:10px}
button.sphc{background:none;border:0;padding:4px 0;font:inherit;color:inherit;cursor:pointer;border-radius:10px}button.sphc.sel{background:color-mix(in srgb,var(--primary-text-color) 7%,transparent)}.sphist.dense{gap:2px}.sphist.dense .sphb i{width:6px}.sphist.dense .sphd{font-size:.6rem}
.spcal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;max-width:460px}.spcal>i{font-style:normal;font-size:.7rem;color:var(--mut);text-align:center}
.spcd{aspect-ratio:1.25;border-radius:9px;border:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font:inherit;cursor:pointer;color:#0b1220;line-height:1.05}.spcd b{font-size:.78rem}.spcd small{font-size:.66rem;font-weight:700}
.spx .spcd{color:#0b1220}.spcd.g{background:#4ade80}.spcd.y{background:#facc15}.spcd.r{background:#f87171}.spx .spcd.n{background:color-mix(in srgb,var(--primary-text-color) 18%,transparent);color:var(--primary-text-color)}.spx .spcd.e{background:color-mix(in srgb,var(--primary-text-color) 5%,transparent);color:var(--mut);cursor:default}.spcd.sel{outline:2px solid var(--primary-text-color);outline-offset:1px}
.spd1{width:100%;max-width:560px;height:auto;display:block;margin-top:6px}
.splow{display:flex;align-items:center;gap:14px;border:1px solid color-mix(in srgb,#f87171 50%,var(--line));background:color-mix(in srgb,#f87171 8%,var(--card))}.splow>div:nth-child(2){flex:1;display:flex;flex-direction:column;gap:3px}.splow b{color:#fca5a5}.splow span{font-size:.85rem}.splowb{display:flex;gap:6px;flex-wrap:wrap}.splowb .btn2{white-space:nowrap}
.sprb span{display:flex;flex-direction:column;line-height:1.1;text-align:left}.sprb small{font-size:.68rem;color:var(--mut)}
@media (max-width:640px){.splow{flex-wrap:wrap}.spcal{gap:3px}.spcd b{font-size:.7rem}}
.spx.lt .sptile{background:#fff;border-color:#e5e7eb;box-shadow:0 1px 2px rgba(0,0,0,.05)}.spx.lt .sptile.dim{background:#f8fafc}.spx.lt .spti::after{display:none}.spx.lt .spfa{fill:color-mix(in srgb,#f59e0b 28%,transparent)}.spx.lt .spaa{fill:color-mix(in srgb,#facc15 70%,transparent)}.spx.lt .spal{stroke:#eab308}.spx.lt .sprb{background:#fff}
/* Modul 16 v1.0 (Stufe 4): Anlagen einzeln, Startkachel, Tablet-Wand, Einrichtungs-Check, Sensoren */
.spsites{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:10px}
.spsite{display:grid;grid-template-columns:1fr auto;grid-template-areas:"n v" "s v" "b b";gap:2px 10px;padding:10px 12px;border-radius:14px;border:1px solid color-mix(in srgb,var(--c) 30%,var(--line));background:color-mix(in srgb,var(--c) 7%,transparent)}
.spsn{grid-area:n;display:flex;align-items:center;gap:7px;min-width:0}.spsn i{width:9px;height:9px;border-radius:50%;background:var(--c);flex:none}.spsn b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.spsn em{font-style:normal;font-size:.75rem;font-weight:700;padding:1px 7px;border-radius:99px;background:color-mix(in srgb,var(--c) 22%,transparent);color:var(--c);white-space:nowrap;flex:none}
.spsl{grid-area:s;width:100%;height:30px;display:block}.spsv{grid-area:v;display:flex;flex-direction:column;align-items:flex-end;justify-content:center;white-space:nowrap}.spsv b{font-size:1.25rem}.spsv small{font-size:.75rem;font-weight:600;opacity:.7}
.spsb{grid-area:b;height:5px;border-radius:9px;background:color-mix(in srgb,var(--primary-text-color) 9%,transparent);overflow:hidden;margin-top:6px}.spsb i{display:block;height:100%;background:var(--c);border-radius:9px}
.hzt .hti.hsp{background:color-mix(in srgb,#f59e0b 16%,transparent);color:#f59e0b}
.spwall{display:grid;grid-template-columns:minmax(260px,.9fr) 1.6fr;gap:14px;align-items:stretch}.spwall .spcard{margin:0}
.spwn{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-content:start}
.spwb{display:flex;flex-direction:column;gap:2px;padding:14px 16px;border-radius:18px;border:1px solid color-mix(in srgb,var(--c) 35%,var(--line));background:linear-gradient(160deg,color-mix(in srgb,var(--c) 16%,transparent),transparent 70%)}
.spwb span{font-size:.95rem;opacity:.8}.spwb b{font-size:2.6rem;line-height:1.05;color:var(--c)}.spwb b small{font-size:1rem;margin-left:4px;color:var(--primary-text-color);opacity:.7}.spwb em{font-style:normal;font-size:.9rem;opacity:.85;min-height:1.2em}
.spwb .g{color:#4ade80}.spwb .w{color:#f59e0b}.spx.lt .spwb b{filter:brightness(.8)}
.sptm .spdet,.sptm .spleg{display:none}.sptm .sprec{margin-top:8px}.sptm .sprec>*:nth-child(n+5){display:none}
@media (max-width:820px){.spwall{grid-template-columns:1fr}}
.spck-s{margin-left:auto;font-size:.78rem;font-weight:700;padding:2px 9px;border-radius:99px}.spck-s.g{background:color-mix(in srgb,#22c55e 18%,transparent);color:#22c55e}.spck-s.w{background:color-mix(in srgb,#f59e0b 18%,transparent);color:#f59e0b}
.spck{display:grid;gap:6px;margin:6px 0 4px}.spck>div{display:grid;grid-template-columns:24px auto 1fr;align-items:center;gap:8px;padding:7px 10px;border-radius:11px;background:color-mix(in srgb,var(--primary-text-color) 4%,transparent)}
.spck span{width:22px;height:22px;border-radius:50%;display:grid;place-items:center}.spck .ok span{background:color-mix(in srgb,#22c55e 20%,transparent);color:#22c55e}.spck .wa span{background:color-mix(in srgb,#f59e0b 20%,transparent);color:#f59e0b}.spck .no span{background:color-mix(in srgb,#ef4444 20%,transparent);color:#ef4444}
.spck b{font-size:.9rem;white-space:nowrap}.spck small{font-size:.8rem;opacity:.75;text-align:right;overflow:hidden;text-overflow:ellipsis}
@media (max-width:520px){.spck>div{grid-template-columns:24px 1fr}.spck small{grid-column:2;text-align:left}}
.spsens{display:grid;gap:6px}.spsens button{display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;font:inherit;color:inherit;padding:8px 12px;border-radius:11px;border:1px solid var(--line);background:transparent;cursor:pointer}
.spsens button:hover{background:color-mix(in srgb,var(--primary-text-color) 5%,transparent)}.spsens span{display:flex;flex-direction:column;min-width:0}.spsens small{font-size:.72rem;opacity:.6;overflow:hidden;text-overflow:ellipsis}.spsens b{white-space:nowrap;color:#f59e0b}
/* Modul 16 v1.0 Build 2: Anlagen wählen, doppelt gezählt */
.spdup{border-color:color-mix(in srgb,#f59e0b 55%,var(--line));background:color-mix(in srgb,#f59e0b 8%,var(--card))}.spdup b{color:#fbbf24!important}.spdup>svg{color:#f59e0b;flex:none}
.spdupw{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:12px;border:1px solid color-mix(in srgb,#f59e0b 50%,var(--line));background:color-mix(in srgb,#f59e0b 9%,transparent);font-size:.84rem;margin:4px 0 6px}.spdupw svg{color:#f59e0b;flex:none;margin-top:2px}.spdupw b{display:block;color:#fbbf24}
.spsvc{margin-top:8px}.spsvh{display:flex;align-items:baseline;justify-content:space-between;gap:8px;font-weight:700;font-size:.86rem;margin:0 2px 4px}
.spsel{display:grid;grid-template-columns:22px 1fr auto;align-items:center;gap:10px;width:100%;text-align:left;font:inherit;color:inherit;padding:8px 10px;margin-top:4px;border-radius:11px;border:1px solid var(--line);background:transparent;cursor:pointer}
.spsel i{width:20px;height:20px;border-radius:6px;border:1.5px solid var(--line);display:grid;place-items:center}.spsel.on{border-color:color-mix(in srgb,var(--teal) 55%,var(--line));background:color-mix(in srgb,var(--teal) 8%,transparent)}.spsel.on i{background:var(--teal);border-color:var(--teal);color:#06201c}
.spsel span{font-size:.78rem;color:var(--mut);white-space:nowrap}.spsel:disabled{cursor:default;opacity:.8}
.spsvcl{font-size:.68rem;font-weight:700;padding:1px 7px;border-radius:99px;border:1px solid var(--line);color:var(--mut);margin-top:3px}
@media (max-width:520px){.spsel{grid-template-columns:22px 1fr}.spsel span{grid-column:2}}
@media (prefers-reduced-motion:reduce){.efha,.efpr circle{transition:none}.efboard .efgl{animation:none}}
.lixroom.on{border-color:color-mix(in srgb,#fbbf24 55%,transparent);background:color-mix(in srgb,#fbbf24 7%,var(--card))}
.lixhd{display:flex;align-items:center;gap:10px}.lixico{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:color-mix(in srgb,var(--primary-text-color) 8%,transparent);color:var(--mut);flex:none}
.lixroom.on .lixico{background:color-mix(in srgb,#fbbf24 22%,transparent);color:#fbbf24}
.lixt{flex:1;min-width:0}.lixt b{display:block}.lixt small{display:block;color:var(--mut);font-size:.78rem}
.lixrng{display:flex;align-items:center;gap:10px;margin:12px 0 4px;color:var(--mut)}.lixrng input{flex:1;min-width:0;accent-color:#fbbf24;height:28px}.lixrng b{min-width:44px;text-align:right;color:var(--primary-text-color);font-size:.85rem}
.lixl{display:grid;gap:2px;margin-top:8px}.lixlamp{display:flex;align-items:center;gap:8px;padding:4px 0}.lixlamp.un{opacity:.5}
.lixnm{flex:1;min-width:0;display:flex;align-items:center;gap:10px;text-align:left;background:none;border:0;color:var(--primary-text-color);font:inherit;padding:8px 2px;cursor:pointer;min-height:40px}.lixnm svg{flex:none;color:var(--mut)}.lixlamp.on .lixnm svg{color:#fbbf24}.lixnm small{display:block;color:var(--mut);font-size:.74rem}
.lixscn .lixun{border-style:dashed;color:var(--mut)}.lixscn .lixun small{display:none}.lixtiles{grid-template-columns:repeat(auto-fill,minmax(130px,1fr))}
.lixhint{margin-top:12px;align-items:center}.lixhint .lnk{margin-left:auto;flex:none}
.lixsw{display:flex;flex-wrap:wrap;gap:12px;margin:8px 0}.lixc{width:36px;height:36px;border-radius:50%;border:2px solid rgba(255,255,255,.25);cursor:pointer;padding:0}.lixc.on{border-color:#fff;box-shadow:0 0 0 2px var(--teal,#2dd4bf)}

.hzbubs{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:2px 0;-webkit-overflow-scrolling:touch}.hzbubs::-webkit-scrollbar{display:none}
.hzb{flex:none;display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);background:var(--card);color:var(--primary-text-color);border-radius:999px;padding:5px 14px 5px 5px;font:inherit;cursor:pointer;text-align:left}
.hzb:hover{border-color:color-mix(in srgb,var(--teal) 60%,var(--line))}.hzb:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.hzb i{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--teal) 16%,transparent);color:var(--teal);flex:none}
.hzb b{display:block;font-size:.88rem;line-height:1.15;white-space:nowrap}.hzb small{display:block;font-size:.68rem;color:var(--mut);white-space:nowrap}
.hzb.ok i{background:color-mix(in srgb,var(--green) 18%,transparent);color:var(--green)}
.hzb.wa{border-color:color-mix(in srgb,var(--amber) 60%,transparent);background:color-mix(in srgb,var(--amber) 9%,var(--card))}.hzb.wa i{background:color-mix(in srgb,var(--amber) 20%,transparent);color:var(--amber)}
.hzb.bad{border-color:#f87171;background:color-mix(in srgb,#f87171 12%,var(--card))}.hzb.bad i{background:color-mix(in srgb,#f87171 22%,transparent);color:#f87171}
.hzbe{border:2px dashed var(--line);border-radius:20px;padding:8px 10px 10px}
.hzhead{font-size:1.4rem;font-weight:700;color:var(--amber);line-height:1.2}.hzhead.ok{color:var(--green)}.hzhead.bad{color:#f87171}
.hzsub{color:var(--mut);font-size:.92rem;margin:2px 0 14px}
.hzgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,1fr));gap:12px}
.hzt{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px 12px;border-radius:16px;border:1px solid var(--line);background:rgba(127,127,127,.07);color:var(--primary-text-color);font:inherit;text-align:center;cursor:pointer}
.hzt:hover{border-color:color-mix(in srgb,var(--teal) 60%,var(--line))}.hzt:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.hzt .hti{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--teal) 16%,transparent);color:var(--teal)}
.hzt b{font-size:.95rem}.hzt small{font-size:.8rem;font-weight:700;color:var(--green)}
.hzt.wa{border-color:color-mix(in srgb,var(--amber) 70%,var(--line));background:color-mix(in srgb,var(--amber) 11%,transparent)}.hzt.wa small{color:var(--amber)}.hzt.wa .hti{background:color-mix(in srgb,var(--amber) 20%,transparent);color:var(--amber)}
.hzt.mut small{color:var(--mut)}.hzt.sel{border-color:var(--teal)}.hzt.sel small{color:var(--teal)}
.hzl{display:flex;flex-direction:column}
.hzr{display:flex;align-items:center;gap:14px;padding:10px 0;border:0;border-top:1px solid var(--line);background:none;color:var(--primary-text-color);font:inherit;text-align:left;width:100%}.hzl>.hzr:first-child{border-top:0;padding-top:2px}
button.hzr{cursor:pointer}
.hzr .hzri{width:44px;height:44px;border-radius:14px;background:rgba(127,127,127,.12);display:grid;place-items:center;flex:none;color:var(--mut)}.hzr.wa .hri{background:color-mix(in srgb,var(--amber) 16%,transparent);color:var(--amber)}.hzr.bad .hri{background:color-mix(in srgb,#f87171 18%,transparent);color:#f87171}
.hzr .hzrx{flex:1;min-width:0}.hzr .hzrx b{display:block;font-size:.98rem}.hzr .hzrx small{display:block;color:var(--mut);font-size:.84rem}
.hzr .hzrr{font-size:.85rem;color:var(--mut);text-align:right;flex:none}.hzr .hzrr.wa{color:var(--amber);font-weight:700}.hzr .hzrr.ok{color:var(--green);font-weight:700}.hzr .hzrr.bad{color:#f87171;font-weight:700}
.hzav{width:44px;height:44px;border-radius:50%;background:var(--c,#14b8a6) center/cover;display:grid;place-items:center;font-weight:700;color:#fff;position:relative;flex:none}
.hzav u{position:absolute;right:-1px;bottom:-1px;width:13px;height:13px;border-radius:50%;border:2px solid var(--card);background:#6b7280}.hzav.home u{background:var(--green)}
.hzrt{margin-left:auto;font-size:.78rem;font-weight:500;color:var(--mut);max-width:50%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hzwx{display:flex;align-items:center;gap:14px}.hzwi{color:var(--amber);flex:none}.hzbig{font-size:2.2rem;font-weight:700;line-height:1}.hzbig small{font-size:1rem;color:var(--mut);font-weight:500}
.hzfc{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}.hzfc div{background:rgba(127,127,127,.1);border-radius:12px;padding:8px 4px;text-align:center;color:var(--mut);display:flex;flex-direction:column;align-items:center;gap:2px}.hzfc b{color:var(--primary-text-color);font-size:1rem}.hzfc small{font-size:.74rem}
.hzgo{cursor:pointer}.hzflash{animation:hzf 1.2s}@keyframes hzf{0%,100%{box-shadow:none}30%{box-shadow:0 0 0 3px var(--teal)}}
.hzo{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--line);border-radius:14px;margin-bottom:7px;background:rgba(127,127,127,.05)}.hzo.on{border-color:color-mix(in srgb,var(--teal) 45%,var(--line))}
.hzck{width:24px;height:24px;border-radius:8px;border:2px solid var(--line);background:transparent;display:grid;place-items:center;cursor:pointer;color:var(--on-acc);padding:0;flex:none}.hzck.on{background:var(--teal);border-color:var(--teal)}
.hzoi{width:34px;height:34px;border-radius:10px;background:color-mix(in srgb,var(--teal) 14%,transparent);color:var(--teal);display:grid;place-items:center;flex:none}
.hzot{flex:1;min-width:0}.hzot b{display:block;font-size:.92rem}.hzot small{display:block;font-size:.76rem;color:var(--mut)}
.hzo .ibtn.dn svg{transform:rotate(180deg)}.gschs{display:inline-flex;gap:6px;flex-wrap:wrap}
@media(max-width:520px){.hzgrid{grid-template-columns:repeat(2,1fr)}.hzrt{max-width:42%}}
/* Startseite · Neue Optik Stufe 1: Zustandsfarben wie Modul 1 */
:host{--z-ok:#2dd4bf;--z-info:#60a5fa;--z-act:#fb923c;--z-hint:#f59e0b;--z-warn:#f87171;--z-night:#a78bfa;--z-off:#94a3b8}
:host([style*="color-scheme: light"]){--z-ok:#0d9488;--z-info:#2563eb;--z-act:#ea580c;--z-hint:#b45309;--z-warn:#dc2626;--z-night:#7c3aed;--z-off:#64748b}
.z-ok{--zc:var(--z-ok)}.z-info{--zc:var(--z-info)}.z-act{--zc:var(--z-act)}.z-hint{--zc:var(--z-hint)}.z-warn{--zc:var(--z-warn)}.z-night{--zc:var(--z-night)}.z-off{--zc:var(--z-off)}
/* Gesamt-Ampel */
.hzamp{display:flex;align-items:center;gap:14px;padding:14px 18px;margin-bottom:14px;position:relative;overflow:hidden;background:linear-gradient(100deg,color-mix(in srgb,var(--zc) 13%,var(--card)) 0%,var(--card) 62%)}
.hzamp[role=button]{cursor:pointer}.hzamp:focus-visible{outline:2px solid var(--zc);outline-offset:2px}
.hzamp::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--zc);opacity:.85}
.hzal{display:flex;flex-direction:column;gap:4px;padding:6px 5px;border-radius:12px;background:#11161c;flex:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}
.hzal i{width:10px;height:10px;border-radius:50%;background:#2a323b;display:block}
.hzamp.z-warn .hzal .r{background:var(--z-warn);box-shadow:0 0 10px var(--z-warn)}.hzamp.z-hint .hzal .y{background:var(--z-hint);box-shadow:0 0 10px var(--z-hint)}.hzamp.z-ok .hzal .g{background:var(--z-ok);box-shadow:0 0 10px var(--z-ok)}
.hzab{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;flex:none;color:#fff;background:radial-gradient(circle at 35% 30%,color-mix(in srgb,var(--zc) 70%,#fff),var(--zc) 60%,color-mix(in srgb,var(--zc) 70%,#000));box-shadow:0 0 0 5px color-mix(in srgb,var(--zc) 18%,transparent),0 6px 16px -6px var(--zc)}
.hzab b{font-size:1.5rem;font-weight:800;line-height:1}
.hzax{flex:1;min-width:0}.hzax b{display:block;font-size:1.3rem;line-height:1.2;color:var(--zc)}.hzax small{display:block;color:var(--mut);font-size:.88rem;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hzago{display:inline-flex;align-items:center;gap:2px;font-size:.84rem;font-weight:600;color:var(--zc);flex:none}.hzago svg{transform:rotate(-90deg)}
.hzamp.z-warn .hzab{animation:hzpl 2.4s ease-in-out infinite}@keyframes hzpl{50%{box-shadow:0 0 0 9px color-mix(in srgb,var(--zc) 10%,transparent),0 6px 16px -6px var(--zc)}}
:host([style*="color-scheme: light"]) .hzal{background:#1f2937}
/* Kacheln mit HD-Symbol und Zustandspunkt */
.hzt.n{position:relative;background:color-mix(in srgb,var(--zc) 5%,rgba(127,127,127,.06));border-color:color-mix(in srgb,var(--zc) 22%,var(--line))}
.hzt.n:hover{border-color:color-mix(in srgb,var(--zc) 55%,var(--line))}.hzt.n:focus-visible{outline-color:var(--zc)}
.hzt.n .hti{width:60px;height:60px;border-radius:18px;background:radial-gradient(circle at 50% 42%,color-mix(in srgb,var(--zc) 22%,transparent),transparent 70%);color:var(--zc)}
.hzt.n .hti.hd{background:radial-gradient(circle at 50% 46%,color-mix(in srgb,var(--zc) 20%,transparent),transparent 68%)}
.hzt.n small{color:var(--zc)}.hzt.n.z-ok small{color:var(--mut);font-weight:600}
.hzt.n .hzdot{position:absolute;top:10px;right:10px;width:9px;height:9px;border-radius:50%;background:var(--zc);box-shadow:0 0 0 3px color-mix(in srgb,var(--zc) 20%,transparent)}
.hzt.n.z-warn .hzdot{animation:hzdp 2s ease-in-out infinite}@keyframes hzdp{50%{box-shadow:0 0 0 6px color-mix(in srgb,var(--zc) 8%,transparent)}}
.hzt.n.z-off .hti{filter:grayscale(1);opacity:.55}.hzt.n.z-off .hzdot{opacity:.6}
.hzt.n .hti.hsp{width:56px;height:56px}
:host([style*="color-scheme: light"]) .hzt.n{background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.05)}
@media (prefers-reduced-motion:reduce){.hzamp.z-warn .hzab,.hzt.n.z-warn .hzdot{animation:none}}
/* Hinweise in Zustandsfarbe */
.hzr.n .hzri{background:color-mix(in srgb,var(--zc) 15%,transparent);color:var(--zc)}.hzr.n .hzrr{color:var(--zc);font-weight:700}
.hzr.n{position:relative}.hzr.n::before{content:"";position:absolute;left:-18px;top:14px;bottom:14px;width:3px;border-radius:3px;background:var(--zc);opacity:.8}.hzl>.hzr.n:first-child::before{top:6px}
/* Runde Bubbles mit Ring */
.hzbubs.n{gap:14px;padding:4px 2px 2px}
.hzbn{flex:none;display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:none;padding:0;cursor:pointer;color:var(--primary-text-color);width:80px}
.hzbn:focus-visible{outline:none}.hzbn:focus-visible .hzbr{outline:2px solid var(--zc);outline-offset:2px}
.hzbr{position:relative;width:76px;height:76px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 35%,color-mix(in srgb,var(--zc) 12%,var(--card)),var(--card) 70%)}
.hzbr svg{position:absolute;inset:0;width:100%;height:100%}.hzbr .bg{fill:none;stroke:var(--line);stroke-width:4}.hzbr .fg{fill:none;stroke:var(--zc);stroke-width:4;stroke-linecap:round}
.hzbp{position:relative;line-height:0;margin-top:-2px}.hzbp svg.gx{position:static;width:26px;height:26px}
.hzbr b{position:relative;font-size:.92rem;line-height:1.1;white-space:nowrap;margin-top:1px}.hzbr b.lg{font-size:.74rem}
.hzbn small{font-size:.72rem;color:var(--mut);white-space:nowrap;max-width:80px;overflow:hidden;text-overflow:ellipsis}
.hzbn:hover .hzbr .bg{stroke:color-mix(in srgb,var(--zc) 35%,var(--line))}
:host([style*="color-scheme: light"]) .hzbr{background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.tmbody .hzbubs.n{gap:18px}
/* Startseite · Stufe 2: Kacheln 2.0 */
.z-info{--zc:var(--z-info)}
.hzkgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}.hzkgrid.sz-s{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}.hzkgrid.sz-l{grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
.hzk{position:relative;display:flex;flex-direction:column;gap:8px;padding:14px 14px 12px;border-radius:18px;border:1px solid color-mix(in srgb,var(--zc) 20%,var(--line));background:color-mix(in srgb,var(--zc) 5%,rgba(127,127,127,.06));color:var(--primary-text-color);font:inherit;text-align:left;cursor:pointer;min-width:0;transition:border-color .6s,background-color .6s}
.hzk:hover{border-color:color-mix(in srgb,var(--zc) 55%,var(--line))}.hzk:focus-visible{outline:2px solid var(--zc);outline-offset:2px}
.hzk .hzdot{position:absolute;top:12px;right:12px;width:9px;height:9px;border-radius:50%;background:var(--zc);box-shadow:0 0 0 3px color-mix(in srgb,var(--zc) 20%,transparent)}
.hzk.z-warn .hzdot{animation:hzdp 2s ease-in-out infinite}
.hzkh{display:flex;align-items:center;gap:9px;min-width:0;padding-right:20px}
.hzki{width:40px;height:40px;border-radius:13px;display:grid;place-items:center;flex:none;background:radial-gradient(circle at 50% 45%,color-mix(in srgb,var(--zc) 22%,transparent),transparent 72%);color:var(--zc)}
.hzkn{min-width:0}.hzkn b{font-size:.92rem;line-height:1.2;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:break-word;hyphens:auto;-webkit-hyphens:auto}.hzkn small{display:flex;flex-wrap:wrap;gap:2px 6px;align-items:center;font-size:.72rem;color:var(--mut);white-space:nowrap}
.hzkst{white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis;font-style:normal;font-size:.6rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:1px 6px;border-radius:6px;background:color-mix(in srgb,var(--amber) 18%,transparent);color:var(--amber)}
.hzkm{display:flex;align-items:flex-end;justify-content:space-between;gap:8px;min-height:46px}
.hzkv{font-size:2.1rem;font-weight:800;line-height:1;letter-spacing:-.02em;font-variant-numeric:tabular-nums;color:var(--primary-text-color);white-space:nowrap}
.hzkv small{font-size:.9rem;font-weight:600;color:var(--mut);margin-left:4px;letter-spacing:0}
.hzkv.tx{font-size:1.55rem}.hzkv.tx.sm{font-size:1.02rem;font-weight:700;white-space:normal;line-height:1.25}
.hzks{font-size:.82rem;color:var(--mut);line-height:1.3;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.hzk:not(.z-ok):not(.z-off) .hzks{color:var(--zc);font-weight:600}
.hzkg{flex:none;line-height:0}.hzkg.l{width:100%}.hzkg.l svg{width:100%;height:44px}
.hzkr .bg{fill:none;stroke:var(--line);stroke-width:5}.hzkr .fg{fill:none;stroke:var(--zc);stroke-width:5;stroke-linecap:round;transition:stroke-dasharray .8s}
.hzksp{width:78px;height:32px;overflow:visible}.hzksp .l{fill:none;stroke:var(--zc);stroke-width:1.8;stroke-linejoin:round;vector-effect:non-scaling-stroke}.hzksp .a{fill:color-mix(in srgb,var(--zc) 14%,transparent)}.hzksp .d{fill:var(--zc)}
.hzk.z-off{background:rgba(127,127,127,.05);border-color:var(--line)}.hzk.z-off .hzki{filter:grayscale(1);opacity:.5}.hzk.z-off .hzkv{color:var(--mut);font-size:1.4rem}.hzk.z-off .hzdot{opacity:.5}
.hzk.sz-s{gap:6px;padding:12px}.hzk.sz-s .hzki{width:32px;height:32px}.hzk.sz-s .hzkm{min-height:0}.hzk.sz-s .hzkv{font-size:1.6rem}.hzk.sz-s .hzks{-webkit-line-clamp:1}
:host([style*="color-scheme: light"]) .hzk{background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.05)}:host([style*="color-scheme: light"]) .hzk.z-off{background:#f8fafc}
.tmgrid .hzk{min-height:170px;padding:18px;border-radius:24px}.tmgrid .hzk .hzkv{font-size:2.8rem}.tmgrid .hzk .hzkv.tx{font-size:1.9rem}.hzkv{min-width:0;overflow:hidden;text-overflow:ellipsis}.tmgrid .hzk .hzki{width:52px;height:52px}.tmgrid .hzk .hzkn b{font-size:1.1rem}.tmgrid .hzk .hzks{font-size:.98rem}
/* Startseite · Stufe 3: Haus-Kopf */
.hzhd{position:relative;padding:0;overflow:hidden;min-height:230px;margin-bottom:14px;border:1px solid color-mix(in srgb,var(--zc) 30%,var(--line))}
.hzhs{position:absolute;inset:0;display:flex;justify-content:flex-end}.hzhs svg{height:100%;width:auto;aspect-ratio:260/160;display:block;-webkit-mask-image:linear-gradient(90deg,transparent,#000 22%);mask-image:linear-gradient(90deg,transparent,#000 22%)}
.hzho{position:relative;z-index:1;display:flex;flex-direction:column;gap:10px;padding:18px 20px;max-width:min(560px,62%);min-height:230px;justify-content:center;background:linear-gradient(90deg,rgba(8,12,18,.78) 0%,rgba(8,12,18,.55) 70%,transparent);color:#f8fafc}
.hzhg b{display:block;font-size:1.45rem;line-height:1.15}.hzhg small{display:block;font-size:.84rem;opacity:.8}
.hzha{display:flex;align-items:center;gap:12px;padding:8px 12px 8px 8px;border-radius:16px;background:rgba(255,255,255,.08);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:1px solid color-mix(in srgb,var(--zc) 45%,rgba(255,255,255,.12));align-self:flex-start;max-width:100%}
.hzha[role=button]{cursor:pointer}.hzha .hzab{width:40px;height:40px}.hzha .hzab b{font-size:1.3rem}.hzha .hzax b{font-size:1.15rem;color:color-mix(in srgb,var(--zc) 70%,#fff)}.hzha .hzax small{color:rgba(248,250,252,.78)}.hzha .hzago{color:#fff}
.hzhd.z-warn .hzab{animation:hzpl 2.4s ease-in-out infinite}
.hzhc{display:flex;flex-wrap:wrap;gap:6px}.hzhc span{display:inline-flex;align-items:center;gap:5px;padding:3px 10px 3px 4px;border-radius:999px;background:rgba(255,255,255,.1);font-size:.8rem;white-space:nowrap}
.hzhw{font-size:.82rem;opacity:.85}
.hzsc .hzpvg,.hs2:not([data-an="aus"]) .hzpvg{animation:hzpv 3.2s ease-in-out infinite}@keyframes hzpv{0%,100%{opacity:0}50%{opacity:.35}}
@media (prefers-reduced-motion:reduce){.hs2 .hzpvg,.hzsc .hzpvg,.hzhd.z-warn .hzab{animation:none}}
@media(max-width:520px){.hzhd{min-height:0;display:flex;flex-direction:column}.hzhs{position:relative;height:150px;justify-content:center}.hzhs svg{width:100%;height:100%;aspect-ratio:auto;-webkit-mask-image:none;mask-image:none}.hzho{max-width:none;min-height:0;background:var(--card);color:var(--primary-text-color);padding:12px 14px 14px;gap:8px}
  .hzhg b{font-size:1.2rem}.hzhg small{opacity:1;color:var(--mut)}
  .hzha{background:color-mix(in srgb,var(--zc) 10%,transparent);border-color:color-mix(in srgb,var(--zc) 35%,var(--line));align-self:stretch}.hzha .hzax b{color:var(--zc)}.hzha .hzax small{color:var(--mut)}.hzha .hzago{color:var(--zc)}
  .hzhc span{background:rgba(127,127,127,.12)}.hzhw{color:var(--mut)}}
/* D1 Wetter */
.hzwx2{border-color:color-mix(in srgb,var(--zc) 25%,var(--line))}.hzwx2.z-ok{border-color:var(--line)}
.hzwb{position:relative;border-radius:16px;overflow:hidden;height:118px}.hzws{position:absolute;inset:0}.hzws svg{width:100%;height:100%;display:block}
.hzwv{position:relative;z-index:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:12px 14px;background:linear-gradient(90deg,rgba(8,12,18,.7),rgba(8,12,18,.15) 70%,transparent);color:#fff}
.hzwv b{font-size:2.3rem;line-height:1;font-weight:800}.hzwv b small{font-size:1rem;font-weight:600;opacity:.8}.hzwv span{font-size:.84rem;opacity:.88;margin-top:4px}
.hzwn{display:flex;align-items:center;gap:10px;margin-top:10px;padding:9px 12px;border-radius:14px;background:color-mix(in srgb,var(--zc) 12%,transparent);border-left:3px solid var(--zc)}.hzwn b{display:block;color:var(--zc);font-size:.95rem}.hzwn small{display:block;color:var(--mut);font-size:.8rem}
.hzwd{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}.hzwd div{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;border-radius:12px;background:rgba(127,127,127,.08);color:var(--mut)}
.hzwd small{font-size:.74rem}.hzwd svg{color:var(--amber)}.hzwd b{color:var(--primary-text-color);font-size:1rem}.hzwd em{font-style:normal;font-size:.76rem}
.hzwl{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:.86rem}
/* D2 Personen */
.hzps{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:14px;margin-bottom:8px;background:color-mix(in srgb,var(--z-info) 12%,transparent);border-left:3px solid var(--z-info)}.hzps b{display:block;color:var(--z-info)}.hzps small{display:block;color:var(--mut);font-size:.8rem}
.hzpl{display:flex;flex-direction:column}.hzpr{display:flex;align-items:center;gap:14px;padding:9px 0;border-top:1px solid var(--line)}.hzpl>.hzpr:first-child{border-top:0}
.hzpa{width:46px;height:46px;border-radius:50%;flex:none;display:grid;place-items:center;font-weight:700;color:#fff;background:var(--c,#14b8a6) center/cover;box-shadow:0 0 0 3px var(--card),0 0 0 6px var(--zc)}
.hzpr.z-off .hzpa{filter:grayscale(1);opacity:.6}.hzpr .hzrx{flex:1;min-width:0}.hzpr .hzrx b{display:block;font-size:1rem}.hzpr .hzrx small{display:block;color:var(--mut);font-size:.84rem}
.hzpp{font-style:normal;font-size:.8rem;font-weight:700;color:var(--zc)}
.hzpk{display:flex;gap:14px;margin-top:8px;font-size:.74rem;color:var(--mut)}.hzpk i{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--zc);margin-right:5px}
/* D3 Alarm */
.hzal2{border-color:color-mix(in srgb,var(--zc) 25%,var(--line))}.hzal2.z-off,.hzal2.z-ok{border-color:var(--line)}
.hzam2{display:flex;align-items:center;gap:14px}.hzam2 b{display:block;font-size:1.25rem;color:var(--zc)}.hzal2.z-off .hzam2 b{color:var(--primary-text-color)}.hzam2 small{display:block;color:var(--mut);font-size:.86rem}
.hzhl{margin-top:14px;font-size:.74rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--mut)}.hzhl small{display:block;text-transform:none;letter-spacing:0;font-weight:500}
.hzhb{display:flex;gap:8px;margin-top:8px}
.hzhold{position:relative;overflow:hidden;flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border-radius:14px;border:1px solid var(--line);background:rgba(127,127,127,.08);cursor:pointer;font-weight:700;touch-action:none;-webkit-user-select:none;user-select:none}
.hzhold i{position:absolute;left:0;top:0;bottom:0;width:0;background:color-mix(in srgb,var(--z-warn) 28%,transparent)}.hzhold span,.hzhold svg{position:relative}
.hzhold.on i{width:100%;transition:width 1.2s linear}
/* F Tablet */
.tmamp{display:flex;align-items:center;gap:18px;padding:16px 22px;border-radius:24px;margin-bottom:16px;background:linear-gradient(100deg,color-mix(in srgb,var(--zc) 16%,var(--card)),var(--card) 70%);border:1px solid color-mix(in srgb,var(--zc) 30%,var(--line))}
.tmamp .hzab{width:64px;height:64px}.tmamp .hzab b{font-size:2rem}.tmamp b{display:block;font-size:2rem;color:var(--zc);line-height:1.1}.tmamp small{display:block;font-size:1.05rem;color:var(--mut)}
.tmrest.hzst{position:fixed;inset:0;overflow:hidden;justify-content:flex-start;padding-top:9vh}.tmrest.hzst>*:not(.tmrw):not(.tmsc){position:relative;z-index:1}.tmrest.hzst>.tmrw{z-index:1}.tmrest.hzst>.tmsc{position:absolute;left:0;right:0;bottom:0;height:52%;z-index:0;opacity:.6;-webkit-mask-image:linear-gradient(180deg,transparent,#000 35%);mask-image:linear-gradient(180deg,transparent,#000 35%)}.tmsc svg{width:100%;height:100%}.tmrest.hzst .tmsa{order:2}
.tmsa{display:inline-flex;align-items:center;gap:10px;font-size:1.4rem;font-weight:700;color:var(--zc);margin-bottom:8px}.tmsa i{width:16px;height:16px;border-radius:50%;background:var(--zc);box-shadow:0 0 14px var(--zc)}
/* Startseite · Stufe 4: Bewegung, Schnellaktionen, Vorlagen, Leerzustand */
[data-hzan=aus] *,[data-hzan=aus] *::before,[data-hzan=aus] *::after{animation:none!important;transition:none!important}
[data-hzan=dezent] .hzsc *{animation:none!important}
[data-hzan=voll] .hzsc .hscl{animation:hsDrift 14s ease-in-out infinite alternate}[data-hzan=voll] .hzsc .hsrn,[data-hzan=voll] .hzsc .hssn{animation:hsFall 2.6s linear infinite}
[data-hzan=voll] .hzsc .hssm circle{transform-box:fill-box;animation:hsSm 3.6s linear infinite}[data-hzan=voll] .hzsc .hssm1{animation-delay:-1.8s}
[data-hzan=voll] .hzsc .hsaw{transform-box:fill-box;animation:rkAir 3s ease-out infinite}
.hzfill{animation:hzfl .9s cubic-bezier(.2,.7,.2,1)}@keyframes hzfl{from{stroke-dasharray:0 999}}
@media (prefers-reduced-motion:reduce){.hzpg *,.tmsc *{animation:none!important;transition:none!important}}
.hzpg{min-width:0;max-width:100%}.hzpg>*{min-width:0}
.hzqa{max-width:100%;display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin:0 0 12px;padding:2px}.hzqa::-webkit-scrollbar{display:none}
.hzqb{flex:none;display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--primary-text-color);font-weight:600;font-size:.86rem;cursor:pointer}
.hzqb svg{color:var(--teal)}.hzqb:hover{border-color:color-mix(in srgb,var(--teal) 55%,var(--line))}.hzqb.add{border-style:dashed;color:var(--mut)}
.hzqa.tm{gap:12px;margin-bottom:16px}.hzqa.tm .hzqb{padding:14px 22px;font-size:1.05rem}
.hzemp{display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:14px;border:1px dashed var(--line);border-radius:18px}.hzemp>div{flex:1;min-width:180px}.hzemp b{display:block;font-size:1.05rem}.hzemp small{display:block;color:var(--mut);font-size:.86rem}
.hzpre{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}
.hzpc{display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:14px;border:1px solid var(--line);background:rgba(127,127,127,.05);text-align:left;cursor:pointer;color:var(--primary-text-color)}
.hzpc b{font-size:.95rem}.hzpc small{font-size:.74rem;color:var(--mut);line-height:1.3}.hzpc.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 10%,transparent)}
@media(max-width:520px){.hzpre{grid-template-columns:1fr}}
/* Hinweise-Zentrale */
.hzzc{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:11px;background:rgba(127,127,127,.18);font-size:.76rem;font-weight:700;margin-left:2px}
.hzzw{font-size:.72rem;font-weight:700;padding:2px 9px;border-radius:10px;background:color-mix(in srgb,var(--zc) 16%,transparent);color:var(--zc)}
.hzzl{display:flex;flex-direction:column;gap:8px}
.hzz{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:14px;background:color-mix(in srgb,var(--zc) 6%,rgba(127,127,127,.05));border-left:3px solid var(--zc)}
.hzzi{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;flex:none;background:color-mix(in srgb,var(--zc) 14%,transparent);color:var(--zc)}
.hzzx{flex:1;min-width:0}.hzzx b{display:block;font-size:.95rem;line-height:1.25}.hzzx small{display:block;font-size:.78rem;color:var(--mut);margin-top:1px}
.hzzp{display:inline-block;font-style:normal;font-size:.64rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--zc);margin-top:3px}
.hzzbs{display:flex;gap:6px;flex:none}
.hzzb{border:1px solid var(--line);background:var(--card);border-radius:10px;padding:6px 11px;font-size:.8rem;font-weight:600;cursor:pointer;color:var(--primary-text-color)}.hzzb:hover{border-color:var(--zc)}.hzzb.q{color:var(--mut)}
.hzzmore{margin-top:8px;width:100%;border:1px dashed var(--line);background:none;border-radius:12px;padding:8px;font-size:.85rem;font-weight:600;color:var(--mut);cursor:pointer}.hzzmore:hover{color:var(--primary-text-color)}
.hzzok{display:flex;align-items:center;gap:12px;padding:6px 2px}.hzzok b{display:block;color:var(--z-ok)}.hzzok small{display:block;color:var(--mut);font-size:.84rem}
.hzzf{display:flex;align-items:center;gap:6px;margin-top:10px;font-size:.8rem;color:var(--mut)}.hzzf .lnk{margin-left:auto}
.hzlo{display:flex;align-items:center;gap:10px;width:100%;padding:12px 14px;margin-bottom:8px;border:1px solid var(--line);border-radius:14px;background:rgba(127,127,127,.05);text-align:left;cursor:pointer;color:var(--primary-text-color)}
.hzlo b{flex:1}.hzlo small{color:var(--mut)}.hzlo svg{transform:rotate(-90deg);color:var(--mut)}
:host([style*="color-scheme: light"]) .hzz{background:color-mix(in srgb,var(--zc) 6%,#fff)}
@media(max-width:520px){.hzkgrid,.hzkgrid.sz-l{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.hzkgrid.sz-l .hzk{grid-column:span 2}.hzk{padding:12px 11px 10px;gap:6px}.hzki{width:30px;height:30px}.hzki svg.gx{width:28px;height:28px}.hzkh{gap:7px;padding-right:16px;align-items:flex-start}.hzkn b{white-space:normal;font-size:.84rem;line-height:1.15;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.hzkst{font-size:.54rem;padding:0 4px}.hzkv{font-size:1.7rem}.hzkv.tx{font-size:1.2rem}.hzkm{min-height:38px}.hzkr{width:36px;height:36px}.hzksp{width:52px}
  .hzz{flex-wrap:wrap;gap:10px}.hzzbs{width:100%;padding-left:52px}.hzzb{flex:1}}
.tmgrid .hzt.n{align-items:flex-start}.tmgrid .hzt.n .hti{width:72px;height:72px}.tmgrid .hzt.n .hti svg.gx{width:56px;height:56px}.tmgrid .hzt.n .hzdot{top:16px;right:16px;width:12px;height:12px}
@media(max-width:520px){.hzamp{padding:12px 14px;gap:11px}.hzal{display:none}.hzab{width:40px;height:40px}.hzax b{font-size:1.12rem}.hzago{display:none}.hzbubs.n{gap:10px}.hzbn{width:72px}.hzbr{width:68px;height:68px}.hzbr b.lg{font-size:.64rem}.hzr.n::before{left:-11px}}
/* Tablet-Modus */
.tmw{position:fixed;inset:0;z-index:10;display:flex;flex-direction:column;background:var(--primary-background-color,#0f1419);color:var(--primary-text-color,#e6edf3)}
.tmh{display:flex;align-items:center;gap:16px;padding:calc(12px + env(safe-area-inset-top,0px)) 20px 6px}
.tmh .blogo{width:48px;height:48px;flex:none}
.tmht{flex:1;min-width:0}.tmht b{display:block;font-size:1.3rem;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tmht span{display:block;font-size:.85rem;color:var(--mut)}
.tmclk{text-align:right;line-height:1}.tmclk span{display:block;font-size:2.6rem;font-weight:300;letter-spacing:-1px}.tmclk small{display:block;font-size:.85rem;color:var(--mut);margin-top:3px}
.tmgear{width:50px;height:50px;border-radius:50%;border:1px solid var(--line);background:var(--card);color:var(--mut);display:grid;place-items:center;cursor:pointer;flex:none}
.tmbody{flex:1;min-height:0;overflow:auto;padding:10px 20px 16px;display:grid;gap:14px;align-content:start;-webkit-overflow-scrolling:touch}
.tmbody .hzbubs{flex-wrap:wrap;overflow:visible;padding:0}
.tmgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px}
.tmgrid .hzt{align-items:flex-start;text-align:left;min-height:150px;padding:18px;border-radius:24px;gap:8px;background:var(--card)}
.tmgrid .hzt .hti{width:54px;height:54px;border-radius:16px}.tmgrid .hzt b{font-size:1.15rem}.tmgrid .hzt small{font-size:1.05rem;margin-top:auto}
.tmhints{display:grid;gap:10px}
.tmhint{display:flex;align-items:center;gap:14px;border:1px solid var(--line);background:var(--card);border-radius:18px;padding:12px 16px}
.tmhint.wa{border-color:color-mix(in srgb,var(--amber) 60%,transparent)}.tmhint.bad{border-color:#f87171}
.tmhi{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:rgba(127,127,127,.12);flex:none}.tmhint.wa .tmhi{color:var(--amber)}.tmhint.bad .tmhi{color:#f87171}
.tmhint b{display:block;font-weight:600}.tmhint small{display:block;color:var(--mut)}
.tmrooms{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}
.tmroom{border:1px solid var(--line);background:var(--card);border-radius:24px;padding:18px;display:flex;flex-direction:column;gap:6px}
.tmroom.wa{border-color:var(--amber);background:color-mix(in srgb,var(--amber) 10%,var(--card))}
.tmrt{display:flex;align-items:center;gap:12px}.tmrt b{font-size:1.15rem}
.tmrt .hti{width:54px;height:54px;border-radius:16px;display:grid;place-items:center;background:color-mix(in srgb,var(--teal) 16%,transparent);color:var(--teal)}
.tmroom.wa .hti{background:color-mix(in srgb,var(--amber) 20%,transparent);color:var(--amber)}
.tmrs{color:var(--mut);font-size:.9rem}.tmroom.wa .tmrs{color:var(--amber)}
.tmpm{display:flex;align-items:center;gap:12px;margin-top:10px}
.tmb2{width:64px;height:64px;border-radius:50%;border:1px solid var(--line);background:rgba(127,127,127,.12);color:inherit;display:grid;place-items:center;cursor:pointer;flex:none}
.tmb2:disabled{opacity:.35}.tmb2:active:not(:disabled){background:color-mix(in srgb,var(--teal) 25%,transparent)}
.tmv{flex:1;text-align:center;font-size:2.3rem;font-weight:700}.tmv small{font-size:1rem;color:var(--mut);font-weight:500}
.tmdock{display:flex;gap:10px;padding:10px 16px calc(14px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line);background:var(--card)}
.tmdk{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;height:84px;border-radius:20px;border:1px solid var(--line);background:rgba(127,127,127,.07);color:var(--mut);font:inherit;font-size:.8rem;position:relative;cursor:pointer}
.tmdk span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 4px}
.tmdk.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 13%,transparent);color:var(--teal)}
.tmdot{position:absolute;top:9px;right:14px;width:10px;height:10px;border-radius:50%;background:var(--amber)}
.tmmore{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.tmmore .tmdk{height:92px}
.tmrest{position:fixed;inset:0;z-index:30;background:#000;color:#d7dde4;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:8px}
.tmrc{font-size:min(26vw,11rem);font-weight:200;letter-spacing:-.04em;line-height:1}.tmrd{font-size:1.6rem;color:#8a929b}
.tmrf{display:flex;flex-wrap:wrap;justify-content:center;gap:12px 40px;margin-top:34px;color:#6f7780;font-size:1.15rem}.tmrf div{display:flex;align-items:center;gap:10px}
.tmrw{position:absolute;bottom:26px;color:#4d545b;font-size:.95rem}
.tmpad{max-width:420px}
.tmdots{display:flex;justify-content:center;gap:14px;margin:14px 0 6px}.tmdots i{width:16px;height:16px;border-radius:50%;border:2px solid var(--mut)}.tmdots i.f{background:var(--teal);border-color:var(--teal)}
.tmerr{min-height:1.4em;text-align:center;color:#f87171;font-size:.88rem;margin-bottom:8px}
.tmkeys{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;justify-items:center}
.tmkeys button{width:72px;height:72px;border-radius:50%;border:1px solid var(--line);background:rgba(127,127,127,.12);color:inherit;font:inherit;font-size:1.6rem;cursor:pointer}.tmkeys button.z{border:0;background:none;color:var(--mut);font-size:.95rem}
.tmbn{display:flex;align-items:center;gap:14px;flex-wrap:wrap;border:1px solid color-mix(in srgb,var(--teal) 50%,transparent);background:color-mix(in srgb,var(--teal) 9%,var(--card));border-radius:18px;padding:14px 16px}
.tmbt{flex:1;min-width:200px}.tmbt b{display:block}.tmbt span{color:var(--mut);font-size:.88rem}
.tmurl{display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:12px;padding:6px 6px 6px 12px;overflow:hidden}.tmurl code{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.8rem;color:var(--teal)}
@media(max-width:520px){.tmclk span{font-size:1.8rem}.tmclk small{display:none}.tmmore{grid-template-columns:repeat(2,1fr)}}


/* Sponsor-Bereich (3.0.2.13) */
.spnb{--spr:#e07aa6}.pillbtn.spnb,.btn2.spnb{color:var(--spr);border-color:color-mix(in srgb,var(--spr) 55%,transparent);background:color-mix(in srgb,var(--spr) 12%,transparent);font-weight:700}
.spnb svg{fill:currentColor}.pillbtn.spnb.pri,.btn2.spnb.pri{background:var(--spr);border-color:var(--spr);color:#2a0f1b}.pillbtn.spnb.on{background:color-mix(in srgb,var(--spr) 16%,transparent)}
.spnc{display:flex;align-items:center;gap:14px;flex-wrap:wrap;border:1px solid color-mix(in srgb,#e07aa6 35%,var(--line));background:color-mix(in srgb,#e07aa6 6%,var(--card,#1c1c1c));border-radius:20px;padding:14px 16px;margin:0 0 12px}
.spnbig{width:46px;height:46px;border-radius:14px;background:color-mix(in srgb,#e07aa6 16%,transparent);display:grid;place-items:center;flex:none;color:#e07aa6}.spnbig svg{fill:currentColor}
.spnt{flex:1;min-width:200px}.spnt b{display:block}.spnt span{display:block;font-size:.86rem;color:var(--mut)}.spnc a{text-decoration:none}
.spnthx{display:flex;gap:10px;align-items:center;border:1px solid color-mix(in srgb,#e07aa6 45%,transparent);background:color-mix(in srgb,#e07aa6 10%,transparent);border-radius:12px;padding:10px 12px;font-size:.9rem;font-weight:600}.spnthx svg{fill:#e07aa6;stroke:#e07aa6;flex:none}
.spnl{display:block;margin-top:3px;font-size:.76rem;color:var(--mut)}.spnl svg{fill:#e07aa6;stroke:#e07aa6;vertical-align:-2px}.spnl a{color:#e07aa6}
.spnperks{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.spnperks>div{display:flex;gap:10px;align-items:center;border:1px solid var(--line);border-radius:14px;padding:10px 12px}
.spnperks svg{color:#e07aa6;flex:none}.spnperks span{font-size:.8rem;color:var(--mut)}.spnperks b{display:block;font-size:.9rem;color:var(--primary-text-color,#e8eaed)}
.spnta{width:100%;margin:0;font:12.5px ui-monospace,Menlo,monospace;resize:vertical;word-break:break-all}
.spnkeybox{border:1px solid var(--line);background:#222;border-radius:12px;padding:12px;font:12.5px/1.45 ui-monospace,Menlo,monospace;word-break:break-all;color:var(--mut);user-select:all}
.spnsum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 6px}.spnsum>div{border:1px solid var(--line);background:#222;border-radius:14px;padding:10px 12px}.spnsum small{display:block;color:var(--mut);font-size:.72rem}.spnsum b{font-size:1.4rem}.spnsum b.wa{color:#f59e0b}
.spnrow{display:grid;grid-template-columns:40px 1fr auto auto auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}
.spna{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-weight:700;background:#e07aa6;color:#2a0f1b}.spna.off{background:#444;color:#ccc}
.spnn b{display:block}.spnn small{display:block;color:var(--mut);font-size:.78rem}
.spns{font-style:normal;font-size:.7rem;font-weight:700;padding:3px 9px;border-radius:99px;border:1px solid;white-space:nowrap}
.spns.g{color:#34d399;border-color:color-mix(in srgb,#34d399 50%,transparent)}.spns.a{color:#f59e0b;border-color:color-mix(in srgb,#f59e0b 50%,transparent)}.spns.r{color:#f87171;border-color:color-mix(in srgb,#f87171 50%,transparent)}.spns.x{color:var(--mut);border-color:var(--line)}
.spnmini{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);background:transparent;color:inherit;border-radius:99px;padding:5px 10px;font-size:.76rem;font-weight:600;cursor:pointer}
.spnck{display:flex;gap:8px;align-items:center;font-size:.88rem;cursor:pointer}
@media(max-width:520px){.spnrow{grid-template-columns:40px 1fr auto}.spnrow .spns{grid-column:2}.spnrow .spnmini{grid-column:2}.spnrow .spnmore{grid-column:3;grid-row:1}.spnperks{grid-template-columns:1fr}}
:host(.spg-meer) .bar{background:linear-gradient(110deg,rgba(14,116,144,.38),rgba(30,58,138,.18) 60%,transparent);border-radius:20px;padding-bottom:12px}
:host(.spg-abend) .bar{background:linear-gradient(110deg,rgba(217,119,6,.34),rgba(190,24,93,.2) 60%,transparent);border-radius:20px;padding-bottom:12px}
.tmrc.ck-duenn{font-weight:100}.tmrc.ck-kraeftig{font-weight:800;color:var(--teal,#2dd4bf)}.tmrc.ck-digital{font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-weight:700;color:#f59e0b;letter-spacing:.04em}
/* Modul 11: Reiter, Grundriss-Baukasten, Wartung */
.sftabs{display:flex;gap:6px;overflow-x:auto;padding:2px 0;scrollbar-width:none}.sftabs::-webkit-scrollbar{display:none}
.sftabs button{flex:none;padding:9px 18px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--primary-text-color);font:inherit;font-weight:600;font-size:.86rem;cursor:pointer}
.sftabs button.on{background:color-mix(in srgb,var(--teal) 18%,transparent);border-color:var(--teal)}
.sfhr{margin-left:auto;display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
.sffl{display:flex;gap:6px;flex-wrap:wrap}.sffl button,.sfed{border:1px solid var(--line);background:transparent;color:var(--mut);border-radius:999px;padding:5px 12px;font:inherit;font-size:.76rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:5px}
.sffl button.on{border-color:var(--teal);color:var(--teal);background:color-mix(in srgb,var(--teal) 12%,transparent)}
.sfpl{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:color-mix(in srgb,var(--primary-text-color) 4%,var(--card));--sfw:#6b7685}
.sfpl svg{display:block;width:100%;height:auto;aspect-ratio:800/480;-webkit-user-select:none;user-select:none}.sfpl.edit svg{touch-action:none;cursor:crosshair}
.sfr{fill:color-mix(in srgb,var(--primary-text-color) 5%,transparent);stroke:var(--sfw);stroke-width:4}.sfr.al{fill:#ef444430;stroke:#ef4444}
.sfrn{font-size:12px;font-weight:700;fill:var(--mut);pointer-events:none}.sftx{font-size:15px;font-weight:700;fill:var(--primary-text-color);cursor:default}
.sfw{stroke:var(--sfw);stroke-width:5;stroke-linecap:round;fill:none}.sfhit{fill:transparent;stroke:transparent;stroke-width:18;pointer-events:all}
.sfdg{fill:var(--card)}.sfda{fill:none;stroke:var(--mut);stroke-width:1.5}.sffw{fill:#60a5fa}
.sfst{fill:color-mix(in srgb,var(--primary-text-color) 8%,transparent);stroke:var(--sfw);stroke-width:2}.sfsl{stroke:var(--sfw);stroke-width:1.5}
.sfgd{fill:color-mix(in srgb,var(--primary-text-color) 22%,transparent)}
.sfsel{fill:none;stroke:var(--teal);stroke-width:2;stroke-dasharray:6 4;pointer-events:none}.sfhd{fill:#fff;stroke:var(--teal);stroke-width:2.5}.sfhh{fill:transparent}
.sfmc{fill:var(--card);stroke-width:3}.sfmk.g .sfmc{stroke:#34d399}.sfmk.g svg{color:#34d399}.sfmk.w .sfmc{stroke:#f59e0b}.sfmk.w svg{color:#f59e0b}.sfmk.a .sfmc{stroke:#ef4444}.sfmk.a svg{color:#ef4444}.sfmk.o .sfmc,.sfmk.n .sfmc{stroke:#94a3b8;stroke-dasharray:4 3}.sfmk.o svg,.sfmk.n svg{color:#94a3b8}
.sfbt{font-size:11px;font-weight:800;fill:#f59e0b;pointer-events:none}.sfpulse{fill:#ef4444;opacity:.45;transform-box:fill-box;transform-origin:center;animation:sfpl 1.4s ease-out infinite;pointer-events:none}
@keyframes sfpl{0%{transform:scale(.6);opacity:.6}100%{transform:scale(1.5);opacity:0}}@media(prefers-reduced-motion:reduce){.sfpulse{animation:none}}
.sfemp{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:30px 16px;color:var(--mut)}.sfemp b{color:var(--primary-text-color);font-size:1.05rem}
.sftiles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.sfti{border:1px solid var(--line);border-radius:14px;padding:9px 4px 7px;text-align:center;background:transparent;color:var(--mut);font:inherit;font-size:.72rem;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px}
.sfti.on{border-color:var(--teal);color:var(--primary-text-color);background:color-mix(in srgb,var(--teal) 14%,transparent)}
.sfgrp{font-size:.66rem;font-weight:800;letter-spacing:.1em;color:var(--mut);margin:12px 0 6px}.sfgrp:first-child{margin-top:0}
.sffld{display:grid;gap:3px;margin:8px 0}.sffld>label{font-size:.74rem;color:var(--mut)}
.sfbtn{display:flex;gap:8px}.sfbtn .btn2{flex:1;padding:10px;display:inline-flex;align-items:center;justify-content:center;gap:6px}.sfdel{color:#f87171}.sffile{cursor:pointer}
.sfhint{display:flex;gap:8px;align-items:flex-start;margin-top:10px;padding:10px 12px;border:1px dashed var(--teal);border-radius:12px;background:color-mix(in srgb,var(--teal) 7%,transparent);font-size:.82rem;color:var(--mut)}.sfhint svg{flex:none;margin-top:1px}.sfhint.warn{border-color:#f59e0b;background:color-mix(in srgb,#f59e0b 9%,transparent);color:var(--primary-text-color)}
.sffacts{display:grid;gap:0;margin-top:8px}.sffacts>div{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);font-size:.86rem}.sffacts>div:last-child{border:0}.sffacts span{color:var(--mut)}
.sfap{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line);font-size:.9rem}.sfap:last-of-type{border:0}.sfap>span:not(.sfdot):not(.sft){flex:1;min-width:0}.sfap>b{font-weight:700}
.sfdot{width:10px;height:10px;border-radius:50%;flex:none;background:#34d399}.sfdot.a{background:#f59e0b}.sfdot.r{background:#ef4444}
.sft{flex:none;font-size:.7rem;font-weight:800;padding:3px 10px;border-radius:999px;border:1px solid color-mix(in srgb,#34d399 45%,transparent);color:#34d399}.sft.a{border-color:color-mix(in srgb,#f59e0b 55%,transparent);color:#f59e0b}.sft.r{background:#ef4444;border-color:#ef4444;color:#fff}
.sfwarn{color:#f59e0b;font-weight:700}
.sftl{position:relative;display:grid;gap:12px;padding-left:20px}.sftl::before{content:"";position:absolute;left:5px;top:6px;bottom:6px;width:2px;background:var(--line)}
.sftl>div{position:relative;display:flex;flex-direction:column;font-size:.88rem}.sftl>div::before{content:"";position:absolute;left:-20px;top:4px;width:12px;height:12px;border-radius:50%;background:var(--c);border:2px solid var(--card)}.sftl small{color:var(--mut)}
.sfmr{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:10px 6px;border:0;border-bottom:1px solid var(--line);background:transparent;color:inherit;font:inherit;cursor:pointer;border-radius:10px}.sfmr.on{background:color-mix(in srgb,var(--teal) 12%,transparent)}.sfmr:last-of-type{border-bottom:0}
.sfmt{flex:1;min-width:0;display:flex;flex-direction:column}.sfmt small{color:var(--mut);font-size:.76rem}
.sfwr{display:flex;gap:12px;justify-content:space-between;align-items:flex-start;padding:12px 0;border-bottom:1px solid var(--line)}.sfwr:last-child{border:0}.sfwm{min-width:0;flex:1}.sfwm small{display:block;color:var(--mut);font-size:.78rem;margin-top:2px}.sfwr2{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.hero.mh.sfh.warn{background:radial-gradient(110% 150% at 100% 0%,#fbbf24 0%,transparent 52%),linear-gradient(135deg,#78350f,#b45309 60%,#92400e)}
.hero.mh.sfh.alarm{background:radial-gradient(110% 150% at 100% 0%,#f87171 0%,transparent 52%),linear-gradient(135deg,#7f1d1d,#b91c1c 60%,#991b1b);animation:sfp 1.6s ease-in-out infinite}
@media(prefers-reduced-motion:reduce){.hero.mh.sfh.alarm{animation:none}}
.hero.mh .chip.stdev{background:#fbbf24;color:#2b1d00;font-weight:800;border-color:transparent}.hero.mh .chip.stsoon{background:#8b5cf6;color:#fff;font-weight:800;border-color:transparent}
.gatabs{margin:2px 0 12px}.gamain{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:14px;align-items:start}
.gashot{position:relative;border-radius:16px;overflow:hidden;border:1px solid var(--line);background:#0c0f12}.gashot img{display:block;width:100%;height:auto}
.gatip{position:absolute;left:8px;top:8px;background:#241a45;color:#d6ccff;border:1px solid #8b5cf666;font-size:.66rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:3px 10px;border-radius:999px;pointer-events:none}
.gapin{position:absolute;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;border:0;background:var(--teal);color:#042f2e;font:inherit;font-weight:800;font-size:.9rem;cursor:pointer;box-shadow:0 0 0 6px color-mix(in srgb,var(--teal) 30%,transparent);display:grid;place-items:center;padding:0}
.gapin.on{background:#fbbf24;box-shadow:0 0 0 8px rgba(251,191,36,.35);z-index:2}.gapin:focus-visible{outline:2px solid #fff;outline-offset:2px}
.galist{display:grid;gap:8px;align-content:start}.gacur{border-color:rgba(251,191,36,.55)!important}.gacur .gah{display:flex;gap:10px;align-items:center}.gacur p{margin:8px 0 0;line-height:1.45;color:var(--mut)}
.gan{flex:none;width:26px;height:26px;border-radius:50%;background:var(--teal);color:#042f2e;font-weight:800;font-size:.85rem;display:grid;place-items:center}.gacur .gan{background:#fbbf24}
.garow{display:flex;gap:10px;align-items:center;width:100%;text-align:left;border:1px solid var(--line);background:var(--card);color:var(--primary-text-color);border-radius:16px;padding:10px 14px;font:inherit;cursor:pointer}
.gafeat{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}.gafc{border:1px solid var(--line);border-radius:18px;padding:14px;background:color-mix(in srgb,var(--primary-text-color) 4%,var(--card))}.gafc b{display:flex;gap:8px;align-items:center;margin-bottom:4px}.gafc b svg{color:var(--teal)}.gafc span{color:var(--mut);font-size:.9rem;line-height:1.4;display:block}
.gaph{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}.gaph figure{margin:0;width:min(300px,44%);min-width:220px}.gaph .gashot{border-radius:22px}.gaph figcaption{text-align:center;color:var(--mut);font-size:.85rem;margin-top:6px}
.gast{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.gast .s{border:1px solid var(--line);border-radius:18px;padding:14px;background:color-mix(in srgb,var(--primary-text-color) 4%,var(--card))}.gast .s b{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.gast .s span.d{display:block;color:var(--mut);margin-top:6px;line-height:1.4;font-size:.92rem}
.gastg{font-size:.64rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;border-radius:999px;padding:2px 9px}.gastg.d{background:#3a2a05;color:#fbbf24;border:1px solid rgba(251,191,36,.4)}.gastg.s{background:#241a45;color:#c4b5fd;border:1px solid rgba(139,92,246,.4)}
.gasoon{border:1px dashed rgba(139,92,246,.55);background:rgba(139,92,246,.12);border-radius:16px;padding:12px 16px;line-height:1.4;display:flex;gap:12px;align-items:center}.gasoon svg{flex:none;color:#c4b5fd}
@media(max-width:820px){.gamain{grid-template-columns:1fr}}
.mvb{font:inherit;font-size:.72rem;font-weight:700;cursor:pointer;color:var(--teal);background:color-mix(in srgb,var(--teal) 12%,transparent);border:1px solid color-mix(in srgb,var(--teal) 40%,transparent);border-radius:8px;padding:1px 9px;margin-right:6px}.mvb:hover,.mvb.on{background:color-mix(in srgb,var(--teal) 24%,transparent)}.brand .mvb+.ver::before{content:""!important}
.mvpop{border-color:color-mix(in srgb,var(--teal) 45%,transparent);margin-bottom:12px}.mvh{display:flex;justify-content:space-between;align-items:center;gap:8px}.mvh b{font-size:1rem}.mvst{margin:8px 0;line-height:1.5}.mvlog{margin:6px 0 10px;padding-left:18px;line-height:1.6}
.mvt{overflow-x:auto}.mvt table{width:100%;border-collapse:collapse;font-size:.86rem}.mvt th{font-size:.7rem;text-transform:uppercase;letter-spacing:.04em;color:var(--mut);text-align:left;font-weight:600}.mvt th,.mvt td{padding:7px 8px;border-bottom:1px solid var(--line);white-space:nowrap}.mvn{color:#fbbf24;font-weight:800;font-size:.7rem}
.mvlg{display:grid;gap:10px;margin-top:10px}.mvl{display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:start;line-height:1.45;font-size:.86rem}.mvl em{justify-self:start}
.mtab small{white-space:nowrap}.mtab small .mvv,.mnew{display:none}@media(min-width:821px){.mtab small .mvv{display:inline;font-weight:700}.mnew{display:block;position:absolute;top:-6px;right:-3px;background:#f59e0b;color:#111;border-radius:999px;font-size:.58rem;font-weight:800;padding:1px 6px;font-style:normal;text-transform:none}}
@media(max-width:520px){.brand div span>em.dvl,.brand div span>em.beta,.brand div span>em.vab,.brand div span>em.stb{display:none}}@media(max-width:600px){.mvd{display:none}.mvl{grid-template-columns:1fr}}
.mvtr{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:8px 0}.mvtr>span{display:flex;flex-direction:column;align-items:center;gap:2px;opacity:.5}.mvtr>span.now{opacity:1}.mvtr>span.now em{box-shadow:0 0 0 2px var(--teal)}.mvtr>span.done{opacity:.8}.mvtr small{font-size:.68rem;color:var(--mut)}.mvtr>i{font-style:normal;color:var(--mut)}
.mvnx{font-size:.86rem;margin:2px 0 8px;line-height:1.45}.mvrule{display:grid;gap:4px;font-size:.86rem;line-height:1.4}.mvrule b{display:inline-block;min-width:118px}
@media(max-width:520px){.mvtr>i{display:none}.mvtr{gap:8px 10px}}
.mlogo:has(.mlv) svg{height:58%;width:58%;margin-top:-12%}.mlv{position:absolute;left:4px;right:4px;bottom:8px;text-align:center;font-size:.64rem;font-weight:800;letter-spacing:.01em;white-space:nowrap;opacity:.92}
@media(max-width:520px){.mlv{font-size:.5rem;bottom:5px}}
.labfig{margin:4px 0 12px}.labfig img{display:block;width:100%;height:auto;border-radius:16px;border:1px solid var(--line)}.labfig figcaption{display:flex;gap:6px;align-items:center;font-size:.74rem;color:var(--mut);margin-top:6px}

.rtx{display:grid;grid-template-columns:auto 1fr;gap:1px 10px;margin-top:6px;font-size:12px;color:var(--mut)}.rtx b{color:var(--primary-text-color);font-weight:600;text-align:right}
.rtn{margin-top:6px;font-size:12px;color:#a78bfa}.rtn.warn{color:#f59e0b}
.rgd{display:grid;gap:8px;margin:6px 0 14px}.rgh{display:grid;grid-template-columns:1fr 1fr;gap:8px}.rgh>div{border:1px solid var(--line);border-radius:12px;padding:8px 10px;display:grid}.rgh span,.rgv span{font-size:11px;color:var(--mut)}.rgh b{font-size:1.15rem}.rgh i{font-style:normal;font-size:11px;color:var(--mut)}
.rgr{border:1px solid var(--line);border-radius:12px;padding:8px 10px;display:grid;gap:6px}.rgn{display:flex;justify-content:space-between;gap:8px;font-weight:600;font-size:.88rem}.rgn span{font-weight:400;font-size:11px;color:var(--mut)}
.rgv{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}.rgv>div{display:grid}.rgv b{font-size:.86rem;font-weight:600}
.rgr em{font-style:normal;font-size:11.5px;color:#a78bfa}.rgr em.ok{color:var(--green)}.rgr em.warn{color:#f59e0b}

/* Versionen: Releaseliste, Beta-Hinweis, Versionsschema, Versionshinweis im Kopf */
.vtag{cursor:pointer}.vtag:hover{text-decoration:underline}.vtag.vbeta{color:var(--amber)}
.rll{display:grid;margin-top:6px;border:1px solid var(--line);border-radius:12px;overflow:hidden}
.rlr{padding:10px 12px}.rlr+.rlr{border-top:1px solid var(--line)}
.rlh{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.rlh .mut{margin-left:auto;font-size:.78rem}
.rlv{font-variant-numeric:tabular-nums;letter-spacing:.01em}
.rlin{font-style:normal;font-size:.7rem;font-weight:700;color:var(--teal);background:color-mix(in srgb,var(--teal) 12%,transparent);border:1px solid color-mix(in srgb,var(--teal) 40%,transparent);border-radius:8px;padding:1px 8px}
.rlt{margin:6px 0 0;padding-left:18px;line-height:1.5;font-size:.86rem;color:var(--mut)}
.rlc{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.rlc em{font-style:normal;font-size:.72rem;border:1px solid var(--line);border-radius:8px;padding:1px 8px;color:var(--mut)}
.rlbeta{display:flex;gap:10px;align-items:flex-start;margin:10px 0 2px;padding:10px 12px;border-radius:12px;color:var(--amber);background:color-mix(in srgb,var(--amber) 12%,transparent);border:1px solid color-mix(in srgb,var(--amber) 40%,transparent);line-height:1.45;font-size:.86rem}
.rlbeta b{display:block}.rlbeta span{color:var(--primary-text-color);opacity:.85}
.rlrows{display:grid;margin-top:12px;border:1px solid var(--line);border-radius:12px;overflow:hidden}.rlrows .sxrow:first-child{border-top:0}.rlrows a.sxrow{text-decoration:none;color:inherit}
.rlx{margin-top:6px;padding:10px 12px;border-radius:12px;border:1px solid var(--line);font-size:.86rem;line-height:1.5}
.rlx p{margin:6px 0;color:var(--mut)}.rlx p b{color:var(--primary-text-color)}
.rlxn{display:flex;align-items:center;gap:3px;font-size:1.05rem;font-weight:700;font-variant-numeric:tabular-nums}.rlxn i{font-style:normal;padding:2px 8px;border-radius:8px;border:1px solid var(--line)}

/* Modul 3 v1.1: Zeitraum, Kacheln mit Verlauf, Tooltip, Kosten-Treppe, Vorzeichen-Prüfung */
.enbil{font-size:.86rem;margin-top:6px;opacity:.95;padding-right:130px}.enbil b.pos{color:#a7f3d0}.enbil b.neg{color:#fecaca}
.enrg{cursor:pointer}
.enh .chip.enpr{background:rgba(251,191,36,.22);color:#fde68a}
.ennav{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:0 0 12px}
.ennav .enseg{width:auto;max-width:none;margin:0}.ennav .enseg button{padding:8px 18px;flex:1}.enper .nx svg{transform:rotate(180deg)}
.enper{display:flex;align-items:center;gap:8px}.enper b{font-size:.95rem;white-space:nowrap}
.enper .nx.dis{opacity:.3;pointer-events:none}.ennow{font-weight:700;color:var(--teal)}
.entiles{margin-bottom:12px}
button.tile.entile{font:inherit;color:inherit;text-align:left;cursor:pointer;width:100%;border:1px solid var(--line)}
button.tile.entile.sel{border-color:var(--a);box-shadow:0 0 0 1px var(--a) inset}
.tile .tsp{display:block;width:100%;height:28px;margin-top:8px}
.tcmp{font-weight:700}.tcmp.up{color:#34d399}.tcmp.dn{color:#f87171}
.enchw{position:relative}
.enchart{touch-action:pan-y}
.enhit{cursor:pointer}
.entt{position:absolute;top:8px;min-width:150px;max-width:240px;background:var(--card);border:1px solid var(--teal);border-radius:12px;padding:8px 10px;font-size:.8rem;line-height:1.45;pointer-events:none;z-index:2;display:flex;flex-direction:column;box-shadow:0 6px 18px rgba(0,0,0,.25)}
.entt[hidden]{display:none}.entt b{font-size:.84rem}
.enwf{display:block;width:100%;max-height:210px;margin:4px 0 6px}
.enchk{border:1px solid color-mix(in srgb,#34d399 45%,transparent);background:color-mix(in srgb,#34d399 9%,transparent);border-radius:14px;padding:10px 12px;margin:8px 0;display:flex;flex-direction:column;gap:6px;font-size:.86rem;line-height:1.45}
.enchk.warn{border-color:color-mix(in srgb,#f59e0b 55%,transparent);background:color-mix(in srgb,#f59e0b 10%,transparent)}
.enchk>b{display:flex;align-items:center;gap:6px}.enchk.ok>b{color:#34d399}.enchk.warn>b{color:#f59e0b}
.enchk .gbtns{margin:2px 0 0}
.enlive{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.enlive div{border:1px solid var(--line);border-radius:10px;padding:6px 8px;font-size:.74rem;color:var(--mut)}.enlive b{display:block;font-size:1rem;color:var(--primary-text-color)}
@media(max-width:600px){.enbil{padding-right:90px}.ennav{flex-direction:column;align-items:stretch}.ennav .enseg{width:100%}.enper{justify-content:space-between}.enper b{flex:1;text-align:center}}

/* Modul 4 v1.1: Gerätetypen, Zeitraum, Karten, Tagesbalken */
.gshb{font:inherit;color:inherit;background:none;border:0;padding:0;width:100%;display:flex;align-items:center;gap:12px;text-align:left;cursor:pointer}
.gsn{display:flex;flex-direction:column;flex:1;min-width:0}.gsn b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gsn small{font-size:.72rem;color:var(--mut)}
.gsdev.sel{border-color:var(--teal);box-shadow:0 0 0 1px var(--teal) inset}
.gssp{display:block;width:100%;height:26px}
.gstyp{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.gstyp .gsch{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;font-size:.78rem}
.gshero .chips{margin-top:10px}.gshero .chip{background:rgba(27,21,0,.14);color:#1b1500}
.gshb2{display:grid;gap:10px;margin:10px 0 4px}
.gshr{display:grid;grid-template-columns:minmax(90px,150px) 1fr auto;gap:10px;align-items:center;font-size:.84rem}
.gshn{display:flex;align-items:center;gap:6px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gshbar{height:14px;border-radius:7px;background:color-mix(in srgb,var(--line) 60%,transparent);overflow:hidden}.gshbar>div{display:flex;height:100%;gap:2px;min-width:2px}
.gshv{font-size:.78rem;color:var(--mut);white-space:nowrap}
@media(max-width:600px){.gshr{grid-template-columns:1fr auto}.gshbar{grid-column:1/3;grid-row:2}}

/* Einstellungen Stufe 1: Bereiche links, Inhalt rechts; Handy: Liste und Unterseiten */
.stw{max-width:1100px}
.stlay{display:grid;grid-template-columns:240px minmax(0,1fr);gap:18px;align-items:start}
.stnav{display:flex;flex-direction:column}
.stlay .stnav{gap:2px;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:8px;position:sticky;top:8px}
.stni{display:flex;align-items:center;gap:10px;border:0;background:transparent;color:inherit;font:inherit;text-align:left;padding:8px 10px;border-radius:12px;cursor:pointer}
.stni .sxi{width:32px;height:32px;border-radius:10px;display:grid}
.stni b{flex:1;font-weight:600}.stni.sel{background:color-mix(in srgb,var(--teal) 14%,transparent);color:var(--teal)}.stni.sel b{font-weight:800}
.stni .sxc{display:inline-block}
.stmain{min-width:0}.sthd{margin:0 4px 10px}.sthd h2{margin:2px 0 0;font-size:1.35rem}
.stbk{font-weight:700;color:var(--teal);padding:0;margin:0 0 4px}
.stcard{margin-bottom:14px}
.stch{display:flex;align-items:center;gap:6px;padding:12px 16px 6px;font-weight:700;width:100%;border:0;background:transparent;color:inherit;font:inherit;font-weight:700;text-align:left}
.stch small{font-weight:400;color:var(--mut)}.sttg{cursor:pointer}.stgo{margin-left:auto;color:var(--teal);font-weight:700;font-size:.82rem;display:inline-flex;align-items:center;gap:2px;white-space:nowrap}
.stck{display:flex;align-items:flex-start;gap:12px;width:100%;border:0;border-top:1px solid var(--line);background:transparent;color:inherit;font:inherit;text-align:left;padding:11px 16px}
button.stck{cursor:pointer}
.stdot{flex:none;width:10px;height:10px;border-radius:50%;margin-top:6px}.stdot.wn{background:#f59e0b}.stdot.ok{background:#34d399}.stdot.in{background:var(--teal)}
.stlv{font-style:normal;font-size:.68rem;font-weight:700;padding:1px 7px;border-radius:7px;margin-left:6px;vertical-align:1px;white-space:nowrap}
.stlv.l1{background:color-mix(in srgb,var(--teal) 14%,transparent);color:var(--teal)}.stlv.l3{background:color-mix(in srgb,#fbbf24 16%,transparent);color:#d97706}
.stleg{font-size:.78rem;color:var(--mut);margin:-6px 6px 14px}
.stmn{font-style:normal;font-weight:400;font-size:.76rem;color:var(--mut);margin-left:6px}
.stinfo{cursor:default}
.stmini{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px;padding:6px 14px 14px}
.stmb{display:flex;align-items:center;gap:8px;border:1px dashed var(--line);border-radius:12px;background:transparent;color:inherit;font:inherit;text-align:left;padding:8px 10px;cursor:pointer}
.stmt{display:flex;flex-direction:column;min-width:0;line-height:1.25}.stmb b{font-size:.84rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.stmb small{font-size:.68rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.stgo svg{transform:rotate(-90deg)}
.sxc.er{border-color:color-mix(in srgb,#ef4444 50%,transparent);color:#f87171;background:color-mix(in srgb,#ef4444 9%,transparent)}
.sxc.wa{border-color:color-mix(in srgb,#f59e0b 50%,transparent);color:#f59e0b;background:color-mix(in srgb,#f59e0b 9%,transparent)}
.stw .sxsum{margin:0 0 14px}
@media(max-width:760px){.stw .sxi{display:grid}.stw .sxc{display:inline-block}.stw .sxsum{grid-template-columns:1fr 1fr}}
.hsuse{font-size:.8rem;color:var(--mut);margin:-4px 4px 10px}
.hsr .sxt small{overflow-wrap:anywhere}.hsr .sxt b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hsr .sxt{min-width:0;flex:1}.stmain,.stw{min-width:0;max-width:100%}.stw .card{max-width:100%;box-sizing:border-box}
.hsv{flex:none;font-style:normal;font-size:.8rem;font-weight:700;padding:4px 10px;border-radius:10px;border:1px solid var(--line);display:inline-flex;align-items:center;gap:5px;white-space:nowrap;font-variant-numeric:tabular-nums}
.hsv svg{color:var(--teal)}.hsv.bad{color:#f87171;border-color:color-mix(in srgb,#ef4444 50%,transparent);background:color-mix(in srgb,#ef4444 9%,transparent)}
.hsck{border:1px solid color-mix(in srgb,#34d399 45%,transparent);background:color-mix(in srgb,#34d399 8%,transparent);border-radius:14px;margin:0 0 12px}
.hsck.wn{border-color:color-mix(in srgb,#f59e0b 50%,transparent);background:color-mix(in srgb,#f59e0b 8%,transparent)}
.hsed{margin:0 0 14px}
.hsmig{padding:14px 16px;border-color:color-mix(in srgb,var(--teal) 45%,var(--line))}.hsmig.warn{border-color:color-mix(in srgb,#f59e0b 50%,var(--line))}
.hsmh{display:flex;align-items:center;gap:8px;margin:0 0 6px;color:var(--teal)}.hsmh b{color:var(--primary-text-color,#e6edf3)}
.hslk{border:1px solid color-mix(in srgb,var(--teal) 35%,var(--line));border-radius:14px;margin:8px 0;overflow:hidden}.hslink .stlv{margin-left:0}.hslink .sxg,.fhs.open .hslink .sxg{transform:rotate(-90deg)}.hslink .sxt small{overflow-wrap:anywhere}
/* Modul 1: Messraum */
.msh{display:flex;align-items:center;gap:10px;margin:18px 2px 10px}.msh .gico{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--teal) 14%,transparent);color:var(--teal);flex:none}
.msh b{display:block;font-size:1rem}.msh span{font-size:.78rem;color:var(--mut)}
.rooms.msg{margin-bottom:12px}
.room.msr{padding:14px;gap:10px}.room.msr .rico{width:40px;height:40px;border-radius:13px}
.msbadge{font-size:.68rem;font-weight:600;padding:2px 9px;border-radius:999px;border:1px solid var(--line);color:var(--mut)}
.msv{display:grid;grid-template-columns:1fr 1fr;gap:8px}.msv.one{grid-template-columns:1fr}
.msb{--c:var(--gray);border-radius:14px;padding:10px 12px;border:1px solid var(--line);min-width:0;background:color-mix(in srgb,var(--c) 6%,transparent)}
.msb .t{display:flex;align-items:center;gap:5px;font-size:.74rem;color:var(--mut)}
.msb .v{font-size:1.55rem;font-weight:700;letter-spacing:-.02em;margin-top:2px;color:var(--c);font-variant-numeric:tabular-nums}.msb .v small{font-size:.85rem;font-weight:600;margin-left:2px}
.msb .s{font-size:.7rem;color:var(--mut);margin-top:3px}
.msb.green{--c:var(--green)}.msb.amber{--c:var(--amber);border-color:color-mix(in srgb,var(--amber) 45%,transparent)}.msb.blue{--c:#60a5fa;border-color:color-mix(in srgb,#60a5fa 45%,transparent)}.msb.gray .v{color:var(--mut)}
.msb .gauge{height:5px;border-radius:9px;background:color-mix(in srgb,var(--primary-text-color) 10%,transparent);margin-top:6px;overflow:hidden}.msb .gauge i{display:block;height:100%;background:var(--c);border-radius:9px}
.msb.none .v{font-size:.98rem;color:var(--mut);margin-top:6px}
.room.msnone{border-style:dashed;background-image:repeating-linear-gradient(135deg,transparent 0 10px,color-mix(in srgb,var(--primary-text-color) 3%,transparent) 10px 20px)}
.msx{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:.78rem;color:var(--mut)}.msx span{display:flex;align-items:center;gap:4px}.msx b{color:var(--primary-text-color)}.msx .amber b{color:var(--amber)}.msx .red b{color:#f87171}
.msn{font-size:.74rem;color:var(--mut)}.msn.amber{color:var(--amber)}
.mskind{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:4px 0 10px}.mskind button{text-align:left;border:1px solid var(--line);border-radius:14px;padding:11px 12px;background:none;color:inherit;font:inherit;cursor:pointer}
.mskind button b{display:flex;align-items:center;gap:6px;font-size:.88rem}.mskind button span{display:block;font-size:.74rem;color:var(--mut);margin-top:4px}
.mskind button.sel{border-color:var(--teal);box-shadow:0 0 0 1px var(--teal) inset;background:color-mix(in srgb,var(--teal) 8%,transparent)}
.msnew{font-style:normal;font-size:.6rem;font-weight:700;padding:1px 6px;border-radius:999px;background:var(--teal);color:var(--on-acc)}
.msdup{margin:-4px 0 6px;color:var(--amber)}
.msrg{display:flex;align-items:center;gap:8px}.msrg .onum{flex:1;min-width:0}.msrg .onum input{width:100%;min-width:0}
@media(max-width:520px){.mskind{grid-template-columns:1fr}}
/* Modul 1: Luftentfeuchter (Türkis, damit er sich von Heizen und Fenster unterscheidet) */
.lfbox{--lf:#22d3ee;border:1px solid color-mix(in srgb,var(--lf) 40%,var(--line));border-radius:16px;padding:12px;background:color-mix(in srgb,var(--lf) 6%,transparent);display:grid;grid-template-columns:minmax(0,1fr);gap:8px;min-width:0}.lfbox>*{min-width:0}
.lfh{display:flex;align-items:center;gap:10px}.lfi{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:color-mix(in srgb,var(--lf,#22d3ee) 18%,transparent);color:var(--lf,#22d3ee);flex:none}
.lft{flex:1;min-width:0}.lft b{display:flex;align-items:center;gap:6px;font-size:.92rem}.lft span{display:block;font-size:.74rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lfhere{font-style:normal;font-size:.62rem;font-weight:700;padding:1px 7px;border-radius:999px;background:var(--lf,#22d3ee);color:#042f2e}
.lfst{font-weight:700;font-size:.95rem;color:var(--mut);white-space:nowrap}.lfbox.run .lfst{color:var(--lf)}.lfbox.warn .lfst{color:var(--amber)}.lfbox.wait .lfst{color:#60a5fa}
.lfbox.run .lfi svg{animation:lfspin 2.4s linear infinite}@keyframes lfspin{to{transform:rotate(360deg)}}
.lfbar{height:5px;border-radius:9px;background:color-mix(in srgb,var(--primary-text-color) 10%,transparent);overflow:hidden}.lfbar i{display:block;height:100%;background:var(--lf);border-radius:9px}
.lfwhy{font-size:.76rem;color:var(--mut);background:color-mix(in srgb,var(--primary-text-color) 4%,transparent);border-radius:10px;padding:7px 9px}.lfwhy b{color:#60a5fa}.lfhint{color:var(--amber)}
.lfbtns{display:flex;flex-wrap:wrap;gap:6px}.lfbtns .btn2{flex:1 1 auto;min-width:0;padding:8px 10px;font-size:.8rem}
.card.lfloc{--lf:#22d3ee;border-color:color-mix(in srgb,#facc15 55%,var(--line));display:grid;gap:10px}
.lftiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}
.lftile{text-align:left;border:1px solid var(--line);border-radius:14px;padding:10px 12px;background:none;color:inherit;font:inherit;cursor:pointer}
.lftile b{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:.9rem}.lftile span{display:block;font-size:.74rem;color:var(--mut);margin-top:3px}.lftile span.amber{color:var(--amber)}
.lftile.sel{border-color:#22d3ee;box-shadow:0 0 0 1px #22d3ee inset;background:color-mix(in srgb,#22d3ee 9%,transparent)}.lftile.sel b .ic{color:#22d3ee}
.lftabs{margin:2px 0 6px}
.lfkind{display:grid;gap:8px}.lfkind button{text-align:left;border:1px solid var(--line);border-radius:14px;padding:10px 12px;background:none;color:inherit;font:inherit;cursor:pointer}
.lfkind button b{display:block;font-size:.88rem}.lfkind button span{display:block;font-size:.74rem;color:var(--mut);margin-top:3px}.lfkind button.sel{border-color:var(--teal);box-shadow:0 0 0 1px var(--teal) inset}
.lfstep{display:flex;align-items:center;gap:8px}.lfstep b{min-width:72px;text-align:center;font-size:1.05rem;font-variant-numeric:tabular-nums}.lfstep b small{font-size:.75rem;color:var(--mut);font-weight:600}

.stside{display:flex;flex-direction:column;gap:10px;position:sticky;top:8px}.stside .stnav{position:static}
.stq{display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:0 10px;margin:0 0 12px;color:var(--mut)}.stside .stq{margin:0}
.stq:focus-within{border-color:color-mix(in srgb,var(--teal) 60%,var(--line))}
.stq input{flex:1;min-width:0;border:0;background:transparent;color:var(--primary-text-color,#e6edf3);font:inherit;padding:11px 0;outline:none}
.sthx{border:0;background:transparent;color:var(--mut);display:grid;cursor:pointer;padding:4px}
.strs{display:flex;align-items:center;border-top:1px solid var(--line)}.strs:first-of-type{border-top:0}.strs .sxrow{flex:1;min-width:0}.strs .sxrow+.sxrow{border-top:0}.strs .sthq{margin-right:12px}
.sthq{flex:none;width:22px;height:22px;border-radius:50%;border:1px solid var(--line);background:transparent;color:var(--teal);font:inherit;font-size:.74rem;font-weight:800;cursor:pointer;margin-left:8px;vertical-align:1px;display:inline-grid;place-items:center;padding:0}
.sthq:hover{background:color-mix(in srgb,var(--teal) 14%,transparent)}
a.btn2{text-decoration:none;color:inherit;display:inline-flex;align-items:center;justify-content:center;gap:6px}.stq:not(:focus-within) .sthx{opacity:.5}
.sthtx{font-size:.92rem;line-height:1.5;margin:4px 0 10px}
.stlr{display:flex;align-items:center;gap:12px;padding:10px 16px;border-top:1px solid var(--line)}.stcard .stlr:first-of-type,.stlog .stlr:first-child{border-top:0}.stlog{border:1px solid var(--line);border-radius:14px;overflow:hidden}
.stlr.done{opacity:.55}.stlw{flex:none;width:92px;font-size:.78rem;font-weight:650;font-variant-numeric:tabular-nums}.stlw small{display:block;font-weight:400;color:var(--mut)}
.stlr .sxt{flex:1;min-width:0;display:flex;flex-direction:column}.stlr .sxt small{color:var(--mut);font-size:.78rem;overflow-wrap:anywhere}
.stlu{flex:none;font-size:1.1rem;font-weight:700;color:var(--teal)}
.toast.stun{display:flex;align-items:center;gap:10px;border-radius:16px;width:max-content;max-width:calc(100vw - 32px);box-sizing:border-box}.toast.stun span{flex:1;min-width:0}.toast.stun svg{flex:none;color:var(--teal)}.toast.stun .lnk{color:var(--teal);font-weight:800;padding:0 0 0 4px;white-space:nowrap}
.mdtabs{margin:2px 0 12px}.mdtabs button{display:inline-flex;align-items:center;justify-content:center;gap:6px}
.fhst .sxrow{cursor:default}.fhst .sxrow:hover{background:none}
@media(max-width:620px){.mdtabs button svg{display:none}.stlw{width:70px}.strs .stlv{display:none}}
.mwms{display:inline-flex;gap:2px;flex:none;flex-wrap:wrap;max-width:110px;justify-content:flex-end}.mwms i{font-style:normal;font-size:.62rem;font-weight:800;min-width:16px;height:16px;padding:0 3px;box-sizing:border-box;border-radius:5px;background:color-mix(in srgb,var(--teal) 16%,transparent);color:var(--teal);display:inline-grid;place-items:center}.mwms i.off{background:color-mix(in srgb,var(--mut) 14%,transparent);color:var(--mut)}
.mwr .sxt{min-width:0}.mwr .sxt small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block}.mwr{gap:10px}
.hsv.wa{color:#f59e0b;border-color:color-mix(in srgb,#f59e0b 50%,transparent)}.sxsum b.wa{color:#f59e0b}
.mwf{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}.mwf .chip{border:1px solid var(--line);background:transparent;color:inherit;font:inherit;font-size:.78rem;font-weight:700;padding:5px 11px;border-radius:999px;cursor:pointer}.mwf .chip.sel{background:var(--teal);color:#062a28;border-color:var(--teal)}.mwf .chip.wa:not(.sel){color:#f59e0b;border-color:color-mix(in srgb,#f59e0b 50%,transparent)}
.mwbox{border:1px solid var(--line);border-radius:14px;overflow:hidden;margin:6px 0 10px;display:block}.mwbox .sxrow+.sxrow,.mwsen+.mwsen{border-top:1px solid var(--line)}.mwsen .stck{border-top:1px solid var(--line)}
.mwn{flex:none;min-width:26px;height:26px;border-radius:8px;background:color-mix(in srgb,var(--teal) 16%,transparent);color:var(--teal);font-weight:800;font-size:.8rem;display:grid;place-items:center}.mwu.off{opacity:.55}.mwu.off .mwn{background:color-mix(in srgb,var(--mut) 14%,transparent);color:var(--mut)}
@media(max-width:620px){.mwms{max-width:64px}.mwr .hsv{display:none}}
.pkf{padding:8px 8px 4px}.pkseg{margin:0 0 8px}.pkseg button{font-size:.8rem}
.pkcard{border:1px solid var(--line);border-radius:12px;padding:10px 11px;margin:0 0 7px;opacity:.86}.pkcard.best{border-color:color-mix(in srgb,var(--teal) 60%,var(--line));background:color-mix(in srgb,var(--teal) 7%,transparent);opacity:1}
.pkch{display:flex;align-items:center;gap:10px;justify-content:space-between}.pkch .pkv{font-weight:700;color:var(--primary-text-color)}
.pkwhy{font-size:.74rem;color:var(--mut);margin:5px 0 7px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}.pkpct{font-style:normal;font-weight:800;font-size:.68rem;color:#062a28;background:#34d399;border-radius:6px;padding:1px 6px}.pkcard:not(.best) .pkpct{background:color-mix(in srgb,var(--mut) 30%,transparent);color:var(--primary-text-color)}
.pkbt{display:flex;justify-content:flex-end}.pkbt .btn2{min-width:96px;padding:7px 14px}
.pkmore{font-size:.78rem;color:var(--mut);margin:2px 2px 6px}.pkq{font-size:.86rem;margin:2px 2px 8px}
.pktiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:7px;margin:0 0 6px}.pktile{border:1px solid var(--line);border-radius:12px;background:transparent;color:inherit;font:inherit;text-align:left;padding:9px 10px;cursor:pointer;display:flex;flex-direction:column;gap:2px}.pktile b{font-size:.86rem}.pktile small{font-size:.7rem;color:var(--mut)}.pktile.hint{border-color:color-mix(in srgb,var(--teal) 60%,var(--line));background:color-mix(in srgb,var(--teal) 8%,transparent)}
.pkdev{border:1px solid var(--line);border-radius:12px;margin:0 0 7px;padding:4px}.pkdh{display:flex;align-items:center;gap:6px;padding:5px 6px;font-size:.82rem;color:var(--teal)}.pkdh b{color:var(--primary-text-color)}.pkdh small{color:var(--mut);margin-left:auto;font-size:.7rem}
.pkfl{display:flex;flex-wrap:wrap;align-items:center;gap:5px;margin:0 0 7px}.pkfl>span{font-size:.7rem;color:var(--mut);font-weight:700;min-width:62px}.pkchip{border:1px solid var(--line);background:transparent;color:inherit;font:inherit;font-size:.74rem;font-weight:650;border-radius:999px;padding:4px 10px;cursor:pointer}.pkchip.sel{background:var(--teal);color:#062a28;border-color:var(--teal)}
.pkf .pklist{max-height:none;overflow:visible}.pkcnt{font-size:.76rem;color:var(--mut);margin:2px 2px 4px}.pkmorebtn{margin:4px 6px 8px}
/* Addons */
.adseg{max-width:420px}.adrow{padding:12px 14px;border-bottom:1px solid var(--line)}.adrow:last-child{border-bottom:0}.adtop{display:flex;align-items:center;gap:12px}.adtop .sxt{flex:1;min-width:0}
.adrow.paused .adtop .sxi,.adrow.error .adtop .sxi{opacity:.55}.adbtn{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0 0 46px}.adbtn .gsch{display:inline-flex;align-items:center;gap:5px}
.adds{margin:8px 0 0 46px;font-size:.84rem;color:var(--mut);line-height:1.45}.adrow .gst{margin:8px 0 0 46px}
.gst.bad{color:#f87171}.btn2.dng{background:#ef4444;border-color:#ef4444;color:#fff}
.adhero{display:flex;gap:14px;align-items:flex-start;padding:14px;border-radius:16px;background:color-mix(in srgb,var(--teal) 10%,transparent);border:1px solid color-mix(in srgb,var(--teal) 35%,transparent);margin:4px 0 10px;color:var(--teal)}
.adhero b{display:block;color:var(--primary-text-color);margin-bottom:4px}.adhero span{font-size:.85rem;color:var(--mut);line-height:1.45}
.adkv{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-size:.84rem;margin:0 0 10px}.adkv span{color:var(--mut)}.adkv b{font-weight:600}
.adopt{display:flex;gap:12px;align-items:flex-start;width:100%;text-align:left;background:transparent;border:1px solid var(--line);border-radius:14px;padding:11px 12px;margin:0 0 8px;cursor:pointer;color:inherit;font:inherit}
.adopt i{flex:none;width:18px;height:18px;border-radius:50%;border:2px solid var(--mut);margin-top:2px}.adopt.sel{border-color:var(--teal)}.adopt.sel i{border-color:var(--teal);background:radial-gradient(var(--teal) 45%,transparent 50%)}
.adopt b{display:block}.adopt small{color:var(--mut);font-size:.8rem}
.adcat{display:flex;gap:12px;align-items:center;padding:12px 14px}.adcat .sxt{flex:1;min-width:0}.adcat.ok .sxi{color:var(--teal)}.adcat.bad .sxi{color:#f87171}.adcat.bad small{color:#fca5a5}.adcat .gsch{display:inline-flex;gap:5px;align-items:center;flex:none}
.adver{display:flex;align-items:center;justify-content:center;gap:16px;margin:6px 0 12px;padding:14px;border:1px solid var(--line);border-radius:16px}.adver div{text-align:center}.adver small{display:block;color:var(--mut);font-size:.74rem}.adver b{font-size:1.15rem}.adver .nw b{color:var(--teal)}.adver>span{transform:rotate(-90deg);color:var(--mut)}
.adnotes{margin:0 0 12px;padding-left:20px;font-size:.86rem;line-height:1.5}.adnotes.adin{margin:8px 0 0 46px;color:var(--mut);font-size:.82rem}
/* Modul 1: Luftentfeuchter – Standort (Schritt 2) */
.lfloc .lftile{position:relative}.lftile.sel .lfok .ic,.lfok .ic{color:#042f2e}.lfok{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#22d3ee;color:#042f2e;font-style:normal}
.lfmeta{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:.78rem;color:var(--mut)}.lfmeta b{color:var(--primary-text-color)}.lfst2.warn{color:var(--amber)}
.lfbig .btn2{padding:11px 12px;font-size:.84rem}.lfbig .btn2.pri{flex:1 1 100%;background:#34d399;border-color:#34d399;color:#052e16}
.lfconf{display:flex;align-items:center;gap:6px;font-size:.74rem;color:var(--mut)}.lfconf.ok .ic{color:#34d399}.lfconf.open{color:var(--amber)}.lfconf .lnk{margin-left:auto;font-size:.74rem}
.lfchips{display:flex;flex-wrap:wrap;gap:6px}.lfchips button{border:1px solid var(--line);border-radius:12px;padding:9px 12px;background:none;color:inherit;font:inherit;font-size:.82rem;font-weight:600;cursor:pointer}
.lfchips button.sel{background:#22d3ee;border-color:#22d3ee;color:#042f2e}
.lftime{max-width:130px;font-variant-numeric:tabular-nums}
.lfhist{display:grid;gap:2px}.lfhr{display:grid;grid-template-columns:84px 1fr auto 56px;gap:8px;align-items:center;padding:7px 2px;border-bottom:1px solid var(--line);font-size:.82rem}
.lfhd{color:var(--mut)}.lfhh{font-size:.72rem;color:var(--mut)}.lfhh.ok{color:#34d399}.lfhh.warn{color:var(--amber)}.lfhm{text-align:right;color:var(--mut);font-size:.74rem;font-variant-numeric:tabular-nums}
.lfdays{display:grid;gap:6px}.lfdays div{display:grid;grid-template-columns:110px 1fr auto;gap:8px;align-items:center;font-size:.8rem}.lfdays i{display:block;height:10px;border-radius:6px;background:#22d3ee}.lfdays i.off{background:var(--gray)}.lfdays b{font-size:.74rem;color:var(--mut);font-weight:600}
@media(max-width:520px){.lfhr{grid-template-columns:70px 1fr 50px}.lfhh{grid-column:2/3}.lfhm{grid-row:1;grid-column:3}}
/* Modul 1: Luftentfeuchter – Hierher stellen, Meldungen, Statistik (Schritt 3 und 4) */
.lfmoves{display:grid;gap:6px}
.lfmove{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:1px dashed color-mix(in srgb,#22d3ee 55%,var(--line));border-radius:14px;padding:9px 12px;background:none;color:inherit;font:inherit;cursor:pointer}
.lfmove .ic{color:#22d3ee;flex:none}.lfmany{cursor:default;align-items:flex-start}.lfmany>span{flex:1;min-width:0}.lfmb{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.lfmb .btn2{flex:1 1 auto;padding:7px 10px;font-size:.8rem;text-align:left}.lfmb .btn2 small{display:block;font-size:.66rem;color:var(--mut);font-weight:500}.lfmove b{display:block;font-size:.86rem}.lfmove small{display:block;font-size:.72rem;color:var(--mut)}
.lfboost{display:inline-flex;align-items:center;gap:3px;font-style:normal;font-size:.62rem;font-weight:700;padding:1px 7px;border-radius:999px;background:color-mix(in srgb,#facc15 22%,transparent);color:#facc15}
.lfmsg{display:flex;align-items:center;gap:6px;font-size:.76rem;color:var(--amber);background:color-mix(in srgb,var(--amber) 9%,transparent);border-radius:10px;padding:6px 9px}
.lfoth{color:#22d3ee!important}
.lfstg{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:10px 0 4px}@media(min-width:620px){.lfstg{grid-template-columns:repeat(4,1fr)}}
.lfstt{--c:#22d3ee;border:1px solid color-mix(in srgb,var(--c) 55%,var(--line));border-radius:14px;padding:10px 12px;min-width:0}.lfstt span{display:block;font-size:.74rem;color:var(--mut)}
.lfstt b{display:block;font-size:1.35rem;color:var(--c);margin-top:3px;font-variant-numeric:tabular-nums;white-space:nowrap}.lfstt small{display:block;font-size:.66rem;color:var(--mut);margin-top:2px}
.lfstt.y{--c:#facc15}.lfstt.o{--c:#fb923c}.lfstt.b{--c:#60a5fa}
.lftabs button{padding-left:4px;padding-right:4px;font-size:.8rem}
/* Modul 1: Luftentfeuchter – NFC-Tag am Stellplatz (Schritt 5) */
.lfnl0{display:grid;gap:6px}
.lfnr{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;border:1px solid var(--line);border-radius:14px;padding:9px 10px}
.lfnr b{display:block;font-size:.88rem}.lfnr small{display:block;font-size:.74rem;margin-top:2px}
.lfni{width:30px;height:30px;border-radius:10px;display:grid;place-items:center;background:color-mix(in srgb,var(--primary-text-color) 6%,transparent);color:var(--mut)}
.lfnr.set .lfni{background:color-mix(in srgb,#22d3ee 18%,transparent);color:#22d3ee}
.lfnr.on{border-color:#22d3ee;box-shadow:0 0 0 1px #22d3ee inset;background:color-mix(in srgb,#22d3ee 7%,transparent)}.lfnl{color:#22d3ee}
.lfnb{display:flex;gap:6px}.lfnb .btn2{padding:7px 10px;font-size:.78rem;flex:none}
/* Uhrzeit aus zwei Feldern (statt Auswahlrad, das die Mac-App abstürzen lässt) */
.tin{display:inline-flex;align-items:center;gap:4px;vertical-align:middle}
.tinp{width:3.1em;text-align:center;font:inherit;font-size:1rem;font-variant-numeric:tabular-nums;padding:8px 4px;border-radius:10px;border:1px solid var(--line);background:var(--primary-background-color);color:var(--primary-text-color);box-sizing:border-box}
.tinp:focus{outline:none;border-color:var(--teal);box-shadow:0 0 0 1px var(--teal) inset}.tinp:disabled{opacity:.55}
.tinc{font-weight:700;color:var(--mut)}
/* Grafik-Bibliothek 05d (HD-Symbolsatz): noch von keinem Modul genutzt */
.gx{display:block;flex:none;--gx-sh:#000;--gx-rim:color-mix(in srgb,var(--primary-text-color,#e6edf3) 40%,transparent)}
.gxpct{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 10px;font-size:.74rem}.gxpct span{display:inline-flex;align-items:center;gap:4px}
.gxpct i{width:8px;height:8px;border-radius:50%;display:inline-block}
.gxrest{font-size:.76rem;font-weight:600;color:var(--teal);background:color-mix(in srgb,var(--teal) 16%,transparent);padding:3px 10px;border-radius:99px}
.gxrest.learn{color:var(--mut);background:color-mix(in srgb,var(--mut) 12%,transparent);font-weight:500}
/* Modul 4 v1.2: Gerätekarten 2.0 */
.gsdev.g2{border:0;position:relative;overflow:hidden;--st:var(--mut);padding:14px 16px 16px;gap:10px;grid-template-columns:minmax(0,1fr);min-width:0}
.gsdev.g2>*{min-width:0}
.gsdev.g2::before{content:"";position:absolute;top:0;left:18px;right:18px;height:2px;border-radius:0 0 3px 3px;background:var(--st);opacity:.75}
.gsdev.g2-run{--st:#34d399}.gsdev.g2-done{--st:var(--teal)}.gsdev.g2-idle::before{opacity:.35}.gsdev.g2-go{--st:#fbbf24}.gsdev.g2-none{--st:#f87171}
.gsdev.g2-go::before{opacity:1;box-shadow:0 0 10px #fbbf24}.gsdev.g2-none .gx{filter:grayscale(1);opacity:.6}
.g2img{position:relative;flex:none;display:block}.g2ok{position:absolute;right:2px;bottom:2px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:var(--teal);color:var(--on-acc);box-shadow:0 0 0 2px var(--card)}
.g2st .ic{vertical-align:-2px}.g2st.none{color:#f87171;background:color-mix(in srgb,#f87171 14%,transparent)}
.gsdev.g2.sel{box-shadow:0 0 0 1px var(--teal) inset}
.g2h{display:flex;align-items:center;gap:12px;background:none;border:0;padding:0;text-align:left;cursor:pointer;width:100%;color:inherit}
.g2n{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}.g2n b{font-size:1.06rem;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:break-word;hyphens:auto}.g2n small{font-size:.8rem;color:var(--mut)}
.g2s{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px}.g2st{flex:none;font-size:.75rem;font-weight:700;padding:4px 11px;border-radius:999px;color:var(--mut);background:color-mix(in srgb,var(--mut) 12%,transparent)}
.g2st.run{color:#34d399;background:color-mix(in srgb,#34d399 14%,transparent)}.g2st.run::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:#34d399;margin-right:6px;vertical-align:1px}
.g2st.done{color:var(--teal);background:color-mix(in srgb,var(--teal) 14%,transparent)}
.g2 .gxpct{justify-content:flex-start;color:var(--mut)}
.g2rest{display:flex;flex-direction:column;gap:6px;align-items:flex-start}.g2prog{width:100%;height:4px;border-radius:4px;background:var(--line);overflow:hidden}.g2prog i{display:block;height:100%;background:#34d399;border-radius:4px}
.g2f{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.g2f div{background:color-mix(in srgb,var(--primary-text-color,#e6edf3) 5%,transparent);border-radius:12px;padding:7px 9px;display:flex;flex-direction:column;gap:1px;min-width:0}
.g2f span{font-size:.7rem;color:var(--mut)}.g2f b{font-size:.92rem;font-weight:700;white-space:nowrap}.g2f small{font-size:.7rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.g2adv{display:flex;align-items:center;gap:10px;border-radius:14px;padding:8px 10px;background:color-mix(in srgb,#fbbf24 10%,transparent);font-size:.84rem;font-weight:600}
.g2adv.go{background:color-mix(in srgb,#34d399 12%,transparent)}
.g2adv span{flex:1;display:flex;flex-direction:column;gap:1px}.g2adv small{font-weight:400;font-size:.74rem;color:var(--mut)}
.g2rem{flex:none;display:inline-flex;align-items:center;gap:5px;border:0;border-radius:999px;padding:7px 13px;font-weight:700;font-size:.8rem;cursor:pointer;background:var(--teal);color:var(--on-acc)}
.g2rem.on{background:color-mix(in srgb,var(--teal) 18%,transparent);color:var(--teal)}
@media(max-width:520px){.g2f b{font-size:.86rem}.gsdev.g2{padding:12px 13px 14px}}
/* Sponsor-Lounge (12f-lounge.js) und Sponsor Max */
.lgw{max-width:1100px}
.lgban{display:flex;align-items:center;gap:18px;border-radius:22px;padding:20px 22px;margin-bottom:14px;color:#fff;background:radial-gradient(80% 140% at 0% 100%,rgba(234,74,170,.35),transparent 60%),#1d1322;box-shadow:inset 0 0 0 1px rgba(234,74,170,.3)}
.lgban.mx{background:radial-gradient(90% 160% at 100% 0%,rgba(251,191,36,.32),transparent 55%),radial-gradient(80% 140% at 0% 100%,rgba(234,74,170,.28),transparent 60%),#1a1220;box-shadow:inset 0 0 0 1px rgba(251,191,36,.3)}
.lgbt{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}.lgbt small{font-size:.72rem;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:#f9a8d4}.lgbt b{font-size:1.6rem;line-height:1.15}.lgbt span{font-size:.86rem;opacity:.9;line-height:1.35}
.lgstar{flex:none;width:62px;height:62px;border-radius:50%;display:grid;place-items:center;font-size:32px;color:#fff;background:radial-gradient(circle at 35% 30%,#fff3b0,#f59e0b 60%,#b45309);box-shadow:0 0 24px rgba(251,191,36,.45)}
.lgstar.hz{background:radial-gradient(circle at 35% 30%,#fbcfe8,#ea4aaa 60%,#9d174d);box-shadow:0 0 24px rgba(234,74,170,.45)}.lgstar.sm{width:44px;height:44px;font-size:22px}
.lgcols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:12px}@media(max-width:760px){.lgbt b{font-size:1.25rem}.lgban{padding:16px;flex-wrap:wrap}}
.lgt{position:relative;background:var(--card);border-radius:18px;padding:14px 16px;overflow:hidden}.lgt::before{content:"";position:absolute;top:0;left:16px;right:16px;height:2px;border-radius:0 0 3px 3px;background:var(--c,#ea4aaa);opacity:.8}
.lgt h3{margin:0 0 6px;font-size:1rem;display:flex;align-items:center;gap:8px}.lgt.mx{--c:#fbbf24}
.lgit{display:flex;align-items:center;flex-wrap:wrap;gap:8px 10px;padding:8px 0;border-top:1px solid var(--line)}.lgit:first-of-type{border-top:0}.lgit .n{flex:1 1 170px;min-width:0;display:flex;flex-direction:column;font-size:.9rem;overflow-wrap:break-word}.lgit>.btn2,.lgit>.lgsoon{flex:none;margin-left:auto}.lgit small{font-size:.74rem;color:var(--mut)}
.lgi{flex:none;width:32px;height:32px;border-radius:10px;display:grid;place-items:center;color:var(--teal);background:color-mix(in srgb,var(--teal) 14%,transparent)}.lgi.big{width:40px;height:40px;border-radius:12px;color:#f472b6;background:color-mix(in srgb,#ea4aaa 14%,transparent)}
.lgsoon{flex:none;font-style:normal;font-size:.7rem;font-weight:700;border-radius:99px;padding:3px 9px;color:#fbbf24;background:color-mix(in srgb,#fbbf24 14%,transparent)}.lgsoon.mx{color:#fbbf24}
.lgsec{display:flex;align-items:center;gap:6px;font-weight:700;font-size:.9rem;margin:16px 2px 8px}.lgsec .mut{font-weight:400}
.lgxs{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}
.lgx{position:relative;display:flex;align-items:center;gap:12px;flex-wrap:wrap;background:var(--card);border-radius:16px;padding:12px 14px;overflow:hidden}.lgx::before{content:"";position:absolute;top:0;left:16px;right:16px;height:2px;background:#ea4aaa;opacity:.6}.lgx.mx::before{background:#fbbf24}
.lgx .n{flex:1;min-width:130px;display:flex;flex-direction:column}.lgx .n b{font-size:.92rem}.lgx small{font-size:.74rem;color:var(--mut)}
.lggd{color:#fbbf24}.lggold{background:linear-gradient(180deg,#fde68a,#f59e0b)!important;color:#422006!important;border:0!important;font-weight:700}
.lgup{display:flex;align-items:center;gap:12px;margin-top:10px;--c:#fbbf24}.lgup .n{flex:1;display:flex;flex-direction:column}.lgup small{font-size:.78rem;color:var(--mut)}
.lgst{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px}.lgst div{background:color-mix(in srgb,var(--primary-text-color) 5%,transparent);border-radius:12px;padding:10px 12px}.lgst b{display:block;font-size:1.3rem}.lgst small{font-size:.74rem;color:var(--mut)}
.lgnote{display:flex;justify-content:space-between;gap:10px;font-size:.74rem;color:var(--mut);margin-top:8px}
.lgnum{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:.85rem;color:var(--teal);background:color-mix(in srgb,var(--teal) 16%,transparent)}
.lgex{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}
.lgxt{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;background:var(--card);border:0;border-radius:16px;padding:14px 10px;color:inherit;cursor:pointer;font:inherit}.lgxt b{font-size:.88rem}.lgxt small{font-size:.72rem;color:var(--mut)}
.mxbnote{display:flex;align-items:center;gap:10px;margin:10px 0 8px;padding:9px 12px;border-radius:12px;background:color-mix(in srgb,#fbbf24 13%,transparent);border:1px solid color-mix(in srgb,#fbbf24 40%,transparent)}.mxbnote>.lggd{font-size:1.1rem;flex:none}.mxbnote>span:last-child{display:flex;flex-direction:column}.mxbnote b{font-size:.86rem}.mxbnote small{font-size:.78rem;color:var(--mut)}
.lgbeta{display:flex;align-items:center;gap:6px;margin-top:6px;font-style:normal;font-size:.76rem;font-weight:600;color:color-mix(in srgb,#818cf8 60%,var(--primary-text-color))}.lgbeta::before{content:"";flex:none;width:7px;height:7px;border-radius:50%;background:#818cf8}.lgbeta.mx{color:color-mix(in srgb,#fbbf24 65%,var(--primary-text-color))}.lgbeta.mx::before{background:#fbbf24}
.blwrap{min-height:70vh;display:flex;align-items:center;justify-content:center;padding:24px 12px}.blcard{max-width:560px;width:100%;background:var(--card);border:1px solid color-mix(in srgb,#818cf8 45%,transparent);border-radius:22px;padding:22px;box-shadow:0 10px 40px rgba(0,0,0,.25)}
.blhead{display:flex;align-items:center;gap:14px}.blhead h2{margin:6px 0 0;font-size:1.3rem;line-height:1.25}.blic{flex:none;width:56px;height:56px;border-radius:16px;display:grid;place-items:center;color:#818cf8;background:color-mix(in srgb,#818cf8 16%,transparent)}
.lgchip.bl{color:color-mix(in srgb,#818cf8 55%,var(--primary-text-color));background:color-mix(in srgb,#818cf8 22%,transparent)}.blcard p{margin:14px 0 10px;font-size:.92rem;line-height:1.45;color:var(--mut)}.blcard p b{color:var(--txt,inherit)}
.blok{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border-radius:12px;font-size:.82rem;background:color-mix(in srgb,var(--teal) 12%,transparent);color:var(--txt,inherit)}.blok>.ic{color:var(--teal);flex:none;margin-top:1px}.blok.wa{background:color-mix(in srgb,#fbbf24 14%,transparent)}.blok.wa>.ic{color:#fbbf24}
.blsteps{display:flex;flex-direction:column;gap:8px;margin:14px 0}.blstp{display:flex;gap:10px;align-items:center}.blstp em{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-weight:700;font-size:.8rem;color:color-mix(in srgb,#818cf8 55%,var(--primary-text-color));background:color-mix(in srgb,#818cf8 22%,transparent)}.blstp span{display:flex;flex-direction:column}.blstp b{font-size:.88rem}.blstp small{font-size:.76rem;color:var(--mut)}
.blcard .lgbtns{display:flex;flex-wrap:wrap;gap:8px}.blcard .lgbtns .btn2{flex:1 1 200px;justify-content:center}.blfoot{text-align:center;margin-top:12px}
.blcount{display:flex;align-items:center;gap:10px;margin:0 0 10px}.blcount>div{min-width:64px;text-align:center;padding:8px 10px;border-radius:12px;background:color-mix(in srgb,#818cf8 14%,transparent)}.blcount b{display:block;font-size:1.5rem;line-height:1.1;color:color-mix(in srgb,#818cf8 55%,var(--primary-text-color))}.blcount small{font-size:.72rem;color:var(--mut)}.blcount>span{font-size:.82rem;color:var(--mut)}
.lgprice{display:inline-flex;align-self:flex-start;align-items:center;gap:4px;margin-top:6px;padding:3px 10px;border-radius:999px;font-style:normal;font-size:.76rem;font-weight:700;color:#1a1300;background:linear-gradient(135deg,#fde68a,#fbbf24);box-shadow:0 0 0 1px rgba(251,191,36,.35);white-space:nowrap}.lgtiers b .lgprice{margin:0 0 0 6px;vertical-align:middle}
.lgtiers{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.lgtiers .lgt{display:flex;flex-direction:column;gap:4px}.lgtiers small{font-size:.76rem;color:var(--mut)}@media(max-width:560px){.lgtiers{grid-template-columns:1fr}}
.lgchips,.lgchipsn{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-left:auto}.lgchipsn{margin:0 0 10px}.lgchips+.pillbtn{margin-left:8px}
.lgchip{font-style:normal;font-size:.74rem;font-weight:600;border-radius:99px;padding:4px 10px;background:color-mix(in srgb,var(--primary-text-color) 8%,transparent);color:var(--primary-text-color);white-space:nowrap}
.lgchip.pk{color:#f472b6;background:color-mix(in srgb,#ea4aaa 15%,transparent)}.lgchip.gd{color:#d97706;background:color-mix(in srgb,#fbbf24 18%,transparent)}.lgchip.btn{border:0;cursor:pointer;font-family:inherit;margin-left:auto}
.lgtop{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:12px}@media(max-width:900px){.lgtop{grid-template-columns:1fr}}
.lghero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:16px;align-items:center;background:var(--card);border-radius:20px;padding:20px 20px 20px 22px;overflow:hidden;position:relative;box-shadow:inset 0 0 0 1px color-mix(in srgb,#ea4aaa 22%,transparent)}
.lghero::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(60% 90% at 0% 0%,color-mix(in srgb,#ea4aaa 10%,transparent),transparent 70%)}.lghero.mx{box-shadow:inset 0 0 0 1px color-mix(in srgb,#fbbf24 32%,transparent)}
.lghero.out{margin-bottom:12px;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr)}
.lghl{display:flex;flex-direction:column;gap:8px;min-width:0;position:relative;z-index:1}.lghl .lgchip{align-self:flex-start}
.lghi{font-size:.9rem;color:#f472b6;font-weight:600}.lghl h2{margin:0;font-size:1.75rem;line-height:1.15;font-weight:800;overflow-wrap:break-word}.lghl p{margin:0;font-size:.86rem;color:var(--mut);line-height:1.45}
.lgbtns{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;align-items:center}.lgbtns .btn2{flex:none;min-width:0;width:auto;padding:8px 14px;border-radius:99px;font-size:.84rem;display:inline-flex;align-items:center;gap:6px}
.btn2.lgpk{background:#ec4899!important;color:#fff!important;border-color:transparent!important;font-weight:700}
.lghr{position:relative;z-index:1;border-radius:14px;overflow:hidden;aspect-ratio:2/1.05;min-height:120px}.lgscene{display:block;width:100%;height:100%}
@media(max-width:620px){.lghero,.lghero.out{grid-template-columns:1fr;padding:16px}.lghr{order:-1;aspect-ratio:2/1}.lghl h2{font-size:1.4rem}}
.lgt h4{margin:0 0 8px;font-size:.7rem;letter-spacing:1.4px;text-transform:uppercase;font-weight:700;color:var(--mut)}
.lgnew .lgit{background:color-mix(in srgb,var(--primary-text-color) 4%,transparent);border:0;border-radius:12px;padding:8px 10px;margin-top:6px}.lgnew .lgit .n{font-weight:700}.lgnew .lgit small{font-weight:400}
.lgg{flex:none;width:34px;height:34px;display:grid;place-items:center}.lgg svg{width:34px;height:34px}
.lgopen{flex:none;margin-left:auto;border:0;border-radius:99px;padding:4px 12px;font:inherit;font-size:.76rem;font-weight:700;cursor:pointer;color:#10b981;background:color-mix(in srgb,#10b981 15%,transparent)}
.lg3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:12px}@media(max-width:980px){.lg3{grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))}}
.lgli{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;padding:8px 0;border-top:1px solid var(--line);font-size:.86rem}.lgli:first-of-type{border-top:0}.lgli>span:first-child{flex:1 1 140px;min-width:0;display:flex;flex-direction:column}.lgli>span:first-child>span{display:block}.lgli small{font-size:.72rem;color:var(--mut)}.lgli>.sw,.lgli>.gschs,.lgli>.lgsoon{flex:none;margin-left:auto}.lgli .gschs{flex-wrap:wrap}
.lgpoll{display:flex;flex-direction:column;gap:4px;padding:6px 0;font-size:.84rem}.lgpoll i{display:block;height:6px;border-radius:9px;background:color-mix(in srgb,var(--primary-text-color) 9%,transparent);overflow:hidden}.lgpoll i b{display:block;height:100%;background:#ec4899}
.lgnote2{font-size:.74rem;color:var(--mut);line-height:1.4;margin-top:8px}.lgnote2 .lnk{font-size:.74rem}
.lgbadges{display:flex;flex-wrap:wrap;gap:10px;margin:4px 0 6px}.lgbd{width:58px;height:58px;border-radius:50%;border:0;cursor:pointer;font-size:24px;line-height:1;color:var(--c);background:radial-gradient(circle,color-mix(in srgb,var(--c) 22%,transparent),color-mix(in srgb,var(--c) 6%,transparent) 70%);transition:transform .15s}
.lgbd.sel{box-shadow:0 0 0 2px var(--c),0 0 18px color-mix(in srgb,var(--c) 45%,transparent)}.lgbd.lock{opacity:.45;cursor:default}.lgbd:not(:disabled):hover{transform:scale(1.06)}.lgbdoff{font-size:.74rem;margin-bottom:4px}.lgbdoff .lnk{font-size:.74rem}
.lg2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:12px}
.lgnums{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}.lgnums>div{display:flex;align-items:center;gap:8px;min-width:0}.lgnums svg{flex:none;width:34px;height:34px}.lgnums span{display:flex;flex-direction:column;min-width:0}.lgnums b{font-size:1.25rem;font-weight:800}.lgnums small{font-size:.72rem;color:var(--mut)}
.lgsteps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}@media(max-width:480px){.lgsteps{grid-template-columns:1fr}}
.lgstp{display:flex;flex-direction:column;gap:2px;text-align:left;text-decoration:none;color:inherit;background:none;border:0;padding:4px 2px;font:inherit;cursor:pointer;border-radius:10px;min-width:0}div.lgstp{cursor:default}.lgstp em{font-style:normal;font-size:1.5rem;font-weight:800;color:#ec4899;line-height:1.1}.lgstp b{font-size:.84rem}.lgstp small{font-size:.72rem;color:var(--mut)}
.lgh4{font-size:.7rem;letter-spacing:1.4px;text-transform:uppercase;font-weight:700;color:var(--mut);margin:18px 2px 8px}
.lgget{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}@media(max-width:900px){.lgget{grid-template-columns:repeat(2,minmax(0,1fr))}}
.lgxt2{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;background:var(--card);border:0;border-radius:16px;padding:14px;color:inherit;cursor:pointer;font:inherit;overflow:hidden;min-width:0}
.lgxt2::before{content:"";position:absolute;top:0;left:22%;right:22%;height:2px;border-radius:0 0 3px 3px;background:var(--c)}.lgxt2 svg{width:36px;height:36px;margin-bottom:4px}.lgxt2 b{font-size:.86rem}.lgxt2 small{font-size:.72rem;color:var(--mut);line-height:1.35}
.lgtag{position:absolute;top:10px;right:10px;font-style:normal;font-size:.62rem;font-weight:800;letter-spacing:.5px;border-radius:99px;padding:2px 8px;color:var(--mut);background:color-mix(in srgb,var(--primary-text-color) 8%,transparent)}.lgtag.neu{color:#d97706;background:color-mix(in srgb,#fbbf24 18%,transparent)}.lgtag.mx{color:#d97706;background:color-mix(in srgb,#fbbf24 22%,transparent)}
.spnstar.sun{color:#f59e0b}.spnstar.snow{color:#38bdf8}
.lgn .lgtop,.lgn .lg3,.lgn .lg2{grid-template-columns:1fr}.lgn .lghero,.lgn .lghero.out{grid-template-columns:1fr;padding:16px}.lgn .lghr{order:-1;aspect-ratio:2/1}.lgn .lghl h2{font-size:1.4rem}.lgn .lgget{grid-template-columns:repeat(2,minmax(0,1fr))}.lgn .lgtiers{grid-template-columns:1fr}
.msres{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;margin:14px 0;padding:14px 16px;box-shadow:inset 0 0 0 1px color-mix(in srgb,#f59e0b 45%,transparent)}.msres>div:nth-child(2){flex:1 1 260px;display:flex;flex-direction:column;gap:3px}.msres>div:nth-child(2) span{font-size:.84rem;color:var(--mut)}.msres .gico{color:#f59e0b}.msres .gbtns{margin:0}.msres .gbtns .btn2{flex:none;min-width:0}
.s3row{margin-top:12px}.s3h{display:flex;align-items:center;gap:10px;margin-bottom:8px}.s3h>svg{flex:none;width:34px;height:34px}.s3h>.ibtn{flex:none;margin-left:auto}.s3h>.ibtn svg{width:18px;height:18px}.s3h>span{flex:1;min-width:0;display:flex;flex-direction:column}.s3h b{font-size:.98rem}.s3h small{font-size:.74rem;color:var(--mut)}
.s3tip{display:flex;align-items:center;gap:10px;margin-top:6px;padding:9px 12px;border-radius:12px;font-size:.84rem;line-height:1.35;background:color-mix(in srgb,var(--primary-text-color) 4%,transparent);box-shadow:inset 3px 0 0 var(--c)}.s3tip svg{flex:none;width:26px;height:26px}
.s3sum{margin-top:10px;font-size:.84rem;font-weight:700;color:#10b981}.s3learn{display:flex;gap:10px;align-items:center;font-size:.84rem;color:var(--mut);padding:8px 0}
.s3rep{border-radius:14px;overflow:hidden;background:#0b1220}.s3scn{aspect-ratio:400/150}.s3n{display:grid;grid-template-columns:repeat(3,1fr);padding:10px 8px 12px;text-align:center}.s3n b{display:block;font-size:1.3rem;font-weight:800}.s3n small{font-size:.72rem;color:#9aa7b4}
.lgbtns .lgopen{margin-left:0}.lgopen.gy{color:var(--primary-text-color);background:color-mix(in srgb,var(--primary-text-color) 8%,transparent)}
.lgpoll span{display:flex;justify-content:space-between;gap:8px}.lgpoll span b{font-weight:700}.lgpoll i b{background:color-mix(in srgb,#ec4899 55%,transparent)}.lgpoll.top i b{background:#ec4899}
.mpblks{margin-top:14px}.mpb>.card,.mpb>.tiles,.mpb>.wwrow,.mpb>.gsgrid{margin-top:0;margin-bottom:0}.mpb .wwrow{margin:0}
.mphint{text-align:center;font-size:.76rem;color:var(--mut);margin:14px 0 4px}.mphint .lnk{font-size:.76rem}
.mpdv.editing{padding:8px 10px 10px;margin:0}.gsgrid .mpdv>.card{margin:0}
.lfboost.lfnight{background:color-mix(in srgb,#818cf8 22%,transparent);color:#a5b4fc;margin-left:4px}.lftabs{flex-wrap:wrap}
.pksearch{display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:12px;padding:4px 6px 4px 12px;margin:0 0 10px;background:var(--primary-background-color);color:var(--mut)}.pksearch input{flex:1;min-width:0;border:0;background:transparent;color:var(--primary-text-color);font:inherit;padding:7px 0;outline:none}.pksearch .ibtn{width:30px;height:30px}
.pkall{font-size:.76rem;margin-left:4px}
.mxh{margin-top:20px;color:#d97706}.mxweek{margin-top:4px}
.mxdays{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}.mxd{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 2px;border-radius:12px;background:color-mix(in srgb,var(--primary-text-color) 4%,transparent);text-align:center;min-width:0}
.mxd b{font-size:.78rem}.mxd small{font-size:.68rem;color:var(--mut)}.mxi{color:#fbbf24;display:grid;place-items:center;height:24px}
.mxbar{width:14px;height:46px;border-radius:8px;background:color-mix(in srgb,var(--primary-text-color) 8%,transparent);display:flex;align-items:flex-end;overflow:hidden}.mxbar i{display:block;width:100%;background:linear-gradient(#fde047,#f59e0b);border-radius:8px}
.mxd em{font-style:normal;font-size:.7rem;font-weight:700}.mxp{font-size:.62rem;font-weight:700;border-radius:99px;padding:1px 6px;background:color-mix(in srgb,var(--primary-text-color) 8%,transparent)}.mxp.lo{color:#10b981;background:color-mix(in srgb,#10b981 15%,transparent)}.mxp.hi{color:#f87171;background:color-mix(in srgb,#f87171 15%,transparent)}.mxp.none{opacity:.4}
.mxht{display:inline-flex;align-items:center;gap:2px;font-size:.6rem;color:var(--mut)}.mxht.hoch{color:#fb923c}
.mxtips{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px;font-size:.82rem}.mxtips span{display:inline-flex;align-items:center;gap:5px}.mxtips svg{color:#10b981}
@media(max-width:620px){.mxdays{grid-template-columns:repeat(4,minmax(0,1fr))}}.lgn .mxdays{grid-template-columns:repeat(4,minmax(0,1fr))}
.mxseg{margin:2px 0 8px;flex-wrap:wrap}.mxseg button{font-size:.78rem}.mxseg .lgsoon{font-size:.6rem;padding:1px 6px}
.mxprop{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:9px 10px;margin-top:6px;border-radius:12px;background:color-mix(in srgb,var(--primary-text-color) 4%,transparent)}.mxprop>svg{flex:none;width:28px;height:28px}.mxprop>span:nth-child(2){flex:1 1 180px;min-width:0;display:flex;flex-direction:column;font-size:.84rem}.mxprop small{font-size:.72rem;color:var(--mut)}
.mxprop.done,.mxprop.no,.mxprop.seen{opacity:.6}.mxst{font-style:normal;font-size:.72rem;color:var(--mut);margin-left:auto}.mxyn{display:inline-flex;gap:6px;margin-left:auto}.mxyn .lgopen{margin-left:0}
.mxk{flex:none;width:28px;height:28px;border-radius:9px;display:grid;place-items:center;color:#818cf8;background:color-mix(in srgb,#818cf8 15%,transparent)}.mxk.down{color:#818cf8}.mxk.big{width:32px;height:32px;border-radius:10px}.s3h>.mxk{flex:none}.mxseg button:disabled{opacity:.45;font-size:.7rem;white-space:nowrap}.mxk.up{color:#fb923c;background:color-mix(in srgb,#fb923c 15%,transparent)}
.mxundo{display:flex;align-items:center;gap:6px;font-size:.76rem;color:var(--mut);margin-top:8px}.mxundo svg{color:#10b981}.mxundo .lnk{margin-left:auto;font-size:.76rem}
.btn2.mxstop{color:#f87171!important;border-color:color-mix(in srgb,#f87171 45%,transparent)!important}
.mxq{display:flex;flex-wrap:wrap;gap:8px;margin:2px 0 4px}.mxq span{display:inline-flex;align-items:center;gap:6px;font-size:.8rem;padding:5px 10px 5px 6px;border-radius:99px;background:color-mix(in srgb,var(--primary-text-color) 5%,transparent)}.mxq svg{width:22px;height:22px}.mxq .soon{color:var(--mut);padding-left:10px}
.mxres{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-top:12px}.mxres div{border-radius:12px;padding:10px 12px;background:color-mix(in srgb,var(--primary-text-color) 5%,transparent)}.mxres b{display:block;font-size:1.2rem}.mxres b.pos{color:#10b981}.mxres small{font-size:.72rem;color:var(--mut)}
.mxpay{display:flex;align-items:center;gap:6px;margin-top:10px;font-size:.9rem}.mxpay svg{color:#10b981}
.mxmon{display:flex;align-items:flex-end;gap:4px;height:70px;margin-top:12px}.mxmon div{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;height:100%;justify-content:flex-end}.mxmon i{display:block;width:100%;max-width:22px;border-radius:5px 5px 2px 2px;background:#a78bfa}.mxmon small{font-size:.6rem;color:var(--mut)}
.gsdh{margin:0 0 8px}.gsback{display:inline-flex;align-items:center;gap:4px;font-size:.9rem}
.gsdtop{display:flex;align-items:center;gap:22px;flex-wrap:wrap}.gsdimg{flex:none;display:grid;place-items:center}.gsdinfo{flex:1 1 260px;min-width:0;display:flex;flex-direction:column;gap:5px}.gsdinfo h2{margin:0;font-size:1.35rem}.gsdinfo>small{color:var(--mut);font-size:.82rem}
.gsdsl{font-size:.68rem;letter-spacing:1.2px;text-transform:uppercase;font-weight:700;color:var(--mut);margin-top:8px}
.gsdt3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.gsdt3>div{border-radius:12px;padding:8px 10px;background:color-mix(in srgb,var(--primary-text-color) 5%,transparent);text-align:center}.gsdt3 small{display:block;font-size:.7rem;color:var(--mut)}.gsdt3 b{font-size:1.15rem;color:var(--c,var(--primary-text-color))}.gsdt3.big{text-align:left}.gsdt3.big>div{text-align:left}
.gsdc{margin-top:14px}.gsdc h2{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.gsleg2{margin-left:auto;font-size:.72rem;font-weight:400}.gscv{width:100%;height:auto;display:block}
.gsdadv{display:flex;align-items:center;gap:12px;margin:14px 0}.gsdadv>span{flex:1}
.gsrun{display:flex;align-items:center;gap:10px;width:100%;padding:8px 6px;border:0;border-top:1px solid var(--line);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;border-radius:10px}.gsrun:first-of-type{border-top:0}.gsrun.sel{background:color-mix(in srgb,var(--teal) 10%,transparent)}
.gsrimg{flex:none;display:grid;place-items:center}.gsrt{flex:1 1 auto;min-width:0;display:flex;flex-direction:column}.gsrt b{font-size:.88rem}.gsrt small{font-size:.74rem;color:var(--mut)}.gsrt small.run{color:#10b981}.gsrt small.done{color:var(--teal)}.gsrt small.ok{color:#10b981}
.gsrbar{flex:0 1 120px;height:7px;border-radius:9px;overflow:hidden;display:flex;background:color-mix(in srgb,var(--primary-text-color) 8%,transparent)}.gsrc{flex:none;font-size:.9rem;min-width:52px;text-align:right}.gsx{font-style:normal;font-size:.62rem;font-weight:700;color:#f87171;background:color-mix(in srgb,#f87171 14%,transparent);border-radius:99px;padding:1px 6px;margin-left:4px}
.gsbigc{display:flex;flex-wrap:wrap;align-items:center;gap:12px;width:100%;border:0;text-align:left;color:inherit;font:inherit;cursor:pointer;margin-bottom:10px;box-shadow:inset 0 0 0 1px color-mix(in srgb,#10b981 35%,transparent)}.gsbigc .g2prog{flex:1 1 100%;margin:0}
.gslist{display:flex;flex-direction:column;gap:8px}.gsrow2{display:flex;align-items:center;gap:10px;padding:10px 12px;border:0;border-radius:16px;background:var(--card);color:inherit;font:inherit;text-align:left;cursor:pointer}.gschev{flex:none;color:var(--mut);transform:rotate(-90deg);display:grid}
.g2h{cursor:pointer}
.gssun{display:flex;align-items:center;gap:10px;margin-top:10px;padding:10px 12px;border-radius:12px;font-size:.86rem;background:color-mix(in srgb,#fbbf24 12%,transparent)}.gssun svg{flex:none;width:26px;height:26px}
.gsltiles{margin-top:12px}.gsltiles .tiles{grid-template-columns:repeat(2,minmax(0,1fr))!important}
@media(max-width:640px){.gsdt3.big b{font-size:1rem}.gsrbar{flex-basis:70px}}
.gshi{display:inline-grid;place-items:center;width:24px;height:24px;margin-right:6px;vertical-align:middle}.gshi svg{width:24px;height:24px}.gswc{margin:14px 0}.gswh{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;margin-bottom:4px}.gswh b{font-size:.78rem;letter-spacing:1px;text-transform:uppercase;color:var(--mut)}.gswh .legend{margin-left:auto;font-size:.72rem}.gswin{width:100%;height:auto;display:block}
.gswa .gswr{display:flex;align-items:center;gap:10px;width:100%;padding:6px 2px;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}.gswn{flex:0 0 130px;font-size:.84rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gswt{flex:1;position:relative;height:12px;border-radius:9px;background:color-mix(in srgb,var(--primary-text-color) 8%,transparent)}.gswt i{position:absolute;top:0;bottom:0;border-radius:9px;background:#2dd4a0}.gswr b{flex:none;font-size:.84rem;min-width:52px;text-align:right}.gswr small{flex:none;font-size:.72rem;color:var(--mut);min-width:34px;text-align:right}
@media(max-width:640px){.gswn{flex-basis:84px}}
.gssh{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.25fr);gap:10px;align-items:center;padding:16px 18px;overflow:hidden;background:radial-gradient(120% 140% at 100% 100%,rgba(45,212,191,.12),transparent 60%),linear-gradient(135deg,#0f2a2a,#0b1418)!important;color:#e6edf3}
.gssl{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;align-items:center;min-width:0}.gsrg{border:0;background:none;padding:0;cursor:pointer;position:relative;display:grid}.gsst2{display:flex;flex-direction:column;min-width:0}.gsst2 small{font-size:.8rem;opacity:.85}.gsst2 .own{color:#fbbf24}.gssh .gsst2 .gsbig{font-size:2.3rem;font-weight:800;line-height:1.05}.gssh .gsbig small{font-size:1.1rem}
.gssh .chip{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.14);color:#e6edf3}.gssum{grid-column:1/-1;font-size:.84rem;opacity:.85}.gssl .chips{grid-column:1/-1;margin:2px 0 0}.gssr{min-width:0}.gsscene{width:100%;height:auto;display:block}
.gsgoal{grid-column:1/-1;display:flex;flex-direction:column;gap:4px;font-size:.78rem;margin-top:4px}.gsgoal i{display:block;height:6px;border-radius:9px;background:rgba(255,255,255,.12);overflow:hidden}.gsgoal i b{display:block;height:100%;background:linear-gradient(90deg,#fbbf24,#34d399)}.gsgoal svg{color:#fbbf24;vertical-align:-2px}
@media(max-width:760px){.gssh{grid-template-columns:1fr}.gssr{order:-1;margin:-6px -6px 0}}
.gsa-soft .gscab{animation:gsflow 2.4s linear infinite}.gsa-full .gscab{animation:gsflow 1s linear infinite}.gsa-full .gsglow{animation:gsglow 1.6s ease-in-out infinite}.gsa-full .gsplq{animation:gsglow 2.2s ease-in-out infinite}
@keyframes gsflow{to{stroke-dashoffset:-20}}@keyframes gsglow{0%,100%{opacity:.1}50%{opacity:.35}}
.gsa-soft .g2prog i,.gsa-full .g2prog i{transition:width 1.2s ease}.gsa-off *{animation:none!important;transition:none!important}
@media(prefers-reduced-motion:reduce){.gscab,.gsglow,.gsplq{animation:none!important}}
.gswh2{display:flex;align-items:baseline;gap:12px;margin:0 2px 12px;font-size:1.05rem}.gswh2 b{color:#34d399;font-size:1.4rem}.gswh2 small{color:var(--mut)}
.gswall{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.gswt2{display:flex;flex-direction:column;gap:14px;min-height:190px;border:0;text-align:left;color:inherit;font:inherit;cursor:pointer;position:relative;overflow:hidden}
.gswt2::before{content:"";position:absolute;top:0;left:25%;right:25%;height:3px;border-radius:0 0 3px 3px;background:#64748b;opacity:.5}.gswt2.run::before{background:#10b981;opacity:1}.gswt2.fresh{box-shadow:0 0 0 2px #2dd4bf,0 0 24px rgba(45,212,191,.45)}.gswt2.fresh::before{background:#2dd4bf;opacity:1}
.gswth{display:flex;align-items:center;gap:12px}.gswth .gsrt b{font-size:1.05rem}.gswtv{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto}.gswtv>b{font-size:1.5rem;font-weight:800}.gswtv .gsrbar{flex:0 1 45%}.g2prog.empty{visibility:hidden}
.gswpg{display:flex;justify-content:center;align-items:center;gap:14px;margin-top:12px}.gswpg .nx{transform:rotate(180deg)}
.gslist.big .gsrow2{padding:14px 16px}.gslist.big .gsrt b{font-size:1rem}
.gsyr h2{display:flex;align-items:center;gap:8px}.gsyrs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:10px}.gsyrs>div{display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;background:color-mix(in srgb,#fbbf24 9%,transparent)}.gsyrs svg{flex:none;width:34px;height:34px}.gsyrs span{display:flex;flex-direction:column;min-width:0}.gsyrs b{font-size:.86rem}.gsyrs small{font-size:.74rem;color:var(--mut)}
.gssby{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;font-size:.8rem;color:var(--mut)}.gssby b{color:var(--primary-text-color)}.gssby em{font-style:normal;font-size:.72rem;color:#fbbf24}
.lgfoot{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin:22px 0 8px;font-size:.74rem;color:var(--mut)}.lgfoot .lnk{font-size:.74rem;opacity:.7}
.lgexd{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}.lgexd p{margin:0;font-size:.92rem;line-height:1.45}
.lgposter{background:#0b0e12;border-radius:14px;padding:10px}
.lgstep{display:inline-flex;align-items:center;gap:8px}.lgstep b{font-size:1.1rem;min-width:52px;text-align:center}
.lgmsg{display:flex;flex-direction:column;gap:3px;background:color-mix(in srgb,var(--primary-text-color) 6%,transparent);border-radius:14px;padding:10px 12px;font-size:.84rem}
.pillbtn.spnb.gold{color:#422006;background:linear-gradient(180deg,#fde68a,#f59e0b);border-color:transparent;box-shadow:0 0 14px rgba(251,191,36,.45)}.spnstar{font-size:15px;line-height:1}
.gsch.spng.sel{color:#fbbf24;border-color:color-mix(in srgb,#fbbf24 60%,transparent);background:color-mix(in srgb,#fbbf24 14%,transparent)}
.spntier{font-style:normal;font-size:.68rem;font-weight:700;color:#fbbf24;background:color-mix(in srgb,#fbbf24 15%,transparent);border-radius:99px;padding:1px 7px;margin-left:4px}
.spna.gold{background:radial-gradient(circle at 35% 30%,#fff3b0,#f59e0b 60%,#b45309);color:#fff}.spnmini.gold{color:#fbbf24}.spnsum b.gd{color:#fbbf24}
.lgt .vrow{flex-wrap:wrap;gap:8px 12px}.lgt .vrow>span:first-child{flex:1 1 180px;min-width:0}.lgt .vrow>.gschs,.lgt .vrow>.btn2,.lgt .vrow>.sw,.lgt .vrow>.lgsoon{flex:none;margin-left:auto}
.lgx .gschs{flex-wrap:wrap}.lgban .btn2{flex:none}
/* Modul 8 v0.6: Fahrzeuge mit eigenem Bild, andere Wallbox über Home Assistant */
.rfpic{flex:none;width:96px;height:38px;display:grid;place-items:center;border-radius:10px;background:color-mix(in srgb,var(--primary-text-color,#e6edf3) 6%,transparent)}
.rfv .oper .btn2{padding:8px 12px;font-size:.84rem}.evprev{border-radius:16px;overflow:hidden;margin:4px 0 6px}.evprev svg{display:block;width:100%;height:auto}
.igwbl{display:grid;gap:8px;margin:4px 0 6px}.igwb{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:1px solid var(--line);border-radius:14px;padding:10px 12px;background:transparent;color:inherit;cursor:pointer;font:inherit}
.igwb.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 10%,transparent)}.igwbi{flex:none;display:grid;place-items:center}.igwbt{flex:1;min-width:0;display:grid;gap:2px}.igwbt small{color:var(--mut)}.igwb .sxc{flex:none}
.igwr{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:4px 14px;align-items:center;padding:6px 0;border-top:1px solid var(--line)}.igwr>div:first-child{display:grid;gap:2px}.igwr small{font-size:.78rem}
@media (max-width:620px){.igwr{grid-template-columns:1fr}.rfv .oper{flex-wrap:wrap}.rfv .oper .btn2{width:100%}}/* Modul 8 v0.7 · Neue Optik: Carport-Szene, Satz-Zeile, Ladeband, Kacheln 2.0, Modus-Karten, Zeitleisten, Register */
.evban{position:relative;overflow:hidden;min-height:250px;padding:0!important;border:0;color:#fff;background:#3f86d6!important}
.evban .evsc{position:absolute;inset:0;width:100%;height:100%;display:block}.evban .evsc.evm{display:none}
.evban .evbt{position:relative;z-index:1;width:52%;min-height:250px;padding:22px 26px;box-sizing:border-box;background:linear-gradient(90deg,rgba(9,14,22,.88) 0%,rgba(9,14,22,.7) 60%,rgba(9,14,22,0) 100%)}
.evban .lbl{max-width:none;opacity:1;font-weight:700;font-size:.8rem;letter-spacing:.05em;text-transform:uppercase;color:#99f6e4}.evban .lbl svg{flex:none}
.evban .big{font-size:3.6rem;max-width:none;display:flex;align-items:baseline;gap:10px;margin-top:8px}.evban .big small{font-size:1.3rem;opacity:.75}
.evban .evto{font-size:1.5rem;font-weight:700;color:#99f6e4}.evban .sub{max-width:none;font-size:.92rem;opacity:.92}
.evban .chips{padding-right:0;margin-top:12px;display:flex;flex-wrap:wrap;gap:8px}.evban .chip{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.14);backdrop-filter:blur(6px);color:#fff;border:0}
.evban .evdot{width:8px;height:8px;border-radius:50%;background:var(--teal);box-shadow:0 0 8px var(--teal)}
.evban .mlogo{top:16px;right:16px;transform:none;width:76px;height:76px;border-radius:22px;background:rgba(15,23,42,.45);backdrop-filter:blur(8px);color:#fff;border-color:rgba(255,255,255,.25)}.evban .mlogo .mlv{font-size:9px}
.evsay{display:flex;align-items:center;gap:12px;background:var(--card);border-radius:16px;padding:11px 14px;margin:0 0 12px;box-shadow:0 0 0 1px color-mix(in srgb,var(--primary-text-color,#e6edf3) 6%,transparent);font-size:.92rem;line-height:1.4}
.evsay>svg{flex:none}.evsay b{color:var(--teal)}.evsay.info b{color:#60a5fa}.evsay.off b{color:var(--mut)}.evsay.bad b{color:#f87171}
.evband{padding:14px 18px 12px!important;margin-bottom:12px}.evbb{position:relative;height:16px;border-radius:999px;background:color-mix(in srgb,var(--primary-text-color,#e6edf3) 9%,transparent);margin-top:18px}
.evbb .f{position:absolute;left:0;top:0;bottom:0;border-radius:999px;background:linear-gradient(90deg,#14b8a6,#2dd4bf)}
.evbb .g{position:absolute;top:0;bottom:0;border-radius:0 999px 999px 0;background:repeating-linear-gradient(135deg,rgba(45,212,191,.38) 0 6px,rgba(45,212,191,.12) 6px 12px)}.evbb .g.run{animation:evband 1.2s linear infinite;background-size:17px 17px}
@keyframes evband{to{background-position:17px 0}}
.evbb .mk{position:absolute;top:-6px;bottom:-6px;width:3px;margin-left:-1.5px;border-radius:2px;background:var(--primary-text-color,#e6edf3)}.evbb .mk.lm{opacity:.35}
.evbb .mk b{position:absolute;bottom:calc(100% + 2px);left:50%;transform:translateX(-50%);font-size:.72rem;white-space:nowrap}.evbb .mk b:not(:only-child){display:none}
.evbl{display:flex;justify-content:space-between;gap:10px;font-size:.8rem;color:var(--mut);margin-top:9px}.evbl b{color:var(--primary-text-color,#e6edf3)}
.evks4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:12px}
.evk{position:relative;background:var(--card);border-radius:18px;padding:13px 15px;min-height:124px;box-shadow:0 0 0 1px color-mix(in srgb,var(--primary-text-color,#e6edf3) 6%,transparent)}
.evkd{position:absolute;right:13px;top:13px;width:9px;height:9px;border-radius:50%;background:var(--mut);opacity:.5}.evk.on .evkd{background:var(--teal);opacity:1;box-shadow:0 0 10px var(--teal)}.evk.warn .evkd{background:#f87171;opacity:1}
.evkh{display:flex;align-items:center;gap:10px;font-size:.84rem;font-weight:600;color:var(--mut)}.evkh>svg,.evkh>div{flex:none}
.evkv{font-size:1.9rem;font-weight:800;margin-top:8px;line-height:1.1}.evkv small{font-size:.95rem;font-weight:600;color:var(--mut);margin-left:4px}.evks{font-size:.78rem;color:var(--mut);margin-top:3px}
.evcols{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:12px;align-items:start}.evcols>div{display:grid;gap:12px}.evcols .card{margin:0}
.evmc h2,.evday h2,.evwhy h2{display:flex;align-items:center;gap:10px;font-size:1rem;margin:0 0 10px}.evmr{margin-left:auto;font-size:.78rem;font-weight:500;color:var(--mut)}
.evmodes{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:8px}
.evmode{display:flex;align-items:center;gap:9px;text-align:left;padding:10px;border-radius:14px;border:0;background:color-mix(in srgb,var(--primary-text-color,#e6edf3) 6%,transparent);color:inherit;font:inherit;cursor:pointer}
.evmode>svg{flex:none}.evmode span{display:grid;gap:2px;min-width:0}.evmode b{font-size:.88rem}.evmode small{font-size:.72rem;color:var(--mut);line-height:1.25}
.evmode.sel{background:linear-gradient(135deg,color-mix(in srgb,var(--teal) 24%,transparent),color-mix(in srgb,var(--teal) 6%,transparent));box-shadow:0 0 0 1.5px var(--teal)}.evmode:disabled{cursor:default;opacity:.6}.evmode.sel:disabled{opacity:.85}
.evtl{position:relative;height:44px;border-radius:12px;background:color-mix(in srgb,var(--primary-text-color,#e6edf3) 6%,transparent);overflow:hidden}
.evtl .s{position:absolute;top:8px;bottom:8px;border-radius:6px}.evtl .p{position:absolute;top:6px;bottom:6px;border-radius:7px;border:1.5px dashed var(--teal);background:color-mix(in srgb,var(--teal) 8%,transparent)}
.evtl .n{position:absolute;top:0;bottom:0;width:2px;background:var(--primary-text-color,#e6edf3)}
.evtx{display:flex;justify-content:space-between;font-size:.7rem;color:var(--mut);margin-top:5px}
.evwl>div{display:grid;grid-template-columns:44px 14px 1fr;gap:8px;align-items:start;padding:7px 0;font-size:.86rem}.evwl time{color:var(--mut);font-variant-numeric:tabular-nums}
.evwl i{width:10px;height:10px;border-radius:50%;margin-top:4px;background:var(--c);box-shadow:0 0 0 4px color-mix(in srgb,var(--c) 22%,transparent)}.evwl small{display:block;color:var(--mut);font-size:.76rem;margin-top:1px}
.evtabs{display:flex;gap:8px;margin:0 0 12px;overflow-x:auto;scrollbar-width:none}.evtabs::-webkit-scrollbar{display:none}
.evtabs button{flex:none;display:flex;align-items:center;gap:7px;padding:8px 15px 8px 10px;border-radius:999px;border:0;background:var(--card);color:var(--mut);font:inherit;font-weight:600;font-size:.88rem;cursor:pointer;box-shadow:0 0 0 1px color-mix(in srgb,var(--primary-text-color,#e6edf3) 6%,transparent)}
.evtabs button.sel{background:var(--teal);color:#042f2e;box-shadow:none}
/* Modul 8 v0.8: Planungsband, Statistik, geschätzter Ladestand */
.evseg{display:inline-flex;flex-wrap:wrap;gap:4px;padding:4px;border-radius:999px;background:color-mix(in srgb,var(--primary-text-color,#e6edf3) 7%,transparent);margin:8px 0 2px}
.evseg button{border:0;background:transparent;color:var(--mut);font:inherit;font-weight:600;font-size:.84rem;padding:7px 13px;border-radius:999px;cursor:pointer}.evseg button.sel{background:var(--teal);color:#042f2e}.evseg button:disabled{cursor:default}
.evplan{margin-bottom:12px}.evpwrap{margin-top:6px}.evpsvg{display:block;width:100%;height:230px}
.evpx{font-size:11px;fill:var(--mut)}.evpx.b{fill:var(--primary-text-color,#e6edf3);font-weight:700}.evpd{stroke:var(--line,#2a3440);stroke-width:1}.evpn{stroke:var(--primary-text-color,#e6edf3);stroke-width:2}
.evpw{fill:color-mix(in srgb,var(--teal) 13%,transparent);stroke:var(--teal);stroke-width:1.4}.evpw.g{fill:rgba(96,165,250,.13);stroke:#60a5fa}.evpwl{font-size:12px;font-weight:700;fill:var(--teal)}.evpwl.g{fill:#60a5fa}
.evpa{fill:var(--card-background-color,#1a2129);opacity:.62}.evpdl{stroke:#f87171;stroke-width:1.6;stroke-dasharray:5 4}.evpdt{font-size:12px;font-weight:700;fill:#f87171}
.evsthd{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 12px}.evsthd .evseg{margin:0}.evnav{display:flex;align-items:center;gap:8px}.evnav b{min-width:150px;text-align:center}
.evnav button{width:34px;height:34px;border-radius:50%;border:0;background:var(--card);color:var(--primary-text-color,#e6edf3);font-size:1.2rem;cursor:pointer;box-shadow:0 0 0 1px color-mix(in srgb,var(--primary-text-color,#e6edf3) 8%,transparent)}.evnav button:disabled{opacity:.35;cursor:default}
.evks5{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:12px}.evd{font-style:normal;font-weight:700;margin-left:4px}.evd.g{color:var(--teal)}.evd.b{color:#f87171}.evd.n{color:var(--mut)}
.evstsvg{display:block;width:100%;height:190px}.evsb{cursor:pointer}.evsb:hover rect[rx]{opacity:.85}
.evses>div{display:grid;grid-template-columns:78px minmax(0,1.2fr) minmax(40px,.7fr) auto;gap:10px;align-items:center;padding:8px 0;border-top:1px solid var(--line,#2a3440)}.evses>div:first-child{border-top:0}
.evses>div.evsed{grid-template-columns:78px minmax(0,1.2fr) minmax(40px,.7fr) auto 18px;cursor:pointer;border-radius:10px;margin:0 -8px;padding:8px}.evses>div.evsed:hover,.evses>div.evsed:focus-visible{background:var(--soft,rgba(127,127,127,.08));outline:0}
.evsedi{color:var(--mut);display:flex;opacity:.55}.evses>div.evsed:hover .evsedi{opacity:1}
.evtag{font-style:normal;font-size:.66rem;font-weight:700;letter-spacing:.02em;margin-left:6px;padding:1px 6px;border-radius:6px;background:color-mix(in srgb,var(--teal) 18%,transparent);color:var(--teal);vertical-align:1px}.evtag.amb{background:color-mix(in srgb,var(--amber) 20%,transparent);color:var(--amber)}
.evtag.neu{background:color-mix(in srgb,var(--mut) 22%,transparent);color:var(--mut)}
.evasg{margin-left:10px;padding:3px 10px;font-size:.76rem;vertical-align:2px}
.evchg{display:flex;flex-direction:column;gap:8px;background:var(--soft,rgba(127,127,127,.08));border-radius:12px;padding:10px 12px;max-height:180px;overflow:auto}.evchg small{color:var(--mut);font-size:.72rem}.evchg ul{margin:2px 0 0;padding-left:18px}.evchg li{font-size:.84rem}
.evsft{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:8px}.evsft .lnk{margin-left:auto}
.evsesh{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:4px 0 12px}.evsesh span{background:var(--soft,rgba(127,127,127,.08));border-radius:12px;padding:8px 10px}.evsesh small{display:block;color:var(--mut);font-size:.72rem}.evsesh b{font-size:1.02rem}
.evses small{display:block;color:var(--mut);font-size:.74rem}.evsk{text-align:right}.evsbar{height:6px;border-radius:9px;background:var(--amber);overflow:hidden}.evsbar i{display:block;height:100%;background:var(--teal)}
.evvr{display:flex;align-items:center;gap:12px;padding:8px 0}.evvt{flex:1;min-width:0}.evvt small{color:var(--mut);font-size:.76rem}.evbb.sm{height:7px;margin:5px 0 4px}
.evcr{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-top:1px solid var(--line,#2a3440)}.evcr small{display:block;color:var(--mut);font-size:.74rem}.evcr>span:last-child{text-align:right}
.evest{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px;margin:10px 0;border-radius:14px;background:color-mix(in srgb,var(--teal) 8%,transparent)}.evest>div{flex:1 1 240px;display:grid;gap:3px}
.evesti{display:flex;align-items:center;gap:6px}.evesti input{width:72px;text-align:right}
.evpdfb{margin-left:auto;flex:none}.evpdft{max-height:340px;overflow:auto;margin-top:8px;border-radius:12px;box-shadow:0 0 0 1px var(--line,#2a3440)}
.evpdft table{width:100%;border-collapse:collapse;font-size:.84rem}.evpdft th,.evpdft td{padding:7px 10px;text-align:left;border-bottom:1px solid var(--line,#2a3440)}.evpdft th:nth-child(n+4),.evpdft td:nth-child(n+4){text-align:right}
.evpdft thead th{position:sticky;top:0;background:var(--card);color:var(--mut);font-weight:600}.evpdft tfoot td{border-bottom:0;text-align:right}.evpdft tfoot td:first-child{text-align:left}
@media (max-width:900px){.evks5{grid-template-columns:repeat(2,minmax(0,1fr))}.evks5>.evk:last-child{grid-column:1/-1}}
@media (max-width:620px){.evpsvg{height:200px}.evses>div{grid-template-columns:64px minmax(0,1fr) auto}.evses>div.evsed{grid-template-columns:64px minmax(0,1fr) auto 16px}.evsbar{display:none}.evnav b{min-width:0}}
@media (max-width:900px){.evks4{grid-template-columns:repeat(2,minmax(0,1fr))}.evcols{grid-template-columns:1fr}.evmodes{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:620px){
  .evban{min-height:0}.evban .evbt{width:100%;min-height:0;padding:16px 16px 158px;background:linear-gradient(180deg,rgba(9,14,22,.9) 0%,rgba(9,14,22,.82) 52%,rgba(9,14,22,0) 72%)}
  .evban .evsc.evd{display:none}.evban .evsc.evm{display:block;top:auto;bottom:0;height:170px}.evban .chip:nth-child(n+3){display:none}.evban .big{font-size:2.8rem}.evban .evto{font-size:1.2rem}.evban .sub{font-size:.84rem}.evban .lbl{padding-right:64px}
  .evban .mlogo{width:52px;height:52px;border-radius:15px;top:12px;right:12px}.evban .mlogo .mlv{display:none}
  .evbl{flex-wrap:wrap}.evbr{display:none}.evk{min-height:112px;padding:12px}.evkv{font-size:1.5rem}.evks4{gap:10px}
  .evmode{padding:9px}.evtabs button{padding:7px 12px 7px 8px;font-size:.84rem}}
.bakhd{margin-top:2px}.bakl{margin-top:6px;display:flex;flex-direction:column;gap:2px;max-height:420px;overflow:auto;border-radius:12px;box-shadow:0 0 0 1px var(--line,#2a3440);padding:4px 10px 8px}
.bakg{font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);margin:10px 0 2px}
.bakr{border-top:1px solid var(--line,#2a3440)}.bakg+.bakr{border-top:0}
.bakrh{all:unset;box-sizing:border-box;width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto 16px;gap:10px;align-items:center;padding:9px 2px;cursor:pointer}.bakrh:focus-visible{outline:2px solid var(--teal);border-radius:8px}
.bakrh b{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bakrh small{color:var(--mut);font-size:.78rem}.bakrh .sxg{color:var(--mut);display:flex;transition:transform .15s;transform:rotate(-90deg)}.bakr.o .bakrh .sxg{transform:rotate(0)}
.bakts{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:0 0 10px}.bakts .btn2{padding:6px 10px;font-size:.8rem;flex:none}.bakts .mut{flex-basis:100%}
.updbox{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 14px;border-radius:14px;background:var(--soft,rgba(127,127,127,.08));margin:4px 0 6px}.updbox .sxi{color:var(--teal)}.updbox.nw{box-shadow:0 0 0 1px var(--amber)}.updbox.nw .sxi{color:var(--amber)}
.updt{flex:1;min-width:180px}.updt b{display:block}.updt small{color:var(--mut);font-size:.8rem}.updb{display:flex;gap:8px;flex-wrap:wrap}.updb .btn2{flex:none;padding:8px 12px}
.evbb .mk.r b{left:auto;right:-2px;transform:none}.evbb .mk.l b{left:-2px;transform:none}
.evban .chip.evpc{border-color:color-mix(in srgb,var(--c) 60%,transparent)}.evban .chip.evpc i{width:8px;height:8px;border-radius:50%;background:var(--c);box-shadow:0 0 6px var(--c)}
.evup0{margin-bottom:12px}.evup0 h2{display:flex;align-items:center;gap:10px;font-size:1rem;margin:0 0 6px}
.evub{position:relative;height:42px;margin:26px 0 0;border-radius:14px;background:color-mix(in srgb,var(--primary-text-color,#e6edf3) 6%,transparent);box-shadow:inset 0 0 0 1px var(--line)}
.evub .z{position:absolute;top:0;bottom:0}.evub .z.no{border-radius:14px 0 0 14px;background:repeating-linear-gradient(135deg,color-mix(in srgb,var(--primary-text-color,#e6edf3) 5%,transparent) 0 6px,transparent 6px 12px)}
.evub .z.p1{background:color-mix(in srgb,#60a5fa 9%,transparent)}.evub .z.p3{border-radius:0 14px 14px 0;background:color-mix(in srgb,#a78bfa 9%,transparent)}
.evub .zl{position:absolute;top:-20px;transform:translateX(-50%);font-size:.72rem;color:var(--mut);white-space:nowrap}
.evub .s{position:absolute;left:0;top:6px;bottom:6px;border-radius:9px;background:linear-gradient(90deg,#14b8a6,var(--teal));box-shadow:0 0 16px color-mix(in srgb,var(--teal) 40%,transparent);transition:width .6s ease}
.evub .g{position:absolute;top:6px;bottom:6px;border-radius:0 9px 9px 0;background:repeating-linear-gradient(135deg,var(--amber) 0 5px,#b45309 5px 10px);opacity:.9;transition:left .6s ease,width .6s ease}
.evub .t{position:absolute;top:-4px;bottom:-4px;border-left:1.5px dashed color-mix(in srgb,var(--primary-text-color,#e6edf3) 35%,transparent)}
.evub .w{position:absolute;top:-7px;bottom:-7px;width:3px;margin-left:-1.5px;border-radius:3px;background:var(--primary-text-color,#e6edf3);box-shadow:0 0 0 3px var(--card);transition:left .6s ease}
.evux{position:relative;height:16px;margin-top:8px;font-size:.72rem;color:var(--mut)}.evux span{position:absolute;transform:translateX(-50%);white-space:nowrap}.evux span.a{transform:none}.evux span.e{transform:translateX(-100%)}
.evul{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;margin-top:12px}.evul .big{font-size:1.5rem;font-weight:800;margin-right:8px}.evul .big small{font-size:.85rem;font-weight:600;color:var(--mut);margin-left:4px}
.evul .evpill{font-size:.83rem;padding:6px 11px;border-radius:12px;background:color-mix(in srgb,var(--primary-text-color,#e6edf3) 5%,transparent);box-shadow:inset 0 0 0 1px var(--line)}.evul .evpill.nt{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--amber) 55%,transparent)}
.evup{position:relative;display:flex;align-items:center;gap:10px;margin-top:12px;padding:9px 12px;border-radius:12px;font-size:.84rem;overflow:hidden;background:color-mix(in srgb,#60a5fa 9%,transparent)}.evup>svg{flex:none}
.evup.go{background:linear-gradient(90deg,color-mix(in srgb,var(--teal) 20%,transparent) var(--p),color-mix(in srgb,var(--teal) 8%,transparent) var(--p))}.evup.go b{color:var(--teal)}
.evup.st{background:linear-gradient(90deg,color-mix(in srgb,var(--amber) 20%,transparent) var(--p),color-mix(in srgb,var(--amber) 8%,transparent) var(--p))}.evup.st b{color:var(--amber)}
.evuleg{margin-top:10px}.evuleg i.nt{background:repeating-linear-gradient(135deg,var(--amber) 0 3px,#b45309 3px 6px)}
.evcal{margin:10px 0 2px;padding:10px 12px;border-radius:14px;background:color-mix(in srgb,#60a5fa 7%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,#60a5fa 25%,var(--line))}.evcal.off{display:flex;gap:8px;align-items:center;background:none;box-shadow:none;padding:4px 0}
.evcalh{display:flex;align-items:center;gap:8px;margin:0 0 4px}.evcalh .lnk{margin-left:auto}.evcalh .ic{color:#60a5fa}
.evkw{flex:0 1 160px;min-width:0;font:inherit;padding:7px 10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--primary-text-color)}
.evcaln{display:flex;gap:8px;align-items:flex-start;margin-top:8px;padding:8px 10px;border-radius:10px;font-size:.84rem;background:color-mix(in srgb,#60a5fa 12%,transparent)}.evcaln .ic{color:#60a5fa;flex:none;margin-top:2px}
.evfc{margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}.evfch{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin:0 0 8px}.evfch .mut{margin-left:auto}.evfcl{display:inline-flex;align-items:center;gap:5px;font-size:.74rem;color:var(--mut);margin-left:8px}.evfcl i{width:10px;height:10px;border-radius:3px;margin-left:6px}.evfcl i.no{background:color-mix(in srgb,var(--primary-text-color,#e6edf3) 16%,transparent)}.evfcl i.p1{background:color-mix(in srgb,var(--teal) 70%,#60a5fa)}.evfcl i.p3{background:var(--teal)}
.evfcb{display:flex;align-items:flex-end;gap:2px;height:44px}.evfcb i{flex:1;min-width:2px;border-radius:3px 3px 1px 1px;background:color-mix(in srgb,var(--primary-text-color,#e6edf3) 16%,transparent)}
.evfcb i.p1{background:color-mix(in srgb,var(--teal) 70%,#60a5fa)}.evfcb i.p3{background:var(--teal);box-shadow:0 0 8px color-mix(in srgb,var(--teal) 45%,transparent)}.evfcb i:first-child{outline:2px solid var(--primary-text-color,#e6edf3);outline-offset:1px}
.evfcx{position:relative;height:15px;margin-top:4px;font-size:.7rem;color:var(--mut)}.evfcx span{position:absolute;transform:translateX(-50%);white-space:nowrap}.evfcx span:first-child{transform:none;left:0!important}.evfcx span:last-child{transform:translateX(-100%)}
.evwall .evwg{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:14px;align-items:start}.evwall .evwg>div>.card{margin-bottom:12px}
.evwc h2{display:flex;align-items:center;gap:10px;font-size:1.1rem;margin:0 0 12px}
.evwm{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.evwm.q{grid-template-columns:repeat(3,1fr)}
.evwb{all:unset;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:96px;padding:12px 8px;border-radius:18px;cursor:pointer;text-align:center;font-size:1rem;background:color-mix(in srgb,var(--primary-text-color,#e6edf3) 5%,transparent);box-shadow:inset 0 0 0 1px var(--line);-webkit-tap-highlight-color:transparent}
.evwm.q .evwb{min-height:78px;font-size:.88rem}.evwb:active{transform:scale(.97)}.evwb[disabled]{opacity:.45;cursor:default}
.evwb.sel{background:color-mix(in srgb,var(--teal) 16%,transparent);box-shadow:inset 0 0 0 2px var(--teal)}.evwb.sel b{color:var(--teal)}
.evwq{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:16px;background:color-mix(in srgb,var(--teal) 12%,transparent)}.evwq span{flex:1}.evwq small{display:block;color:var(--mut)}
.evwb.stop{flex:none;min-height:56px;padding:8px 22px;flex-direction:row;font-weight:700;background:color-mix(in srgb,#f87171 18%,transparent);box-shadow:inset 0 0 0 1px #f8717188}
.evwfull{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:16px;min-height:52px}.evwback{display:flex;align-items:center;gap:8px;margin:0 0 12px;min-height:46px}
@media (max-width:900px) and (orientation:portrait){.evwall .evwg{grid-template-columns:1fr}}
.evkm{margin-bottom:14px}.evkm4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.evkmk{border-radius:16px;padding:12px 14px;background:linear-gradient(160deg,color-mix(in srgb,var(--a) 11%,var(--card)),var(--card) 70%);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--a) 20%,var(--line))}
.evkmk .evkh{display:flex;align-items:center;gap:8px;font-size:.84rem;color:var(--mut)}.evkmk .evkv{font-size:1.5rem;font-weight:800;margin-top:4px}.evkmk .evkv small{font-size:.82rem;font-weight:600;color:var(--mut);margin-left:3px}.evkmk .evks{font-size:.77rem;color:var(--mut)}
.evkmc{display:flex;align-items:flex-end;gap:3px;height:140px;margin-top:6px;border-bottom:1px solid var(--line);padding-bottom:16px;position:relative}
.evkmc button{all:unset;flex:1;min-width:3px;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;cursor:pointer;position:relative}
.evkmc button i{display:block;width:100%;height:var(--h);border-radius:4px 4px 1px 1px;background:linear-gradient(0deg,var(--amber) var(--g),var(--teal) var(--g))}
.evkmc button.nl i{background:#60a5fa}.evkmc button.z i{background:color-mix(in srgb,var(--primary-text-color,#e6edf3) 10%,transparent)}.evkmc button:hover i{filter:brightness(1.2)}
.evkmc button span{position:absolute;bottom:-16px;font-size:.68rem;color:var(--mut);white-space:nowrap}
.evkmm{display:flex;gap:10px;align-items:flex-start;margin-top:14px;padding:10px 12px;border-radius:14px;background:color-mix(in srgb,#60a5fa 8%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,#60a5fa 28%,var(--line))}.evkmm>.ic{color:#60a5fa;flex:none;margin-top:2px}.evkmm>div{flex:1;min-width:0}.evkmm small{display:block;color:var(--mut);font-size:.8rem}
.evkmr{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:8px}.evkmr>span{flex:1 1 160px;font-weight:650}.evkmr input{width:120px;text-align:right;flex:none}.evkmr .btn2{flex:none;width:auto;padding:8px 16px}
.evkm2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}.evkm2>.card{margin:0}
.evkmtb{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;height:160px;align-items:end}.evkmtb>div{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:3px}
.evkmtb span{width:68%;border-radius:8px 8px 3px 3px;background:var(--c);opacity:.85}.evkmtb span.nd{opacity:.25}.evkmtb b{font-size:1rem}.evkmtb small{font-size:.72rem;color:var(--mut)}
.evkmf{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.evkmf>div{padding:10px 12px;border-radius:12px;background:color-mix(in srgb,var(--primary-text-color,#e6edf3) 4%,transparent);box-shadow:inset 0 0 0 1px var(--line)}.evkmf b{display:block;color:var(--teal)}.evkmf small{color:var(--mut);font-size:.76rem}
.evkmh{display:flex;gap:10px;align-items:center;margin-top:10px;padding:9px 12px;border-radius:12px;background:color-mix(in srgb,#60a5fa 9%,transparent);font-size:.85rem}.evkmh>svg{flex:none}
.evkmyb{position:relative;height:16px;border-radius:99px;background:color-mix(in srgb,var(--primary-text-color,#e6edf3) 9%,transparent);margin:14px 0 8px}.evkmyb .f{position:absolute;left:0;top:0;bottom:0;border-radius:99px;background:linear-gradient(90deg,#14b8a6,var(--teal))}
.evkmyb .p{position:absolute;top:0;bottom:0;border-radius:0 99px 99px 0;background:repeating-linear-gradient(135deg,rgba(45,212,191,.38) 0 6px,rgba(45,212,191,.12) 6px 12px)}.evkmyb .m{position:absolute;top:-6px;bottom:-6px;width:3px;margin-left:-1.5px;border-radius:2px;background:var(--primary-text-color,#e6edf3)}
.evkmst{display:inline-flex;align-items:center;gap:5px;font-size:.8rem;font-weight:700;padding:4px 10px;border-radius:99px}.evkmst.ok{background:color-mix(in srgb,#34d399 15%,transparent);color:#34d399}.evkmst.warn{background:color-mix(in srgb,#f59e0b 16%,transparent);color:#f59e0b}.evkmst.bad{background:color-mix(in srgb,#f87171 16%,transparent);color:#f87171}
@media (max-width:760px){.evkm4{grid-template-columns:1fr 1fr}.evkm2{grid-template-columns:1fr}.evkmk .evkv{font-size:1.25rem}}
.evmrg{display:flex;gap:10px;align-items:center;margin-top:12px;padding:10px 12px;border-radius:12px;background:color-mix(in srgb,#60a5fa 9%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,#60a5fa 28%,var(--line))}.evmrg>.ic{color:#60a5fa;flex:none}.evmrg>span{flex:1;min-width:0}.evmrg small{display:block;color:var(--mut);font-size:.8rem}.evmrg .btn2{flex:none}
.evtks{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin:0 0 14px}
.evtk{padding:9px 12px;border-radius:12px;background:color-mix(in srgb,var(--a) 9%,transparent);box-shadow:inset 3px 0 0 var(--a)}.evtk small{display:block;font-size:.74rem;color:var(--mut)}.evtk b{display:block;font-size:1.15rem}.evtk span{font-size:.74rem;color:var(--mut)}
.evtw{display:grid;gap:8px}.evtln,.evtax{display:grid;grid-template-columns:62px 1fr;gap:8px;align-items:center}.evtll{font-size:.74rem;color:var(--mut);text-align:right}
.evtlt{position:relative;height:36px;border-radius:10px;background:color-mix(in srgb,var(--primary-text-color,#e6edf3) 5%,transparent)}
.evtlt i.g{position:absolute;top:0;bottom:0;width:1px;background:color-mix(in srgb,var(--primary-text-color,#e6edf3) 9%,transparent)}
.evtlt i.n{position:absolute;top:-4px;bottom:-4px;width:2px;margin-left:-1px;border-radius:2px;background:var(--primary-text-color,#e6edf3);z-index:2}
.evtb{position:absolute;top:5px;bottom:5px;border-radius:7px;min-width:4px;background:linear-gradient(90deg,var(--teal) var(--s),var(--amber) var(--s));display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.25)}
.evtb span,.evtp span{font-size:.72rem;font-weight:700;color:#06231f;white-space:nowrap;padding:0 6px;text-shadow:0 0 6px rgba(255,255,255,.35)}
.evtb.run{animation:evpulse 1.6s ease-in-out infinite}
.evtp{position:absolute;top:5px;bottom:5px;border-radius:7px;border:1.5px dashed #60a5fa;background:color-mix(in srgb,#60a5fa 12%,transparent);display:flex;align-items:center;justify-content:center;overflow:hidden}.evtp span{color:#93c5fd;text-shadow:none}
.evtax>div{position:relative;height:16px;font-size:.7rem;color:var(--mut)}.evtax>div span,.evtax>div em{position:absolute;transform:translateX(-50%);white-space:nowrap}.evtax>div span:last-of-type{transform:translateX(-85%)}.evtax em{font-style:normal;font-weight:700;color:var(--primary-text-color,#e6edf3);top:0;background:var(--card);padding:0 3px;border-radius:4px}
.evtrs{display:grid;gap:6px;margin-top:12px;border-top:1px solid var(--line);padding-top:10px}
.evtr{display:grid;grid-template-columns:minmax(110px,auto) 1fr auto;gap:12px;align-items:center}.evtr small{display:block;font-size:.74rem;color:var(--mut)}.evtrv{text-align:right}
.evtrb{height:8px;border-radius:99px;background:var(--amber);overflow:hidden}.evtrb i{display:block;height:100%;background:var(--teal)}
@media (max-width:620px){.evtln,.evtax{grid-template-columns:50px 1fr;gap:6px}.evtr{grid-template-columns:auto 1fr auto;gap:8px}}
@media (max-width:700px){.evub .zl.hm{display:none}.evul .big{font-size:1.3rem;width:100%}}
.hsm20{all:unset;box-sizing:border-box;display:flex;gap:8px;align-items:flex-start;width:100%;cursor:pointer;padding:9px 12px;border-radius:12px;margin:6px 0;background:color-mix(in srgb,#f5c451 14%,transparent);color:var(--primary-text-color);font-size:.84rem}.hsm20 .ic{color:#f5c451;flex:none;margin-top:2px}
`;
