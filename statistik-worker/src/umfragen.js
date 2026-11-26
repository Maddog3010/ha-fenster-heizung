// Build 14: Umfragen – im Dashboard anlegen, über den Eingang ausliefern, Antworten annehmen und auswerten.
//
//   Öffentlich (stats.…):  GET /v1/surveys[?test=CODE] · POST /v1/surveys/answer · POST /v1/surveys/forget
//   Dashboard (dash.…):    /umfragen … – nur hinter Cloudflare Access (Prüfung in worker.js)
//
// Eine Antwort trägt einen Zufallscode, der nur für diese Umfrage gilt – nie die Kennung der Statistik.
// Der Abruf enthält nichts über die Installation: alle bekommen dieselbe Liste, die Zielgruppe filtert die Integration.
import { csv } from "./langzeit.js";

const dayMs = 86400000;
const D = (s) => Date.parse(s + "T00:00:00Z");
const S = (ms) => new Date(ms).toISOString().slice(0, 10);
const e = (x) => String(x ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" }[c]));
const dm = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.` : "–");
const dmy = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}` : "–");
const com = (x) => String(Math.round(x * 10) / 10).replace(".", ",");

export const LIMITS = { questions: 5, options: 6, title: 60, question: 120, option: 60, text: 500, texts: 2 };
export const ANSWER_MAX_BODY = 4096;
export const ANSWER_MIN_GAP = 10;          // Sekunden zwischen zwei Meldungen desselben Zufallscodes
export const ANSWER_CAP = 5000;            // höchstens so viele Antworten je Umfrage
export const RESULT_MIN = 10;              // Ergebnis für Teilnehmende erst ab so vielen Antworten
export const ENDED_SHOWN_DAYS = 30;        // beendete Umfragen bleiben so lange abrufbar
export const ANSWER_KEEP_DAYS = 365;       // Antworten so lange nach Ende aufbewahren
const SID_RE = /^[0-9a-f]{12}$/;
const RID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const VER_RE = /^(\d{4})\.(\d{1,2})\.(\d{1,2})(?:\.(\d{1,2}))?(?:b(\d{1,3}))?$/;
const CODE_RE = /^T-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const TYPES = { one: "Eine Antwort", multi: "Mehrere Antworten", stars: "Sterne", text: "Freitext" };
const CHANNELS = { alle: "Alle", stable: "nur Stabil", beta: "nur Beta" };
const isDay = (s) => typeof s === "string" && DAY_RE.test(s) && !Number.isNaN(D(s)) && S(D(s)) === s;

/** Steuerzeichen entfernen; einzeilig (Standard) oder mit Zeilenumbrüchen */
const clean = (s, multiline = false) => {
  let t = String(s ?? "").replace(/\r\n?/g, "\n");
  t = multiline ? t.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, " ") : t.replace(/[\u0000-\u001f\u007f]+/g, " ");
  return t.trim();
};
const cut = (s, n) => clean(s).slice(0, n).trim();

// ---------------------------------------------------------------- Zustand
/** entwurf · test · geplant · laeuft · beendet */
export function stateOf(s, today) {
  if (s.status !== "aktiv") return s.status;
  if (s.from_day && today < s.from_day) return "geplant";
  return s.to_day && today > s.to_day ? "beendet" : "laeuft";
}
const endDay = (s) => s.ended || s.to_day || "";
const parseQ = (s) => { try { const q = JSON.parse(s.questions); return Array.isArray(q) ? q : []; } catch { return []; } };

// ---------------------------------------------------------------- Datenbank
export async function surveysReady(DB) {
  try { await DB.prepare("SELECT 1 FROM surveys LIMIT 1").first(); await DB.prepare("SELECT 1 FROM answers LIMIT 1").first(); return true; } catch { return false; }
}
const getSurvey = async (DB, id) => (SID_RE.test(id || "") ? DB.prepare("SELECT * FROM surveys WHERE id=?").bind(id).first() : null);
const answerRows = async (DB, sid) => (await DB.prepare("SELECT rid, day, ts, version, channel, data FROM answers WHERE sid=? ORDER BY ts DESC").bind(sid).all()).results
  .map((r) => { let a = {}; try { a = JSON.parse(r.data) || {}; } catch { /* defekte Zeile zählt ohne Inhalt */ } return { ...r, a }; });

const ABC = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const randomCode = () => { const b = crypto.getRandomValues(new Uint8Array(8)); const c = [...b].map((x) => ABC[x % 32]).join(""); return `T-${c.slice(0, 4)}-${c.slice(4)}`; };
const randomId = () => [...crypto.getRandomValues(new Uint8Array(6))].map((x) => x.toString(16).padStart(2, "0")).join("");
/** Ein Testcode für alle Test-Umfragen; wird beim ersten Bedarf erzeugt */
export async function testCode(DB, renew = false) {
  const r = renew ? null : await DB.prepare("SELECT v FROM syskv WHERE k='umfrage_code'").first();
  if (r && CODE_RE.test(r.v)) return r.v;
  const c = randomCode();
  await DB.prepare("INSERT INTO syskv(k, v) VALUES('umfrage_code', ?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").bind(c).run();
  return c;
}
const codeOk = async (DB, c) => typeof c === "string" && CODE_RE.test(c) && c === ((await DB.prepare("SELECT v FROM syskv WHERE k='umfrage_code'").first()) || {}).v;

/** Aufräumen: Antworten 12 Monate nach Ende löschen, ebenso Antworten ohne Umfrage */
export async function surveyCleanup(DB, nowMs) {
  if (!(await surveysReady(DB))) return;
  const old = S(nowMs - ANSWER_KEEP_DAYS * dayMs);
  await DB.batch([
    DB.prepare("DELETE FROM answers WHERE sid IN (SELECT id FROM surveys WHERE status IN ('aktiv','beendet') AND COALESCE(ended, to_day) < ?)").bind(old),
    DB.prepare("DELETE FROM answers WHERE sid NOT IN (SELECT id FROM surveys)"),
  ]);
}

