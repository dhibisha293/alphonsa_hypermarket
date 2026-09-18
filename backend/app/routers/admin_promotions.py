from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.database import supabase
from app.middleware.auth import RequireRole
from app.utils.responses import ok

router = APIRouter(prefix="/admin", tags=["Admin Promotions"], dependencies=[Depends(RequireRole(["SUPER_ADMIN"]))])

# ---------------------------------------------------------
# COUPONS
# ---------------------------------------------------------

class CouponCreate(BaseModel):
    code: str
    type: str
    discount_value: float
    min_order_amount: Optional[float] = 0
    max_discount: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    usage_limit: Optional[int] = None
    is_active: Optional[bool] = True

class CouponUpdate(BaseModel):
    code: Optional[str] = None
    type: Optional[str] = None
    discount_value: Optional[float] = None
    min_order_amount: Optional[float] = None
    max_discount: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    usage_limit: Optional[int] = None
    is_active: Optional[bool] = None

@router.get("/coupons")
async def list_coupons():
    try:
        res = supabase.table("coupons").select("*").order("created_at", desc=True).execute()
        return ok(data=res.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/coupons")
async def create_coupon(data: CouponCreate):
    try:
        payload = data.dict(exclude_unset=True)
        res = supabase.table("coupons").insert(payload).execute()
        if not res.data:
            raise HTTPException(status_code=400, detail="Failed to create coupon")
        return ok(data=res.data[0], message="Coupon created successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/coupons/{coupon_id}")
async def update_coupon(coupon_id: str, data: CouponUpdate):
    try:
        payload = data.dict(exclude_unset=True)
        if not payload:
            return ok(message="No changes provided")
        res = supabase.table("coupons").update(payload).eq("id", coupon_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Coupon not found")
        return ok(data=res.data[0], message="Coupon updated successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str):
    try:
        res = supabase.table("coupons").delete().eq("id", coupon_id).execute()
        return ok(message="Coupon deleted successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------
# OFFERS / BANNERS
# ---------------------------------------------------------

class OfferCreate(BaseModel):
    title: str
    discount_text: str
    description: Optional[str] = None
    code: str
    discount_pct: int
    valid_till_text: Optional[str] = None
    badge: Optional[str] = None
    is_active: Optional[bool] = True

class OfferUpdate(BaseModel):
    title: Optional[str] = None
    discount_text: Optional[str] = None
    description: Optional[str] = None
    code: Optional[str] = None
    discount_pct: Optional[int] = None
    valid_till_text: Optional[str] = None
    badge: Optional[str] = None
    is_active: Optional[bool] = None

@router.get("/offers")
async def list_offers():
    try:
        res = supabase.table("special_offers").select("*").order("created_at", desc=True).execute()
        return ok(data=res.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/offers")
async def create_offer(data: OfferCreate):
    try:
        payload = data.dict(exclude_unset=True)
        res = supabase.table("special_offers").insert(payload).execute()
        if not res.data:
            raise HTTPException(status_code=400, detail="Failed to create offer")
        return ok(data=res.data[0], message="Offer created successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/offers/{offer_id}")
async def update_offer(offer_id: str, data: OfferUpdate):
    try:
        payload = data.dict(exclude_unset=True)
        if not payload:
            return ok(message="No changes provided")
        res = supabase.table("special_offers").update(payload).eq("id", offer_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Offer not found")
        return ok(data=res.data[0], message="Offer updated successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/offers/{offer_id}")
async def delete_offer(offer_id: str):
    try:
        res = supabase.table("special_offers").delete().eq("id", offer_id).execute()
        return ok(message="Offer deleted successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
