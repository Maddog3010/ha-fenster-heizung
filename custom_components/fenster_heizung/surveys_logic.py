"""Reine Rechenfunktionen der Umfragen (ohne Home Assistant, damit sie sich testen lassen).

Alles, was vom Server kommt, wird hier streng geprüft und gekürzt, bevor es in die Oberfläche geht. Die Regeln für
Antworten entsprechen denen des Workers (statistik-worker/src/umfragen.js).
"""
from __future__ import annotations

import re
from typing import Any

SCHEMA = 1
INTERVAL = 23 * 3600        # nach einem erfolgreichen Abruf frühestens nach 23 Stunden wieder
RETRY = 3 * 3600            # nach einem Fehlversuch frühestens nach 3 Stunden
POPUP_AGAIN = 3 * 86400     # „Später“: dieselbe Umfrage höchstens nach 3 Tagen noch einmal
POPUP_GAP = 7 * 86400       # eine neue Umfrage frühestens 7 Tage nach dem letzten Popup
POPUP_MAX = 2               # je Umfrage höchstens zwei Popups, danach nur Karte und Liste
CARD_SNOOZE = 3 * 86400     # „Später“ auf der Karte blendet sie so lange aus
KEEP = 400 * 86400          # eigene Zufallscodes so lange merken (zum Löschen), Server: 12 Monate nach Ende
MAX_LIST = 10
LIMITS = {"questions": 5, "options": 6, "title": 60, "question": 120, "option": 60, "text": 500}

_SID_RE = re.compile(r"^[0-9a-f]{12}$")
_QID_RE = re.compile(r"^q[1-9]$")
_DAY_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_CODE_RE = re.compile(r"^T-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$")
_CTRL_RE = re.compile(r"[\x00-\x1f\x7f]+")
_CTRL_ML_RE = re.compile(r"[\x00-\x09\x0b-\x1f\x7f]")


def _int(v: Any) -> bool:
    return isinstance(v, int) and not isinstance(v, bool)


def clean_line(v: Any, limit: int) -> str:
    """Einzeilig, ohne Steuerzeichen, gekürzt. Kein Text → „“."""
    if not isinstance(v, str):
        return ""
    return _CTRL_RE.sub(" ", v.encode("utf-8", "ignore").decode()).strip()[:limit].strip()


def clean_code(v: Any) -> str:
    """Testcode „T-XXXX-XXXX“ (Groß-/Kleinschreibung egal) oder „“."""
    c = str(v or "").strip().upper()
    return c if _CODE_RE.match(c) else ""


def _question(q: Any) -> dict[str, Any] | None:
    if not isinstance(q, dict):
        return None
    qid, typ, text = q.get("id"), q.get("type"), clean_line(q.get("text"), LIMITS["question"])
    if not isinstance(qid, str) or not _QID_RE.match(qid) or typ not in ("one", "multi", "stars", "text") or not text:
        return None
    out: dict[str, Any] = {"id": qid, "type": typ, "text": text}
    if typ in ("one", "multi"):
        opts = q.get("options")
        if not isinstance(opts, list) or not 2 <= len(opts) <= LIMITS["options"]:
            return None
        out["options"] = [clean_line(o, LIMITS["option"]) for o in opts]
        if not all(out["options"]):
            return None
    if typ == "stars":
        out["na"] = q.get("na") is True
    return out


def clean_result(r: Any, questions: list[dict[str, Any]]) -> dict[str, Any] | None:
    """Freigegebenes Zwischenergebnis (nur Zahlen)."""
    if not isinstance(r, dict) or not _int(r.get("n")) or r["n"] < 1 or not isinstance(r.get("q"), dict):
        return None
    out: dict[str, Any] = {}
    for q in questions:
        x = r["q"].get(q["id"])
        if q["type"] == "text" or not isinstance(x, dict):
            continue
        size = 5 if q["type"] == "stars" else len(q["options"])
        counts = x.get("counts")
        if not isinstance(counts, list) or len(counts) != size or not all(_int(c) and c >= 0 for c in counts) or not _int(x.get("n")):
            continue
        item: dict[str, Any] = {"n": x["n"], "counts": counts}
        if q["type"] == "stars":
            avg = x.get("avg")
            item["avg"] = round(float(avg), 2) if isinstance(avg, (int, float)) and not isinstance(avg, bool) and 1 <= avg <= 5 else None
            item["na"] = x["na"] if _int(x.get("na")) else 0
        out[q["id"]] = item
    return {"n": r["n"], "q": out} if out else None