// ---------------------------------------------------------------- Auswertung
export function aggregate(questions, rows) {
  return {
    n: rows.length,
    q: questions.map((q) => {
      const out = { id: q.id, type: q.type, n: 0 };
      if (q.type === "text") { out.n = rows.filter((r) => typeof r.a[q.id] === "string" && r.a[q.id]).length; return out; }
      out.counts = Array(q.type === "stars" ? 5 : q.options.length).fill(0);
      if (q.type === "stars") { out.na = 0; out.avg = null; }
      let sum = 0, rated = 0;
      for (const r of rows) {
        const v = r.a[q.id];
        if (q.type === "stars") {
          if (v === "na") { out.na++; out.n++; } else if (Number.isInteger(v) && v >= 1 && v <= 5) { out.counts[v - 1]++; out.n++; sum += v; rated++; }
        } else if (q.type === "multi") {
          if (Array.isArray(v) && v.length) { out.n++; for (const i of v) if (out.counts[i] !== undefined) out.counts[i]++; }
        } else if (Number.isInteger(v) && out.counts[v] !== undefined) { out.n++; out.counts[v]++; }
      }
      if (q.type === "stars" && rated) out.avg = Math.round((100 * sum) / rated) / 100;
      return out;
    }),
  };
}
/** Ergebnis für Teilnehmende: nur wenn freigegeben, ab RESULT_MIN Antworten, nie Freitexte */
async function publicResult(DB, s) {
  if (!s.results) return null;
  const qs = parseQ(s), rows = await answerRows(DB, s.id);
  if (rows.length < RESULT_MIN) return null;
  const A = aggregate(qs, rows);
  return { n: A.n, q: Object.fromEntries(A.q.filter((x) => x.type !== "text").map(({ id, type, ...rest }) => [id, rest])) };
}

// ---------------------------------------------------------------- Öffentlicher Eingang
export async function surveyList(DB, today, code = "") {
  if (!(await surveysReady(DB))) return [];
  const test = code ? await codeOk(DB, code) : false;
  const all = (await DB.prepare("SELECT * FROM surveys WHERE status IN ('aktiv','beendet','test') ORDER BY created DESC").all()).results;
  const out = [], ended = (s) => (stateOf(s, today) === "beendet" ? 1 : 0);
  for (const s of all.sort((a, b) => ended(a) - ended(b))) {   // höchstens 10, laufende zuerst
    let st = stateOf(s, today);
    if (st === "test" ? !test : st === "geplant") continue;
    if (st === "beendet" && (D(today) - D(endDay(s) || today)) / dayMs > ENDED_SHOWN_DAYS) continue;
    const item = { id: s.id, rev: s.rev, state: st, title: s.title, questions: parseQ(s), channel: s.channel, module: s.module,
      from: s.from_day || "", to: st === "beendet" ? endDay(s) : s.to_day || "", popup: !!s.popup };
    const res = st === "test" ? null : await publicResult(DB, s);
    if (res) item.result = res;
    out.push(item);
    if (out.length >= 10) break;
  }
  return out;
}

/** Antworten gegen die Fragen prüfen; liefert das bereinigte Objekt oder null */
export function validAnswers(questions, a) {
  if (!a || typeof a !== "object" || Array.isArray(a)) return null;
  const ids = new Set(questions.map((q) => q.id));
  if (Object.keys(a).some((k) => !ids.has(k))) return null;
  const out = {};
  for (const q of questions) {
    const has = Object.prototype.hasOwnProperty.call(a, q.id), v = has ? a[q.id] : undefined;
    if (q.type === "text") {   // freiwillig
      if (v === undefined || v === null) continue;
      if (typeof v !== "string" || v.length > LIMITS.text) return null;
      const t = clean(v, true); if (t) out[q.id] = t;
      continue;
    }
    const idx = (i) => Number.isInteger(i) && i >= 0 && i < q.options.length;
    if (q.type === "one") { if (!idx(v)) return null; out[q.id] = v; }
    else if (q.type === "multi") { if (!Array.isArray(v) || !v.length || !v.every(idx) || new Set(v).size !== v.length) return null; out[q.id] = [...v].sort((x, y) => x - y); }
    else if (q.type === "stars") { if (!((Number.isInteger(v) && v >= 1 && v <= 5) || (v === "na" && q.na))) return null; out[q.id] = v; }
    else return null;
  }
  return Object.keys(out).length ? out : null;
}

/** → { code, body } */
export async function surveyAnswer(DB, d, nowMs) {
  const bad = (code, error) => ({ code, body: { ok: false, error } });
  if (!d || typeof d !== "object" || Array.isArray(d) || d.schema !== 1) return bad(400, "format");
  const { survey, rid, version, channel, rev } = d;
  if (typeof survey !== "string" || !SID_RE.test(survey) || typeof rid !== "string" || !RID_RE.test(rid)) return bad(400, "format");
  if (typeof version !== "string" || !VER_RE.test(version) || channel !== (/b\d+$/.test(version) ? "beta" : "stable")) return bad(400, "version");
  if (!(await surveysReady(DB))) return bad(404, "unbekannt");
  const s = await getSurvey(DB, survey), today = S(nowMs);
  if (!s) return bad(404, "unbekannt");
  const st = stateOf(s, today);
  if (st === "test") { if (!(await codeOk(DB, d.test))) return bad(404, "unbekannt"); }
  else if (st === "beendet") return bad(410, "beendet");
  else if (st !== "laeuft") return bad(404, "unbekannt");
  if (rev !== s.rev) return bad(409, "veraltet");
  if (st !== "test" && s.channel !== "alle" && s.channel !== channel) return bad(400, "zielgruppe");
  const a = validAnswers(parseQ(s), d.answers);
  if (!a) return bad(400, "antworten");
  const now = Math.floor(nowMs / 1000);
  const row = await DB.prepare("SELECT ts FROM answers WHERE sid=? AND rid=?").bind(survey, rid).first();
  if (row && now - row.ts < ANSWER_MIN_GAP) return bad(429, "too_many");
  if (!row && (await DB.prepare("SELECT COUNT(*) n FROM answers WHERE sid=?").bind(survey).first()).n >= ANSWER_CAP) return bad(429, "voll");
  await DB.prepare("INSERT INTO answers(sid, rid, day, ts, version, channel, data) VALUES(?,?,?,?,?,?,?) " +
    "ON CONFLICT(sid, rid) DO UPDATE SET day=excluded.day, ts=excluded.ts, version=excluded.version, channel=excluded.channel, data=excluded.data")
    .bind(survey, rid, today, now, version, channel, JSON.stringify(a)).run();
  const result = st === "test" ? null : await publicResult(DB, s);
  return { code: 200, body: result ? { ok: true, result } : { ok: true } };
}

