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
    promo,
    contact,
)

app = FastAPI(
    title="Alphonsa Hypermarket API",
    description="REST API for Alphonsa Hypermarket — Kattathurai",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
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
app.include_router(promo.router,          prefix="/api")
app.include_router(contact.router,        prefix="/api")
