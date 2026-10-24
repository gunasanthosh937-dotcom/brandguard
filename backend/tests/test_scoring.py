from app.scoring import WEIGHTS, analyze
from app.seed import DRAFT_A, DRAFT_B, NOVATECH

def test_weights_sum_to_100():
    assert sum(WEIGHTS.values()) == 100

def test_draft_a_is_flagged():
    r = analyze(DRAFT_A, NOVATECH)
    assert r["status"] == "Flagged" and r["score"] < 60
    assert {i["category"] for i in r["issues"]} == {"facts", "tone", "terminology", "compliance"}

def test_draft_b_is_approved():
    r = analyze(DRAFT_B, NOVATECH)
    assert r["score"] == 100 and r["status"] == "Approved" and r["issues"] == []

def test_language_specific_banned_phrase():
    text = "Una plataforma de clase mundial."
    assert analyze(text, NOVATECH, "es")["score"] < 100
    assert analyze(text, NOVATECH, "en")["score"] == 100