export async function surveyForget(DB, d) {
  const ok = d && typeof d === "object" && typeof d.survey === "string" && SID_RE.test(d.survey) && typeof d.rid === "string" && RID_RE.test(d.rid);
  if (!ok) return { code: 400, body: { ok: false } };
  if (await surveysReady(DB)) await DB.prepare("DELETE FROM answers WHERE sid=? AND rid=?").bind(d.survey, d.rid).run();
  return { code: 200, body: { ok: true } };
}

// ---------------------------------------------------------------- Editor: Formular lesen und prüfen
const blankQ = (type) => ({ type, text: "", options: [], na: false });
export function readForm(form, modules) {
  const get = (k) => String(form.get(k) ?? "");
  const n = Math.min(Math.max(parseInt(get("n"), 10) || 0, 0), LIMITS.questions);
  const questions = [];
  for (let i = 0; i < n; i++) {
    const type = TYPES[get(`q${i}_t`)] ? get(`q${i}_t`) : "one";
    const q = { type, text: cut(get(`q${i}_q`), LIMITS.question), options: [], na: false };
    if (type === "one" || type === "multi") q.options = get(`q${i}_o`).split(/\r?\n/).map((x) => cut(x, LIMITS.option)).filter(Boolean).slice(0, 12);
    if (type === "stars") q.na = get(`q${i}_na`) === "1";
    questions.push(q);
  }
  return {
    title: cut(get("title"), LIMITS.title), questions,
    channel: CHANNELS[get("channel")] ? get("channel") : "alle",
    module: Object.prototype.hasOwnProperty.call(modules, get("module")) ? get("module") : "",
    from_day: isDay(get("from")) ? get("from") : "", to_day: isDay(get("to")) ? get("to") : "",
    popup: get("popup") === "0" ? 0 : 1, results: get("results") === "1" ? 1 : 0,
  };
}
/** Fehlerliste; dates = Zeitraum mitprüfen (Veröffentlichen) */
export function checkDef(def, today, dates = false) {
  const err = [];
  if (!def.title) err.push("Titel fehlt.");
  if (!def.questions.length) err.push("Mindestens eine Frage anlegen.");
  def.questions.forEach((q, i) => {
    const p = `Frage ${i + 1}: `;
    if (!q.text) err.push(p + "Fragetext fehlt.");
    if (q.type === "one" || q.type === "multi") {
      if (q.options.length < 2) err.push(p + "mindestens 2 Antworten, eine je Zeile.");
      if (q.options.length > LIMITS.options) err.push(p + `höchstens ${LIMITS.options} Antworten.`);
      if (new Set(q.options.map((x) => x.toLowerCase())).size !== q.options.length) err.push(p + "eine Antwort steht doppelt.");
    }
  });
  if (def.questions.filter((q) => q.type === "text").length > LIMITS.texts) err.push(`Höchstens ${LIMITS.texts} Freitext-Fragen je Umfrage.`);
  if (dates) {
    const from = def.from_day && def.from_day > today ? def.from_day : today;
    if (!def.to_day) err.push("Enddatum („bis“) fehlt.");
    else if (def.to_day < from) err.push("Das Enddatum liegt vor dem Start.");
  }
  return err;
}
const withIds = (qs) => qs.map((q, i) => ({ id: `q${i + 1}`, type: q.type, text: q.text, ...(q.type === "one" || q.type === "multi" ? { options: q.options } : {}), ...(q.type === "stars" ? { na: !!q.na } : {}) }));

/** Speichern. Geänderte Fragen: neue Revision, alte (Test-)Antworten weg. */
async function saveSurvey(DB, old, def, status, today) {
  const qj = JSON.stringify(withIds(def.questions));
  const v = [def.title || "Ohne Titel", status, qj, def.channel, def.module, def.from_day, def.to_day, def.popup, def.results];
  if (!old) {
    const id = randomId();
    await DB.prepare("INSERT INTO surveys(id, title, status, questions, channel, module, from_day, to_day, popup, results, rev, created, changed) VALUES(?,?,?,?,?,?,?,?,?,?,1,?,?)").bind(id, ...v, today, today).run();
    return id;
  }
  const publish = status === "aktiv", newRev = publish || old.questions !== qj;
  const up = DB.prepare("UPDATE surveys SET title=?, status=?, questions=?, channel=?, module=?, from_day=?, to_day=?, popup=?, results=?, rev=?, changed=?, ended=NULL WHERE id=?").bind(...v, old.rev + (newRev ? 1 : 0), today, old.id);
  if (newRev) await DB.batch([up, DB.prepare("DELETE FROM answers WHERE sid=?").bind(old.id)]); else await up.run();
  return old.id;
}
const defOf = (s) => ({ title: s.title, questions: parseQ(s).map((q) => ({ type: q.type, text: q.text, options: q.options || [], na: !!q.na })), channel: s.channel, module: s.module, from_day: s.from_day || "", to_day: s.to_day || "", popup: s.popup ? 1 : 0, results: s.results ? 1 : 0 });

