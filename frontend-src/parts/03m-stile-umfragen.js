/* Umfragen: Popup, Karte auf der Startseite, Punkt am Einstellungen-Knopf */
const CSS_UMF = `
.pillbtn.umfdot{position:relative}
.pillbtn.umfdot::after{content:"";position:absolute;top:-1px;right:-1px;width:11px;height:11px;border-radius:50%;background:#fb923c;border:2px solid var(--primary-background-color,#111);box-sizing:border-box}
.card.umfc{border-color:color-mix(in srgb,var(--teal) 55%,var(--line));background:color-mix(in srgb,var(--teal) 9%,var(--card));margin-bottom:12px}
.umfct{display:flex;gap:12px;align-items:flex-start}.umfct>div{min-width:0}.umfct b{display:block;overflow-wrap:anywhere}.umfct div>span{color:var(--mut);font-size:.8rem}
.umfci{width:46px;height:46px;border-radius:13px;background:color-mix(in srgb,var(--teal) 22%,transparent);color:var(--teal);display:grid;place-items:center;flex:none}
.umfcb{margin-top:12px}
.umfsh .sh>div{flex:1;min-width:0}.umfsh .sh b{overflow-wrap:anywhere}
.umfprog{display:flex;gap:6px;margin:0 0 14px}.umfprog i{flex:1;height:4px;border-radius:3px;background:var(--line)}.umfprog i.on{background:var(--teal)}
.umfq{font-size:1.12rem;font-weight:800;line-height:1.3;margin:0 0 12px;overflow-wrap:anywhere}.umfq small{font-weight:500;font-size:.86rem;color:var(--mut)}
.umfsh .ehchk span{min-width:0;overflow-wrap:anywhere}.umfsh .ehchk i.umfr{border-radius:50%}
.umfstars{display:flex;justify-content:space-between;max-width:360px;margin:0 auto;padding:0 6px}
.umfstars button{background:none;border:0;cursor:pointer;font-size:2.5rem;line-height:1;padding:6px 4px;color:var(--gray);opacity:.45;min-width:48px}
.umfstars button.on{color:#fbbf24;opacity:1}
.umfscale{display:flex;justify-content:space-between;max-width:360px;margin:0 auto 14px;padding:0 8px;color:var(--mut);font-size:.76rem}
.umfta{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:14px;padding:12px;background:transparent;color:inherit;font:inherit;font-size:1rem;line-height:1.4;resize:vertical;min-height:92px}
.umfta:focus{outline:2px solid var(--teal);outline-offset:-1px}
.umfhint{display:block;margin:4px 2px}
.umfmsg{margin:10px 0 0;padding:10px 12px;border-radius:12px;border:1px solid color-mix(in srgb,var(--amber) 55%,transparent);background:color-mix(in srgb,var(--amber) 10%,transparent);font-size:.84rem;line-height:1.4}
.umffoot{margin-top:14px}
.umfctr{text-align:center;margin-top:8px}
.umfok{width:62px;height:62px;border-radius:50%;background:var(--teal);color:#042f2e;display:grid;place-items:center;margin:4px auto 12px}
.umfuntil{text-align:center;margin:0 0 14px}
.umfls{margin:10px 0 6px}
.umfrq{font-weight:700;font-size:.9rem;margin:10px 0 6px;overflow-wrap:anywhere}.umfex{margin:-2px 0 8px}
.umfbar{margin:0 0 9px}.umfbar>div{display:flex;justify-content:space-between;gap:10px;font-size:.86rem}.umfbar span{min-width:0;overflow-wrap:anywhere}.umfbar b{white-space:nowrap}
.umfbar i{display:block;height:8px;border-radius:5px;background:var(--line);margin-top:4px;overflow:hidden}.umfbar u{display:block;height:100%;border-radius:5px;background:#64748b;text-decoration:none}.umfbar.me u{background:var(--teal)}
.stsrows.umfmine>div{display:block}.stsrows.umfmine span{display:block;font-size:.78rem}.stsrows.umfmine b{display:block;text-align:left;margin-top:2px;white-space:pre-wrap;overflow-wrap:anywhere}
.umfrows{border:1px solid var(--line);border-radius:16px;overflow:hidden}.umfrows .sxt b{overflow-wrap:anywhere}
.umfopts{margin-top:12px}
`;
