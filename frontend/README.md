# BrandGuard frontend
React + TypeScript + Vite + Tailwind.

    npm install
    npm run dev      # http://localhost:5173
    npm run build

Demo mode is on by default (sample data, local scoring).
To use the FastAPI backend: copy `.env.example` to `.env` and set `VITE_API_URL`.
The Content Checker then POSTs `{ text, guidelines }` to `/api/analyze/text` and expects `{ score, issues: [{kind, detail, fix}] }`.
