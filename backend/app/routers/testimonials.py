from fastapi import APIRouter
from app.database import supabase
from app.schemas.products import TestimonialOut
from app.utils.responses import ok

router = APIRouter(prefix="/testimonials", tags=["Testimonials"])


@router.get("", summary="List active testimonials")
async def list_testimonials():
    result = (
        supabase.table("testimonials")
        .select("*")
        .eq("is_active", True)
        .order("sort_order")
        .execute()
    )
    testimonials = [TestimonialOut.from_db(r).model_dump() for r in result.data]
    return ok(data=testimonials)
