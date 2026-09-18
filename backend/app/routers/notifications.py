from fastapi import APIRouter, HTTPException, Depends, Query
from app.database import supabase
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
async def get_notifications(
    user=Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    offset = (page - 1) * page_size
    
    # Supabase query
    res = supabase.table("notifications")\
        .select("*", count="exact")\
        .eq("user_id", str(user.id))\
        .order("created_at", desc=True)\
        .range(offset, offset + page_size - 1)\
        .execute()
        
    return {
        "success": True,
        "data": {
            "items": res.data or [],
            "total": res.count or 0,
            "page": page,
            "page_size": page_size
        }
    }

@router.get("/unread-count")
async def get_unread_count(user=Depends(get_current_user)):
    res = supabase.table("notifications")\
        .select("id", count="exact")\
        .eq("user_id", str(user.id))\
        .eq("is_read", False)\
        .execute()
        
    return {
        "success": True,
        "data": {
            "count": res.count or 0
        }
    }

@router.patch("/{notification_id}/read")
async def mark_as_read(notification_id: str, user=Depends(get_current_user)):
    # RLS ensures user can only update their own
    res = supabase.table("notifications")\
        .update({"is_read": True})\
        .eq("id", notification_id)\
        .eq("user_id", str(user.id))\
        .execute()
        
    if not res.data:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    return {"success": True, "data": res.data[0]}

@router.patch("/read-all")
async def mark_all_as_read(user=Depends(get_current_user)):
    res = supabase.table("notifications")\
        .update({"is_read": True})\
        .eq("user_id", str(user.id))\
        .eq("is_read", False)\
        .execute()
        
    return {"success": True, "message": "All notifications marked as read"}
