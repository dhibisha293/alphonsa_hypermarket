from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.database import supabase
from app.middleware.auth import RequireRole
from app.utils.responses import ok

router = APIRouter(prefix="/admin", tags=["Admin Delivery"], dependencies=[Depends(RequireRole(["SUPER_ADMIN"]))])

class DeliveryAssignmentCreate(BaseModel):
    order_id: str
    staff_user_id: str
    notes: Optional[str] = None

class DeliveryAssignmentUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

@router.get("/delivery")
async def list_delivery_assignments():
    try:
        # Fetch assignments with order details and staff details
        res = (
            supabase.table("delivery_assignments")
            .select("*, orders(order_number, delivery_address, total, status), profiles:staff_user_id(full_name)")
            .order("created_at", desc=True)
            .execute()
        )
        return ok(data=res.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/delivery/staff")
async def get_delivery_staff():
    try:
        # Fetch staff members with DELIVERY_STAFF role
        res = supabase.table("staff_roles").select("user_id").eq("role", "DELIVERY_STAFF").execute()
        staff_user_ids = [s["user_id"] for s in res.data or []]
        
        staff = []
        if staff_user_ids:
            prof_res = supabase.table("profiles").select("id, full_name").in_("id", staff_user_ids).execute()
            staff = prof_res.data or []
            
        return ok(data=staff)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/delivery")
async def assign_delivery(data: DeliveryAssignmentCreate):
    try:
        payload = data.dict(exclude_unset=True)
        res = supabase.table("delivery_assignments").insert(payload).execute()
        if not res.data:
            raise HTTPException(status_code=400, detail="Failed to assign delivery")
        
        return ok(data=res.data[0], message="Delivery assigned successfully")
    except Exception as e:
        if 'duplicate key' in str(e).lower():
            raise HTTPException(status_code=400, detail="Delivery already assigned for this order")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/delivery/{assignment_id}")
async def update_delivery(assignment_id: str, data: DeliveryAssignmentUpdate):
    try:
        payload = data.dict(exclude_unset=True)
        if not payload:
            return ok(message="No changes provided")
        res = supabase.table("delivery_assignments").update(payload).eq("id", assignment_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Assignment not found")
        return ok(data=res.data[0], message="Delivery updated successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delivery/{assignment_id}")
async def unassign_delivery(assignment_id: str):
    try:
        res = supabase.table("delivery_assignments").delete().eq("id", assignment_id).execute()
        return ok(message="Delivery unassigned successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