def clean_survey(s: Any) -> dict[str, Any] | None:
    if not isinstance(s, dict):
        return None
    sid, rev, state = s.get("id"), s.get("rev"), s.get("state")
    title = clean_line(s.get("title"), LIMITS["title"])
    qs = s.get("questions")
    if not isinstance(sid, str) or not _SID_RE.match(sid) or not _int(rev) or rev < 1 or state not in ("laeuft", "beendet", "test") or not title:
        return None
    if not isinstance(qs, list) or not 1 <= len(qs) <= LIMITS["questions"]:
        return None
    questions = [_question(q) for q in qs]
    if any(q is None for q in questions) or len({q["id"] for q in questions}) != len(questions):
        return None
    day = lambda v: v if isinstance(v, str) and _DAY_RE.match(v) else ""  # noqa: E731
    out: dict[str, Any] = {
        "id": sid, "rev": rev, "state": state, "title": title, "questions": questions,
        "channel": s.get("channel") if s.get("channel") in ("stable", "beta") else "alle",
        "module": clean_line(s.get("module"), 8), "from": day(s.get("from")), "to": day(s.get("to")), "popup": s.get("popup") is True,
    }
    res = clean_result(s.get("result"), questions)
    if res:
        out["result"] = res
    return out


def clean_list(data: Any) -> list[dict[str, Any]] | None:
    """Antwort von GET /v1/surveys. None = unbrauchbar (alte Liste behalten)."""
    if not isinstance(data, dict) or data.get("ok") is not True or not isinstance(data.get("surveys"), list):
        return None
    out: list[dict[str, Any]] = []
    for s in data["surveys"][:MAX_LIST * 2]:
        c = clean_survey(s)
        if c and all(c["id"] != o["id"] for o in out):
            out.append(c)
    return out[:MAX_LIST]


def matches(survey: dict[str, Any], channel: str, modules: list[str]) -> bool:
    """Zielgruppe – wird nur hier geprüft, der Server erfährt nichts über die Installation. Tests sieht man immer."""
    if survey["state"] == "test":
        return True
    if survey["channel"] != "alle" and survey["channel"] != channel:
        return False
    return not survey["module"] or survey["module"] in modules


def check_answers(questions: list[dict[str, Any]], answers: Any) -> dict[str, Any] | None:
    """Antworten prüfen und bereinigen. Freitext ist freiwillig, alles andere Pflicht. None = ungültig."""
    if not isinstance(answers, dict) or set(answers) - {q["id"] for q in questions}:
        return None
    out: dict[str, Any] = {}
    for q in questions:
        v = answers.get(q["id"])
        if q["type"] == "text":
            if v is None:
                continue
            if not isinstance(v, str):
                return None
            t = _CTRL_ML_RE.sub(" ", v.encode("utf-8", "ignore").decode().replace("\r\n", "\n").replace("\r", "\n")).strip()
            if len(t.encode("utf-16-le")) // 2 > LIMITS["text"]:  # wie die Zählung im Browser und im Worker
                return None
            if t:
                out[q["id"]] = t
        elif q["type"] == "stars":
            if not ((_int(v) and 1 <= v <= 5) or (v == "na" and q.get("na"))):
                return None
            out[q["id"]] = v
        else:
            size = len(q["options"])
            if q["type"] == "one":
                if not _int(v) or not 0 <= v < size:
                    return None
                out[q["id"]] = v
            else:
                if not isinstance(v, list) or not v or not all(_int(i) and 0 <= i < size for i in v) or len(set(v)) != len(v):
                    return None
                out[q["id"]] = sorted(v)
    return out or None


def is_due(now: float, last_ok: float, last_try: float) -> bool:
    return now >= max((last_ok or 0) + INTERVAL if last_ok else 0, (last_try or 0) + RETRY if last_try else 0)


def status_of(survey: dict[str, Any], rec: dict[str, Any] | None) -> str:
    """ended · answered · pending (noch nicht angekommen) · declined · open"""
    rec = rec if rec and rec.get("rev") == survey["rev"] else {}
    if survey["state"] == "beendet":
        return "ended"
    if rec.get("pending"):
        return "pending"
    if rec.get("sent"):
        return "answered"
    return "declined" if rec.get("declined") else "open"


def popup_pick(surveys: list[dict[str, Any]], recs: dict[str, dict[str, Any]], now: float, last_popup: float) -> str:
    """Welche Umfrage darf jetzt als Popup erscheinen? „“ = keine."""
    for s in surveys:
        rec = recs.get(s["id"]) or {}
        rec = rec if rec.get("rev") == s["rev"] else {}
        if status_of(s, rec) != "open" or not s["popup"]:
            continue
        n = int(rec.get("popups") or 0)
        if n >= POPUP_MAX:
            continue
        if n:
            if now >= float(rec.get("popup_next") or 0):
                return s["id"]
        elif s["state"] == "test" or not last_popup or now - last_popup >= POPUP_GAP:
            return s["id"]
    return ""
