#!/bin/sh
set -e

echo "🚀 Starting Store Service..."
npx prisma generate
npx prisma db push --accept-data-loss || echo "⚠️  DB push failed"
node prisma/seed.js || echo "⚠️  Seed skipped"
exec node src/index.js
