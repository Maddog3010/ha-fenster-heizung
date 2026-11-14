/* Support-Chat für Sponsoren (wie WhatsApp) */
const CSS_SUP = `
.sheet.supsh{display:flex;flex-direction:column;padding:0;overflow:hidden;height:88vh;max-height:88vh}
@media(min-width:720px){.sheet.wide.supsh{width:min(560px,94vw);height:min(760px,88vh)}}
.suph{display:flex;align-items:center;gap:10px;padding:12px 12px 12px 14px;background:color-mix(in srgb,var(--card) 80%,#000);border-bottom:1px solid var(--line);flex:none}
.supav{width:40px;height:40px;border-radius:50%;object-fit:cover;flex:none;background:#111}
.suphn{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.suphn b{font-size:.98rem}.suphn span{font-size:.76rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.supmx{font-style:normal;font-weight:700;font-size:.7rem;color:#fbbf24;background:color-mix(in srgb,#fbbf24 16%,transparent);border-radius:99px;padding:1px 7px;margin-right:4px}
.supmsgs{flex:1;overflow-y:auto;padding:12px 10px 8px;display:flex;flex-direction:column;gap:3px;background-color:#0b141a;background-image:radial-gradient(rgba(255,255,255,.035) 1px,transparent 1.4px);background-size:18px 18px;overscroll-behavior:contain}
.supday{display:flex;justify-content:center;margin:8px 0 6px}.supday span{font-size:.72rem;font-weight:600;padding:4px 10px;border-radius:8px;background:#182229;color:#8696a0}
.supb{display:flex;flex-direction:column;max-width:82%}.supb.me{align-self:flex-end;align-items:flex-end}.supb.dev{align-self:flex-start}
.supbt{position:relative;padding:6px 9px 7px;border-radius:10px;font-size:.9rem;line-height:1.38;word-wrap:break-word;overflow-wrap:anywhere;box-shadow:0 1px .5px rgba(0,0,0,.25)}
.supb.me .supbt{background:#005c4b;color:#e9edef;border-top-right-radius:3px}.supb.dev .supbt{background:#202c33;color:#e9edef;border-top-left-radius:3px}
.supb.fail .supbt{opacity:.75}.supbt a{color:#53bdeb}
.supmeta{float:right;display:inline-flex;align-items:center;gap:3px;margin:6px 0 -3px 10px;font-size:.66rem;color:rgba(233,237,239,.6);white-space:nowrap}
.suptk{display:inline-flex;font-size:.72rem;letter-spacing:-2px}.suptk.rd{color:#53bdeb}.suptk.err{letter-spacing:0;color:#fff;background:#ef4444;border-radius:50%;width:13px;height:13px;justify-content:center;font-weight:800;font-size:.62rem}
.supatt{display:flex;align-items:center;gap:4px;margin-top:4px;font-size:.72rem;color:rgba(233,237,239,.7)}
.supfail{font-size:.72rem;color:#fca5a5;margin:3px 2px 4px}.supfail .lnk{font-size:.72rem}
.supempty{margin:auto;max-width:330px;text-align:center;display:flex;flex-direction:column;gap:6px;align-items:center;padding:20px 12px;color:#e9edef}.supempty>span{font-size:.84rem;color:#8696a0;line-height:1.45}
.supwave{font-size:2rem}.supsugg{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:8px}
.supchip{border:1px solid rgba(255,255,255,.14);background:#202c33;color:#e9edef;border-radius:99px;padding:6px 11px;font:inherit;font-size:.78rem;cursor:pointer}
.supin{display:flex;align-items:flex-end;gap:8px;padding:8px 10px calc(8px + env(safe-area-inset-bottom,0px));background:color-mix(in srgb,var(--card) 80%,#000);border-top:1px solid var(--line);flex:none}
.supta{flex:1;resize:none;border:0;outline:0;border-radius:20px;padding:10px 14px;font:inherit;font-size:.92rem;line-height:1.3;background:var(--bg2,#2a3942);color:inherit;max-height:140px;min-height:40px;box-sizing:border-box}
.supic{flex:none;width:40px;height:40px;border-radius:50%;border:0;background:transparent;color:var(--mut);display:grid;place-items:center;cursor:pointer}.supic.on{color:#25d366;background:color-mix(in srgb,#25d366 15%,transparent)}
.supsend{flex:none;width:44px;height:44px;border-radius:50%;border:0;background:#00a884;color:#fff;display:grid;place-items:center;cursor:pointer}.supsend:active{transform:scale(.94)}
.supdiag{padding:8px 12px;font-size:.78rem;line-height:1.4;background:color-mix(in srgb,#25d366 9%,var(--card));border-top:1px solid var(--line);flex:none;max-height:40vh;overflow:auto}.supdiag .lnk{font-size:.78rem}
.supjson{margin:6px 0 0;padding:8px;border-radius:8px;background:#0b141a;color:#9be7c4;font-size:.7rem;white-space:pre-wrap;word-break:break-word}
.supnet{display:flex;gap:6px;align-items:center;padding:6px 12px;font-size:.76rem;color:#fcd34d;background:color-mix(in srgb,#f59e0b 12%,var(--card));flex:none}
.supgate{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px;padding:24px 22px}.supgate>b{font-size:1.02rem}.supgate>span{font-size:.86rem;color:var(--mut);line-height:1.45;max-width:380px}
.supgi{width:68px;height:68px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,#25d366 16%,transparent);color:#25d366;margin-bottom:6px}
.supprv{flex:1;overflow:auto;padding:16px 18px}.supprv>b{display:flex;align-items:center;gap:6px;font-size:1rem}.supprv ul{margin:10px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:8px;font-size:.86rem;line-height:1.45}.supprv .ic{vertical-align:-2px}
.supdot{display:inline-grid;place-items:center;min-width:17px;height:17px;padding:0 4px;border-radius:99px;background:#25d366;color:#052e16;font-style:normal;font-weight:800;font-size:.66rem;box-sizing:border-box}
.supdot.hd{position:absolute;top:-2px;right:-2px;min-width:10px;width:10px;height:10px;padding:0;border:2px solid var(--card)}.pillbtn.spnb{position:relative}
.supdot.in{margin-left:4px}
.supup{font-size:.78rem;color:#fbbf24;margin-top:6px}.supup .lnk{font-size:.78rem;color:#fbbf24;text-decoration:underline}.supsp{font-style:normal;font-weight:700;font-size:.7rem;color:#f9a8d4;background:color-mix(in srgb,#ec4899 16%,transparent);border-radius:99px;padding:1px 7px;margin-right:4px}
.lgsup{display:flex;align-items:center;gap:12px;margin-top:10px}.lgsup .n{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}.lgsup small{font-size:.8rem;color:var(--mut);line-height:1.4}.supnew{color:#25d366}
.lgsupi{position:relative;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,#25d366 16%,transparent);color:#25d366;flex:none}.lgsupi .supdot{position:absolute;top:-3px;right:-3px}
.btn2.lgsupb{border-color:color-mix(in srgb,#25d366 50%,transparent)}
@media(max-width:520px){.lgsup{flex-wrap:wrap}.lgsup .btn2{flex:1 1 100%}}
:host([style*="color-scheme: light"]) .supmsgs{background-color:#efeae2;background-image:radial-gradient(rgba(0,0,0,.05) 1px,transparent 1.4px)}
:host([style*="color-scheme: light"]) .supb.me .supbt{background:#d9fdd3;color:#111b21}:host([style*="color-scheme: light"]) .supb.dev .supbt{background:#fff;color:#111b21}
:host([style*="color-scheme: light"]) .supmeta,:host([style*="color-scheme: light"]) .supatt{color:#667781}:host([style*="color-scheme: light"]) .supday span{background:#fff;color:#54656f}
:host([style*="color-scheme: light"]) .supempty{color:#111b21}:host([style*="color-scheme: light"]) .supchip{background:#fff;color:#111b21;border-color:#d1d7db}
:host([style*="color-scheme: light"]) .supta{background:#fff}:host([style*="color-scheme: light"]) .supjson{background:#f0f2f5;color:#065f46}
`;
