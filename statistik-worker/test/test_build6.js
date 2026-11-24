// Build 6: Tages-Meldung „0 Fehler“, Release-Reife (F1), Fehler je Modul (F4), Home-Assistant-Versionen (V2)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync, createSign } from "node:crypto";
import worker, { validPing, haStats, compute } from "../src/worker.js";
import * as F from "../src/fehler.js";
import { shim } from "./d1shim.js";

const schema = readFileSync(new URL("../schema.sql", import.meta.url), "utf8");
const migrate = readFileSync(new URL("../migrate-build6.sql", import.meta.url), "utf8");
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "k1", alg: "RS256", use: "sig" };
const b = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const tok = (() => { const h = b({ alg: "RS256", kid: "k1" }), p = b({ aud: ["aud123"], iss: "https://t.cloudflareaccess.com", exp: Math.floor(Date.now() / 1000) + 600 }); return `${h}.${p}.${createSign("RSA-SHA256").update(h + "." + p).sign(privateKey).toString("base64url")}`; })();
const realFetch = globalThis.fetch;
globalThis.fetch = async (u, ...a) => (String(u).includes("cloudflareaccess.com/cdn-cgi/access/certs") ? new Response(JSON.stringify({ keys: [jwk] })) : realFetch(u, ...a));
const mkenv = () => { const DB = shim(); DB.exec(schema); return { DB, INGEST_HOST: "stats.x.dev", DASH_HOST: "dash.x.dev", RETENTION_DAYS: "180", TEAM_DOMAIN: "t.cloudflareaccess.com", POLICY_AUD: "aud123" }; };
const post = (env, path, body) => worker.fetch(new Request(`https://stats.x.dev${path}`, { method: "POST", body: JSON.stringify(body) }), env);
const dget = (env, path) => worker.fetch(new Request(`https://dash.x.dev${path}`, { headers: { "cf-access-jwt-assertion": tok } }), env);
const ID = () => crypto.randomUUID();
const today = new Date().toISOString().slice(0, 10);
const day = (n) => new Date(Date.parse(today) - n * 86400000).toISOString().slice(0, 10);
const R = (id, o = {}) => ({ schema: 2, id, version: "2026.11.5b1", channel: "beta", ha: "2026.11.3", mods: ["ev", "gr"], errors: [], ...o });

// ---------------------------------------------------------------- Migration auf eine Datenbank von Build 5
{
  const DB = shim(); DB.exec(schema.replace(", modules TEXT, ha TEXT);", ", modules TEXT);").replace(/-- Build 6[\s\S]*$/, ""));
  assert.ok(!DB.raw.prepare("PRAGMA table_info(installs)").all().some((c) => c.name === "ha"));
  DB.exec(migrate);
  assert.ok(DB.raw.prepare("PRAGMA table_info(installs)").all().some((c) => c.name === "ha"), "Spalte ha ergänzt");
  assert.ok(DB.raw.prepare("SELECT name FROM sqlite_master WHERE name='err_days'").get(), "Tabelle err_days angelegt");
}

