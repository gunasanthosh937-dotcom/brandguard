from datetime import datetime, timezone
from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base

def now():
    return datetime.now(timezone.utc)

class Brand(Base):
    __tablename__ = "brands"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    tone: Mapped[str] = mapped_column(Text, default="")
    facts: Mapped[list] = mapped_column(JSON, default=list)          # [{label, correct, contradicts(regex)}]
    banned: Mapped[list] = mapped_column(JSON, default=list)
    risky: Mapped[list] = mapped_column(JSON, default=list)
    terms: Mapped[list] = mapped_column(JSON, default=list)          # [{approved, wrong:[...]}]
    banned_by_lang: Mapped[dict] = mapped_column(JSON, default=dict)  # {"hi": [...], "es": [...]}

class Analysis(Base):
    __tablename__ = "analyses"
    id: Mapped[int] = mapped_column(primary_key=True)
    brand_id: Mapped[int] = mapped_column(ForeignKey("brands.id"))
    kind: Mapped[str] = mapped_column(String(10), default="text")
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text)
    language: Mapped[str] = mapped_column(String(8), default="en")
    score: Mapped[int] = mapped_column()
    status: Mapped[str] = mapped_column(String(20))
    breakdown: Mapped[dict] = mapped_column(JSON)
    issues: Mapped[list] = mapped_column(JSON)
    review_state: Mapped[str] = mapped_column(String(10), default="none")  # none|pending|approved|rejected
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class Publication(Base):
    __tablename__ = "publications"
    id: Mapped[int] = mapped_column(primary_key=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.id"))
    channel: Mapped[str] = mapped_column(String(40))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class Alert(Base):
    __tablename__ = "alerts"
    id: Mapped[int] = mapped_column(primary_key=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.id"))
    message: Mapped[str] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(String(10))
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
