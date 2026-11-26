"""Tests der Umfragen: Rechenfunktionen (surveys_logic.py) und Ablauf (surveys.py) – ohne Home Assistant.

Für surveys.py werden die wenigen benötigten Teile von Home Assistant und aiohttp durch kleine Attrappen ersetzt;
der Server ist eine Attrappe, die sich wie der Worker (statistik-worker/src/umfragen.js) verhält.
"""
from __future__ import annotations

import asyncio
import importlib
import json
import pathlib
import sys
import types

import pytest

DIR = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "fenster_heizung"
PKG = "fh_srv_pkg"


class ClientError(Exception):
    pass


class FakeStore:
    saved: dict = {}

    def __init__(self, hass, version, key):
        self.key = key

    async def async_load(self):
        return json.loads(json.dumps(self.saved.get(self.key))) if self.key in self.saved else None

    def async_delay_save(self, func, delay=0):
        self.saved[self.key] = json.loads(json.dumps(func()))


def _load():
    """surveys.py als Teil eines Ersatzpakets laden; danach sys.modules wieder aufräumen."""
    names = ("homeassistant", "homeassistant.core", "homeassistant.helpers", "homeassistant.helpers.aiohttp_client",
             "homeassistant.helpers.event", "homeassistant.helpers.storage", "aiohttp")
    old = {n: sys.modules.get(n) for n in names}
    mods = {n: types.ModuleType(n) for n in names}
    mods["homeassistant.core"].CALLBACK_TYPE = object
    mods["homeassistant.core"].HomeAssistant = object
    mods["homeassistant.helpers.aiohttp_client"].async_get_clientsession = lambda hass: hass.session
    mods["homeassistant.helpers.event"].async_call_later = lambda *a: (lambda: None)
    mods["homeassistant.helpers.event"].async_track_time_interval = lambda *a: (lambda: None)
    mods["homeassistant.helpers.storage"].Store = FakeStore
    mods["aiohttp"].ClientError = ClientError
    mods["aiohttp"].ClientTimeout = lambda **kw: None
    pkg = types.ModuleType(PKG)
    pkg.__path__ = [str(DIR)]
    sys.modules[PKG] = pkg
    sys.modules.update(mods)
    try:
        surveys = importlib.import_module(f"{PKG}.surveys")
        logic = importlib.import_module(f"{PKG}.surveys_logic")
    finally:
        for n, m in old.items():
            if m is None:
                sys.modules.pop(n, None)
            else:
                sys.modules[n] = m
    return surveys, logic


S, L = _load()

A, B = "0123456789ab", "ba9876543210"


def survey(sid=A, **over):
    s = {"id": sid, "rev": 1, "state": "laeuft", "title": "Deine Meinung zählt", "channel": "alle", "module": "", "from": "2026-12-01",
         "to": "2026-12-15", "popup": True, "questions": [
             {"id": "q1", "type": "one", "text": "Was zuerst?", "options": ["Speicher", "Lüftung"]},
             {"id": "q2", "type": "stars", "text": "Zufrieden?", "na": True},
             {"id": "q3", "type": "text", "text": "Was fehlt?"}]}
    s.update(over)
    return s


# ------------------------------------------------------------ Rechenfunktionen
def test_clean_list_accepts_and_filters():
    ok = L.clean_list({"ok": True, "surveys": [survey()]})
    assert ok and ok[0]["id"] == A and ok[0]["questions"][1]["na"] is True
    bad = [survey(id="x"), survey(rev=0), survey(rev=True), survey(state="draft"), survey(title=""), survey(questions=[]),
           survey(questions=[{"id": "q1", "type": "one", "text": "?", "options": ["a"]}]),
           survey(questions=[{"id": "q1", "type": "html", "text": "?"}]),
           survey(questions=[{"id": "q1", "type": "text", "text": "a"}, {"id": "q1", "type": "text", "text": "b"}]), "x", None]
    assert L.clean_list({"ok": True, "surveys": bad}) == []
    assert L.clean_list({"ok": False, "surveys": []}) is None and L.clean_list(None) is None and L.clean_list({"ok": True}) is None
    assert len(L.clean_list({"ok": True, "surveys": [survey(), survey()]})) == 1          # doppelte ID
    many = [survey(f"{i:012x}") for i in range(25)]
    assert len(L.clean_list({"ok": True, "surveys": many})) == L.MAX_LIST