// ---------------------------------------------------------------- Eingang: leerer Bericht, Module, HA-Version
{
  const env = mkenv(), id = ID();
  assert.ok(F.validErrors(R(id)), "Schema 2 darf leer sein");
  assert.equal(F.validErrors(R(id, { schema: 1 })), null, "Schema 1 bleibt: mindestens ein Fehler");
  assert.equal(F.validErrors(R(id, { mods: ["ev", "xmein"] })), null, "nur bekannte Module");
  assert.equal(F.validErrors(R(id, { mods: "ev" })), null);
  assert.equal(F.validErrors(R(id, { mods: undefined })).mods, "", "ohne mods: leere Liste");
  assert.equal(F.validErrors(R(id, { mods: ["li", "gr", "gr"] })).mods, "gr,li", "feste Reihenfolge, doppelt fällt weg");
  assert.equal(F.validErrors({ ...R(id), schema: 1, errors: [{ fp: "a1b2c3d4e5f6", src: "backend", mod: "Modul 1", kind: "X", where: "", msg: "", n: 1, first: today, last: today, vers: [] }] }).mods, null);

  assert.equal((await post(env, "/v1/errors", R(id))).status, 200, "0 Fehler wird angenommen");
  const row = env.DB.raw.prepare("SELECT * FROM err_days WHERE rid=?").get(id);
  assert.deepEqual({ ...row }, { day: today, rid: id, version: "2026.11.5b1", channel: "beta", ha: "2026.11.3", mods: "gr,ev" });
  assert.equal(env.DB.raw.prepare("SELECT COUNT(*) n FROM err_groups").get().n, 0, "kein Fehler angelegt");
  assert.equal((await post(env, "/v1/errors", R(id))).status, 429, "auch die Tages-Meldung höchstens 1× pro Stunde");
  assert.equal((await post(env, "/v1/errors/forget", { schema: 2, id })).status, 200);
  assert.equal(env.DB.raw.prepare("SELECT COUNT(*) n FROM err_days").get().n, 0, "Vergessen löscht auch die Tages-Meldungen");
  env.DB.raw.prepare("INSERT INTO err_days VALUES(?,?,?,?,?,?)").run(day(95), ID(), "2026.11.4", "stable", "", "");
  await F.dbErrCleanup(env.DB, Date.now());
  assert.equal(env.DB.raw.prepare("SELECT COUNT(*) n FROM err_days").get().n, 0, "nach 90 Tagen gelöscht");

  // Versions-Ping Schema 3 mit HA-Version
  const ok = { schema: 3, id: ID(), version: "2026.11.5b1", channel: "beta", modules: ["ev"], ha: "2026.11" };
  assert.equal(validPing(ok).ha, "2026.11");
  assert.equal(validPing({ ...ok, ha: "" }).ha, null);
  assert.equal(validPing({ ...ok, ha: undefined }).ha, null);
  assert.equal(validPing({ ...ok, ha: "2026.06" }).ha, "2026.6");
  for (const bad of ["2026.11.3", "abc", 2026.11, "2026.11b1"]) assert.equal(validPing({ ...ok, ha: bad }), null, String(bad));
  assert.equal(validPing({ ...ok, schema: 2 }).ha, null, "Schema 2: ha wird nicht gelesen");
  assert.equal(validPing({ ...ok, schema: 4 }), null);
  assert.equal((await post(env, "/v1/ping", ok)).status, 200);
  assert.equal(env.DB.raw.prepare("SELECT ha FROM installs WHERE id=?").get(ok.id).ha, "2026.11");
  console.log("Build-6-Eingang OK");
}

