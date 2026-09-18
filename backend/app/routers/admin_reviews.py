from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.middleware.auth import RequireRole
from app.utils.responses import ok
from pydantic import BaseModel
from typing import Optional
from app.routers.reviews import _recalculate_product_rating

router = APIRouter(
    prefix="/admin/reviews",
    tags=["Admin Reviews"],
    dependencies=[Depends(RequireRole(["SUPER_ADMIN", "CONTENT_MANAGER"]))]
)


class ModerateReviewRequest(BaseModel):
    status: str  # 'approved', 'rejected'


@router.get("", summary="List all reviews for admin moderation")
async def list_reviews(
    page: int = 1,
    page_size: int = 20,
    status: Optional[str] = None,
    product_id: Optional[str] = None
):
    try:
        offset = (page - 1) * page_size
        query = supabase.table("reviews") \
            .select(
                "id, rating, title, body, status, created_at, updated_at, "
                "product_id, user_id, order_id, "
                "products(name, image_url, sku), "
                "profiles(full_name)",
                count="exact"
            )

        if status:
            query = query.eq("status", status)
        if product_id:
            query = query.eq("product_id", product_id)

        res = query.order("created_at", desc=True) \
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


@router.patch("/{review_id}", summary="Approve or reject a review")
async def moderate_review(review_id: str, body: ModerateReviewRequest):
    valid_statuses = ["approved", "rejected", "pending"]
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    try:
        # Fetch the review to get product_id
        review_res = supabase.table("reviews") \
            .select("id, product_id, status") \
            .eq("id", review_id) \
            .maybe_single() \
            .execute()

        if not review_res.data:
            raise HTTPException(status_code=404, detail="Review not found")

        product_id = review_res.data["product_id"]

        # Update status
        update_res = supabase.table("reviews") \
            .update({"status": body.status}) \
            .eq("id", review_id) \
            .execute()

        if not update_res.data:
            raise HTTPException(status_code=500, detail="Failed to update review")

        # Recalculate product rating whenever review status changes
        _recalculate_product_rating(product_id)

        return ok(message=f"Review {body.status} successfully", data=update_res.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{review_id}", summary="Admin delete a review")
async def admin_delete_review(review_id: str):
    try:
        review_res = supabase.table("reviews") \
            .select("id, product_id, status") \
            .eq("id", review_id) \
            .maybe_single() \
            .execute()

        if not review_res.data:
            raise HTTPException(status_code=404, detail="Review not found")

        product_id = review_res.data["product_id"]
        was_approved = review_res.data.get("status") == "approved"

        supabase.table("reviews").delete().eq("id", review_id).execute()

        if was_approved:
            _recalculate_product_rating(product_id)

        return ok(message="Review deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
