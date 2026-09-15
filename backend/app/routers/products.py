from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.database import supabase
from app.schemas.products import ProductOut, ProductListResponse
from app.utils.responses import ok, fail

router = APIRouter(prefix="/products", tags=["Products"])

SEARCHABLE_CATEGORIES = {
    "bakery": ["cakes", "puffs", "brownies"],
    "fresh":  ["vegetables", "fruits"],
}


@router.get("", summary="List products with optional filtering and search")
async def list_products(
    category: Optional[str] = Query(None, description="category slug or 'all'"),
    search: Optional[str]   = Query(None, description="search in name, description"),
    is_bestseller: Optional[bool] = Query(None),
    is_new: Optional[bool]        = Query(None),
    page: int  = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
):
    offset = (page - 1) * limit

    query = supabase.table("products").select("*", count="exact").eq("is_active", True)

    # Category filter
    if category and category != "all":
        expanded = SEARCHABLE_CATEGORIES.get(category)
        if expanded:
            query = query.in_("category_slug", expanded)
        else:
            query = query.eq("category_slug", category)

    # Full-text search (server-side)
    if search and search.strip():
        query = query.ilike("name", f"%{search.strip()}%")

    # Flags
    if is_bestseller is not None:
        query = query.eq("is_bestseller", is_bestseller)
    if is_new is not None:
        query = query.eq("is_new", is_new)

    # Pagination
    result = query.order("created_at", desc=False).range(offset, offset + limit - 1).execute()

    products = [ProductOut.from_db(r) for r in result.data]
    total = result.count or len(products)

    return ok(data={
        "total": total,
        "page": page,
        "limit": limit,
        "products": [p.model_dump() for p in products],
    })


@router.get("/{product_id}", summary="Get a single product by ID")
async def get_product(product_id: str):
    result = supabase.table("products").select("*").eq("id", product_id).eq("is_active", True).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return ok(data=ProductOut.from_db(result.data).model_dump())
