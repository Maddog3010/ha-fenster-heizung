// Strom & Wärme – Support-Vermittler (Cloudflare Worker)
//
// Verbindet den Support-Chat im Panel mit deinem Telegram-Bot:
//   Integration → POST /send  → Nachricht landet in deinem Telegram
//   Du antwortest in Telegram (Wischen → Antworten) → Telegram ruft POST /tg auf → Antwort wird abgelegt
//   Integration → POST /poll  → holt deine Antworten ab
//
// Einstellungen im Worker (Settings → Variables):
//   BOT_TOKEN      Token vom @BotFather (als Secret)
//   ADMIN_CHAT_ID  deine Telegram-Chat-ID (schickt dir der Bot auf /start)
//   TG_SECRET      beliebiges langes Passwort (als Secret), schützt /tg und /setup
// KV-Namespace mit der Bindung CHAT.
//
// Der Chat ist für alle da. Bei jeder Nachricht wird geprüft, ob ein Sponsoring besteht – mit demselben
// öffentlichen Schlüssel wie in der Integration (sponsor.py) bzw. direkt bei GitHub. Sponsor Max ist als
// „bevorzugt“ markiert, Sponsoren mit ♥, alle anderen als „Nutzer“ (mit engerer Mengen-Grenze).

const PUBLIC_KEY = "Ec624NzE6Y_YndUW4UbMOy3wYiIaNDTa_6URg33a_6Y";
const REVOKED_URL = "https://raw.githubusercontent.com/Maddog3010/ha-fenster-heizung/main/sponsor_gesperrt.json";
const GH_OWNER = "Maddog3010";
const GH_MAX_TIERS = ["$3 a month", "$10 one time"];
const MAX_AB_MONAT = 3, MAX_AB_EINMALIG = 10;
const MAX_CONV = 200, MAX_TEXT = 2000, RATE_PER_HOUR = 30, RATE_FREE_PER_HOUR = 10, RATE_FREE_PER_DAY = 30;
const KEEP_DAYS = 180;

const J = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8" } });
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const b64d = (s) => { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); };
const today = () => new Date().toISOString().slice(0, 10);
const addMonths = (iso, n) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCMonth(d.getUTCMonth() + n); return d.toISOString().slice(0, 10); };
const addYear = (iso) => addMonths(iso, 12);
const TTL = KEEP_DAYS * 86400;

async function sha256(s) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifySig(raw, sig) {
  const key = await crypto.subtle.importKey("raw", b64d(PUBLIC_KEY), { name: "Ed25519" }, false, ["verify"]);
  return crypto.subtle.verify({ name: "Ed25519" }, key, b64d(sig), raw);
}

async function revokedIds() {
  try {
    const r = await fetch(REVOKED_URL, { cf: { cacheTtl: 3600, cacheEverything: true } });
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d.gesperrt) ? d.gesperrt.map(String) : [];
  } catch (_) { return []; }
}

