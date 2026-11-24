CREATE TABLE IF NOT EXISTS installs(id TEXT PRIMARY KEY, first_day TEXT NOT NULL, last_day TEXT NOT NULL,
  version TEXT NOT NULL, channel TEXT NOT NULL, last_ts INTEGER NOT NULL, modules TEXT, ha TEXT);
CREATE TABLE IF NOT EXISTS daily(day TEXT NOT NULL, id TEXT NOT NULL, version TEXT NOT NULL, channel TEXT NOT NULL,
  modules TEXT, PRIMARY KEY(day, id));   -- modules ab Build 11
CREATE INDEX IF NOT EXISTS daily_id ON daily(id);
-- Fehler-Statistik (Build 3): gleiche Fehler = eine Gruppe (Fingerabdruck), Treffer je Tag, Kennung und Fehler
CREATE TABLE IF NOT EXISTS err_groups(fp TEXT PRIMARY KEY, src TEXT NOT NULL, mod TEXT NOT NULL, kind TEXT NOT NULL, where_ TEXT,
  msg TEXT, first_day TEXT NOT NULL, last_day TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'offen', fixed_in TEXT, issue INTEGER, status_day TEXT,
  chain TEXT);   -- chain ab Build 12
CREATE TABLE IF NOT EXISTS err_hits(day TEXT NOT NULL, fp TEXT NOT NULL, rid TEXT NOT NULL, version TEXT NOT NULL, channel TEXT NOT NULL,
  ha TEXT, n INTEGER NOT NULL, dev TEXT, PRIMARY KEY(day, fp, rid));   -- dev ab Build 12
CREATE INDEX IF NOT EXISTS err_hits_fp ON err_hits(fp);
CREATE INDEX IF NOT EXISTS err_hits_rid ON err_hits(rid);
CREATE TABLE IF NOT EXISTS err_reporters(rid TEXT PRIMARY KEY, last_ts INTEGER NOT NULL, last_day TEXT NOT NULL);
-- Build 6: eine Zeile je Tag und Kennung, auch ohne Fehler („0 Fehler“) – Grundlage für Fehlerquote und Fehler je Modul
CREATE TABLE IF NOT EXISTS err_days(day TEXT NOT NULL, rid TEXT NOT NULL, version TEXT NOT NULL, channel TEXT NOT NULL, ha TEXT,
  mods TEXT, PRIMARY KEY(day, rid));
CREATE INDEX IF NOT EXISTS err_days_ver ON err_days(version);
-- Build 8: Fehler zusammenführen („fp gehört zu into_fp“), Trennen = Zeile löschen
CREATE TABLE IF NOT EXISTS err_merge(fp TEXT PRIMARY KEY, into_fp TEXT NOT NULL, day TEXT NOT NULL);
-- Build 10: eine Zeile Zusammenfassung pro Tag (ohne Kennungen), 2 Jahre aufbewahrt
CREATE TABLE IF NOT EXISTS snap(day TEXT PRIMARY KEY, a30 INTEGER, a7 INTEGER, beta INTEGER, newest TEXT, newest_share INTEGER, rep INTEGER, quote REAL, clean REAL, src TEXT);
-- Build 13: Zähler je Tag und Art (ohne Kennungen, 400 Tage) und letzter nächtlicher Lauf
CREATE TABLE IF NOT EXISTS sys(day TEXT NOT NULL, kind TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY(day, kind));
CREATE TABLE IF NOT EXISTS syskv(k TEXT PRIMARY KEY, v TEXT);
