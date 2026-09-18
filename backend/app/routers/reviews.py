from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.middleware.auth import get_current_user, get_optional_user
from app.utils.responses import ok
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter(prefix="/reviews", tags=["Reviews"])


class SubmitReviewRequest(BaseModel):
    product_id: str
    order_id: str
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=150)
    body: Optional[str] = None


def _recalculate_product_rating(product_id: str):
    """
    Recalculate and update products.rating and products.reviews_count
    based on all approved reviews for the given product.
    Called after any review status change.
    """
    try:
        res = supabase.table("reviews") \
            .select("rating") \
            .eq("product_id", product_id) \
            .eq("status", "approved") \
            .execute()

        approved = res.data or []
        count = len(approved)
        avg = round(sum(r["rating"] for r in approved) / count, 1) if count > 0 else 0.0

        supabase.table("products").update({
            "rating": avg,
            "reviews_count": count
        }).eq("id", product_id).execute()
    except Exception:
        pass  # Non-critical; don't block the main operation


@router.get("/product/{product_id}", summary="Get approved reviews for a product")
async def get_product_reviews(product_id: str, page: int = 1, page_size: int = 10):
    offset = (page - 1) * page_size
    try:
        res = supabase.table("reviews") \
            .select("id, rating, title, body, created_at, user_id, profiles(full_name)", count="exact") \
            .eq("product_id", product_id) \
            .eq("status", "approved") \
            .order("created_at", desc=True) \
            .range(offset, offset + page_size - 1) \
            .execute()

        return ok(data={
            "items": res.data or [],
            "total": res.count if res.count is not None else 0,
            "page": page,
            "page_size": page_size
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/eligible/{product_id}", summary="Check if current user can review this product")
async def check_eligibility(product_id: str, user=Depends(get_current_user)):
    """
    Returns whether the authenticated user:
    1. Has purchased the product (has a delivered or confirmed order containing it)
    2. Has NOT already reviewed this product
    """
    try:
        # Check for existing review
        existing = supabase.table("reviews") \
            .select("id") \
            .eq("product_id", product_id) \
            .eq("user_id", str(user.id)) \
            .maybe_single() \
            .execute()

        if existing.data:
            return ok(data={
                "eligible": False,
                "reason": "already_reviewed",
                "review_id": existing.data["id"]
            })

        # Check if user has an order containing this product
        # We join order_items → orders to verify ownership
        orders_res = supabase.table("orders") \
            .select("id") \
            .eq("user_id", str(user.id)) \
            .in_("status", ["confirmed", "packing", "dispatched", "delivered"]) \
            .execute()

        if not orders_res.data:
            return ok(data={"eligible": False, "reason": "no_qualifying_order"})

        order_ids = [o["id"] for o in orders_res.data]

        items_res = supabase.table("order_items") \
            .select("id, order_id") \
            .in_("order_id", order_ids) \
            .eq("product_id", product_id) \
            .limit(1) \
            .execute()

        if not items_res.data:
            return ok(data={"eligible": False, "reason": "product_not_purchased"})

        return ok(data={
            "eligible": True,
            "qualifying_order_id": items_res.data[0]["order_id"]
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", summary="Submit a product review")
async def submit_review(body: SubmitReviewRequest, user=Depends(get_current_user)):
    try:
        # 1. Verify order belongs to this user and contains the product
        order_res = supabase.table("orders") \
            .select("id, status") \
            .eq("id", body.order_id) \
            .eq("user_id", str(user.id)) \
            .maybe_single() \
            .execute()

        if not order_res.data:
            raise HTTPException(status_code=403, detail="Order not found or does not belong to you")

        # 2. Verify order contains the product
        item_res = supabase.table("order_items") \
            .select("id") \
            .eq("order_id", body.order_id) \
            .eq("product_id", body.product_id) \
            .maybe_single() \
            .execute()

        if not item_res.data:
            raise HTTPException(
                status_code=403,
                detail="You can only review products you have purchased"
            )

        # 3. Check for duplicate review
        dup_res = supabase.table("reviews") \
            .select("id") \
            .eq("user_id", str(user.id)) \
            .eq("product_id", body.product_id) \
            .maybe_single() \
            .execute()

        if dup_res.data:
            raise HTTPException(status_code=409, detail="You have already reviewed this product")

        # 4. Insert review (status = 'pending'; admin must approve)
        insert_res = supabase.table("reviews").insert({
            "product_id": body.product_id,
            "user_id": str(user.id),
            "order_id": body.order_id,
            "rating": body.rating,
            "title": body.title,
            "body": body.body,
            "status": "pending"
        }).execute()

        if not insert_res.data:
            raise HTTPException(status_code=500, detail="Failed to submit review")

        return ok(
            data=insert_res.data[0],
            message="Review submitted successfully. It will appear after moderation."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{review_id}", summary="Delete own review")
async def delete_review(review_id: str, user=Depends(get_current_user)):
    try:
        # Fetch review to verify ownership
        review_res = supabase.table("reviews") \
            .select("id, product_id, user_id") \
            .eq("id", review_id) \
            .maybe_single() \
            .execute()

        if not review_res.data:
            raise HTTPException(status_code=404, detail="Review not found")

        if review_res.data["user_id"] != str(user.id):
            raise HTTPException(status_code=403, detail="You can only delete your own reviews")

        product_id = review_res.data["product_id"]
        was_approved = review_res.data.get("status") == "approved"

        supabase.table("reviews").delete().eq("id", review_id).execute()

        # Recalculate rating only if the deleted review was approved
        if was_approved:
            _recalculate_product_rating(product_id)

        return ok(message="Review deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
