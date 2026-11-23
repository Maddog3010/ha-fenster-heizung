import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync, createSign } from "node:crypto";
import worker, { verifyAccess } from "../src/worker.js";
import { validErrors, errLoad, errRender, errLoadOne, errRenderOne, dbErrCleanup } from "../src/fehler.js";
import { shim } from "./d1shim.js";

const schema = readFileSync(new URL("../schema.sql", import.meta.url), "utf8");
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "k1", alg: "RS256", use: "sig" };
const b = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const tok = (() => { const h = b({ alg: "RS256", kid: "k1" }), p = b({ aud: ["aud123"], iss: "https://t.cloudflareaccess.com", exp: Math.floor(Date.now() / 1000) + 600 }); return `${h}.${p}.${createSign("RSA-SHA256").update(h + "." + p).sign(privateKey).toString("base64url")}`; })();
const realFetch = globalThis.fetch;
globalThis.fetch = async (u, ...a) => (String(u).includes("cloudflareaccess.com/cdn-cgi/access/certs") ? new Response(JSON.stringify({ keys: [jwk] })) : realFetch(u, ...a));
const mkenv = () => { const DB = shim(); DB.exec(schema); return { DB, INGEST_HOST: "stats.x.dev", DASH_HOST: "dash.x.dev", RETENTION_DAYS: "180", TEAM_DOMAIN: "t.cloudflareaccess.com", POLICY_AUD: "aud123" }; };
const post = (env, path, body) => worker.fetch(new Request(`https://stats.x.dev${path}`, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }), env);
const dget = (env, path, t = tok) => worker.fetch(new Request(`https://dash.x.dev${path}`, { headers: t ? { "cf-access-jwt-assertion": t } : {} }), env);
const ID = () => crypto.randomUUID();
const today = new Date().toISOString().slice(0, 10);
const E = (o = {}) => ({ fp: "a1b2c3d4e5f6", src: "befehl", mod: "Modul 1", kind: "invalid_format", where: "heizer_update", msg: "expected str at 'id'. Got #", n: 3, first: today, last: today, vers: ["2026.11.4.1"], ...o });
const R = (id, errors, o = {}) => ({ schema: 1, id, version: "2026.11.4.1", channel: "stable", ha: "2026.11.2", errors, ...o });

// Prüfung
const id1 = ID();
assert.ok(validErrors(R(id1, [E()])));
assert.equal(validErrors(R(id1, [E()], { channel: "beta" })), null, "Kanal muss zur Version passen");
assert.equal(validErrors(R(id1, [])), null, "leerer Bericht");
assert.equal(validErrors(R(id1, Array.from({ length: 51 }, (_, i) => E({ fp: i.toString(16).padStart(12, "0") })))), null, "höchstens 50");
for (const bad of [{ fp: "xyz" }, { src: "geraet" }, { n: 0 }, { n: 1.5 }, { first: "gestern" }, { vers: ["9"] }, { msg: "x".repeat(500) }, { mod: "<script>" }, { first: "2026-12-01", last: "2026-11-01" }])
  assert.equal(validErrors(R(id1, [E(bad)])), null, JSON.stringify(bad));
const v = validErrors(R(id1, [E({ msg: "Fehler bei http://192.168.1.20:8123/api und max@example.de", extra: "weg" })]));
assert.ok(!v.errors[0].msg.includes("192.168") && !v.errors[0].msg.includes("example") && !("extra" in v.errors[0]), "Adressen raus, Unbekanntes weg");

// Eingang
const env = mkenv();
assert.equal((await post(env, "/v1/errors", R(id1, [E(), E({ fp: "0f9e8d7c6b5a", src: "backend", mod: "Modul 8", kind: "TypeError", where: "wallbox.py:976 add_km", msg: "unsupported operand", n: 12 })]))).status, 200);
assert.equal((await post(env, "/v1/errors", R(id1, [E()]))).status, 429, "1 Bericht pro Stunde");
const id2 = ID(), id3 = ID();
assert.equal((await post(env, "/v1/errors", R(id2, [E({ n: 1 })], { version: "2026.11.5b2", channel: "beta" }))).status, 200);
assert.equal((await post(env, "/v1/errors", R(id3, [E({ n: 2 })]))).status, 200);
assert.equal((await post(env, "/v1/errors", "kaputt")).status, 400);
assert.equal((await post(env, "/v1/errors", "x".repeat(70000))).status, 413);
assert.equal((await post(env, "/v1/errors", R("nope", [E()]))).status, 400);
const q = (sql) => env.DB.raw.prepare(sql).get();
assert.equal(q("SELECT count(*) n FROM err_groups").n, 2);
assert.equal(q("SELECT sum(n) n FROM err_hits WHERE fp='a1b2c3d4e5f6'").n, 6);
assert.equal(q("SELECT count(*) n FROM installs").n, 0, "Fehlerberichte zählen nicht als Versions-Statistik");

// Auswertung
const r = await errLoad(env.DB, today, 7);
assert.equal(r.rows[0].fp, "a1b2c3d4e5f6", "sortiert nach betroffenen Installationen");
assert.equal(r.rows[0].inst, 3); assert.equal(r.rows[0].hits, 6); assert.equal(r.rows[0].tag, "neu"); assert.equal(r.reporters, 3);
assert.deepEqual(r.rows[0].vers, ["2026.11.4.1", "2026.11.5b2"]);
const htm = errRender(r, {});
assert.ok(htm.includes("expected str at &#x27;id&#x27;") && htm.includes("Modul 8") && htm.includes("/fehler/a1b2c3d4e5f6"));
assert.ok(!errRender(r, { mod: "Modul 8" }).includes("/fehler/a1b2c3d4e5f6"), "Filter Modul");
const d = await errLoadOne(env.DB, "a1b2c3d4e5f6", today);
assert.equal(d.inst, 3); assert.deepEqual(d.ch.map((x) => x.k).sort(), ["beta", "stable"]);
assert.ok(errRenderOne(d).includes("Fehler-ID a1b2c3d4e5f6"));

// Dashboard: nur mit Zugang
assert.equal((await dget(env, "/fehler", "")).status, 403);
const l = await dget(env, "/fehler?tage=30&mod=Modul%201");
assert.equal(l.status, 200); const lt = await l.text(); assert.ok(lt.includes("Fehler · letzte 30 Tage") && lt.includes('class="on">Fehler'));
assert.equal((await dget(env, "/fehler/a1b2c3d4e5f6")).status, 200);
assert.equal((await dget(env, "/fehler/000000000000")).status, 404);
assert.equal((await dget(env, "/fehler/../etc")).status, 404);
assert.ok((await (await dget(env, "/")).text()).includes('href="/fehler"'), "Reiter im Versions-Dashboard");
assert.equal((await worker.fetch(new Request("https://stats.x.dev/fehler"), env)).status, 404, "Eingang gibt nichts heraus");

// Löschen und Aufräumen
assert.equal((await post(env, "/v1/errors/forget", { id: id1 })).status, 200);
assert.equal(q("SELECT count(*) n FROM err_hits WHERE rid='" + id1 + "'").n, 0);
assert.equal(q("SELECT count(*) n FROM err_groups").n, 1, "Gruppe ohne Treffer verschwindet");
assert.equal((await post(env, "/v1/errors/forget", { id: "nope" })).status, 400);
env.DB.raw.prepare("UPDATE err_hits SET day='2020-01-01'").run();
await dbErrCleanup(env.DB, Date.now());
assert.equal(q("SELECT count(*) n FROM err_hits").n + q("SELECT count(*) n FROM err_groups").n, 0);
console.log("Fehler-Tests OK");
