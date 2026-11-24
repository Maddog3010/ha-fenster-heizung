// Build 11: Modul-Nutzung im Verlauf (Module in der Tagesliste)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync, createSign } from "node:crypto";
import worker, { DASH, MODULES } from "../src/worker.js";
import * as Z from "../src/langzeit.js";
import { shim } from "./d1shim.js";

const schema = readFileSync(new URL("../schema.sql", import.meta.url), "utf8");
const migrate = readFileSync(new URL("../migrate-build11.sql", import.meta.url), "utf8");
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "k1", alg: "RS256", use: "sig" };
const b = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const tok = (() => { const h = b({ alg: "RS256", kid: "k1" }), p = b({ aud: ["aud123"], iss: "https://t.cloudflareaccess.com", exp: Math.floor(Date.now() / 1000) + 600 }); return `${h}.${p}.${createSign("RSA-SHA256").update(h + "." + p).sign(privateKey).toString("base64url")}`; })();
const realFetch = globalThis.fetch;
globalThis.fetch = async (u, ...a) => (String(u).includes("cloudflareaccess.com/cdn-cgi/access/certs") ? new Response(JSON.stringify({ keys: [jwk] })) : realFetch(u, ...a));
const mkenv = (sql = schema) => { const DB = shim(); DB.exec(sql); return { DB, INGEST_HOST: "stats.x.dev", DASH_HOST: "dash.x.dev", RETENTION_DAYS: "180", TEAM_DOMAIN: "t.cloudflareaccess.com", POLICY_AUD: "aud123" }; };
const post = (env, body) => worker.fetch(new Request("https://stats.x.dev/v1/ping", { method: "POST", body: JSON.stringify(body) }), env);
const dget = (env, path) => worker.fetch(new Request(`https://dash.x.dev${path}`, { headers: { "cf-access-jwt-assertion": tok } }), env);
const today = new Date().toISOString().slice(0, 10), day = (n) => new Date(Date.parse(today) - n * 864e5).toISOString().slice(0, 10);
const ID = () => crypto.randomUUID();
assert.equal(DASH.build, 11);
const P = (o) => ({ schema: 3, id: ID(), version: "2026.11.5b2", channel: "beta", modules: ["ev", "wx"], ha: "2026.11", ...o });

// Eingang: Module landen in der Tagesliste
{
  const env = mkenv(), p = P();
  assert.equal((await post(env, p)).status, 200);
  assert.equal(env.DB.raw.prepare("SELECT modules FROM daily WHERE id=?").get(p.id).modules, "ev,wx");
  const p1 = P({ schema: 1, modules: undefined, ha: undefined, version: "2026.11.4.5", channel: "stable" });
  assert.equal((await post(env, p1)).status, 200);
  assert.equal(env.DB.raw.prepare("SELECT modules FROM daily WHERE id=?").get(p1.id).modules, null, "Schema 1 ohne Module");
}
// Vor der Migration: Meldungen klappen weiter, Karte zeigt Hinweis; Migration ergänzt die Spalte
{
  const oldSchema = schema.replace("  modules TEXT, PRIMARY KEY(day, id));", "  PRIMARY KEY(day, id));");
  assert.notEqual(oldSchema, schema);
  const env = mkenv(oldSchema), p = P();
  assert.equal((await post(env, p)).status, 200, "Meldung scheitert nie an der fehlenden Spalte");
  assert.equal(env.DB.raw.prepare("SELECT COUNT(*) n FROM installs WHERE id=?").get(p.id).n, 1);
  assert.equal(env.DB.raw.prepare("SELECT COUNT(*) n FROM daily WHERE id=?").get(p.id).n, 1);
  assert.ok((await (await dget(env, "/")).text()).includes("migrate-build11.sql"));
  env.DB.exec(migrate);
  assert.ok(env.DB.raw.prepare("PRAGMA table_info(daily)").all().some((c) => c.name === "modules"));
}
// Wochenwerte: letzte Meldung je Woche zählt, Veränderung über 4 Wochen
{
  const rows = [];
  for (let w = 0; w < 12; w++) for (let i = 0; i < 10; i++) rows.push({ day: day(w * 7), id: "i" + i, modules: ["en", i < 2 + Math.floor(w < 4 ? 6 : 0) ? "wx" : "", i < 5 ? "ev" : ""].filter(Boolean).join(",") });
  rows.push({ day: day(0), id: "i9", modules: "en" }, { day: day(1), id: "i9", modules: "en,wx,ev" });   // gleiche Woche: neuere Meldung zählt
  const T = Z.modTrend(rows, today, MODULES);
  const m = Object.fromEntries(T.mods.map((x) => [x.k, x]));
  assert.equal(m.en.now, 1); assert.ok(m.wx && m.ev);
  assert.equal(m.ww.now, 0); assert.ok(Z.modTrendHtml(T).includes("nirgends eingeschaltet: 2 Warmwasser"), "Module ohne Nutzer in einer Zeile");
  assert.equal(T.weeks.length, 12); assert.equal(T.filled, 12);
  const liNow = m.wx.now, liAgo = m.wx.pts[m.wx.pts.length - 5];
  assert.ok(liNow > liAgo && Math.abs(m.wx.delta - (liNow - liAgo)) < 1e-9, "Modul 9 wird mehr genutzt");
  assert.equal(T.mods[0].k, "en", "höchster Anteil zuerst");
  const h = Z.modTrendHtml(T);
  assert.ok(h.includes("Modul-Nutzung im Verlauf") && h.includes("<polyline") && h.includes("+"));
  assert.ok(Z.modTrendHtml(null).includes("migrate-build11.sql"));
  assert.ok(Z.modTrendHtml(Z.modTrend([], today, MODULES)).includes("Sammelt ab heute"));
  const one = Z.modTrend([{ day: today, id: "a", modules: "ev" }], today, MODULES);
  assert.ok(Z.modTrendHtml(one).includes("erst 1 Woche gesammelt"));
}
// Dashboard und Export
{
  const env = mkenv();
  for (let i = 0; i < 4; i++) await post(env, P({ modules: i < 3 ? ["ev"] : ["ev", "wx"] }));
  const h = await (await dget(env, "/")).text();
  assert.ok(h.includes("Modul-Nutzung im Verlauf") && h.includes("8 E-Auto") && h.includes("100 %") && h.includes("25 %"));
  const c = new TextDecoder().decode(await (await dget(env, "/export/modulverlauf.csv")).arrayBuffer());
  assert.ok(c.split("\r\n")[0].includes("Woche ab") && c.includes("8 E-Auto;") && c.includes(";100"));
}
console.log("Build-11-Tests OK");
