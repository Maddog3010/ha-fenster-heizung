// Build 9: Dashboard-Version im Banner, Release-Bericht je Version, fehlerfreie Tage, Home Assistant × Version
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync, createSign } from "node:crypto";
import worker, { DASH } from "../src/worker.js";
import * as F from "../src/fehler.js";
import { shim } from "./d1shim.js";

const schema = readFileSync(new URL("../schema.sql", import.meta.url), "utf8");
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "k1", alg: "RS256", use: "sig" };
const b = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const tok = (() => { const h = b({ alg: "RS256", kid: "k1" }), p = b({ aud: ["aud123"], iss: "https://t.cloudflareaccess.com", exp: Math.floor(Date.now() / 1000) + 600 }); return `${h}.${p}.${createSign("RSA-SHA256").update(h + "." + p).sign(privateKey).toString("base64url")}`; })();
const realFetch = globalThis.fetch;
globalThis.fetch = async (u, ...a) => (String(u).includes("cloudflareaccess.com/cdn-cgi/access/certs") ? new Response(JSON.stringify({ keys: [jwk] })) : realFetch(u, ...a));
const DB = shim(); DB.exec(schema);
const env = { DB, INGEST_HOST: "stats.x.dev", DASH_HOST: "dash.x.dev", RETENTION_DAYS: "180", TEAM_DOMAIN: "t.cloudflareaccess.com", POLICY_AUD: "aud123" };
const dget = (path, t = tok) => worker.fetch(new Request(`https://dash.x.dev${path}`, { headers: t ? { "cf-access-jwt-assertion": t } : {} }), env);
const today = new Date().toISOString().slice(0, 10), day = (n) => new Date(Date.parse(today) - n * 864e5).toISOString().slice(0, 10);
const ID = () => crypto.randomUUID();

// ---------------------------------------------------------------- Banner und /health
assert.ok(DASH.build >= 9);
const hj = await (await worker.fetch(new Request("https://stats.x.dev/health"), env)).json();
assert.deepEqual(hj, { ok: true, build: DASH.build, date: DASH.date });
assert.ok((await (await dget("/")).text()).includes(`Dashboard Build ${DASH.build} · ${DASH.date.slice(8, 10)}.`), "Banner Versionen");
assert.ok((await (await dget("/fehler")).text()).includes(`Dashboard Build ${DASH.build}`), "Banner Fehler");
console.log("Build-9-Banner OK");

// ---------------------------------------------------------------- Daten: 4.5 stabil (10), 5b1 Beta (6), HA 2026.10/2026.11
const ins = (v, rid, ha, d = 1) => {
  DB.raw.prepare("INSERT OR REPLACE INTO installs VALUES(?,?,?,?,?,?,?,?)").run(rid, day(20), day(d), v, /b\d+$/.test(v) ? "beta" : "stable", 0, "ev", ha.slice(0, 7));
  for (let k = d; k <= d + 3; k++) {
    DB.raw.prepare("INSERT OR REPLACE INTO daily(day, id, version, channel) VALUES(?,?,?,?)").run(day(k), rid, v, /b\d+$/.test(v) ? "beta" : "stable");
    DB.raw.prepare("INSERT OR REPLACE INTO err_days VALUES(?,?,?,?,?,?)").run(day(k), rid, v, /b\d+$/.test(v) ? "beta" : "stable", ha, "ev");
  }
};
const S45 = Array.from({ length: 10 }, ID), B1 = Array.from({ length: 6 }, ID);
S45.forEach((r, i) => ins("2026.11.4.5", r, i < 5 ? "2026.11.3" : "2026.10.2"));
B1.forEach((r, i) => ins("2026.11.5b1", r, i < 4 ? "2026.11.3" : "2026.10.1"));
const grp = (fp, o = {}) => DB.raw.prepare("INSERT INTO err_groups(fp,src,mod,kind,where_,msg,first_day,last_day,status,fixed_in) VALUES(?,?,?,?,?,?,?,?,?,?)")
  .run(fp, "backend", o.mod || "Modul 9", o.kind || "TimeoutError", "w.py:1 f", o.msg || "m", o.first || day(15), today, o.status || "offen", o.fixed || null);
const hit = (fp, v, rid, d = 1) => DB.raw.prepare("INSERT OR REPLACE INTO err_hits(day, fp, rid, version, channel, ha, n) VALUES(?,?,?,?,?,?,?)").run(day(d), fp, rid, v, /b\d+$/.test(v) ? "beta" : "stable", "2026.11.3", 1);
grp("aaaaaaaaaaaa", { status: "behoben", fixed: "2026.11.5b1" });
grp("bbbbbbbbbbbb", { kind: "TypeError", msg: "neu", first: day(2), mod: "Modul 18" });
hit("aaaaaaaaaaaa", "2026.11.4.5", S45[0], 1); hit("aaaaaaaaaaaa", "2026.11.4.5", S45[0], 2); hit("aaaaaaaaaaaa", "2026.11.4.5", S45[5], 1);
hit("bbbbbbbbbbbb", "2026.11.5b1", B1[0], 2);

