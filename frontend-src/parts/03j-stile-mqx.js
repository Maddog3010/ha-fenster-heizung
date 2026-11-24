/* Sponsor-Max-Extras (2026.11.4.4b4): Wohnklima-Zeugnis, Heizkosten je Raum, Wand-Tablet-Extras */
const CSS_MQX = `
.mqnm{background:none;border:0;padding:0;font:inherit;color:inherit;cursor:pointer;text-align:left}.mqnm:hover{text-decoration:underline}
.mqnew{font-style:normal;font-size:.62rem;font-weight:800;letter-spacing:.04em;color:#2dd4bf;background:rgba(45,212,191,.14);border-radius:8px;padding:1px 6px;margin-left:6px;vertical-align:middle}
.mqlock{flex:none;font:inherit;font-size:.72rem;font-weight:700;color:#e8b64a;background:rgba(232,182,74,.14);border:0;border-radius:10px;padding:3px 9px;cursor:pointer}
.mqrow .s3h{flex-wrap:wrap}.mqrow .s3h .gschs{margin-left:auto}
.mqtop{display:flex;align-items:center;gap:12px;margin:8px 0}.mqtop span{display:flex;flex-direction:column}.mqtop small{color:var(--mut);font-size:.78rem}
.mqbig{min-width:54px;height:54px;padding:0 8px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900}.mqbig.eur{min-width:0;height:auto;padding:0;font-size:1.7rem;background:none;white-space:nowrap}
.mqg{min-width:30px;height:26px;padding:0 6px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:.86rem}
.mqq0{background:rgba(148,163,184,.14);color:var(--mut)}.mqq1{background:rgba(45,212,191,.16);color:#2dd4bf}.mqq2{background:rgba(132,204,22,.16);color:#84cc16}.mqq3{background:rgba(232,182,74,.18);color:#e8b64a}.mqq4{background:rgba(249,115,22,.18);color:#fb923c}.mqq5,.mqq6{background:rgba(240,106,95,.2);color:#f06a5f}
.mqlist{display:flex;flex-direction:column;margin:4px 0}
.mqli{width:100%;display:flex;justify-content:space-between;align-items:center;gap:8px;background:none;border:0;border-bottom:1px solid var(--line,rgba(127,127,127,.15));padding:7px 2px;font:inherit;color:inherit;cursor:pointer;text-align:left;flex-wrap:wrap}.mqli:last-child{border-bottom:0}
.mqli>span:last-child{display:flex;align-items:center;gap:8px}.mqli.bar>i{flex-basis:100%;height:5px;border-radius:3px;background:rgba(127,127,127,.18);overflow:hidden}.mqli.bar>i>b{display:block;height:100%;border-radius:3px}
.mqrisk{color:#f06a5f;font-style:normal}.mqup{color:#2dd4bf;font-size:.78rem}.mqdn{color:#f06a5f;font-size:.78rem}.pkc{color:#f472b6}.mqteal{color:#2dd4bf}
.mqwin{display:block;width:100%;margin:8px 0 4px;text-align:left;background:rgba(244,114,182,.1);border:0;border-radius:10px;padding:8px 10px;font:inherit;color:inherit;cursor:pointer}.mqwin b{color:#f472b6}
.mqlimi{display:flex;align-items:center;gap:4px;flex-wrap:wrap;justify-content:flex-end;font-size:.8rem;color:var(--mut)}.mqin{text-align:center;padding:4px}
.mqhist{display:flex;align-items:flex-end;gap:4px;height:70px;margin:6px 0 4px}.mqhist i{flex:1;border-radius:4px 4px 0 0;min-height:3px}.mqhist.cost i{background:#2dd4bf;opacity:.7}.mqhist.cost i.we{opacity:1;background:#5eead4}
.mqstrip{margin:0 0 14px}.mqtiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px}
.mqtile{background:rgba(255,255,255,.05);border-radius:14px;padding:10px 12px;display:flex;flex-direction:column;gap:2px;border-top:2px solid transparent}.mqtile.own{border-top-color:#2dd4bf}
.mqtile small{font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);font-weight:700}.mqtile b{font-size:1.5rem}.mqtile span{font-size:.8rem;color:var(--mut)}.mqtile span.warn{color:#e8b64a}
.mqtile em{font-style:normal;font-size:.74rem;min-height:1em}.mqtile em.pk{color:#f472b6}.mqtile em.tl{color:#2dd4bf}
.mqqas{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.mqqa{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.07);border:0;border-radius:12px;padding:10px 14px;font:inherit;color:inherit;font-weight:600;cursor:pointer}
.mqrest{justify-content:flex-start!important;align-items:stretch!important;padding:5vh 5vw!important;gap:4vh;transition:transform 1s;background:radial-gradient(circle at 22% 18%,#16363a 0,#0b0f12 60%)!important}
.mqrh{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.mqrs{display:flex;flex-direction:column;align-items:flex-end;gap:6px;color:#9aa7b4}
.mqclk{font-size:clamp(64px,14vw,170px);font-weight:200;line-height:1;letter-spacing:-2px;color:#e6edf3}
.mqrest .mqtiles{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}.mqrest .tmrw{margin-top:auto;text-align:center}
.mqnight{background:#000!important;align-items:center!important;justify-content:center!important}.mqnight .mqclk{color:#7a2a2a}.mqnight.teal .mqclk{color:#1f5f56}.mqnh{color:#4a2020;font-size:.9rem}.mqnight.teal .mqnh{color:#1b4a44}
.mqsleep{background:#000!important}
.mqalarm{position:fixed;inset:0;z-index:50;background:#3a1216;color:#ffe4e1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:24px;animation:mqpulse 1.2s infinite alternate}
.mqalarm>b{font-size:clamp(32px,7vw,72px);font-weight:900;color:#ff8a80}.mqai{font-size:clamp(48px,10vw,96px)}.mqar{font-size:1.3rem}
.mqab{background:#f06a5f;color:#fff;border:0;border-radius:16px;padding:16px 28px;font:inherit;font-size:1.2rem;font-weight:800;cursor:pointer;margin-top:12px}
.mqab2{background:none;color:#ffb3ad;border:1px solid #6a2a2e;border-radius:14px;padding:10px 20px;font:inherit;cursor:pointer}.mqan{font-size:.8rem;color:#c99;max-width:420px;margin-top:10px}
@keyframes mqpulse{from{background:#3a1216}to{background:#521a1f}}
`;
