from fastapi import APIRouter
from app.database import supabase
from app.schemas.products import CategoryOut
from app.utils.responses import ok, fail
from app.utils.cache import simple_ttl_cache

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", summary="Get all categories with subcategories")
@simple_ttl_cache(ttl_seconds=300) # 5 minute cache for categories
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