// ---------------------------------------------------------------- Darstellung
const STATE = { entwurf: ["Entwurf", "drf"], test: ["Test", "tst"], geplant: ["Geplant", "pln"], laeuft: ["Läuft", "run"], beendet: ["Beendet", "end"] };
const stTag = (st) => `<span class="tg s-${STATE[st][1]}">${STATE[st][0]}</span>`;
const audience = (s, modules) => `${CHANNELS[s.channel] || "Alle"}${s.module && modules[s.module] ? ` · mit Modul ${e(modules[s.module])}` : ""}`;
const period = (s, st) => (st === "entwurf" || st === "test" ? (s.to_day ? (s.from_day ? `${dm(s.from_day)} – ${dm(s.to_day)}` : `bis ${dm(s.to_day)}`) : "–") : `${dm(s.from_day)} – ${dm(st === "beendet" ? endDay(s) : s.to_day)}`);
const btn = (act, label, cls = "b2", extra = "") => `<button class="${cls}" name="act" value="${act}"${extra}>${label}</button>`;
const form1 = (url, act, label, cls = "b2") => `<form method="post" action="${url}" class="in1">${btn(act, label, cls)}</form>`;
const OKTXT = { gespeichert: "Gespeichert.", test: "Test-Umfrage gespeichert. Sie ist nur mit dem Testcode sichtbar.", veroeffentlicht: "Veröffentlicht.", beendet: "Umfrage beendet.", geaendert: "Änderung gespeichert.", kopiert: "Als neuer Entwurf kopiert.", geloescht: "Gelöscht.", zurueck: "Zurück im Entwurf.", code: "Neuer Testcode erzeugt. Der alte gilt nicht mehr.", text: "Freitext gelöscht." };
const okBox = (k) => (OKTXT[k] ? `<div class="okb">${OKTXT[k]}</div>` : "");

function listHtml(rows, counts, q, code, today, modules) {
  const f = ["laeuft", "entwurf", "beendet"].includes(q.f) ? q.f : "";
  const grp = (st) => (st === "laeuft" || st === "geplant" ? "laeuft" : st === "beendet" ? "beendet" : "entwurf");
  const list = rows.map((s) => ({ s, st: stateOf(s, today) })).filter((x) => !f || grp(x.st) === f);
  const ln = (k, t) => `<a href="/umfragen${k ? `?f=${k}` : ""}" class="${f === k ? "on" : ""}">${t}</a>`;
  const body = list.length ? `<table class="et"><tr><th>Umfrage</th><th>Status</th><th class="hide">Zielgruppe</th><th class="hide">Zeitraum</th><th class="num">Antworten</th></tr>${list.map(({ s, st }) =>
    `<tr><td><a href="/umfragen/${s.id}"><b>${e(s.title)}</b></a></td><td>${stTag(st)}</td><td class="hide">${audience(s, modules)}</td><td class="hide">${period(s, st)}</td><td class="num">${st === "entwurf" ? "–" : counts.get(s.id) || 0}</td></tr>`).join("")}</table>`
    : `<div class="empty">${rows.length ? "Keine Umfrage mit diesem Status." : "Noch keine Umfrage angelegt."}</div>`;
  return `${okBox(q.ok)}<div class="bar2"><div class="flt">${ln("", "Alle")}${ln("laeuft", "Läuft")}${ln("entwurf", "Entwürfe")}${ln("beendet", "Beendet")}</div><a class="b1" href="/umfragen/neu">+ Neue Umfrage</a></div>
    <div class="c">${body}</div>
    <div class="c codec"><div><b>Testcode:</b> <span class="code">${e(code)}</span><div class="u">In der Integration im Entwickler-Bereich eintragen (ab der Beta mit Umfragen). Nur damit sind Umfragen im Status „Test“ sichtbar.</div></div>${form1("/umfragen", "newcode", "Neuer Code")}</div>`;
}

function previewHtml(def) {
  const qs = def.questions.map((q, i) => {
    let body = "";
    if (q.type === "one" || q.type === "multi") body = q.options.map((o) => `<div class="po">${q.type === "one" ? "○" : "☐"} ${e(o)}</div>`).join("") || '<div class="u">noch keine Antworten</div>';
    if (q.type === "stars") body = `<div class="pst">★ ★ ★ ★ ★</div>${q.na ? '<div class="pna">Nutze ich nicht</div>' : ""}`;
    if (q.type === "text") body = '<div class="po pta">Antwort schreiben … (freiwillig)</div>';
    return `<div class="pq"><div class="u">Frage ${i + 1} von ${def.questions.length}</div><b>${e(q.text || "(Fragetext)")}</b>${body}</div>`;
  }).join("");
  return `<div class="phone"><b class="pt">${e(def.title || "(Titel)")}</b>${qs || '<div class="empty">Noch keine Frage</div>'}</div>`;
}

