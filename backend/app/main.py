from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import (
    health,
    products,
    categories,
    special_offers,
    testimonials,
    auth,
    cart,
    wishlist,
    orders,
    addresses,
    promo,
    contact,
    admin,
    admin_catalog,
    admin_inventory,
    reviews,
    admin_reviews,
)

app = FastAPI(
    title="Alphonsa Hypermarket API",
    description="REST API for Alphonsa Hypermarket — Kattathurai",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)
# ─── SECURITY HEADERS ────────────────────────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    if settings.APP_ENV != "development":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=()"
    return response

# ─── CORS ────────────────────────────────────────────────────────────────────# Setup CORS for local network usage
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for intranet usage
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── ROUTERS ─────────────────────────────────────────────────────────────────
app.include_router(health.router,         prefix="/api")
app.include_router(products.router,       prefix="/api")
app.include_router(categories.router,     prefix="/api")
app.include_router(special_offers.router, prefix="/api")
app.include_router(testimonials.router,   prefix="/api")
app.include_router(auth.router,           prefix="/api")
app.include_router(cart.router,           prefix="/api")
app.include_router(wishlist.router,       prefix="/api")
app.include_router(orders.router,         prefix="/api")
app.include_router(addresses.router,      prefix="/api")
app.include_router(promo.router,          prefix="/api")
app.include_router(contact.router,        prefix="/api")
app.include_router(admin.router,          prefix="/api")
app.include_router(admin_catalog.router,  prefix="/api")
app.include_router(admin_inventory.router, prefix="/api")
app.include_router(reviews.router,         prefix="/api")
app.include_router(admin_reviews.router,   prefix="/api")
