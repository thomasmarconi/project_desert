.PHONY: db-up db-down frontend backend setup-frontend setup-backend setup generate-types

# Database
db-up:
	docker compose up -d

db-down:
	docker compose down

db-logs:
	docker compose logs -f postgres

# Run services
frontend:
	cd frontend && npm run dev

backend:
	cd api && venv/Scripts/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Setup
setup-frontend:
	cd frontend && npm install

setup-backend:
	cd api && python3 -m venv venv && venv/Scripts/pip install -r requirements.txt && venv/Scripts/alembic upgrade head

setup: setup-frontend setup-backend

# TypeScript Types Generation
generate-types:
	cd frontend && npm run generate:types

# Database migrations (backend)
db-migrate:
	cd api && venv/Scripts/alembic upgrade head

db-migrate-create:
	cd api && venv/Scripts/alembic revision --autogenerate -m "$(message)"
