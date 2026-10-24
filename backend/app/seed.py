from sqlalchemy import select
from sqlalchemy.orm import Session
from . import models

DRAFT_A = ("NovaTech Cloud is the revolutionary, world-class platform! Founded in 2015 and headquartered in "
           "Mumbai, we are 100% guaranteed to cut your costs. Try Novatech today!")
DRAFT_B = ("NovaTech Cloud helps you track cloud spend in one place. Founded in 2019 and headquartered in "
           "Bengaluru, NovaTech keeps its uptime SLA at 99.9%. See how it works.")

NOVATECH = dict(
    name="NovaTech Demo",
    tone="Confident, clear and factual. Short sentences. Address the reader as 'you'. No hype, no exclamation marks.",
    facts=[
        {"label": "Founding year", "correct": "NovaTech was founded in 2019.", "contradicts": r"(?i:founded in )(?!2019)\d{4}"},
        {"label": "Headquarters", "correct": "NovaTech is headquartered in Bengaluru.", "contradicts": r"(?i:headquartered in )(?!Bengaluru)[A-Z]\w+"},
        {"label": "Uptime SLA", "correct": "The uptime SLA is 99.9%.", "contradicts": r"99\.99%|100% uptime"},
    ],
    banned=["revolutionary", "world-class", "game-changer", "cutting-edge"],
    risky=["guaranteed", "risk-free", "clinically proven"],
    terms=[{"approved": "NovaTech Cloud", "wrong": ["Novatech", "Nova Tech", "NOVATECH"]}],
    banned_by_lang={
        "es": ["revolucionario", "revolucionaria", "de clase mundial"],
        "hi": ["क्रांतिकारी", "विश्व स्तरीय"],
        "ta": ["புரட்சிகரமான", "உலகத் தரம் வாய்ந்த"],
    },
)

def seed(db: Session) -> None:
    if db.scalars(select(models.Brand)).first() is None:
        db.add(models.Brand(**NOVATECH))
        db.commit()
