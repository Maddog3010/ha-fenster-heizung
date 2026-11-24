// Statistik Build 10: Langzeit-Verlauf (S3), Verloren nach Update (S4), Treue neuer Installationen (S6), Export als CSV (S10).
// Alles rechnet mit Daten, die schon da sind. Neu ist nur die Tabelle „snap“: eine Zeile Zusammenfassung pro Tag, ohne Kennungen.

const dayMs = 86400000;
const D = (s) => Date.parse(s + "T00:00:00Z");
const S = (ms) => new Date(ms).toISOString().slice(0, 10);
const e = (x) => String(x ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" }[c]));
const VER_RE = /^(\d{4})\.(\d{1,2})\.(\d{1,2})(?:\.(\d{1,2}))?(?:b(\d{1,3}))?$/;
const vkey = (v) => { const m = VER_RE.exec(v || "") || []; return [+m[1] || 0, +m[2] || 0, +m[3] || 0, +m[4] || 0, m[5] === undefined ? 1 : 0, +m[5] || 0]; };
const vcmp = (a, b) => { const x = vkey(a), y = vkey(b); for (let i = 0; i < 6; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };
const isBeta = (v) => /b\d+$/.test(v || "");
const fd = (d) => `${d.slice(8, 10)}.${d.slice(5, 7)}.`;
export const SNAP_KEEP_DAYS = 730;   // 2 Jahre

// ---------------------------------------------------------------- S3 Langzeit-Verlauf
/** Tageswerte aus der Auswertung: r = compute() der Versions-Statistik, reife = releaseReady().list */
export function snapRow(todayStr, r, reife) {
  const L = (reife || []).filter((x) => x.counted), inst = L.reduce((a, x) => a + x.inst, 0), err = L.reduce((a, x) => a + x.err, 0);
  const use = L.reduce((a, x) => a + (x.useDays || 0), 0), bad = L.reduce((a, x) => a + (x.errDays || 0), 0);
  return { day: todayStr, a30: r.a30, a7: r.a7, beta: r.channels.beta, newest: r.newest || "", newest_share: r.newest_share,
    rep: inst, quote: inst ? Math.round((10000 * err) / inst) / 10000 : null, clean: use ? Math.round((10000 * (use - bad)) / use) / 10000 : null, src: "t" };
}
export async function saveSnap(DB, row) {
  try {
    await DB.prepare("INSERT INTO snap(day, a30, a7, beta, newest, newest_share, rep, quote, clean, src) VALUES(?,?,?,?,?,?,?,?,?,?) " +
      "ON CONFLICT(day) DO UPDATE SET a30=excluded.a30, a7=excluded.a7, beta=excluded.beta, newest=excluded.newest, newest_share=excluded.newest_share, rep=excluded.rep, quote=excluded.quote, clean=excluded.clean, src=excluded.src")
      .bind(row.day, row.a30, row.a7, row.beta, row.newest, row.newest_share, row.rep, row.quote, row.clean, row.src).run();
    return true;
  } catch { return false; }   // vor der Migration: nichts speichern
}
/** Beim ersten Mal: aktive Installationen der vergangenen Tage aus der Tagesliste nachrechnen (ohne Fehlerzahlen, Quelle „r“). */
export function backfill(daily, todayStr, maxDays = 365) {
  if (!daily.length) return [];
  const first = daily.reduce((m, x) => (x.day < m ? x.day : m), todayStr), out = [];
  const byDay = new Map();
  for (const x of daily) { if (!byDay.has(x.day)) byDay.set(x.day, []); byDay.get(x.day).push(x); }
  for (let t = Math.max(D(first), D(todayStr) - maxDays * dayMs); t < D(todayStr); t += dayMs) {
    const last = new Map();   // Kennung → letzte Version in den 30 Tagen bis t
    for (let k = 29; k >= 0; k--) for (const x of byDay.get(S(t - k * dayMs)) || []) last.set(x.id, { v: x.version, k });
    if (!last.size) continue;
    const vals = [...last.values()];
    out.push({ day: S(t), a30: vals.length, a7: vals.filter((x) => x.k <= 6).length, beta: vals.filter((x) => isBeta(x.v)).length, newest: "", newest_share: null, rep: null, quote: null, clean: null, src: "r" });
  }
  return out;
}
export async function loadSnaps(DB, todayStr, days = 365) {
  try { return (await DB.prepare("SELECT * FROM snap WHERE day>=? ORDER BY day").bind(S(D(todayStr) - days * dayMs)).all()).results; } catch { return null; }
}
/** Heutige Zeile schreiben; ist die Tabelle noch leer, vorher die Vergangenheit aus der Tagesliste nachrechnen. */
export async function snapToday(DB, todayStr, r, reife) {
  let n;
  try { n = (await DB.prepare("SELECT COUNT(*) n FROM snap").first()).n; } catch { return false; }
  if (!n) {
    const dl = (await DB.prepare("SELECT day, id, version FROM daily").all()).results;
    for (const row of backfill(dl, todayStr)) await saveSnap(DB, row);
  }
  return saveSnap(DB, snapRow(todayStr, r, reife));
}
export async function snapCleanup(DB, todayMs) {
  try { await DB.prepare("DELETE FROM snap WHERE day<?").bind(S(todayMs - SNAP_KEEP_DAYS * dayMs)).run(); } catch { /* vor Build 10 */ }
}
function lineChart(rows, series, marks, { h = 150, pct = false, W = 1000 } = {}) {
  const L = 34, R = 8, T = 16, B = 18, n = rows.length;
  const vals = rows.flatMap((x) => series.map((s) => x[s.k])).filter((v) => v != null);
  if (n < 2 || vals.length < 2) return null;
  const lo = pct ? Math.max(0, Math.floor(Math.min(...vals) * 20) / 20 - 0.05) : 0, hi = pct ? 1 : Math.max(1, ...vals) * 1.1;
  const t0 = D(rows[0].day), t1 = D(rows[n - 1].day), X = (d) => L + ((W - L - R) * (D(d) - t0)) / Math.max(1, t1 - t0), Y = (v) => T + (h - T - B) * (1 - (v - lo) / (hi - lo));
  let s = `<svg viewBox="0 0 ${W} ${h}" role="img">`;
  for (const g of [lo, (lo + hi) / 2, hi]) s += `<line x1="${L}" x2="${W - R}" y1="${Y(g).toFixed(1)}" y2="${Y(g).toFixed(1)}" stroke="#3a3a38"/><text x="${L - 4}" y="${(Y(g) + 3).toFixed(1)}" fill="#8d8c84" font-size="9" text-anchor="end">${pct ? Math.round(g * 100) + " %" : Math.round(g)}</text>`;
  for (const m of marks || []) { if (m.d < rows[0].day || m.d > rows[n - 1].day) continue; const x = X(m.d).toFixed(1); s += `<line x1="${x}" x2="${x}" y1="${T - 4}" y2="${h - B}" stroke="#5b5a55" stroke-dasharray="2 3"><title>${e(m.v)}</title></line><text x="${(+x + 2).toFixed(1)}" y="${T - 6}" fill="#8d8c84" font-size="8">${e(m.v.replace(/^\d{4}\./, ""))}</text>`; }
  for (const sr of series) {
    let path = "", pen = false;
    for (const x of rows) { const v = x[sr.k]; if (v == null) { pen = false; continue; } path += `${pen ? "L" : "M"}${X(x.day).toFixed(1)},${Y(v).toFixed(1)}`; pen = true; }
    if (path) s += `<path d="${path}" fill="none" stroke="${sr.c}" stroke-width="2.2"${sr.dash ? ' stroke-dasharray="4 3"' : ""}/>`;
  }
  s += `<text x="${L}" y="${h - 4}" fill="#8d8c84" font-size="9">${fd(rows[0].day)}${rows[0].day.slice(2, 4)}</text><text x="${W - R}" y="${h - 4}" fill="#8d8c84" font-size="9" text-anchor="end">heute</text>`;
  return s + "</svg>";
}
export function langzeitHtml(rows, releases) {
  const head = `<h2>Langzeit-Verlauf</h2>`;
  if (rows == null) return `<div class="c wide">${head}<div class="empty">Noch nicht eingerichtet: einmal <code>migrate-build10.sql</code> ausführen.</div></div>`;
  const marks = (releases || []).filter((x) => !isBeta(x.v)).sort((a, b) => (a.d < b.d ? -1 : 1));
  const a = lineChart(rows, [{ k: "a30", c: "#3987e5" }, { k: "beta", c: "#d95926" }], marks);
  const q = lineChart(rows, [{ k: "clean", c: "#5eead4" }], [], { h: 110, pct: true });
  const rec = rows.filter((x) => x.src === "r").length;
  return `<div class="c wide"><div style="display:flex;justify-content:space-between;gap:8px">${head}<a class="csv" href="/export/verlauf.csv">CSV</a></div>
    <div class="u">bis 12 Monate · blau: aktive Installationen (30 Tage) · orange: davon Beta · Linien: stabile Versionen${rec ? ` · die ersten ${rec} Tage nachgerechnet aus der Tagesliste` : ""}</div>
    ${a || `<div class="empty">Sammelt ab heute – in ein paar Tagen steht hier die erste Kurve.</div>`}
    ${q ? `<div class="u" style="margin-top:8px">fehlerfreie Tage aller Versionen mit Tages-Meldung</div>${q}` : ""}</div>`;
}

// ---------------------------------------------------------------- S4 Verloren nach Update
/** daily: [{day, id, version}] (alle verfügbaren) · Update = erster Tag auf v, davor eine andere Version.
 *  Verstummt = danach höchstens bis 6 Tage nach dem Update gemeldet und seit mindestens 7 Tagen still. Erst 7 Tage nach dem Update zählt es. */
export function lostAfterUpdate(daily, todayStr, maxVers = 6) {
  const by = new Map();
  for (const x of daily) { if (!by.has(x.id)) by.set(x.id, []); by.get(x.id).push(x); }
  const today = D(todayStr), out = new Map();
  for (const list of by.values()) {
    list.sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
    const last = D(list.at(-1).day);
    for (let i = 1; i < list.length; i++) {
      if (list[i].version === list[i - 1].version) continue;
      const v = list[i].version, t = D(list[i].day);
      if (vcmp(v, list[i - 1].version) <= 0) continue;   // zurück auf eine ältere Version zählt nicht als Update
      const o = out.get(v) || { v, upd: 0, lost: 0, open: 0 };
      if (today - t < 7 * dayMs) o.open++;
      else { o.upd++; if (last - t <= 6 * dayMs && today - last >= 7 * dayMs) o.lost++; }
      out.set(v, o);
    }
  }
  return [...out.values()].sort((a, b) => vcmp(b.v, a.v)).slice(0, maxVers).map((x) => ({ ...x, q: x.upd ? x.lost / x.upd : null }));
}
export function lostHtml(L) {
  const col = (q) => (q == null ? "" : q >= 0.1 ? "background:#7f1d1d;color:#fecaca" : q >= 0.05 ? "background:#78350f;color:#fde68a" : "background:#134e4a;color:#5eead4");
  const body = L.length ? `<table class="mini"><tr><th style="text-align:left">Version</th><th class="num">aktualisiert</th><th class="num">verstummt</th><th class="num">Anteil</th></tr>${L.map((x) => `<tr><td><a class="lga" href="/version/${encodeURIComponent(x.v)}">${e(x.v)}</a></td><td class="num">${x.upd}${x.open ? ` <small style="color:#8d8c84">+${x.open}</small>` : ""}</td><td class="num">${x.upd ? x.lost : "–"}</td><td class="num">${x.q == null ? "–" : `<span class="tg" style="${col(x.q)}">${Math.round(x.q * 100)} %</span>`}</td></tr>`).join("")}</table>`
    : '<div class="empty">Noch keine Updates in der Tagesliste.</div>';
  return `<div class="c"><div style="display:flex;justify-content:space-between;gap:8px"><h2>Verloren nach Update</h2><a class="csv" href="/export/verloren.csv">CSV</a></div><div class="u">nach dem Update keine Meldung mehr innerhalb von 7 Tagen · +n = Update jünger als 7 Tage, zählt noch nicht</div>${body}</div>`;
}

// ---------------------------------------------------------------- S6 Treue neuer Installationen
/** installs: [{first_day, last_day}] · Kohorte = Woche (Montag) des ersten Tages · „aktiv nach k Wochen“ = zuletzt gesehen ab erstem Tag + 7k */
export function cohorts(installs, todayStr, weeks = 10, ks = [1, 4, 8]) {
  const today = D(todayStr), mon = (t) => t - ((new Date(t).getUTCDay() + 6) % 7) * dayMs, w0 = mon(today) - (weeks - 1) * 7 * dayMs;
  const out = [];
  for (let w = w0; w <= today; w += 7 * dayMs) {
    const L = installs.filter((x) => D(x.first_day) >= w && D(x.first_day) < w + 7 * dayMs);
    out.push({ week: S(w), n: L.length, ret: ks.map((k) => {
      const ripe = L.filter((x) => D(x.first_day) + k * 7 * dayMs <= today);
      return ripe.length === L.length && L.length ? ripe.filter((x) => D(x.last_day) >= D(x.first_day) + k * 7 * dayMs).length / L.length : null;
    }) });
  }
  return { ks, rows: out.reverse() };
}
export function cohortHtml(C) {
  const rows = C.rows.filter((x) => x.n);
  const cell = (q) => (q == null ? '<td class="num" style="color:#5b5a55">–</td>' : `<td class="num"><span class="tg" style="${q >= 0.8 ? "background:#134e4a;color:#5eead4" : q >= 0.6 ? "background:#78350f;color:#fde68a" : "background:#7f1d1d;color:#fecaca"}">${Math.round(q * 100)} %</span></td>`);
  const body = rows.length ? `<table class="mini"><tr><th style="text-align:left">neu in Woche ab</th><th class="num">neu</th>${C.ks.map((k) => `<th class="num">${k} ${k === 1 ? "Woche" : "Wochen"}</th>`).join("")}</tr>${rows.map((x) => `<tr><td>${fd(x.week)}</td><td class="num">${x.n}</td>${x.ret.map(cell).join("")}</tr>`).join("")}</table>`
    : '<div class="empty">Keine neuen Installationen in den letzten Wochen.</div>';
  return `<div class="c"><div style="display:flex;justify-content:space-between;gap:8px"><h2>Treue neuer Installationen</h2><a class="csv" href="/export/treue.csv">CSV</a></div><div class="u">noch aktiv nach … Wochen · „–“ = noch nicht so lange her</div>${body}</div>`;
}

// ---------------------------------------------------------------- S10 Export als CSV
const cv = (x) => { if (x == null) return ""; if (typeof x === "number") return String(Math.round(x * 10000) / 10000).replace(".", ","); const s = String(x); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export const csv = (head, rows) => "﻿" + [head, ...rows].map((r) => r.map(cv).join(";")).join("\r\n") + "\r\n";
export const EXPORTS = ["versionen", "reife", "fehler", "verlauf", "verloren", "treue", "module", "ha", "modulverlauf"];
export const CSV_CSS = `.csv{color:#8d8c84;font-size:.74rem;text-decoration:none;border:1px solid #3a3a38;border-radius:99px;padding:1px 9px;align-self:flex-start;white-space:nowrap}.csv:hover{color:#5eead4;border-color:#2dd4bf}.c.wide{grid-column:1/-1}.g2m{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:4px 24px;align-items:start}`;

// ---------------------------------------------------------------- Build 11 · S7 Modul-Nutzung im Verlauf
/** Tagesliste mit Modulen (ab Build 11). null = Spalte fehlt noch (vor migrate-build11.sql). */
export async function loadModDaily(DB, todayStr, weeks = 12) {
  try { return (await DB.prepare("SELECT day, id, modules FROM daily WHERE modules IS NOT NULL AND day>=?").bind(S(D(todayStr) - weeks * 7 * dayMs - 7 * dayMs)).all()).results; } catch { return null; }
}
/** Je Woche (Montag) und Modul: Anteil der Installationen mit Modul an – je Installation zählt die letzte Meldung der Woche. */
export function modTrend(rows, todayStr, labels, weeks = 12) {
  const today = D(todayStr), mon = (t) => t - ((new Date(t).getUTCDay() + 6) % 7) * dayMs, w0 = mon(today) - (weeks - 1) * 7 * dayMs;
  const W = Array.from({ length: weeks }, (_, i) => ({ w: S(w0 + i * 7 * dayMs), last: new Map() }));
  for (const x of rows) {
    const i = Math.floor((D(x.day) - w0) / (7 * dayMs));
    if (i < 0 || i >= weeks) continue;
    const o = W[i].last.get(x.id);
    if (!o || x.day > o.day) W[i].last.set(x.id, x);
  }
  const weeksOut = W.map((w) => ({ w: w.w, n: w.last.size }));
  const mods = Object.entries(labels).map(([k, label]) => {
    const pts = W.map((w) => (w.last.size ? [...w.last.values()].filter((x) => String(x.modules).split(",").includes(k)).length / w.last.size : null));
    const have = pts.map((q, i) => [q, i]).filter(([q]) => q != null), now = have.length ? have.at(-1)[0] : null;
    const ago = have.length > 1 ? (have.find(([, i]) => i >= have.at(-1)[1] - 4) || have[0])[0] : null;
    return { k, label, pts, now, delta: now != null && ago != null ? now - ago : null };
  }).filter((m) => m.now != null);
  mods.sort((a, b) => b.now - a.now);
  return { weeks: weeksOut, mods, filled: weeksOut.filter((w) => w.n).length };
}
function spark(pts, w = 150, h = 26) {
  const P = pts.map((q, i) => [q, i]).filter(([q]) => q != null);
  if (P.length < 2) return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><circle cx="${w - 3}" cy="${h / 2}" r="2.5" fill="#3987e5"/></svg>`;
  const X = (i) => 3 + ((w - 6) * i) / (pts.length - 1), Y = (q) => h - 3 - (h - 6) * q;
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><line x1="3" x2="${w - 3}" y1="${Y(0.5)}" y2="${Y(0.5)}" stroke="#3a3a38" stroke-dasharray="2 3"/><polyline points="${P.map(([q, i]) => `${X(i).toFixed(1)},${Y(q).toFixed(1)}`).join(" ")}" fill="none" stroke="#3987e5" stroke-width="2"/><circle cx="${X(P.at(-1)[1]).toFixed(1)}" cy="${Y(P.at(-1)[0]).toFixed(1)}" r="2.5" fill="#3987e5"/></svg>`;
}
export function modTrendHtml(T) {
  const head = `<div style="display:flex;justify-content:space-between;gap:8px"><h2>Modul-Nutzung im Verlauf</h2><a class="csv" href="/export/modulverlauf.csv">CSV</a></div>`;
  if (T == null) return `<div class="c wide">${head}<div class="empty">Noch nicht eingerichtet: einmal <code>migrate-build11.sql</code> ausführen.</div></div>`;
  if (!T.mods.length) return `<div class="c wide">${head}<div class="empty">Sammelt ab heute – mit jeder Versions-Meldung kommen die Module dazu. Nach ein paar Wochen stehen hier die Kurven.</div></div>`;
  const dl = (d) => (d == null ? '<span style="color:#5b5a55">–</span>' : Math.abs(d) < 0.005 ? '<span style="color:#8d8c84">±0</span>' : `<span style="color:${d > 0 ? "#5eead4" : "#f87171"}">${d > 0 ? "+" : "−"}${Math.round(Math.abs(d) * 100)}</span>`);
  const row = (m) => `<tr><td>${e(m.label)}</td><td class="num"><b>${Math.round(m.now * 100)} %</b></td><td class="num">${dl(m.delta)}</td><td style="padding-left:14px">${spark(m.pts)}</td></tr>`;
  const used = T.mods.filter((m) => m.pts.some((q) => q)), never = T.mods.filter((m) => !m.pts.some((q) => q));
  const half = Math.ceil(used.length / 2), tbl = (L) => `<table class="mini"><tr><th style="text-align:left">Modul</th><th class="num">jetzt</th><th class="num">4 Wo.</th><th style="text-align:left;padding-left:14px">12 Wochen</th></tr>${L.map(row).join("")}</table>`;
  return `<div class="c wide">${head}<div class="u">Anteil der Installationen mit Modul an, je Woche · „4 Wo.“ = Veränderung in Prozentpunkten gegenüber vor 4 Wochen${T.filled < 4 ? ` · erst ${T.filled} ${T.filled === 1 ? "Woche" : "Wochen"} gesammelt` : ""}</div>
    <div class="g2m">${tbl(used.slice(0, half))}${used.length > 1 ? tbl(used.slice(half)) : ""}</div>${never.length ? `<div class="u" style="margin:8px 0 0">In 12 Wochen nirgends eingeschaltet: ${never.map((m) => e(m.label)).join(" · ")}</div>` : ""}</div>`;
}
