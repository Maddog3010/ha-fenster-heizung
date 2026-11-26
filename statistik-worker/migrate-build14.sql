-- Build 14: Umfragen. Einmal auf der bestehenden Datenbank ausführen (neue Installationen nutzen schema.sql). Mehrfach ausführen schadet nicht.
--   npx wrangler d1 execute stats --remote --file=migrate-build14.sql
CREATE TABLE IF NOT EXISTS surveys(id TEXT PRIMARY KEY, title TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'entwurf', questions TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'alle', module TEXT NOT NULL DEFAULT '', from_day TEXT, to_day TEXT, popup INTEGER NOT NULL DEFAULT 1,
  results INTEGER NOT NULL DEFAULT 0, rev INTEGER NOT NULL DEFAULT 1, created TEXT NOT NULL, changed TEXT NOT NULL, ended TEXT);
CREATE TABLE IF NOT EXISTS answers(sid TEXT NOT NULL, rid TEXT NOT NULL, day TEXT NOT NULL, ts INTEGER NOT NULL, version TEXT NOT NULL,
  channel TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY(sid, rid));
CREATE TABLE IF NOT EXISTS syskv(k TEXT PRIMARY KEY, v TEXT);
