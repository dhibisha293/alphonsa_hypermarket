from fastapi import APIRouter
from app.database import supabase
from app.schemas.products import SpecialOfferOut
from app.utils.responses import ok

router = APIRouter(prefix="/special-offers", tags=["Special Offers"])


@router.get("", summary="List active special offers")
async def list_special_offers():
    result = (
        supabase.table("special_offers")
        .select("*")
        .eq("is_active", True)
        .order("created_at")
        .execute()
    )
    offers = [SpecialOfferOut.from_db(r).model_dump() for r in result.data]
    return ok(data=offers)
