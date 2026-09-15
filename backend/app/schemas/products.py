from typing import Optional, List
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime


# ─── PRODUCT ──────────────────────────────────────────────────────────────────

class ProductOut(BaseModel):
    id: str
    sku: Optional[str] = None
    name: str
    description: Optional[str] = None
    category: str           # maps to category_slug from DB
    categoryLabel: str      # maps to category_label
    price: float
    originalPrice: Optional[float] = None
    discount: int = 0
    rating: float = 0
    reviews: int = 0        # maps to reviews_count
    image: Optional[str] = None
    unit: Optional[str] = None
    isBestseller: bool = False
    isNew: bool = False
    stock_qty: int = 999

    @classmethod
    def from_db(cls, row: dict) -> "ProductOut":
        return cls(
            id=str(row["id"]),
            sku=row.get("sku"),
            name=row["name"],
            description=row.get("description"),
            category=row["category_slug"],
            categoryLabel=row["category_label"],
            price=float(row["price"]),
            originalPrice=float(row["original_price"]) if row.get("original_price") else None,
            discount=row.get("discount", 0),
            rating=float(row.get("rating", 0)),
            reviews=row.get("reviews_count", 0),
            image=row.get("image_url"),
            unit=row.get("unit"),
            isBestseller=row.get("is_bestseller", False),
            isNew=row.get("is_new", False),
            stock_qty=row.get("stock_qty", 999),
        )


class ProductListResponse(BaseModel):
    total: int
    page: int
    limit: int
    products: List[ProductOut]


# ─── CATEGORY ─────────────────────────────────────────────────────────────────

class CategoryOut(BaseModel):
    id: str
    slug: str
    name: str
    icon: str
    count: str          # item_count label
    image: Optional[str] = None

    @classmethod
    def from_db(cls, row: dict) -> "CategoryOut":
        return cls(
            id=str(row["id"]),
            slug=row["slug"],
            name=row["name"],
            icon=row.get("icon", "🛒"),
            count=row.get("item_count", "0 items"),
            image=row.get("image_url"),
        )


# ─── SPECIAL OFFER ────────────────────────────────────────────────────────────

class SpecialOfferOut(BaseModel):
    id: str
    title: str
    discountText: str
    description: Optional[str] = None
    code: str
    discount_pct: int
    validTill: Optional[str] = None
    badge: Optional[str] = None

    @classmethod
    def from_db(cls, row: dict) -> "SpecialOfferOut":
        return cls(
            id=str(row["id"]),
            title=row["title"],
            discountText=row["discount_text"],
            description=row.get("description"),
            code=row["code"],
            discount_pct=row.get("discount_pct", 0),
            validTill=row.get("valid_till_text"),
            badge=row.get("badge"),
        )


# ─── TESTIMONIAL ──────────────────────────────────────────────────────────────

class TestimonialOut(BaseModel):
    id: str
    name: str
    role: Optional[str] = None
    comment: str
    rating: int
    avatar: Optional[str] = None
    location: Optional[str] = None

    @classmethod
    def from_db(cls, row: dict) -> "TestimonialOut":
        return cls(
            id=str(row["id"]),
            name=row["name"],
            role=row.get("role"),
            comment=row["comment"],
            rating=row["rating"],
            avatar=row.get("avatar_url"),
            location=row.get("location"),
        )