// ---------------------------------------------------------------- S2 fehlerfreie Tage
const er = await F.errLoad(DB, today, 30);
const v45 = er.reife.list.find((x) => x.v === "2026.11.4.5"), vb1 = er.reife.list.find((x) => x.v === "2026.11.5b1");
assert.equal(v45.useDays, 40); assert.equal(v45.errDays, 3); assert.equal(F.pc1(v45.clean), "92,5 %");
assert.equal(vb1.useDays, 24); assert.equal(vb1.errDays, 1);
assert.ok(F.reifeHtml(er.reife).includes("fehlerfreie Tage") && F.reifeHtml(er.reife).includes("/version/2026.11.5b1"));
// schlechtere fehlerfreie Tage halten die Ampel auf „abwarten“, auch wenn die Quote gleich ist
const S = { rows: [], hits: [], days: [] }, mk = (v, rid, d) => S.days.push({ day: day(d), rid, version: v, channel: /b\d+$/.test(v) ? "beta" : "stable", ha: "", mods: "" });
const st = Array.from({ length: 5 }, ID), be = Array.from({ length: 5 }, ID);
for (let d = 1; d <= 10; d++) { st.forEach((r) => mk("2026.11.4.5", r, d)); be.forEach((r) => mk("2026.11.5b1", r, d)); }
S.hits.push({ day: day(1), fp: "c", rid: st[0], version: "2026.11.4.5", n: 1 });
for (let d = 1; d <= 6; d++) S.hits.push({ day: day(d), fp: "c", rid: be[0], version: "2026.11.5b1", n: 1 });
S.rows.push({ fp: "c", status: "offen", first_ver: "2026.11.4.4", first_day: day(30) });
const rel = [{ v: "2026.11.4.5", d: day(20) }, { v: "2026.11.5b1", d: day(10) }];
const x = F.releaseReady(S.rows, S.hits, S.days, rel, today).list.find((y) => y.v === "2026.11.5b1");
assert.equal(x.quote, 0.2); assert.equal(x.amp, "abwarten"); assert.ok(x.why.includes("fehlerfreie Tage"), x.why);
console.log("Build-9-fehlerfreie-Tage OK");

// ---------------------------------------------------------------- S5 Home Assistant × Version
const M = F.haMatrix(er.rows, (await DB.prepare("SELECT * FROM err_hits").all()).results, (await DB.prepare("SELECT * FROM err_days").all()).results, today);
assert.deepEqual(M.vers, ["2026.11.5b1", "2026.11.4.5"]); assert.deepEqual(M.has, ["2026.11", "2026.10"]);
assert.deepEqual(M.cells[0][0], { n: 4, err: 1, q: 0.25 }); assert.deepEqual(M.cells[1][0], { n: 2, err: 0, q: null }, "unter 3 Installationen keine Quote");
assert.deepEqual(M.cells[0][1], { n: 5, err: 1, q: 0.2 }); assert.deepEqual(M.cells[1][1], { n: 5, err: 1, q: 0.2 });
const mh = F.haMatrixHtml(M);
assert.ok(mh.includes("25 %") && mh.includes("(2)") && mh.includes("/version/2026.11.5b1"));
assert.ok(F.haMatrixHtml({ vers: [], has: [], cells: [] }).includes("ab 2026.11.5b1"));
assert.ok((await (await dget("/fehler")).text()).includes("Home Assistant × Version"));
console.log("Build-9-HA×Version OK");

// ---------------------------------------------------------------- S1 Release-Bericht
let h = await (await dget("/version/2026.11.5b1")).text();
for (const t of ["2026.11.5b1", "Beta", "Fehlerquote", "17 %", "Fehlerfreie Tage", "Neu in dieser Version", "TypeError:", "In dieser Version behoben", "TimeoutError:", "Verbreitung", "Home Assistant", "2026.11", "neueste Version", `Dashboard Build ${DASH.build}`])
  assert.ok(h.includes(t), t);
h = await (await dget("/version/2026.11.4.5")).text();
assert.ok(h.includes("Stabil") && h.includes("neuere Versionen") && h.includes("/version/2026.11.5b1") && h.includes("Noch kein Fehler als behoben"));
assert.equal((await dget("/version/2026.11.9")).status, 404, "unbekannte Version");
assert.equal((await dget("/version/abc")).status, 404);
assert.equal((await dget("/version/2026.11.5b1", null)).status, 403, "nur hinter Access");
const home = await (await dget("/")).text();
assert.ok(home.includes('<a href="/version/2026.11.4.5">'), "Versionen aktuell verlinkt");
assert.ok((await (await dget("/fehler")).text()).includes('href="/version/2026.11.5b1"'), "Wochenblick und Reife verlinkt");
console.log("Build-9-Release-Bericht OK");
