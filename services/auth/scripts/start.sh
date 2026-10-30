#!/bin/sh
set -e

echo "Running Prisma migrations..."
cd /app/packages/database
npx prisma migrate deploy

echo "Starting auth service..."
cd /app
exec node dist/main.js
