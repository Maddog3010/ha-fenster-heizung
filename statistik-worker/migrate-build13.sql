-- Build 13: einmal auf der bestehenden Datenbank ausführen (neue Installationen nutzen schema.sql). Mehrfach ausführen schadet nicht.
--   npx wrangler d1 execute stats --remote --file=migrate-build13.sql
CREATE TABLE IF NOT EXISTS sys(day TEXT NOT NULL, kind TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY(day, kind));
CREATE TABLE IF NOT EXISTS syskv(k TEXT PRIMARY KEY, v TEXT);
