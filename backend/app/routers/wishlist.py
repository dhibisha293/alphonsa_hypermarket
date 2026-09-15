from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.schemas.commerce import WishlistAddRequest, WishlistItemOut
from app.middleware.auth import get_current_user
from app.utils.responses import ok

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("", summary="Get current user's wishlist")
async def get_wishlist(user=Depends(get_current_user)):
    result = (
        supabase.table("wishlist_items")
        .select("*, products(*)")
        .eq("user_id", str(user.id))
        .execute()
    )
    items = [WishlistItemOut.from_db(r).model_dump() for r in result.data]
    return ok(data=items)


@router.post("", summary="Add product to wishlist")
async def add_to_wishlist(body: WishlistAddRequest, user=Depends(get_current_user)):
    # Check product exists
    product = supabase.table("products").select("id").eq("id", body.product_id).eq("is_active", True).maybe_single().execute()
    if not product.data:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check already in wishlist
    existing = (
        supabase.table("wishlist_items")
        .select("id")
        .eq("user_id", str(user.id))
        .eq("product_id", body.product_id)
        .maybe_single()
        .execute()
    )
    if existing.data:
        return ok(message="Already in wishlist")

    supabase.table("wishlist_items").insert({
        "user_id": str(user.id),
        "product_id": body.product_id,
    }).execute()
    return ok(message="Added to wishlist")


@router.delete("/{product_id}", summary="Remove product from wishlist")
async def remove_from_wishlist(product_id: str, user=Depends(get_current_user)):
    supabase.table("wishlist_items").delete().eq("user_id", str(user.id)).eq("product_id", product_id).execute()
    return ok(message="Removed from wishlist")
