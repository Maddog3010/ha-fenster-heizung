import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync, createSign } from "node:crypto";
import worker, { compute, validPing, cmp, loadAndCompute, render, verifyAccess, dbCleanup } from "../src/worker.js";
import { shim } from "./d1shim.js";

const ID = () => crypto.randomUUID();
const schema = readFileSync(new URL("../schema.sql", import.meta.url), "utf8");
const mkenv = () => { const DB = shim(); DB.exec(schema); return { DB, INGEST_HOST: "stats.x.dev", DASH_HOST: "dash.x.dev", RETENTION_DAYS: "180", TEAM_DOMAIN: "t.cloudflareaccess.com", POLICY_AUD: "aud123" }; };
const post = (env, path, body, host = "stats.x.dev") => worker.fetch(new Request(`https://${host}${path}`, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }), env);

// Versionsreihenfolge
assert.ok(cmp("2026.11.3b42", "2026.11.3") < 0 && cmp("2026.11.3", "2026.11.3.1") < 0 && cmp("2026.11.3.1", "2026.11.4b25") < 0);
assert.ok(cmp("2026.11.4.2", "2026.11.4.3b1") < 0 && cmp("2026.11.4.3b2", "2026.11.4.3b3") < 0 && cmp("2026.11.4.3b3", "2026.11.4.3") < 0, "Korrektur-Betas nach der letzten Korrektur");
// Validierung
const id = ID();
assert.ok(validPing({ schema: 1, id, version: "2026.11.4", channel: "stable" }));
assert.equal(validPing({ schema: 1, id, version: "2026.11.4b1", channel: "stable" }), null);
assert.equal(validPing({ schema: 1, id: "x", version: "2026.11.4", channel: "stable" }), null);
assert.equal(validPing({ schema: 3, id, version: "2026.11.4", channel: "stable" }), null);
assert.equal(validPing({ schema: 2, id, version: "2026.11.4", channel: "stable" }), null, "Schema 2 braucht modules");
assert.equal(validPing({ schema: 2, id, version: "2026.11.4", channel: "stable", modules: ["en", "ww", "ww"] }).modules, "ww,en");
assert.equal(validPing({ schema: 2, id, version: "2026.11.4", channel: "stable", modules: [] }).modules, "");
assert.equal(validPing({ schema: 1, id, version: "2026.11.4", channel: "stable" }).modules, null);
for (const bad of [null, "ww", ["xeigen"], ["ww", 1], Array(40).fill("ww"), { ww: true }]) assert.equal(validPing({ schema: 2, id, version: "2026.11.4", channel: "stable", modules: bad }), null);

// Eingang
let env = mkenv();
let r = await post(env, "/v1/ping", { schema: 2, id, version: "2026.11.4", channel: "stable", modules: ["ww", "ev"], extra: "x" });
assert.equal(r.status, 200);
assert.equal(env.DB.raw.prepare("SELECT modules m FROM installs").get().m, "ww,ev");
assert.equal((await post(env, "/v1/ping", { schema: 1, id, version: "2026.11.4", channel: "stable" })).status, 429, "1/Stunde");
assert.equal((await post(env, "/v1/ping", "kaputt")).status, 400);
assert.equal((await post(env, "/v1/ping", "x".repeat(2000))).status, 413);
assert.equal((await post(env, "/v1/nix", {})).status, 404);
assert.equal((await post(env, "/v1/ping", { schema: 1, id: ID(), version: "9", channel: "stable" })).status, 400);
assert.equal((await worker.fetch(new Request("https://stats.x.dev/health"), env)).status, 200);
assert.equal((await worker.fetch(new Request("https://stats.x.dev/"), env)).status, 404, "Eingang gibt nichts heraus");
assert.equal((await worker.fetch(new Request("https://stats.x.dev/dash"), env)).status, 404);
assert.equal((await worker.fetch(new Request("https://fremd.dev/"), env)).status, 404, "unbekannter Host");
assert.equal(env.DB.raw.prepare("SELECT count(*) n FROM installs").get().n, 1);
assert.equal((await post(env, "/v1/forget", { id })).status, 200);
assert.equal(env.DB.raw.prepare("SELECT count(*) n FROM installs").get().n + env.DB.raw.prepare("SELECT count(*) n FROM daily").get().n, 0);
assert.equal((await post(env, "/v1/forget", { id: "nope" })).status, 400);
// Aufräumen
env.DB.raw.prepare("INSERT INTO installs(id, first_day, last_day, version, channel, last_ts) VALUES(?,?,?,?,?,?)").run(ID(), "2020-01-01", "2020-01-02", "2026.1.1", "stable", 1);
await dbCleanup(env.DB, 180, Date.now());
assert.equal(env.DB.raw.prepare("SELECT count(*) n FROM installs").get().n, 0);

