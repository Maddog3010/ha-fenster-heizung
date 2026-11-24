// Statistik Build 13: Reiter „System“ – läuft der Statistik-Worker sauber?
// Neu sind nur zwei kleine Tabellen: „sys“ (Zähler je Tag und Art, ohne Kennungen) und „syskv“ (letzter nächtlicher Lauf).

const dayMs = 86400000;
const D = (s) => Date.parse(s + "T00:00:00Z");
const S = (ms) => new Date(ms).toISOString().slice(0, 10);
const e = (x) => String(x ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" }[c]));
const nf = (n) => String(n ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export const SYS_KEEP_DAYS = 400;

// ---------------------------------------------------------------- Zählen (Eingang) und nächtlicher Lauf
/** Art der Anfrage aus Pfad und Antwort-Code, z. B. „ping:ok“, „err:429“. Unbekannte Pfade zählen als „andere:404“. */
export function kindOf(path, status) {
  const k = { "/v1/ping": "ping", "/v1/errors": "err", "/v1/forget": "forget", "/v1/errors/forget": "forget" }[path] || "andere";
  return `${k}:${status >= 200 && status < 300 ? "ok" : status}`;
}
export async function bump(DB, day, kind) {
  try { await DB.prepare("INSERT INTO sys(day, kind, n) VALUES(?,?,1) ON CONFLICT(day, kind) DO UPDATE SET n=sys.n+1").bind(day, kind).run(); } catch { /* vor migrate-build13.sql */ }
}
export async function saveCron(DB, info) {
  try { await DB.prepare("INSERT INTO syskv(k, v) VALUES('cron', ?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").bind(JSON.stringify(info)).run(); } catch { /* vor Build 13 */ }
}
export async function sysCleanup(DB, todayMs) {
  try { await DB.prepare("DELETE FROM sys WHERE day<?").bind(S(todayMs - SYS_KEEP_DAYS * dayMs)).run(); } catch { /* vor Build 13 */ }
}

// ---------------------------------------------------------------- Datenbank-Stand
/** Welche Erweiterung steckt in welchem Build – geprüft über vorhandene Tabellen und Spalten. */
export const CHECKS = [
  { b: 1, t: "Versions-Statistik", need: ["installs", "daily"], file: "schema.sql" },
  { b: 3, t: "Fehler-Statistik", need: ["err_groups", "err_hits", "err_reporters"], file: "schema.sql" },
  { b: 6, t: "Tages-Meldungen, HA-Version", need: ["err_days", "installs.ha"], file: "migrate-build6.sql" },
  { b: 8, t: "Zusammenführen", need: ["err_merge"], file: "migrate-build8.sql" },
  { b: 10, t: "Langzeit-Verlauf", need: ["snap"], file: "migrate-build10.sql" },
  { b: 11, t: "Module je Tag", need: ["daily.modules"], file: "migrate-build11.sql" },
  { b: 12, t: "Gerät, Aufrufkette", need: ["err_hits.dev", "err_groups.chain"], file: "migrate-build12.sql" },
  { b: 13, t: "System-Zähler", need: ["sys", "syskv"], file: "migrate-build13.sql" },
];
const KNOWN = ["installs", "daily", "err_groups", "err_hits", "err_reporters", "err_days", "err_merge", "snap", "sys", "syskv"];
/* Cloudflare D1 erlaubt pragma_table_info nur mit festem Tabellennamen (keine Verknüpfung über sqlite_master) – also je Tabelle einzeln. */
export async function schemaCheck(DB) {
  const have = new Set();
  let okAny = false;
  for (const t of KNOWN) {
    try {
      const cols = (await DB.prepare(`SELECT name FROM pragma_table_info('${t}')`).all()).results;
      okAny = true;
      if (cols.length) { have.add(t); for (const c of cols) have.add(`${t}.${c.name}`); }
    } catch { /* einzelne Abfrage nicht möglich */ }
  }
  if (!okAny) return null;   // Abfrage gar nicht möglich: Stand unbekannt
  return CHECKS.map((c) => ({ ...c, missing: c.need.filter((n) => !have.has(n)), ok: c.need.every((n) => have.has(n)) }));
}
/** Hinweis unter dem Banner aller Reiter, wenn eine Erweiterung fehlt */
export function warnHtml(checks) {
  const miss = (checks || []).filter((c) => !c.ok);
  if (!miss.length) return "";
  return `<a class="sysw" href="/system">⚠ Datenbank unvollständig: ${miss.map((c) => `Build ${c.b} (${e(c.t)})`).join(", ")} fehlt – Befehl im Reiter System</a>`;
}

// ---------------------------------------------------------------- Laden und Darstellen
const TABLES = ["installs", "daily", "err_groups", "err_hits", "err_reporters", "err_days", "err_merge", "snap", "sys", "syskv"];
export async function sysLoad(DB, todayStr, env = {}) {
  const checks = await schemaCheck(DB);
  const have = new Set((checks || []).filter((c) => c.ok).flatMap((c) => c.need.filter((n) => !n.includes("."))));
  const counts = [];
  let size = null;
  for (const t of TABLES) {
    if (checks && !have.has(t)) continue;
    try { const r = await DB.prepare(`SELECT COUNT(*) n FROM ${t}`).all(); counts.push([t, r.results[0].n]); if (r.meta && r.meta.size_after) size = r.meta.size_after; } catch { /* Tabelle fehlt */ }
  }
  const from = S(D(todayStr) - 13 * dayMs);
  let rows = null, cron = null;
  try { rows = (await DB.prepare("SELECT day, kind, n FROM sys WHERE day>=?").bind(from).all()).results; } catch { rows = null; }
  try { const r = await DB.prepare("SELECT v FROM syskv WHERE k='cron'").first(); cron = r ? JSON.parse(r.v) : null; } catch { cron = null; }
  let errDays = null, errWith = null;
  try {
    errDays = (await DB.prepare("SELECT COUNT(*) n FROM err_days WHERE day=?").bind(todayStr).first()).n;
    errWith = (await DB.prepare("SELECT COUNT(DISTINCT rid) n FROM err_hits WHERE day=?").bind(todayStr).first()).n;
  } catch { /* vor Build 6 */ }
  const days = Array.from({ length: 14 }, (_, i) => S(D(todayStr) - (13 - i) * dayMs));
  /* angenommen = Installationen mit Meldung an diesem Tag (Tagesliste bzw. Tages-Meldungen) – gibt es auch vor Build 13 */
  const acc = { ping: new Map(), err: new Map() };
  try { for (const x of (await DB.prepare("SELECT day, COUNT(*) n FROM daily WHERE day>=? GROUP BY day").bind(from).all()).results) acc.ping.set(x.day, x.n); for (const d of days) if (!acc.ping.has(d)) acc.ping.set(d, 0); } catch { /* */ }
  try { for (const x of (await DB.prepare("SELECT day, COUNT(*) n FROM err_days WHERE day>=? GROUP BY day").bind(from).all()).results) acc.err.set(x.day, x.n); for (const d of days) if (!acc.err.has(d)) acc.err.set(d, 0); } catch { /* vor Build 6 */ }
  const get = (d, k) => (rows || []).filter((x) => x.day === d && x.kind === k).reduce((a, x) => a + x.n, 0);
  const sum = (d, pre, ok) => (rows || []).filter((x) => x.day === d && x.kind.startsWith(pre + ":") && (ok ? x.kind.endsWith(":ok") : !x.kind.endsWith(":ok"))).reduce((a, x) => a + x.n, 0);
  const rej = {};
  for (const x of rows || []) if (x.day >= S(D(todayStr) - 6 * dayMs) && !x.kind.endsWith(":ok")) { const [k, c] = x.kind.split(":"); rej[c] = rej[c] || {}; rej[c][k] = (rej[c][k] || 0) + x.n; }
  const ver = env.CF_VERSION_METADATA ? { id: env.CF_VERSION_METADATA.id || "", ts: env.CF_VERSION_METADATA.timestamp || "" } : null;
  return { today: todayStr, checks, counts, size, cron, rows, days, rej, ver, errDays, errWith,
    ping: days.map((d) => ({ d, ok: acc.ping.get(d) ?? sum(d, "ping", true), bad: sum(d, "ping", false) })), err: days.map((d) => ({ d, ok: acc.err.get(d) ?? sum(d, "err", true), bad: sum(d, "err", false) })), get };
}
function bars(L, col) {
  const mx = Math.max(1, ...L.map((x) => x.ok + x.bad)), W = 600, H = 120, bw = W / L.length;
  return `<svg viewBox="0 0 ${W} ${H + 14}" role="img">${L.map((x, i) => { const h1 = ((x.ok) / mx) * (H - 4), h2 = (x.bad / mx) * (H - 4);
    return `<rect x="${(i * bw + 2).toFixed(1)}" y="${(H - h1).toFixed(1)}" width="${(bw - 4).toFixed(1)}" height="${Math.max(h1, x.ok ? 1 : 0).toFixed(1)}" rx="2" fill="${col}"><title>${x.d}: ${x.ok} angenommen, ${x.bad} abgelehnt</title></rect>` +
      (x.bad ? `<rect x="${(i * bw + 2).toFixed(1)}" y="${(H - h1 - h2).toFixed(1)}" width="${(bw - 4).toFixed(1)}" height="${Math.max(h2, 1.5).toFixed(1)}" rx="2" fill="#f87171"/>` : ""); }).join("")}
    <text x="2" y="${H + 12}" fill="#8d8c84" font-size="11">${L[0].d.slice(8, 10)}.${L[0].d.slice(5, 7)}.</text><text x="${W - 2}" y="${H + 12}" fill="#8d8c84" font-size="11" text-anchor="end">heute</text></svg>`;
}
const LBL = { 400: "ungültig (400)", 413: "zu groß (413)", 429: "zu oft (429)", 404: "falscher Pfad (404)" };
export function sysHtml(X, DASH) {
  const t = X.ping.at(-1), f = X.err.at(-1), avg = (L) => Math.round(L.slice(0, 13).reduce((a, x) => a + x.ok, 0) / 13);
  const cron = X.cron ? `<div class="n" style="font-size:1.25rem;margin-top:6px">${X.cron.day === X.today ? "heute" : e(X.cron.day)} ${e(String(X.cron.time || "").slice(0, 5))}</div><div class="s">${X.cron.ok ? `ok · ${X.cron.ms} ms` : `<span style="color:#f87171">Fehler: ${e(X.cron.msg || "?")}</span>`}${X.cron.snap ? " · Tageswert gespeichert" : ""}</div>`
    : `<div class="n" style="font-size:1.25rem;margin-top:6px">–</div><div class="s">noch kein Lauf seit Build 13 (täglich 03:17 UTC)</div>`;
  const noRows = X.rows == null, rj = (n) => (noRows ? "Ablehnungen ab Build 13" : `abgelehnt heute ${n}`);
  const kpi = `<div class="k"><div class="c"><div class="t">Versions-Meldungen heute</div><div class="n">${nf(t.ok)}</div><div class="s">Installationen mit Meldung · 13 Tage davor: Ø ${avg(X.ping)} · ${rj(t.bad)}</div></div>
    <div class="c"><div class="t">Fehlerberichte heute</div><div class="n">${nf(f.ok)}</div><div class="s">Tages-Meldungen ab 2026.11.5b1${X.errWith != null ? ` · ${nf(X.errWith)} ${X.errWith === 1 ? "Installation" : "Installationen"} mit Fehler (alle Versionen)` : ""} · ${rj(f.bad)}</div></div>
    <div class="c"><div class="t">Nächtlicher Lauf</div>${cron}</div>
    <div class="c"><div class="t">Dashboard</div><div class="n" style="font-size:1.25rem;margin-top:6px">Build ${DASH.build}${DASH.patch ? "." + DASH.patch : ""}</div><div class="s">${DASH.patch ? `Korrektur ${DASH.patch} · ` : ""}vom ${e(DASH.date)}${X.ver ? ` · Cloudflare-Version ${e(String(X.ver.id).slice(0, 8))}${X.ver.ts ? ` (${e(String(X.ver.ts).slice(0, 16).replace("T", " "))})` : ""}` : ""}</div></div></div>`;
  const chk = X.checks == null ? '<div class="empty">Der Datenbank-Stand lässt sich nicht abfragen.</div>'
    : `<table class="mini">${X.checks.map((c) => `<tr><td>Build ${c.b} · ${e(c.t)}${c.ok ? "" : `<small style="display:block;color:#fde68a;font-family:ui-monospace,Menlo,monospace;margin-top:2px">npx wrangler d1 execute stats --remote --file=${e(c.file)}</small><small style="display:block;color:#8d8c84">fehlt: ${c.missing.map(e).join(", ")}</small>`}</td><td class="num">${c.ok ? '<span style="color:#5eead4;font-weight:700">✓</span>' : '<span class="tg" style="background:#7f1d1d;color:#fecaca">fehlt</span>'}</td></tr>`).join("")}</table>`;
  const codes = Object.keys(X.rej).sort();
  const rej = noRows ? '<div class="empty">Zähler laufen ab dem Ausrollen von Build 13.</div>' : codes.length
    ? `<table class="mini"><tr><th style="text-align:left">Grund</th><th class="num">Versionen</th><th class="num">Fehler</th><th class="num">Löschen</th><th class="num">andere</th></tr>${codes.map((c) => `<tr><td>${e(LBL[c] || c)}</td><td class="num">${X.rej[c].ping || 0}</td><td class="num">${X.rej[c].err || 0}</td><td class="num">${X.rej[c].forget || 0}</td><td class="num">${X.rej[c].andere || 0}</td></tr>`).join("")}</table>`
    : '<div class="empty">Keine abgelehnten Meldungen in 7 Tagen.</div>';
  const tbl = `${X.counts.map(([t, n]) => `${e(t)} ${nf(n)}`).join(" · ")}${X.size ? ` · Datenbank ${(X.size / 1048576).toFixed(1).replace(".", ",")} MB` : ""}`;
  return `${kpi}
  <div class="g2s"><div class="c"><h2>Versions-Meldungen · 14 Tage</h2><div class="u">blau: Installationen mit Meldung · rot: abgelehnt (ab Build 13)</div>${bars(X.ping, "#3987e5")}</div>
    <div class="c"><h2>Fehlerberichte · 14 Tage</h2><div class="u">teal: Tages-Meldungen (auch „0 Fehler“, ab 2026.11.5b1) · rot: abgelehnt (ab Build 13)</div>${bars(X.err, "#2dd4bf")}</div></div>
  <div class="g2s"><div class="c"><h2>Datenbank-Stand</h2><div class="u">fehlt etwas, steht der Befehl dazu · danach ist kein neues deploy nötig</div>${chk}</div>
    <div class="c"><h2>Abgelehnte Meldungen · 7 Tage</h2><div class="u">vom Worker abgelehnt · was eine Cloudflare-Regel vorher abweist, kommt hier nicht an</div>${rej}<div class="u" style="margin-top:10px">Zeilen: ${tbl}</div></div></div>`;
}
export const SYS_CSS = `.sysw{display:block;background:#450a0a;color:#fecaca;border:1px solid #7f1d1d;border-radius:12px;padding:8px 14px;margin:10px 0 0;text-decoration:none;font-size:.86rem;font-weight:600}.sysw:hover{border-color:#f87171}.g2s{display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:10px;margin-bottom:10px}`;
