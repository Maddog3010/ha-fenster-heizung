// Build 14: Umfragen – Eingang, Zugriffsschutz, Editor, Zustände, Auswertung, Löschen, Migration
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync, createSign } from "node:crypto";
import worker, { DASH } from "../src/worker.js";
import * as U from "../src/umfragen.js";
import * as Y from "../src/system.js";
import { shim } from "./d1shim.js";

const schema = readFileSync(new URL("../schema.sql", import.meta.url), "utf8");
const mig = readFileSync(new URL("../migrate-build14.sql", import.meta.url), "utf8");
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "k1", alg: "RS256", use: "sig" };
const b = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const tok = (() => { const h = b({ alg: "RS256", kid: "k1" }), p = b({ aud: ["aud123"], iss: "https://t.cloudflareaccess.com", exp: Math.floor(Date.now() / 1000) + 600 }); return `${h}.${p}.${createSign("RSA-SHA256").update(h + "." + p).sign(privateKey).toString("base64url")}`; })();
const realFetch = globalThis.fetch;
globalThis.fetch = async (u, ...a) => (String(u).includes("cloudflareaccess.com/cdn-cgi/access/certs") ? new Response(JSON.stringify({ keys: [jwk] })) : realFetch(u, ...a));
const mkenv = (sql = schema) => { const DB = shim(); DB.exec(sql); return { DB, INGEST_HOST: "stats.x.dev", DASH_HOST: "dash.x.dev", RETENTION_DAYS: "180", TEAM_DOMAIN: "t.cloudflareaccess.com", POLICY_AUD: "aud123" }; };
const baseSql = schema + "\nCREATE TABLE IF NOT EXISTS syskv(k TEXT PRIMARY KEY, v TEXT);";
const post = (env, path, body) => worker.fetch(new Request(`https://stats.x.dev${path}`, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }), env);
const list = async (env, q = "") => (await (await worker.fetch(new Request(`https://stats.x.dev/v1/surveys${q}`), env)).json()).surveys;
const dget = (env, path, t = tok) => worker.fetch(new Request(`https://dash.x.dev${path}`, { headers: t ? { "cf-access-jwt-assertion": t } : {} }), env);
const dpost = (env, path, fields, { t = tok, origin = "https://dash.x.dev", site } = {}) => {
  const h = { "content-type": "application/x-www-form-urlencoded" };
  if (t) h["cf-access-jwt-assertion"] = t; if (origin) h.origin = origin; if (site) h["sec-fetch-site"] = site;
  return worker.fetch(new Request(`https://dash.x.dev${path}`, { method: "POST", headers: h, body: new URLSearchParams(fields).toString() }), env);
};
const day = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const count = (env, t, w = "1=1") => env.DB.raw.prepare(`SELECT COUNT(*) n FROM ${t} WHERE ${w}`).get().n;
const row = (env, id) => env.DB.raw.prepare("SELECT * FROM surveys WHERE id=?").get(id);
const ID = () => crypto.randomUUID();
const age = (env) => env.DB.raw.prepare("UPDATE answers SET ts=ts-60").run();   // Mindestabstand überspringen
assert.ok(DASH.build >= 14);

const F = { n: "4", title: "Deine Meinung zählt", q0_t: "one", q0_q: "Welches Modul?", q0_o: "Batterie\nLüftung\r\n\nWärmepumpe", q1_t: "multi", q1_q: "Was nutzt du?", q1_o: "Handy\nTablet",
  q2_t: "stars", q2_q: "Wie zufrieden?", q2_na: "1", q3_t: "text", q3_q: "Was fehlt?", channel: "alle", module: "", from: "", to: day(10), popup: "1", results: "1" };
const ans = (o = {}) => ({ q1: 0, q2: [1, 0], q3: 4, q4: "Mehr Bilder", ...o });

