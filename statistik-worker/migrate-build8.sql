-- Build 8: einmal auf der bestehenden Datenbank ausführen (neue Installationen nutzen schema.sql). Mehrfach ausführen schadet nicht.
--   npx wrangler d1 execute stats --remote --file=migrate-build8.sql
CREATE TABLE IF NOT EXISTS err_merge(fp TEXT PRIMARY KEY, into_fp TEXT NOT NULL, day TEXT NOT NULL);