def test_clean_survey_limits_and_unknown_fields():
    s = L.clean_survey(survey(title="T" * 200, channel="x", popup="ja", extra="<script>", to="morgen"))
    assert len(s["title"]) == 60 and s["channel"] == "alle" and s["popup"] is False and s["to"] == "" and "extra" not in s
    assert L.clean_line("a\nb\x00c", 10) == "a b c" and L.clean_line(7, 10) == ""


def test_clean_result():
    qs = L.clean_survey(survey())["questions"]
    r = {"n": 12, "q": {"q1": {"n": 12, "counts": [8, 4]}, "q2": {"n": 10, "counts": [0, 0, 2, 3, 5], "na": 2, "avg": 4.3}, "q3": {"n": 1, "counts": []}}}
    out = L.clean_result(r, qs)
    assert out["n"] == 12 and set(out["q"]) == {"q1", "q2"} and out["q"]["q2"]["avg"] == 4.3
    assert L.clean_result({"n": 12, "q": {"q1": {"n": 12, "counts": [1, 2, 3]}}}, qs) is None
    assert L.clean_result({"n": 12, "q": {"q1": {"n": 12, "counts": [1, -2]}}}, qs) is None
    assert L.clean_result(None, qs) is None
    assert "result" in L.clean_survey(survey(result=r))


def test_matches_channel_and_module():
    assert L.matches(L.clean_survey(survey()), "stable", [])
    b = L.clean_survey(survey(channel="beta"))
    assert L.matches(b, "beta", []) and not L.matches(b, "stable", [])
    m = L.clean_survey(survey(module="ev"))
    assert L.matches(m, "stable", ["ww", "ev"]) and not L.matches(m, "stable", ["ww"])
    assert L.matches(L.clean_survey(survey(state="test", channel="beta", module="ev")), "stable", [])


def test_check_answers():
    qs = L.clean_survey(survey(questions=survey()["questions"] + [{"id": "q4", "type": "multi", "text": "Welche?", "options": ["a", "b", "c"]}]))["questions"]
    good = {"q1": 1, "q2": "na", "q3": "  Hallo\r\nWelt\x07 ", "q4": [2, 0]}
    assert L.check_answers(qs, good) == {"q1": 1, "q2": "na", "q3": "Hallo\nWelt", "q4": [0, 2]}
    assert "q3" not in L.check_answers(qs, {"q1": 0, "q2": 5, "q4": [1], "q3": "   "})
    for bad in ({"q2": 5, "q4": [1]}, {"q1": 2, "q2": 5, "q4": [1]}, {"q1": True, "q2": 5, "q4": [1]}, {"q1": 0, "q2": 6, "q4": [1]},
                {"q1": 0, "q2": 5, "q4": []}, {"q1": 0, "q2": 5, "q4": [1, 1]}, {"q1": 0, "q2": 5, "q4": [1], "q9": 1},
                {"q1": 0, "q2": 5, "q4": [1], "q3": 5}, {"q1": 0, "q2": 5, "q4": [1], "q3": "x" * 501},
                {"q1": 0, "q2": 5, "q4": [1], "q3": "😀" * 251}, "x", None):
        assert L.check_answers(qs, bad) is None, bad
    only_text = [{"id": "q1", "type": "text", "text": "?"}]
    assert L.check_answers(only_text, {}) is None and L.check_answers(only_text, {"q1": "ja"}) == {"q1": "ja"}
    assert L.check_answers([{"id": "q1", "type": "stars", "text": "?", "na": False}], {"q1": "na"}) is None


def test_popup_rules():
    s1, s2 = L.clean_survey(survey(A)), L.clean_survey(survey(B))
    now = 1_000_000_000.0
    assert L.popup_pick([s1, s2], {}, now, 0) == A
    assert L.popup_pick([s1, s2], {A: {"rev": 1, "sent": 1}}, now, 0) == B
    assert L.popup_pick([s1], {A: {"rev": 1, "declined": True}}, now, 0) == ""
    shown = {A: {"rev": 1, "popups": 1, "popup_next": now + L.POPUP_AGAIN}}
    assert L.popup_pick([s1], shown, now + 3600, now) == ""
    assert L.popup_pick([s1], shown, now + L.POPUP_AGAIN, now) == A             # einmal noch nach 3 Tagen
    assert L.popup_pick([s1], {A: {"rev": 1, "popups": 2}}, now + 10**7, now) == ""
    assert L.popup_pick([s1, s2], shown, now + 3600, now) == ""                 # neue Umfrage: eine Woche Abstand
    assert L.popup_pick([s1, s2], {A: {"rev": 1, "popups": 2}}, now + L.POPUP_GAP, now) == B
    assert L.popup_pick([L.clean_survey(survey(popup=False))], {}, now, 0) == ""
    assert L.popup_pick([L.clean_survey(survey(state="beendet"))], {}, now, 0) == ""
    assert L.popup_pick([L.clean_survey(survey(state="test"))], {}, now, now) == A   # Test ignoriert den Wochenabstand
    assert L.popup_pick([s1], {A: {"rev": 0, "declined": True}}, now, 0) == A        # neue Fragen → wieder fragen


