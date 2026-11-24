// Build 8: Fehler zusammenführen und trennen
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync, createSign } from "node:crypto";
import worker from "../src/worker.js";
import * as F from "../src/fehler.js";
import { shim } from "./d1shim.js";

const schema = readFileSync(new URL("../schema.sql", import.meta.url), "utf8");
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "k1", alg: "RS256", use: "sig" };
const b = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const tok = (() => { const h = b({ alg: "RS256", kid: "k1" }), p = b({ aud: ["aud123"], iss: "https://t.cloudflareaccess.com", exp: Math.floor(Date.now() / 1000) + 600 }); return `${h}.${p}.${createSign("RSA-SHA256").update(h + "." + p).sign(privateKey).toString("base64url")}`; })();
const realFetch = globalThis.fetch;
globalThis.fetch = async (u, ...a) => (String(u).includes("cloudflareaccess.com/cdn-cgi/access/certs") ? new Response(JSON.stringify({ keys: [jwk] })) : realFetch(u, ...a));
const mkenv = (sql = schema) => { const DB = shim(); DB.exec(sql); return { DB, INGEST_HOST: "stats.x.dev", DASH_HOST: "dash.x.dev", RETENTION_DAYS: "180", TEAM_DOMAIN: "t.cloudflareaccess.com", POLICY_AUD: "aud123" }; };
const post = (env, path, body) => worker.fetch(new Request(`https://stats.x.dev${path}`, { method: "POST", body: JSON.stringify(body) }), env);
const H = { "cf-access-jwt-assertion": tok };
const dget = (env, path) => worker.fetch(new Request(`https://dash.x.dev${path}`, { headers: H, redirect: "manual" }), env);
const dpost = (env, path, form) => worker.fetch(new Request(`https://dash.x.dev${path}`, { method: "POST", headers: { ...H, origin: "https://dash.x.dev" }, body: new URLSearchParams(form), redirect: "manual" }), env);
const ID = () => crypto.randomUUID();
const today = new Date().toISOString().slice(0, 10);
const E = (fp, o = {}) => ({ fp, src: "backend", mod: "Modul 9", kind: "TimeoutError", where: "wetter.py:212 _fetch", msg: "Zeitüberschreitung", n: 1, first: today, last: today, vers: ["2026.11.5b2"], ...o });
const R = (id, errors, o = {}) => ({ schema: 3, id, version: "2026.11.5b2", channel: "beta", ha: "2026.11", mods: ["wx"], errors, known: [], ...o });

const env = mkenv();
const A = "aaaaaaaaaaaa", B = "bbbbbbbbbbbb", C = "cccccccccccc", X = "dddddddddddd";
const ids = [ID(), ID(), ID(), ID()];
await post(env, "/v1/errors", R(ids[0], [E(A, { n: 3 })]));
await post(env, "/v1/errors", R(ids[1], [E(B, { msg: "Zeitüberschreitung beim Lesen", where: "wetter.py:230 _fetch", n: 2 })]));
await post(env, "/v1/errors", R(ids[2], [E(C, { kind: "ClientError", msg: "Verbindung abgebrochen", n: 1 })]));
await post(env, "/v1/errors", R(ids[3], [E(X, { mod: "Modul 8", kind: "TypeError", where: "wallbox.py:1 f", msg: "x" })]));

// Vorschläge: gleiche Stelle ohne Zeilennummer zuerst
let D = await F.errLoadOne(env.DB, B, today);
assert.deepEqual(D.cand.map((x) => x.fp).slice(0, 2).sort(), [A, C].sort());
assert.equal(D.cand.at(-1).fp, X, "anderes Modul, andere Stelle zuletzt");
assert.ok(D.cand[0].s >= 4);
assert.ok((await (await dget(env, `/fehler/${B}`)).text()).includes("Mit … zusammenführen"));

// Zusammenführen B → A über das Dashboard
let res = await dpost(env, `/fehler/${B}`, { act: "merge", into: A });
assert.equal(res.status, 303); assert.equal(res.headers.get("location"), `/fehler/${A}`);
res = await dget(env, `/fehler/${B}`);
assert.equal(res.status, 302, "zusammengeführter Fehler leitet um"); assert.equal(res.headers.get("location"), `/fehler/${A}`);
D = await F.errLoadOne(env.DB, A, today);
assert.equal(D.inst, 2); assert.equal(D.hits, 5, "Zahlen laufen unter A");
assert.deepEqual(D.g.merged.map((x) => x.fp), [B]);
assert.ok(!D.cand.some((x) => x.fp === B || x.fp === A));
let r = await F.errLoad(env.DB, today, 7);
assert.ok(!r.rows.some((x) => x.fp === B), "B ist keine eigene Zeile mehr");
assert.equal(r.rows.find((x) => x.fp === A).inst, 2);
let html = await (await dget(env, "/fehler")).text();
assert.ok(html.includes("+1 zusammengeführt") && !html.includes(`/fehler/${B}`));
html = await (await dget(env, `/fehler/${A}`)).text();
assert.ok(html.includes("Zusammengeführt") && html.includes("Trennen") && html.includes(B));

