// Build 13: Reiter „System“ – Zähler, nächtlicher Lauf, Datenbank-Stand, Warnhinweis
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync, createSign } from "node:crypto";
import worker, { DASH } from "../src/worker.js";
import * as Y from "../src/system.js";
import { TABS } from "../src/fehler.js";
import { shim } from "./d1shim.js";

const schema = readFileSync(new URL("../schema.sql", import.meta.url), "utf8");
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "k1", alg: "RS256", use: "sig" };
const b = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const tok = (() => { const h = b({ alg: "RS256", kid: "k1" }), p = b({ aud: ["aud123"], iss: "https://t.cloudflareaccess.com", exp: Math.floor(Date.now() / 1000) + 600 }); return `${h}.${p}.${createSign("RSA-SHA256").update(h + "." + p).sign(privateKey).toString("base64url")}`; })();
const realFetch = globalThis.fetch;
globalThis.fetch = async (u, ...a) => (String(u).includes("cloudflareaccess.com/cdn-cgi/access/certs") ? new Response(JSON.stringify({ keys: [jwk] })) : realFetch(u, ...a));
const mkenv = (sql = schema) => { const DB = shim(); DB.exec(sql); return { DB, INGEST_HOST: "stats.x.dev", DASH_HOST: "dash.x.dev", RETENTION_DAYS: "180", TEAM_DOMAIN: "t.cloudflareaccess.com", POLICY_AUD: "aud123" }; };
const post = (env, path, body, ctx) => worker.fetch(new Request(`https://stats.x.dev${path}`, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }), env, ctx);
const dget = (env, path, t = tok) => worker.fetch(new Request(`https://dash.x.dev${path}`, { headers: t ? { "cf-access-jwt-assertion": t } : {} }), env);
const today = new Date().toISOString().slice(0, 10);
const ID = () => crypto.randomUUID();
assert.ok(DASH.build >= 13);

// Reiter-Reihenfolge wie im Konzept, sichtbar nur gebaute
assert.deepEqual(TABS.map((t) => t[2]), ["Versionen", "Fehler", "Module", "Releases", "System", "Umfragen", "Support", "Wochen"]);
assert.deepEqual(Y.kindOf("/v1/ping", 200), "ping:ok"); assert.equal(Y.kindOf("/v1/errors", 429), "err:429"); assert.equal(Y.kindOf("/v1/errors/forget", 200), "forget:ok"); assert.equal(Y.kindOf("/x", 404), "andere:404");

