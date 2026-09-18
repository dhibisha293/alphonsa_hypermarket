from typing import Optional, List
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime


# ─── PRODUCT ──────────────────────────────────────────────────────────────────

class ProductOut(BaseModel):
    id: str
    sku: Optional[str] = None
    barcode: Optional[str] = None
    name: str
    description: Optional[str] = None
    category: str           # maps to category_slug from DB
    categoryLabel: str      # maps to category_label
    subcategory_id: Optional[str] = None
    brand_id: Optional[str] = None
    price: float
    originalPrice: Optional[float] = None
    discount: int = 0
    tax_rate: float = 0
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
            barcode=row.get("barcode"),
            name=row["name"],
            description=row.get("description"),
            category=row["category_slug"],
            categoryLabel=row["category_label"],
            subcategory_id=str(row["subcategory_id"]) if row.get("subcategory_id") else None,
            brand_id=str(row["brand_id"]) if row.get("brand_id") else None,
            price=float(row["price"]),
            originalPrice=float(row["original_price"]) if row.get("original_price") else None,
            discount=row.get("discount", 0),
            tax_rate=float(row.get("tax_rate", 0)),
            rating=float(row.get("rating", 0)),
            reviews=row.get("reviews_count", 0),
            image=row.get("image_url"),
            unit=row.get("unit"),
            isBestseller=row.get("is_bestseller", False),
            isNew=row.get("is_new", False),
            stock_qty=row.get("stock_qty", 999),
        )

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    category_slug: str
    category_label: str
    subcategory_id: Optional[str] = None
    brand_id: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    discount: int = 0
    tax_rate: float = 0
    image_url: Optional[str] = None
    unit: Optional[str] = None
    is_bestseller: bool = False
    is_new: bool = False
    stock_qty: int = 999

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    category_slug: Optional[str] = None
    category_label: Optional[str] = None
    subcategory_id: Optional[str] = None
    brand_id: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    discount: Optional[int] = None
    tax_rate: Optional[float] = None
    image_url: Optional[str] = None
    unit: Optional[str] = None
    is_bestseller: Optional[bool] = None
    is_new: Optional[bool] = None
    stock_qty: Optional[int] = None
    is_active: Optional[bool] = None

class ProductListResponse(BaseModel):
    total: int
    page: int
    limit: int
    products: List[ProductOut]


# ─── BRAND ──────────────────────────────────────────────────────────────────────

class BrandOut(BaseModel):
    id: str
    name: str
    slug: str
    logo_url: Optional[str] = None
    description: Optional[str] = None
    is_active: bool

    @classmethod
    def from_db(cls, row: dict) -> "BrandOut":
        return cls(
            id=str(row["id"]),
            name=row["name"],
            slug=row["slug"],
            logo_url=row.get("logo_url"),
            description=row.get("description"),
            is_active=row.get("is_active", True)
        )

class BrandCreate(BaseModel):
    name: str
    slug: str
    logo_url: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True


# ─── CATEGORY & SUBCATEGORY ───────────────────────────────────────────────────

class SubcategoryOut(BaseModel):
    id: str
    category_id: str
    name: str
    slug: str
    description: Optional[str] = None
    is_active: bool

    @classmethod
    def from_db(cls, row: dict) -> "SubcategoryOut":
        return cls(
            id=str(row["id"]),
            category_id=str(row["category_id"]),
            name=row["name"],
            slug=row["slug"],
            description=row.get("description"),
            is_active=row.get("is_active", True)
        )

class SubcategoryCreate(BaseModel):
    category_id: str
    name: str
    slug: str
    description: Optional[str] = None
    is_active: bool = True

class CategoryOut(BaseModel):
    id: str
    slug: str
    name: str
    icon: str
    count: str          # item_count label
    image: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0

    @classmethod
    def from_db(cls, row: dict) -> "CategoryOut":
        return cls(
            id=str(row["id"]),
            slug=row["slug"],
            name=row["name"],
            icon=row.get("icon", "🛒"),
            count=row.get("item_count", "0 items"),
            image=row.get("image_url"),
            is_active=row.get("is_active", True),
            sort_order=row.get("sort_order", 0)
        )

class CategoryCreate(BaseModel):
    name: str
    slug: str
    icon: Optional[str] = "🛒"
    image_url: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0

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
