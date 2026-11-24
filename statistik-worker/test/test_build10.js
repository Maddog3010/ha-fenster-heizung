// Build 10: Langzeit-Verlauf, Verloren nach Update, Treue neuer Installationen, Export als CSV
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync, createSign } from "node:crypto";
import worker, { DASH } from "../src/worker.js";
import * as Z from "../src/langzeit.js";
import { shim } from "./d1shim.js";

const schema = readFileSync(new URL("../schema.sql", import.meta.url), "utf8");
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "k1", alg: "RS256", use: "sig" };
const b = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const tok = (() => { const h = b({ alg: "RS256", kid: "k1" }), p = b({ aud: ["aud123"], iss: "https://t.cloudflareaccess.com", exp: Math.floor(Date.now() / 1000) + 600 }); return `${h}.${p}.${createSign("RSA-SHA256").update(h + "." + p).sign(privateKey).toString("base64url")}`; })();
const realFetch = globalThis.fetch;
globalThis.fetch = async (u, ...a) => (String(u).includes("cloudflareaccess.com/cdn-cgi/access/certs") ? new Response(JSON.stringify({ keys: [jwk] })) : realFetch(u, ...a));
const mkenv = (sql = schema) => { const DB = shim(); DB.exec(sql); return { DB, INGEST_HOST: "stats.x.dev", DASH_HOST: "dash.x.dev", RETENTION_DAYS: "180", TEAM_DOMAIN: "t.cloudflareaccess.com", POLICY_AUD: "aud123" }; };
const dget = (env, path, t = tok) => worker.fetch(new Request(`https://dash.x.dev${path}`, { headers: t ? { "cf-access-jwt-assertion": t } : {} }), env);
const today = new Date().toISOString().slice(0, 10), day = (n) => new Date(Date.parse(today) - n * 864e5).toISOString().slice(0, 10);
const ID = () => crypto.randomUUID();
assert.equal(DASH.build, 10);

// ---------------------------------------------------------------- S4 Verloren nach Update
{
  const d = [], add = (id, v, from, to) => { for (let k = from; k >= to; k--) d.push({ day: day(k), id, version: v }); };
  add("a", "2026.11.4.4", 30, 21); add("a", "2026.11.4.5", 20, 0);             // aktualisiert, bleibt
  add("b", "2026.11.4.4", 30, 21); add("b", "2026.11.4.5", 20, 18);            // aktualisiert, nach 2 Tagen still → verloren
  add("c", "2026.11.4.4", 30, 21); add("c", "2026.11.4.5", 20, 10);            // 10 Tage danach still → nicht verloren
  add("d", "2026.11.4.5", 30, 25); add("d", "2026.11.4.4", 24, 20);            // zurück auf ältere Version: kein Update
  add("e", "2026.11.4.5", 10, 9); add("e", "2026.11.5b1", 3, 3);               // jünger als 7 Tage: offen
  add("f", "2026.11.5b1", 5, 0);                                                // neu auf 5b1: kein Update
  const L = Z.lostAfterUpdate(d, today);
  const v45 = L.find((x) => x.v === "2026.11.4.5"), b1 = L.find((x) => x.v === "2026.11.5b1");
  assert.deepEqual([v45.upd, v45.lost, v45.open], [3, 1, 0]); assert.equal(Math.round(v45.q * 100), 33);
  assert.deepEqual([b1.upd, b1.lost, b1.open, b1.q], [0, 0, 1, null]);
  assert.ok(!L.some((x) => x.v === "2026.11.4.4"), "Rückschritt zählt nicht");
  assert.deepEqual(L.map((x) => x.v), ["2026.11.5b1", "2026.11.4.5"], "neueste zuerst");
  const h = Z.lostHtml(L);
  assert.ok(h.includes("33 %") && h.includes("+1") && h.includes("/version/2026.11.4.5"));
  assert.ok(Z.lostHtml([]).includes("Noch keine Updates"));
  console.log("Build-10-Verloren OK");
}

// ---------------------------------------------------------------- S6 Treue
{
  const ins = [{ first_day: day(63), last_day: today }, { first_day: day(63), last_day: day(40) }, { first_day: day(63), last_day: day(60) },
    { first_day: day(10), last_day: today }, { first_day: day(9), last_day: day(5) }, { first_day: day(1), last_day: today }];
  const C = Z.cohorts(ins, today, 12);
  const full = C.rows.find((x) => x.n === 3), mid = C.rows.find((x) => x.week <= day(9) && x.week > day(17) && x.n);
  assert.deepEqual(full.ret.map((q) => Math.round(q * 100)), [67, 33, 33]);
  assert.equal(mid.ret[1], null, "4 Wochen noch nicht erreicht");
  assert.equal(C.rows[0].week <= today, true); assert.ok(C.rows.length >= 10);
  const h = Z.cohortHtml(C);
  assert.ok(h.includes("67 %") && h.includes("33 %") && h.includes("8 Wochen"));
  console.log("Build-10-Treue OK");
}

