# FastAPI Product Catalog

A modern full-stack product catalog built with **FastAPI**, **SQLAlchemy**, **PostgreSQL**, and a **React + Vite** frontend.

## 🚀 What this project does

- Serves a REST API using `FastAPI`
- Persists product data in PostgreSQL via `SQLAlchemy`
- Uses Pydantic models for request validation
- Offers CRUD endpoints for product management
- Includes a React frontend powered by `Vite`
- Enables CORS support for frontend integration

## 🔧 Backend dependencies

The backend dependencies are listed in `requirements.txt`:

- `fastapi`
- `uvicorn[standard]`
- `sqlalchemy`
- `psycopg2-binary`

## 🧱 Project structure

- `backend/main.py` — FastAPI application and endpoints
- `backend/database.py` — SQLAlchemy engine and session setup
- `backend/database_models.py` — SQLAlchemy ORM model definitions
- `backend/models.py` — Pydantic request/response schemas
- `frontend/` — React + Vite frontend app

## ✅ API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Welcome message |
| GET | `/products` | List all products |
| GET | `/products/{id}` | Get product by ID |
| POST | `/products` | Add a new product |
| PUT | `/products/{id}` | Update a product |
| DELETE | `/products/{id}` | Delete a product |

## 📦 Setup

### 1. Backend

1. Create and activate your virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Configure the PostgreSQL database URL in `backend/database.py` if needed.

4. Run the API server:

```powershell
uvicorn backend.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### 2. Frontend

1. Open a terminal in `frontend/`.
2. Install Node dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm run dev
```

The frontend should run at `http://localhost:5173`.

## 💡 Notes

- The backend currently seeds sample product data into PostgreSQL if the table is empty.
- CORS is configured for `http://localhost:5173` and `http://127.0.0.1:5173`.

## 🌟 Showcase

This repository demonstrates how to build a fast, type-safe Python API and pair it with a modern React frontend. It is perfect for learning or bootstrapping product catalog applications.
