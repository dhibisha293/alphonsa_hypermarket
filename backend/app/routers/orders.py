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

    # 2. Fetch authoritative products and inventory from DB
    product_ids = list(item_map.keys())
    products_res = supabase.table("products").select("id, name, price, image_url, is_active").in_("id", product_ids).execute()
    inventory_res = supabase.table("inventory").select("product_id, current_stock, reserved_stock").in_("product_id", product_ids).execute()
    
    db_products = {p["id"]: p for p in (products_res.data or [])}
    db_inventory = {i["product_id"]: i for i in (inventory_res.data or [])}

    # 3. Verify all products exist, are active, and have sufficient stock
    subtotal = 0.0
    line_items = []
    
    for product_id, quantity in item_map.items():
        if product_id not in db_products:
            raise HTTPException(status_code=400, detail=f"Product {product_id} not found")
        p = db_products[product_id]
        if not p.get("is_active", True):
            raise HTTPException(status_code=400, detail=f"Product {p['name']} is no longer available")
        
        inv = db_inventory.get(product_id)
        if not inv:
            raise HTTPException(status_code=400, detail=f"Inventory record missing for {p['name']}")
        
        available_stock = inv["current_stock"] - inv["reserved_stock"]
        if available_stock < quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {p['name']}. Available: {available_stock}")
        
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

    # 4. Resolve Delivery Address
    final_address_text = body.delivery_address or ""
    if body.address_id:
        addr_res = supabase.table("addresses").select("*").eq("id", body.address_id).eq("user_id", str(user.id)).maybe_single().execute()
        if addr_res.data:
            addr = addr_res.data
            final_address_text = f"{addr['full_name']}\n{addr['address_line']}\n{addr['area']}, {addr['city']}\n{addr['state']} - {addr['pincode']}\nPhone: {addr['phone']}"
            if addr.get("delivery_instructions"):
                final_address_text += f"\nInstr: {addr['delivery_instructions']}"
    
    if not final_address_text:
        raise HTTPException(status_code=400, detail="Delivery address is required")

    # 5. Calculate discount (Coupons)
    discount_amount = 0.0
    if body.promo_code:
        from datetime import datetime, timezone
        coupon_res = supabase.table("coupons").select("*").eq("code", body.promo_code.upper()).maybe_single().execute()
        if not coupon_res.data:
            raise HTTPException(status_code=400, detail="Invalid coupon code")

        coupon = coupon_res.data
        now = datetime.now(timezone.utc)

        if not coupon.get("is_active", False):
            raise HTTPException(status_code=400, detail="This coupon is no longer active")

        if coupon.get("start_date"):
            start = datetime.fromisoformat(coupon["start_date"].replace("Z", "+00:00"))
            if now < start:
                raise HTTPException(status_code=400, detail="This coupon is not yet valid")

        if coupon.get("end_date"):
            end = datetime.fromisoformat(coupon["end_date"].replace("Z", "+00:00"))
            if now > end:
                raise HTTPException(status_code=400, detail="This coupon has expired")

        if coupon.get("usage_limit") and coupon.get("current_usage", 0) >= coupon["usage_limit"]:
            raise HTTPException(status_code=400, detail="This coupon has reached its usage limit")

        if coupon.get("per_user_limit"):
            user_usage = supabase.table("orders").select("id", count="exact").eq("user_id", str(user.id)).eq("promo_code", body.promo_code.upper()).execute()
            if (user_usage.count or 0) >= coupon["per_user_limit"]:
                raise HTTPException(status_code=400, detail=f"You have already used this coupon {coupon['per_user_limit']} time(s)")

        if subtotal < float(coupon.get("min_order_amount", 0)):
            raise HTTPException(status_code=400, detail=f"Minimum order amount for this coupon is ₹{coupon.get('min_order_amount')}")

        if coupon["type"] == "PERCENTAGE":
            calc_discount = (subtotal * float(coupon["discount_value"])) / 100
            max_disc = float(coupon.get("max_discount") or calc_discount)
            discount_amount = min(calc_discount, max_disc)
        else:
            discount_amount = min(float(coupon["discount_value"]), subtotal)

        # Increment usage count atomically
        new_usage = coupon.get("current_usage", 0) + 1
        supabase.table("coupons").update({"current_usage": new_usage}).eq("id", coupon["id"]).execute()

    # 6. Loyalty Points calculation
    points_redeemed = body.points_redeemed or 0
    points_discount = 0.0

    if points_redeemed > 0:
        profile_res = supabase.table("profiles").select("loyalty_points").eq("id", str(user.id)).single().execute()
        if profile_res.data:
            available_points = profile_res.data.get("loyalty_points", 0)
            if points_redeemed > available_points:
                raise HTTPException(status_code=400, detail="Not enough loyalty points")
            points_discount = float(points_redeemed)
    
    total_discount = round(discount_amount + points_discount, 2)
    if total_discount > subtotal:
        total_discount = subtotal

    # 7. Calculate shipping, tax, and final total
    shipping_fee = 0.0 if (subtotal >= 499 or body.delivery_method == 'PICKUP') else 40.0
    tax_amount = round((subtotal - total_discount) * 0.05, 2) # Assuming 5% tax for example
    total = max(0.0, subtotal - total_discount + shipping_fee + tax_amount)

    order_number = generate_order_number()

    # 8. Insert order header
    payment_status = "PENDING" if body.payment_method == "COD" else "PENDING"
    
    order_result = supabase.table("orders").insert({
        "user_id": str(user.id),
        "order_number": order_number,
        "status": "confirmed",
        "payment_method": body.payment_method,
        "payment_status": payment_status,
        "delivery_method": body.delivery_method,
        "delivery_date": body.delivery_date,
        "delivery_time_slot": body.delivery_time_slot,
        "subtotal": subtotal,
        "discount_amount": total_discount,
        "tax_amount": tax_amount,
        "shipping_fee": shipping_fee,
        "total": total,
        "promo_code": body.promo_code if discount_amount > 0 else None,
        "delivery_address": final_address_text,
        "notes": body.notes,
    }).execute()

    if not order_result.data:
        raise HTTPException(status_code=500, detail="Failed to create order")

    order_id = order_result.data[0]["id"]

    # 9. Insert order line items & Update Inventory
    for li in line_items:
        li["order_id"] = order_id
        # Decrement stock (Warning: highly concurrent systems need RPC)
        inv = db_inventory[li["product_id"]]
        new_stock = max(0, inv["current_stock"] - li["quantity"])
        supabase.table("inventory").update({"current_stock": new_stock}).eq("product_id", li["product_id"]).execute()
        
        # Log stock movement
        supabase.table("stock_movements").insert({
            "product_id": li["product_id"],
            "user_id": str(user.id),
            "type": "ONLINE_ORDER",
            "quantity": -li["quantity"],
            "reference_id": order_id,
            "notes": f"Order {order_number}"
        }).execute()

    supabase.table("order_items").insert(line_items).execute()

    # 10. Update Loyalty Points
    eligible_spend = max(0.0, subtotal - total_discount)
    points_earned = int(eligible_spend // 100)
    net_points_change = points_earned - points_redeemed

    if net_points_change != 0:
        profile_res = supabase.table("profiles").select("loyalty_points").eq("id", str(user.id)).single().execute()
        if profile_res.data:
            current_pts = profile_res.data.get("loyalty_points", 0)
            new_pts = max(0, current_pts + net_points_change)
            supabase.table("profiles").update({"loyalty_points": new_pts}).eq("id", str(user.id)).execute()

    # 11. Clear ONLY purchased items from cart
    supabase.table("cart_items").delete().eq("user_id", str(user.id)).in_("product_id", product_ids).execute()

    # 12. Send Notification
    supabase.table("notifications").insert({
        "user_id": str(user.id),
        "type": "ORDER_UPDATE",
        "title": "Order Placed Successfully",
        "message": f"Your order {order_number} has been placed and is currently pending.",
        "link": f"/account/orders/{order_id}"
    }).execute()

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


@router.post("/{order_id}/cancel", summary="Customer cancels their own order")
async def cancel_order(order_id: str, user=Depends(get_current_user)):
    """
    Customers may cancel an order only while it is still 'pending' or 'confirmed'.
    Cancellation restores inventory and, for prepaid orders, flags refund as REQUESTED.
    """
    order_res = (
        supabase.table("orders")
        .select("*")
        .eq("id", order_id)
        .eq("user_id", str(user.id))
        .maybe_single()
        .execute()
    )
    if not order_res.data:
        raise HTTPException(status_code=404, detail="Order not found")

    order = order_res.data
    if order["status"] not in ("pending", "confirmed"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel an order that is already '{order['status']}'. Contact support."
        )

    # Restore inventory for each item
    items_res = supabase.table("order_items").select("product_id, quantity").eq("order_id", order_id).execute()
    for item in (items_res.data or []):
        inv = supabase.table("inventory").select("current_stock").eq("product_id", item["product_id"]).maybe_single().execute()
        if inv.data:
            restored = inv.data["current_stock"] + item["quantity"]
            supabase.table("inventory").update({"current_stock": restored}).eq("product_id", item["product_id"]).execute()
            supabase.table("stock_movements").insert({
                "product_id": item["product_id"],
                "user_id": str(user.id),
                "type": "ADJUSTMENT",
                "quantity": item["quantity"],
                "reference_id": order_id,
                "notes": f"Restored from customer cancellation of {order['order_number']}"
            }).execute()

    # Determine refund status — only prepaid orders get a refund
    payment_method = order.get("payment_method", "COD")
    refund_status = "REQUESTED" if payment_method not in ("COD",) else "NONE"
    refund_amount = float(order["total"]) if refund_status == "REQUESTED" else None

    # Decrement coupon usage if one was used
    if order.get("promo_code"):
        coupon_res = supabase.table("coupons").select("id, current_usage").eq("code", order["promo_code"]).maybe_single().execute()
        if coupon_res.data:
            new_usage = max(0, (coupon_res.data.get("current_usage") or 1) - 1)
            supabase.table("coupons").update({"current_usage": new_usage}).eq("id", coupon_res.data["id"]).execute()

    supabase.table("orders").update({
        "status": "cancelled",
        "cancelled_by": "CUSTOMER",
        "refund_status": refund_status,
        "refund_amount": refund_amount,
    }).eq("id", order_id).execute()

    msg = "Order cancelled."
    if refund_status == "REQUESTED":
        msg += " A refund has been initiated and will be processed within 3-5 business days."
    return ok(message=msg)

