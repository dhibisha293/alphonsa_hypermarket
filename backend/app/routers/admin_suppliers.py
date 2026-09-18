from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from app.database import supabase
from app.middleware.auth import RequireRole
from app.utils.responses import ok
import uuid

router = APIRouter(prefix="/admin", tags=["Admin Suppliers"], dependencies=[Depends(RequireRole(["SUPER_ADMIN"]))])

class SupplierCreate(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None
    is_active: bool = True

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None
    is_active: Optional[bool] = None

class POItem(BaseModel):
    product_id: str
    quantity: int
    unit_cost: float

class PurchaseOrderCreate(BaseModel):
    supplier_id: str
    expected_date: Optional[str] = None
    notes: Optional[str] = None
    items: List[POItem]

class PurchaseOrderUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

# --- Suppliers ---

@router.get("/suppliers")
async def list_suppliers():
    try:
        res = supabase.table("suppliers").select("*").order("name").execute()
        return ok(data=res.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suppliers")
async def create_supplier(data: SupplierCreate):
    try:
        payload = data.dict(exclude_unset=True)
        res = supabase.table("suppliers").insert(payload).execute()
        return ok(data=res.data[0], message="Supplier created")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/suppliers/{supplier_id}")
async def update_supplier(supplier_id: str, data: SupplierUpdate):
    try:
        payload = data.dict(exclude_unset=True)
        if not payload:
            return ok(message="No changes")
        res = supabase.table("suppliers").update(payload).eq("id", supplier_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Supplier not found")
        return ok(data=res.data[0], message="Supplier updated")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/suppliers/{supplier_id}")
async def delete_supplier(supplier_id: str):
    try:
        supabase.table("suppliers").delete().eq("id", supplier_id).execute()
        return ok(message="Supplier deleted")
    except Exception as e:
        if 'foreign key constraint' in str(e).lower():
            raise HTTPException(status_code=400, detail="Cannot delete supplier with associated purchase orders")
        raise HTTPException(status_code=500, detail=str(e))

# --- Purchase Orders ---

@router.get("/purchase-orders")
async def list_purchase_orders():
    try:
        res = (
            supabase.table("purchase_orders")
            .select("*, suppliers(name), purchase_order_items(*, products(name, sku))")
            .order("created_at", desc=True)
            .execute()
        )
        return ok(data=res.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/purchase-orders")
async def create_purchase_order(data: PurchaseOrderCreate):
    try:
        # Generate PO Number
        import time
        po_number = f"PO-{int(time.time())}"
        
        # Calculate total
        total_amount = sum(item.quantity * item.unit_cost for item in data.items)
        
        po_payload = {
            "po_number": po_number,
            "supplier_id": data.supplier_id,
            "expected_date": data.expected_date,
            "notes": data.notes,
            "total_amount": total_amount,
            "status": "DRAFT"
        }
        po_res = supabase.table("purchase_orders").insert(po_payload).execute()
        if not po_res.data:
            raise HTTPException(status_code=400, detail="Failed to create PO")
            
        po_id = po_res.data[0]["id"]
        
        # Insert Items
        items_payload = []
        for item in data.items:
            items_payload.append({
                "po_id": po_id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_cost": item.unit_cost,
                "total_cost": item.quantity * item.unit_cost
            })
            
        supabase.table("purchase_order_items").insert(items_payload).execute()
        
        return ok(data=po_res.data[0], message="Purchase Order created")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/purchase-orders/{po_id}")
async def update_purchase_order(po_id: str, data: PurchaseOrderUpdate):
    try:
        payload = data.dict(exclude_unset=True)
        if not payload:
            return ok(message="No changes")
            
        # If status is changing to RECEIVED, we should update inventory.
        # But this is a basic implementation. We will update the PO status first.
        # Ideally, there should be a function to receive items individually.
        
        res = supabase.table("purchase_orders").update(payload).eq("id", po_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="PO not found")
        return ok(data=res.data[0], message="PO updated")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
