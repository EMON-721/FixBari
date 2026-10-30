#!/bin/bash

# Local Development Script - Runs all services without Docker
# Prerequisites:
#   - Node.js 20+
#   - pnpm 9+
#   - Python 3.11+ with poetry
#   - PostgreSQL (provide DATABASE_URL in .env)
#   - RabbitMQ running locally
#   - Traefik installed (brew install traefik)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   FixBari - Development Mode   ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if .env exists
if [ ! -f "$ROOT_DIR/.env" ]; then
    echo -e "${RED}Error: .env file not found. Please create one from .env.example${NC}"
    exit 1
fi

# Load environment variables
set -a
source "$ROOT_DIR/.env"
set +a

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}Error: pnpm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ pnpm $(pnpm --version)${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python $(python3 --version)${NC}"

# Check Poetry
if ! command -v poetry &> /dev/null; then
    echo -e "${YELLOW}Warning: Poetry is not installed. Python services may not work.${NC}"
else
    echo -e "${GREEN}✓ Poetry $(poetry --version)${NC}"
fi

# Check Traefik
if ! command -v traefik &> /dev/null; then
    echo -e "${YELLOW}Warning: Traefik is not installed. Install with: brew install traefik${NC}"
    TRAEFIK_AVAILABLE=false
else
    echo -e "${GREEN}✓ Traefik $(traefik version --short 2>/dev/null || echo 'installed')${NC}"
    TRAEFIK_AVAILABLE=true
fi

# Check RabbitMQ
if ! nc -z localhost 5672 2>/dev/null; then
    echo -e "${YELLOW}Warning: RabbitMQ doesn't seem to be running on port 5672${NC}"
else
    echo -e "${GREEN}✓ RabbitMQ is running${NC}"
fi

# Check PostgreSQL
if ! nc -z localhost 5432 2>/dev/null; then
    echo -e "${YELLOW}Warning: PostgreSQL doesn't seem to be running on port 5432${NC}"
else
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
fi

echo ""
echo -e "${YELLOW}Starting services...${NC}"
echo ""

# Create a function to run a command in the background with logging
run_service() {
    local name=$1
    local dir=$2
    local cmd=$3
    local port=$4

    echo -e "${BLUE}Starting $name on port $port...${NC}"
    cd "$ROOT_DIR/$dir"
    $cmd &
    echo "$!" >> "$ROOT_DIR/.pids"
}

# Clean up old PIDs file
rm -f "$ROOT_DIR/.pids"
touch "$ROOT_DIR/.pids"

# Trap to clean up on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    if [ -f "$ROOT_DIR/.pids" ]; then
        while read pid; do
            kill $pid 2>/dev/null || true
        done < "$ROOT_DIR/.pids"
        rm -f "$ROOT_DIR/.pids"
    fi
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

# Start Traefik (if available)
if [ "$TRAEFIK_AVAILABLE" = true ]; then
    echo -e "${BLUE}Starting Traefik...${NC}"
    cd "$ROOT_DIR"
    traefik --configFile=infrastructure/traefik/traefik.yml &
    echo "$!" >> "$ROOT_DIR/.pids"
    echo -e "${GREEN}✓ Traefik started - Dashboard: http://localhost:8080${NC}"
fi

echo ""
echo -e "${BLUE}Starting backend services...${NC}"

# Start Auth Service (NestJS)
cd "$ROOT_DIR/services/auth"
pnpm dev &
echo "$!" >> "$ROOT_DIR/.pids"
echo -e "${GREEN}✓ Auth service starting on port 3001${NC}"

# Start Orders Service (Express)
cd "$ROOT_DIR/services/orders"
pnpm dev &
echo "$!" >> "$ROOT_DIR/.pids"
echo -e "${GREEN}✓ Orders service starting on port 3003${NC}"

# Start Notifications Service (FastAPI) - if poetry is available
if command -v poetry &> /dev/null; then
    cd "$ROOT_DIR/services/notifications"
    if [ -f "pyproject.toml" ]; then
        poetry install --quiet 2>/dev/null || true
        poetry run uvicorn app.main:app --host 0.0.0.0 --port 3002 --reload &
        echo "$!" >> "$ROOT_DIR/.pids"
        echo -e "${GREEN}✓ Notifications service starting on port 3002${NC}"
    fi
fi

# Start Payment Service (Django) - if poetry is available
if command -v poetry &> /dev/null; then
    cd "$ROOT_DIR/services/payment"
    if [ -f "pyproject.toml" ]; then
        poetry install --quiet 2>/dev/null || true
        poetry run python manage.py runserver 0.0.0.0:3004 &
        echo "$!" >> "$ROOT_DIR/.pids"
        echo -e "${GREEN}✓ Payment service starting on port 3004${NC}"
    fi
fi

echo ""
echo -e "${BLUE}Starting frontend apps...${NC}"

# Start Web App
cd "$ROOT_DIR/apps/web"
pnpm dev &
echo "$!" >> "$ROOT_DIR/.pids"
echo -e "${GREEN}✓ Web app starting on port 3000${NC}"

# Start Admin Panel
cd "$ROOT_DIR/apps/admin"
pnpm dev &
echo "$!" >> "$ROOT_DIR/.pids"
echo -e "${GREEN}✓ Admin panel starting on port 3010${NC}"

# Start Technician Panel
cd "$ROOT_DIR/apps/technician"
pnpm dev &
echo "$!" >> "$ROOT_DIR/.pids"
echo -e "${GREEN}✓ Technician panel starting on port 3020${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   All services started!               ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Access points:${NC}"
echo -e "  Web App:        http://localhost:3000 (or http://localhost via Traefik)"
echo -e "  Admin Panel:    http://localhost:3010 (or http://admin.localhost via Traefik)"
echo -e "  Technician:     http://localhost:3020 (or http://technician.localhost via Traefik)"
echo -e "  Traefik Dashboard: http://localhost:8080"
echo ""
echo -e "${BLUE}API endpoints (via Traefik on port 80):${NC}"
echo -e "  Auth API:         http://localhost/api/auth"
echo -e "  Notifications:    http://localhost/api/notifications"
echo -e "  Orders API:       http://localhost/api/orders"
echo -e "  Payment API:      http://localhost/api/payment"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for all background processes
wait
