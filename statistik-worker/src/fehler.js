// Fehler-Statistik Build 3: Fehlerberichte annehmen (POST /v1/errors, /v1/errors/forget) und im Dashboard als Liste zeigen.
// Gleicher Fehler bei vielen Nutzern = eine Zeile (Fingerabdruck fp). Die Integration bereinigt vorher; der Worker prüft jedes
// Feld noch einmal, schneidet Unbekanntes ab und entfernt Adressen, falls doch welche durchrutschen. Keine IP-Adressen gespeichert.

export const ERR_SCHEMAS = [1, 2, 3];   // Schema 3 (Build 7): „known“ = schon gesendete Fehler, Antwort mit deren Status ·   // Schema 2 (Build 6): auch ohne Fehler („0 Fehler“), dazu „mods“ = aktive Module
export const ERR_MAX_BODY = 64 * 1024;
export const ERR_MIN_GAP = 3600;      // höchstens 1 Bericht pro Kennung und Stunde
export const ERR_KEEP_DAYS = 90;
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const VER_RE = /^(\d{4})\.(\d{1,2})\.(\d{1,2})(?:\.(\d{1,2}))?(?:b(\d{1,3}))?$/;
const HA_RE = /^\d{4}\.\d{1,2}(?:\.\d{1,2})?(?:b\d{1,3}|\.dev\d{0,12})?$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
/** Build 6: Kurzzeichen der Module, die man an- und ausschalten kann → Name im Fehlerbericht und Anzeige. Modul 1 und der Kern sind immer an. */
export const ERR_MODS = { gr: ["Modul 0", "0 Grundriss"], ww: ["Modul 2", "2 Warmwasser"], en: ["Modul 3", "3 Energie"], gs: ["Modul 4", "4 Gerätestrom"],
  lu: ["Modul 5", "5 Lüftung"], rb: ["Modul 6", "6 Rollläden"], wp: ["Modul 7", "7 Wärmepumpe"], ev: ["Modul 8", "8 Wallbox"], wx: ["Modul 9", "9 Wetter"],
  ga: ["Modul 10", "10 Garten"], sf: ["Modul 11", "11 Sicherheit"], pl: ["Modul 12", "12 Pool & Sauna"], bt: ["Modul 13", "13 Batterie"], dt: ["Modul 14", "14 Stromtarif"],
  wa: ["Modul 15", "15 Wartung"], sp: ["Modul 16", "16 Prognose"], mu: ["Modul 17", "17 Müll"], li: ["Modul 18", "18 Licht"], ef: ["Modul 19", "19 Hausfluss"], ab: ["Modul 20", "20 Abrechnung"] };
export const ALWAYS_ON = { "Modul 1": "1 Räume & Heizen", Allgemein: "Allgemein", Statistik: "Statistik", "Weihnachts-Theme": "Weihnachts-Theme", Sponsor: "Sponsor" };
const SRC = { backend: "Backend", befehl: "Befehl", oberflaeche: "Oberfläche" };
const channelOf = (v) => (/b\d+$/.test(v || "") ? "beta" : "stable");
const clean = (s, max) => String(s).replace(/[\u0000-\u001f\u007f]/g, " ")
  .replace(/https?:\/\/\S+|\b[\w.+-]+@[\w-]+\.[\w.-]+\b|\b\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?\b/gi, "<adresse>").slice(0, max);

export function validErrors(d) {
  if (!d || typeof d !== "object" || Array.isArray(d) || !ERR_SCHEMAS.includes(d.schema)) return null;
  const { id, version, channel, ha, errors } = d;
  if (typeof id !== "string" || !ID_RE.test(id) || typeof version !== "string" || !VER_RE.test(version) || channel !== channelOf(version)) return null;
  if (ha != null && ha !== "" && (typeof ha !== "string" || !HA_RE.test(ha))) return null;
  if (!Array.isArray(errors) || errors.length < (d.schema >= 2 ? 0 : 1) || errors.length > 50) return null;
  let mods = null;   // null = Schema 1 (keine Tages-Meldung, keine Module)
  if (d.schema >= 2) {
    const m = d.mods ?? [];
    if (!Array.isArray(m) || m.length > Object.keys(ERR_MODS).length || m.some((x) => typeof x !== "string" || !(x in ERR_MODS))) return null;
    mods = Object.keys(ERR_MODS).filter((k) => m.includes(k)).join(",");
  }
  const out = [];
  for (const x of errors) {
    if (!x || typeof x !== "object") return null;
    const { fp, src, mod, kind, where, msg, n, first, last, vers } = x;
    if (typeof fp !== "string" || !/^[0-9a-f]{12}$/.test(fp) || !(src in SRC)) return null;
    if (typeof mod !== "string" || !/^[\wÄÖÜäöüß .&-]{1,30}$/.test(mod) || typeof kind !== "string" || !/^[\w.\- ]{1,60}$/.test(kind)) return null;
    if (typeof where !== "string" || where.length > 120 || typeof msg !== "string" || msg.length > 400) return null;
    if (!Number.isInteger(n) || n < 1 || n > 1e6 || !DAY_RE.test(first) || !DAY_RE.test(last) || first > last) return null;
    if (!Array.isArray(vers) || vers.length > 5 || vers.some((v) => typeof v !== "string" || !VER_RE.test(v))) return null;
    if (out.some((o) => o.fp === fp)) continue;   // doppelt im selben Bericht: einmal reicht
    out.push({ fp, src, mod, kind, where: clean(where, 120), msg: clean(msg, 200), n, first, last, vers });
  }
  let known = [];
  if (d.schema >= 3 && d.known != null) {
    if (!Array.isArray(d.known) || d.known.length > 200 || d.known.some((x) => typeof x !== "string" || !/^[0-9a-f]{12}$/.test(x))) return null;
    known = [...new Set(d.known)];
  }
  return { id, version, channel, ha: ha || "", errors: out, mods, known, schema: d.schema };
}

const S = (ms) => new Date(ms).toISOString().slice(0, 10);
const dayMs = 86400000;

