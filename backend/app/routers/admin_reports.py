from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.middleware.auth import RequireRole
from app.utils.responses import ok
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin/reports", tags=["Admin Reports"], dependencies=[Depends(RequireRole(["SUPER_ADMIN"]))])

@router.get("/sales")
async def get_sales_report(days: int = 30):
    try:
        # Fetch orders from the last X days
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        res = (
            supabase.table("orders")
            .select("total, created_at, status")
            .gte("created_at", cutoff)
            .neq("status", "cancelled")
            .execute()
        )
        
        orders = res.data or []
        
        # Aggregate by date
        daily_sales = {}
        for o in orders:
            date_str = o["created_at"][:10]
            if date_str not in daily_sales:
                daily_sales[date_str] = {"date": date_str, "revenue": 0, "orders": 0}
            daily_sales[date_str]["revenue"] += o["total"]
            daily_sales[date_str]["orders"] += 1
            
        # Sort by date
        sorted_sales = sorted(list(daily_sales.values()), key=lambda x: x["date"])
        
        return ok(data=sorted_sales)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/inventory")
async def get_inventory_report():
    try:
        res = supabase.table("products").select("name, sku, category_id, stock_quantity, price, categories(name)").execute()
        products = res.data or []
        
        total_value = sum(p["stock_quantity"] * p["price"] for p in products)
        total_items = sum(p["stock_quantity"] for p in products)
        
        # Top 10 lowest stock items
        low_stock = sorted([p for p in products if p["stock_quantity"] < 20], key=lambda x: x["stock_quantity"])[:10]
        
        # Category breakdown
        cat_breakdown = {}
        for p in products:
            cat_name = p.get("categories", {}).get("name") if p.get("categories") else "Uncategorized"
            if cat_name not in cat_breakdown:
                cat_breakdown[cat_name] = {"category": cat_name, "value": 0, "quantity": 0}
            cat_breakdown[cat_name]["value"] += p["stock_quantity"] * p["price"]
            cat_breakdown[cat_name]["quantity"] += p["stock_quantity"]
            
        cat_list = sorted(list(cat_breakdown.values()), key=lambda x: x["value"], reverse=True)
        
        return ok(data={
            "total_value": total_value,
            "total_items": total_items,
            "low_stock_alerts": low_stock,
            "category_breakdown": cat_list
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-products")
async def get_top_products_report():
    try:
        # For a real large-scale app, this would be a custom Postgres RPC or view.
        # Here we'll fetch order_items and aggregate in memory (ok for small scale).
        # We only fetch items from non-cancelled orders if possible, but for simplicity we fetch all.
        res = supabase.table("order_items").select("product_name, quantity, line_total").execute()
        items = res.data or []
        
        product_agg = {}
        for item in items:
            name = item["product_name"]
            if name not in product_agg:
                product_agg[name] = {"name": name, "quantity_sold": 0, "revenue": 0}
            product_agg[name]["quantity_sold"] += item["quantity"]
            product_agg[name]["revenue"] += item["line_total"]
            
        # Sort by quantity_sold descending
        top_products = sorted(list(product_agg.values()), key=lambda x: x["quantity_sold"], reverse=True)[:10]
        
        return ok(data=top_products)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