function editorHtml({ s, def, today, modules, errors = [], dirty = false, ok = "", code, tests = 0 }) {
  const url = s ? `/umfragen/${s.id}` : "/umfragen/neu", st = s ? stateOf(s, today) : "neu";
  const radios = (name, cur, opts) => `<div class="rbs">${opts.map(([v, t]) => `<label class="rb"><input type="radio" name="${name}" value="${v}"${String(cur) === String(v) ? " checked" : ""}> ${t}</label>`).join("")}</div>`;
  const n = def.questions.length;
  const qs = def.questions.map((q, i) => `<fieldset class="q"><legend>Frage ${i + 1} · ${TYPES[q.type]}</legend><input type="hidden" name="q${i}_t" value="${q.type}">
      <input class="in" name="q${i}_q" value="${e(q.text)}" maxlength="${LIMITS.question}" placeholder="Fragetext" aria-label="Fragetext ${i + 1}">
      ${q.type === "one" || q.type === "multi" ? `<textarea class="in" name="q${i}_o" rows="${Math.min(Math.max(q.options.length + 1, 3), 7)}" placeholder="Eine Antwort je Zeile (2 bis ${LIMITS.options})" aria-label="Antworten ${i + 1}">${e(q.options.join("\n"))}</textarea>` : ""}
      ${q.type === "stars" ? `<label class="rb"><input type="checkbox" name="q${i}_na" value="1"${q.na ? " checked" : ""}> mit „Nutze ich nicht“</label>` : ""}
      ${q.type === "text" ? `<div class="u">freiwillig · höchstens ${LIMITS.text} Zeichen</div>` : ""}
      <div class="qbt">${i > 0 ? btn(`up:${i}`, "↑", "bs", ' aria-label="nach oben"') : ""}${i < n - 1 ? btn(`down:${i}`, "↓", "bs", ' aria-label="nach unten"') : ""}${btn(`del:${i}`, "✕ entfernen", "bs")}</div></fieldset>`).join("");
  const add = n < LIMITS.questions ? `<div class="adds">${Object.entries(TYPES).map(([k, t]) => btn(`add:${k}`, `+ ${t}`, "bs")).join("")}</div>` : `<div class="u">Höchstens ${LIMITS.questions} Fragen.</div>`;
  const modSel = `<select class="in" name="module" aria-label="Modul"><option value="">jedes Modul (keine Einschränkung)</option>${Object.entries(modules).map(([k, t]) => `<option value="${k}"${def.module === k ? " selected" : ""}>nur mit Modul ${e(t)}</option>`).join("")}</select>`;
  return `${okBox(ok)}${errors.length ? `<div class="warnb" role="alert"><b>Noch nicht gespeichert:</b><br>${errors.map(e).join("<br>")}</div>` : dirty ? '<div class="infb">Änderung noch nicht gespeichert.</div>' : ""}
  <div class="flt"><a href="/umfragen">← Umfragen</a>${st === "test" ? `<a href="${url}?ansicht=auswertung">Testantworten ansehen (${tests})</a>` : ""}</div>
  <div class="two"><form method="post" action="${url}" class="c ed"><button class="defb" name="act" value="refresh" tabindex="-1" aria-hidden="true">Vorschau</button>
    <h2>${s ? "Umfrage bearbeiten" : "Neue Umfrage"} ${s ? stTag(st) : ""}</h2><input type="hidden" name="n" value="${n}">
    <label class="lb">Titel<input class="in" name="title" value="${e(def.title)}" maxlength="${LIMITS.title}" placeholder="z. B. Deine Meinung zählt"></label>
    <div class="lb">Fragen</div>${qs}${add}
    <div class="lb">Kanal</div>${radios("channel", def.channel, Object.entries(CHANNELS))}
    <label class="lb">Module${modSel}</label>
    <div class="lb">Zeitraum</div><div class="dates"><input class="in" type="date" name="from" value="${e(def.from_day)}" aria-label="von"> <span>bis</span> <input class="in" type="date" name="to" value="${e(def.to_day)}" aria-label="bis"></div><div class="u">Start leer = sofort · Ende einschließlich (Weltzeit UTC)</div>
    <div class="lb">Anzeige</div>${radios("popup", def.popup, [[1, "Popup und Karte"], [0, "nur Karte"]])}
    <div class="lb">Ergebnis für Teilnehmende</div>${radios("results", def.results, [[0, "nicht zeigen"], [1, `zeigen (ab ${RESULT_MIN} Antworten)`]])}
    <div class="acts">${st === "test" ? btn("test", "Test speichern") + btn("draft", "Zurück zum Entwurf") : btn("save", "Als Entwurf speichern") + btn("test", "Testen")}${btn("publish", "Veröffentlichen …", "b1")}</div>
  </form>
  <div><div class="c"><h2>Vorschau</h2><div class="u">So etwa sieht es beim Nutzer aus (dort eine Frage je Schritt)</div>${previewHtml(def)}<div class="acts"><span class="u">Testcode: <span class="code">${e(code)}</span></span></div></div>
  ${s ? `<div class="c" style="margin-top:10px"><div class="acts" style="margin-top:0">${form1(url, "copy", "Kopieren")}${form1(url, "delete", "Löschen …", "bd")}</div></div>` : ""}</div></div>`;
}

