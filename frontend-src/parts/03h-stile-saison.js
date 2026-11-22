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
`;
