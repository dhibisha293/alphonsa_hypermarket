# Alphonsa Hypermarket — Backend API

FastAPI REST API for Alphonsa Hypermarket, Kattathurai.

## Tech Stack
- **Python** 3.11+
- **FastAPI** 0.115
- **Supabase** PostgreSQL (via `supabase-py`)
- **Uvicorn** ASGI server
- **Pydantic** v2 for validation

---

## Architecture

```
React Frontend (port 5173)
        ↓  HTTP requests (fetch)
FastAPI REST API (port 8000)
        ↓  Supabase Python Client
Supabase PostgreSQL (cloud)
```

---

## Quick Start

### 1. Set up Supabase
1. Go to https://supabase.com → Create new project
2. Go to **SQL Editor** → Run each migration file in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_indexes.sql`
   - `supabase/migrations/003_rls.sql`
   - `supabase/migrations/004_seed_data.sql`
3. Go to **Project Settings → API** → copy your keys

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and fill in your Supabase URL and keys
```

### 3. Install dependencies
```bash
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

### 4. Start the server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Test
- Swagger UI: http://localhost:8000/docs
- ReDoc:       http://localhost:8000/redoc
- Health:      http://localhost:8000/api/health

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/products` | No | List products (filter, search, paginate) |
| GET | `/api/products/{id}` | No | Get single product |
| GET | `/api/categories` | No | List all categories |
| GET | `/api/special-offers` | No | List active promo offers |
| GET | `/api/testimonials` | No | List testimonials |
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, get JWT |
| POST | `/api/auth/logout` | No | Logout |
| GET | `/api/cart` | JWT | Get user's cart |
| POST | `/api/cart` | JWT | Add item to cart |
| PUT | `/api/cart/{id}` | JWT | Update cart item quantity |
| DELETE | `/api/cart/{id}` | JWT | Remove cart item |
| DELETE | `/api/cart` | JWT | Clear cart |
| GET | `/api/wishlist` | JWT | Get user's wishlist |
| POST | `/api/wishlist` | JWT | Add to wishlist |
| DELETE | `/api/wishlist/{product_id}` | JWT | Remove from wishlist |
| POST | `/api/orders` | JWT | Place order (checkout) |
| GET | `/api/orders` | JWT | Order history |
| GET | `/api/orders/{id}` | JWT | Single order details |
| POST | `/api/promo/validate` | No | Validate promo code |
| POST | `/api/contact` | No | Submit contact message |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Public anon key (for auth operations) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only, never expose to frontend) |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins |
| `APP_ENV` | `development` or `production` |
| `SECRET_KEY` | App secret key |