// ---------------------------------------------------------------- S3 Langzeit: Nachrechnen, Tageswert, Aufräumen, Darstellung
{
  const env = mkenv();
  const ids = Array.from({ length: 6 }, ID);
  ids.forEach((id, i) => {
    const v = i < 2 ? "2026.11.5b1" : "2026.11.4.5", from = i < 3 ? 40 : 12;
    env.DB.raw.prepare("INSERT INTO installs VALUES(?,?,?,?,?,?,?,?)").run(id, day(from), today, v, /b/.test(v) ? "beta" : "stable", 0, "ev", "2026.11");
    for (let k = from; k >= 0; k--) env.DB.raw.prepare("INSERT INTO daily VALUES(?,?,?,?)").run(day(k), id, v, /b/.test(v) ? "beta" : "stable");
  });
  const bf = Z.backfill((await env.DB.prepare("SELECT day, id, version FROM daily").all()).results, today);
  assert.equal(bf[0].day, day(40)); assert.equal(bf.at(-1).day, day(1)); assert.equal(bf.length, 40);
  assert.deepEqual([bf.at(-1).a30, bf.at(-1).beta], [6, 2]); assert.equal(bf.find((x) => x.day === day(20)).a30, 3);
  assert.ok(bf.every((x) => x.src === "r" && x.quote === null));
  let h = await (await dget(env, "/")).text();   // Startseite schreibt den Tageswert und rechnet beim ersten Mal nach
  assert.equal(env.DB.raw.prepare("SELECT COUNT(*) n FROM snap").get().n, 41);
  const t = env.DB.raw.prepare("SELECT * FROM snap WHERE day=?").get(today);
  assert.deepEqual([t.a30, t.beta, t.newest, t.src], [6, 2, "2026.11.5b1", "t"]);
  assert.ok(h.includes("Langzeit-Verlauf") && h.includes("40 Tage nachgerechnet") && h.includes("<path") && h.includes("Verloren nach Update") && h.includes("Treue neuer Installationen"));
  assert.ok(h.includes(`Dashboard Build ${DASH.build}`));
  await dget(env, "/");
  assert.equal(env.DB.raw.prepare("SELECT COUNT(*) n FROM snap").get().n, 41, "zweiter Aufruf: kein Duplikat");
  env.DB.raw.prepare("INSERT INTO snap(day,a30,src) VALUES(?,?,?)").run(day(800), 1, "t");
  await worker.scheduled({}, env, { waitUntil: (p) => p }).catch(() => {});
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(env.DB.raw.prepare("SELECT COUNT(*) n FROM snap WHERE day=?").get(day(800)).n, 0, "älter als 2 Jahre gelöscht");
  // Darstellung: zu wenig Daten, ohne Tabelle
  assert.ok(Z.langzeitHtml([{ day: today, a30: 1, beta: 0 }], []).includes("Sammelt ab heute"));
  assert.ok(Z.langzeitHtml(null, []).includes("migrate-build10.sql"));
  const old = mkenv(schema.replace(/-- Build 10[\s\S]*$/, ""));
  assert.equal((await dget(old, "/")).status, 200, "ohne Tabelle läuft die Startseite");
  assert.ok((await (await dget(old, "/")).text()).includes("migrate-build10.sql"));
  console.log("Build-10-Langzeit OK");

  // ---------------------------------------------------------------- S10 Export
  for (const n of Z.EXPORTS) {
    const res = await dget(env, `/export/${n}.csv`);
    assert.equal(res.status, 200, n);
    assert.ok(res.headers.get("content-type").startsWith("text/csv") && res.headers.get("content-disposition").includes(`stromwaerme-${n}-`), n);
    const by = new Uint8Array(await res.arrayBuffer()), txt = new TextDecoder().decode(by);
    assert.ok(by[0] === 0xef && by[1] === 0xbb && by[2] === 0xbf, `${n}: BOM für Excel`);
    assert.ok(txt.split("\r\n")[0].includes(";"), n);
  }
  const vcsv = await (await dget(env, "/export/versionen.csv")).text();
  assert.ok(vcsv.includes("2026.11.4.5;Stabil;4;66,7") && vcsv.includes("2026.11.5b1;Beta;2;33,3"), vcsv);
  const lz = await (await dget(env, "/export/verlauf.csv")).text();
  assert.ok(lz.includes("nachgerechnet") && lz.includes(`${today};6;6;2;2026.11.5b1`));
  assert.equal((await dget(env, "/export/geheim.csv")).status, 404);
  assert.equal((await dget(env, "/export/versionen.csv", null)).status, 403, "nur hinter Access");
  assert.equal(Z.csv(["a", "b"], [['x;"y"', 1.5]]), '﻿a;b\r\n"x;""y""";1,5\r\n');
  assert.ok((await (await dget(env, "/fehler")).text()).includes("/export/fehler.csv"));
  console.log("Build-10-Export OK");
}