// Zählen im Eingang (mit und ohne ctx.waitUntil)
{
  const env = mkenv(), waits = [], ctx = { waitUntil: (p) => waits.push(p) };
  const P = { schema: 3, id: ID(), version: "2026.11.5b3", channel: "beta", modules: ["ev"], ha: "2026.11" };
  assert.equal((await post(env, "/v1/ping", P, ctx)).status, 200);
  assert.equal((await post(env, "/v1/ping", P, ctx)).status, 429);
  assert.equal((await post(env, "/v1/ping", "kaputt")).status, 400);
  assert.equal((await post(env, "/v1/errors", { schema: 4, id: ID(), version: "2026.11.5b3", channel: "beta", ha: "2026.11.3", mods: [], known: [], errors: [] })).status, 200);
  assert.equal((await post(env, "/v1/gibtsnicht", {})).status, 404);
  await Promise.all(waits);
  const rows = Object.fromEntries(env.DB.raw.prepare("SELECT kind, n FROM sys WHERE day=?").all(today).map((x) => [x.kind, x.n]));
  assert.deepEqual(rows, { "ping:ok": 1, "ping:429": 1, "ping:400": 1, "err:ok": 1, "andere:404": 1 });
  assert.equal((await worker.fetch(new Request("https://stats.x.dev/health"), env)).status, 200);
  assert.equal(env.DB.raw.prepare("SELECT COUNT(*) n FROM sys").get().n, 5, "GET /health wird nicht gezählt");

  // nächtlicher Lauf
  await new Promise((res) => worker.scheduled({}, env, { waitUntil: (p) => p.then(res) }));
  const cron = JSON.parse(env.DB.raw.prepare("SELECT v FROM syskv WHERE k='cron'").get().v);
  assert.equal(cron.day, today); assert.equal(cron.ok, true); assert.equal(cron.snap, true); assert.ok(cron.ms >= 0);

  // Seite
  const h = await (await dget(env, "/system")).text();
  for (const t of ["Versions-Meldungen heute", "Fehlerberichte heute", "Nächtlicher Lauf", "Build 13", "Datenbank-Stand", "Abgelehnte Meldungen", "zu oft (429)", "ungültig (400)", "nicht gefunden (404)", "installs 1", "Gerät, Aufrufkette", "0 Installationen mit Fehler (alle Versionen)"])
    assert.ok(h.includes(t), t);
  assert.ok(!h.includes("Datenbank unvollständig") && !h.includes(">fehlt<"), "alles da");
  assert.ok(h.includes('href="/system" class="on"'), "Reiter aktiv");
  const home = await (await dget(env, "/")).text();
  assert.ok(home.indexOf(">Fehler</a>") < home.indexOf(">System</a>") && !home.includes(">Module</a>"), "Reihenfolge, noch nicht gebaute fehlen");
  assert.equal((await dget(env, "/system", null)).status, 403, "nur hinter Access");
  const X = await Y.sysLoad(env.DB, today, { CF_VERSION_METADATA: { id: "abcdef1234567", timestamp: "2026-11-24T20:10:00Z" } });
  assert.ok(Y.sysHtml(X, DASH).includes("Cloudflare-Version abcdef12 (2026-11-24 20:10)"));
  // angenommene Meldungen kommen aus der Tagesliste – auch für Tage vor den Zählern
  const d3 = new Date(Date.parse(today) - 3 * 864e5).toISOString().slice(0, 10);
  for (let i = 0; i < 5; i++) env.DB.raw.prepare("INSERT INTO daily(day, id, version, channel) VALUES(?,?,?,?)").run(d3, ID(), "2026.11.4.5", "stable");
  const X2 = await Y.sysLoad(env.DB, today);
  assert.equal(X2.ping.find((x) => x.d === d3).ok, 5); assert.equal(X2.ping.at(-1).ok, 1); assert.equal(X2.err.at(-1).ok, 1);
  // Cloudflare D1: sqlite_master-Verknüpfungen und pragma_table_info mit variablem Namen sind gesperrt
  const strict = { ...env.DB, prepare: (sql) => { if (/sqlite_master|pragma_table_info\((?!')/i.test(sql)) throw new Error("SQLITE_AUTH: not authorized"); return env.DB.prepare(sql); } };
  const C = await Y.schemaCheck(strict);
  assert.ok(C && C.every((c) => c.ok), "Datenbank-Stand trotz D1-Einschränkung");
  assert.equal(await Y.schemaCheck({ prepare: () => { throw new Error("x"); } }), null);
  console.log("Build-13-System OK");
}
// Ältere Datenbank: Warnhinweis auf allen Reitern, Befehl im Reiter System, Meldungen laufen weiter
{
  const old = schema.replace(/-- Build 13[\s\S]*$/, "").replace(", dev TEXT, PRIMARY KEY(day, fp, rid));", ", PRIMARY KEY(day, fp, rid));").replace("status_day TEXT,\n  chain TEXT);", "status_day TEXT);");
  const env = mkenv(old);
  assert.equal((await post(env, "/v1/ping", { schema: 3, id: ID(), version: "2026.11.5b3", channel: "beta", modules: [], ha: "2026.11" })).status, 200, "ohne Zähler-Tabelle keine Störung");
  for (const pth of ["/", "/fehler", "/system"]) {
    const h = await (await dget(env, pth)).text();
    assert.ok(h.includes("Datenbank unvollständig: Build 12 (Gerät, Aufrufkette), Build 13 (System-Zähler), Build 14 (Umfragen) fehlt"), pth);
  }
  const h = await (await dget(env, "/system")).text();
  assert.ok(h.includes("--file=migrate-build12.sql") && h.includes("--file=migrate-build13.sql") && h.includes("fehlt: err_hits.dev, err_groups.chain") && h.includes("Zähler laufen ab dem Ausrollen"));
  assert.ok(!h.includes("--file=migrate-build11.sql"), "vorhandene Erweiterungen ohne Befehl");
  const C = await Y.schemaCheck(env.DB);
  assert.deepEqual(C.filter((c) => !c.ok).map((c) => c.b), [12, 13, 14]);
  assert.equal(Y.warnHtml(C.map((c) => ({ ...c, ok: true }))), "");
  console.log("Build-13-Migration OK");
}
console.log("Build-13-Tests OK");