// ---------------------------------------------------------------- F1 Release-Reife
const G = (fp, o = {}) => ({ fp, src: "backend", mod: "Modul 1", kind: "TypeError", where: "x.py:1 f", msg: "m", first_day: day(20), last_day: today, status: "offen", fixed_in: null, issue: null, status_day: null, ...o });
function scenario() {
  const rel = [{ v: "2026.11.4.4", d: day(25) }, { v: "2026.11.4.5", d: day(10) }, { v: "2026.11.5b1", d: day(8) }, { v: "2026.11.5b2", d: day(4) }];
  const days = [], hits = [], ids = {};
  const add = (v, n, mods = "gr,ev") => { ids[v] = Array.from({ length: n }, () => ID()); for (const rid of ids[v]) days.push({ day: day(1), rid, version: v, channel: F.vcmp(v, "2026.11.5") < 0 && !/b\d+$/.test(v) ? "stable" : "beta", ha: "2026.11", mods }); };
  add("2026.11.4.4", 5); add("2026.11.4.5", 10); add("2026.11.5b1", 3); add("2026.11.5b2", 6, "gr");
  const hit = (fp, v, rid, d = 1) => hits.push({ day: day(d), fp, rid, version: v, channel: /b\d+$/.test(v) ? "beta" : "stable", ha: "2026.11", n: 1 });
  // Altfehler (seit 4.4): bei 2 von 10 auf 4.5, bei 1 von 6 auf b2, bei 3 von 5 auf 4.4
  ids["2026.11.4.5"].slice(0, 2).forEach((r) => hit("aaaaaaaaaaaa", "2026.11.4.5", r));
  hit("aaaaaaaaaaaa", "2026.11.5b2", ids["2026.11.5b2"][0]);
  ids["2026.11.4.4"].slice(0, 3).forEach((r) => hit("aaaaaaaaaaaa", "2026.11.4.4", r, 20));
  const groups = [G("aaaaaaaaaaaa", { mod: "Modul 8" })];
  return { rel, days, hits, ids, groups, hit };
}
const rows = (groups, hits) => F.errCompute(groups, hits, today, 30).rows;
{
  const S = scenario();
  let R6 = F.releaseReady(rows(S.groups, S.hits), S.hits, S.days, S.rel, today);
  const by = (R) => Object.fromEntries(R.list.map((x) => [x.v, x]));
  let v = by(R6);
  assert.deepEqual(R6.list.map((x) => x.v), ["2026.11.5b2", "2026.11.5b1", "2026.11.4.5", "2026.11.4.4"], "neueste zuerst");
  assert.equal(v["2026.11.5b2"].inst, 6); assert.equal(v["2026.11.5b2"].err, 1); assert.equal(Math.round(v["2026.11.5b2"].quote * 100), 17);
  assert.equal(v["2026.11.5b2"].live, 4); assert.equal(v["2026.11.5b2"].ref, "2026.11.4.5");
  assert.equal(v["2026.11.5b2"].amp, "bereit", v["2026.11.5b2"].why);
  assert.equal(v["2026.11.5b1"].amp, "abgelöst");
  assert.equal(v["2026.11.4.5"].amp, "gut"); assert.equal(Math.round(v["2026.11.4.5"].quote * 100), 20);
  assert.equal(v["2026.11.4.4"].amp, "Update empfehlen", "ältere stabile mit höherer Quote");
  assert.equal(R6.top.v, "2026.11.5b2"); assert.deepEqual(R6.hero.map((x) => x.v), ["2026.11.5b2", "2026.11.5b1", "2026.11.4.5"]);

  // Quote höher als die letzte stabile → abwarten
  S.ids["2026.11.5b2"].slice(1, 3).forEach((r) => S.hit("aaaaaaaaaaaa", "2026.11.5b2", r));
  v = by(F.releaseReady(rows(S.groups, S.hits), S.hits, S.days, S.rel, today));
  assert.equal(v["2026.11.5b2"].amp, "abwarten"); assert.ok(v["2026.11.5b2"].why.includes("höher als 11.4.5"), v["2026.11.5b2"].why);
  // ignorierte Fehler zählen nicht
  S.groups[0].status = "ignoriert";
  v = by(F.releaseReady(rows(S.groups, S.hits), S.hits, S.days, S.rel, today));
  assert.equal(v["2026.11.5b2"].err, 0); assert.equal(v["2026.11.5b2"].amp, "bereit");
  S.groups[0].status = "offen";

  // neuer offener Fehler in b2 → nicht freigeben; in Arbeit → abwarten
  const S2 = scenario();
  S2.groups.push(G("bbbbbbbbbbbb", { first_day: day(2), mod: "Modul 0" }));
  S2.hit("bbbbbbbbbbbb", "2026.11.5b2", S2.ids["2026.11.5b2"][5], 2);
  v = by(F.releaseReady(rows(S2.groups, S2.hits), S2.hits, S2.days, S2.rel, today));
  assert.equal(v["2026.11.5b2"].neu, 1); assert.equal(v["2026.11.5b2"].quiet, 2);
  assert.equal(v["2026.11.5b2"].amp, "nicht freigeben"); assert.ok(v["2026.11.5b2"].why.includes("neuer offener Fehler"));
  S2.groups[1].status = "arbeit";
  v = by(F.releaseReady(rows(S2.groups, S2.hits), S2.hits, S2.days, S2.rel, today));
  assert.equal(v["2026.11.5b2"].amp, "abwarten"); assert.ok(v["2026.11.5b2"].why.includes("in Arbeit"));
  // behoben in b2, aber in b2 wieder aufgetaucht → nicht freigeben
  S2.groups[1].status = "ignoriert";
  S2.groups[0].status = "behoben"; S2.groups[0].fixed_in = "2026.11.5b2";
  v = by(F.releaseReady(rows(S2.groups, S2.hits), S2.hits, S2.days, S2.rel, today));
  assert.equal(v["2026.11.5b2"].amp, "nicht freigeben"); assert.ok(v["2026.11.5b2"].why.includes("wieder da"));
  // neueste stabile mit Problem → Hotfix prüfen
  S2.groups[0].fixed_in = "2026.11.4.5";
  v = by(F.releaseReady(rows(S2.groups, S2.hits), S2.hits, S2.days.filter((d) => !d.version.includes("b")), S2.rel, today));
  assert.equal(v["2026.11.4.5"].amp, "Hotfix prüfen");

  // zu jung, zu wenige, ohne Tages-Meldungen
  const S3 = scenario();
  S3.rel.push({ v: "2026.11.5b3", d: day(1) });
  for (let i = 0; i < 6; i++) S3.days.push({ day: today, rid: ID(), version: "2026.11.5b3", channel: "beta", ha: "", mods: "" });
  v = by(F.releaseReady(rows(S3.groups, S3.hits), S3.hits, S3.days, S3.rel, today));
  assert.equal(v["2026.11.5b3"].amp, "abwarten"); assert.ok(v["2026.11.5b3"].why.includes("1 Tag live"));
  assert.equal(v["2026.11.5b2"].amp, "abgelöst");
  const S4 = scenario();
  v = by(F.releaseReady(rows(S4.groups, S4.hits), S4.hits, S4.days.filter((d) => d.version !== "2026.11.5b2" || d.rid === S4.ids["2026.11.5b2"][0]), S4.rel, today));
  assert.equal(v["2026.11.5b2"].amp, "abwarten"); assert.ok(v["2026.11.5b2"].why.includes("erst 1 Installationen"));
  const S5 = scenario();
  v = by(F.releaseReady(rows(S5.groups, S5.hits), S5.hits, S5.days.map((d) => ({ ...d, mods: null })), S5.rel, today));
  assert.equal(v["2026.11.4.5"].quote, null, "ohne Tages-Meldungen keine Quote");
  assert.equal(v["2026.11.5b2"].amp, "abwarten"); assert.ok(v["2026.11.5b2"].why.includes("Tages-Meldungen"));
  assert.ok(F.reifeHtml(F.releaseReady([], [], [], [], today)).includes("Noch keine Berichte"));
  const h = F.reifeHtml(F.releaseReady(rows(S.groups, S.hits), S.hits, S.days, S.rel, today));
  assert.ok(h.includes("Release-Reife") && h.includes("abgelöst") && h.includes("?ver=2026.11.5b2"));
  console.log("Build-6-Release-Reife OK");

  // ---------------------------------------------------------------- F4 Fehler je Modul
  const M = F.modErrors(rows(S.groups, S.hits), S.hits, S.days, today);
  const mb = Object.fromEntries(M.list.map((x) => [x.k, x]));
  assert.equal(M.base, 24);
  assert.deepEqual([mb.ev.on, mb.ev.aff], [18, 5], "Modul 8: 5 betroffene von 18 mit Wallbox an (b2-Nutzer haben ev aus)");
  assert.deepEqual([mb.gr.on, mb.gr.aff], [24, 0]);
  assert.ok(mb["Modul 1"].always && mb["Modul 1"].on === 24, "Modul 1 ist immer an");
  assert.ok(!mb.wx, "ohne Nutzer keine Zeile");
  assert.equal(M.list[0].k, "ev", "höchste Quote zuerst");
  assert.ok(F.modErrHtml(M).includes("5 von 18") && F.modErrHtml({ base: 0, list: [] }).includes("ab Build 6"));
  console.log("Build-6-Module OK");
}

