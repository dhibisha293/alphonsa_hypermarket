from typing import Optional, List
from pydantic import BaseModel


# ─── CART ─────────────────────────────────────────────────────────────────────

class CartAddRequest(BaseModel):
    product_id: str
    quantity: int = 1

    class Config:
        json_schema_extra = {"example": {"product_id": "uuid-here", "quantity": 2}}


class CartUpdateRequest(BaseModel):
    quantity: int


class CartItemOut(BaseModel):
    id: str
    product_id: str
    quantity: int
    # Joined product fields — same shape as React's cartItems
    name: str
    price: float
    originalPrice: Optional[float] = None
    image: Optional[str] = None
    unit: Optional[str] = None
    category: str
    categoryLabel: str

    @classmethod
    def from_db(cls, row: dict) -> "CartItemOut":
        p = row.get("products", {}) or {}
        return cls(
            id=str(row["id"]),
            product_id=str(row["product_id"]),
            quantity=row["quantity"],
            name=p.get("name", ""),
            price=float(p.get("price", 0)),
            originalPrice=float(p["original_price"]) if p.get("original_price") else None,
            image=p.get("image_url"),
            unit=p.get("unit"),
            category=p.get("category_slug", ""),
            categoryLabel=p.get("category_label", ""),
        )


# ─── WISHLIST ─────────────────────────────────────────────────────────────────

class WishlistAddRequest(BaseModel):
    product_id: str


class WishlistItemOut(BaseModel):
    id: str
    product_id: str
    name: str
    price: float
    image: Optional[str] = None
    unit: Optional[str] = None
    category: str
    categoryLabel: str

    @classmethod
    def from_db(cls, row: dict) -> "WishlistItemOut":
        p = row.get("products", {}) or {}
        return cls(
            id=str(row["id"]),
            product_id=str(row["product_id"]),
            name=p.get("name", ""),
            price=float(p.get("price", 0)),
            image=p.get("image_url"),
            unit=p.get("unit"),
            category=p.get("category_slug", ""),
            categoryLabel=p.get("category_label", ""),
        )


# ─── ORDERS ───────────────────────────────────────────────────────────────────

class OrderItemIn(BaseModel):
    product_id: str
    quantity: int


class PlaceOrderRequest(BaseModel):
    items: List[OrderItemIn]
    promo_code: Optional[str] = None
    points_redeemed: Optional[int] = 0
    delivery_address: Optional[str] = None
    notes: Optional[str] = None


class OrderOut(BaseModel):
    id: str
    order_number: str
    status: str
    subtotal: float
    discount_amount: float
    shipping_fee: float
    total: float
    promo_code: Optional[str] = None
    created_at: str

    @classmethod
    def from_db(cls, row: dict) -> "OrderOut":
        return cls(
            id=str(row["id"]),
            order_number=row["order_number"],
            status=row["status"],
            subtotal=float(row["subtotal"]),
            discount_amount=float(row["discount_amount"]),
            shipping_fee=float(row["shipping_fee"]),
            total=float(row["total"]),
            promo_code=row.get("promo_code"),
            created_at=str(row["created_at"]),
        )


# ─── PROMO ────────────────────────────────────────────────────────────────────

class PromoValidateRequest(BaseModel):
    code: str


class PromoValidateResponse(BaseModel):
    valid: bool
    discount_pct: int = 0
    message: str = ""


# ─── CONTACT ──────────────────────────────────────────────────────────────────

class ContactMessageRequest(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    message: str

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Priya",
                "email": "priya@example.com",
                "message": "When will my order arrive?"
            }
        }
