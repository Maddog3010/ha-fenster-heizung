/* Weihnachts-Theme (Build 1): Lichterkette, Adventskranz, Countdown, Raum-Symbole, Einstellungen */
const CSS_SAI = `
.saiL{position:absolute;left:0;right:0;top:0;height:22px;z-index:3;pointer-events:none;display:flex;justify-content:space-around;align-items:flex-start;padding:0 10px}
.saiL::before{content:"";position:absolute;left:-4%;right:-4%;top:-10px;height:20px;border-bottom:1.5px solid rgba(255,255,255,.28);border-radius:0 0 50% 50%}
.saiL i{position:relative;width:7px;height:10px;margin-top:6px;border-radius:50% 50% 45% 45%;background:var(--c);box-shadow:0 0 7px 1px var(--c);opacity:.95}
.saiL i:nth-child(odd){margin-top:9px}
.saiL.mv i{animation:saiTw 3.2s ease-in-out infinite;animation-delay:calc(var(--i) * -.37s)}
@keyframes saiTw{0%,100%{opacity:.95;filter:none}50%{opacity:.35;filter:saturate(.6)}}
@media(prefers-reduced-motion:reduce){.saiL.mv i{animation:none}}
.hero.saiH{padding-top:28px}
.hzhd>.saiL{z-index:4}
.chip.saiC{gap:7px;padding:4px 11px 4px 7px}.chip.saiC svg{flex:none;display:block}
.saiK{display:block}
.rk2nm .saiR{font-size:.95rem;margin-left:6px;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5))}
.saiBox{border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin:6px 0 10px;display:flex;gap:12px;align-items:center}
.saiBox .t{font-weight:700}.saiBox .s{color:var(--mut);font-size:.82rem}
.saiDev{border:1px dashed color-mix(in srgb,#e05a6b 60%,var(--line));border-radius:14px;padding:10px 12px;margin:8px 0 10px}
.saiDev .hd{display:flex;align-items:center;justify-content:space-between;gap:8px;font-weight:700;margin-bottom:6px}
.saiDev .tag{font-size:.7rem;font-weight:700;padding:2px 8px;border-radius:99px;background:color-mix(in srgb,#e05a6b 22%,transparent);color:#ff8fa3}
.saiQ{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
.saiQ button{border:1px solid var(--line);background:transparent;color:inherit;border-radius:10px;padding:5px 9px;font-size:.8rem;font-weight:600;cursor:pointer}
.saiQ button.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 18%,transparent)}
.saiRow{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0}
.saiRow input,.saiRow select{background:transparent;color:inherit;border:1px solid var(--line);border-radius:10px;padding:7px 9px;font:inherit;font-size:.86rem}
.saiWarn{background:color-mix(in srgb,#e05a6b 14%,transparent);border:1px solid color-mix(in srgb,#e05a6b 45%,transparent);border-radius:10px;padding:7px 10px;font-size:.82rem;margin-top:6px;display:flex;justify-content:space-between;align-items:center;gap:8px}
.saiS{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}
.saiS i{position:absolute;top:-8px;width:var(--s);height:var(--s);border-radius:50%;background:#fff;opacity:.75;animation:saiF var(--d) linear infinite}
@keyframes saiF{0%{transform:translate(0,-10px)}100%{transform:translate(var(--w),260px)}}
@media(prefers-reduced-motion:reduce){.saiS{display:none}}
.chip.saiC[data-act]{cursor:pointer}
.advC h2 .hzrt{margin-left:auto}
.advG{display:grid;grid-template-columns:repeat(5,minmax(0,60px));gap:7px}
.door2{position:relative;aspect-ratio:1/1;border-radius:10px;border:1px solid #3c6b61;background:linear-gradient(145deg,#2a4f47,#1b3532);color:#f4d58d;font-weight:800;font-size:1.05rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:2px;padding:0}
.door2 small{font-size:.7rem;color:#3fa37a}
.door2.big{grid-column:span 2;aspect-ratio:auto;font-size:1.5rem}
.door2.o{background:transparent;border-style:dashed;color:#3fa37a;font-size:.9rem}
.door2.today{background:linear-gradient(145deg,#c43c52,#8f2236);border-color:#ff8fa3;color:#fff;box-shadow:0 0 12px #e05a6b88}
.door2.late{border-color:#f4d58d;box-shadow:0 0 0 1px #f4d58d55 inset}
.door2.lock{background:color-mix(in srgb,var(--card) 80%,#000);border-color:var(--line);color:var(--mut);cursor:default}
.door2.rb{border-color:var(--line);color:var(--mut)}
.advRe{position:absolute;top:2px;right:4px;font-size:.62rem;color:#f4d58d}
.advLg{display:flex;flex-wrap:wrap;gap:12px;margin-top:10px;font-size:.76rem;color:var(--mut)}
.advLg span{display:inline-flex;align-items:center;gap:5px}.advLg i.door2{width:14px;height:14px;border-radius:4px;aspect-ratio:auto;cursor:default}
.advBk{display:flex;gap:14px;align-items:center;flex-wrap:wrap}.advBk b{display:block;font-size:1.05rem}.advBk small{color:var(--mut)}
.advBb{display:flex;gap:8px;margin-top:8px;align-items:center}.advBb .door2{width:46px;height:38px;aspect-ratio:auto}
.advD{text-align:center;padding:4px 4px 2px}.advD h3{margin:6px 0 6px;font-size:1.2rem}.advD p{line-height:1.5;margin:0 auto 14px;max-width:460px}
.advDi{font-size:2.6rem;line-height:1.1}
.advD.pop{animation:advPop .55s cubic-bezier(.2,1.4,.4,1)}@keyframes advPop{0%{transform:perspective(600px) rotateY(-70deg) scale(.85);opacity:0}100%{transform:none;opacity:1}}
@media(prefers-reduced-motion:reduce){.advD.pop{animation:none}}
.advTy{display:inline-block;font-size:.72rem;font-weight:700;padding:2px 9px;border-radius:99px;background:color-mix(in srgb,var(--teal) 18%,transparent)}
.advTy.t-tipp{background:#1f4d3a;color:#8ee0b0}.advTy.t-statistik{background:#1e3d57;color:#8cc8f5}.advTy.t-deko{background:#4d2a1f;color:#f5b38c}.advTy.t-funktion{background:#3b2557;color:#c9a6f5}.advTy.t-raetsel{background:#4d4219;color:#f4d58d}.advTy.t-besonders{background:#5a1e2a;color:#ff9fb0}
.advDb{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
@media(max-width:520px){.advG{gap:5px;grid-template-columns:repeat(5,minmax(0,1fr))}.door2{font-size:.9rem;border-radius:8px}}
`;