def test_status_and_due():
    s = L.clean_survey(survey())
    assert L.status_of(s, None) == "open"
    assert L.status_of(s, {"rev": 1, "pending": True, "sent": 5}) == "pending"
    assert L.status_of(s, {"rev": 1, "sent": 5}) == "answered"
    assert L.status_of(s, {"rev": 1, "declined": True}) == "declined"
    assert L.status_of(s, {"rev": 2, "sent": 5}) == "open"
    assert L.status_of(L.clean_survey(survey(state="beendet")), {"rev": 1, "sent": 5}) == "ended"
    t = 1_000_000.0
    assert L.is_due(t, 0, 0)
    assert not L.is_due(t + 3600, t, t) and L.is_due(t + L.INTERVAL, t, t)
    assert not L.is_due(t + 3600, 0, t) and L.is_due(t + L.RETRY, 0, t)


def test_code():
    assert L.clean_code(" t-7k3q-9mab ") == "T-7K3Q-9MAB"
    for bad in ("", "T-1111-1111", "T-7K3Q-9M", "X-7K3Q-9MAB", None):
        assert L.clean_code(bad) == ""


# ------------------------------------------------------------ Ablauf
class Resp:
    def __init__(self, status, data):
        self.status = status
        raw = data if isinstance(data, bytes) else json.dumps(data).encode()
        parts = [raw, b""]

        class C:
            async def read(self, n=-1):
                return parts.pop(0) if parts else b""
        self.content = C()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *a):
        return False


class Server:
    def __init__(self):
        self.surveys = [survey()]
        self.answers: dict = {}
        self.calls: list = []
        self.down = False
        self.answer_status = (200, {"ok": True})

    def request(self, method, url, **kw):
        path = url.split("stromwaerme.dev")[1]
        body = json.loads(kw["data"]) if "data" in kw else None
        assert kw["headers"]["User-Agent"] == "Strom-und-Waerme"
        self.calls.append((method, path, body, kw.get("params")))
        if self.down:
            raise ClientError("weg")
        if path == "/v1/surveys":
            return Resp(200, {"ok": True, "surveys": self.surveys})
        if path == "/v1/surveys/answer":
            if self.answer_status[0] == 200:
                self.answers[(body["survey"], body["rid"])] = body
            return Resp(*self.answer_status)
        if path == "/v1/surveys/forget":
            self.answers.pop((body["survey"], body["rid"]), None)
            return Resp(200, {"ok": True})
        return Resp(404, {})


def make(version="2026.11.5b11", modules=()):
    hass = types.SimpleNamespace(session=Server(), data={"fenster_heizung": {"stats": types.SimpleNamespace(url="https://stats.stromwaerme.dev"), "wasser": types.SimpleNamespace(modules={"on": {m: True for m in modules}})}})
    m = S.Surveys(hass)

    async def ver():
        return version
    m._version = ver
    return m, hass.session


def run(c):
    return asyncio.run(c)


@pytest.fixture(autouse=True)
def _clean_store():
    FakeStore.saved = {}


def test_fetch_sends_nothing_about_the_installation():
    m, srv = make()
    run(m.async_start())
    assert run(m.async_fetch())
    assert srv.calls == [("GET", "/v1/surveys", None, None)]
    snap = run(m.snapshot())
    assert snap["prompt"] == A and snap["surveys"][0]["status"] == "open" and snap["surveys"][0]["card"] and snap["surveys"][0]["dot"]
    assert snap["mine"] == 0 and "rid" not in json.dumps(snap)


def test_targeting_is_local():
    m, srv = make("2026.11.4.11", ("ww",))
    srv.surveys = [survey(A, channel="beta"), survey(B, module="ev")]
    run(m.async_fetch())
    assert run(m.snapshot())["surveys"] == []
    m2, srv2 = make("2026.11.5b11", ("ev",))
    srv2.surveys = srv.surveys
    run(m2.async_fetch())
    assert len(run(m2.snapshot())["surveys"]) == 2


