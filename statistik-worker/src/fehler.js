// Fehler-Statistik Build 3: Fehlerberichte annehmen (POST /v1/errors, /v1/errors/forget) und im Dashboard als Liste zeigen.
// Gleicher Fehler bei vielen Nutzern = eine Zeile (Fingerabdruck fp). Die Integration bereinigt vorher; der Worker prüft jedes
// Feld noch einmal, schneidet Unbekanntes ab und entfernt Adressen, falls doch welche durchrutschen. Keine IP-Adressen gespeichert.

export const ERR_SCHEMAS = [1];
export const ERR_MAX_BODY = 64 * 1024;
export const ERR_MIN_GAP = 3600;      // höchstens 1 Bericht pro Kennung und Stunde
export const ERR_KEEP_DAYS = 90;
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const VER_RE = /^(\d{4})\.(\d{1,2})\.(\d{1,2})(?:\.(\d{1,2}))?(?:b(\d{1,3}))?$/;
const HA_RE = /^\d{4}\.\d{1,2}(?:\.\d{1,2})?(?:b\d{1,3}|\.dev\d{0,12})?$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const SRC = { backend: "Backend", befehl: "Befehl", oberflaeche: "Oberfläche" };
const channelOf = (v) => (/b\d+$/.test(v || "") ? "beta" : "stable");
const clean = (s, max) => String(s).replace(/[\u0000-\u001f\u007f]/g, " ")
  .replace(/https?:\/\/\S+|\b[\w.+-]+@[\w-]+\.[\w.-]+\b|\b\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?\b/gi, "<adresse>").slice(0, max);

export function validErrors(d) {
  if (!d || typeof d !== "object" || Array.isArray(d) || !ERR_SCHEMAS.includes(d.schema)) return null;
  const { id, version, channel, ha, errors } = d;
  if (typeof id !== "string" || !ID_RE.test(id) || typeof version !== "string" || !VER_RE.test(version) || channel !== channelOf(version)) return null;
  if (ha != null && ha !== "" && (typeof ha !== "string" || !HA_RE.test(ha))) return null;
  if (!Array.isArray(errors) || errors.length < 1 || errors.length > 50) return null;
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
  return { id, version, channel, ha: ha || "", errors: out };
}

const S = (ms) => new Date(ms).toISOString().slice(0, 10);
const dayMs = 86400000;

