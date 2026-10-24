from app.seed import DRAFT_A, DRAFT_B

def post_text(c, text, title="t"):
    return c.post("/api/analyze/text", json={"text": text, "title": title}).json()

def test_flagged_goes_to_review_then_publish(client):
    a = post_text(client, DRAFT_A, "Draft A")
    assert a["status"] == "Flagged" and a["review_state"] == "pending"
    assert any(x["id"] == a["id"] for x in client.get("/api/review").json())
    assert client.post(f"/api/analyses/{a['id']}/publish", json={}).status_code == 409
    client.post(f"/api/review/{a['id']}", json={"decision": "approve"})
    assert client.post(f"/api/analyses/{a['id']}/publish", json={"channel": "website"}).json()["simulated"] is True

def test_approved_skips_review(client):
    a = post_text(client, DRAFT_B, "Draft B")
    assert a["review_state"] == "none"
    assert any(x["id"] == a["id"] for x in client.get("/api/publishable").json())

def test_rejected_cannot_publish(client):
    a = post_text(client, DRAFT_A, "Rejected")
    client.post(f"/api/review/{a['id']}", json={"decision": "reject"})
    assert client.post(f"/api/analyses/{a['id']}/publish", json={}).status_code == 409

def test_compare(client):
    r = client.post("/api/compare", json={"draft_a": DRAFT_A, "draft_b": DRAFT_B}).json()
    assert r["winner"] == "B"

def test_monitor_alert_after_rule_change(client):
    a = post_text(client, "NovaTech Cloud offers seamless tracking.", "Seamless copy")
    assert a["status"] == "Approved"
    banned = client.get("/api/brand").json()["banned"] + ["seamless"]
    client.put("/api/brand", json={"banned": banned})
    s = client.post("/api/monitor/scan").json()
    assert s["alerts_created"] >= 1
    assert any("Seamless copy" in x["message"] for x in client.get("/api/alerts").json())

def test_analytics(client):
    post_text(client, DRAFT_B)
    d = client.get("/api/analytics").json()
    assert d["total"] >= 1 and "facts" in d["components"]
