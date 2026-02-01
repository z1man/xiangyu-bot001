# AP Lang Practice App (MVP)

Web app for **AP English Language & Composition** practice.

## MVP scope
- React (TypeScript) frontend
- Node.js (TypeScript) backend
- PostgreSQL
- Username/password auth
- Passage-based quizzes (10 MCQ per quiz)
- Submission saved + auto-scored (MCQ)
- Rubric self-scoring (0–5 each): **Evidence / Reasoning / Style**
- UI copy in English

## Repo structure
- `web/` React app
- `api/` Fastify API + Prisma
- `docs/` product notes

## Local dev (quickstart)
1) Start Postgres
```bash
docker compose up -d
```

2) API
```bash
cd api
cp .env.example .env
npm install
npm run prisma:migrate
npm run dev
```

3) Web
```bash
cd web
npm install
npm run dev
```

Open:
- Web: http://localhost:5173
- API health: http://localhost:3001/health

## Notes
Content ingestion (public-domain/CC passages) and question generation will be added via scripts under `scripts/`.