function resultsHtml({ s, rows, today, modules, ok = "", error = "" }) {
  const url = `/umfragen/${s.id}`, st = stateOf(s, today), qs = parseQ(s), A = aggregate(qs, rows);
  const pct = (n, base) => (base ? Math.round((100 * n) / base) : 0);
  const bar = (t, n, base) => `<div class="hb"><div><span>${e(t)}</span><span><b>${pct(n, base)} %</b> · ${n}</span></div><i style="width:${pct(n, base)}%"></i></div>`;
  const tiles = [["Antworten", rows.length, `heute +${rows.filter((r) => r.day === today).length}`]];
  const star = A.q.findIndex((x) => x.type === "stars");
  if (star >= 0) tiles.push([`Sterne · Frage ${star + 1}`, A.q[star].avg == null ? "–" : `${com(A.q[star].avg)} ★`, `${A.q[star].n - A.q[star].na} Bewertungen${A.q[star].na ? ` · ${A.q[star].na} × „nutze ich nicht“` : ""}`]);
  if (qs.some((q) => q.type === "text")) tiles.push(["Mit Freitext", rows.filter((r) => qs.some((q) => q.type === "text" && r.a[q.id])).length, `von ${rows.length}`]);
  const stable = rows.filter((r) => r.channel === "stable").length;
  tiles.push(["Kanal Stabil", rows.length ? `${pct(stable, rows.length)} %` : "–", rows.length ? `${rows.length - stable} × Beta` : "noch keine Antworten"]);
  const blocks = qs.map((q, i) => {
    const x = A.q[i];
    let sub = TYPES[q.type], body;
    if (q.type === "text") {
      const t = rows.filter((r) => r.a[q.id]);
      sub = `${t.length} Texte · neueste zuerst${t.length > 100 ? " · hier die neuesten 100, alle im CSV" : ""}`;
      body = t.slice(0, 100).map((r) => `<div class="ft"><p>${e(r.a[q.id])}</p><form method="post" action="${url}"><input type="hidden" name="rid" value="${e(r.rid)}"><input type="hidden" name="qid" value="${q.id}"><small>${dm(r.day)} · ${e(r.version)}</small> ${btn("deltext", "löschen", "bl")}</form></div>`).join("") || '<div class="empty">Noch keine Texte</div>';
    } else if (q.type === "stars") {
      const rated = x.n - x.na;
      sub = `Sterne 1–5 · Durchschnitt ${x.avg == null ? "–" : com(x.avg)}${x.na ? ` · ${x.na} × „nutze ich nicht“ (zählt nicht mit)` : ""}`;
      body = [5, 4, 3, 2, 1].map((k) => bar(`${k} ${k === 1 ? "Stern" : "Sterne"}`, x.counts[k - 1], rated)).join("");
    } else {
      sub = `${TYPES[q.type]}${q.type === "multi" ? " · Anteil der Antwortenden, zusammen auch über 100 %" : ""}`;
      body = q.options.map((o, k) => bar(o, x.counts[k], x.n)).join("");
    }
    return `<div class="c"><h2>${i + 1}. ${e(q.text)}</h2><div class="u">${sub}</div>${body}</div>`;
  }).join("");
  const info = st === "test" ? "Testantworten – werden beim Veröffentlichen gelöscht" : st === "geplant" ? `Startet am ${dmy(s.from_day)}, läuft bis ${dmy(s.to_day)}` : st === "laeuft" ? `Läuft bis ${dmy(s.to_day)}` : `Beendet am ${dmy(endDay(s))} · Antworten werden 12 Monate danach gelöscht`;
  const change = st === "laeuft" || st === "geplant" ? `<form method="post" action="${url}" class="c sfr chg"><b>Ändern</b><label>bis <input type="date" name="to" value="${e(s.to_day)}"></label>
      <label>Anzeige <select name="popup"><option value="1"${s.popup ? " selected" : ""}>Popup und Karte</option><option value="0"${s.popup ? "" : " selected"}>nur Karte</option></select></label>
      <label>Ergebnis <select name="results"><option value="0"${s.results ? "" : " selected"}>nicht zeigen</option><option value="1"${s.results ? " selected" : ""}>zeigen</option></select></label>${btn("change", "Speichern", "")}<span class="u" style="margin:0">Fragen und Zielgruppe sind gesperrt, damit die Zahlen vergleichbar bleiben.</span></form>` : "";
  const acts = [`<a class="b2" href="${url}.csv">CSV</a>`, form1(url, "copy", "Kopieren"),
    st === "laeuft" ? form1(url, "end", "Beenden …") : "", st === "geplant" ? form1(url, "draft", "Zurückziehen") : "",
    st === "beendet" ? form1(url, "delete", "Löschen …", "bd") : ""].join("");
  return `${okBox(ok)}${error ? `<div class="warnb" role="alert">${e(error)}</div>` : ""}<div class="flt"><a href="/umfragen">← Umfragen</a>${st === "test" ? `<a href="${url}">zurück zum Bearbeiten</a>` : ""}</div>
    <div class="bar2"><div><h2 class="big">${e(s.title)} ${stTag(st)}</h2><div class="u">${info} · ${audience(s, modules)} · ${s.popup ? "Popup und Karte" : "nur Karte"} · Ergebnis ${s.results ? "wird gezeigt" : "nicht gezeigt"}</div></div>${st === "test" ? "" : `<div class="acts" style="margin:0">${acts}</div>`}</div>
    <div class="k">${tiles.map(([t, n, sb]) => `<div class="c"><div class="t">${e(t)}</div><div class="n">${e(n)}</div><div class="s">${e(sb)}</div></div>`).join("")}</div>${change}<div class="g">${blocks}</div>`;
}

function confirmHtml(s, kind, n, modules, today) {
  const url = `/umfragen/${s.id}`, def = defOf(s);
  const T = {
    publish: ["Jetzt veröffentlichen?", `<div class="kv"><span>Umfrage</span><b>${e(s.title)}</b><span>Fragen</span><b>${def.questions.length}</b><span>Zielgruppe</span><b>${audience(s, modules)}</b><span>Zeitraum</span><b>${s.from_day && s.from_day > today ? dmy(s.from_day) : "ab sofort"} bis ${dmy(s.to_day)}</b><span>Anzeige</span><b>${s.popup ? "Popup und Karte" : "nur Karte"}</b><span>Ergebnis</span><b>${s.results ? `zeigen ab ${RESULT_MIN} Antworten` : "nicht zeigen"}</b></div><p>Danach sind Fragen und Zielgruppe gesperrt.${n ? (n === 1 ? " Die Testantwort wird gelöscht." : ` Die ${n} Testantworten werden gelöscht.`) : ""} Sichtbar wird sie nur in Versionen der Integration, die Umfragen schon können.</p>`, "publish_ok", "Jetzt veröffentlichen", "b1"],
    end: ["Umfrage beenden?", `<p><b>${e(s.title)}</b> nimmt danach keine Antworten mehr an. Sie lässt sich nicht wieder starten, nur kopieren. Die Auswertung bleibt.</p>`, "end_ok", "Beenden", "bd"],
    delete: ["Umfrage löschen?", `<p><b>${e(s.title)}</b> und ${n === 1 ? "1 Antwort" : `${n} Antworten`} werden endgültig gelöscht.</p>`, "delete_ok", "Endgültig löschen", "bd"],
  }[kind];
  return `<div class="c conf"><h2>${T[0]}</h2>${T[1]}<div class="acts"><a class="b2" href="${url}">Abbrechen</a>${form1(url, T[2], T[3], T[4])}</div></div>`;
}

// ---------------------------------------------------------------- Dashboard-Anfragen
/** x = { DB, id: "" | "neu" | Kennung, csvOnly, form (nur POST), query, nowMs, modules }
 *  → { html, code? } · { redirect } · { csv: { name, body } } · { code: 404 } */
