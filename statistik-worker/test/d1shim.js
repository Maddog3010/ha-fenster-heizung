// Minimaler D1-Ersatz auf Basis von node:sqlite – nur für die Tests.
import { DatabaseSync } from "node:sqlite";
export function shim(path = ":memory:") {
  const db = new DatabaseSync(path);
  const mk = (sql, args = []) => ({
    bind: (...a) => mk(sql, a),
    first: async () => db.prepare(sql).get(...args) ?? null,
    all: async () => ({ results: db.prepare(sql).all(...args) }),
    run: async () => db.prepare(sql).run(...args),
  });
  return { raw: db, exec: (s) => db.exec(s), prepare: (sql) => mk(sql), batch: async (list) => { for (const s of list) await s.run(); } };
}
