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
        update_res = supabase.table("orders").update({"status": body.status}).eq("id", order_id).execute()
        if not update_res.data:
            raise HTTPException(status_code=404, detail="Order not found")
        return ok(message="Order status updated")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