// Status von A gilt für B – auch in der Rückmeldung an Nutzer (Build 7)
env.DB.raw.prepare("UPDATE err_groups SET status='behoben', fixed_in='2026.11.5b3' WHERE fp=?").run(A);
env.DB.raw.prepare("UPDATE err_groups SET status='ignoriert' WHERE fp=?").run(B);   // alter Status von B zählt nicht mehr
const j = await (await post(env, "/v1/errors", R(ID(), [], { known: [B] }))).json();
assert.deepEqual(j.status, { [B]: { s: "behoben", fx: "2026.11.5b3" } });
r = await F.errLoad(env.DB, today, 7);
assert.equal(r.rows.find((x) => x.fp === A).tag, "behoben");

// Neue Berichte mit B landen weiter bei A
await post(env, "/v1/errors", R(ID(), [E(B, { msg: "Zeitüberschreitung beim Lesen", where: "wetter.py:230 _fetch" })]));
assert.equal((await F.errLoadOne(env.DB, A, today)).inst, 3);

// Kette und Kreis: A → C, dann zeigt B auf C; C → B wäre ein Kreis
res = await dpost(env, `/fehler/${A}`, { act: "merge", into: C });
assert.equal(res.headers.get("location"), `/fehler/${C}`);
D = await F.errLoadOne(env.DB, C, today);
assert.equal(D.inst, 4); assert.deepEqual(D.g.merged.map((x) => x.fp).sort(), [A, B].sort());
assert.equal((await dpost(env, `/fehler/${C}`, { act: "merge", into: B })).status, 400, "kein Kreis");
assert.equal((await dpost(env, `/fehler/${C}`, { act: "merge", into: C })).status, 400, "nicht mit sich selbst");
assert.equal((await dpost(env, `/fehler/${C}`, { act: "merge", into: "eeeeeeeeeeee" })).status, 404);
assert.equal((await dpost(env, `/fehler/${C}`, { act: "merge", into: "<x>" })).status, 400);
assert.equal((await worker.fetch(new Request(`https://dash.x.dev/fehler/${C}`, { method: "POST", headers: { ...H, origin: "https://boese.de" }, body: new URLSearchParams({ act: "merge", into: X }) }), env)).status, 403, "fremde Herkunft");

// Trennen: A wieder eigener Fehler (mit B, das noch an A hängt), Status von A bleibt
res = await dpost(env, `/fehler/${C}`, { act: "split", fp: A });
assert.equal(res.status, 303);
D = await F.errLoadOne(env.DB, A, today);
assert.equal(D.g.status, "behoben"); assert.deepEqual(D.g.merged.map((x) => x.fp), [B]);
assert.equal((await F.errLoadOne(env.DB, C, today)).inst, 1);
assert.equal((await dpost(env, `/fehler/${C}`, { act: "split", fp: A })).status, 404, "schon getrennt");
await dpost(env, `/fehler/${A}`, { act: "split", fp: B });
assert.equal((await F.errLoadOne(env.DB, B, today)).g.status, "ignoriert", "B hat seinen alten Status zurück");

// Aufräumen: Verweise auf gelöschte Fehler verschwinden
await dpost(env, `/fehler/${X}`, { act: "merge", into: A });
await post(env, "/v1/errors/forget", { schema: 3, id: ids[3] });
assert.equal(env.DB.raw.prepare("SELECT COUNT(*) n FROM err_merge").get().n, 0);

// Vor der Migration (ohne Tabelle): alles läuft wie bisher, Zusammenführen geht nicht
const old = mkenv(schema.replace(/-- Build 8[\s\S]*$/, ""));
await post(old, "/v1/errors", R(ID(), [E(A)]));
assert.equal((await dget(old, "/fehler")).status, 200);
assert.equal((await dget(old, `/fehler/${A}`)).status, 200);
await F.dbErrCleanup(old.DB, Date.now());
console.log("Build-8-Tests OK");
