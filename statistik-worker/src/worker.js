// Statistik-Worker für „Strom & Wärme“ – Versions-Statistik auf Cloudflare Workers + D1.
//
//   stats.stromwaerme.dev  Eingang:   nur POST /v1/ping, /v1/forget, /v1/errors, /v1/errors/forget – gibt nie Daten heraus.
//   dash.stromwaerme.dev   Dashboard: nur mit gültigem Cloudflare-Access-Token (wird hier geprüft, nicht nur vorausgesetzt).
//
// Gespeichert wird je Installation: zufällige Kennung, Version, Kanal, erster/letzter Tag. Keine IP-Adresse,
// kein User-Agent. Die Begrenzung pro Absender übernimmt eine Cloudflare-Rate-Limit-Regel (siehe Anleitung).

import { haMatrixHtml, versionErrPart, versionErrHtml, pc1, dbErrMerge, dbErrSplit, errOwnStatus, validErrors, dbErrors, dbErrForget, dbErrCleanup, errLoad, errLoadOne, errRender, errRenderOne, ERR_CSS, ERR_MAX_BODY, tabs, validStatus, dbErrStatus, loadReleases, releaseMarks, markSvg, weekHtml, laggards, lagHtml } from "./fehler.js";
/** Build 9: Version dieses Dashboards/Workers – steht im Banner und unter /health. Bei jedem Build hochzählen. */
export const DASH = { build: 9, date: "2026-11-24" };
const dashChip = () => `<span class="chip dv" title="Version des Statistik-Workers – nach „wrangler deploy“ prüfen, ob der neue Stand aktiv ist">Dashboard Build ${DASH.build} · ${DASH.date.slice(8, 10)}.${DASH.date.slice(5, 7)}.${DASH.date.slice(0, 4)}</span>`;
const banChips = (today) => `<span class="chips">${dashChip()}<span class="chip">nur du · Stand ${e(today)}</span></span>`;
export const SCHEMAS = [1, 2, 3];   // Schema 1: ohne Module · Schema 2: mit Modulliste · Schema 3 (Build 6): dazu HA-Version „2026.11“
export const MODULES = { ww: "2 Warmwasser", en: "3 Energie", gs: "4 Gerätestrom", lu: "5 Lüftung", rb: "6 Rollläden", wp: "7 Wärmepumpe", ev: "8 E-Auto", wx: "9 Wetter", ga: "10 Garten", sf: "11 Sicherheit", pl: "12 Pool & Sauna", bt: "13 Batterie", dt: "14 Stromtarif", wa: "15 Wartung", sp: "16 Prognose", ef: "19 Hausfluss" };
const MAX_BODY = 1024;
const PING_MIN_GAP = 3600;
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const VER_RE = /^(\d{4})\.(\d{1,2})\.(\d{1,2})(?:\.(\d{1,2}))?(?:b(\d{1,3}))?$/;

