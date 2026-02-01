#!/usr/bin/env bash
set -euo pipefail

# E2E runner (local):
# - expects Postgres already running at DATABASE_URL
# - migrates + seeds
# - starts api + web
# - waits for web
# - runs playwright

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v psql >/dev/null 2>&1; then
  echo "[e2e] psql not found. Please install PostgreSQL client (or use a hosted DB)." >&2
  exit 2
fi

: "${DATABASE_URL:?DATABASE_URL is required (point to a running Postgres)}"

echo "[e2e] Migrating + seeding…"
cd api
cp -n .env.e2e.example .env || true
npm run prisma:migrate
npm run seed
cd ..

echo "[e2e] Starting API + Web…"
(cd api && npm run dev) &
API_PID=$!
(cd web && npm run dev) &
WEB_PID=$!

cleanup() {
  echo "[e2e] Cleaning up…"
  kill "$API_PID" "$WEB_PID" 2>/dev/null || true
}
trap cleanup EXIT

npx wait-on http://localhost:5173 --timeout 60000

echo "[e2e] Running Playwright…"
E2E_BASE_URL=http://localhost:5173 npx playwright test
