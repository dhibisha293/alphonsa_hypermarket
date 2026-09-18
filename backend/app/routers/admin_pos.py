from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Security
from pydantic import BaseModel
from typing import List, Optional
from app.database import supabase
from app.middleware.auth import RequireRole
from app.middleware.api_key import verify_pos_api_key
from app.utils.responses import ok
import csv
import io

router = APIRouter(prefix="/admin", tags=["Admin POS Integration"])

class InventorySyncItem(BaseModel):
    barcode: str
    quantity: int
    price: Optional[float] = None

class POSSyncPayload(BaseModel):
    items: List[InventorySyncItem]

@router.post("/pos/sync", dependencies=[Depends(verify_pos_api_key)])
async def pos_sync_inventory(data: POSSyncPayload):
    """
    Endpoint for POS to push inventory updates via JSON.
    Matches products by barcode.
    """
    try:
        updated_count = 0
        not_found = []
        for item in data.items:
            # Find product by barcode
            prod_res = supabase.table("products").select("id").eq("barcode", item.barcode).execute()
            if prod_res.data and len(prod_res.data) > 0:
                prod_id = prod_res.data[0]["id"]
                update_payload = {"stock_quantity": item.quantity}
                if item.price is not None:
                    update_payload["price"] = item.price
                supabase.table("products").update(update_payload).eq("id", prod_id).execute()
                updated_count += 1
            else:
                not_found.append(item.barcode)
                
        return ok(message=f"Synced {updated_count} products.", data={"not_found_barcodes": not_found})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/pos/import-csv", dependencies=[Depends(RequireRole(["SUPER_ADMIN"]))])
async def pos_import_csv(file: UploadFile = File(...)):
    """
    Fallback for manual CSV upload from POS.
    Expected CSV columns: barcode, quantity, price(optional)
    """
    try:
        content = await file.read()
        text = content.decode("utf-8")
        reader = csv.DictReader(io.StringIO(text))
        
        updated_count = 0
        not_found = []
        
        for row in reader:
            barcode = row.get("barcode")
            quantity = row.get("quantity")
            price = row.get("price")
            
            if not barcode or quantity is None:
                continue
                
            try:
                qty = int(quantity)
                prc = float(price) if price else None
                
                prod_res = supabase.table("products").select("id").eq("barcode", barcode).execute()
                if prod_res.data and len(prod_res.data) > 0:
                    prod_id = prod_res.data[0]["id"]
                    update_payload = {"stock_quantity": qty}
                    if prc is not None:
                        update_payload["price"] = prc
                    supabase.table("products").update(update_payload).eq("id", prod_id).execute()
                    updated_count += 1
                else:
                    not_found.append(barcode)
            except ValueError:
                pass # skip invalid rows
                
        return ok(message=f"Imported {updated_count} products from CSV.", data={"not_found_barcodes": not_found})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pos/export-orders", dependencies=[Depends(RequireRole(["SUPER_ADMIN"]))])
async def pos_export_orders():
    """
    Exports new orders to a CSV format suitable for POS importing.
    """
    try:
        # Fetch confirmed orders that haven't been synced to POS yet
        # For simplicity, we just fetch 'confirmed' orders. In a real scenario, we'd have a 'synced_to_pos' flag.
        res = supabase.table("orders").select("*, order_items(*, products(barcode, name))").eq("status", "confirmed").execute()
        orders = res.data or []
        
        # We could return a CSV string, but for React frontend we can return JSON and let frontend convert, 
        # or return a plain text CSV directly. Let's return JSON for simplicity in building the admin panel.
        return ok(data=orders)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
