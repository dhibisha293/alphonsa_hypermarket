from fastapi import APIRouter, HTTPException, Depends, Query
from app.database import supabase
from app.middleware.auth import RequireRole, get_current_user
from app.utils.responses import ok, fail
from pydantic import BaseModel
from typing import Optional

# Allow SUPER_ADMIN and ADMIN by default for the entire router
router = APIRouter(
    prefix="/admin/inventory",
    tags=["Admin Inventory"],
    dependencies=[Depends(RequireRole(["SUPER_ADMIN", "ADMIN", "STAFF"]))]
)

class StockAdjustmentRequest(BaseModel):
    quantity: int
    type: str # PURCHASE, SALE, RETURN, DAMAGE, EXPIRY, MANUAL_ADJUSTMENT
    notes: Optional[str] = None


@router.get("/stats", summary="Get inventory statistics")
async def get_inventory_stats():
    try:
        # We need Total Products, In Stock, Low Stock, Out of Stock
        # To do this correctly, we can query the inventory table.
        inventory_res = supabase.table("inventory").select("current_stock, minimum_stock, is_active").eq("is_active", True).execute()
        
        total_products = len(inventory_res.data) if inventory_res.data else 0
        in_stock = 0
        low_stock = 0
        out_of_stock = 0
        total_units = 0

        for item in inventory_res.data:
            current = item.get("current_stock", 0)
            minimum = item.get("minimum_stock", 10)
            
            total_units += current

            if current <= 0:
                out_of_stock += 1
            elif current <= minimum:
                low_stock += 1
            else:
                in_stock += 1

        return ok(data={
            "total_products": total_products,
            "in_stock": in_stock,
            "low_stock": low_stock,
            "out_of_stock": out_of_stock,
            "total_units": total_units
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", summary="List inventory with products")
async def list_inventory(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    status: Optional[str] = None,
    category_id: Optional[str] = None
):
    try:
        offset = (page - 1) * page_size
        
        # Base query joining products
        query = supabase.table("inventory").select(
            "*, products!inner(id, name, sku, barcode, category_id, image)", count="exact"
        )
        
        if search:
            # We must use the embedded product fields for search
            # Supabase Python client currently has limited nested filtering, 
            # so we'll do an ilike on products.name
            query = query.ilike("products.name", f"%{search}%")

        if category_id:
            query = query.eq("products.category_id", category_id)

        # Execute base query
        # Since we might over-fetch to handle status filtering (which depends on current_stock vs minimum_stock),
        # we will fetch and then filter/paginate if status is provided, or just let DB do it if no status.
        # However, for true server-side pagination, status filtering based on dynamic calculations is tricky in pure postgrest
        # without a view. But we can approximate:
        
        if status == "OUT_OF_STOCK":
            query = query.lte("current_stock", 0)
        
        # We fetch a larger chunk if complex filtering is needed, or just let DB paginate.
        # Since we don't have a direct "low_stock" column, doing "current_stock <= minimum_stock AND current_stock > 0"
        # requires raw SQL or a view. We'll do it in Python for now if 'status' is 'LOW_STOCK' or 'IN_STOCK'.
        
        if status in ["LOW_STOCK", "IN_STOCK"]:
            # Fetch all to filter in memory (this is a tradeoff, for a huge DB we'd need a postgres function or view)
            res = query.execute()
            filtered = []
            for item in res.data:
                curr = item.get("current_stock", 0)
                mini = item.get("minimum_stock", 10)
                if status == "LOW_STOCK" and 0 < curr <= mini:
                    filtered.append(item)
                elif status == "IN_STOCK" and curr > mini:
                    filtered.append(item)
            
            total = len(filtered)
            paginated = filtered[offset:offset+page_size]
            return ok(data={"items": paginated, "total": total, "page": page, "page_size": page_size})
        else:
            # Safe to paginate in DB
            res = query.order("created_at", desc=True).range(offset, offset + page_size - 1).execute()
            return ok(data={
                "items": res.data or [],
                "total": res.count if res.count is not None else 0,
                "page": page,
                "page_size": page_size
            })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{product_id}/adjust", summary="Adjust stock manually")
async def adjust_stock(product_id: str, body: StockAdjustmentRequest, user = Depends(get_current_user)):
    try:
        # Validate type
        valid_types = ['PURCHASE', 'SALE', 'RETURN', 'DAMAGE', 'EXPIRY', 'MANUAL_ADJUSTMENT']
        if body.type not in valid_types:
            raise HTTPException(status_code=400, detail="Invalid adjustment type")
            
        # Get current inventory
        inv_res = supabase.table("inventory").select("*").eq("product_id", product_id).maybe_single().execute()
        if not inv_res.data:
            raise HTTPException(status_code=404, detail="Inventory record not found for product")
            
        current = inv_res.data["current_stock"]
        new_stock = current + body.quantity
        
        if new_stock < 0:
            raise HTTPException(status_code=400, detail="Insufficient stock. Cannot result in negative inventory.")
            
        # Update inventory
        update_res = supabase.table("inventory").update({
            "current_stock": new_stock
        }).eq("product_id", product_id).execute()
        
        if not update_res.data:
            raise HTTPException(status_code=500, detail="Failed to update inventory")
            
        # Record movement
        supabase.table("stock_movements").insert({
            "product_id": product_id,
            "user_id": str(user.id),
            "type": body.type,
            "quantity": body.quantity,
            "notes": body.notes
        }).execute()
        
        return ok(message="Stock adjusted successfully", data=update_res.data[0])
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/movements", summary="Get stock movements history")
async def get_movements(
    page: int = 1,
    page_size: int = 20,
    product_id: Optional[str] = None,
    type: Optional[str] = None
):
    try:
        offset = (page - 1) * page_size
        
        query = supabase.table("stock_movements").select(
            "*, products(name, sku, image), auth.users(id, email, raw_user_meta_data)", count="exact"
        )
        
        if product_id:
            query = query.eq("product_id", product_id)
        if type:
            query = query.eq("type", type)
            
        res = query.order("created_at", desc=True).range(offset, offset + page_size - 1).execute()
        
        return ok(data={
            "items": res.data or [],
            "total": res.count if res.count is not None else 0,
            "page": page,
            "page_size": page_size
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
