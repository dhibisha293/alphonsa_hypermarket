from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.middleware.auth import RequireRole, get_current_user
from app.utils.responses import ok, fail
from pydantic import BaseModel
from typing import Optional

# Allow SUPER_ADMIN by default for the entire router
router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(RequireRole(["SUPER_ADMIN"]))])


class OrderStatusUpdate(BaseModel):
    status: str


@router.get("/stats", summary="Get admin dashboard statistics")
async def get_stats():
    try:
        # Total Orders
        orders_res = supabase.table("orders").select("id", count="exact").execute()
        total_orders = orders_res.count if orders_res.count is not None else 0

        # Total Revenue (sum of total where status is not cancelled)
        revenue_res = supabase.table("orders").select("total").neq("status", "cancelled").execute()
        total_revenue = sum([order["total"] for order in revenue_res.data]) if revenue_res.data else 0

        # Total Products
        products_res = supabase.table("products").select("id", count="exact").execute()
        total_products = products_res.count if products_res.count is not None else 0

        # Total Customers
        profiles_res = supabase.table("profiles").select("id", count="exact").execute()
        total_customers = profiles_res.count if profiles_res.count is not None else 0

        return ok(data={
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "total_products": total_products,
            "total_customers": total_customers
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/orders", summary="List all orders")
async def list_orders(page: int = 1, page_size: int = 20):
    try:
        offset = (page - 1) * page_size
        # Fetch orders and order items, joining products for details
        orders_res = (
            supabase.table("orders")
            .select("*, order_items(*, products(name, image, sku, barcode))", count="exact")
            .order("created_at", desc=True)
            .range(offset, offset + page_size - 1)
            .execute()
        )
        
        orders_data = orders_res.data or []
        user_ids = list(set([o["user_id"] for o in orders_data if o.get("user_id")]))
        
        profiles_dict = {}
        if user_ids:
            try:
                prof_res = supabase.table("profiles").select("id, full_name").in_("id", user_ids).execute()
                for p in prof_res.data or []:
                    profiles_dict[p["id"]] = {"full_name": p.get("full_name")}
            except Exception:
                pass
                
        for order in orders_data:
            uid = order.get("user_id")
            order["profiles"] = profiles_dict.get(uid, {"full_name": "Guest", "email": None}) if uid else {"full_name": "Guest", "email": None}

        return ok(data={
            "items": orders_data,
            "total": orders_res.count if orders_res.count is not None else 0,
            "page": page,
            "page_size": page_size
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/orders/{order_id}", summary="Update order status")
async def update_order_status(order_id: str, body: OrderStatusUpdate):
    valid_statuses = ['pending', 'confirmed', 'packing', 'dispatched', 'delivered', 'cancelled']
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    try:
        update_payload = {"status": body.status}
        # If admin is cancelling, record it
        if body.status == "cancelled":
            update_payload["cancelled_by"] = "ADMIN"
        update_res = supabase.table("orders").update(update_payload).eq("id", order_id).execute()
        if not update_res.data:
            raise HTTPException(status_code=404, detail="Order not found")
            
        order_data = update_res.data[0]
        # Notify the user
        if order_data.get("user_id"):
            supabase.table("notifications").insert({
                "user_id": order_data["user_id"],
                "type": "ORDER_UPDATE",
                "title": f"Order Status: {body.status.capitalize()}",
                "message": f"Your order {order_data.get('order_number', '')} is now {body.status}.",
                "link": f"/account/orders/{order_id}"
            }).execute()
            
        return ok(message="Order status updated")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Payment & Refund Management ────────────────────────────────────────────


class PaymentStatusUpdate(BaseModel):
    payment_status: str


class RefundAction(BaseModel):
    action: str  # 'APPROVE' | 'REJECT'
    refund_reason: Optional[str] = None


class AdminCancelOrder(BaseModel):
    reason: Optional[str] = None


@router.get("/refunds", summary="List orders with pending refund requests")
async def list_refunds(status: str = "REQUESTED"):
    """Returns orders where refund_status matches the given status."""
    valid = {"REQUESTED", "PROCESSING", "COMPLETED", "REJECTED", "NONE"}
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid refund status. Must be one of: {valid}")
    try:
        res = (
            supabase.table("orders")
            .select("id, order_number, user_id, total, refund_status, refund_amount, refund_reason, refunded_at, payment_method, status, created_at, cancelled_by")
            .eq("refund_status", status)
            .order("created_at", desc=True)
            .execute()
        )
        orders_data = res.data or []
        # Enrich with customer name
        user_ids = list(set(o["user_id"] for o in orders_data if o.get("user_id")))
        profiles = {}
        if user_ids:
            prof_res = supabase.table("profiles").select("id, full_name").in_("id", user_ids).execute()
            profiles = {p["id"]: p.get("full_name", "Unknown") for p in (prof_res.data or [])}
        for o in orders_data:
            o["customer_name"] = profiles.get(o.get("user_id"), "Unknown")
        return ok(data=orders_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/orders/{order_id}/refund", summary="Process or reject a refund request")
async def process_refund(order_id: str, body: RefundAction):
    if body.action not in ("APPROVE", "REJECT"):
        raise HTTPException(status_code=400, detail="action must be 'APPROVE' or 'REJECT'")
    try:
        from datetime import datetime, timezone
        order_res = supabase.table("orders").select("*").eq("id", order_id).maybe_single().execute()
        if not order_res.data:
            raise HTTPException(status_code=404, detail="Order not found")

        update = {}
        if body.action == "APPROVE":
            update = {
                "refund_status": "COMPLETED",
                "payment_status": "REFUNDED",
                "refunded_at": datetime.now(timezone.utc).isoformat(),
            }
        else:
            update = {
                "refund_status": "REJECTED",
                "refund_reason": body.refund_reason or "Rejected by admin",
            }

        update_res = supabase.table("orders").update(update).eq("id", order_id).execute()
        
        if update_res.data:
            order_data = update_res.data[0]
            if order_data.get("user_id"):
                action_str = "Approved" if body.action == "APPROVE" else "Rejected"
                supabase.table("notifications").insert({
                    "user_id": order_data["user_id"],
                    "type": "ORDER_UPDATE",
                    "title": f"Refund {action_str}",
                    "message": f"Your refund request for order {order_data.get('order_number', '')} has been {action_str.lower()}.",
                    "link": f"/account/orders/{order_id}"
                }).execute()
                
        return ok(message=f"Refund {'approved' if body.action == 'APPROVE' else 'rejected'} successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/orders/{order_id}/payment-status", summary="Update order payment status")
async def update_payment_status(order_id: str, body: PaymentStatusUpdate):
    valid_payment_statuses = ["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"]
    if body.payment_status not in valid_payment_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid payment status. Must be one of: {valid_payment_statuses}")
    try:
        res = supabase.table("orders").update({"payment_status": body.payment_status}).eq("id", order_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Order not found")
        return ok(message="Payment status updated")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/orders/{order_id}/cancel", summary="Admin cancels an order with optional reason + stock restoration")
async def admin_cancel_order(order_id: str, body: AdminCancelOrder):
    try:
        order_res = supabase.table("orders").select("*").eq("id", order_id).maybe_single().execute()
        if not order_res.data:
            raise HTTPException(status_code=404, detail="Order not found")
        order = order_res.data

        if order["status"] == "cancelled":
            return ok(message="Order is already cancelled")

        # Restore inventory
        items_res = supabase.table("order_items").select("product_id, quantity").eq("order_id", order_id).execute()
        for item in (items_res.data or []):
            inv = supabase.table("inventory").select("current_stock").eq("product_id", item["product_id"]).maybe_single().execute()
            if inv.data:
                supabase.table("inventory").update({"current_stock": inv.data["current_stock"] + item["quantity"]}).eq("product_id", item["product_id"]).execute()
                supabase.table("stock_movements").insert({
                    "product_id": item["product_id"],
                    "type": "ADJUSTMENT",
                    "quantity": item["quantity"],
                    "reference_id": order_id,
                    "notes": f"Restored via admin cancellation of {order['order_number']}"
                }).execute()

        refund_status = "REQUESTED" if order.get("payment_method") not in ("COD",) and order.get("payment_status") == "PAID" else "NONE"

        supabase.table("orders").update({
            "status": "cancelled",
            "cancelled_by": "ADMIN",
            "refund_status": refund_status,
            "refund_amount": float(order["total"]) if refund_status == "REQUESTED" else None,
            "refund_reason": body.reason,
        }).eq("id", order_id).execute()

        return ok(message="Order cancelled by admin. Inventory restored.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