// Dashboard: Zugriff nur mit gültigem Access-Token
const dget = (env, tok) => worker.fetch(new Request("https://dash.x.dev/", { headers: tok ? { "cf-access-jwt-assertion": tok } : {} }), env);
assert.equal((await dget(env)).status, 403, "ohne Token");
assert.equal((await dget(env, "a.b.c")).status, 403, "Müll-Token");
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "k1", alg: "RS256", use: "sig" };
const b = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
const mkjwt = (pay, key = privateKey, kid = "k1") => { const h = b({ alg: "RS256", kid }), p = b(pay); const s = createSign("RSA-SHA256").update(h + "." + p).sign(key).toString("base64url"); return `${h}.${p}.${s}`; };
const good = { aud: ["aud123"], iss: "https://t.cloudflareaccess.com", exp: Math.floor(Date.now() / 1000) + 600 };
const fetcher = async () => new Response(JSON.stringify({ keys: [jwk] }));
assert.equal(await verifyAccess(mkjwt(good), env, Date.now(), fetcher), true);
assert.equal(await verifyAccess(mkjwt({ ...good, aud: ["anderer"] }), env, Date.now(), fetcher), false, "falsche AUD");
assert.equal(await verifyAccess(mkjwt({ ...good, iss: "https://boese.dev" }), env, Date.now(), fetcher), false, "falscher Aussteller");
assert.equal(await verifyAccess(mkjwt({ ...good, exp: 1 }), env, Date.now(), fetcher), false, "abgelaufen");
const other = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey;
assert.equal(await verifyAccess(mkjwt(good, other), env, Date.now(), fetcher), false, "fremde Signatur");
assert.equal(await verifyAccess(mkjwt(good), { ...env, POLICY_AUD: "HIER-DEN-AUD-TAG-EINTRAGEN" }, Date.now(), fetcher), false, "Platzhalter-Konfiguration schließt");
assert.equal(await verifyAccess(mkjwt(good), { ...env, POLICY_AUD: "" }, Date.now(), fetcher), false, "fehlende Konfiguration schließt");

// Gleiches Ergebnis wie der Python-Server (Referenz: Python-DB liegt als Datei vor)
const ref = process.argv[2];
if (ref) {
  const { DatabaseSync } = await import("node:sqlite");
  const raw = new DatabaseSync(ref, { readOnly: true });
  const today = process.argv[3];
  const ins = raw.prepare("SELECT id, first_day, last_day, version, channel, modules FROM installs").all().map((x) => Object.values(x));
  const dl = raw.prepare("SELECT day, id, version, channel FROM daily").all().map((x) => Object.values(x));
  const mine = compute(ins, dl, today);
  const py = JSON.parse(readFileSync(process.argv[4], "utf8"));
  const norm = (o) => JSON.parse(JSON.stringify(o));
  assert.deepEqual(norm(mine.versions), py.versions);
  for (const k of ["total", "a30", "a7", "new7", "inactive", "newest", "newest_share", "channels", "seen", "week_versions", "weeks", "t50", "mod_base", "modules"]) assert.deepEqual(norm(mine[k]), py[k], k);
  assert.equal(mine.curves.length, py.curves.length);
  mine.curves.forEach((c, i) => { assert.equal(c.v, py.curves[i].v); c.pts.forEach((p, j) => assert.ok(Math.abs(p - py.curves[i].pts[j]) < 0.11, "Kurve")); });
  const html = render(mine);
  assert.ok(html.includes("Versionen aktuell") && html.includes(py.newest));
  console.log("Vergleich mit Python OK:", mine.a30, "aktiv,", mine.curves.length, "Kurven");
  // Auch die Dashboard-Antwort über die D1-Schnittstelle
  const DB = shim(); DB.exec(schema);
  for (const x of ins) DB.raw.prepare("INSERT INTO installs VALUES(?,?,?,?,?,0,?)").run(...x);
  for (const x of dl) DB.raw.prepare("INSERT INTO daily VALUES(?,?,?,?)").run(...x);
  const viaD1 = await loadAndCompute(DB, today);
  assert.deepEqual(norm(viaD1.versions), py.versions);
  assert.deepEqual(norm(viaD1.weeks), py.weeks);
}
// Leeres Dashboard
const empty = render(await loadAndCompute(mkenv().DB, "2026-11-19"));
assert.ok(empty.includes("Noch keine Daten"));
console.log("Worker-Tests OK");
