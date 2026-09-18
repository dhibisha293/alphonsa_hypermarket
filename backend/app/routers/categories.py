from fastapi import APIRouter, Query
from typing import Optional
from app.database import supabase
from app.schemas.products import CategoryOut, BrandOut, SubcategoryOut
from app.utils.responses import ok, fail
from app.utils.cache import simple_ttl_cache

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", summary="Get all active categories")
@simple_ttl_cache(ttl_seconds=300)
async def list_categories():
    result = (
        supabase.table("categories")
        .select("*")
        .eq("is_active", True)
        .order("sort_order")
        .execute()
    )
    categories = [CategoryOut.from_db(r).model_dump() for r in result.data]
    return ok(data=categories)


@router.get("/brands", summary="Get all active brands")
@simple_ttl_cache(ttl_seconds=300)
async def list_brands():
    result = (
        supabase.table("brands")
        .select("*")
        .eq("is_active", True)
        .order("name")
        .execute()
    )
    brands = [BrandOut.from_db(r).model_dump() for r in (result.data or [])]
    return ok(data=brands)


@router.get("/subcategories", summary="Get subcategories, optionally filtered by category_id")
@simple_ttl_cache(ttl_seconds=300)
async def list_subcategories(category_id: Optional[str] = Query(None)):
    query = supabase.table("subcategories").select("*").eq("is_active", True)
    if category_id:
        query = query.eq("category_id", category_id)
    result = query.order("name").execute()
    subs = [SubcategoryOut.from_db(r).model_dump() for r in (result.data or [])]
    return ok(data=subs)

