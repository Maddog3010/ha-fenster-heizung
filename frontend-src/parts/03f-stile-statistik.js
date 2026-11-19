/* Versions-Statistik: Popup und Seite in Einstellungen → System */
const CSS_STS = `
.sheet.stssh{max-width:520px}
.stsp{margin:2px 0 12px;font-size:.92rem;line-height:1.45}
.stsbox{margin:8px 0 10px;padding:11px 13px;border-radius:14px;border:1px solid var(--line);background:color-mix(in srgb,var(--teal) 7%,transparent);font-size:.88rem;line-height:1.45}
.stsbox ul{margin:6px 0 0;padding-left:18px}.stsbox li{margin:3px 0}
.stsh{display:block;color:var(--teal);font-size:.84rem}
.stslks{display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;margin:6px 0 10px;font-size:.84rem;color:var(--mut)}
.stslk,.stslks .lnk{color:var(--primary-color,#3b82f6);text-decoration:none;font-weight:600;cursor:pointer}
.stslk:hover,.stslks .lnk:hover{text-decoration:underline}
.stsjs{margin:6px 0 10px;padding:12px 14px;border-radius:12px;background:#0e1413;color:#bfe9e5;border:1px solid var(--line);font:500 .8rem/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-all;overflow:auto}
.stsrows{margin:8px 0 12px;border:1px solid var(--line);border-radius:14px;overflow:hidden}
.stsrows>div{display:flex;justify-content:space-between;gap:12px;padding:9px 13px;font-size:.86rem}
.stsrows>div+div{border-top:1px solid var(--line)}.stsrows span{color:var(--mut)}.stsrows b{text-align:right;font-weight:600}
.stsrows .stsok{color:#34d399}
.stsnote{margin:8px 0 4px;padding:9px 12px;border-radius:12px;border:1px solid color-mix(in srgb,var(--teal) 30%,transparent);background:color-mix(in srgb,var(--teal) 6%,transparent);font-size:.78rem;color:var(--mut);line-height:1.45}
.btn2.stsdan{border-color:#c0504d;color:#e88a87}
.btn2:disabled{opacity:.6;cursor:default}
`;
