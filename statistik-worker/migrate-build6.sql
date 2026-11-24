-- Build 6: einmal auf der bestehenden Datenbank ausführen (neue Installationen nutzen schema.sql):
--   npx wrangler d1 execute stats --remote --file=migrate-build6.sql
-- Nur einmal ausführen – ein zweiter Lauf meldet „duplicate column name: ha“, schadet aber nicht.
CREATE TABLE IF NOT EXISTS err_days(day TEXT NOT NULL, rid TEXT NOT NULL, version TEXT NOT NULL, channel TEXT NOT NULL, ha TEXT,
  mods TEXT, PRIMARY KEY(day, rid));
CREATE INDEX IF NOT EXISTS err_days_ver ON err_days(version);
ALTER TABLE installs ADD COLUMN ha TEXT;