// ---------------------------------------------------------------- V2 Home Assistant
{
  const act = [["a", "", "", "", "", "", "2026.11"], ["b", "", "", "", "", "", "2026.11"], ["c", "", "", "", "", "", "2026.10"], ["d", "", "", "", "", "", "2026.6"],
    ["e", "", "", "", "", "", null], ["f", "", "", "", "", "", "kaputt"]];
  const hs = haStats(act);
  assert.equal(hs.base, 4);
  assert.deepEqual(hs.rows, [["2026.11", 2, 50], ["2026.10", 1, 75], ["2026.6", 1, 100]], "neueste zuerst, „diese oder neuer“ kumuliert");
  assert.deepEqual(hs.min, { v: "2026.6", p: 100 });
  assert.deepEqual(haStats(act, 70).min, { v: "2026.10", p: 75 });
  assert.deepEqual(haStats([]), { base: 0, rows: [], min: null });
  assert.equal(compute([["x", today, today, "2026.11.5b1", "beta", "ev", "2026.11"]], [], today).ha.base, 1);
  console.log("Build-6-HA OK");
}

// ---------------------------------------------------------------- Dashboard
{
  const env = mkenv();
  for (let i = 0; i < 3; i++) assert.equal((await post(env, "/v1/errors", R(ID()))).status, 200);
  assert.equal((await post(env, "/v1/errors", R(ID(), { errors: [{ fp: "cccccccccccc", src: "backend", mod: "Modul 8", kind: "TypeError", where: "wallbox.py:1 f", msg: "x", n: 2, first: today, last: today, vers: ["2026.11.5b1"] }] }))).status, 200);
  await post(env, "/v1/ping", { schema: 3, id: ID(), version: "2026.11.5b1", channel: "beta", modules: ["ev"], ha: "2026.11" });
  const fl = await (await dget(env, "/fehler")).text();
  assert.ok(fl.includes("Release-Reife") && fl.includes("1 von 4 Installationen mit Fehler") && fl.includes("Fehler je Modul") && fl.includes("1 von 4"));
  assert.ok(fl.includes("Beta 11.5b1 · nicht freigeben"), "Ampel im Wochenblick (neuer offener Fehler)");
  assert.ok(fl.indexOf("Release-Reife") < fl.indexOf("Fehler · letzte"), "Release-Reife oben");
  assert.ok(!(await (await dget(env, "/fehler?ver=2026.11.5b1")).text()).includes("Release-Reife"), "im Versions-Filter nur die Liste");
  const home = await (await dget(env, "/")).text();
  assert.ok(home.includes("Home Assistant") && home.includes("100 % auf 2026.11 oder neuer") && home.includes("· nicht freigeben"));
  console.log("Build-6-Dashboard OK");
}

