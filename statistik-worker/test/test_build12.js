// Build 12: Fehler nach Gerät und Aufrufkette
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync, createSign } from "node:crypto";
import worker, { DASH } from "../src/worker.js";
import * as F from "../src/fehler.js";
import { shim } from "./d1shim.js";

const schema = readFileSync(new URL("../schema.sql", import.meta.url), "utf8");
const migrate = readFileSync(new URL("../migrate-build12.sql", import.meta.url), "utf8");
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "k1", alg: "RS256", use: "sig" };
const b = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const tok = (() => { const h = b({ alg: "RS256", kid: "k1" }), p = b({ aud: ["aud123"], iss: "https://t.cloudflareaccess.com", exp: Math.floor(Date.now() / 1000) + 600 }); return `${h}.${p}.${createSign("RSA-SHA256").update(h + "." + p).sign(privateKey).toString("base64url")}`; })();
const realFetch = globalThis.fetch;
globalThis.fetch = async (u, ...a) => (String(u).includes("cloudflareaccess.com/cdn-cgi/access/certs") ? new Response(JSON.stringify({ keys: [jwk] })) : realFetch(u, ...a));
const mkenv = (sql = schema) => { const DB = shim(); DB.exec(sql); return { DB, INGEST_HOST: "stats.x.dev", DASH_HOST: "dash.x.dev", RETENTION_DAYS: "180", TEAM_DOMAIN: "t.cloudflareaccess.com", POLICY_AUD: "aud123" }; };
const post = (env, body) => worker.fetch(new Request("https://stats.x.dev/v1/errors", { method: "POST", body: JSON.stringify(body) }), env);
const dget = (env, path) => worker.fetch(new Request(`https://dash.x.dev${path}`, { headers: { "cf-access-jwt-assertion": tok } }), env);
const today = new Date().toISOString().slice(0, 10);
const ID = () => crypto.randomUUID();
assert.equal(DASH.build, 12);
const E = (o = {}) => ({ fp: "a1b2c3d4e5f6", src: "backend", mod: "Modul 0", kind: "RuntimeError", where: "gr_ent.py:171 _sync", msg: "m", n: 1, first: today, last: today, vers: ["2026.11.5b3"], ...o });
const R = (errors, o = {}) => ({ schema: 4, id: ID(), version: "2026.11.5b3", channel: "beta", ha: "2026.11.3", mods: ["gr"], known: [], errors, ...o });
const CH = ["gr_ent.py:171 _sync", "gr_ent.py:98 _on_plan", "haus.py:412 async_save_plan"];

// Prüfung
assert.ok(F.validErrors(R([E({ chain: CH })])));
assert.equal(F.validErrors(R([E({ chain: CH })])).errors[0].chain, JSON.stringify(CH));
assert.equal(F.validErrors(R([E({ chain: ["a.py:1 f"] })])).errors[0].chain, null, "eine Stelle ist keine Kette");
assert.equal(F.validErrors(R([E({ dev: ["tablet", "handy"] })])).errors[0].dev, "handy,tablet");
for (const bad of [{ chain: [...CH, "x.py:1 f"] }, { chain: ["/config/x.py:1 f", "a.py:1 g"] }, { chain: ["../x.py:1 f", "a.py:1 g"] }, { chain: "x" }, { chain: ["a b c", "x.py:1 f"] }, { dev: ["fernseher"] }, { dev: "handy" }])
  assert.equal(F.validErrors(R([E(bad)])), null, JSON.stringify(bad));
assert.equal(F.validErrors(R([E({ chain: CH, dev: ["handy"] })], { schema: 3 })).errors[0].chain, null, "Schema 3 liest beides nicht");

// Speichern und Detailseite
{
  const env = mkenv();
  assert.equal((await post(env, R([E({ chain: CH })]))).status, 200);
  const U = { fp: "0f9e8d7c6b5a", src: "oberflaeche", mod: "Modul 1", kind: "TypeError", where: "_rkHtml", msg: "x" };
  for (let i = 0; i < 4; i++) assert.equal((await post(env, R([E({ ...U, dev: ["handy"] })]))).status, 200);
  let h = await (await dget(env, "/fehler/a1b2c3d4e5f6")).text();
  assert.ok(h.includes("aufgerufen von") && h.includes("haus.py:412 async_save_plan"), "Kette auf der Detailseite");
  h = await (await dget(env, "/fehler/0f9e8d7c6b5a")).text();
  assert.ok(h.includes("nur Handy") && h.includes("Handy 4") && h.includes("von 4 Installationen mit Angabe"));
  await post(env, R([E({ ...U, dev: ["pc", "handy"] })]));
  h = await (await dget(env, "/fehler/0f9e8d7c6b5a")).text();
  assert.ok(!h.includes("nur Handy") && h.includes("Handy 5 · Computer 1"));
  // ein neuer Bericht ohne Kette überschreibt die gespeicherte nicht
  await post(env, R([E()]));
  assert.ok((await (await dget(env, "/fehler/a1b2c3d4e5f6")).text()).includes("aufgerufen von"));
  console.log("Build-12-Speichern OK");
}
// Vor der Migration: Berichte kommen weiter an, Detailseite läuft ohne Kette/Gerät
{
  const old = schema.replace(", dev TEXT, PRIMARY KEY(day, fp, rid));", ", PRIMARY KEY(day, fp, rid));").replace("status_day TEXT,\n  chain TEXT);", "status_day TEXT);");
  assert.notEqual(old, schema);
  const env = mkenv(old);
  assert.equal((await post(env, R([E({ chain: CH, dev: ["handy"] })]))).status, 200, "Bericht scheitert nie an fehlenden Spalten");
  assert.equal(env.DB.raw.prepare("SELECT COUNT(*) n FROM err_hits").get().n, 1);
  const h = await (await dget(env, "/fehler/a1b2c3d4e5f6")).text();
  assert.ok(h.includes("gr_ent.py:171 _sync") && !h.includes("aufgerufen von"));
  env.DB.exec(migrate);
  assert.ok(env.DB.raw.prepare("PRAGMA table_info(err_hits)").all().some((c) => c.name === "dev"));
  assert.ok(env.DB.raw.prepare("PRAGMA table_info(err_groups)").all().some((c) => c.name === "chain"));
  console.log("Build-12-Migration OK");
}
console.log("Build-12-Tests OK");
