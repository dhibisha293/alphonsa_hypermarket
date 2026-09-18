from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.schemas.commerce import AddressCreate, AddressOut
from app.middleware.auth import get_current_user
from app.utils.responses import ok

router = APIRouter(prefix="/addresses", tags=["Addresses"])

@router.get("", summary="Get current user's addresses")
async def get_addresses(user=Depends(get_current_user)):
    result = supabase.table("addresses").select("*").eq("user_id", str(user.id)).order("created_at", desc=True).execute()
    addresses = [AddressOut.from_db(r).model_dump() for r in result.data]
    return ok(data=addresses)

@router.post("", summary="Add a new address")
async def add_address(body: AddressCreate, user=Depends(get_current_user)):
    # If is_default is true, unset other defaults
    if body.is_default:
        supabase.table("addresses").update({"is_default": False}).eq("user_id", str(user.id)).execute()

    # If this is their first address, force it to be default
    existing = supabase.table("addresses").select("id").eq("user_id", str(user.id)).limit(1).execute()
    is_default = body.is_default or not existing.data

    new_address = {
        "user_id": str(user.id),
        "full_name": body.full_name,
        "phone": body.phone,
        "address_line": body.address_line,
        "area": body.area,
        "city": body.city,
        "state": body.state,
        "pincode": body.pincode,
        "delivery_instructions": body.delivery_instructions,
        "is_default": is_default
    }

    result = supabase.table("addresses").insert(new_address).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to add address")
    
    return ok(data=AddressOut.from_db(result.data[0]).model_dump(), message="Address added")

@router.put("/{address_id}", summary="Update an address")
async def update_address(address_id: str, body: AddressCreate, user=Depends(get_current_user)):
    if body.is_default:
        supabase.table("addresses").update({"is_default": False}).eq("user_id", str(user.id)).execute()

    update_data = {
        "full_name": body.full_name,
        "phone": body.phone,
        "address_line": body.address_line,
        "area": body.area,
        "city": body.city,
        "state": body.state,
        "pincode": body.pincode,
        "delivery_instructions": body.delivery_instructions,
        "is_default": body.is_default
    }

    result = supabase.table("addresses").update(update_data).eq("id", address_id).eq("user_id", str(user.id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Address not found")
        
    return ok(data=AddressOut.from_db(result.data[0]).model_dump(), message="Address updated")

@router.delete("/{address_id}", summary="Delete an address")
async def delete_address(address_id: str, user=Depends(get_current_user)):
    # Get address to check if default
    addr = supabase.table("addresses").select("is_default").eq("id", address_id).eq("user_id", str(user.id)).maybe_single().execute()
    if not addr.data:
        raise HTTPException(status_code=404, detail="Address not found")

    supabase.table("addresses").delete().eq("id", address_id).eq("user_id", str(user.id)).execute()

    # If it was default, make another one default
    if addr.data.get("is_default"):
        remaining = supabase.table("addresses").select("id").eq("user_id", str(user.id)).limit(1).execute()
        if remaining.data:
            supabase.table("addresses").update({"is_default": True}).eq("id", remaining.data[0]["id"]).execute()

    return ok(message="Address deleted")