def test_off_means_no_requests():
    m, srv = make()
    run(m.async_opts(on=False))
    run(m._tick())
    assert not run(m.async_fetch()) and srv.calls == []
    assert run(m.snapshot())["surveys"] == [] and run(m.snapshot())["prompt"] == ""
    run(m.async_opts(on=True))
    assert len(srv.calls) == 1 and run(m.snapshot())["surveys"]


def test_popup_switch_keeps_card():
    m, _ = make()
    run(m.async_fetch())
    run(m.async_opts(popup=False))
    snap = run(m.snapshot())
    assert snap["prompt"] == "" and snap["surveys"][0]["card"]


def test_shown_later_never():
    m, _ = make()
    run(m.async_fetch())
    m.shown(A)
    snap = run(m.snapshot())
    assert snap["prompt"] == "" and snap["surveys"][0]["card"], "Popup geschlossen: Karte bleibt"
    m.later(A)
    snap = run(m.snapshot())
    assert not snap["surveys"][0]["card"] and snap["surveys"][0]["dot"]
    m.never(A)
    snap = run(m.snapshot())
    x = snap["surveys"][0]
    assert x["status"] == "declined" and not x["card"] and not x["dot"] and snap["prompt"] == ""


def test_answer_change_withdraw():
    m, srv = make()
    run(m.async_fetch())
    res = run(m.async_answer(A, {"q1": 0, "q2": 4, "q3": "Mehr Bilder"}))
    assert res == {"sent": True}
    body = srv.calls[-1][2]
    assert set(body) == {"schema", "survey", "rev", "rid", "version", "channel", "answers"}
    assert body["channel"] == "beta" and body["version"] == "2026.11.5b11" and L.SCHEMA == body["schema"]
    rid = body["rid"]
    x = run(m.snapshot())["surveys"][0]
    assert x["status"] == "answered" and x["mine"]["q3"] == "Mehr Bilder" and not x["dot"] and x["result"] is None
    assert run(m.async_answer(A, {"q1": 1, "q2": 5}))["sent"] and srv.calls[-1][2]["rid"] == rid and len(srv.answers) == 1
    assert run(m.async_withdraw(A)) == {"withdrawn": True} and srv.answers == {}
    x = run(m.snapshot())["surveys"][0]
    assert x["status"] == "declined" and x["mine"] is None and run(m.snapshot())["mine"] == 0
    run(m.async_answer(A, {"q1": 0, "q2": 1}))
    assert srv.calls[-1][2]["rid"] != rid, "nach dem Zurückziehen ein neuer Zufallscode"


def test_each_survey_has_its_own_code_and_not_the_statistics_id():
    m, srv = make()
    srv.surveys = [survey(A), survey(B)]
    run(m.async_fetch())
    for sid in (A, B):
        run(m.async_answer(sid, {"q1": 0, "q2": 1}))
    rids = [c[2]["rid"] for c in srv.calls if c[1] == "/v1/surveys/answer"]
    assert len(set(rids)) == 2


def test_invalid_answers_are_not_sent():
    m, srv = make()
    run(m.async_fetch())
    assert run(m.async_answer(A, {"q1": 9, "q2": 1}))["error"] == "antworten"
    assert run(m.async_answer(B, {"q1": 0}))["error"] == "unbekannt"
    assert len(srv.calls) == 1


def test_offline_keeps_answers_and_resends():
    m, srv = make()
    run(m.async_fetch())
    srv.down = True
    assert run(m.async_answer(A, {"q1": 0, "q2": 3})) == {"sent": False, "error": "offline"}
    snap = run(m.snapshot())
    x = snap["surveys"][0]
    assert x["status"] == "pending" and x["card"] and x["mine"] == {"q1": 0, "q2": 3} and snap["mine"] == 1
    assert run(m.async_withdraw(A))["error"] == "offline", "vielleicht liegt etwas auf dem Server"
    m.later(A)
    x = run(m.snapshot())["surveys"][0]
    assert not x["card"] and x["dot"], "„Später“ gilt auch für die Karte „Erneut senden“"
    assert run(m.async_answer(A, {"q1": 0, "q2": 3}))["error"] == "offline" and run(m.snapshot())["surveys"][0]["card"]
    srv.down = False
    assert run(m.async_send(A)) == {"sent": True} and run(m.snapshot())["surveys"][0]["status"] == "answered"


@pytest.mark.parametrize("status,data,error,pending", [
    (429, {"error": "too_many"}, "kurz", True), (429, {"error": "voll"}, "voll", False), (400, {"error": "format"}, "abgelehnt", False),
    (413, {}, "abgelehnt", False), (500, {}, "offline", True)])