// ---------------------------------------------------------------- Zugriffsschutz
{
  const env = mkenv(baseSql);
  assert.equal((await dget(env, "/umfragen", null)).status, 403);
  assert.equal((await dget(env, "/umfragen/neu", null)).status, 403);
  assert.equal((await dget(env, "/umfragen/0123456789ab.csv", null)).status, 403);
  assert.equal((await dpost(env, "/umfragen/neu", { ...F, act: "save" }, { t: null })).status, 403);
  assert.equal((await dpost(env, "/umfragen/neu", { ...F, act: "save" }, { origin: "https://boese.dev" })).status, 403, "fremde Herkunft");
  assert.equal((await dpost(env, "/umfragen/neu", { ...F, act: "save" }, { origin: null })).status, 403, "ohne Herkunft und ohne same-origin");
  assert.equal(count(env, "surveys"), 0);
  assert.equal((await dpost(env, "/umfragen/neu", { ...F, act: "save" }, { origin: null, site: "same-origin" })).status, 303);
  // Dashboard-Seiten gibt es nicht auf dem öffentlichen Eingang
  assert.equal((await worker.fetch(new Request("https://stats.x.dev/umfragen"), env)).status, 404);
  assert.equal((await post(env, "/umfragen/neu", F)).status, 404);
  assert.equal((await dget(env, "/v1/surveys")).status, 404);
  console.log("Build-14-Zugriff OK");
}

