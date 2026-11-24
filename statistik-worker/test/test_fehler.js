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

// ---- Build 4: Status, „behoben in“, GitHub-Issue
{
  const { issueUrl, errLoad: L2, errRender: R2, errLoadOne: O2, errRenderOne: RO2 } = await import("../src/fehler.js");
  const env = mkenv(), a = ID(), b2 = ID(), c = ID();
  await post(env, "/v1/errors", R(a, [E()]));
  await post(env, "/v1/errors", R(b2, [E()], { version: "2026.11.4.2" }));
  const sp = (fp, body, h = {}) => worker.fetch(new Request(`https://dash.x.dev/fehler/${fp}`, { method: "POST", body: new URLSearchParams(body), headers: { "cf-access-jwt-assertion": tok, "content-type": "application/x-www-form-urlencoded", origin: "https://dash.x.dev", ...h } }), env);
  assert.equal((await sp("a1b2c3d4e5f6", { status: "behoben", fixed_in: "2026.11.4.2" }, { origin: "https://boese.dev" })).status, 403, "fremde Herkunft");
  assert.equal((await worker.fetch(new Request("https://dash.x.dev/fehler/a1b2c3d4e5f6", { method: "POST", body: "status=offen", headers: { "content-type": "application/x-www-form-urlencoded", origin: "https://dash.x.dev" } }), env)).status, 403, "ohne Access");
  assert.equal((await sp("a1b2c3d4e5f6", { status: "weg" })).status, 400);
  assert.equal((await sp("a1b2c3d4e5f6", { status: "behoben", fixed_in: "irgendwann" })).status, 400);
  assert.equal((await sp("000000000000", { status: "offen" })).status, 404);
  let res = await sp("a1b2c3d4e5f6", { status: "behoben", fixed_in: "2026.11.4.2", issue: "#36" });
  assert.equal(res.status, 303); assert.equal(res.headers.get("location"), "/fehler/a1b2c3d4e5f6");
  let r = await L2(env.DB, today, 7);
  assert.equal(r.rows[0].tag, "wieder da", "tritt in 2026.11.4.2 noch auf → rot, ganz oben");
  assert.equal(r.rows[0].issue, 36);
  await sp("a1b2c3d4e5f6", { status: "behoben", fixed_in: "2026.11.5" });
  r = await L2(env.DB, today, 7); assert.equal(r.rows[0].tag, "behoben");
  await post(env, "/v1/errors", R(c, [E()], { version: "2026.11.5b1", channel: "beta" }));
  r = await L2(env.DB, today, 7); assert.equal(r.rows[0].tag, "behoben", "Beta vor 2026.11.5 zählt nicht");
  await sp("a1b2c3d4e5f6", { status: "ignoriert" });
  r = await L2(env.DB, today, 7);
  assert.ok(!R2(r, {}).includes("/fehler/a1b2c3d4e5f6") && R2(r, { ign: "1" }).includes("/fehler/a1b2c3d4e5f6"), "ignorierte nur auf Wunsch");
  await sp("a1b2c3d4e5f6", { status: "arbeit" });
  const d = await O2(env.DB, "a1b2c3d4e5f6", today);
  assert.equal(d.g.status, "arbeit"); assert.equal(d.g.issue, 36, "Issue bleibt, wenn leer gelassen");
  const u = new URL(issueUrl(d));
  assert.equal(u.pathname, "/Maddog3010/ha-fenster-heizung/issues/new");
  assert.ok(u.searchParams.get("title").startsWith("[Modul 1] invalid_format: expected str at 'id'"));
  assert.ok(u.searchParams.get("body").includes("a1b2c3d4e5f6") && u.searchParams.get("body").includes("3 Installationen"));
  const h = RO2(d, "x/y");
  assert.ok(h.includes('action="/fehler/a1b2c3d4e5f6"') && h.includes("github.com/x/y/issues/new") && h.includes("Issue #36"));
  console.log("Build-4-Tests OK");
}

