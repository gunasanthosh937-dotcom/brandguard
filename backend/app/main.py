from collections import Counter, defaultdict
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models, scoring
from .database import Base, engine, get_db
from .seed import DRAFT_A, DRAFT_B, seed

@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        seed(db)
    yield

app = FastAPI(title="BrandGuard API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
RANK = {"Approved": 0, "Needs review": 1, "Flagged": 2}

def brand_of(db: Session) -> models.Brand:
    b = db.scalars(select(models.Brand)).first()
    if not b:
        raise HTTPException(404, "No brand configured.")
    return b

def rules(b: models.Brand) -> dict:
    return {k: getattr(b, k) for k in ("facts", "banned", "risky", "terms", "banned_by_lang")}

def brand_out(b: models.Brand) -> dict:
    return {"id": b.id, "name": b.name, "tone": b.tone, **rules(b)}

def out(a: models.Analysis) -> dict:
    return {"id": a.id, "title": a.title, "kind": a.kind, "language": a.language, "score": a.score, "status": a.status,
            "review_state": a.review_state, "breakdown": a.breakdown, "issues": a.issues, "created_at": a.created_at.isoformat()}

class TextIn(BaseModel):
    text: str = Field(min_length=1, max_length=20000)
    title: str = "Untitled text"
    language: str = "en"

class CompareIn(BaseModel):
    draft_a: str = Field(min_length=1, max_length=20000)
    draft_b: str = Field(min_length=1, max_length=20000)
    language: str = "en"

class DecisionIn(BaseModel):
    decision: str = Field(pattern="^(approve|reject)$")

class PublishIn(BaseModel):
    channel: str = "website"

class BrandIn(BaseModel):
    tone: Optional[str] = None
    facts: Optional[list[dict]] = None
    banned: Optional[list[str]] = None
    risky: Optional[list[str]] = None
    terms: Optional[list[dict]] = None
    banned_by_lang: Optional[dict[str, list[str]]] = None

@app.get("/api/health")
def health():
    return {"ok": True}

@app.get("/api/brand")
def get_brand(db: Session = Depends(get_db)):
    return brand_out(brand_of(db))

@app.put("/api/brand")
def put_brand(body: BrandIn, db: Session = Depends(get_db)):
    b = brand_of(db)
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(b, k, v)
    db.commit()
    return brand_out(b)

@app.get("/api/demo/drafts")
def demo_drafts():
    return {"draft_a": DRAFT_A, "draft_b": DRAFT_B}

@app.post("/api/analyze/text")
def analyze_text(body: TextIn, db: Session = Depends(get_db)):
    b = brand_of(db)
    r = scoring.analyze(body.text, rules(b), body.language)
    a = models.Analysis(brand_id=b.id, kind="text", title=body.title, content=body.text, language=body.language,
                        score=r["score"], status=r["status"], breakdown=r["breakdown"], issues=r["issues"],
                        review_state="none" if r["status"] == "Approved" else "pending")
    db.add(a)
    db.commit()
    return out(a)

@app.post("/api/compare")
def compare(body: CompareIn, db: Session = Depends(get_db)):
    rl = rules(brand_of(db))
    a, b = (scoring.analyze(t, rl, body.language) for t in (body.draft_a, body.draft_b))
    winner = "A" if a["score"] > b["score"] else "B" if b["score"] > a["score"] else "tie"
    return {"a": a, "b": b, "winner": winner}

@app.get("/api/analyses")
def list_analyses(status: Optional[str] = None, db: Session = Depends(get_db)):
    q = select(models.Analysis).order_by(models.Analysis.id.desc())
    if status:
        q = q.where(models.Analysis.status == status)
    return [out(a) for a in db.scalars(q)]

@app.get("/api/review")
def review_queue(db: Session = Depends(get_db)):
    q = select(models.Analysis).where(models.Analysis.review_state == "pending").order_by(models.Analysis.id.desc())
    return [out(a) for a in db.scalars(q)]

@app.post("/api/review/{aid}")
def decide(aid: int, body: DecisionIn, db: Session = Depends(get_db)):
    a = db.get(models.Analysis, aid)
    if not a:
        raise HTTPException(404, "Analysis not found.")
    a.review_state = "approved" if body.decision == "approve" else "rejected"
    db.commit()
    return out(a)

@app.get("/api/publishable")
def publishable(db: Session = Depends(get_db)):
    done = set(db.scalars(select(models.Publication.analysis_id)))
    rows = db.scalars(select(models.Analysis).order_by(models.Analysis.id.desc()))
    return [out(a) for a in rows if a.id not in done and a.review_state != "rejected"
            and (a.status == "Approved" or a.review_state == "approved")]

@app.post("/api/analyses/{aid}/publish")
def publish(aid: int, body: PublishIn, db: Session = Depends(get_db)):
    a = db.get(models.Analysis, aid)
    if not a:
        raise HTTPException(404, "Analysis not found.")
    if a.review_state == "rejected" or not (a.status == "Approved" or a.review_state == "approved"):
        raise HTTPException(409, "Approve this content before publishing.")
    p = models.Publication(analysis_id=a.id, channel=body.channel)
    db.add(p)
    db.commit()
    # Simulated: no external channel is called. Replace with real channel clients here.
    return {"id": p.id, "analysis_id": a.id, "channel": p.channel, "simulated": True}

@app.get("/api/analytics")
def analytics(db: Session = Depends(get_db)):
    rows = list(db.scalars(select(models.Analysis)))
    n = len(rows)
    by_day: dict[str, list[int]] = defaultdict(list)
    comp: dict[str, list[int]] = defaultdict(list)
    for a in rows:
        by_day[a.created_at.date().isoformat()].append(a.score)
        for k, v in a.breakdown.items():
            comp[k].append(v["score"])
    avg = lambda xs: round(sum(xs) / len(xs)) if xs else 0
    return {
        "total": n, "average_score": avg([a.score for a in rows]),
        "by_status": dict(Counter(a.status for a in rows)),
        "trend": [{"date": d, "average": avg(s)} for d, s in sorted(by_day.items())],
        "components": {k: avg(v) for k, v in comp.items()},
        "top_issues": Counter(i["kind"] for a in rows for i in a.issues).most_common(5),
    }

@app.post("/api/monitor/scan")
def scan(db: Session = Depends(get_db)):
    """On-demand re-check of stored content against the current brand rules. Run it from a scheduler/cron for continuous monitoring."""
    b = brand_of(db)
    scanned = created = 0
    for a in db.scalars(select(models.Analysis).where(models.Analysis.brand_id == b.id)):
        scanned += 1
        r = scoring.analyze(a.content, rules(b), a.language)
        worse = RANK[r["status"]] > RANK[a.status] or a.score - r["score"] >= 5
        if worse:
            db.add(models.Alert(analysis_id=a.id, severity="high" if r["status"] == "Flagged" else "medium",
                                message=f'"{a.title}" dropped from {a.score} to {r["score"]} under the current brand rules.'))
            a.review_state = "pending"
            created += 1
        a.score, a.status, a.breakdown, a.issues = r["score"], r["status"], r["breakdown"], r["issues"]
    db.commit()
    return {"scanned": scanned, "alerts_created": created}

@app.get("/api/alerts")
def alerts(db: Session = Depends(get_db)):
    q = select(models.Alert).order_by(models.Alert.resolved, models.Alert.id.desc())
    return [{"id": x.id, "analysis_id": x.analysis_id, "message": x.message, "severity": x.severity,
             "resolved": x.resolved, "created_at": x.created_at.isoformat()} for x in db.scalars(q)]

@app.post("/api/alerts/{alert_id}/resolve")
def resolve(alert_id: int, db: Session = Depends(get_db)):
    x = db.get(models.Alert, alert_id)
    if not x:
        raise HTTPException(404, "Alert not found.")
    x.resolved = True
    db.commit()
    return {"id": x.id, "resolved": True}