// ---------------------------------------------------------------- Editor → Test → Veröffentlichen → Antworten → Ende → Löschen
const env = mkenv(baseSql);
let r = await dget(env, "/umfragen/neu"), h = await r.text();
assert.equal(r.status, 200);
for (const t of ["Neue Umfrage", "Als Entwurf speichern", "Testen", "Veröffentlichen …", "Vorschau", "Testcode"]) assert.ok(h.includes(t), t);
assert.ok(h.includes('href="/umfragen" class="on"') && h.indexOf('class="defb" name="act" value="refresh"') < h.indexOf('value="del:0"'), "Enter löst nur die Vorschau aus");
// Fragen hinzufügen, verschieben, entfernen – ohne zu speichern
h = await (await dpost(env, "/umfragen/neu", { ...F, act: "add:stars" })).text();
assert.ok(h.includes("Frage 5 · Sterne") && h.includes("noch nicht gespeichert"));
assert.ok(!h.includes('value="add:one"') && h.includes("Höchstens 5 Fragen"));
h = await (await dpost(env, "/umfragen/neu", { ...F, act: "down:0" })).text();
assert.ok(h.indexOf('name="q0_q" value="Was nutzt du?"') > 0 && h.indexOf('name="q1_q" value="Welches Modul?"') > 0);
h = await (await dpost(env, "/umfragen/neu", { ...F, act: "del:3" })).text();
assert.ok(!h.includes('value="Was fehlt?"') && h.includes('name="n" value="3"'));
assert.equal(count(env, "surveys"), 0, "nichts gespeichert");
// Fehlerhafte Eingaben werden nicht getestet/veröffentlicht
r = await dpost(env, "/umfragen/neu", { ...F, title: "", q0_o: "nur eine", q1_o: "a\nA", act: "test" }); h = await r.text();
assert.equal(r.status, 400);
for (const t of ["Titel fehlt.", "Frage 1: mindestens 2 Antworten", "Frage 2: eine Antwort steht doppelt."]) assert.ok(h.includes(t), t);
r = await dpost(env, "/umfragen/neu", { ...F, to: "", act: "publish" }); assert.equal(r.status, 400); assert.ok((await r.text()).includes("Enddatum"));
r = await dpost(env, "/umfragen/neu", { ...F, to: day(-1), act: "publish" }); assert.equal(r.status, 400);
r = await dpost(env, "/umfragen/neu", { ...F, n: "3", q0_t: "text", q1_t: "text", q2_t: "text", act: "test" }); assert.ok((await r.text()).includes("Höchstens 2 Freitext"));
r = await dpost(env, "/umfragen/neu", { ...F, q0_o: "1\n2\n3\n4\n5\n6\n7", act: "test" }); assert.ok((await r.text()).includes("höchstens 6 Antworten"));
assert.equal(count(env, "surveys"), 0);
// Entwurf
r = await dpost(env, "/umfragen/neu", { ...F, act: "save" });
assert.equal(r.status, 303);
const id = /^\/umfragen\/([0-9a-f]{12})\?ok=gespeichert$/.exec(r.headers.get("location"))[1];
assert.equal(row(env, id).status, "entwurf");
assert.deepEqual(JSON.parse(row(env, id).questions)[0], { id: "q1", type: "one", text: "Welches Modul?", options: ["Batterie", "Lüftung", "Wärmepumpe"] });
const code = env.DB.raw.prepare("SELECT v FROM syskv WHERE k='umfrage_code'").get().v;
assert.match(code, /^T-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
assert.deepEqual(await list(env), []); assert.deepEqual(await list(env, `?test=${code}`), [], "Entwürfe nie");
// Test
r = await dpost(env, `/umfragen/${id}`, { ...F, act: "test" }); assert.equal(r.headers.get("location"), `/umfragen/${id}?ok=test`);
assert.deepEqual(await list(env), []); assert.deepEqual(await list(env, "?test=T-AAAA-AAAA"), []);
let L = await list(env, `?test=${code}`);
assert.equal(L.length, 1); assert.equal(L[0].state, "test"); const rev = L[0].rev;
const rid = ID();
const A = (o = {}) => ({ schema: 1, survey: id, rev, rid, version: "2026.11.5b11", channel: "beta", answers: ans(), test: code, ...o });
assert.equal((await post(env, "/v1/surveys/answer", A({ test: undefined }))).status, 404, "Test nur mit Code");
assert.equal((await post(env, "/v1/surveys/answer", A())).status, 200);
h = await (await dget(env, `/umfragen/${id}?ansicht=auswertung`)).text();
assert.ok(h.includes("Testantworten") && h.includes("Mehr Bilder") && !h.includes("Beenden …"));
// Speichern ohne geänderte Fragen behält Testantworten, geänderte Fragen verwerfen sie
await dpost(env, `/umfragen/${id}`, { ...F, title: "Neuer Titel", act: "test" });
assert.equal(count(env, "answers"), 1); assert.equal(row(env, id).rev, rev); assert.equal(row(env, id).status, "test");
await dpost(env, `/umfragen/${id}`, { ...F, q0_q: "Welches zuerst?", act: "test" });
assert.equal(count(env, "answers"), 0); assert.equal(row(env, id).rev, rev + 1);
assert.equal((await post(env, "/v1/surveys/answer", A())).status, 409, "veraltete Fragen");
assert.equal((await post(env, "/v1/surveys/answer", A({ rev: rev + 1 }))).status, 200);
// Veröffentlichen: erst Rückfrage, dann sperren; Testantworten weg
r = await dpost(env, `/umfragen/${id}`, { ...F, q0_q: "Welches zuerst?", act: "publish" });
assert.equal(r.headers.get("location"), `/umfragen/${id}?ansicht=veroeffentlichen`);
assert.equal(row(env, id).status, "test", "noch nicht veröffentlicht");
h = await (await dget(env, `/umfragen/${id}?ansicht=veroeffentlichen`)).text();
assert.ok(h.includes("Jetzt veröffentlichen?") && h.includes("Die Testantwort wird gelöscht."));
assert.equal((await dpost(env, `/umfragen/${id}`, { act: "publish_ok" })).status, 303);
assert.equal(row(env, id).status, "aktiv"); assert.equal(row(env, id).from_day, day(0)); assert.equal(count(env, "answers"), 0);
const R = row(env, id).rev; assert.equal(R, rev + 2);
r = await dpost(env, `/umfragen/${id}`, { ...F, q0_q: "Manipuliert", act: "save" });
assert.equal(r.status, 409); assert.ok(!row(env, id).questions.includes("Manipuliert"));
for (const act of ["test", "publish", "publish_ok", "delete", "delete_ok"]) assert.equal((await dpost(env, `/umfragen/${id}`, { ...F, act })).status, 409, act);
L = await list(env);
assert.equal(L.length, 1); assert.deepEqual(Object.keys(L[0]).sort(), ["channel", "from", "id", "module", "popup", "questions", "rev", "state", "title", "to"]);
assert.equal(L[0].state, "laeuft");
// Antworten prüfen
const P = (o = {}) => A({ rev: R, test: undefined, ...o });
for (const [bad, why] of [[{ answers: ans({ q1: 3 }) }, "Index"], [{ answers: ans({ q1: "0" }) }, "Text statt Zahl"], [{ answers: ans({ q2: [] }) }, "leer"], [{ answers: ans({ q2: [0, 0] }) }, "doppelt"],
  [{ answers: ans({ q3: 6 }) }, "Sterne"], [{ answers: ans({ q4: "x".repeat(501) }) }, "zu lang"], [{ answers: ans({ q4: 5 }) }, "kein Text"], [{ answers: { ...ans(), q9: 1 } }, "unbekannt"],
  [{ answers: { q1: 0 } }, "Pflichtfragen"], [{ answers: [] }, "Liste"], [{ rid: "x" }, "Code"], [{ version: "9" }, "Version"], [{ channel: "stable" }, "Kanal passt nicht"], [{ schema: 2 }, "Schema"]])
  assert.equal((await post(env, "/v1/surveys/answer", P(bad))).status, 400, why);
assert.equal((await post(env, "/v1/surveys/answer", P({ survey: "000000000000" }))).status, 404);
assert.equal((await post(env, "/v1/surveys/answer", "x".repeat(5000))).status, 413);
assert.equal((await post(env, "/v1/surveys/answer", "kaputt")).status, 400);
assert.equal(count(env, "answers"), 0);
const longest = P({ answers: ans({ q4: "€".repeat(500) }) });
assert.equal((await post(env, "/v1/surveys/answer", longest)).status, 200, "500 Zeichen passen in 4 KB");
assert.equal((await post(env, "/v1/surveys/answer", P())).status, 429, "Mindestabstand");
age(env);
assert.equal((await post(env, "/v1/surveys/answer", P({ answers: { q1: 1, q2: [1], q3: "na" } }))).status, 200, "ändern, Freitext freiwillig");
assert.equal(count(env, "answers"), 1);
assert.deepEqual(JSON.parse(env.DB.raw.prepare("SELECT data FROM answers").get().data), { q1: 1, q2: [1], q3: "na" });
// Ergebnis erst ab 10 Antworten und nie mit Freitext
for (let i = 0; i < 8; i++) { r = await post(env, "/v1/surveys/answer", P({ rid: ID(), answers: ans({ q1: 0, q2: [0], q3: i % 2 ? 5 : 4, q4: i === 0 ? "=HYPERLINK(\"x\")" : i === 1 ? "<script>alert(1)</script>" : "" }) })); assert.deepEqual(await r.json(), { ok: true }); }
assert.ok(!("result" in (await list(env))[0]), "9 Antworten");
r = await post(env, "/v1/surveys/answer", P({ rid: ID(), answers: ans({ q3: 3, q4: "geheim" }) }));
const res = (await r.json()).result;
assert.equal(res.n, 10); assert.deepEqual(res.q.q1.counts, [9, 1, 0]); assert.equal(res.q.q3.na, 1); assert.equal(res.q.q3.avg, 4.33); assert.ok(!("q4" in res.q));
assert.ok(!JSON.stringify((await list(env))[0]).includes("geheim"));
// Auswertung, Escaping, CSV
h = await (await dget(env, `/umfragen/${id}`)).text();
for (const t of ["Antworten", "heute +10", "4,3 ★", "Mit Freitext", "Beenden …", "&lt;script&gt;alert(1)&lt;/script&gt;", "geheim", "90 %", "Fragen und Zielgruppe sind gesperrt"]) assert.ok(h.includes(t), t);
assert.ok(!h.includes("<script>"));
let c = await dget(env, `/umfragen/${id}.csv`);
assert.equal(c.headers.get("content-type"), "text/csv; charset=utf-8");
const text = await c.text();
assert.ok(text.includes("Tag;Version;Kanal;Welches zuerst?") && text.includes("Handy | Tablet") && text.includes("nutze ich nicht"));
assert.ok(text.includes("\"'=HYPERLINK(\"\"x\"\")\""), "keine Formeln");
// Freitext löschen
const g = env.DB.raw.prepare("SELECT rid FROM answers WHERE data LIKE '%geheim%'").get().rid;
assert.equal((await dpost(env, `/umfragen/${id}`, { act: "deltext", rid: g, qid: "q1" })).status, 404, "nur Freitext");
assert.equal((await dpost(env, `/umfragen/${id}`, { act: "deltext", rid: g, qid: "q4" })).status, 303);
assert.equal(count(env, "answers", "data LIKE '%geheim%'"), 0); assert.equal(count(env, "answers"), 10, "Antwort bleibt");
// Ändern: Ende, Popup, Ergebnis
assert.equal((await dpost(env, `/umfragen/${id}`, { act: "change", to: day(-1), popup: "1", results: "1" })).status, 400);
assert.equal((await dpost(env, `/umfragen/${id}`, { act: "change", to: day(20), popup: "0", results: "0" })).status, 303);
L = await list(env); assert.equal(L[0].to, day(20)); assert.equal(L[0].popup, false); assert.ok(!("result" in L[0])); assert.equal(row(env, id).rev, R);
await dpost(env, `/umfragen/${id}`, { act: "change", to: day(20), popup: "0", results: "1" });
// Beenden mit Rückfrage
h = await (await dpost(env, `/umfragen/${id}`, { act: "end" })).text(); assert.ok(h.includes("Umfrage beenden?")); assert.equal(row(env, id).status, "aktiv");
assert.equal((await dpost(env, `/umfragen/${id}`, { act: "end_ok" })).status, 303);
assert.equal((await post(env, "/v1/surveys/answer", P({ rid: ID() }))).status, 410);
L = await list(env); assert.equal(L[0].state, "beendet"); assert.equal(L[0].to, day(0)); assert.equal(L[0].result.n, 10);
assert.equal((await dpost(env, `/umfragen/${id}`, { act: "change", to: day(20) })).status, 409);
// Zurückziehen/Löschen der eigenen Antwort geht auch danach
assert.equal((await post(env, "/v1/surveys/forget", { survey: id, rid: g })).status, 200);
assert.equal(count(env, "answers"), 9);
assert.equal((await post(env, "/v1/surveys/forget", { survey: id, rid: g })).status, 200, "doppelt schadet nicht");
assert.equal((await post(env, "/v1/surveys/forget", { survey: id })).status, 400);
assert.equal((await post(env, "/v1/surveys/forget", { rid: g })).status, 400);
// 30 Tage nach Ende nicht mehr abrufbar, 12 Monate danach ohne Antworten
env.DB.raw.prepare("UPDATE surveys SET ended=?, to_day=? WHERE id=?").run(day(-31), day(-31), id);
assert.deepEqual(await list(env), []);
await U.surveyCleanup(env.DB, Date.now()); assert.equal(count(env, "answers"), 9);
env.DB.raw.prepare("UPDATE surveys SET ended=?, to_day=? WHERE id=?").run(day(-366), day(-366), id);
await new Promise((res2) => worker.scheduled({}, env, { waitUntil: (p) => p.then(res2) }));
assert.equal(count(env, "answers"), 0); assert.equal(count(env, "surveys"), 1, "Definition bleibt");
// Kopieren, Liste, Löschen, neuer Code
r = await dpost(env, `/umfragen/${id}`, { act: "copy" });
const id2 = /\/umfragen\/([0-9a-f]{12})/.exec(r.headers.get("location"))[1];
assert.notEqual(id2, id); assert.equal(row(env, id2).status, "entwurf"); assert.ok(row(env, id2).title.endsWith("(Kopie)"));
h = await (await dget(env, "/umfragen")).text(); for (const t of ["+ Neue Umfrage", "Beendet", "Entwurf", code]) assert.ok(h.includes(t), t);
h = await (await dget(env, "/umfragen?f=beendet")).text(); assert.ok(!h.includes(id2) && h.includes(id));
h = await (await dpost(env, `/umfragen/${id}`, { act: "delete" })).text(); assert.ok(h.includes("endgültig gelöscht")); assert.equal(count(env, "surveys"), 2);
assert.equal((await dpost(env, `/umfragen/${id}`, { act: "delete_ok" })).status, 303); assert.equal(count(env, "surveys"), 1);
assert.equal((await dget(env, `/umfragen/${id}`)).status, 404);
assert.equal((await dpost(env, "/umfragen", { act: "newcode" })).status, 303);
assert.notEqual(env.DB.raw.prepare("SELECT v FROM syskv WHERE k='umfrage_code'").get().v, code);
console.log("Build-14-Ablauf OK");

// ---------------------------------------------------------------- Geplant, Zielgruppe, Obergrenze
{
  const e2 = mkenv(baseSql);
  let x = await dpost(e2, "/umfragen/neu", { ...F, channel: "beta", module: "ev", from: day(3), act: "publish" });
  const i = /\/umfragen\/([0-9a-f]{12})/.exec(x.headers.get("location"))[1];
  assert.equal(row(e2, i).status, "entwurf");
  await dpost(e2, `/umfragen/${i}`, { act: "publish_ok" });
  assert.equal(U.stateOf(row(e2, i), day(0)), "geplant"); assert.deepEqual(await list(e2), []);
  assert.equal((await dpost(e2, `/umfragen/${i}`, { act: "end_ok" })).status, 409);
  const B = { schema: 1, survey: i, rev: row(e2, i).rev, rid: ID(), version: "2026.11.5b11", channel: "beta", answers: ans() };
  assert.equal((await post(e2, "/v1/surveys/answer", B)).status, 404, "noch nicht gestartet");
  assert.equal((await dpost(e2, `/umfragen/${i}`, { act: "draft" })).status, 303); assert.equal(row(e2, i).status, "entwurf");
  await dpost(e2, `/umfragen/${i}`, { ...F, channel: "beta", module: "ev", from: "", act: "publish" }); await dpost(e2, `/umfragen/${i}`, { act: "publish_ok" });
  const L2 = await list(e2); assert.equal(L2[0].channel, "beta"); assert.equal(L2[0].module, "ev");
  B.rev = L2[0].rev;
  assert.equal((await post(e2, "/v1/surveys/answer", { ...B, version: "2026.11.4.10", channel: "stable" })).status, 400, "Zielgruppe");
  const ins = e2.DB.raw.prepare("INSERT INTO answers(sid, rid, day, ts, version, channel, data) VALUES(?,?,?,?,?,?,?)");
  for (let k = 0; k < U.ANSWER_CAP; k++) ins.run(i, "r" + k, day(0), 1, "2026.11.5b11", "beta", "{}");
  x = await post(e2, "/v1/surveys/answer", B); assert.equal(x.status, 429); assert.equal((await x.json()).error, "voll");
  assert.equal((await dget(e2, `/umfragen/unsinn`)).status, 404);
  console.log("Build-14-Zielgruppe OK");
}

// ---------------------------------------------------------------- Vor der Migration und Migration auf bestehender Datenbank
{
  const old = schema.replace(/-- Build 14[\s\S]*$/, "");
  const e3 = mkenv(old);
  assert.deepEqual(await list(e3), []);
  assert.equal((await post(e3, "/v1/surveys/answer", { schema: 1, survey: "0123456789ab", rev: 1, rid: ID(), version: "2026.11.4", channel: "stable", answers: {} })).status, 404);
  assert.equal((await post(e3, "/v1/surveys/forget", { survey: "0123456789ab", rid: ID() })).status, 200);
  let x = await dget(e3, "/umfragen"), t = await x.text();
  assert.equal(x.status, 200); assert.ok(t.includes("--file=migrate-build14.sql") && t.includes("Datenbank unvollständig: Build 14 (Umfragen) fehlt"));
  assert.equal((await dpost(e3, "/umfragen/neu", { ...F, act: "save" })).status, 503);
  await U.surveyCleanup(e3.DB, Date.now());
  assert.equal((await post(e3, "/v1/ping", { schema: 1, id: ID(), version: "2026.11.4", channel: "stable" })).status, 200);
  e3.DB.exec(mig); e3.DB.exec(mig);   // mehrfach ausführen schadet nicht
  assert.ok((await Y.schemaCheck(e3.DB)).every((c) => c.ok));
  assert.equal((await dpost(e3, "/umfragen/neu", { ...F, act: "save" })).status, 303);
  assert.equal((await post(e3, "/v1/surveys/answer", "kaputt")).status, 400);
  h = await (await dget(e3, "/system")).text(); assert.ok(h.includes("surveys 1") && h.includes(">Umfragen</th>"));
  assert.equal((await dget(e3, "/")).status, 200);
  console.log("Build-14-Migration OK");
}
console.log("Build-14-Tests OK");
