import sys, json, uuid, random, tempfile, os
from datetime import date, timedelta, datetime
sys.path.insert(0, "/home/claude/ha-fenster-heizung/statistik-server")
import server
random.seed(11)
path = "/tmp/ref.db"
if os.path.exists(path): os.remove(path)
db = server.DB(path)
today = date(2026, 11, 19)
vers = [("2026.11.4", "stable", 5, 3), ("2026.11.3.1", "stable", 9, 25), ("2026.11.3", "stable", 8, 50), ("2026.11.2", "stable", 4, 58), ("2026.10.5", "stable", 3, 58), ("2026.11.4b25", "beta", 3, 2)]
for v, c, n, first in vers:
    for _ in range(n):
        iid = str(uuid.uuid4())
        start = random.randint(0, 20)
        seen = random.randint(0, 40)
        for dd in range(max(0, first - start), -1, -1):
            day = today - timedelta(days=dd + (seen if random.random() < .15 else 0))
            db.c.execute("INSERT OR REPLACE INTO daily VALUES(?,?,?,?)", (day.isoformat(), iid, v, c))
        rows = db.c.execute("SELECT min(day), max(day) FROM daily WHERE id=?", (iid,)).fetchone()
        if rows[0]:
            mods = random.choice([None, "", "ww", "ww,en", "ww,en,gs,ev", "en,dt,sp"])
            db.c.execute("INSERT INTO installs VALUES(?,?,?,?,?,0,?)", (iid, rows[0], rows[1], v, c, mods))
r = server.compute(db, today)
json.dump(r, open("/tmp/ref.json", "w"))
print(r["a30"], len(r["curves"]), r["t50"])
