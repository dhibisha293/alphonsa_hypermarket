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

    # 1. Validate items and collect IDs
    item_map = {}
    for item in body.items:
        if item.quantity <= 0 or item.quantity > 100:
            raise HTTPException(status_code=400, detail=f"Invalid quantity for product {item.product_id}")
        item_map[item.product_id] = item.quantity

    # 2. Fetch authoritative products from DB
    products_res = supabase.table("products").select("id, name, price, image_url, is_active").in_("id", list(item_map.keys())).execute()
    db_products = {p["id"]: p for p in (products_res.data or [])}

    # 3. Verify all products exist and are active, and calculate subtotal
    subtotal = 0.0
    line_items = []
    
    for product_id, quantity in item_map.items():
        if product_id not in db_products:
            raise HTTPException(status_code=400, detail=f"Product {product_id} not found")
        p = db_products[product_id]
        if not p.get("is_active", True):
            raise HTTPException(status_code=400, detail=f"Product {p['name']} is no longer available")
        
        unit_price = float(p.get("price", 0))
        line_total = unit_price * quantity
        subtotal += line_total
        
        line_items.append({
            "product_id": product_id,
            "product_name": p["name"],
            "product_image": p.get("image_url"),
            "unit_price": unit_price,
            "quantity": quantity,
            "line_total": line_total
        })

    # 4. Calculate discount
    discount_amount = 0.0
    if body.promo_code:
        promo_res = supabase.table("promo_codes").select("*").eq("code", body.promo_code).eq("is_active", True).execute()
        if promo_res.data:
            discount_pct = promo_res.data[0].get("discount_pct", 0)
            discount_amount = round((subtotal * discount_pct) / 100, 2)

    # 6. Loyalty Points calculation
    # Redeem points
    points_redeemed = body.points_redeemed or 0
    points_discount = 0.0

    if points_redeemed > 0:
        # Verify user has enough points
        profile_res = supabase.table("profiles").select("loyalty_points").eq("id", str(user.id)).single().execute()
        if profile_res.data:
            available_points = profile_res.data.get("loyalty_points", 0)
            if points_redeemed > available_points:
                raise HTTPException(status_code=400, detail="Not enough loyalty points")
            # 1 point = 1 unit discount
            points_discount = float(points_redeemed)
    
    # Ensure discounts don't exceed subtotal
    total_discount = discount_amount + points_discount
    if total_discount > subtotal:
        total_discount = subtotal

    # 7. Calculate shipping and final total
    shipping_fee = 0.0 if subtotal >= 499 else 40.0
    total = max(0.0, subtotal - total_discount + shipping_fee)

    order_number = generate_order_number()

    # 8. Insert order header
    order_result = supabase.table("orders").insert({
        "user_id": str(user.id),
        "order_number": order_number,
        "status": "confirmed",
        "subtotal": subtotal,
        "discount_amount": total_discount,
        "shipping_fee": shipping_fee,
        "total": total,
        "promo_code": body.promo_code if discount_amount > 0 else None,
        "delivery_address": body.delivery_address,
        "notes": body.notes,
    }).execute()

    if not order_result.data:
        raise HTTPException(status_code=500, detail="Failed to create order")

    order_id = order_result.data[0]["id"]

    # 9. Insert order line items
    for li in line_items:
        li["order_id"] = order_id
        
    supabase.table("order_items").insert(line_items).execute()

    # 10. Update Loyalty Points
    # Calculate new points earned (1 point per 100 spent on subtotal minus discounts)
    eligible_spend = max(0.0, subtotal - total_discount)
    points_earned = int(eligible_spend // 100)
    net_points_change = points_earned - points_redeemed

    if net_points_change != 0:
        # RPC or direct update? Supabase Python doesn't have `increment` easily, 
        # so we fetch and update, but we already have `available_points` if `points_redeemed > 0`
        profile_res = supabase.table("profiles").select("loyalty_points").eq("id", str(user.id)).single().execute()
        if profile_res.data:
            current_pts = profile_res.data.get("loyalty_points", 0)
            new_pts = max(0, current_pts + net_points_change)
            supabase.table("profiles").update({"loyalty_points": new_pts}).eq("id", str(user.id)).execute()

    # 11. Clear user's cart after order
    supabase.table("cart_items").delete().eq("user_id", str(user.id)).execute()

    order_out = OrderOut.from_db(order_result.data[0])
    return ok(data=order_out.model_dump(), message=f"Order placed successfully! You earned {points_earned} points.")


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