export async function surveyDash({ DB, id, csvOnly, form, query, nowMs, modules }) {
  const today = S(nowMs), go = (to) => ({ redirect: to }), nf = { code: 404, html: '<div class="c"><div class="empty">Diese Umfrage gibt es nicht (mehr).</div></div>' };
  if (!(await surveysReady(DB))) return { code: form ? 503 : 200, html: '<div class="c"><h2>Datenbank noch nicht vorbereitet</h2><p>Einmal ausführen, danach diese Seite neu laden:</p><p class="code">npx wrangler d1 execute stats --remote --file=migrate-build14.sql</p></div>' };
  const act = form ? String(form.get("act") || "") : "";
  const s = id && id !== "neu" ? await getSurvey(DB, id) : null;
  if (id && id !== "neu" && !s) return nf;

  if (csvOnly) {
    if (!s) return nf;
    const qs = parseQ(s), rows = (await answerRows(DB, s.id)).reverse();
    const cell = (q, v) => (v === undefined ? "" : q.type === "one" ? q.options[v] ?? "" : q.type === "multi" ? v.map((i) => q.options[i] ?? "").join(" | ") : v === "na" ? "nutze ich nicht" : v);
    return { csv: { name: `umfrage-${s.id}`, body: csv(["Tag", "Version", "Kanal", ...qs.map((q) => q.text)], rows.map((r) => [r.day, r.version, r.channel === "beta" ? "Beta" : "Stabil", ...qs.map((q) => cell(q, r.a[q.id]))])) } };
  }

  if (!id) {   // Liste
    if (form) { if (act !== "newcode") return { code: 400 }; await testCode(DB, true); return go("/umfragen?ok=code"); }
    const rows = (await DB.prepare("SELECT * FROM surveys ORDER BY created DESC, changed DESC").all()).results;
    const counts = new Map((await DB.prepare("SELECT sid, COUNT(*) n FROM answers GROUP BY sid").all()).results.map((x) => [x.sid, x.n]));
    return { html: listHtml(rows, counts, query, await testCode(DB), today, modules) };
  }

  const url = s ? `/umfragen/${s.id}` : "/umfragen/neu";
  const st = s ? stateOf(s, today) : "neu";
  const editable = st === "neu" || st === "entwurf" || st === "test";
  const count = async () => (s ? (await DB.prepare("SELECT COUNT(*) n FROM answers WHERE sid=?").bind(s.id).first()).n : 0);
  const editor = async (def, extra = {}, code = 200) => ({ code, html: editorHtml({ s, def, today, modules, code: await testCode(DB), tests: await count(), ...extra }) });
  const results = async (extra = {}, code = 200) => ({ code, html: resultsHtml({ s: await getSurvey(DB, s.id), rows: await answerRows(DB, s.id), today, modules, ...extra }) });

  if (!form) {
    if (!s) {
      const def = { title: "", questions: [blankQ("one")], channel: "alle", module: "", from_day: "", to_day: S(nowMs + 14 * dayMs), popup: 1, results: 0 };
      return editor(def);
    }
    if (query.ansicht === "veroeffentlichen" && editable) return { html: confirmHtml(s, "publish", await count(), modules, today) };
    if (editable && !(query.ansicht === "auswertung" && st === "test")) return editor(defOf(s), { ok: query.ok });
    return results({ ok: query.ok });
  }

  // ---- POST
  if (s && act === "copy") {
    const nid = await saveSurvey(DB, null, { ...defOf(s), title: cut(`${s.title} (Kopie)`, LIMITS.title), from_day: "", to_day: S(nowMs + 14 * dayMs) }, "entwurf", today);
    return go(`/umfragen/${nid}?ok=kopiert`);
  }
  if (s && (act === "delete" || act === "delete_ok")) {
    if (st === "laeuft") return results({ error: "Eine laufende Umfrage zuerst beenden." }, 409);
    if (act === "delete") return { html: confirmHtml(s, "delete", await count(), modules, today) };
    await DB.batch([DB.prepare("DELETE FROM answers WHERE sid=?").bind(s.id), DB.prepare("DELETE FROM surveys WHERE id=?").bind(s.id)]);
    return go("/umfragen?ok=geloescht");
  }
  if (s && (act === "end" || act === "end_ok")) {
    if (st !== "laeuft") return { code: 409, html: '<div class="c"><div class="empty">Diese Umfrage läuft nicht.</div></div>' };
    if (act === "end") return { html: confirmHtml(s, "end", await count(), modules, today) };
    await DB.prepare("UPDATE surveys SET status='beendet', ended=?, changed=? WHERE id=?").bind(today, today, s.id).run();
    return go(`${url}?ok=beendet`);
  }
  if (s && act === "deltext") {
    const rid = String(form.get("rid") || ""), qid = String(form.get("qid") || "");
    const q = parseQ(s).find((x) => x.id === qid && x.type === "text");
    const row = q ? await DB.prepare("SELECT data FROM answers WHERE sid=? AND rid=?").bind(s.id, rid).first() : null;
    if (!row) return nf;
    let a = {}; try { a = JSON.parse(row.data) || {}; } catch { /* ersetzen */ }
    delete a[qid];
    await DB.prepare("UPDATE answers SET data=? WHERE sid=? AND rid=?").bind(JSON.stringify(a), s.id, rid).run();
    return go(`${url}?ok=text${st === "test" ? "&ansicht=auswertung" : ""}`);
  }
  if (s && st === "geplant" && act === "draft") {
    await DB.prepare("UPDATE surveys SET status='entwurf', changed=? WHERE id=?").bind(today, s.id).run();
    return go(`${url}?ok=zurueck`);
  }
  if (s && act === "change") {
    if (st !== "laeuft" && st !== "geplant") return { code: 409, html: '<div class="c"><div class="empty">Diese Umfrage lässt sich nicht mehr ändern.</div></div>' };
    const to = String(form.get("to") || ""), min = s.from_day > today ? s.from_day : today;
    if (!isDay(to) || to < min) return results({ error: "Das Enddatum darf nicht in der Vergangenheit oder vor dem Start liegen." }, 400);
    await DB.prepare("UPDATE surveys SET to_day=?, popup=?, results=?, changed=? WHERE id=?").bind(to, String(form.get("popup")) === "0" ? 0 : 1, String(form.get("results")) === "1" ? 1 : 0, today, s.id).run();
    return go(`${url}?ok=geaendert`);
  }
  if (s && act === "publish_ok") {
    if (!editable) return results({ error: "Diese Umfrage ist schon veröffentlicht." }, 409);
    const def = defOf(s), err = checkDef(def, today, true);
    if (err.length) return editor(def, { errors: err }, 400);
    await saveSurvey(DB, s, { ...def, from_day: def.from_day > today ? def.from_day : today }, "aktiv", today);
    return go(`${url}?ok=veroeffentlicht`);
  }
  if (!editable) return results({ error: "Fragen und Zielgruppe einer veröffentlichten Umfrage sind gesperrt." }, 409);

  const def = readForm(form, modules);
  const m = /^(up|down|del|add):([a-z0-9]+)$/.exec(act);
  if (m) {
    const i = +m[2], q = def.questions;
    if (m[1] === "add") { if (TYPES[m[2]] && q.length < LIMITS.questions) q.push(blankQ(m[2])); }
    else if (Number.isInteger(i) && q[i]) {
      if (m[1] === "del") q.splice(i, 1);
      else { const j = m[1] === "up" ? i - 1 : i + 1; if (q[j]) [q[i], q[j]] = [q[j], q[i]]; }
    }
    return editor(def, { dirty: true });
  }
  if (act === "refresh") return editor(def, { dirty: true });
  if (act === "save" || act === "draft") {
    const nid = await saveSurvey(DB, s, def, "entwurf", today);
    return go(`/umfragen/${nid}?ok=${act === "draft" ? "zurueck" : "gespeichert"}`);
  }
  if (act === "test" || act === "publish") {
    const err = checkDef(def, today, act === "publish");
    if (err.length) return editor(def, { errors: err }, 400);
    const nid = await saveSurvey(DB, s, def, act === "test" || st === "test" ? "test" : "entwurf", today);
    return go(act === "test" ? `/umfragen/${nid}?ok=test` : `/umfragen/${nid}?ansicht=veroeffentlichen`);
  }
  return { code: 400 };
}

