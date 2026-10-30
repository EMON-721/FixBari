.PHONY: install dev build test lint clean docker-up docker-down docker-build help

# Colors for output
GREEN := \033[0;32m
NC := \033[0m # No Color

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install all dependencies
	pnpm install
	cd services/notifications && poetry install
	cd services/payment && poetry install

dev: ## Start all services with Docker Compose (development)
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

dev-js: ## Start only JS/TS services with Turborepo
	pnpm dev

dev-local: ## Start all services locally without Docker (requires local Postgres, RabbitMQ, Traefik)
	./infrastructure/scripts/dev-local.sh

dev-infra: ## Start only infrastructure (Postgres, RabbitMQ, Traefik)
	docker-compose up -d traefik postgres rabbitmq

build: ## Build all services
	pnpm build
	docker-compose build

test: ## Run all tests
	pnpm test
	cd services/notifications && poetry run pytest
	cd services/payment && poetry run pytest

lint: ## Lint all code
	pnpm lint
	cd services/notifications && poetry run ruff check .
	cd services/payment && poetry run ruff check .

clean: ## Clean all build artifacts
	pnpm clean
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true

docker-up: ## Start all Docker containers
	docker-compose up -d

docker-down: ## Stop all Docker containers
	docker-compose down

docker-build: ## Build all Docker images
	docker-compose build

docker-logs: ## View Docker logs
	docker-compose logs -f

db-migrate: ## Run database migrations for all services
	cd services/auth && pnpm prisma migrate dev
	cd services/orders && pnpm prisma migrate dev
	cd services/notifications && poetry run alembic upgrade head
	cd services/payment && poetry run python manage.py migrate
