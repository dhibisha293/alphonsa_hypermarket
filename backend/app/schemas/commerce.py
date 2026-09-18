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
    address_id: Optional[str] = None
    delivery_address: Optional[str] = None # Fallback
    payment_method: str = "COD"
    delivery_method: str = "DELIVERY"
    delivery_date: Optional[str] = None
    delivery_time_slot: Optional[str] = None
    notes: Optional[str] = None

class OrderOut(BaseModel):
    id: str
    order_number: str
    status: str
    payment_method: str
    payment_status: str
    delivery_method: str
    delivery_slot: Optional[str] = None
    subtotal: float
    discount_amount: float
    tax_amount: float
    shipping_fee: float
    total: float
    promo_code: Optional[str] = None
    delivery_address: Optional[str] = None
    created_at: str

    @classmethod
    def from_db(cls, row: dict) -> "OrderOut":
        return cls(
            id=str(row["id"]),
            order_number=row["order_number"],
            status=row["status"],
            payment_method=row.get("payment_method", "COD"),
            payment_status=row.get("payment_status", "PENDING"),
            delivery_method=row.get("delivery_method", "DELIVERY"),
            delivery_slot=row.get("delivery_slot"),
            subtotal=float(row["subtotal"]),
            discount_amount=float(row["discount_amount"]),
            tax_amount=float(row.get("tax_amount", 0)),
            shipping_fee=float(row["shipping_fee"]),
            total=float(row["total"]),
            promo_code=row.get("promo_code"),
            delivery_address=row.get("delivery_address"),
            created_at=str(row["created_at"]),
        )


# ─── ADDRESS ──────────────────────────────────────────────────────────────────

class AddressCreate(BaseModel):
    full_name: str
    phone: str
    address_line: str
    area: str
    city: str
    state: str
    pincode: str
    delivery_instructions: Optional[str] = None
    is_default: bool = False

class AddressOut(BaseModel):
    id: str
    full_name: str
    phone: str
    address_line: str
    area: str
    city: str
    state: str
    pincode: str
    delivery_instructions: Optional[str] = None
    is_default: bool
    created_at: str

    @classmethod
    def from_db(cls, row: dict) -> "AddressOut":
        return cls(
            id=str(row["id"]),
            full_name=row["full_name"],
            phone=row["phone"],
            address_line=row["address_line"],
            area=row["area"],
            city=row["city"],
            state=row["state"],
            pincode=row["pincode"],
            delivery_instructions=row.get("delivery_instructions"),
            is_default=bool(row.get("is_default", False)),
            created_at=str(row["created_at"])
        )

# ─── PROMO ────────────────────────────────────────────────────────────────────

class PromoValidateRequest(BaseModel):
    code: str


class PromoValidateResponse(BaseModel):
    valid: bool
    discount_pct: int = 0
    discount_value: float = 0.0
    type: str = "PERCENTAGE"
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