export async function dbErrors(DB, p, nowMs) {
  const now = Math.floor(nowMs / 1000), day = S(nowMs);
  const row = await DB.prepare("SELECT last_ts FROM err_reporters WHERE rid=?").bind(p.id).first();
  if (row && now - row.last_ts < ERR_MIN_GAP) return "too_many";
  const st = [DB.prepare("INSERT INTO err_reporters(rid, last_ts, last_day) VALUES(?,?,?) ON CONFLICT(rid) DO UPDATE SET last_ts=excluded.last_ts, last_day=excluded.last_day").bind(p.id, now, day)];
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
export async function dbErrForget(DB, rid) {
  await DB.batch([DB.prepare("DELETE FROM err_hits WHERE rid=?").bind(rid), DB.prepare("DELETE FROM err_reporters WHERE rid=?").bind(rid),
    DB.prepare("DELETE FROM err_groups WHERE fp NOT IN (SELECT DISTINCT fp FROM err_hits)")]);
}
export async function dbErrCleanup(DB, todayMs) {
  const cut = S(todayMs - ERR_KEEP_DAYS * dayMs);
  await DB.batch([DB.prepare("DELETE FROM err_hits WHERE day<?").bind(cut), DB.prepare("DELETE FROM err_reporters WHERE last_day<?").bind(cut),
    DB.prepare("DELETE FROM err_groups WHERE fp NOT IN (SELECT DISTINCT fp FROM err_hits)")]);
}

// ---------------------------------------------------------------- Auswertung
export const vkey = (v) => { const m = VER_RE.exec(v || "") || []; return [+m[1] || 0, +m[2] || 0, +m[3] || 0, +m[4] || 0, m[5] === undefined ? 1e9 : +m[5]]; };
const vcmp = (a, b) => { const x = vkey(a), y = vkey(b); for (let i = 0; i < 5; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };

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
    rows.push({ ...g, back: new Set(back.map((h) => h.rid)).size, inst, hits: win.reduce((a, h) => a + h.n, 0), inst_all: new Set(all.map((h) => h.rid)).size, hits_all: all.reduce((a, h) => a + h.n, 0), vers, tag, spark, in_newest: inNewest });
  }
  const prio = (x) => (x.tag === "wieder da" ? 0 : x.tag === "ignoriert" || x.tag === "behoben" ? 2 : 1);
  rows.sort((a, b) => prio(a) - prio(b) || b.inst - a.inst || b.hits - a.hits || (a.last_day < b.last_day ? 1 : -1));
  return { rows, newest, reporters: new Set(hits.filter((h) => h.day >= from).map((h) => h.rid)).size, days, today: todayStr };
}
export function errDetail(g, hits, todayStr) {
  const today = Date.parse(todayStr + "T00:00:00Z"), cnt = (key) => { const m = new Map(); for (const h of hits) { const k = h[key] || "?"; const o = m.get(k) || { inst: new Set(), n: 0 }; o.inst.add(h.rid); o.n += h.n; m.set(k, o); } return [...m].map(([k, o]) => ({ k, inst: o.inst.size, n: o.n })); };
  const days = Array.from({ length: 30 }, (_, i) => { const d = S(today - (29 - i) * dayMs); const hs = hits.filter((h) => h.day === d); return { d, inst: new Set(hs.map((h) => h.rid)).size, n: hs.reduce((a, h) => a + h.n, 0) }; });
  return { g, inst: new Set(hits.map((h) => h.rid)).size, hits: hits.reduce((a, h) => a + h.n, 0), vers: cnt("version").sort((a, b) => vcmp(b.k, a.k)), ha: cnt("ha").sort((a, b) => b.inst - a.inst), ch: cnt("channel"), days };
}
export async function errLoad(DB, todayStr, days) {
  const groups = (await DB.prepare("SELECT fp, src, mod, kind, where_ AS \"where\", msg, first_day, last_day, status, fixed_in, issue, status_day FROM err_groups").all()).results;
  const hits = (await DB.prepare("SELECT day, fp, rid, version, channel, ha, n FROM err_hits").all()).results;
  return errCompute(groups, hits, todayStr, days);
}
export async function errLoadOne(DB, fp, todayStr) {
  const g = await DB.prepare("SELECT fp, src, mod, kind, where_ AS \"where\", msg, first_day, last_day, status, fixed_in, issue, status_day FROM err_groups WHERE fp=?").bind(fp).first();
  if (!g) return null;
  const hits = (await DB.prepare("SELECT day, fp, rid, version, channel, ha, n FROM err_hits WHERE fp=?").bind(fp).all()).results;
  return errDetail(g, hits, todayStr);
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
  const body = rows.length ? `<table class="et"><tr><th></th><th>Fehler</th><th>Modul</th><th class="num">Installationen</th><th class="num hide">Anzahl</th><th class="hide">Versionen</th><th class="hide">14 Tage</th><th>zuletzt</th></tr>
    ${rows.map((x) => `<tr><td>${tag(x.tag)}${x.status === "behoben" && x.fixed_in ? `<small>${e(x.fixed_in)}</small>` : ""}${x.issue ? `<small>#${x.issue}</small>` : ""}</td><td><a href="/fehler/${x.fp}"><b class="m">${e(x.kind)}: ${e(x.msg || "–")}</b></a><small>${e(SRC[x.src])}${x.where ? " · " + e(x.where) : ""}</small></td><td>${e(x.mod)}</td><td class="num">${x.inst}</td><td class="num hide">${x.hits}</td><td class="hide">${e(x.vers.slice(-2).join(" · "))}</td><td class="hide">${spark(x.spark)}</td><td>${fd(x.last_day)}</td></tr>`).join("")}</table>`
    : '<div class="empty">Keine Fehler in diesem Zeitraum – oder noch keine Berichte.</div>';
  return `<div class="c"><h2>Fehler · letzte ${r.days} Tage</h2><div class="u">${r.reporters} Installationen haben berichtet · neueste Version ${e(r.newest || "–")} · gleicher Fehler = eine Zeile</div>
    <div class="flt">${ln("tage", "", "7 Tage", r.days === 7)}${ln("tage", "30", "30 Tage", r.days === 30)}${ln("tage", "90", "90 Tage", r.days === 90)}<span style="width:8px"></span>${ln("neu", q.neu ? "" : "1", "nur neu / steigt", !!q.neu)}${ln("alle", q.alle ? "" : "1", "auch ruhige", !!q.alle)}${ln("ign", q.ign ? "" : "1", "auch ignorierte", !!q.ign)}</div>
    <div class="flt">${ln("mod", "", "alle Module", !q.mod)}${mods.map((m) => ln("mod", m, m, q.mod === m)).join("")}<span style="width:8px"></span>${ln("src", "", "alle Quellen", !q.src)}${Object.entries(SRC).map(([k, t]) => ln("src", k, t, q.src === k)).join("")}</div>
    ${body}</div>`;
}
export function issueUrl(D, repo = "Maddog3010/ha-fenster-heizung") {
  const g = D.g, src = SRC[g.src];
  const title = `[${g.mod}] ${g.kind}: ${g.msg || ""}`.slice(0, 120);
  const body = [`**${g.mod} · ${src}**`, "", "```", `${g.kind}: ${g.msg || "–"}`, g.where ? `Stelle: ${g.where}` : "", "```", "",
    `- Fehler-ID: \`${g.fp}\``, `- Zuerst ${g.first_day}, zuletzt ${g.last_day}`, `- Betroffen: ${D.inst} Installationen, ${D.hits}× (letzte 90 Tage)`,
    `- Versionen: ${D.vers.map((x) => `${x.k} (${x.inst})`).join(", ")}`, `- Home Assistant: ${D.ha.map((x) => `${x.k} (${x.inst})`).join(", ")}`, "", "_Aus der Fehler-Statistik (anonyme, bereinigte Fehlerberichte)._"].filter((x, i, a) => x !== "" || a[i - 1] !== "").join("\n");
  return `https://github.com/${repo}/issues/new?${new URLSearchParams({ title, body })}`;
}
export function errRenderOne(D, repo) {
  const g = D.g, mx = Math.max(1, ...D.days.map((x) => x.inst));
  const vs = D.vers.map((x) => x.k), back = g.status === "behoben" && g.fixed_in ? D.vers.filter((x) => vcmp(x.k, g.fixed_in) >= 0) : [];
  const st = `<div class="c"><h2>Status</h2><div class="u">${g.status_day ? `geändert am ${e(g.status_day)}` : "noch nicht bearbeitet"}${g.status === "behoben" && g.fixed_in ? ` · behoben in ${e(g.fixed_in)}` : ""}</div>
    ${back.length ? `<div class="warnb">Wieder da: ${back.map((x) => `${e(x.k)} (${x.inst} Inst.)`).join(", ")} – obwohl als behoben in ${e(g.fixed_in)} markiert.</div>` : ""}
    <form method="post" action="/fehler/${g.fp}" class="sf"><div class="flt">${Object.entries(STATUS).map(([k, t]) => `<label class="rb"><input type="radio" name="status" value="${k}"${(g.status || "offen") === k ? " checked" : ""}><span>${e(t)}</span></label>`).join("")}</div>
    <div class="sfr"><label>behoben in Version <input name="fixed_in" list="vl" value="${e(g.fixed_in || "")}" placeholder="z. B. 2026.11.4.2" pattern="\\d{4}\\.\\d{1,2}\\.\\d{1,2}(\\.\\d{1,2})?(b\\d{1,3})?"></label><datalist id="vl">${vs.map((v) => `<option value="${e(v)}">`).join("")}</datalist>
    <label>GitHub-Issue # <input name="issue" value="${g.issue || ""}" inputmode="numeric" size="6"></label><button type="submit">Speichern</button></div></form>
    <div class="flt" style="margin-top:10px"><a href="${e(issueUrl(D, repo))}" target="_blank" rel="noopener">GitHub-Issue anlegen (vorausgefüllt)</a>${g.issue ? `<a href="https://github.com/${e(repo || "Maddog3010/ha-fenster-heizung")}/issues/${g.issue}" target="_blank" rel="noopener">Issue #${g.issue} öffnen</a>` : ""}</div></div>`;
  const chart = `<svg viewBox="0 0 600 90">${D.days.map((x, i) => `<rect x="${i * 20 + 2}" y="${80 - (x.inst / mx) * 70}" width="16" height="${(x.inst / mx) * 70 + 1}" rx="2" fill="${x.inst ? "#f87171" : "#3a3a38"}"><title>${fd(x.d)} · ${x.inst} Installationen · ${x.n}×</title></rect>`).join("")}<text x="2" y="89" fill="#8d8c84" font-size="9">${fd(D.days[0].d)}</text><text x="598" y="89" fill="#8d8c84" font-size="9" text-anchor="end">heute</text></svg>`;
  const mini = (rows, t) => `<table class="mini">${rows.map((x) => `<tr><td>${e(t ? t(x.k) : x.k)}</td><td class="num">${x.inst} Inst.</td><td class="num">${x.n}×</td></tr>`).join("")}</table>`;
  return `<div class="c"><div class="flt"><a href="/fehler">← alle Fehler</a></div><h2 class="m">${e(g.kind)}: ${e(g.msg || "–")}</h2><div class="u">Fehler-ID ${e(g.fp)}</div>
    <div class="kv"><span>Modul · Quelle</span><b>${e(g.mod)} · ${e(SRC[g.src])}</b><span>Stelle</span><b class="m">${e(g.where || "–")}</b><span>Zuerst · zuletzt</span><b>${e(g.first_day)} · ${e(g.last_day)}</b>
    <span>Betroffen</span><b>${D.inst} Installationen · ${D.hits}× (letzte ${ERR_KEEP_DAYS} Tage)</b><span>Kanal</span><b>${D.ch.map((x) => `${x.k === "beta" ? "Beta" : "Stabil"} ${x.inst}`).join(" · ")}</b></div></div>
    ${st}<div class="g"><div class="c"><h2>Verlauf</h2><div class="u">Installationen pro Tag, 30 Tage</div>${chart}</div>
    <div class="c"><h2>Versionen</h2><div class="u">Strom &amp; Wärme</div>${mini(D.vers)}</div><div class="c"><h2>Home Assistant</h2><div class="u">Version</div>${mini(D.ha)}</div></div>`;
}
