const CSS = `
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
.labk{position:relative;display:flex;flex-direction:column;gap:6px;border-radius:16px;border:1px solid var(--line);background:var(--card-background-color,#1c1c1c);padding:12px}.labk.on{border-color:#8b5cf6;box-shadow:0 0 0 1px #8b5cf6 inset}.labk.soon{opacity:.75}
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
.mbar{display:flex;gap:8px;overflow-x:auto;max-width:1180px;margin:0 auto;padding:12px 14px 0;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scroll-snap-type:x proximity;scroll-padding:0 14px;touch-action:pan-x pan-y}
.mbar::-webkit-scrollbar{display:none}
.mtab{scroll-snap-align:start;position:relative;flex:none;display:flex;align-items:center;gap:10px;border:1px solid var(--line);background:var(--card);border-radius:16px;padding:8px 14px 8px 11px;cursor:pointer;text-align:left;color:var(--mut)}
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
`;