// ---------------------------------------------------------------- Versionen
export function verKey(v) {
  const m = VER_RE.exec(v || "");
  if (!m) return [0, 0, 0, 0, 0, 0];
  const [, y, mo, r, h, b] = m;
  return [+y, +mo, +r, +(h || 0), b !== undefined ? 0 : 1, +(b || 0)];   // Build 5: Korrektur vor Beta – 2026.11.4.3b1 ist neuer als 2026.11.4.2
}
export function cmp(a, b) {
  const x = verKey(a), y = verKey(b);
  for (let i = 0; i < 6; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}
const desc = (a, b) => cmp(b, a);
export const channelOf = (v) => (/b\d+$/.test(v || "") ? "beta" : "stable");

export function validPing(d) {
  if (!d || typeof d !== "object" || Array.isArray(d) || !SCHEMAS.includes(d.schema)) return null;
  const { id, version, channel } = d;
  if (typeof id !== "string" || !ID_RE.test(id)) return null;
  if (typeof version !== "string" || !VER_RE.test(version) || typeof channel !== "string") return null;
  if (channel !== channelOf(version)) return null;
  let modules = null; // null = Schema 1 / nicht gemeldet
  let ha = null;      // null = vor Schema 3 / nicht gemeldet
  if (d.schema >= 3) {
    if (d.ha != null && d.ha !== "" && (typeof d.ha !== "string" || !/^\d{4}\.\d{1,2}$/.test(d.ha))) return null;
    ha = d.ha ? d.ha.replace(/\.0(\d)$/, ".$1") : null;
  }
  if (d.schema >= 2) {
    const m = d.modules;
    const keys = Object.keys(MODULES);
    if (!Array.isArray(m) || m.length > keys.length || m.some((x) => typeof x !== "string" || !keys.includes(x))) return null;
    modules = keys.filter((k) => m.includes(k)).join(","); // feste Reihenfolge, Duplikate fallen weg
  }
  return { id, version, channel, modules, ha };
}

// ---------------------------------------------------------------- Datum (UTC, als Text JJJJ-MM-TT)
const dayMs = 86400000;
const D = (s) => Date.parse(s + "T00:00:00Z");
const S = (ms) => new Date(ms).toISOString().slice(0, 10);
const wd = (ms) => (new Date(ms).getUTCDay() + 6) % 7; // Montag = 0
const diff = (a, b) => Math.round((D(a) - D(b)) / dayMs);

// ---------------------------------------------------------------- Datenbank
export async function dbPing(DB, p, nowMs) {
  const now = Math.floor(nowMs / 1000);
  const day = S(nowMs);
  const row = await DB.prepare("SELECT last_ts FROM installs WHERE id=?").bind(p.id).first();
  if (row && now - row.last_ts < PING_MIN_GAP) return "too_many";
  await DB.batch([
    DB.prepare(
      "INSERT INTO installs(id, first_day, last_day, version, channel, last_ts, modules, ha) VALUES(?,?,?,?,?,?,?,?) " +
      "ON CONFLICT(id) DO UPDATE SET last_day=excluded.last_day, version=excluded.version, channel=excluded.channel, last_ts=excluded.last_ts, modules=excluded.modules, ha=excluded.ha"
    ).bind(p.id, day, day, p.version, p.channel, now, p.modules, p.ha ?? null),
    DB.prepare("INSERT OR REPLACE INTO daily(day, id, version, channel) VALUES(?,?,?,?)").bind(day, p.id, p.version, p.channel),
  ]);
  return "ok";
}
export async function dbForget(DB, id) {
  await DB.batch([DB.prepare("DELETE FROM installs WHERE id=?").bind(id), DB.prepare("DELETE FROM daily WHERE id=?").bind(id)]);
}
export async function dbCleanup(DB, keepDays, todayMs) {
  const cut = S(todayMs - keepDays * dayMs);
  await DB.batch([
    DB.prepare("DELETE FROM daily WHERE id IN (SELECT id FROM installs WHERE last_day<?)").bind(cut),
    DB.prepare("DELETE FROM installs WHERE last_day<?").bind(cut),
    DB.prepare("DELETE FROM daily WHERE day<?").bind(S(todayMs - 400 * dayMs)),
  ]);
}

// ---------------------------------------------------------------- Auswertung (Port von server.py: compute)
export function compute(installs, daily, todayStr, releases = []) {
  // installs: [id, first_day, last_day, version, channel, modules]; daily: [day, id, version, channel]
  const today = D(todayStr);
  const age = (r) => diff(todayStr, r[2]);
  const act30 = installs.filter((r) => age(r) <= 29);
  const act7 = installs.filter((r) => age(r) <= 6);
  const out = {
    today: todayStr, total: installs.length, a30: act30.length, a7: act7.length,
    new7: installs.filter((r) => diff(todayStr, r[1]) <= 6).length,
    inactive: installs.filter((r) => age(r) > 14).length,
  };
  const vc = {};
  for (const r of act30) vc[r[3]] = (vc[r[3]] || 0) + 1;
  out.versions = Object.entries(vc).sort((a, b) => desc(a[0], b[0]));
  const newest = out.versions.length ? out.versions[0][0] : "";
  out.newest = newest;
  out.newest_share = act30.length && newest ? Math.round((100 * vc[newest]) / act30.length) : 0;
  const ch = { stable: 0, beta: 0 };
  for (const r of act30) ch[r[4]] = (ch[r[4]] || 0) + 1;
  out.channels = { stable: ch.stable, beta: ch.beta };
  const withm = act30.filter((r) => r[5] !== null && r[5] !== undefined);
  const mc = {};
  for (const r of withm) for (const k of String(r[5]).split(",")) if (k && MODULES[k]) mc[MODULES[k]] = (mc[MODULES[k]] || 0) + 1;
  out.mod_base = withm.length;
  out.modules = Object.entries(mc).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  out.ha = haStats(act30);   // Build 6 · V2
  out.seen = [
    ["heute", installs.filter((r) => age(r) === 0).length],
    ["2–7 Tage", installs.filter((r) => age(r) >= 1 && age(r) <= 6).length],
    ["8–14 Tage", installs.filter((r) => age(r) >= 7 && age(r) <= 14).length],
    ["> 14 Tage", out.inactive],
  ];
  // Wochenverlauf: letzte 8 Wochen, Montag bis Sonntag
  const mon = today - wd(today) * dayMs;
  const weeks = [];
  for (let k = 7; k >= 0; k--) weeks.push(mon - k * 7 * dayMs);
  const wFrom = S(weeks[0]);
  const per = new Map();
  for (const [day, id, v] of daily) {
    if (day < wFrom) continue;
    const w = D(day) - wd(D(day)) * dayMs;
    const k = w + "|" + id;
    if (!per.has(k) || cmp(v, per.get(k)) > 0) per.set(k, v);
  }
  const wk = weeks.map(() => ({}));
  const idx = new Map(weeks.map((w, n) => [w, n]));
  for (const [k, v] of per) {
    const w = +k.split("|")[0];
    if (idx.has(w)) wk[idx.get(w)][v] = (wk[idx.get(w)][v] || 0) + 1;
  }
  const allv = [...new Set(wk.flatMap((w) => Object.keys(w)))].sort(desc);
  const top = allv.slice(0, 4);
  out.week_versions = top;
  out.week_from = S(weeks[0]);
  out.rel = releaseMarks(releases, out.week_from, todayStr, 6);   // Build 5: Release-Marken im Wochenverlauf
  out.weeks = weeks.map((w, n) => {
    const d = new Date(w);
    const counts = {};
    for (const v of top) counts[v] = wk[n][v] || 0;
    return {
      label: String(d.getUTCDate()).padStart(2, "0") + "." + String(d.getUTCMonth() + 1).padStart(2, "0") + ".",
      counts, other: Object.entries(wk[n]).filter(([v]) => !top.includes(v)).reduce((s, [, c]) => s + c, 0),
    };
  });
  // Update-Tempo der letzten Versionen
  const since = S(today - 60 * dayMs);
  const drows = daily.filter((r) => r[0] >= since).sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const first = {};
  for (const [day, , v] of drows) if (!(v in first)) first[v] = day;
  const cand = Object.keys(first).sort(desc).slice(0, 3);
  const curves = [];
  for (const v of cand) {
    const r0 = D(first[v]);
    const span = Math.round((today - r0) / dayMs);
    if (span < 2) continue;
    const cohort = new Set(drows.filter(([day]) => D(day) >= r0 && D(day) <= r0 + 14 * dayMs).map((r) => r[1]));
    if (cohort.size < 2) continue;
    const pts = [];
    for (let d = 0; d <= Math.min(span, 14); d++) {
      const have = new Set(drows.filter(([day, , vv]) => vv === v && D(day) <= r0 + d * dayMs).map((r) => r[1]));
      let n = 0;
      for (const i of have) if (cohort.has(i)) n++;
      pts.push(Math.round((1000 * n) / cohort.size) / 10);
    }
    curves.push({ v, pts });
    if (curves.length === 2) break;
  }
  out.curves = curves;
  out.t50 = null;
  for (const c of curves) {
    const d = c.pts.findIndex((p) => p >= 50);
    if (d >= 0) { out.t50 = d; break; }
  }
  return out;
}

/** Build 6 · V2: Home-Assistant-Versionen aller aktiven Installationen (r[6] = „2026.11“), neueste zuerst, mit „diese oder neuer“ */
const haKey = (v) => v.split(".").map(Number);
const haCmp = (a, b) => { const x = haKey(a), y = haKey(b); return x[0] - y[0] || x[1] - y[1]; };
export function haStats(act30, share = 95) {
  const c = {};
  for (const r of act30) if (typeof r[6] === "string" && /^\d{4}\.\d{1,2}$/.test(r[6])) c[r[6]] = (c[r[6]] || 0) + 1;
  const base = Object.values(c).reduce((a, b) => a + b, 0);
  let cum = 0;
  const rows = Object.entries(c).sort((a, b) => haCmp(b[0], a[0])).map(([v, n]) => { cum += n; return [v, n, base ? Math.round((1000 * cum) / base) / 10 : 0]; });
  const hit = rows.find((x) => x[2] >= share) || null;
  return { base, rows, min: hit ? { v: hit[0], p: Math.floor(hit[2]) } : null };
}
function haHtml(h) {
  if (!h || !h.base) return '<div class="c"><h2>Home Assistant</h2><div class="u">alle aktiven Installationen</div><div class="empty">Ab Build 6 meldet die Versions-Statistik die Home-Assistant-Version mit (ohne Patch-Stufe).</div></div>';
  const rows = h.rows.slice(0, 10), mx = Math.max(...rows.map((x) => x[1]));
  const svg = `<svg viewBox="0 0 460 ${26 * rows.length}" role="img" aria-label="Home-Assistant-Versionen">${rows.map(([v, n, c], k) => { const w = Math.max(3, (210 * n) / mx), y = k * 26;
    return `<text x="0" y="${y + 17}" fill="#c3c2b7" font-size="12">${e(v)}</text><rect x="70" y="${y + 4}" width="${f1(w)}" height="16" rx="4" fill="#3987e5"/><text x="${f1(70 + w + 8)}" y="${y + 17}" fill="#f0efec" font-size="12">${n} · ${Math.round((100 * n) / h.base)} %</text><text x="458" y="${y + 17}" fill="#8d8c84" font-size="11" text-anchor="end">${f1(c).replace(".", ",")} % ≥</text>`; }).join("")}</svg>`;
  return `<div class="c"><h2>Home Assistant</h2><div class="u">alle aktiven Installationen (30 Tage) · Basis ${h.base}${h.min ? ` · <b style="color:#5eead4">${h.min.p} % auf ${e(h.min.v)} oder neuer</b>` : ""}</div>${svg}<div class="l">rechts: Anteil auf dieser oder neuerer Version – Grundlage für die Mindestversion in hacs.json</div></div>`;
}

export async function loadAndCompute(DB, todayStr) {
  const ins = await DB.prepare("SELECT id, first_day, last_day, version, channel, modules, ha FROM installs").all();
  const since = S(D(todayStr) - 60 * dayMs - 8 * 7 * dayMs); // großzügig; compute() filtert selbst
  const dl = await DB.prepare("SELECT day, id, version, channel FROM daily WHERE day>=?").bind(since).all();
  const a = (rs) => rs.results.map((r) => Object.values(r));
  return compute(a(ins), a(dl), todayStr, await loadReleases(DB));
}

// ---------------------------------------------------------------- Darstellung (Port von server.py: render)
const VCOL = ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab"];
const CSS = `:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#111110;color:#f0efec;font:14px/1.45 system-ui,Segoe UI,Roboto,sans-serif}
.w{max-width:1100px;margin:0 auto;padding:14px}.ban{background:#0e5f59;border-radius:16px;padding:16px 20px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between}
.ban h1{margin:0;font-size:1.35rem}.ban small{color:#bfe9e5;display:block}.chip{background:#134e4a;color:#bfe9e5;border-radius:99px;padding:4px 12px;font-size:.78rem;font-weight:700}
.k{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin:10px 0}.c{background:#1a1a19;border:1px solid #3a3a38;border-radius:16px;padding:14px 16px}
.c .t{color:#c3c2b7;font-size:.82rem}.c .n{font-size:1.9rem;font-weight:800;margin:2px 0}.c .s{color:#8d8c84;font-size:.74rem}
.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:10px}.c h2{margin:0 0 2px;font-size:1rem}.c .u{color:#8d8c84;font-size:.78rem;margin-bottom:8px}
.l{display:flex;gap:12px;flex-wrap:wrap;font-size:.78rem;color:#c3c2b7;margin-top:6px}.l i{display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.empty{color:#8d8c84;padding:20px 0;text-align:center}.chips{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.chip.dv{background:#0b3f3b;border:1px solid #2a7d76;color:#fff}
.vk{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:10px 0}.vh{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0 0}.vh h2{margin:0;font-size:1.25rem}svg{max-width:100%;height:auto}.f{color:#8d8c84;font-size:.74rem;margin:12px 2px}`;
const e = (x) => String(x).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" }[c]));
const f1 = (x) => (Math.round(x * 10) / 10).toString();

function bars(rows, colors, labelW = 96, link = null) {
  if (!rows.length) return '<div class="empty">Noch keine Daten</div>';
  const mx = Math.max(...rows.map((r) => r[1])) || 1;
  const tot = rows.reduce((s, r) => s + r[1], 0) || 1;
  let s = `<svg viewBox="0 0 460 ${30 * rows.length}" role="img" aria-label="Balkendiagramm">`;
  rows.forEach(([name, v], n) => {
    const col = typeof colors === "string" ? colors : colors[Math.min(n, colors.length - 1)];
    const w = Math.max(3, (250 * v) / mx), y = n * 30;
    const lab = `<text x="0" y="${y + 19}" fill="#c3c2b7" font-size="12"${link ? ' text-decoration="underline"' : ""}>${e(name)}</text>`;
    s += `${link ? `<a href="${link(name)}">${lab}</a>` : lab}<rect x="${labelW}" y="${y + 5}" width="${f1(w)}" height="18" rx="4" fill="${col}"/>` +
      `<text x="${f1(labelW + w + 8)}" y="${y + 19}" fill="#f0efec" font-size="12">${v} · ${Math.round((100 * v) / tot)} %</text>`;
  });
  return s + "</svg>";
}
function modBars(rows, base) {
  if (!rows.length || !base) return '<div class="empty">Noch keine Modul-Angaben</div>';
  rows = rows.slice(0, 16);
  let s = `<svg viewBox="0 0 460 ${26 * rows.length}" role="img" aria-label="Modul-Nutzung">`;
  rows.forEach(([name, v], n) => {
    const w = Math.max(3, (240 * v) / base), y = n * 26;
    s += `<text x="0" y="${y + 17}" fill="#c3c2b7" font-size="12">${e(name)}</text><rect x="120" y="${y + 4}" width="${f1(w)}" height="16" rx="4" fill="#3987e5"/>` +
      `<text x="${f1(120 + w + 8)}" y="${y + 17}" fill="#f0efec" font-size="12">${Math.round((100 * v) / base)} %</text>`;
  });
  return s + "</svg>";
}
function columns(weeks, vers, rel = [], from = "") {
  const tot = weeks.map((w) => Object.values(w.counts).reduce((a, b) => a + b, 0) + w.other);
  if (!tot.some(Boolean)) return '<div class="empty">Noch keine Daten</div>';
  const mx = Math.max(...tot) || 1;
  let s = '<svg viewBox="0 -16 460 206" role="img" aria-label="Versionen pro Woche">';
  if (from) s += markSvg(rel, (d) => { const k = Math.round((D(d) - D(from)) / dayMs); return k < 0 || k > 55 ? null : f1(6 + Math.floor(k / 7) * 56 + ((k % 7) * 50) / 7); }, -6, 158, -6, 460);
  weeks.forEach((w, n) => {
    const x = 6 + n * 56, bw = 38;
    let y = 158;
    const stack = [];
    for (let k = vers.length - 1; k >= 0; k--) stack.push([w.counts[vers[k]] || 0, VCOL[k]]);
    stack.push([w.other, "#5b5a55"]);
    for (const [v, col] of stack) {
      if (!v) continue;
      const h = (140 * v) / mx;
      y -= h;
      s += `<rect x="${x}" y="${f1(y)}" width="${bw}" height="${f1(Math.max(h - 1.5, 1))}" rx="3" fill="${col}"/>`;
    }
    s += `<text x="${x + bw / 2}" y="176" fill="#8d8c84" font-size="10" text-anchor="middle">${e(w.label)}</text>`;
    if (tot[n]) s += `<text x="${x + bw / 2}" y="${f1(y - 4)}" fill="#c3c2b7" font-size="10" text-anchor="middle">${tot[n]}</text>`;
  });
  return s + "</svg>";
}
function curvesSvg(curves) {
  if (!curves.length) return '<div class="empty">Sobald eine neue Version zwei Tage alt ist, erscheint hier das Update-Tempo.</div>';
  const cols = ["#3987e5", "#d95926"];
  let s = '<svg viewBox="0 0 460 190" role="img" aria-label="Update-Tempo">';
  for (const p of [0, 50, 100]) {
    const y = 160 - (140 * p) / 100;
    s += `<line x1="40" x2="400" y1="${y}" y2="${y}" stroke="#3a3a38" stroke-width="1"/><text x="34" y="${y + 4}" fill="#8d8c84" font-size="10" text-anchor="end">${p} %</text>`;
  }
  curves.forEach((c, n) => {
    const pts = c.pts.map((v, d) => `${f1(40 + (360 * d) / 14)},${f1(160 - (140 * v) / 100)}`).join(" ");
    s += `<polyline points="${pts}" fill="none" stroke="${cols[n]}" stroke-width="2.5"/>`;
    const d = c.pts.length - 1;
    s += `<text x="${f1(Math.min(40 + (360 * d) / 14 + 6, 404))}" y="${f1(160 - (140 * c.pts[d]) / 100 + 4)}" fill="#c3c2b7" font-size="11">${e(c.v)}</text>`;
  });
  for (const d of [0, 3, 7, 10, 14]) s += `<text x="${40 + (360 * d) / 14}" y="178" fill="#8d8c84" font-size="10" text-anchor="middle">${d}</text>`;
  return s + "</svg>";
}
export function render(r, retention = "180", x = {}) {
  const ch = r.channels, cht = ch.stable + ch.beta;
  const kan = cht
    ? `<svg viewBox="0 0 460 40"><rect x="0" y="6" width="${f1((440 * ch.stable) / cht)}" height="26" rx="5" fill="#3987e5"/>` +
      `<rect x="${f1((440 * ch.stable) / cht + 2)}" y="6" width="${f1(Math.max((440 * ch.beta) / cht - 2, 0))}" height="26" rx="5" fill="#d95926"/>` +
      `<text x="10" y="24" fill="#fff" font-size="12" font-weight="700">Stabil ${Math.round((100 * ch.stable) / cht)} %</text>` +
      `<text x="${f1((440 * ch.stable) / cht + 10)}" y="24" fill="#fff" font-size="12" font-weight="700">${ch.beta ? "Beta " + Math.round((100 * ch.beta) / cht) + " %" : ""}</text></svg>`
    : '<div class="empty">Noch keine Daten</div>';
  const legend = r.week_versions.map((v, k) => `<span><i style="background:${VCOL[k]}"></i>${e(v)}</span>`).join("");
  const t50 = r.t50 !== null ? `${r.t50} Tage` : "–";
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Strom &amp; Wärme · Statistik</title><style>${CSS}${ERR_CSS}</style></head><body><div class="w">
<div class="ban"><div><h1>Strom &amp; Wärme · Statistik</h1><small>Welche Version ist im Einsatz? · anonym · Version und Module</small></div>${banChips(r.today)}</div>${tabs("v")}${x.week ? weekHtml(x.week) : ""}
<div class="k"><div class="c"><div class="t">Aktive Installationen</div><div class="n">${r.a30}</div><div class="s">30 Tage · ${r.a7} in den letzten 7 Tagen</div></div>
<div class="c"><div class="t">Neu diese Woche</div><div class="n">+${r.new7}</div><div class="s">${r.inactive} Installationen seit &gt;14 Tagen inaktiv</div></div>
<div class="c"><div class="t">Auf neuester Version</div><div class="n">${r.newest_share} %</div><div class="s">${e(r.newest || "–")}</div></div>
<div class="c"><div class="t">Update-Tempo</div><div class="n">${e(t50)}</div><div class="s">bis 50 % einer neuen Version nutzen</div></div></div>
<div class="g"><div class="c"><h2>Versionen aktuell</h2><div class="u">${r.a30} aktive Installationen (30 Tage)</div>${bars(r.versions.slice(0, 8), VCOL, 96, (v) => `/version/${encodeURIComponent(v)}`)}</div>
<div class="c"><h2>Verlauf: Versionen pro Woche</h2><div class="u">Neueste Version je Installation und Woche</div>${columns(r.weeks, r.week_versions, r.rel, r.week_from)}<div class="l">${legend}${(r.rel || []).length ? '<span><i style="background:#d95926"></i>neue Version erschienen</span>' : ""}</div></div>
<div class="c"><h2>Kanal &amp; Aktivität</h2><div class="u">Kanal (30 Tage)</div>${kan}<div class="u" style="margin-top:10px">Zuletzt gesehen</div>${bars(r.seen, "#3987e5", 78)}</div>
<div class="c"><h2>Update-Tempo</h2><div class="u">Anteil auf neuer Version nach x Tagen</div>${curvesSvg(r.curves)}</div>
<div class="c"><h2>Modul-Nutzung</h2><div class="u">Installationen mit Modul an · Basis ${r.mod_base} (30 Tage)</div>${modBars(r.modules, r.mod_base)}</div>${haHtml(r.ha)}${x.lag ? lagHtml(x.lag) : ""}</div>
<div class="f">Nur Teilnehmende zählen: Die Zahlen sind Untergrenzen und zeigen Trends, keine absolute Nutzerzahl. Kennungen ohne Meldung seit ${e(retention)} Tagen werden gelöscht.</div></div></body></html>`;
}

// ---------------------------------------------------------------- Build 9 · S1 Release-Bericht je Version
export async function versionReport(DB, v, todayStr) {
  const [r, er] = [await loadAndCompute(DB, todayStr), await errLoad(DB, todayStr, 30)];
  const rel = await loadReleases(DB), d0 = (rel.find((x) => x.v === v) || {}).d || "";
  const from = S(D(todayStr) - 29 * dayMs);
  const per = (await DB.prepare("SELECT day, COUNT(*) n FROM daily WHERE version=? AND day>=? GROUP BY day").bind(v, from).all()).results;
  const ha = (await DB.prepare("SELECT ha, COUNT(*) n FROM installs WHERE version=? AND last_day>=? GROUP BY ha").bind(v, from).all()).results;
  const inst = (r.versions.find((x) => x[0] === v) || [v, 0])[1];
  const P = versionErrPart(er, v);
  if (!inst && !d0 && !P.R && !P.neu.length && !P.fixed.length) return null;
  const pm = new Map(per.map((x) => [x.day, x.n]));
  const days = Array.from({ length: 30 }, (_, i) => { const d = S(D(todayStr) - (29 - i) * dayMs); return { d, n: pm.get(d) || 0 }; });
  const all = r.versions.map((x) => x[0]), i = all.indexOf(v);
  return { v, ch: channelOf(v), d0, live: d0 ? diff(todayStr, d0) : null, inst, share: r.a30 ? Math.round((100 * inst) / r.a30) : 0, a30: r.a30,
    newer: i > 0 ? all.slice(0, i).filter((x) => cmp(x, v) > 0) : [], days, ha: ha.filter((x) => x.ha).sort((a, b) => b.n - a.n), P, week: er.week };
}
const AMPC = { bereit: "#134e4a|#5eead4", gut: "#134e4a|#5eead4", abwarten: "#78350f|#fde68a", "nicht freigeben": "#7f1d1d|#fecaca", "Hotfix prüfen": "#7f1d1d|#fecaca", "Update empfehlen": "#7c2d12|#fdba74", abgelöst: "#262624|#8d8c84", älter: "#262624|#8d8c84" };
export function versionHtml(R) {
  const X = R.P.R, a = X ? (AMPC[X.amp] || AMPC.abwarten).split("|") : null, fd = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.` : "");
  const pq = (x) => (x && x.quote != null ? `${Math.round(x.quote * 100)} %` : "–"), pcl = (x) => (x && x.clean != null ? pc1(x.clean) : "–");
  const cmpTxt = [R.P.prev && R.P.prev.quote != null ? `vorher ${e(R.P.prev.v.replace(/^\d{4}\./, ""))}: ${pq(R.P.prev)}` : "", R.P.stable && R.P.stable.quote != null && R.P.stable !== R.P.prev ? `Stabil ${e(R.P.stable.v.replace(/^\d{4}\./, ""))}: ${pq(R.P.stable)}` : ""].filter(Boolean).join(" · ");
  const mx = Math.max(1, ...R.days.map((x) => x.n)), xOf = (d) => { const k = R.days.findIndex((x) => x.d === d); return k < 0 ? null : k * 20 + 10; };
  const pts = R.days.map((x, k) => `${k * 20 + 10},${f1(80 - (x.n / mx) * 70)}`).join(" ");
  const chart = R.days.some((x) => x.n) ? `<svg viewBox="0 -14 600 112" role="img" aria-label="Verbreitung">${R.d0 && xOf(R.d0) != null ? markSvg([{ v: R.v, d: R.d0 }], xOf, -4, 80, -6) : ""}<polyline points="${pts}" fill="none" stroke="#3987e5" stroke-width="2.5"/><text x="2" y="92" fill="#8d8c84" font-size="9">${fd(R.days[0].d)}</text><text x="598" y="92" fill="#8d8c84" font-size="9" text-anchor="end">heute · ${R.days.at(-1).n}</text></svg>` : '<div class="empty">Keine Versions-Meldungen in den letzten 30 Tagen.</div>';
  const haT = R.ha.length ? `<table class="mini">${R.ha.slice(0, 6).map((x) => `<tr><td>${e(x.ha)}</td><td class="num">${x.n} Inst.</td></tr>`).join("")}</table>` : '<div class="empty">Keine Angaben (erst ab 2026.11.5b1).</div>';
  return `<div class="c"><div class="flt"><a href="/">← Versionen</a><a href="/fehler">Fehler</a></div>
    <div class="vh"><h2>${e(R.v)}</h2><span class="tg" style="background:${R.ch === "beta" ? "#7c2d12;color:#fdba74" : "#1e3a8a;color:#bfdbfe"}">${R.ch === "beta" ? "Beta" : "Stabil"}</span>${X ? `<span class="tg" style="background:${a[0]};color:${a[1]}">${e(X.amp)}</span><span class="u" style="margin:0">${e(X.why)}</span>` : ""}</div>
    <div class="u" style="margin-top:4px">${R.d0 ? `zuerst gemeldet am ${e(R.d0)} · seit ${R.live} ${R.live === 1 ? "Tag" : "Tagen"}` : "Erscheinungstag unbekannt"}${R.newer.length ? ` · neuere Versionen: ${R.newer.slice(-3).map((x) => `<a class="lga" href="/version/${encodeURIComponent(x)}">${e(x)}</a>`).join(", ")}` : " · neueste Version"}</div></div>
  <div class="vk"><div class="c"><div class="t">Installationen</div><div class="n">${R.inst}</div><div class="s">${R.share} % aller ${R.a30} aktiven (30 Tage)</div></div>
    <div class="c"><div class="t">Fehlerquote</div><div class="n">${pq(X)}</div><div class="s">${X && X.counted ? `${X.err} von ${X.inst} mit Fehler` : "erst mit Tages-Meldungen (ab 2026.11.5b1)"}${cmpTxt ? ` · ${cmpTxt}` : ""}</div></div>
    <div class="c"><div class="t">Fehlerfreie Tage</div><div class="n">${pcl(X)}</div><div class="s">${X && X.useDays ? `${X.useDays - X.errDays} von ${X.useDays} Nutzungstagen ohne Fehler` : "Nutzungstage ohne Fehler"}</div></div>
    <div class="c"><div class="t">Neu · behoben</div><div class="n">${R.P.neu.length} · ${R.P.fixed.length}</div><div class="s">Fehler neu in dieser Version · hier behoben</div></div></div>
  ${versionErrHtml(R.P, R.v)}
  <div class="g" style="margin-top:10px"><div class="c"><h2>Verbreitung</h2><div class="u">Installationen auf ${e(R.v)} pro Tag · 30 Tage · orange: erschienen</div>${chart}</div>
    <div class="c"><h2>Home Assistant</h2><div class="u">Installationen auf dieser Version</div>${haT}</div></div>`;
}

