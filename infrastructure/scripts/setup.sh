#!/bin/bash

set -e

echo "Setting up FixBari development environment..."

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Aborting." >&2; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "pnpm is required but not installed. Install with: npm install -g pnpm" >&2; exit 1; }

# Install dependencies
echo "Installing Node.js dependencies..."
pnpm install

# Install Python dependencies
echo "Installing Python dependencies for notifications service..."
cd services/notifications
python -m venv .venv || python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
deactivate
cd ../..

echo "Installing Python dependencies for payment service..."
cd services/payment
python -m venv .venv || python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
deactivate
cd ../..

# Copy environment file
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cp .env.example .env
fi

# Start infrastructure
echo "Starting infrastructure services (PostgreSQL, RabbitMQ)..."
docker-compose up -d postgres rabbitmq

# Wait for services to be healthy
echo "Waiting for services to be ready..."
sleep 10

# Run database migrations
echo "Running database migrations..."

# Auth service migrations
cd services/auth
pnpm prisma generate
pnpm prisma migrate dev --name init
cd ../..

# Orders service migrations
cd services/orders
pnpm prisma generate
pnpm prisma migrate dev --name init
cd ../..

# Notifications service migrations (Alembic)
cd services/notifications
source .venv/bin/activate
# Note: You'll need to set up Alembic for migrations
deactivate
cd ../..

# Payment service migrations (Django)
cd services/payment
source .venv/bin/activate
python manage.py migrate
deactivate
cd ../..

echo ""
echo "Setup complete!"
echo ""
echo "To start all services:"
echo "  make dev"
echo ""
echo "Or to start only infrastructure:"
echo "  make dev-infra"
echo ""
echo "Then run JS/TS services with:"
echo "  make dev-js"
echo ""
