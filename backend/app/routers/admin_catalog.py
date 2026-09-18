from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import List
import io
import csv
from app.database import supabase
from app.middleware.auth import RequireRole
from app.utils.responses import ok
from app.schemas.products import (
    BrandOut, BrandCreate,
    CategoryOut, CategoryCreate,
    SubcategoryOut, SubcategoryCreate,
    ProductOut, ProductCreate, ProductUpdate
)

router = APIRouter(prefix="/admin", tags=["Admin Catalog"], dependencies=[Depends(RequireRole(["SUPER_ADMIN"]))])


# ─── BRANDS ───────────────────────────────────────────────────────────────────

@router.get("/brands", summary="List all brands (admin)")
async def admin_list_brands():
    result = supabase.table("brands").select("*").order("name").execute()
    return ok(data=[BrandOut.from_db(r).model_dump() for r in result.data])

@router.post("/brands", summary="Create a new brand")
async def admin_create_brand(body: BrandCreate):
    result = supabase.table("brands").insert(body.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create brand")
    return ok(data=BrandOut.from_db(result.data[0]).model_dump())

@router.put("/brands/{brand_id}", summary="Update a brand")
async def admin_update_brand(brand_id: str, body: BrandCreate):
    result = supabase.table("brands").update(body.model_dump()).eq("id", brand_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Brand not found")
    return ok(data=BrandOut.from_db(result.data[0]).model_dump())

@router.delete("/brands/{brand_id}", summary="Delete a brand")
async def admin_delete_brand(brand_id: str):
    result = supabase.table("brands").delete().eq("id", brand_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Brand not found or could not be deleted")
    return ok(message="Brand deleted successfully")


# ─── CATEGORIES ───────────────────────────────────────────────────────────────

@router.get("/categories", summary="List all categories (admin)")
async def admin_list_categories():
    result = supabase.table("categories").select("*").order("sort_order").execute()
    return ok(data=[CategoryOut.from_db(r).model_dump() for r in result.data])

@router.post("/categories", summary="Create a new category")
async def admin_create_category(body: CategoryCreate):
    result = supabase.table("categories").insert(body.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create category")
    return ok(data=CategoryOut.from_db(result.data[0]).model_dump())

@router.put("/categories/{category_id}", summary="Update a category")
async def admin_update_category(category_id: str, body: CategoryCreate):
    result = supabase.table("categories").update(body.model_dump()).eq("id", category_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Category not found")
    return ok(data=CategoryOut.from_db(result.data[0]).model_dump())

@router.delete("/categories/{category_id}", summary="Delete a category")
async def admin_delete_category(category_id: str):
    result = supabase.table("categories").delete().eq("id", category_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Category not found or could not be deleted")
    return ok(message="Category deleted successfully")


# ─── SUBCATEGORIES ────────────────────────────────────────────────────────────

@router.get("/subcategories", summary="List all subcategories (admin)")
async def admin_list_subcategories():
    result = supabase.table("subcategories").select("*").order("name").execute()
    return ok(data=[SubcategoryOut.from_db(r).model_dump() for r in result.data])

@router.post("/subcategories", summary="Create a new subcategory")
async def admin_create_subcategory(body: SubcategoryCreate):
    result = supabase.table("subcategories").insert(body.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create subcategory")
    return ok(data=SubcategoryOut.from_db(result.data[0]).model_dump())

@router.put("/subcategories/{subcategory_id}", summary="Update a subcategory")
async def admin_update_subcategory(subcategory_id: str, body: SubcategoryCreate):
    result = supabase.table("subcategories").update(body.model_dump()).eq("id", subcategory_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    return ok(data=SubcategoryOut.from_db(result.data[0]).model_dump())

@router.delete("/subcategories/{subcategory_id}", summary="Delete a subcategory")
async def admin_delete_subcategory(subcategory_id: str):
    result = supabase.table("subcategories").delete().eq("id", subcategory_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Subcategory not found or could not be deleted")
    return ok(message="Subcategory deleted successfully")


# ─── PRODUCTS ─────────────────────────────────────────────────────────────────

@router.post("/products", summary="Create a new product")
async def admin_create_product(body: ProductCreate):
    result = supabase.table("products").insert(body.model_dump(exclude_unset=True)).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create product")
    return ok(data=ProductOut.from_db(result.data[0]).model_dump())

@router.put("/products/{product_id}", summary="Update a product")
async def admin_update_product(product_id: str, body: ProductUpdate):
    update_data = body.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")
    
    result = supabase.table("products").update(update_data).eq("id", product_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return ok(data=ProductOut.from_db(result.data[0]).model_dump())

@router.delete("/products/{product_id}", summary="Delete a product")
async def admin_delete_product(product_id: str):
    result = supabase.table("products").delete().eq("id", product_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found or could not be deleted")
    return ok(message="Product deleted successfully")


@router.post("/products/bulk", summary="Bulk import products via CSV")
async def admin_bulk_import_products(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    content = await file.read()
    try:
        decoded = content.decode('utf-8')
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid file encoding. Must be UTF-8.")
        
    reader = csv.DictReader(io.StringIO(decoded))
    
    success_count = 0
    errors = []
    
    for row_idx, row in enumerate(reader, start=2):
        try:
            # Requires at minimum name, price, and category_slug
            if not row.get("name") or not row.get("price") or not row.get("category_slug"):
                errors.append(f"Row {row_idx}: Missing required fields (name, price, category_slug)")
                continue
                
            payload = {
                "name": row["name"],
                "category_slug": row["category_slug"],
                "category_label": row.get("category_label") or row["category_slug"].title(),
                "price": float(row["price"]),
                "original_price": float(row["original_price"]) if row.get("original_price") else None,
                "discount": int(row["discount"]) if row.get("discount") else 0,
                "tax_rate": float(row["tax_rate"]) if row.get("tax_rate") else 0,
                "stock_qty": int(row["stock_qty"]) if row.get("stock_qty") else 999,
                "sku": row.get("sku"),
                "barcode": row.get("barcode"),
                "description": row.get("description"),
                "unit": row.get("unit"),
                "image_url": row.get("image_url"),
            }
            # Optional UUID fields
            if row.get("brand_id"):
                payload["brand_id"] = row["brand_id"]
            if row.get("subcategory_id"):
                payload["subcategory_id"] = row["subcategory_id"]
                
            res = supabase.table("products").insert(payload).execute()
            if res.data:
                success_count += 1
            else:
                errors.append(f"Row {row_idx}: Database insertion failed")
        except Exception as e:
            errors.append(f"Row {row_idx}: Error parsing row - {str(e)}")
            
    return ok(message=f"Bulk import complete. Imported: {success_count}, Errors: {len(errors)}", data={"errors": errors})