def test_server_errors(status, data, error, pending):
    m, srv = make()
    run(m.async_fetch())
    srv.answer_status = (status, data)
    assert run(m.async_answer(A, {"q1": 0, "q2": 3}))["error"] == error
    assert (run(m.snapshot())["surveys"][0]["status"] == "pending") is pending


@pytest.mark.parametrize("status,error", [(409, "veraltet"), (410, "beendet"), (404, "unbekannt")])
def test_changed_or_ended_survey_is_refetched(status, error):
    m, srv = make()
    run(m.async_fetch())
    srv.answer_status = (status, {})
    assert run(m.async_answer(A, {"q1": 0, "q2": 3}))["error"] == error
    assert srv.calls[-1][1] == "/v1/surveys", "Liste wird neu geholt"


def test_new_revision_asks_again():
    m, srv = make()
    run(m.async_fetch())
    run(m.async_answer(A, {"q1": 0, "q2": 3}))
    rid = srv.calls[-1][2]["rid"]
    srv.surveys = [survey(rev=2)]
    run(m.async_fetch())
    x = run(m.snapshot())["surveys"][0]
    assert x["status"] == "open" and x["mine"] is None
    run(m.async_answer(A, {"q1": 1, "q2": 2}))
    assert srv.calls[-1][2]["rid"] == rid and srv.calls[-1][2]["rev"] == 2


def test_result_only_after_own_answer():
    m, srv = make()
    res = {"n": 11, "q": {"q1": {"n": 11, "counts": [7, 4]}}}
    srv.surveys = [survey(result=res)]
    run(m.async_fetch())
    assert run(m.snapshot())["surveys"][0]["result"] is None
    srv.answer_status = (200, {"ok": True, "result": {"n": 12, "q": {"q1": {"n": 12, "counts": [8, 4]}}}})
    run(m.async_answer(A, {"q1": 0, "q2": 3}))
    assert run(m.snapshot())["surveys"][0]["result"]["n"] == 12


def test_no_withdraw_while_sending():
    m, srv = make()
    run(m.async_fetch())
    run(m.async_answer(A, {"q1": 0, "q2": 3}))
    m._busy.add(A)
    assert run(m.async_withdraw(A)) == {"withdrawn": False, "error": "laeuft"} and len(srv.answers) == 1
    assert run(m.async_send(A))["error"] == "laeuft"


def test_forget_all_also_for_gone_surveys():
    m, srv = make()
    srv.surveys = [survey(A), survey(B)]
    run(m.async_fetch())
    for sid in (A, B):
        run(m.async_answer(sid, {"q1": 0, "q2": 1}))
    srv.surveys = []
    run(m.async_fetch())
    assert run(m.snapshot())["mine"] == 2
    assert run(m.async_forget_all()) == {"deleted": 2, "failed": 0} and srv.answers == {} and run(m.snapshot())["mine"] == 0


def test_test_code():
    m, srv = make()
    assert run(m.async_set_code("falsch")) == {"error": "code"} and srv.calls == []
    srv.surveys = [survey(state="test")]
    assert run(m.async_set_code("t-7k3q-9mab")) == {"fetched": True, "tests": 1}
    assert srv.calls[-1][3] == {"test": "T-7K3Q-9MAB"}
    m.shown(A)
    m.never(A)
    assert run(m.snapshot())["prompt"] == ""
    run(m.async_refresh())
    assert run(m.snapshot())["prompt"] == A, "erneutes Prüfen zeigt den Test wieder"
    run(m.async_answer(A, {"q1": 0, "q2": 1}))
    assert srv.calls[-1][2]["test"] == "T-7K3Q-9MAB"


def test_failed_fetch_keeps_list_and_survives_restart():
    m, srv = make()
    run(m.async_fetch())
    run(m.async_answer(A, {"q1": 0, "q2": 1}))
    srv.down = True
    assert not run(m.async_fetch())
    assert run(m.snapshot())["err"] == "offline" and run(m.snapshot())["surveys"]
    m2, _ = make()
    run(m2.async_start())
    x = run(m2.snapshot())["surveys"][0]
    assert x["status"] == "answered" and x["mine"] == {"q1": 0, "q2": 1}


def test_oversized_or_garbage_response_ignored():
    m, srv = make()
    srv.request = lambda *a, **kw: Resp(200, b"x" * (S.MAX_BYTES + 5))
    assert not run(m.async_fetch())
    srv.request = lambda *a, **kw: Resp(200, b"<html>")
    assert not run(m.async_fetch()) and m.list == []