// ---- Build 5: neu in Version, Wochenblick, Release-Marken, Nachzügler
{
  const F = await import("../src/fehler.js");
  const env = mkenv(), a = ID(), b = ID(), c = ID();
  const day = (k) => new Date(Date.now() - k * 86400000).toISOString().slice(0, 10);
  await post(env, "/v1/errors", R(a, [E(), E({ fp: "111111111111", mod: "Modul 9", msg: "Timeout" })], { version: "2026.11.4.3b1", channel: "beta" }));
  await post(env, "/v1/errors", R(b, [E({ fp: "222222222222", mod: "Modul 0", msg: "thread" })], { version: "2026.11.4.3b3", channel: "beta" }));
  await post(env, "/v1/errors", R(c, [E()], { version: "2026.11.4.2" }));
  // F2: erste Version je Fehler, Filter
  let r = await F.errLoad(env.DB, today, 7);
  const by = Object.fromEntries(r.rows.map((x) => [x.fp, x]));
  assert.equal(by.a1b2c3d4e5f6.first_ver, "2026.11.4.2"); assert.equal(by["222222222222"].first_ver, "2026.11.4.3b3");
  assert.deepEqual(r.intro.map((x) => x[0]), ["2026.11.4.3b3", "2026.11.4.3b1", "2026.11.4.2"]);
  let h = F.errRender(r, { ver: "2026.11.4.3b3" });
  assert.ok(h.includes("/fehler/222222222222") && !h.includes("/fehler/111111111111") && h.includes("Neu in Version:") && h.includes("seit 11.4.3b3"));
  assert.ok(!F.errRender(r, { ver: "2026.11.4.3b3", mod: "Modul 9" }).includes("/fehler/222222222222"), "Filter kombinierbar");
  // F6: Wochenblick
  assert.deepEqual({ ...r.week, reife: undefined }, { neu: 3, back: 0, fixed: 0, stale: 0, reife: undefined });
  env.DB.raw.prepare("UPDATE err_groups SET status='behoben', fixed_in='2026.11.4.3b2', status_day=? WHERE fp='a1b2c3d4e5f6'").run(today);
  env.DB.raw.prepare("UPDATE err_groups SET status='arbeit', status_day=? WHERE fp='111111111111'").run(day(20));
  r = await F.errLoad(env.DB, today, 7);
  assert.deepEqual({ ...r.week, reife: undefined }, { neu: 2, back: 0, fixed: 1, stale: 1, reife: undefined }, "neu bleibt neu, auch wenn in Arbeit");
  assert.ok(F.weekHtml(r.week).includes("1 behoben") && F.weekHtml(r.week).includes("seit über 14 Tagen"));
  assert.ok(F.weekHtml({ neu: 0, back: 0, fixed: 0, stale: 0 }).includes("keine neuen Fehler"));
  // V3: Nachzügler – Fehler seit 4.2, behoben in 4.3b2 → 4.2 und 4.3b1 betroffen, 4.3b3 nicht
  const L = F.laggards(r.rows, [["2026.11.4.3b3", 4], ["2026.11.4.3b1", 2], ["2026.11.4.2", 7], ["2026.11.4.1", 3]]);
  assert.equal(L.total, 9); assert.equal(L.list.length, 1); assert.deepEqual(L.list[0].vers, ["2026.11.4.2", "2026.11.4.3b1"]);
  assert.ok(F.lagHtml(L).includes("9 aktive Installationen") && F.lagHtml(L).includes("bisher nur Beta"));
  assert.ok(F.lagHtml(F.laggards([], [])).includes("Noch kein Fehler"));
  // V1: Release-Marken
  env.DB.raw.prepare("INSERT INTO daily VALUES(?,?,?,?)").run(day(40), ID(), "2026.11.4.1", "stable");
  const rel = await F.loadReleases(env.DB);
  assert.equal(rel.find((x) => x.v === "2026.11.4.1").d, day(40)); assert.equal(rel.find((x) => x.v === "2026.11.4.2").d, today);
  const many = Array.from({ length: 12 }, (_, i) => ({ v: `2026.11.5b${i + 1}`, d: day(12 - i) })).concat([{ v: "2026.11.4.2", d: day(20) }]);
  const mk = F.releaseMarks(many, day(29), today, 6);
  assert.equal(mk.length, 6); assert.ok(mk.some((x) => x.v === "2026.11.4.2"), "stabile immer"); assert.ok(mk.some((x) => x.v === "2026.11.5b12"), "neueste Beta");
  const d = await F.errLoadOne(env.DB, "a1b2c3d4e5f6", today);
  assert.ok(F.errRenderOne(d).includes("stroke-dasharray") && F.errRenderOne(d).includes("neue Version erschienen"));
  // Dashboard: Wochenblick oben, Nachzügler-Karte, Filter-Parameter geprüft
  await post(env, "/v1/ping", { schema: 1, id: ID(), version: "2026.11.4.2", channel: "stable" });
  const home = await (await dget(env, "/")).text();
  assert.ok(home.includes("Diese Woche") && home.includes("Nachzügler mit bekanntem Fehler") && home.includes("1 aktive Installationen"));
  const fl = await (await dget(env, "/fehler?ver=2026.11.4.3b3")).text();
  assert.ok(fl.includes("/fehler/222222222222") && !fl.includes("/fehler/111111111111"));
  assert.ok((await (await dget(env, "/fehler?ver=<x>")).text()).includes("/fehler/111111111111"), "ungültige Version wird ignoriert");
  console.log("Build-5-Tests OK");
}
