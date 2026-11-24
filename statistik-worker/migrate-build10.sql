-- Build 10: einmal auf der bestehenden Datenbank ausführen (neue Installationen nutzen schema.sql). Mehrfach ausführen schadet nicht.
--   npx wrangler d1 execute stats --remote --file=migrate-build10.sql
CREATE TABLE IF NOT EXISTS snap(day TEXT PRIMARY KEY, a30 INTEGER, a7 INTEGER, beta INTEGER, newest TEXT, newest_share INTEGER, rep INTEGER, quote REAL, clean REAL, src TEXT);