export async function dbErrors(DB, p, nowMs) {
  const now = Math.floor(nowMs / 1000), day = S(nowMs);
  const row = await DB.prepare("SELECT last_ts FROM err_reporters WHERE rid=?").bind(p.id).first();
  if (row && now - row.last_ts < ERR_MIN_GAP) return "too_many";
  const st = [DB.prepare("INSERT INTO err_reporters(rid, last_ts, last_day) VALUES(?,?,?) ON CONFLICT(rid) DO UPDATE SET last_ts=excluded.last_ts, last_day=excluded.last_day").bind(p.id, now, day),
    /* Build 6: jeder Bericht zählt als „heute mit dieser Version aktiv“ – auch der leere */
    DB.prepare("INSERT INTO err_days(day, rid, version, channel, ha, mods) VALUES(?,?,?,?,?,?) ON CONFLICT(day, rid) DO UPDATE SET version=excluded.version, channel=excluded.channel, ha=excluded.ha, mods=COALESCE(excluded.mods, err_days.mods)")
      .bind(day, p.id, p.version, p.channel, p.ha, p.mods ?? null)];
  for (const x of p.errors) {
    st.push(DB.prepare(
      "INSERT INTO err_groups(fp, src, mod, kind, where_, msg, first_day, last_day) VALUES(?,?,?,?,?,?,?,?) " +
      "ON CONFLICT(fp) DO UPDATE SET last_day=MAX(err_groups.last_day, excluded.last_day), first_day=MIN(err_groups.first_day, excluded.first_day), where_=excluded.where_, msg=excluded.msg, mod=excluded.mod"
    ).bind(x.fp, x.src, x.mod, x.kind, x.where, x.msg, x.first < day ? x.first : day, day));
    st.push(DB.prepare(
      "INSERT INTO err_hits(day, fp, rid, version, channel, ha, n) VALUES(?,?,?,?,?,?,?) " +
      "ON CONFLICT(day, fp, rid) DO UPDATE SET n=err_hits.n+excluded.n, version=excluded.version, ha=excluded.ha"
    ).bind(day, x.fp, p.id, p.version, p.channel, p.ha, x.n));
  }
  await DB.batch(st);
  return "ok";
}
export const STATUS = { offen: "offen", arbeit: "in Arbeit", behoben: "behoben", ignoriert: "ignorieren" };
/** Build 4: Status setzen (nur aus dem Dashboard). fixed_in nur bei „behoben“, issue = Nummer auf GitHub (optional). */
export function validStatus(form) {
  const status = String(form.get("status") || ""), fixed = String(form.get("fixed_in") || "").trim(), issue = String(form.get("issue") || "").trim().replace(/^#/, "");
  if (!(status in STATUS)) return null;
  if (fixed && !VER_RE.test(fixed)) return null;
  if (issue && !/^\d{1,7}$/.test(issue)) return null;
  return { status, fixed_in: status === "behoben" && fixed ? fixed : null, issue: issue ? +issue : null };
}
export async function dbErrStatus(DB, fp, s, nowMs) {
  const r = await DB.prepare("UPDATE err_groups SET status=?, fixed_in=?, issue=COALESCE(?, issue), status_day=? WHERE fp=?").bind(s.status, s.fixed_in, s.issue, S(nowMs), fp).run();
  return !!(r && (r.changes ?? (r.meta && r.meta.changes)));
}
async function dbMergeCleanup(DB) {   /* Build 8: Verweise auf gelöschte Fehler entfernen (Tabelle fehlt vor der Migration → nichts tun) */
  try { await DB.prepare("DELETE FROM err_merge WHERE fp NOT IN (SELECT fp FROM err_groups) OR into_fp NOT IN (SELECT fp FROM err_groups)").run(); } catch { /* vor Build 8 */ }
}
export async function dbErrForget(DB, rid) {
  await DB.batch([DB.prepare("DELETE FROM err_hits WHERE rid=?").bind(rid), DB.prepare("DELETE FROM err_reporters WHERE rid=?").bind(rid), DB.prepare("DELETE FROM err_days WHERE rid=?").bind(rid),
    DB.prepare("DELETE FROM err_groups WHERE fp NOT IN (SELECT DISTINCT fp FROM err_hits)")]);
  await dbMergeCleanup(DB);
}
export async function dbErrCleanup(DB, todayMs) {
  const cut = S(todayMs - ERR_KEEP_DAYS * dayMs);
  await DB.batch([DB.prepare("DELETE FROM err_hits WHERE day<?").bind(cut), DB.prepare("DELETE FROM err_reporters WHERE last_day<?").bind(cut), DB.prepare("DELETE FROM err_days WHERE day<?").bind(cut),
    DB.prepare("DELETE FROM err_groups WHERE fp NOT IN (SELECT DISTINCT fp FROM err_hits)")]);
  await dbMergeCleanup(DB);
}

// ---------------------------------------------------------------- Build 8 · F5 Zusammenführen
/* „Fingerabdruck B gehört zu A“ steht in err_merge. Die Daten bleiben getrennt gespeichert; erst beim Auswerten laufen Zahlen,
   Verlauf und Status von B unter A. Trennen = Zeile löschen, dann ist B wieder ein eigener Fehler mit seinem alten Status. */
export async function loadMerges(DB) {
  try { return (await DB.prepare("SELECT fp, into_fp FROM err_merge").all()).results; } catch { return []; }   // vor der Migration: keine
}
export function mergeMap(merges) {
  const m = new Map((merges || []).map((x) => [x.fp, x.into_fp]));
  const root = (fp) => { let x = fp; for (let n = 0; m.has(x) && n < 20; n++) x = m.get(x); return x; };
  return { m, root };
}
export function applyMerges(groups, hits, merges) {
  const { m, root } = mergeMap(merges);
  if (!m.size) return { groups, hits };
  const by = new Map(groups.map((g) => [g.fp, g])), R = (fp) => { const r = root(fp); return r !== fp && by.has(r) ? r : fp; };
  const kids = new Map();
  for (const g of groups) { const r = R(g.fp); if (r !== g.fp) { if (!kids.has(r)) kids.set(r, []); kids.get(r).push(g); } }
  const out = groups.filter((g) => R(g.fp) === g.fp).map((g) => {
    const k = kids.get(g.fp);
    if (!k) return g;
    const all = [g, ...k];
    return { ...g, first_day: all.map((x) => x.first_day).sort()[0], last_day: all.map((x) => x.last_day).sort().pop(),
      merged: k.map((x) => ({ fp: x.fp, kind: x.kind, msg: x.msg, where: x.where, mod: x.mod })) };
  });
  return { groups: out, hits: hits.map((h) => (R(h.fp) !== h.fp ? { ...h, fp: R(h.fp) } : h)) };
}
const noLine = (w) => String(w || "").replace(/:\d+/g, "");
/** Vorschläge auf der Detailseite: gleiche Stelle (ohne Zeile), gleiche Art, gleiches Modul zuerst */
export function mergeCandidates(g, others, max = 25) {
  const score = (x) => (noLine(x.where) && noLine(x.where) === noLine(g.where) ? 4 : 0) + (x.kind === g.kind ? 2 : 0) + (x.mod === g.mod ? 1 : 0) + (x.src === g.src ? 0.5 : 0);
  return others.map((x) => ({ fp: x.fp, kind: x.kind, msg: x.msg, where: x.where, mod: x.mod, s: score(x), last: x.last_day }))
    .sort((a, b) => b.s - a.s || (a.last < b.last ? 1 : -1)).slice(0, max);
}
/** B (fp) in A (into) einordnen. Kein Zusammenführen mit sich selbst oder im Kreis. Ergebnis: Haupt-Fehler oder Grund. */
export async function dbErrMerge(DB, fp, into, nowMs) {
  if (!/^[0-9a-f]{12}$/.test(fp) || !/^[0-9a-f]{12}$/.test(into) || fp === into) return { err: "ungültig" };
  const ok = await DB.prepare("SELECT COUNT(*) n FROM err_groups WHERE fp IN (?,?)").bind(fp, into).first();
  if (!ok || ok.n !== 2) return { err: "unbekannt" };
  const { root } = mergeMap(await loadMerges(DB));
  const target = root(into);
  if (target === fp) return { err: "Kreis" };
  await DB.prepare("INSERT INTO err_merge(fp, into_fp, day) VALUES(?,?,?) ON CONFLICT(fp) DO UPDATE SET into_fp=excluded.into_fp, day=excluded.day").bind(fp, target, S(nowMs)).run();
  return { root: target };
}
export async function dbErrSplit(DB, fp) {
  if (!/^[0-9a-f]{12}$/.test(fp)) return false;
  const r = await DB.prepare("DELETE FROM err_merge WHERE fp=?").bind(fp).run();
  return !!(r && (r.changes ?? (r.meta && r.meta.changes)));
}

// ---------------------------------------------------------------- Auswertung
export const vkey = (v) => { const m = VER_RE.exec(v || "") || []; return [+m[1] || 0, +m[2] || 0, +m[3] || 0, +m[4] || 0, m[5] === undefined ? 1e9 : +m[5]]; };
export const vcmp = (a, b) => { const x = vkey(a), y = vkey(b); for (let i = 0; i < 5; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };

/** groups: Zeilen aus err_groups · hits: Zeilen aus err_hits · Ergebnis: Liste für das Dashboard (Fenster in Tagen) */
export function errCompute(groups, hits, todayStr, days = 7) {
  const today = Date.parse(todayStr + "T00:00:00Z"), from = S(today - (days - 1) * dayMs), d3 = S(today - 2 * dayMs), d6 = S(today - 5 * dayMs);
  const newest = [...new Set(hits.map((h) => h.version))].sort(vcmp).pop() || "";
  const repNewest = new Set(hits.filter((h) => h.version === newest).map((h) => h.rid)).size;
  const by = new Map();
  for (const h of hits) { if (!by.has(h.fp)) by.set(h.fp, []); by.get(h.fp).push(h); }
  const rows = [];
  for (const g of groups) {
    const all = by.get(g.fp) || [], win = all.filter((h) => h.day >= from);
    const inst = new Set(win.map((h) => h.rid)).size;
    const recent = new Set(all.filter((h) => h.day >= d3).map((h) => h.rid)).size, before = new Set(all.filter((h) => h.day >= d6 && h.day < d3).map((h) => h.rid)).size;
    const vers = [...new Set(all.map((h) => h.version))].sort(vcmp);
    const inNewest = all.some((h) => h.version === newest);
    let tag = "bekannt";
    if (g.first_day >= S(today - 6 * dayMs)) tag = "neu";
    else if (recent >= 2 && recent > before * 1.5) tag = "steigt";
    else if (!inNewest && repNewest >= 3) tag = "behoben?";
    else if (!win.length) tag = "ruhig";
    /* Build 4: dein Status geht vor. „behoben in X“ wird geprüft: Taucht der Fehler in X oder neuer wieder auf, wird er rot. */
    const back = g.status === "behoben" && g.fixed_in ? all.filter((h) => vcmp(h.version, g.fixed_in) >= 0) : [];
    if (g.status === "behoben") tag = back.length ? "wieder da" : "behoben";
    else if (g.status === "arbeit") tag = "in Arbeit";
    else if (g.status === "ignoriert") tag = "ignoriert";
    const spark = Array.from({ length: 14 }, (_, i) => { const d = S(today - (13 - i) * dayMs); return new Set(all.filter((h) => h.day === d).map((h) => h.rid)).size; });
    rows.push({ ...g, first_ver: vers[0] || "", back: new Set(back.map((h) => h.rid)).size, inst, hits: win.reduce((a, h) => a + h.n, 0), inst_all: new Set(all.map((h) => h.rid)).size, hits_all: all.reduce((a, h) => a + h.n, 0), vers, tag, spark, in_newest: inNewest });
  }
  const prio = (x) => (x.tag === "wieder da" ? 0 : x.tag === "ignoriert" || x.tag === "behoben" ? 2 : 1);
  rows.sort((a, b) => prio(a) - prio(b) || b.inst - a.inst || b.hits - a.hits || (a.last_day < b.last_day ? 1 : -1));
  /* Build 5: In welcher Version ist ein Fehler zuerst aufgetaucht? (ohne ignorierte) */
  const intro = new Map();
  for (const x of rows) if (x.first_ver && x.status !== "ignoriert") intro.set(x.first_ver, (intro.get(x.first_ver) || 0) + 1);
  return { rows, newest, reporters: new Set(hits.filter((h) => h.day >= from).map((h) => h.rid)).size, days, today: todayStr,
    intro: [...intro].sort((a, b) => vcmp(b[0], a[0])).slice(0, 5), week: errWeek(rows, todayStr) };
}
/** Build 5 · Wochenblick: neu, wieder da, behoben, lange in Arbeit (nur Anzeige, keine Benachrichtigung) */
export function errWeek(rows, todayStr) {
  const today = Date.parse(todayStr + "T00:00:00Z"), d7 = S(today - 6 * dayMs), d14 = S(today - 14 * dayMs);
  return {
    neu: rows.filter((x) => x.status !== "ignoriert" && x.status !== "behoben" && x.first_day >= d7).length,
    back: rows.filter((x) => x.tag === "wieder da" && x.last_day >= d7).length,
    fixed: rows.filter((x) => x.status === "behoben" && x.tag !== "wieder da" && (x.status_day || "") >= d7).length,
    stale: rows.filter((x) => x.status === "arbeit" && x.status_day && x.status_day <= d14).length,
  };
}
export function weekHtml(w) {
  if (!w) return "";
  const p = (n, t, bg, fg, href) => (n ? `<a class="tg wkp" href="${href}" style="background:${bg};color:${fg}">${n} ${t}</a>` : "");
  const items = p(w.neu, "neu", "#7f1d1d", "#fecaca", "/fehler?neu=1") + p(w.back, "wieder da", "#b91c1c", "#fff", "/fehler?alle=1") +
    p(w.fixed, "behoben", "#134e4a", "#5eead4", "/fehler?alle=1") + p(w.stale, "in Arbeit seit über 14 Tagen", "#1e3a8a", "#bfdbfe", "/fehler?alle=1");
  const rf = w.reife ? (() => { const x = AMP[w.reife.amp] || AMP.abwarten; return `<a class="tg wkp" href="/version/${encodeURIComponent(w.reife.v)}" style="margin-left:auto;background:${x[1]};color:${x[2]}">${channelOf(w.reife.v) === "beta" ? "Beta" : "Stabil"} ${e(vshort(w.reife.v))} · ${e(x[0])}</a>`; })() : "";
  return `<div class="c wk"><b>Diese Woche</b>${items || '<span class="u" style="margin:0">keine neuen Fehler, nichts wieder aufgetaucht</span>'}${rf}</div>`;
}
/** Build 5 · Release-Marken: erster Tag je Version (aus Versions-Statistik und Fehlerberichten) */
export async function loadReleases(DB) {
  const a = (await DB.prepare("SELECT version v, MIN(day) d FROM daily GROUP BY version").all()).results;
  const b = (await DB.prepare("SELECT version v, MIN(day) d FROM err_hits GROUP BY version").all()).results;
  const m = new Map();
  for (const x of [...a, ...b]) if (VER_RE.test(x.v) && (!m.has(x.v) || x.d < m.get(x.v))) m.set(x.v, x.d);
  return [...m].map(([v, d]) => ({ v, d }));
}
/** Marken im Zeitraum: stabile Versionen immer, dazu die neuesten Betas – höchstens max Stück */
export function releaseMarks(rel, fromStr, toStr, max = 8) {
  const inR = (rel || []).filter((x) => x.d >= fromStr && x.d <= toStr);
  const st = inR.filter((x) => channelOf(x.v) === "stable"), be = inR.filter((x) => channelOf(x.v) === "beta").sort((a, b) => vcmp(b.v, a.v));
  return [...st.slice(-max), ...be.slice(0, Math.max(0, max - st.length))].sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : vcmp(a.v, b.v))).slice(-max);
}
export const vshort = (v) => String(v || "").replace(/^\d{4}\./, "");
/** Senkrechte Release-Linien; xOf(Tag) → x oder null. Beschriftung nur, wenn Platz ist. */
export function markSvg(marks, xOf, yTop, yBot, labelY, W = 600) {
  let s = "", last = -1e9;
  for (const m of marks) {
    const x = xOf(m.d); if (x == null) continue;
    s += `<line x1="${x}" x2="${x}" y1="${yTop}" y2="${yBot}" stroke="#d95926" stroke-width="1" stroke-dasharray="3 3"><title>${e(m.v)} · ab ${e(m.d)}</title></line>`;
    if (x - last >= 34) { const end = x > W - 40; s += `<text x="${end ? x - 2 : x + 2}" y="${labelY}" fill="#f5a37b" font-size="9"${end ? ' text-anchor="end"' : ""}>${e(vshort(m.v))}</text>`; last = x; }
  }
  return s;
}
/** Build 5 · Nachzügler: aktive Installationen auf einer Version, in der ein schon behobener Fehler steckt */
export function laggards(rows, versions) {
  const vc = new Map(versions || []), hit = new Set(), list = [];
  for (const x of rows) {
    if (x.status !== "behoben" || !x.fixed_in || !x.first_ver) continue;
    const aff = [...vc.keys()].filter((v) => vcmp(v, x.first_ver) >= 0 && vcmp(v, x.fixed_in) < 0);
    const n = aff.reduce((a, v) => a + vc.get(v), 0);
    if (!n) continue;
    aff.forEach((v) => hit.add(v));
    list.push({ fp: x.fp, mod: x.mod, kind: x.kind, msg: x.msg, fixed_in: x.fixed_in, n, vers: aff.sort(vcmp) });
  }
  list.sort((a, b) => b.n - a.n);
  return { total: [...hit].reduce((a, v) => a + vc.get(v), 0), list: list.slice(0, 6), any: rows.some((x) => x.status === "behoben" && x.fixed_in) };
}
export function lagHtml(L) {
  const body = L.list.length ? `<table class="mini">${L.list.map((x) => `<tr><td><a href="/fehler/${x.fp}" class="lga"><b>${e(x.kind)}:</b> ${e(String(x.msg || "–").slice(0, 70))}</a><small style="display:block;color:#8d8c84">${e(x.mod)} · behoben in ${e(x.fixed_in)}${channelOf(x.fixed_in) === "beta" ? " (bisher nur Beta)" : ""} · betroffen: ${e(x.vers.map(vshort).join(", "))}</small></td><td class="num">${x.n} Inst.</td></tr>`).join("")}</table>`
    : `<div class="empty">${L.any ? "Keine – die behobenen Fehler stecken in keiner Version mehr, die noch genutzt wird." : "Noch kein Fehler als „behoben in …“ markiert."}</div>`;
  return `<div class="c"><h2>Nachzügler mit bekanntem Fehler</h2><div class="u">${L.total ? `${L.total} aktive Installationen laufen auf einer Version mit schon behobenem Fehler` : "Aktive Installationen (30 Tage) auf einer Version vor dem Fix"}</div>${body}</div>`;
}
export function errDetail(g, hits, todayStr, rel = []) {
  const today = Date.parse(todayStr + "T00:00:00Z"), cnt = (key) => { const m = new Map(); for (const h of hits) { const k = h[key] || "?"; const o = m.get(k) || { inst: new Set(), n: 0 }; o.inst.add(h.rid); o.n += h.n; m.set(k, o); } return [...m].map(([k, o]) => ({ k, inst: o.inst.size, n: o.n })); };
  const days = Array.from({ length: 30 }, (_, i) => { const d = S(today - (29 - i) * dayMs); const hs = hits.filter((h) => h.day === d); return { d, inst: new Set(hs.map((h) => h.rid)).size, n: hs.reduce((a, h) => a + h.n, 0) }; });
  return { rel: releaseMarks(rel, days[0].d, todayStr), g, inst: new Set(hits.map((h) => h.rid)).size, hits: hits.reduce((a, h) => a + h.n, 0), vers: cnt("version").sort((a, b) => vcmp(b.k, a.k)), ha: cnt("ha").sort((a, b) => b.inst - a.inst), ch: cnt("channel"), days };
}
export async function errLoad(DB, todayStr, days) {
  const M = applyMerges((await DB.prepare("SELECT fp, src, mod, kind, where_ AS \"where\", msg, first_day, last_day, status, fixed_in, issue, status_day FROM err_groups").all()).results,
    (await DB.prepare("SELECT day, fp, rid, version, channel, ha, n FROM err_hits").all()).results, await loadMerges(DB));   /* Build 8 */
  const groups = M.groups, hits = M.hits;
  const r = errCompute(groups, hits, todayStr, days), dd = await loadDays(DB, todayStr);
  r.reife = releaseReady(r.rows, hits, dd, await loadReleases(DB), todayStr);   /* Build 6 */
  r.mods = modErrors(r.rows, hits, dd, todayStr);
  r.ham = haMatrix(r.rows, hits, dd, todayStr);   /* Build 9 */
  r.week.reife = r.reife.top ? { v: r.reife.top.v, amp: r.reife.top.amp } : null;
  return r;
}
export async function errLoadOne(DB, fp, todayStr, rel = null) {
  const merges = await loadMerges(DB), { root } = mergeMap(merges);
  const groups = (await DB.prepare("SELECT fp, src, mod, kind, where_ AS \"where\", msg, first_day, last_day, status, fixed_in, issue, status_day FROM err_groups").all()).results, by = new Map(groups.map((g) => [g.fp, g]));
  if (!by.has(fp)) return null;
  if (root(fp) !== fp && by.has(root(fp))) return { redirect: root(fp) };   /* Build 8: zusammengeführt → zum Haupt-Fehler */
  const fam = groups.filter((g) => g.fp === fp || (root(g.fp) === fp && g.fp !== fp)).map((g) => g.fp);
  const raw = (await DB.prepare(`SELECT day, fp, rid, version, channel, ha, n FROM err_hits WHERE fp IN (${fam.map(() => "?").join(",")})`).bind(...fam).all()).results;
  const M = applyMerges(groups.filter((g) => fam.includes(g.fp)), raw, merges), g = M.groups.find((x) => x.fp === fp);
  const D = errDetail(g, M.hits, todayStr, rel || (await loadReleases(DB)));
  D.cand = mergeCandidates(g, groups.filter((x) => root(x.fp) === x.fp || !by.has(root(x.fp))).filter((x) => !fam.includes(x.fp)));
  return D;
}

