# BrandGuard

    backend/    FastAPI + SQLAlchemy (SQLite by default) + Pytest
    frontend/   React + TypeScript + Vite + Tailwind

## Run
    cd backend && python -m venv .venv && . .venv/bin/activate
    pip install -r requirements.txt
    pytest
    uvicorn app.main:app --reload          # http://localhost:8000/docs

    cd frontend && cp .env.example .env    # set VITE_API_URL=http://localhost:8000
    npm install && npm run dev

## Workflow
Content Checker -> trust score (facts 40 / tone 30 / terminology 20 / compliance 10) -> below 80 goes to Review Queue
-> approve -> Publish (simulated) -> change a brand rule -> Alerts > Scan now re-checks stored content.

## Known limits
Publishing is simulated, monitoring is an on-demand scan (call /api/monitor/scan from cron),
visual analysis is still a sample report, and the dashboard/history pages still show demo data.
