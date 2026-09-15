import random
import string
from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.schemas.commerce import PlaceOrderRequest, OrderOut
from app.middleware.auth import get_current_user
from app.utils.responses import ok

router = APIRouter(prefix="/orders", tags=["Orders"])


def generate_order_number() -> str:
    suffix = "".join(random.choices(string.digits, k=6))
    return f"ALPH-{suffix}"


@router.post("", summary="Place a new order (checkout)")
async def place_order(body: PlaceOrderRequest, user=Depends(get_current_user)):
    if not body.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    order_number = generate_order_number()

    # Insert order header
    order_result = supabase.table("orders").insert({
        "user_id": str(user.id),
        "order_number": order_number,
        "status": "confirmed",
        "subtotal": body.subtotal,
        "discount_amount": body.discount_amount,
        "shipping_fee": body.shipping_fee,
        "total": body.total,
        "promo_code": body.promo_code,
        "delivery_address": body.delivery_address,
        "notes": body.notes,
    }).execute()

    if not order_result.data:
        raise HTTPException(status_code=500, detail="Failed to create order")

    order_id = order_result.data[0]["id"]

    # Insert order line items
    line_items = [
        {
            "order_id": order_id,
            "product_id": item.product_id,
            "product_name": item.product_name,
            "product_image": item.product_image,
            "unit_price": item.unit_price,
            "quantity": item.quantity,
            "line_total": item.line_total,
        }
        for item in body.items
    ]
    supabase.table("order_items").insert(line_items).execute()

    # Clear user's cart after order
    supabase.table("cart_items").delete().eq("user_id", str(user.id)).execute()

    order_out = OrderOut.from_db(order_result.data[0])
    return ok(data=order_out.model_dump(), message="Order placed successfully!")


@router.get("", summary="Get current user's order history")
async def get_orders(user=Depends(get_current_user)):
    result = (
        supabase.table("orders")
        .select("*")
        .eq("user_id", str(user.id))
        .order("created_at", desc=True)
        .execute()
    )
    orders = [OrderOut.from_db(r).model_dump() for r in result.data]
    return ok(data=orders)


@router.get("/{order_id}", summary="Get a specific order with its items")
async def get_order(order_id: str, user=Depends(get_current_user)):
    order = (
        supabase.table("orders")
        .select("*")
        .eq("id", order_id)
        .eq("user_id", str(user.id))
        .maybe_single()
        .execute()
    )
    if not order.data:
        raise HTTPException(status_code=404, detail="Order not found")

    items = (
        supabase.table("order_items")
        .select("*")
        .eq("order_id", order_id)
        .execute()
    )

    return ok(data={
        "order": OrderOut.from_db(order.data).model_dump(),
        "items": items.data,
    })
