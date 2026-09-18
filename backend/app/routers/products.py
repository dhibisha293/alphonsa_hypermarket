from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.database import supabase
from app.schemas.products import ProductOut, ProductListResponse
from app.utils.responses import ok, fail

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", summary="List products with full filtering, sorting, and pagination")
async def get_products(
    # Text search
    q:             Optional[str]  = Query(None, description="Search product name, SKU, barcode"),
    # Categorical filters
    category:      Optional[str]  = Query(None, description="category slug or 'all'"),
    brand_id:      Optional[str]  = Query(None, description="Filter by brand UUID"),
    subcategory_id:Optional[str]  = Query(None, description="Filter by subcategory UUID"),
    # Numeric filters
    min_price:     Optional[float]= Query(None, ge=0),
    max_price:     Optional[float]= Query(None, ge=0),
    min_discount:  Optional[int]  = Query(None, ge=0, le=100, description="Minimum discount %"),
    # Boolean flags
    is_bestseller: Optional[bool] = Query(None),
    is_new:        Optional[bool] = Query(None),
    in_stock:      Optional[bool] = Query(None, description="Only show in-stock products"),
    # Sorting
    sort:          Optional[str]  = Query("newest", description="newest|price_asc|price_desc|rating|discount"),
    # Pagination
    page:  int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100),
):
    offset = (page - 1) * limit

    query = supabase.table("products").select("*", count="exact").eq("is_active", True)

    # ── Text search: name, SKU, barcode ──────────────────────────────────────
    if q and q.strip():
        term = q.strip()
        # Supabase postgrest: use `or` filter for multi-column search
        query = query.or_(f"name.ilike.%{term}%,sku.ilike.%{term}%,barcode.ilike.%{term}%")

    # ── Category filter ───────────────────────────────────────────────────────
    if category and category != "all":
        query = query.eq("category_slug", category)

    # ── Brand filter ──────────────────────────────────────────────────────────
    if brand_id:
        query = query.eq("brand_id", brand_id)

    # ── Subcategory filter ────────────────────────────────────────────────────
    if subcategory_id:
        query = query.eq("subcategory_id", subcategory_id)

    # ── Price range ───────────────────────────────────────────────────────────
    if min_price is not None:
        query = query.gte("price", min_price)
    if max_price is not None:
        query = query.lte("price", max_price)

    # ── Discount filter ───────────────────────────────────────────────────────
    if min_discount is not None:
        query = query.gte("discount", min_discount)

    # ── Flags ─────────────────────────────────────────────────────────────────
    if is_bestseller is not None:
        query = query.eq("is_bestseller", is_bestseller)
    if is_new is not None:
        query = query.eq("is_new", is_new)
    if in_stock is True:
        query = query.gt("stock_qty", 0)

    # ── Sorting ───────────────────────────────────────────────────────────────
    sort_map = {
        "newest":     ("created_at", True),
        "price_asc":  ("price", False),
        "price_desc": ("price", True),
        "rating":     ("rating", True),
        "discount":   ("discount", True),
    }
    sort_col, sort_desc = sort_map.get(sort, ("created_at", True))
    query = query.order(sort_col, desc=sort_desc)

    # ── Pagination ────────────────────────────────────────────────────────────
    result = query.range(offset, offset + limit - 1).execute()

    products = [ProductOut.from_db(r) for r in (result.data or [])]
    total = result.count or 0

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