export const SURVEY_CSS = `.bar2{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-bottom:10px}.bar2 .flt{margin:0}
.b1,.b2,.bd,.bs{display:inline-block;font:inherit;font-weight:700;border-radius:99px;padding:7px 16px;cursor:pointer;text-decoration:none;border:1px solid #3a3a38;background:none;color:#f0efec;line-height:1.3}
.b1{background:#2dd4bf;border-color:#2dd4bf;color:#042f2e}.bd{border-color:#7f1d1d;color:#fecaca}.bs{padding:5px 12px;font-size:.82rem;color:#c3c2b7}.bl{background:none;border:0;color:#8d8c84;text-decoration:underline;cursor:pointer;font:inherit;font-size:.76rem;padding:0 4px}
.s-run{background:#134e4a;color:#5eead4}.s-tst{background:#78350f;color:#fde68a}.s-pln{background:#1e3a8a;color:#bfdbfe}.s-drf{background:#334155;color:#cbd5e1}.s-end{background:#262624;color:#8d8c84}
.okb{background:#134e4a;color:#bfe9e5;border-radius:10px;padding:8px 12px;margin:0 0 10px;font-weight:600}.infb{background:#78350f;color:#fde68a;border-radius:10px;padding:8px 12px;margin:0 0 10px;font-size:.86rem}
.codec{display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-top:10px}.codec .u{margin:2px 0 0}.code{font-family:ui-monospace,Menlo,monospace;color:#fde68a;font-weight:700;word-break:break-all}.in1{display:inline}
.two{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:10px;align-items:start}.ed{position:relative}.defb{position:absolute;left:-9999px;width:1px;height:1px}
.lb{display:block;color:#c3c2b7;font-size:.82rem;margin:12px 0 4px}.in{display:block;width:100%;background:#111110;color:#f0efec;border:1px solid #3a3a38;border-radius:10px;padding:8px 11px;font:inherit;margin-top:3px}textarea.in{resize:vertical}
.q{border:1px solid #3a3a38;border-radius:12px;padding:8px 12px 10px;margin:0 0 8px;min-width:0}.q legend{color:#5eead4;font-size:.78rem;font-weight:700;padding:0 6px}.q .in{margin:0 0 6px}.q .u{margin:0}.qbt,.adds,.rbs{display:flex;gap:6px;flex-wrap:wrap}.qbt{margin-top:6px;justify-content:flex-end}
.dates{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.dates .in{width:auto;color-scheme:dark}.acts{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:14px}
.phone{background:#19222b;border:1px solid #33404c;border-radius:20px;padding:14px;color:#e6edf3;overflow-wrap:anywhere}.pt{font-size:1.05rem}.pq{margin-top:12px;border-top:1px solid #33404c;padding-top:8px}.pq .u{color:#9aa8b5;margin:0 0 2px}.po{border:1px solid #33404c;border-radius:12px;padding:8px 12px;margin-top:6px}.pta{color:#9aa8b5;min-height:56px}.pst{color:#fbbf24;font-size:1.6rem;letter-spacing:4px;margin-top:4px}.pna{color:#5eead4;font-size:.84rem;font-weight:700}
.big{font-size:1.3rem;margin:0}.hb{margin:0 0 9px;overflow-wrap:anywhere}.hb div{display:flex;justify-content:space-between;gap:10px;font-size:.86rem}.hb div span:last-child{white-space:nowrap}.hb i{display:block;height:9px;border-radius:5px;background:#2dd4bf;margin-top:4px;min-width:2px}
.ft{border:1px solid #3a3a38;border-radius:12px;padding:8px 12px;margin-top:8px}.ft p{margin:0 0 2px;white-space:pre-wrap;overflow-wrap:anywhere}.ft small{color:#8d8c84}.chg{margin-bottom:10px}.conf{max-width:560px}
@media(max-width:760px){.two{grid-template-columns:minmax(0,1fr)}}`;