// ---------------------------------------------------------------- Sponsoring prüfen
async function checkProof(p, inst) {
  if (!p || typeof p !== "object") return null;
  const t = today();
  if (p.kind === "key" && typeof p.key === "string" && p.key.startsWith("FH1-") && p.key.length <= 600) {
    const [body, sig] = p.key.slice(4).split(".");
    if (!body || !sig) return null;
    const raw = b64d(body);
    if (!(await verifySig(raw, sig))) return null;
    let d; try { d = JSON.parse(new TextDecoder().decode(raw)); } catch (_) { return null; }
    if ((await revokedIds()).includes(String(d.i))) return null;
    const stufe = d.s === "max" ? "max" : "sponsor";
    if (d.b >= t) return { name: String(d.n || "Sponsor").slice(0, 40), tier: stufe, via: "Schlüssel #" + d.i };
    if (stufe === "max" && d.sb && d.sb >= t) return { name: String(d.n || "Sponsor").slice(0, 40), tier: "sponsor", via: "Schlüssel #" + d.i };
    return null;
  }
  if (p.kind === "github" && typeof p.token === "string" && p.token.length < 300) {
    const q = `query($o:String!){viewer{login}user(login:$o){sponsorshipForViewerAsSponsor(activeOnly:false){createdAt isOneTimePayment isActive tier{name isOneTime isCustomAmount monthlyPriceInDollars}}}}`;
    const r = await fetch("https://api.github.com/graphql", {
      method: "POST", headers: { authorization: "Bearer " + p.token, "content-type": "application/json", "user-agent": "strom-waerme-support" },
      body: JSON.stringify({ query: q, variables: { o: GH_OWNER } }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    const login = d?.data?.viewer?.login, sp = d?.data?.user?.sponsorshipForViewerAsSponsor;
    if (!login || !sp) return null;
    const tier = sp.tier || {}, price = Number(tier.monthlyPriceInDollars || 0), created = String(sp.createdAt || "").slice(0, 10);
    const oneTime = !!(sp.isOneTimePayment || tier.isOneTime);
    const named = GH_MAX_TIERS.includes(String(tier.name || ""));
    if (oneTime) {
      if (!created || addYear(created) < t) return null;
      const isMax = (named || price >= MAX_AB_EINMALIG) && addMonths(created, 3) >= t;
      return { name: login, tier: isMax ? "max" : "sponsor", via: "GitHub" };
    }
    if (!sp.isActive) return null;
    return { name: login, tier: named || price >= MAX_AB_MONAT ? "max" : "sponsor", via: "GitHub" };
  }
  if (p.kind === "dev" && typeof p.sig === "string" && typeof p.day === "string") {
    const diff = Math.abs(new Date(p.day + "T12:00:00Z") - new Date(t + "T12:00:00Z")) / 86400000;
    if (diff > 1) return null;
    if (!(await verifySig(new TextEncoder().encode(`chat:${inst}:${p.day}`), p.sig))) return null;
    return { name: "Entwickler (Test)", tier: "max", via: "Entwickler" };
  }
  return null;
}

// ---------------------------------------------------------------- Telegram
async function tg(env, method, body) {
  const isForm = body instanceof FormData;
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST", body: isForm ? body : JSON.stringify(body), headers: isForm ? {} : { "content-type": "application/json" },
  });
  return r.json().catch(() => ({ ok: false }));
}

// ---------------------------------------------------------------- Ablage
async function loadInst(env, inst) { const v = await env.CHAT.get("inst:" + inst); return v ? JSON.parse(v) : null; }
async function saveInst(env, inst, o) { await env.CHAT.put("inst:" + inst, JSON.stringify(o), { expirationTtl: TTL }); }
async function loadConv(env, inst) { const v = await env.CHAT.get("conv:" + inst); return v ? JSON.parse(v) : []; }
async function saveConv(env, inst, c) { await env.CHAT.put("conv:" + inst, JSON.stringify(c.slice(-MAX_CONV)), { expirationTtl: TTL }); }

async function auth(env, b) {
  if (!b || !/^[0-9a-f]{16}$/.test(String(b.inst || "")) || typeof b.secret !== "string" || b.secret.length < 20) return [null, J({ ok: false, error: "bad_request" }, 400)];
  const rec = await loadInst(env, b.inst), h = await sha256(b.secret);
  if (rec && rec.h !== h) return [null, J({ ok: false, error: "forbidden" }, 403)];
  return [rec || { h, created: Date.now() }, null];
}

// ---------------------------------------------------------------- Endpunkte
async function onSend(env, b) {
  const [rec, err] = await auth(env, b);
  if (err) return err;
  const text = String(b.text || "").trim().slice(0, MAX_TEXT);
  if (!text) return J({ ok: false, error: "empty" }, 400);
  const who = (await checkProof(b.proof, b.inst)) || { name: "Nutzer", tier: "free", via: "ohne Sponsoring" };
  const free = who.tier === "free";
  const hour = Math.floor(Date.now() / 3600000), day = today(), rk = `rl:${b.inst}:${hour}`, dk = `rd:${b.inst}:${day}`;
  const n = Number((await env.CHAT.get(rk)) || 0), nd = Number((await env.CHAT.get(dk)) || 0);
  if (n >= (free ? RATE_FREE_PER_HOUR : RATE_PER_HOUR) || (free && nd >= RATE_FREE_PER_DAY)) return J({ ok: false, error: "too_many" }, 429);
  await env.CHAT.put(rk, String(n + 1), { expirationTtl: 7200 });
  await env.CHAT.put(dk, String(nd + 1), { expirationTtl: 172800 });

  const head = who.tier === "max" ? "⭐ <b>SPONSOR MAX · bevorzugt</b>" : who.tier === "sponsor" ? "♥ <b>Sponsor</b>" : "💬 <b>Nutzer</b> (ohne Sponsoring)";
  const msg = `${head}\n👤 ${free ? "Nutzer" : esc(who.name)} · <code>#${b.inst.slice(0, 4)}</code>${free ? "" : " · " + esc(who.via)}\n\n${esc(text)}${b.diag ? "\n\n📎 Diagnose im Anhang" : ""}\n\n<i>Zum Antworten: Wischen → Antworten</i>`;
  const r = await tg(env, "sendMessage", { chat_id: env.ADMIN_CHAT_ID, text: msg.slice(0, 4000), parse_mode: "HTML", disable_web_page_preview: true });
  if (!r.ok) return J({ ok: false, error: "telegram" }, 502);
  const ids = [r.result.message_id];
  if (b.diag && typeof b.diag === "object") {
    const fd = new FormData();
    fd.append("chat_id", String(env.ADMIN_CHAT_ID));
    fd.append("reply_to_message_id", String(r.result.message_id));
    fd.append("caption", `Diagnose von ${free ? "Nutzer" : who.name} · #${b.inst.slice(0, 4)}`);
    fd.append("document", new Blob([JSON.stringify(b.diag, null, 2).slice(0, 60000)], { type: "application/json" }), `diagnose-${b.inst.slice(0, 4)}.json`);
    const d = await tg(env, "sendDocument", fd);
    if (d.ok) ids.push(d.result.message_id);
  }
  for (const id of ids) await env.CHAT.put("tg:" + id, b.inst, { expirationTtl: TTL });
  rec.name = who.name; rec.tier = who.tier; rec.last = Date.now();
  await saveInst(env, b.inst, rec);
  const conv = await loadConv(env, b.inst);
  conv.push({ id: String(b.id || "").slice(0, 20), from: "me", text, ts: Date.now() / 1000 });
  await saveConv(env, b.inst, conv);
  return J({ ok: true });
}

async function onPoll(env, b) {
  const [rec, err] = await auth(env, b);
  if (err) return err;
  if (!rec.last) return J({ ok: true, msgs: [], seen: 0 });
  const since = Number(b.since || 0);
  const conv = await loadConv(env, b.inst);
  return J({ ok: true, msgs: conv.filter((m) => m.from === "dev" && m.ts > since), seen: rec.seen || 0 });
}

async function onDelete(env, b) {
  const [rec, err] = await auth(env, b);
  if (err) return err;
  if (rec.last) { await env.CHAT.delete("conv:" + b.inst); await env.CHAT.delete("inst:" + b.inst); }
  return J({ ok: true });
}

async function onTelegram(env, req) {
  if (req.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.TG_SECRET) return new Response("forbidden", { status: 403 });
  const u = await req.json().catch(() => ({}));
  const m = u.message;
  if (!m || !m.chat) return new Response("ok");
  const chat = String(m.chat.id);
  if (m.text === "/start" || m.text === "/id") {
    await tg(env, "sendMessage", { chat_id: chat, text: `Deine Chat-ID: ${chat}\nTrage sie im Worker als ADMIN_CHAT_ID ein.` });
    return new Response("ok");
  }
  if (chat !== String(env.ADMIN_CHAT_ID)) return new Response("ok");  // nur du darfst antworten
  const reply = m.reply_to_message;
  const text = m.text || m.caption || "";
  if (!reply) {
    await tg(env, "sendMessage", { chat_id: chat, text: "Bitte direkt auf die Nachricht des Sponsors antworten (Wischen → Antworten), sonst weiß ich nicht, an wen sie geht." });
    return new Response("ok");
  }
  const inst = await env.CHAT.get("tg:" + reply.message_id);
  if (!inst) { await tg(env, "sendMessage", { chat_id: chat, text: "Diese Unterhaltung kenne ich nicht mehr (gelöscht oder älter als 180 Tage).", reply_to_message_id: m.message_id }); return new Response("ok"); }
  if (!text.trim()) { await tg(env, "sendMessage", { chat_id: chat, text: "Im Moment kann ich nur Text weitergeben.", reply_to_message_id: m.message_id }); return new Response("ok"); }
  const conv = await loadConv(env, inst), now = Date.now() / 1000;
  conv.push({ id: "t" + m.message_id, from: "dev", text: text.slice(0, 4000), ts: now });
  await saveConv(env, inst, conv);
  await env.CHAT.put("tg:" + m.message_id, inst, { expirationTtl: TTL }); // Antwort auf die eigene Antwort geht an dieselbe Person
  const rec = await loadInst(env, inst);
  if (rec) { rec.seen = now; await saveInst(env, inst, rec); }
  await tg(env, "setMessageReaction", { chat_id: chat, message_id: m.message_id, reaction: [{ type: "emoji", emoji: "👍" }] });
  return new Response("ok");
}

async function onSetup(env, url) {
  if (url.searchParams.get("key") !== env.TG_SECRET) return new Response("Falscher key", { status: 403 });
  const hook = `${url.origin}/tg`;
  const r = await tg(env, "setWebhook", { url: hook, secret_token: env.TG_SECRET, allowed_updates: ["message"] });
  const me = await tg(env, "getMe", {});
  return new Response(`Webhook ${r.ok ? "gesetzt" : "FEHLER: " + (r.description || "")}\nBot: @${me?.result?.username || "?"}\nAdresse: ${hook}\nADMIN_CHAT_ID: ${env.ADMIN_CHAT_ID || "fehlt noch – schreibe dem Bot /start"}`, { headers: { "content-type": "text/plain; charset=utf-8" } });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname === "/setup") return onSetup(env, url);
    if (req.method === "GET") return new Response("Strom & Wärme Support-Vermittler läuft.", { headers: { "content-type": "text/plain; charset=utf-8" } });
    if (req.method !== "POST") return new Response("", { status: 405 });
    if (url.pathname === "/tg") return onTelegram(env, req);
    const b = await req.json().catch(() => null);
    if (url.pathname === "/send") return onSend(env, b);
    if (url.pathname === "/poll") return onPoll(env, b);
    if (url.pathname === "/delete") return onDelete(env, b);
    return J({ ok: false, error: "unknown" }, 404);
  },
};
