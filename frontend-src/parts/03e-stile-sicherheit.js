/* Modul 11 · Neue Optik (v0.7) */
const CSS_SF2 = `
.sfbn{position:relative;display:grid;grid-template-columns:1fr minmax(200px,330px);gap:6px;align-items:center;min-height:178px;padding:18px 20px;border:0;border-radius:22px;overflow:hidden;color:#fff;background:linear-gradient(135deg,#064e3b,#0f766e 62%,#115e59)}
.sfbn.warn{background:linear-gradient(135deg,#78350f,#b45309 62%,#92400e)}.sfbn.alarm{background:linear-gradient(135deg,#7f1d1d,#b91c1c 62%,#991b1b)}
.sfbl{display:flex;align-items:center;gap:6px;font-size:.72rem;letter-spacing:.08em;font-weight:700;opacity:.85;text-transform:uppercase}
.sfbb{font-size:2rem;font-weight:800;letter-spacing:-.02em;line-height:1.1;margin:6px 0 4px}.sfbs{font-size:.9rem;opacity:.88;margin-bottom:10px}
.sfbn .chips{display:flex;flex-wrap:wrap;gap:6px}.sfbn .chip{background:rgba(0,0,0,.28);color:#fff}.sfbn .chip.warn{background:rgba(255,255,255,.2)}
.sfbi{position:relative;margin:-14px -12px -16px 0;display:flex;justify-content:flex-end}.sfbi svg{width:100%;max-width:330px;height:auto;display:block}
.sfbn>.mlv{position:absolute;right:14px;bottom:10px}
.sfbi[data-an=voll] .sfr1{animation:sfr 1.6s ease-out infinite;transform-box:fill-box;transform-origin:center}.sfbi[data-an=voll] .sfr2{animation:sfr 1.6s ease-out .5s infinite;transform-box:fill-box;transform-origin:center}
@keyframes sfr{0%{transform:scale(.7);opacity:.7}100%{transform:scale(1.5);opacity:0}}@media(prefers-reduced-motion:reduce){.sfbi .sfr1,.sfbi .sfr2{animation:none!important}}
@media(max-width:640px){.sfbn{grid-template-columns:1fr;padding:16px 16px 30px}.sfbi{order:-1;margin:-8px -6px 0;justify-content:center}.sfbi svg{max-width:260px}.sfbb{font-size:1.5rem}}
.sfbeta{display:flex;align-items:center;justify-content:space-between;gap:10px;background:color-mix(in srgb,var(--card) 70%,transparent);border:1px solid var(--line);border-radius:12px;padding:5px 8px 5px 14px;margin:10px 0;font-size:.8rem;color:var(--mut)}.sfbeta a{color:var(--teal,#2dd4bf)}
.sfbeta .ibtn{width:28px;height:28px}
.sfkts{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:0 0 12px}
.sfkt{position:relative;text-align:left;display:grid;gap:2px;align-content:start;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 12px 11px;color:var(--text,inherit);cursor:pointer;font:inherit;min-width:0}
.sfkt>svg{color:var(--teal,#2dd4bf);margin-bottom:6px}.sfkt i{position:absolute;right:12px;top:12px;width:9px;height:9px;border-radius:50%}
.sfkt small{color:var(--mut);font-size:.74rem}.sfkt b{font-size:1.02rem;line-height:1.2}.sfkt em{font-style:normal;color:var(--mut);font-size:.72rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media(max-width:900px){.sfkts{grid-template-columns:repeat(2,1fr)}.sfkts .sfkt:last-child{grid-column:span 2}}
.sftl2{display:grid;gap:2px}.sftr{display:grid;grid-template-columns:64px 1fr;gap:8px;align-items:center;margin:6px 0}.sftr small{color:var(--mut);font-size:.74rem}
.sftb{position:relative;height:16px;background:color-mix(in srgb,var(--mut) 14%,transparent);border-radius:9px}.sftb span{position:absolute;top:4px;width:8px;height:8px;border-radius:50%;margin-left:-4px}
.sfta{display:flex;justify-content:space-between;margin-left:72px;font-size:.68rem;color:var(--mut)}
.sfmg{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,230px),1fr));gap:10px}
.sfnc{text-align:left;display:grid;gap:9px;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:12px 13px;color:var(--text,inherit);font:inherit;cursor:pointer;min-width:0}
.sfnc.alarm{background:linear-gradient(180deg,color-mix(in srgb,#ef4444 24%,var(--card)),color-mix(in srgb,#ef4444 8%,var(--card)))}
.sfnc[disabled]{cursor:default;opacity:1}
.sfnt{display:flex;align-items:center;gap:9px}.sfmi{display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:14px;background:color-mix(in srgb,var(--mut) 12%,transparent)}
.sfmn{flex:1;min-width:0}.sfmn b{display:block;font-size:.92rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sfmn small{color:var(--mut);font-size:.74rem}.sfmm{color:var(--mut)}
.sfms{display:flex;align-items:center;gap:7px;font-size:.88rem}.sfms i{width:9px;height:9px;border-radius:50%}
.sfmb{display:flex;align-items:center;gap:9px}.sfmx b{display:block;font-size:.78rem;font-weight:600}.sfmx small{color:var(--mut);font-size:.72rem}.sfmq{width:38px;text-align:center;color:var(--mut)}
.sfrg{stroke:color-mix(in srgb,var(--mut) 28%,transparent);stroke-width:4}.sfrt{font-size:10px;font-weight:700;fill:currentColor}
.sfnd .sfnc{margin:0}.sfgr{width:100%;height:auto;display:block}.sfgl{fill:none;stroke:#2dd4bf;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}.sfgf{fill:none;stroke:#f59e0b;stroke-width:2;stroke-dasharray:5 5}.sfgp{fill:#f59e0b;stroke:var(--card);stroke-width:2}
.sfgth{stroke:#ef4444;stroke-width:1;stroke-dasharray:3 4;opacity:.7}.sfgtx{font-size:8px;fill:var(--mut)}.sfgn{padding:6px 0}
.sfpn{display:flex;align-items:center;gap:7px;margin-top:8px;font-size:.86rem;color:#fbbf24}
.sfjw{overflow-x:auto}.sfjb{width:100%;border-collapse:collapse;min-width:520px;table-layout:fixed}.sfjb th{display:flex;align-items:center;gap:8px;text-align:left;font-size:.8rem;font-weight:600;padding:3px 0;width:170px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sfjb td{width:calc((100% - 170px) / 12);text-align:center;border-bottom:1px solid color-mix(in srgb,var(--line) 70%,transparent);height:32px}.sfjb td.m{height:auto;border:0;font-size:.68rem;color:var(--mut)}.sfjb td.now{background:color-mix(in srgb,var(--teal,#2dd4bf) 8%,transparent)}
.sfwd{display:inline-grid;place-items:center;width:19px;height:19px;border-radius:50%;color:#052e16}.sfwd.g{background:#34d399}.sfwd.b{background:#38bdf8;color:#0c4a6e}.sfwd.w{border:2px solid #fbbf24}
.sflg{display:flex;gap:14px;flex-wrap:wrap;font-size:.74rem;color:var(--mut);margin-top:8px}.sflg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}.sflg i.ring{border:2px solid #fbbf24;width:5px;height:5px}
.sfbp{display:grid;grid-template-columns:minmax(90px,1.2fr) 2fr minmax(70px,.9fr);gap:10px;align-items:center;width:100%;text-align:left;background:none;border:0;padding:6px 0;color:inherit;font:inherit;font-size:.84rem;cursor:pointer}.sfbp b{text-align:right;font-size:.8rem}.sfbp span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sfdoc{background:#f8fafc;color:#0f172a;border-radius:10px;padding:11px 12px}.sfdoc b{display:block;font-size:.86rem}.sfdoc small{color:#64748b;font-size:.72rem}.sfdoc i{display:block;height:5px;background:#cbd5e1;border-radius:3px;margin-top:8px}.sfdoc i.s{width:60%}
/* v0.8 · Ausgeschaltete Melder, Stufen, Alarm-Ansicht, Fluchtweg */
.sfbn{padding-bottom:34px}
.sfnc.pause{opacity:.66;border-style:dashed;background:color-mix(in srgb,var(--card) 82%,transparent)}.sfnc.pause .sfmi{filter:grayscale(1)}
.sfhintc{display:flex;align-items:center;gap:12px;flex-wrap:wrap;background:var(--card);border:1px solid color-mix(in srgb,#f59e0b 42%,var(--line));border-radius:16px;padding:10px 12px;margin:0 0 10px}
.sfhi{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,#f59e0b 16%,transparent);color:#fbbf24;flex:none}
.sfht{flex:1;min-width:180px}.sfht b{display:block;font-size:.92rem}.sfht small{color:var(--mut);font-size:.78rem}
.sfhb{display:flex;gap:6px;flex-wrap:wrap}.sfhb .btn2{flex:none;padding:8px 14px}
.sfstg{display:flex;align-items:center;gap:10px;background:color-mix(in srgb,var(--mut) 8%,transparent);border-radius:14px;padding:9px 11px;margin:6px 0}
.sfsn{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:800;font-size:.75rem;flex:none}
.sfst2{flex:1;min-width:0}.sfst2 b{display:block;font-size:.9rem}.sfst2 small{font-size:.74rem}.sfsub{margin:0 0 6px 32px}
.sfesc{stroke:#34d399;stroke-width:4;stroke-dasharray:10 8;fill:none;stroke-linecap:round;pointer-events:none}.sfesd{fill:none;stroke:#34d399;stroke-width:3;pointer-events:none}
.sfhe{color:#34d399}.sfhe b{color:inherit}
.sfalov{position:fixed;inset:0;z-index:60;background:rgba(20,0,0,.9)}
.sfal{position:fixed;z-index:61;inset:3vh 3vw;display:grid;grid-template-columns:1.1fr 1fr;gap:22px;padding:24px;border-radius:26px;overflow:auto;color:#fff;background:linear-gradient(160deg,#7f1d1d,#450a0a);border:3px solid #ef4444;box-shadow:0 0 0 6px rgba(239,68,68,.25),0 30px 80px rgba(0,0,0,.6)}
.sfalt{display:grid;gap:10px;align-content:start;min-width:0}.sfalt>b{font-size:clamp(1.6rem,4vw,2.6rem);line-height:1.1;letter-spacing:-.02em}.sfalt>small{font-size:1rem;color:#fecaca}
.sfalp{width:max-content;background:rgba(255,255,255,.2);color:#fecaca;font-size:.74rem;letter-spacing:.08em;font-weight:800;border-radius:99px;padding:4px 11px}
.sfalm{display:flex;flex-wrap:wrap;gap:6px}.sfalm span{background:rgba(255,255,255,.16);border-radius:99px;padding:3px 10px;font-size:.78rem}
.sfals{display:grid;gap:7px;margin-top:6px}.sfals>div{display:flex;align-items:center;gap:10px;background:rgba(0,0,0,.25);border-radius:13px;padding:9px 12px;font-size:.92rem}
.sfals i{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-weight:800;font-size:.76rem;background:rgba(255,255,255,.22);flex:none}
.sfals .d i{background:#34d399;color:#052e2b}.sfals .n i{background:#fbbf24;color:#451a03}.sfals span{flex:1;min-width:0}.sfals span small{display:block;color:#fecaca;font-size:.74rem}.sfals em{font-style:normal;color:#fecaca;font-size:.82rem;white-space:nowrap}
.sfalf{display:flex;align-items:center;gap:8px;color:#bbf7d0;font-size:.86rem}
.sfalr{display:grid;gap:12px;align-content:start;min-width:0}.sfali svg{width:100%;max-width:420px;height:auto;display:block;margin:0 auto}
.sfok{background:#fff;color:#7f1d1d;border:0;border-radius:20px;font:inherit;font-weight:900;font-size:1.5rem;padding:20px 0;cursor:pointer;width:100%}
.sffc{display:flex;flex-wrap:wrap;gap:7px}.sffc button,.sffc a{background:rgba(255,255,255,.18);color:#fff;border:0;border-radius:99px;font:inherit;font-size:.84rem;padding:8px 14px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:6px}
.sffc .sf112{background:rgba(0,0,0,.35)}
@media (max-width:760px),(orientation:portrait){.sfal{grid-template-columns:1fr;inset:0;border-radius:0;padding:18px 16px}.sfalr{order:2}.sfali svg{max-width:260px}}
/* v0.8 · Reiter in der neuen Optik: Symbol-Kachel an Karten, Kennzahlen, Melderliste, Sprungleiste */
.sfv9 .card.sfc>h2>svg:first-child{box-sizing:content-box;width:16px;height:16px;padding:6px;border-radius:10px;background:color-mix(in srgb,var(--teal,#2dd4bf) 14%,transparent);color:var(--teal,#2dd4bf);flex:none}
.sfk3{grid-template-columns:repeat(3,1fr)}.sfk4{grid-template-columns:repeat(4,1fr)}
.sfk3 .sfkt,.sfk4 .sfkt{cursor:default}
@media(max-width:900px){.sfk3{grid-template-columns:1fr}.sfk4{grid-template-columns:repeat(2,1fr)}.sfk4 .sfkt:last-child{grid-column:auto}.sfk3 .sfkt:last-child{grid-column:auto}}
.sfleg{display:flex;gap:11px;flex-wrap:wrap;font-size:.72rem;color:var(--mut);font-weight:500}.sfleg i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;vertical-align:middle}
.sflr{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:none;border:1px solid transparent;border-radius:14px;padding:7px 8px;color:inherit;font:inherit;cursor:pointer;margin:2px 0}
.sflr:hover{background:color-mix(in srgb,var(--mut) 8%,transparent)}.sflr.on{background:color-mix(in srgb,var(--teal,#2dd4bf) 10%,transparent);border-color:color-mix(in srgb,var(--teal,#2dd4bf) 45%,transparent)}
.sflr .sfmi{width:34px;height:34px;border-radius:11px}.sflr .sfmn b{font-size:.88rem}.sfls{margin-left:auto;display:flex;align-items:center;gap:6px;font-size:.78rem;font-weight:700;white-space:nowrap}.sfls i{width:8px;height:8px;border-radius:50%}
.sfnx{background:none;border:0;color:inherit;font:inherit;width:100%;text-align:left}button.sfnx{cursor:pointer}
.sfwg{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:10px}
.sfwg .sfwr{flex-direction:column;align-items:stretch;gap:8px;background:color-mix(in srgb,var(--mut) 7%,transparent);border:1px solid var(--line);border-radius:16px;padding:11px 12px;margin:0}
.sfwg .sfwr2{align-self:flex-start;flex-direction:row;align-items:center;gap:10px}
.sfnav{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 12px}.sfnav button{display:inline-flex;align-items:center;gap:6px;border:0;border-radius:999px;background:color-mix(in srgb,var(--mut) 12%,transparent);color:var(--text,inherit);font:inherit;font-size:.78rem;font-weight:700;padding:6px 13px;cursor:pointer}
.sfnav button:hover{background:color-mix(in srgb,var(--teal,#2dd4bf) 18%,transparent);color:var(--teal,#2dd4bf)}
.sflegw{margin:-4px 0 10px}
.sfv9{min-width:0;max-width:100%}.sfv9 .card,.sfv9 .enco,.sfv9 .enc{min-width:0;max-width:100%}.sfv9 .sfjw{max-width:100%;overflow-x:auto}
/* v0.9 · Grundriss 2.0 */
.sfhalo{pointer-events:none}.sfpe .sfhalo{opacity:.55}
.sfr.wn{fill:#f59e0b1c}
.sfesc{stroke-width:5;stroke-linejoin:round;filter:drop-shadow(0 0 3px rgba(52,211,153,.6))}
@media(prefers-reduced-motion:no-preference){.sfesc{animation:sfdash 1.2s linear infinite}}
@keyframes sfdash{to{stroke-dashoffset:-36}}
.sfesa{fill:#34d399;pointer-events:none}.sfesb{fill:#064e3b;stroke:#34d399;stroke-width:1.5;pointer-events:none}.sfest{fill:#6ee7b7;font-size:12px;font-weight:700;text-anchor:middle;pointer-events:none}
.sfpm{width:100%;height:auto;display:block;border:1px solid rgba(255,255,255,.2);border-radius:16px;background:rgba(0,0,0,.28);--sfw:#9aa7b7}
.sftb2{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}.sftb2 .btn2{flex:none;padding:7px 12px;font-size:.8rem}.sftb2 .btn2[disabled]{opacity:.4;cursor:default}

/* Einstellungsfenster + Auswahlmenüs in der neuen Optik */
.sheet.sfm .sfmb{display:grid;gap:12px;padding-bottom:8px}.sheet.sfm .sfmc{margin:0}.sheet.sfm .sfmc h2{font-size:1rem}
.sheet.sfm .sfmc .vrow{padding:10px 0;border-top:1px solid var(--line);margin:0}.sheet.sfm .sfmc .vrow:first-of-type{border-top:0}
.sheet.sfm .foot2{position:sticky;bottom:0;padding:12px 0 2px;background:linear-gradient(transparent,var(--card-background-color,var(--primary-background-color)) 40%)}
.sheet.sfm .ohint{border-radius:14px;background:rgba(255,255,255,.03)}
.sheet.sfm .gschips{gap:8px}.sheet.sfm .gsch{border-radius:999px;padding:9px 16px}
.sheet.sfm .rfv,.sfpe .rfv{border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.03);padding:12px 14px}
select.osel{-webkit-appearance:none;appearance:none;width:100%;min-height:46px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.04) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 14px center;padding:10px 40px 10px 14px;font-weight:600;color:var(--primary-text-color);transition:border-color .15s,box-shadow .15s}
select.osel:focus{outline:0;border-color:#2dd4bf;box-shadow:0 0 0 3px rgba(45,212,191,.22)}
select.osel option{background:#1c1f24;color:#e5e7eb}

/* Menüstruktur v0.9: Melder-Reiter, Melder-Seite, Auswahl-Seite, Bereichs-Reiter */
.sfgh{display:flex;align-items:center;gap:8px;margin:16px 4px 8px;font-size:.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--mut,#8b95a3)}.sfgh small{font-weight:700;opacity:.8}
.sfrow{display:flex;align-items:center;gap:12px;width:100%;text-align:left;font:inherit;color:inherit;background:var(--card-background-color,rgba(255,255,255,.03));border:1px solid var(--line,#232831);border-radius:18px;padding:12px 14px 12px 16px;margin-bottom:8px;position:relative;overflow:hidden;cursor:pointer}
.sfrow:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:#34d399}.sfrow.warn:before{background:#f59e0b}.sfrow.alarm:before{background:#ef4444}.sfrow.off:before,.sfrow.pause:before,.sfrow.o:before{background:#64748b}
.sfrow.alarm{border-color:#ef444477;background:linear-gradient(90deg,#ef44441f,transparent)}.sfrow.o{cursor:default}
.sfri{flex:none;display:grid;place-items:center}.sfrt{min-width:0;flex:1}.sfrt b{display:block;font-size:.95rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sfrt small{display:block;color:var(--mut,#8b95a3);font-size:.78rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sfrs{text-align:right;flex:none}.sfrs b{display:block;font-size:.8rem;font-weight:800}.sfbar{display:block;width:56px;height:6px;border-radius:4px;background:rgba(255,255,255,.12);margin:6px 0 0 auto;overflow:hidden}.sfbar u{display:block;height:100%;border-radius:4px}
.sfback{margin:2px 0 12px}.sfback button{display:inline-flex;align-items:center;gap:6px;font:inherit;font-weight:800;color:#2dd4bf;background:none;border:0;padding:6px 4px;cursor:pointer}
.sfdh{display:flex;align-items:center;gap:16px;padding:16px;border-radius:22px;margin-bottom:12px;border:1px solid rgba(45,212,191,.25);background:linear-gradient(135deg,rgba(45,212,191,.14),rgba(255,255,255,.02))}.sfdh.warn{border-color:#f59e0b55;background:linear-gradient(135deg,#f59e0b24,rgba(255,255,255,.02))}.sfdh.alarm{border-color:#ef444488;background:linear-gradient(135deg,#ef444430,rgba(255,255,255,.02))}.sfdh.off,.sfdh.pause{border-color:#64748b55;background:rgba(255,255,255,.03)}
.sfdr{flex:none;width:76px;height:76px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--c) calc(var(--p)*1%),rgba(255,255,255,.12) 0)}.sfdr i{font-style:normal;width:58px;height:58px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:1.1rem;background:var(--card-background-color,#171a20)}
.sfdt{min-width:0}.sfdt b{display:block;font-size:1.1rem}.sfdt small{display:block;color:var(--mut,#8b95a3);margin:2px 0 5px}.sfdt em{font-style:normal;font-weight:800;font-size:.85rem}
.sfhl{font-size:.78rem;font-weight:700;color:var(--mut,#8b95a3);margin:14px 0 8px}
.sfat{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.sfat button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 6px;font:inherit;font-size:.8rem;color:inherit;background:rgba(255,255,255,.04);border:1px solid var(--line,#232831);border-radius:16px;cursor:pointer}.sfat button.on{border-color:#2dd4bf;background:linear-gradient(160deg,rgba(45,212,191,.2),rgba(255,255,255,.02));color:#5eead4}.sfat b{font-weight:700}
.sfpkb{display:flex;align-items:center;gap:10px;width:100%;text-align:left;font:inherit;color:inherit;min-height:48px;padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid var(--line,#232831);border-radius:14px;cursor:pointer}.sfpkb.set{border-color:rgba(45,212,191,.45)}.sfpkt{flex:1;min-width:0}.sfpkt b{display:block;font-size:.9rem}.sfpkt small{display:block;color:var(--mut,#8b95a3);font-size:.74rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sfpk .sfttl{font-size:1.2rem;font-weight:800;margin:0 2px 10px}.sfpq{margin:0 0 10px;min-height:46px;border-radius:14px}.sfprl{display:grid;gap:6px}
.sfpr{display:flex;align-items:center;gap:12px;width:100%;text-align:left;font:inherit;color:inherit;padding:10px 12px;background:rgba(255,255,255,.04);border:1px solid var(--line,#232831);border-radius:14px;cursor:pointer}.sfpr[hidden]{display:none}.sfpr.on{border-color:#2dd4bf;background:rgba(45,212,191,.12)}.sfpi{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:rgba(45,212,191,.12);color:#2dd4bf;flex:none}.sfpt{flex:1;min-width:0}.sfpt b{display:block;font-size:.9rem}.sfpt small{display:block;color:var(--mut,#8b95a3);font-size:.74rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sfsec{display:flex;gap:8px;overflow-x:auto;margin:0 0 12px;padding-bottom:4px;scrollbar-width:none}.sfsec::-webkit-scrollbar{display:none}.sfsec button{flex:none;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;font:inherit;font-weight:700;font-size:.82rem;padding:9px 14px;border-radius:13px;border:0;color:var(--mut,#aab3c0);background:rgba(255,255,255,.05);cursor:pointer}.sfsec button.on{background:rgba(45,212,191,.16);color:#5eead4;box-shadow:inset 0 0 0 1px rgba(45,212,191,.45)}
.sfsb{display:grid;gap:12px}.sfsb>.card{margin:0}.sfact{padding:12px 0;border-top:1px solid var(--line,#232831)}.sfact:first-child{border:0;padding-top:0}
.sfrow>.ic,.sfpkb>.ic{transform:rotate(-90deg);opacity:.6;flex:none}
.sfsb .sfstg{flex-wrap:wrap}.sfsb .sfst2{flex:1 1 150px}
.sfgr{max-width:560px;margin:0 auto}
.sfdv{margin-left:auto;color:var(--primary-text-color,#e8ecf1);font-size:.85rem;letter-spacing:0;text-transform:none}.sfhl:has(.sfdv){display:flex;align-items:center}
.sfcal{border:1px solid var(--line,#232831);border-radius:18px;padding:12px;background:rgba(255,255,255,.03);max-width:420px}.sfcy{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.sfcy b{font-size:1.15rem}
.sfyb{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line,#2a303a);background:rgba(255,255,255,.04);color:inherit;cursor:pointer}.sfyb:first-child .ic{transform:rotate(90deg)}.sfyb:last-child .ic{transform:rotate(-90deg)}.sfyb[disabled]{opacity:.3;cursor:default}
.sfcm{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.sfcm button{font:inherit;font-weight:700;padding:11px 0;border-radius:13px;border:1px solid var(--line,#2a303a);background:rgba(255,255,255,.04);color:inherit;cursor:pointer}.sfcm button.on{background:#2dd4bf;border-color:#2dd4bf;color:#04201c}.sfcm button[disabled]{opacity:.3;cursor:default}
.sfcc{display:block;width:100%;margin-top:10px;font:inherit;font-weight:700;font-size:.82rem;color:#f87171;background:none;border:0;padding:6px;cursor:pointer}
`;
