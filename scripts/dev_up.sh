#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

docker compose up -d

cd api
cp -n .env.example .env || true
npm run prisma:migrate
npm run seed

# Start API
(FAKE_LLM=${FAKE_LLM:-0} APP_ENC_KEY=${APP_ENC_KEY:-0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef} \
  JWT_SECRET=${JWT_SECRET:-change_me} CORS_ORIGIN=${CORS_ORIGIN:-http://localhost:5173} npm run dev) &
API_PID=$!

cd ../web
( npm run dev -- --host 127.0.0.1 --port 5173 ) &
WEB_PID=$!

echo "API_PID=$API_PID WEB_PID=$WEB_PID"
wait