// ---------------------------------------------------------------- Darstellung
const e = (x) => String(x ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" }[c]));
const TAG = { "wieder da": ["wieder da", "#b91c1c", "#fff"], "in Arbeit": ["in Arbeit", "#1e3a8a", "#bfdbfe"], behoben: ["behoben", "#134e4a", "#5eead4"], ignoriert: ["ignoriert", "#262624", "#8d8c84"], neu: ["neu", "#7f1d1d", "#fecaca"], steigt: ["steigt", "#78350f", "#fde68a"], bekannt: ["bekannt", "#334155", "#cbd5e1"], "behoben?": ["behoben?", "#134e4a", "#5eead4"], ruhig: ["ruhig", "#262624", "#8d8c84"] };
export const ERR_CSS = `.tabs{display:flex;gap:6px;margin:10px 0}.tabs a{color:#c3c2b7;text-decoration:none;border:1px solid #3a3a38;border-radius:99px;padding:5px 14px;font-weight:600}.tabs a.on{border-color:#2dd4bf;color:#5eead4}
.flt{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}.flt a{color:#c3c2b7;text-decoration:none;border:1px solid #3a3a38;border-radius:99px;padding:3px 11px;font-size:.8rem}.flt a.on{border-color:#2dd4bf;color:#5eead4}
.et{width:100%;border-collapse:collapse;font-size:.86rem}.et th{color:#5eead4;text-align:left;font-weight:600;padding:6px 8px;border-bottom:1px solid #3a3a38}.et td{padding:8px;border-bottom:1px solid #262624;vertical-align:top}.et td:nth-child(3){white-space:nowrap}
.et a{color:#f0efec;text-decoration:none}.et a:hover b{text-decoration:underline}.et small{color:#8d8c84;display:block;font-family:ui-monospace,Menlo,monospace;font-size:.74rem;margin-top:2px}
.tg{border-radius:99px;padding:1px 8px;font-size:.72rem;font-weight:700;white-space:nowrap}.num{text-align:right;font-variant-numeric:tabular-nums}.m{font-family:ui-monospace,Menlo,monospace;word-break:break-word}
.kv{display:grid;grid-template-columns:160px 1fr;gap:6px 12px;font-size:.88rem}.kv span{color:#8d8c84}.mini{border-collapse:collapse;font-size:.84rem;width:100%}.mini td{padding:4px 6px;border-bottom:1px solid #262624}
.rb{display:inline-flex;align-items:center;gap:5px;border:1px solid #3a3a38;border-radius:99px;padding:3px 11px;font-size:.82rem;cursor:pointer}.rb input{accent-color:#2dd4bf;margin:0}
.sfr{display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:.84rem;color:#c3c2b7}.sfr input{background:#111110;color:#f0efec;border:1px solid #3a3a38;border-radius:8px;padding:5px 8px;font:inherit}
.sfr button{background:#2dd4bf;color:#042f2e;border:0;border-radius:99px;padding:6px 16px;font-weight:700;cursor:pointer}.warnb{background:#450a0a;color:#fecaca;border-radius:10px;padding:8px 12px;margin:6px 0 10px;font-size:.86rem}
.rkk{grid-template-columns:repeat(auto-fit,minmax(160px,1fr));margin:6px 0 12px}.rk{padding:10px 12px}.rk .n{font-size:1.5rem}
.sfr select{background:#111110;color:#f0efec;border:1px solid #3a3a38;border-radius:8px;padding:5px 8px;font:inherit}.btnl{background:none;border:1px solid #3a3a38;color:#c3c2b7;border-radius:99px;padding:3px 11px;cursor:pointer;font:inherit;font-size:.8rem}
.hm td{padding:4px 6px}.hmc{display:inline-block;min-width:46px;text-align:center;border-radius:6px;padding:2px 6px;font-weight:700}.vb{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.lga{color:#f0efec;text-decoration:none;font-size:.84rem;word-break:break-word}.lga:hover{text-decoration:underline}.wk{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 16px;margin:0 0 10px}.wkp{text-decoration:none}
@media(max-width:700px){.et .hide{display:none}.kv{grid-template-columns:1fr}}`;
const spark = (a, w = 84, h = 18) => { const mx = Math.max(1, ...a); return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${a.map((v, i) => `<rect x="${(i * w) / a.length + 0.5}" y="${h - (v / mx) * (h - 2) - 1}" width="${w / a.length - 1.5}" height="${(v / mx) * (h - 2) + 1}" rx="1" fill="${v ? "#f87171" : "#3a3a38"}"/>`).join("")}</svg>`; };
const tag = (t) => { const x = TAG[t] || TAG.bekannt; return `<span class="tg" style="background:${x[1]};color:${x[2]}">${x[0]}</span>`; };
export const tabs = (on) => `<div class="tabs"><a href="/" class="${on === "v" ? "on" : ""}">Versionen</a><a href="/fehler" class="${on === "f" ? "on" : ""}">Fehler</a></div>`;
const fd = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.` : "");

export function errRender(r, q = {}) {
  const mods = [...new Set(r.rows.map((x) => x.mod))].sort();
  const ln = (k, v, t, on) => { const p = new URLSearchParams({ ...q, [k]: v }); if (!v) p.delete(k); return `<a href="/fehler?${p}" class="${on ? "on" : ""}">${e(t)}</a>`; };
  let rows = r.rows.filter((x) => (!q.mod || x.mod === q.mod) && (!q.src || x.src === q.src) && (q.alle || x.inst > 0 || x.tag === "neu" || x.tag === "wieder da") && (q.ign || x.tag !== "ignoriert"));
  if (q.neu) rows = rows.filter((x) => ["neu", "steigt", "wieder da"].includes(x.tag));
  if (q.ver) rows = r.rows.filter((x) => x.first_ver === q.ver && (!q.mod || x.mod === q.mod) && (!q.src || x.src === q.src) && (q.ign || x.tag !== "ignoriert"));   /* Build 5: neu in dieser Version, unabhängig vom Zeitraum */
  const body = rows.length ? `<table class="et"><tr><th></th><th>Fehler</th><th>Modul</th><th class="num">Installationen</th><th class="num hide">Anzahl</th><th class="hide">Versionen</th><th class="hide">14 Tage</th><th>zuletzt</th></tr>
    ${rows.map((x) => `<tr><td>${tag(x.tag)}${x.status === "behoben" && x.fixed_in ? `<small>${e(x.fixed_in)}</small>` : ""}${x.issue ? `<small>#${x.issue}</small>` : ""}</td><td><a href="/fehler/${x.fp}"><b class="m">${e(x.kind)}: ${e(x.msg || "–")}</b></a><small>${e(SRC[x.src])}${x.where ? " · " + e(x.where) : ""}${x.first_ver ? ` · seit ${e(vshort(x.first_ver))}` : ""}${x.merged && x.merged.length ? ` · +${x.merged.length} zusammengeführt` : ""}</small></td><td>${e(x.mod)}</td><td class="num">${x.inst}</td><td class="num hide">${x.hits}</td><td class="hide">${e(x.vers.slice(-2).join(" · "))}</td><td class="hide">${spark(x.spark)}</td><td>${fd(x.last_day)}</td></tr>`).join("")}</table>`
    : '<div class="empty">Keine Fehler in diesem Zeitraum – oder noch keine Berichte.</div>';
  return `${!q.ver && r.reife ? `<div id="reife">${reifeHtml(r.reife)}</div>` : ""}<div class="c"><div style="display:flex;justify-content:space-between;gap:8px"><h2>Fehler · letzte ${r.days} Tage</h2><a class="csv" href="/export/fehler.csv">CSV · 30 Tage</a></div><div class="u">${r.reporters} Installationen haben berichtet · neueste Version ${e(r.newest || "–")} · gleicher Fehler = eine Zeile</div>
    <div class="flt">${ln("tage", "", "7 Tage", r.days === 7)}${ln("tage", "30", "30 Tage", r.days === 30)}${ln("tage", "90", "90 Tage", r.days === 90)}<span style="width:8px"></span>${ln("neu", q.neu ? "" : "1", "nur neu / steigt", !!q.neu)}${ln("alle", q.alle ? "" : "1", "auch ruhige", !!q.alle)}${ln("ign", q.ign ? "" : "1", "auch ignorierte", !!q.ign)}</div>
    <div class="flt">${ln("mod", "", "alle Module", !q.mod)}${mods.map((m) => ln("mod", m, m, q.mod === m)).join("")}<span style="width:8px"></span>${ln("src", "", "alle Quellen", !q.src)}${Object.entries(SRC).map(([k, t]) => ln("src", k, t, q.src === k)).join("")}</div>
    ${(r.intro || []).length ? `<div class="flt"><span class="u" style="margin:4px 4px 0 2px">Neu in Version:</span>${ln("ver", "", "alle", !q.ver)}${r.intro.map(([v, n]) => ln("ver", v, `${vshort(v)} · ${n}`, q.ver === v)).join("")}</div>` : ""}
    ${body}</div>${!q.ver && r.mods ? `<div class="g">${modErrHtml(r.mods)}${r.ham ? haMatrixHtml(r.ham) : ""}</div>` : ""}`;
}
export function issueUrl(D, repo = "Maddog3010/ha-fenster-heizung") {
  const g = D.g, src = SRC[g.src];
  const title = `[${g.mod}] ${g.kind}: ${g.msg || ""}`.slice(0, 120);
  const body = [`**${g.mod} · ${src}**`, "", "```", `${g.kind}: ${g.msg || "–"}`, g.where ? `Stelle: ${g.where}` : "", "```", "",
    `- Fehler-ID: \`${g.fp}\``, `- Zuerst ${g.first_day}, zuletzt ${g.last_day}`, `- Betroffen: ${D.inst} Installationen, ${D.hits}× (letzte 90 Tage)`,
    `- Versionen: ${D.vers.map((x) => `${x.k} (${x.inst})`).join(", ")}`, `- Home Assistant: ${D.ha.map((x) => `${x.k} (${x.inst})`).join(", ")}`, "", "_Aus der Fehler-Statistik (anonyme, bereinigte Fehlerberichte)._"].filter((x, i, a) => x !== "" || a[i - 1] !== "").join("\n");
  return `https://github.com/${repo}/issues/new?${new URLSearchParams({ title, body })}`;
}
function mergeHtml(D) {
  const g = D.g, kids = g.merged || [], c = D.cand || [];
  const one = (x) => `${e(x.kind)}: ${e(String(x.msg || "–").slice(0, 60))}${x.where ? ` · ${e(x.where)}` : ""}`;
  const list = kids.length ? `<div class="u" style="margin:12px 0 4px">Zusammengeführt – Zahlen, Verlauf und Status laufen hier:</div><table class="mini">${kids.map((x) => `<tr><td class="m" style="font-size:.78rem">${one(x)}<small style="display:block;color:#8d8c84">${e(x.mod)} · ${e(x.fp)}</small></td><td style="text-align:right"><form method="post" action="/fehler/${g.fp}" style="margin:0"><input type="hidden" name="act" value="split"><input type="hidden" name="fp" value="${e(x.fp)}"><button type="submit" class="btnl">Trennen</button></form></td></tr>`).join("")}</table>` : "";
  const sel = c.length ? `<form method="post" action="/fehler/${g.fp}" class="sfr" style="margin-top:12px"><input type="hidden" name="act" value="merge"><label style="flex:1;min-width:220px">Mit … zusammenführen <select name="into" required style="width:100%;margin-top:4px"><option value="">Fehler wählen</option>${c.map((x) => `<option value="${e(x.fp)}">${x.s >= 4 ? "★ " : ""}${e(x.mod)} · ${one(x)}</option>`).join("")}</select></label><button type="submit">Zusammenführen</button></form>
    <div class="u" style="margin-top:4px">Dieser Fehler wird Teil des gewählten. ★ = gleiche Stelle im Code. Trennen geht jederzeit auf der Seite des anderen Fehlers.</div>` : "";
  return list + sel;
}
export function errRenderOne(D, repo) {
  const g = D.g, mx = Math.max(1, ...D.days.map((x) => x.inst));
  const vs = D.vers.map((x) => x.k), back = g.status === "behoben" && g.fixed_in ? D.vers.filter((x) => vcmp(x.k, g.fixed_in) >= 0) : [];
  const st = `<div class="c"><h2>Status</h2><div class="u">${g.status_day ? `geändert am ${e(g.status_day)}` : "noch nicht bearbeitet"}${g.status === "behoben" && g.fixed_in ? ` · behoben in ${e(g.fixed_in)}` : ""} · Betroffene sehen „offen“, „in Arbeit“ oder „behoben in …“ in ihrem Fehlerprotokoll (ab 2026.11.5b2), „ignorieren“ nicht</div>
    ${back.length ? `<div class="warnb">Wieder da: ${back.map((x) => `${e(x.k)} (${x.inst} Inst.)`).join(", ")} – obwohl als behoben in ${e(g.fixed_in)} markiert.</div>` : ""}
    <form method="post" action="/fehler/${g.fp}" class="sf"><div class="flt">${Object.entries(STATUS).map(([k, t]) => `<label class="rb"><input type="radio" name="status" value="${k}"${(g.status || "offen") === k ? " checked" : ""}><span>${e(t)}</span></label>`).join("")}</div>
    <div class="sfr"><label>behoben in Version <input name="fixed_in" list="vl" value="${e(g.fixed_in || "")}" placeholder="z. B. 2026.11.4.2" pattern="\\d{4}\\.\\d{1,2}\\.\\d{1,2}(\\.\\d{1,2})?(b\\d{1,3})?"></label><datalist id="vl">${vs.map((v) => `<option value="${e(v)}">`).join("")}</datalist>
    <label>GitHub-Issue # <input name="issue" value="${g.issue || ""}" inputmode="numeric" size="6"></label><button type="submit">Speichern</button></div></form>
    ${mergeHtml(D)}
    <div class="flt" style="margin-top:10px"><a href="${e(issueUrl(D, repo))}" target="_blank" rel="noopener">GitHub-Issue anlegen (vorausgefüllt)</a>${g.issue ? `<a href="https://github.com/${e(repo || "Maddog3010/ha-fenster-heizung")}/issues/${g.issue}" target="_blank" rel="noopener">Issue #${g.issue} öffnen</a>` : ""}</div></div>`;
  const xOf = (d) => { const i = D.days.findIndex((x) => x.d === d); return i < 0 ? null : i * 20 + 1; };
  const chart = `<svg viewBox="0 -14 600 104">${markSvg(D.rel || [], xOf, -4, 80, -6)}${D.days.map((x, i) => `<rect x="${i * 20 + 2}" y="${80 - (x.inst / mx) * 70}" width="16" height="${(x.inst / mx) * 70 + 1}" rx="2" fill="${x.inst ? "#f87171" : "#3a3a38"}"><title>${fd(x.d)} · ${x.inst} Installationen · ${x.n}×</title></rect>`).join("")}<text x="2" y="89" fill="#8d8c84" font-size="9">${fd(D.days[0].d)}</text><text x="598" y="89" fill="#8d8c84" font-size="9" text-anchor="end">heute</text></svg>`;
  const mini = (rows, t) => `<table class="mini">${rows.map((x) => `<tr><td>${e(t ? t(x.k) : x.k)}</td><td class="num">${x.inst} Inst.</td><td class="num">${x.n}×</td></tr>`).join("")}</table>`;
  return `<div class="c"><div class="flt"><a href="/fehler">← alle Fehler</a></div><h2 class="m">${e(g.kind)}: ${e(g.msg || "–")}</h2><div class="u">Fehler-ID ${e(g.fp)}</div>
    <div class="kv"><span>Modul · Quelle</span><b>${e(g.mod)} · ${e(SRC[g.src])}</b><span>Stelle</span><b class="m">${e(g.where || "–")}</b><span>Zuerst · zuletzt</span><b>${e(g.first_day)} · ${e(g.last_day)}</b>
    <span>Betroffen</span><b>${D.inst} Installationen · ${D.hits}× (letzte ${ERR_KEEP_DAYS} Tage)</b><span>Kanal</span><b>${D.ch.map((x) => `${x.k === "beta" ? "Beta" : "Stabil"} ${x.inst}`).join(" · ")}</b></div></div>
    ${st}<div class="g"><div class="c"><h2>Verlauf</h2><div class="u">Installationen pro Tag, 30 Tage${(D.rel || []).length ? " · orange: neue Version erschienen" : ""}</div>${chart}</div>
    <div class="c"><h2>Versionen</h2><div class="u">Strom &amp; Wärme</div>${mini(D.vers)}</div><div class="c"><h2>Home Assistant</h2><div class="u">Version</div>${mini(D.ha)}</div></div>`;
}

// ---------------------------------------------------------------- Build 6 · F1 Release-Reife je Version
/** Schwellen der Ampel (Konzept: mindestens 3 Tage live und 5 Installationen) */
export const REIFE = { minDays: 3, minInst: 5, window: 30 };
const AMP = { bereit: ["bereit", "#134e4a", "#5eead4"], gut: ["gut", "#134e4a", "#5eead4"], abwarten: ["abwarten", "#78350f", "#fde68a"],
  "nicht freigeben": ["nicht freigeben", "#7f1d1d", "#fecaca"], "Hotfix prüfen": ["Hotfix prüfen", "#7f1d1d", "#fecaca"],
  "Update empfehlen": ["Update empfehlen", "#7c2d12", "#fdba74"], abgelöst: ["abgelöst", "#262624", "#8d8c84"], älter: ["älter", "#262624", "#8d8c84"] };
const dOf = (s) => Date.parse(s + "T00:00:00Z");

/**
 * rows: errCompute().rows · hits: err_hits · days: err_days (Tages-Meldungen) · rel: erster Tag je Version.
 * Installationen einer Version = Tages-Meldungen ∪ Fehlerberichte (letzte 30 Tage). Eine Quote gibt es erst,
 * wenn die Version Tages-Meldungen schickt (ab Build 6) – vorher würden nur Installationen mit Fehlern zählen.
 */
export function releaseReady(rows, hits, days, rel, todayStr, o = REIFE) {
  const today = dOf(todayStr), from = S(today - (o.window - 1) * dayMs);
  const ign = new Set(rows.filter((x) => x.status === "ignoriert").map((x) => x.fp));
  const H = hits.filter((h) => h.day >= from && !ign.has(h.fp)), Dd = (days || []).filter((d) => d.day >= from);
  const vers = [...new Set([...Dd.map((d) => d.version), ...H.map((h) => h.version)])].filter((v) => VER_RE.test(v)).sort(vcmp);
  const relDay = new Map((rel || []).map((x) => [x.v, x.d]));
  const list = vers.map((v) => {
    const daily = new Set(Dd.filter((d) => d.version === v && d.mods != null).map((d) => d.rid));
    const err = new Set(H.filter((h) => h.version === v).map((h) => h.rid));
    const inst = new Set([...daily, ...err]).size, counted = daily.size > 0;
    const intro = rows.filter((x) => x.first_ver === v && x.status !== "ignoriert");
    const back = rows.filter((x) => x.status === "behoben" && x.fixed_in && vcmp(v, x.fixed_in) >= 0 && H.some((h) => h.fp === x.fp && h.version === v)).length;
    const d0 = relDay.get(v) || [...Dd, ...H].filter((x) => x.version === v).map((x) => x.day).sort()[0];
    const live = d0 ? Math.max(0, Math.round((today - dOf(d0)) / dayMs)) : 0;
    const lastNew = intro.map((x) => x.first_day).sort().pop();
    /* Build 9 · S2: fehlerfreie Tage = Nutzungstage ohne Fehler ÷ Nutzungstage (ein Tag = Tag + Kennung) */
    const use = new Set([...Dd.filter((d) => d.version === v && d.mods != null).map((d) => d.day + "|" + d.rid), ...H.filter((h) => h.version === v).map((h) => h.day + "|" + h.rid)]);
    const bad = new Set(H.filter((h) => h.version === v).map((h) => h.day + "|" + h.rid));
    return { v, ch: channelOf(v), inst, err: err.size, counted, quote: counted && inst ? err.size / inst : null,
      useDays: counted ? use.size : 0, errDays: bad.size, clean: counted && use.size ? 1 - bad.size / use.size : null,
      neu: intro.filter((x) => x.status !== "behoben").length, newOpen: intro.filter((x) => (x.status || "offen") === "offen").length,
      newWork: intro.filter((x) => x.status === "arbeit").length, back, live, quiet: lastNew ? Math.max(0, Math.round((today - dOf(lastNew)) / dayMs)) : live };
  });
  const stables = list.filter((x) => x.ch === "stable" && x.counted), newestStable = list.filter((x) => x.ch === "stable").pop() || null;
  const pct = (q) => `${Math.round(q * 100)} %`, pc1 = (q) => `${(Math.round(q * 1000) / 10).toFixed(1).replace(".", ",")} %`;
  for (const x of list) {
    const newer = list.some((y) => vcmp(y.v, x.v) > 0 && (x.ch === "beta" || y.ch === "stable"));
    const ref = [...stables].reverse().find((y) => vcmp(y.v, x.v) < 0) || null;
    x.ref = ref ? ref.v : "";
    const problem = x.newOpen || x.back;
    if (newer) {
      if (x.ch === "beta") [x.amp, x.why] = ["abgelöst", "es gibt eine neuere Version"];
      else if (problem || (x.quote != null && newestStable && newestStable.quote != null && x.quote > newestStable.quote))
        [x.amp, x.why] = ["Update empfehlen", `${newestStable.v} ist besser`];
      else [x.amp, x.why] = ["älter", `neuere stabile Version: ${newestStable.v}`];
    } else if (problem) [x.amp, x.why] = [x.ch === "beta" ? "nicht freigeben" : "Hotfix prüfen", x.back ? `${x.back} behobener Fehler wieder da` : `${x.newOpen} neuer offener Fehler`];
    else if (!x.counted) [x.amp, x.why] = ["abwarten", "noch keine Tages-Meldungen (ab Build 6)"];
    else if (x.live < o.minDays) [x.amp, x.why] = ["abwarten", `erst ${x.live} ${x.live === 1 ? "Tag" : "Tage"} live, mindestens ${o.minDays}`];
    else if (x.inst < o.minInst) [x.amp, x.why] = ["abwarten", `erst ${x.inst} Installationen, mindestens ${o.minInst}`];
    else if (x.newWork) [x.amp, x.why] = ["abwarten", `${x.newWork} neuer Fehler in Arbeit`];
    else if (ref && ref.quote != null && x.quote > ref.quote) [x.amp, x.why] = ["abwarten", `Quote ${pct(x.quote)} höher als ${vshort(ref.v)} (${pct(ref.quote)})`];
    else if (ref && ref.clean != null && x.clean != null && x.clean < ref.clean - 0.005) [x.amp, x.why] = ["abwarten", `fehlerfreie Tage ${pc1(x.clean)} schlechter als ${vshort(ref.v)} (${pc1(ref.clean)})`];
    else [x.amp, x.why] = [x.ch === "beta" ? "bereit" : "gut", ref ? `Quote nicht höher als ${vshort(ref.v)}` : "keine neuen Fehler"];
  }
  const desc = [...list].reverse(), betas = desc.filter((x) => x.ch === "beta");
  const top = betas[0] && betas[0].amp !== "abgelöst" ? betas[0] : desc[0] || null;
  return { list: desc, hero: [betas[0], betas[1], desc.find((x) => x.ch === "stable")].filter(Boolean), top, o };
}
const amp = (a) => { const x = AMP[a] || AMP.abwarten; return `<span class="tg" style="background:${x[1]};color:${x[2]}">${e(x[0])}</span>`; };
const pq = (x) => (x.quote == null ? "–" : `${Math.round(x.quote * 100)} %`);
export const pc1 = (q) => `${(Math.round(q * 1000) / 10).toFixed(1).replace(".", ",")} %`;
const pcl = (x) => (x.clean == null ? "–" : pc1(x.clean));
export function reifeHtml(R) {
  if (!R || !R.list.length) return `<div class="c"><h2>Release-Reife</h2><div class="empty">Noch keine Berichte in den letzten ${REIFE.window} Tagen.</div></div>`;
  const tile = (x, t) => `<div class="c rk"><div class="t"><a class="lga" href="/version/${encodeURIComponent(x.v)}">${e(t)} ${e(vshort(x.v))}</a></div><div class="n">${pq(x)}</div><div class="s">${x.counted ? `${x.err} von ${x.inst} Installationen mit Fehler · ${pcl(x)} fehlerfreie Tage` : `${x.err} mit Fehler · Quote ab Tages-Meldungen`}</div><div style="margin-top:6px">${amp(x.amp)}</div></div>`;
  const heroes = R.hero.map((x, i) => tile(x, x.ch === "stable" ? "Stabil" : i === 0 ? "Beta" : "vorher")).join("");
  const rows = R.list.slice(0, 8).map((x) => `<tr><td><a href="/version/${encodeURIComponent(x.v)}" class="lga"><b>${e(x.v)}</b></a></td><td>${x.ch === "beta" ? "Beta" : "Stabil"}</td><td class="num">${x.inst}</td><td class="num">${x.err}</td><td class="num">${pq(x)}</td><td class="num hide">${pcl(x)}</td><td class="num">${x.neu ? `<a class="lga" href="/fehler?ver=${encodeURIComponent(x.v)}">${x.neu}</a>` : 0}</td><td class="num hide">${x.live}</td><td class="num hide">${x.quiet}</td><td>${amp(x.amp)}<small style="display:block;color:#8d8c84;font-family:inherit">${e(x.why)}</small></td></tr>`).join("");
  return `<div class="c"><div style="display:flex;justify-content:space-between;gap:8px"><h2>Release-Reife</h2><a class="csv" href="/export/reife.csv">CSV</a></div><div class="u">Installationen mit Fehler-Zustimmung · letzte ${R.o.window} Tage · Ampel: mindestens ${R.o.minDays} Tage live, ${R.o.minInst} Installationen, keine neuen offenen Fehler, Quote nicht höher als die letzte stabile Version</div>
    <div class="k rkk">${heroes}</div>
    <table class="et"><tr><th>Version</th><th>Kanal</th><th class="num">Installationen</th><th class="num">mit Fehler</th><th class="num">Quote</th><th class="num hide">fehlerfreie Tage</th><th class="num">neue Fehler</th><th class="num hide">Tage live</th><th class="num hide">ohne neuen Fehler</th><th>Ampel</th></tr>${rows}</table></div>`;
}

// ---------------------------------------------------------------- Build 6 · F4 Fehler je Modul
/** Betroffene Installationen ÷ Installationen mit Modul an (letzte 30 Tage, nur Tages-Meldungen mit Modulliste). */
export function modErrors(rows, hits, days, todayStr, window = 30) {
  const from = S(dOf(todayStr) - (window - 1) * dayMs);
  const last = new Map();
  for (const d of days || []) if (d.day >= from && d.mods != null) { const o = last.get(d.rid); if (!o || d.day > o.day) last.set(d.rid, d); }
  const has = (rid, k) => String(last.get(rid).mods || "").split(",").includes(k);
  const modOf = new Map(rows.filter((x) => x.status !== "ignoriert").map((x) => [x.fp, x.mod])), aff = new Map();
  for (const h of hits) {
    const m = modOf.get(h.fp);
    if (h.day < from || !m || !last.has(h.rid)) continue;
    if (!aff.has(m)) aff.set(m, new Set());
    aff.get(m).add(h.rid);
  }
  const all = last.size, out = [];
  for (const [k, [name, label]] of Object.entries(ERR_MODS)) {
    const on = [...last.keys()].filter((rid) => has(rid, k)).length;
    const a = [...(aff.get(name) || [])].filter((rid) => has(rid, k)).length;
    if (on) out.push({ k, label, on, aff: a, q: a / on });
  }
  for (const [name, label] of Object.entries(ALWAYS_ON)) {
    const a = (aff.get(name) || new Set()).size;
    if (all && (a || name === "Modul 1")) out.push({ k: name, label, on: all, aff: a, q: a / all, always: true });
  }
  out.sort((a, b) => b.q - a.q || b.aff - a.aff || b.on - a.on);
  return { base: all, list: out };
}
export function modErrHtml(M) {
  if (!M || !M.base) return `<div class="c"><h2>Fehler je Modul</h2><div class="empty">Sobald Installationen ab Build 6 ihre Tages-Meldung schicken, steht hier die Fehlerquote je Modul.</div></div>`;
  const L = M.list.filter((x) => x.aff || x.k === "Modul 1").slice(0, 14), Z = M.list.filter((x) => !x.aff && x.k !== "Modul 1"), mx = Math.max(0.01, ...L.map((x) => x.q));
  const svg = `<svg viewBox="0 0 460 ${26 * L.length}" role="img" aria-label="Fehler je Modul">${L.map((x, n) => { const w = Math.max(3, (200 * x.q) / mx), y = n * 26;
    return `<text x="0" y="${y + 17}" fill="#c3c2b7" font-size="12">${e(x.label)}${x.always ? " *" : ""}</text><rect x="140" y="${y + 4}" width="${w.toFixed(1)}" height="16" rx="4" fill="${x.aff ? "#f87171" : "#3a3a38"}"/>` +
      `<text x="${(140 + w + 8).toFixed(1)}" y="${y + 17}" fill="#f0efec" font-size="12">${Math.round(x.q * 100)} % · ${x.aff} von ${x.on}</text>`; }).join("")}</svg>`;
  const zero = Z.length ? `<div class="u" style="margin:8px 0 0">Ohne Fehler: ${Z.map((x) => `${e(x.label)} (${x.on})`).join(" · ")}</div>` : "";
  return `<div class="c"><h2>Fehler je Modul</h2><div class="u">betroffene Installationen ÷ Installationen mit Modul an · 30 Tage · Basis ${M.base} Installationen${L.some((x) => x.always) ? " · * immer an" : ""}</div><div style="max-width:620px">${svg}</div>${zero}</div>`;
}
export async function loadDays(DB, todayStr, window = 30) {
  return (await DB.prepare("SELECT day, rid, version, channel, ha, mods FROM err_days WHERE day>=?").bind(S(dOf(todayStr) - (window - 1) * dayMs)).all()).results;
}

// ---------------------------------------------------------------- Build 7 · F3 Rückmeldung an den Nutzer
/** Status der eigenen Fehler (aus dem Bericht und „known“). Nichts über andere Nutzer, keine Liste aller Fehler.
 *  „ignoriert“ wird nicht gemeldet – dann zeigt die Integration nichts an. */
export async function errOwnStatus(DB, p) {
  const asked = [...new Set([...p.errors.map((x) => x.fp), ...(p.known || [])])];
  const { root } = mergeMap(await loadMerges(DB)), back = new Map();   /* Build 8: zusammengeführte Fehler melden den Status des Haupt-Fehlers */
  for (const fp of asked) { const r = root(fp); if (!back.has(r)) back.set(r, []); back.get(r).push(fp); }
  const fps = [...back.keys()], res = {}, out = {};
  for (let i = 0; i < fps.length; i += 50) {
    const part = fps.slice(i, i + 50);
    const rs = (await DB.prepare(`SELECT fp, status, fixed_in FROM err_groups WHERE fp IN (${part.map(() => "?").join(",")})`).bind(...part).all()).results;
    for (const g of rs) {
      if (g.status === "ignoriert" || !(g.status in STATUS)) continue;
      res[g.fp] = g.status === "behoben" && g.fixed_in ? { s: "behoben", fx: g.fixed_in } : { s: g.status === "behoben" ? "offen" : g.status };
    }
  }
  for (const [r, list] of back) if (res[r]) for (const fp of list) out[fp] = res[r];
  return out;
}

// ---------------------------------------------------------------- Build 9 · S5 Home Assistant × Version
const haMin = (h) => { const m = /^(\d{4})\.(\d{1,2})/.exec(String(h || "")); return m ? `${m[1]}.${+m[2]}` : ""; };
const haCmp9 = (a, b) => { const [x1, x2] = a.split(".").map(Number), [y1, y2] = b.split(".").map(Number); return x1 - y1 || x2 - y2; };
/** Fehlerquote je Kombination aus HA-Version (ohne Patch) und Strom-&-Wärme-Version · nur Tages-Meldungen ab Build 6 · Felder ab minN */
export function haMatrix(rows, hits, days, todayStr, { window = 30, cols = 4, minN = 3 } = {}) {
  const from = S(dOf(todayStr) - (window - 1) * dayMs), ign = new Set(rows.filter((x) => x.status === "ignoriert").map((x) => x.fp));
  const Dd = (days || []).filter((d) => d.day >= from && d.mods != null && haMin(d.ha));
  const who = new Map();   // Version|Kennung → HA (letzte Meldung)
  for (const d of Dd) { const k = d.version + "|" + d.rid, o = who.get(k); if (!o || d.day > o.day) who.set(k, { day: d.day, ha: haMin(d.ha), v: d.version, rid: d.rid }); }
  const bad = new Set(hits.filter((h) => h.day >= from && !ign.has(h.fp)).map((h) => h.version + "|" + h.rid));
  const vers = [...new Set([...who.values()].map((x) => x.v))].sort(vcmp).reverse().slice(0, cols);
  const has = [...new Set([...who.values()].map((x) => x.ha))].sort(haCmp9).reverse();
  const cell = (ha, v) => { const L = [...who.values()].filter((x) => x.ha === ha && x.v === v); const n = L.length, err = L.filter((x) => bad.has(v + "|" + x.rid)).length; return { n, err, q: n >= minN ? err / n : null }; };
  return { vers, has, cells: has.map((ha) => vers.map((v) => cell(ha, v))), minN };
}
export function haMatrixHtml(M) {
  if (!M || !M.vers.length) return `<div class="c"><h2>Home Assistant × Version</h2><div class="empty">Sobald Installationen ab 2026.11.5b1 ihre Tages-Meldung schicken, steht hier die Fehlerquote je Home-Assistant-Version.</div></div>`;
  const col = (q) => (q == null ? "color:#5b5a55" : q >= 0.15 ? "background:#7f1d1d;color:#fecaca" : q >= 0.08 ? "background:#78350f;color:#fde68a" : "background:#134e4a;color:#5eead4");
  return `<div class="c"><h2>Home Assistant × Version</h2><div class="u">Installationen mit Fehler ÷ Installationen · 30 Tage · Feld erst ab ${M.minN} Installationen</div>
    <table class="et hm"><tr><th>Home Assistant</th>${M.vers.map((v) => `<th class="num"><a class="lga" href="/version/${encodeURIComponent(v)}">${e(vshort(v))}</a></th>`).join("")}</tr>
    ${M.has.map((ha, i) => `<tr><td>${e(ha)}</td>${M.cells[i].map((c) => `<td class="num"><span class="hmc" style="${col(c.q)}" title="${c.err} von ${c.n}">${c.q == null ? (c.n ? `(${c.n})` : "–") : `${Math.round(c.q * 100)} %`}</span></td>`).join("")}</tr>`).join("")}</table></div>`;
}

// ---------------------------------------------------------------- Build 9 · S1 Release-Bericht je Version
/** Fehler-Teil des Berichts: Reife-Zeile, neu in dieser Version, in dieser Version behoben */
export function versionErrPart(er, v) {
  const R = (er.reife && er.reife.list.find((x) => x.v === v)) || null;
  const neu = er.rows.filter((x) => x.first_ver === v && x.status !== "ignoriert");
  const fixed = er.rows.filter((x) => x.status === "behoben" && x.fixed_in === v);
  const list = (er.reife && er.reife.list) || [], i = list.findIndex((x) => x.v === v);
  return { R, neu, fixed, prev: i >= 0 ? list.slice(i + 1).find((x) => x.ch === (R ? R.ch : channelOf(v))) || null : null, stable: list.find((x) => x.ch === "stable" && vcmp(x.v, v) < 0) || null };
}
export function versionErrHtml(P, v) {
  const tag2 = (x) => x.tag === "wieder da" ? tag("wieder da") : x.status === "arbeit" ? tag("in Arbeit") : x.status === "behoben" ? tag("behoben") : tag(x.tag === "neu" ? "neu" : "bekannt");
  const li = (L, empty) => L.length ? `<table class="mini">${L.slice(0, 10).map((x) => `<tr><td><a class="lga" href="/fehler/${x.fp}"><b>${e(x.kind)}:</b> ${e(String(x.msg || "–").slice(0, 70))}</a><small style="display:block;color:#8d8c84">${e(x.mod)} · ${x.inst_all} Inst.</small></td><td style="text-align:right">${tag2(x)}</td></tr>`).join("")}</table>` : `<div class="empty">${empty}</div>`;
  return `<div class="g"><div class="c"><h2>Neu in dieser Version</h2><div class="u">erst mit ${e(vshort(v))} aufgetaucht${P.neu.length ? ` · <a class="lga" href="/fehler?ver=${encodeURIComponent(v)}">alle in der Fehlerliste</a>` : ""}</div>${li(P.neu, "Keine neuen Fehler.")}</div>
    <div class="c"><h2>In dieser Version behoben</h2><div class="u">als „behoben in ${e(vshort(v))}“ markiert</div>${li(P.fixed, "Noch kein Fehler als behoben in dieser Version markiert.")}</div></div>`;
}
