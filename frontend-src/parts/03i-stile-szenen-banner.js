/* Szenen-Banner für die restlichen Module (Build 1): Bild rechts, Verlauf zur Kartenfarbe, Versions-Plakette */
const CSS_SB = `
.hero.mh.sbx .sbart{position:absolute;right:0;top:0;bottom:24px;width:58%;pointer-events:none;z-index:0;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 34%);mask-image:linear-gradient(90deg,transparent 0,#000 34%)}
.hero.mh.sbx .sbart>svg{width:100%;height:100%;display:block}
.hero.mh.sbx.a-rb .sbart{bottom:0;-webkit-mask-image:none;mask-image:none}
.hero.mh.sbx>.lbl,.hero.mh.sbx>.big,.hero.mh.sbx>.sub,.hero.mh.sbx>.chips,.hero.mh.sbx>.wwl1,.hero.mh.sbx>.wwacts{position:relative;z-index:1}
.hero.mh.sbx .lbl,.hero.mh.sbx .sub{max-width:52%}.hero.mh.sbx .big{max-width:56%}.hero.mh.sbx>.chips{max-width:62%}
.hero.mh.sbx.wwh .wwl1{max-width:56%}
.sbv{position:absolute;right:14px;bottom:10px;z-index:2;font-size:.68rem;font-weight:700;letter-spacing:.02em;color:#fff;background:rgba(3,12,22,.45);border:1px solid rgba(255,255,255,.14);padding:2px 9px;border-radius:99px}
.sbloop{fill:none;stroke:#fb923c;stroke-width:5;stroke-linejoin:round;stroke-dasharray:10 8}
.sbloop.run{animation:sbDash 1.6s linear infinite}
.sbpv{fill:none;stroke:#ffd36b;stroke-width:3;stroke-dasharray:6 6}.sbpv.run{animation:sbDash 1.4s linear infinite}
@keyframes sbDash{to{stroke-dashoffset:-36}}
.sbdrop{stroke:#8cc8f5;stroke-width:2.2;stroke-linecap:round;animation:sbDrop 1.2s linear infinite}
@keyframes sbDrop{0%{transform:translateY(-4px);opacity:0}30%{opacity:1}100%{transform:translateY(14px);opacity:0}}
.sbflame{animation:sbFl 1.1s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center bottom}
@keyframes sbFl{to{transform:scaleY(1.18)}}
.sbart[data-an="voll"] .run,.sbart[data-an="voll"] .sbdrop{animation-duration:.9s}
.sbart[data-an="aus"] *{animation:none!important}
@media(prefers-reduced-motion:reduce){.sbart *{animation:none!important}}
.sbwa{position:absolute;right:20px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:16px}
.sbcal{width:118px;border-radius:16px;overflow:hidden;background:#f2f6f5;color:#14303a;text-align:center;box-shadow:0 8px 22px rgba(0,0,0,.35)}
.sbcal b{display:block;background:#0d9488;color:#fff;font-size:.78rem;letter-spacing:.12em;padding:6px 0}
.sbcal.bad b{background:#dc2626}
.sbcal em{display:block;font-style:normal;font-size:2.7rem;font-weight:800;line-height:1.1;margin-top:4px}
.sbcal small{display:block;font-size:.7rem;color:#55707a;padding:0 8px 9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sbrgs{display:grid;grid-template-columns:repeat(2,54px);gap:8px}
.sbrg{position:relative;width:54px;height:54px;display:block}.sbrg svg{width:100%;height:100%;display:block}
.sbrg i{position:absolute;inset:0;display:grid;place-items:center;color:#fff}
@media(max-width:600px){.hero.mh.sbx .sbart{width:100%;opacity:.38;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 60%);mask-image:linear-gradient(90deg,transparent 0,#000 60%)}
  .hero.mh.sbx .lbl,.hero.mh.sbx .sub,.hero.mh.sbx .big,.hero.mh.sbx>.chips,.hero.mh.sbx.wwh .wwl1{max-width:none}
  .sbwa{right:10px;gap:8px}.sbcal{width:84px}.sbcal em{font-size:2rem}.sbrgs{grid-template-columns:repeat(2,40px)}.sbrg{width:40px;height:40px}}
.hero.mh .chip.stok{background:rgba(22,83,62,.75);border-color:#34d399}.hero.mh .chip.stwarn{background:rgba(90,69,19,.8);border-color:#fbbf24}.hero.mh .chip.stbad{background:rgba(90,30,42,.85);border-color:#f87171}
.sbair{fill:none;stroke:#bdf0ff;stroke-width:3;stroke-linecap:round;stroke-dasharray:10 8;opacity:.85}.sbair.run{animation:sbDash 1.8s linear infinite}
.sbspin{animation:sbSpin 3s linear infinite;transform-box:fill-box;transform-origin:center}
@keyframes sbSpin{to{transform:rotate(360deg)}}
.sbsnow{animation:sbSnow 6s linear infinite}@keyframes sbSnow{0%{transform:translateY(-20px)}100%{transform:translateY(40px)}}
.sbart[data-an="voll"] .sbspin{animation-duration:1.6s}
.sbrain{animation:sbRain 1s linear infinite}@keyframes sbRain{0%{transform:translateY(-10px);opacity:0}20%{opacity:1}100%{transform:translateY(30px);opacity:0}}
.sbwave{animation:sbWave 2.6s ease-in-out infinite alternate}@keyframes sbWave{to{transform:translateX(6px)}}
.hero.mh.sbx.a-ga .sbart{bottom:0;-webkit-mask-image:none;mask-image:none}
`;
