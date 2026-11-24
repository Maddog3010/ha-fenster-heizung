-- Build 11: einmal auf der bestehenden Datenbank ausführen (neue Installationen nutzen schema.sql):
--   npx wrangler d1 execute stats --remote --file=migrate-build11.sql
-- Nur einmal nötig – ein zweiter Lauf meldet „duplicate column name: modules“, schadet aber nicht.
ALTER TABLE daily ADD COLUMN modules TEXT;