// ---------------------------------------------------------------- Cloudflare-Access-Token prüfen (RS256)
const b64u = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=")), (c) => c.charCodeAt(0));
const jwtJson = (s) => JSON.parse(new TextDecoder().decode(b64u(s)));
let jwksCache = { at: 0, keys: null, team: "" };

export async function verifyAccess(token, env, nowMs = Date.now(), fetcher = fetch) {
  if (!token || !env.TEAM_DOMAIN || !env.POLICY_AUD || /^(DEIN-|HIER-)/.test(env.TEAM_DOMAIN + env.POLICY_AUD)) return false;
  try {
    const [h, p, sig] = token.split(".");
    if (!h || !p || !sig) return false;
    const head = jwtJson(h), pay = jwtJson(p);
    if (head.alg !== "RS256") return false;
    const aud = Array.isArray(pay.aud) ? pay.aud : [pay.aud];
    if (!aud.includes(env.POLICY_AUD)) return false;
    if (pay.iss !== "https://" + env.TEAM_DOMAIN) return false;
    if (typeof pay.exp !== "number" || pay.exp * 1000 < nowMs) return false;
    if (jwksCache.team !== env.TEAM_DOMAIN || nowMs - jwksCache.at > 3600e3 || !jwksCache.keys) {
      const res = await fetcher(`https://${env.TEAM_DOMAIN}/cdn-cgi/access/certs`);
      if (!res.ok) return false;
      jwksCache = { at: nowMs, keys: (await res.json()).keys || [], team: env.TEAM_DOMAIN };
    }
    const jwk = jwksCache.keys.find((k) => k.kid === head.kid);
    if (!jwk) return false;
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    return await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64u(sig), new TextEncoder().encode(h + "." + p));
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- Anfragen
const json = (code, body) =>
  new Response(JSON.stringify(body ?? { ok: code < 300 }), { status: code, headers: { "content-type": "application/json", "cache-control": "no-store" } });

async function ingest(req, env, url) {
  if (req.method === "GET" && url.pathname === "/health") return json(200, { ok: true, build: DASH.build, date: DASH.date });
  if (req.method !== "POST" || !["/v1/ping", "/v1/forget", "/v1/errors", "/v1/errors/forget"].includes(url.pathname)) return json(404, { ok: false });
  const raw = await req.arrayBuffer();
  if (raw.byteLength === 0 || raw.byteLength > (url.pathname === "/v1/errors" ? ERR_MAX_BODY : MAX_BODY)) return json(413, { ok: false });
  let d;
  try { d = JSON.parse(new TextDecoder().decode(raw)); } catch { return json(400, { ok: false }); }
  if (url.pathname === "/v1/errors/forget") {   /* Fehler-Statistik: alle Berichte einer Kennung löschen */
    const id = d && typeof d === "object" ? d.id : null;
    if (typeof id === "string" && ID_RE.test(id)) { await dbErrForget(env.DB, id); return json(200); }
    return json(400, { ok: false });
  }
  if (url.pathname === "/v1/errors") {
    const p = validErrors(d);
    if (!p) return json(400, { ok: false });
    const res = await dbErrors(env.DB, p, Date.now());
    if (res !== "ok") return json(429, { ok: false, error: res });
    return json(200, p.schema >= 3 ? { ok: true, n: p.errors.length, status: await errOwnStatus(env.DB, p) } : { ok: true, n: p.errors.length });
  }
  if (url.pathname === "/v1/forget") {
    const id = d && typeof d === "object" ? d.id : null;
    if (typeof id === "string" && ID_RE.test(id)) { await dbForget(env.DB, id); return json(200); }
    return json(400, { ok: false });
  }
  const p = validPing(d);
  if (!p) return json(400, { ok: false });
  const res = await dbPing(env.DB, p, Date.now());
  return res === "ok" ? json(200) : json(429, { ok: false, error: res });
}

const page = (title, body, today, week = null, tab = "f", sub = "Fehlerberichte · freiwillig · bereinigt", foot = "Nur Installationen, die Fehlerberichte eingeschaltet haben. Berichte älter als 90 Tage werden gelöscht.") => `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${title}</title><style>${CSS}${ERR_CSS}</style></head><body><div class="w">
<div class="ban"><div><h1>Strom &amp; Wärme · Statistik</h1><small>${sub}</small></div>${banChips(today)}</div>${tabs(tab)}${weekHtml(week)}${body}
<div class="f">${foot}</div></div></body></html>`;
const html = (s, code = 200) => new Response(s, { status: code, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });

async function dashboard(req, env, url) {
  const fm = /^\/fehler(?:\/([0-9a-f]{12}))?\/?$/.exec(url.pathname), vm = /^\/version\/([0-9.b]{5,24})\/?$/.exec(url.pathname);
  const post = req.method === "POST" && fm && fm[1];
  if ((req.method !== "GET" && !post) || (url.pathname !== "/" && !fm && !vm)) return json(404, { ok: false });
  if (!(await verifyAccess(req.headers.get("cf-access-jwt-assertion"), env))) return new Response("Zugriff verweigert", { status: 403, headers: { "cache-control": "no-store" } });
  const today = S(Date.now());
  if (post) {   /* Build 4: Status speichern – nur aus dem eigenen Dashboard (gleiche Herkunft), nur hinter Access */
    const origin = req.headers.get("origin"), site = req.headers.get("sec-fetch-site");
    if ((origin && origin !== `https://${env.DASH_HOST}`) || (!origin && site !== "same-origin")) return new Response("Fremde Herkunft", { status: 403, headers: { "cache-control": "no-store" } });
    let form; try { form = await req.formData(); } catch { return json(400, { ok: false }); }
    const act = String(form.get("act") || "");
    if (act === "merge") {   /* Build 8: diesen Fehler in einen anderen einordnen */
      const m = await dbErrMerge(env.DB, fm[1], String(form.get("into") || ""), Date.now());
      if (m.err) return json(m.err === "unbekannt" ? 404 : 400, { ok: false, error: m.err });
      return new Response(null, { status: 303, headers: { location: `/fehler/${m.root}`, "cache-control": "no-store" } });
    }
    if (act === "split") {
      const kid = String(form.get("fp") || "");
      if (!(await dbErrSplit(env.DB, kid))) return json(404, { ok: false });
      return new Response(null, { status: 303, headers: { location: `/fehler/${fm[1]}`, "cache-control": "no-store" } });
    }
    const st = validStatus(form);
    if (!st) return json(400, { ok: false });
    if (!(await dbErrStatus(env.DB, fm[1], st, Date.now()))) return json(404, { ok: false });
    return new Response(null, { status: 303, headers: { location: `/fehler/${fm[1]}`, "cache-control": "no-store" } });
  }
  if (vm) {   /* Build 9 · Release-Bericht je Version */
    const v = decodeURIComponent(vm[1]);
    if (!VER_RE.test(v)) return json(404, { ok: false });
    const R = await versionReport(env.DB, v, today);
    return R ? html(page(`${e(v)} · Strom &amp; Wärme`, versionHtml(R), today, R.week, "", "Release-Bericht · eine Version auf einen Blick", "Installationen aus der Versions-Statistik, Fehlerquote und fehlerfreie Tage aus den Fehlerberichten (nur mit Zustimmung).")) : html(page("Version · Strom &amp; Wärme", `<div class="c"><div class="empty">Zu ${e(v)} gibt es keine Meldungen.</div></div>`, today, null, ""), 404);
  }
  if (fm && fm[1]) {
    const D = await errLoadOne(env.DB, fm[1], today);
    if (D && D.redirect) return new Response(null, { status: 302, headers: { location: `/fehler/${D.redirect}`, "cache-control": "no-store" } });
    return D ? html(page("Fehler · Strom &amp; Wärme", errRenderOne(D, env.GITHUB_REPO), today, (await errLoad(env.DB, today, 7)).week)) : html(page("Fehler · Strom &amp; Wärme", '<div class="c"><div class="empty">Diesen Fehler gibt es nicht (mehr).</div></div>', today), 404);
  }
  if (fm) {
    const q = {}; for (const k of ["tage", "mod", "src", "neu", "alle", "ign", "ver"]) { const v = url.searchParams.get(k); if (v) q[k] = v.slice(0, 40); }
    if (q.ver && !VER_RE.test(q.ver)) delete q.ver;
    const days = [30, 90].includes(+q.tage) ? +q.tage : 7, er = await errLoad(env.DB, today, days);
    return html(page("Fehler · Strom &amp; Wärme", errRender(er, q), today, er.week));
  }
  const r = await loadAndCompute(env.DB, today), er = await errLoad(env.DB, today, 7);
  return html(render(r, env.RETENTION_DAYS || "180", { week: er.week, lag: laggards(er.rows, r.versions) }));
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.hostname === env.INGEST_HOST) return ingest(req, env, url);
    if (url.hostname === env.DASH_HOST) return dashboard(req, env, url);
    return json(404, { ok: false });
  },
  async scheduled(_ev, env, ctx) {
    ctx.waitUntil(Promise.all([dbCleanup(env.DB, +(env.RETENTION_DAYS || 180), Date.now()), dbErrCleanup(env.DB, Date.now())]));
  },
};
