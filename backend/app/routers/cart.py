from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.schemas.commerce import CartAddRequest, CartUpdateRequest, CartItemOut
from app.middleware.auth import get_current_user
from app.utils.responses import ok, fail

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", summary="Get current user's cart")
async def get_cart(user=Depends(get_current_user)):
    result = (
        supabase.table("cart_items")
        .select("*, products(*)")
        .eq("user_id", str(user.id))
        .execute()
    )
    items = [CartItemOut.from_db(r).model_dump() for r in result.data]
    return ok(data=items)


@router.post("", summary="Add item to cart (or increment if exists)")
async def add_to_cart(body: CartAddRequest, user=Depends(get_current_user)):
    # Check product exists
    product = supabase.table("products").select("id, stock_qty").eq("id", body.product_id).eq("is_active", True).maybe_single().execute()
    if not product.data:
        raise HTTPException(status_code=404, detail="Product not found")

    # Upsert: if already in cart, increment qty
    existing = (
        supabase.table("cart_items")
        .select("id, quantity")
        .eq("user_id", str(user.id))
        .eq("product_id", body.product_id)
        .maybe_single()
        .execute()
    )

    if existing.data:
        new_qty = existing.data["quantity"] + body.quantity
        supabase.table("cart_items").update({"quantity": new_qty}).eq("id", existing.data["id"]).execute()
    else:
        supabase.table("cart_items").insert({
            "user_id": str(user.id),
            "product_id": body.product_id,
            "quantity": body.quantity,
        }).execute()

    return ok(message="Item added to cart")


@router.put("/{cart_item_id}", summary="Update cart item quantity")
async def update_cart_item(cart_item_id: str, body: CartUpdateRequest, user=Depends(get_current_user)):
    if body.quantity <= 0:
        # treat as delete
        supabase.table("cart_items").delete().eq("id", cart_item_id).eq("user_id", str(user.id)).execute()
        return ok(message="Item removed from cart")

    result = (
        supabase.table("cart_items")
        .update({"quantity": body.quantity})
        .eq("id", cart_item_id)
        .eq("user_id", str(user.id))
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return ok(message="Cart updated")


@router.delete("/{cart_item_id}", summary="Remove item from cart")
async def remove_cart_item(cart_item_id: str, user=Depends(get_current_user)):
    supabase.table("cart_items").delete().eq("id", cart_item_id).eq("user_id", str(user.id)).execute()
    return ok(message="Item removed from cart")


@router.delete("", summary="Clear the entire cart")
async def clear_cart(user=Depends(get_current_user)):
    supabase.table("cart_items").delete().eq("user_id", str(user.id)).execute()
    return ok(message="Cart cleared")
