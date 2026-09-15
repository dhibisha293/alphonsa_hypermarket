from fastapi import APIRouter
from app.database import supabase
from app.schemas.commerce import PromoValidateRequest, PromoValidateResponse
from app.utils.responses import ok

router = APIRouter(prefix="/promo", tags=["Promo"])


@router.post("/validate", summary="Validate a promo code and return discount percentage")
async def validate_promo(body: PromoValidateRequest):
    code = body.code.strip().upper()

    result = (
        supabase.table("special_offers")
        .select("code, discount_pct, is_active, valid_until")
        .eq("code", code)
        .eq("is_active", True)
        .maybe_single()
        .execute()
    )

    if not result.data:
        return ok(data={"valid": False, "discount_pct": 0, "message": "Invalid promo code"})

    offer = result.data
    return ok(data={
        "valid": True,
        "discount_pct": offer["discount_pct"],
        "message": f"Code '{code}' applied — {offer['discount_pct']}% off!",
    })
