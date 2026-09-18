from fastapi import APIRouter, Depends
from typing import Optional
from datetime import datetime, timezone
from app.database import supabase
from app.schemas.commerce import PromoValidateRequest, PromoValidateResponse
from app.middleware.auth import get_optional_user
from app.utils.responses import ok

router = APIRouter(prefix="/promo", tags=["Promo"])


@router.post("/validate", summary="Validate a coupon code against the coupons table")
async def validate_promo(body: PromoValidateRequest, user=Depends(get_optional_user)):
    code = body.code.strip().upper()

    res = (
        supabase.table("coupons")
        .select("*")
        .eq("code", code)
        .maybe_single()
        .execute()
    )

    if not res.data:
        return ok(data={"valid": False, "discount_pct": 0, "discount_value": 0,
                        "type": "PERCENTAGE", "message": "Invalid coupon code"})

    c = res.data

    # 1. Active check
    if not c.get("is_active", False):
        return ok(data={"valid": False, "discount_pct": 0, "discount_value": 0,
                        "type": c["type"], "message": "This coupon is no longer active"})

    # 2. Date range check
    now = datetime.now(timezone.utc)
    if c.get("start_date"):
        start = datetime.fromisoformat(c["start_date"].replace("Z", "+00:00"))
        if now < start:
            return ok(data={"valid": False, "discount_pct": 0, "discount_value": 0,
                            "type": c["type"], "message": "This coupon is not yet valid"})
    if c.get("end_date"):
        end = datetime.fromisoformat(c["end_date"].replace("Z", "+00:00"))
        if now > end:
            return ok(data={"valid": False, "discount_pct": 0, "discount_value": 0,
                            "type": c["type"], "message": "This coupon has expired"})

    # 3. Global usage limit
    if c.get("usage_limit") and c.get("current_usage", 0) >= c["usage_limit"]:
        return ok(data={"valid": False, "discount_pct": 0, "discount_value": 0,
                        "type": c["type"], "message": "This coupon has reached its usage limit"})

    # 4. Per-user limit (only if authenticated)
    if c.get("per_user_limit") and user:
        user_order_count = (
            supabase.table("orders")
            .select("id", count="exact")
            .eq("user_id", str(user.id))
            .eq("promo_code", code)
            .execute()
        )
        if (user_order_count.count or 0) >= c["per_user_limit"]:
            return ok(data={"valid": False, "discount_pct": 0, "discount_value": 0,
                            "type": c["type"], "message": f"You have already used this coupon {c['per_user_limit']} time(s)"})

    # Build response
    disc_val = float(c["discount_value"])
    max_disc = float(c["max_discount"]) if c.get("max_discount") else None
    min_order = float(c.get("min_order_amount", 0))

    return ok(data={
        "valid": True,
        "type": c["type"],
        "discount_value": disc_val,
        "discount_pct": disc_val if c["type"] == "PERCENTAGE" else 0,
        "max_discount": max_disc,
        "min_order_amount": min_order,
        "message": (
            f"Code '{code}' applied — "
            f"{'%g%%' % disc_val if c['type'] == 'PERCENTAGE' else '₹%g' % disc_val} off"
            + (f" (max ₹{max_disc:g})" if max_disc else "")
            + (f" on orders above ₹{min_order:g}" if min_order > 0 else "")
        )
    })