// ---------------------------------------------------------------- Build 7 · F3 Rückmeldung
{
  const env = mkenv(), id = ID(), other = ID();
  const E = (fp) => ({ fp, src: "backend", mod: "Modul 1", kind: "TypeError", where: "a.py:1 f", msg: "m", n: 1, first: today, last: today, vers: ["2026.11.5b1"] });
  assert.equal((await post(env, "/v1/errors", R(other, { errors: [E("111111111111"), E("222222222222"), E("333333333333"), E("444444444444")] }))).status, 200);
  const st = (fp, s, fx = null) => env.DB.raw.prepare("UPDATE err_groups SET status=?, fixed_in=? WHERE fp=?").run(s, fx, fp);
  st("111111111111", "behoben", "2026.11.5b2"); st("222222222222", "arbeit"); st("333333333333", "ignoriert"); st("444444444444", "behoben");
  assert.equal(F.validErrors(R(id, { schema: 3, known: ["xyz"] })), null);
  assert.equal(F.validErrors(R(id, { schema: 3, known: Array.from({ length: 201 }, () => "111111111111") })), null);
  assert.deepEqual(F.validErrors(R(id, { schema: 3, known: ["111111111111", "111111111111"] })).known, ["111111111111"]);
  const res = await post(env, "/v1/errors", R(id, { schema: 3, errors: [E("222222222222")], known: ["111111111111", "333333333333", "444444444444", "999999999999"] }));
  assert.equal(res.status, 200);
  const j = await res.json();
  assert.deepEqual(j.status, { "111111111111": { s: "behoben", fx: "2026.11.5b2" }, "222222222222": { s: "arbeit" }, "444444444444": { s: "offen" } },
    "nur eigene Fehler, ignoriert und unbekannt fehlen, „behoben“ ohne Version zählt als offen");
  assert.equal(env.DB.raw.prepare("SELECT COUNT(*) n FROM err_groups WHERE fp='999999999999'").get().n, 0, "known legt nichts an");
  const old = await (await post(env, "/v1/errors", R(ID()))).json();
  assert.ok(!("status" in old), "Schema 2 bekommt keine Rückmeldung");
  console.log("Build-7-Rückmeldung OK");
}
