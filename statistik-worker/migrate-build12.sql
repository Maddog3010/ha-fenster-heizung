-- Build 12: einmal auf der bestehenden Datenbank ausführen (neue Installationen nutzen schema.sql):
--   npx wrangler d1 execute stats --remote --file=migrate-build12.sql
-- Nur einmal nötig – ein zweiter Lauf meldet „duplicate column name“, schadet aber nicht.
ALTER TABLE err_hits ADD COLUMN dev TEXT;
ALTER TABLE err_groups ADD COLUMN chain TEXT;
