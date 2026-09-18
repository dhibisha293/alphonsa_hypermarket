import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async def seed_data():
    print("🌱 Starting Data Seed...")

    # Categories
    categories = [
        {"name": "Fresh Produce", "slug": "fresh-produce", "description": "Fresh fruits and vegetables", "image_url": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80"},
        {"name": "Bakery", "slug": "bakery", "description": "Freshly baked bread and pastries", "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80"},
        {"name": "Dairy & Eggs", "slug": "dairy-eggs", "description": "Milk, cheese, and eggs", "image_url": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&q=80"},
        {"name": "Meat & Seafood", "slug": "meat-seafood", "description": "Premium cuts and fresh catch", "image_url": "https://images.unsplash.com/photo-1607623814075-e51df1bd632f?w=500&q=80"},
        {"name": "Pantry", "slug": "pantry", "description": "Everyday essentials", "image_url": "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=500&q=80"}
    ]

    print("Inserting Categories...")
    for cat in categories:
        try:
            supabase.table("categories").upsert(cat, on_conflict="slug").execute()
        except Exception as e:
            print(f"Error inserting {cat['name']}: {e}")

    cat_res = supabase.table("categories").select("id, slug").execute()
    cat_map = {c["slug"]: c["id"] for c in cat_res.data}

    # Products
    products = [
        {
            "name": "Organic Bananas",
            "description": "Sweet and ripe organic bananas.",
            "price": 65.00,
            "stock_qty": 100,
            "category_id": cat_map.get("fresh-produce"),
            "image_url": "https://images.unsplash.com/photo-1571501711558-ae2c107f57cd?w=500&q=80",
            "is_active": True
        },
        {
            "name": "Fresh Sourdough Bread",
            "description": "Artisan baked sourdough bread.",
            "price": 120.00,
            "stock_qty": 20,
            "category_id": cat_map.get("bakery"),
            "image_url": "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=500&q=80",
            "is_active": True
        }
    ]

    print("Inserting Products...")
    for prod in products:
        try:
            supabase.table("products").upsert(prod, on_conflict="name").execute()
        except Exception as e:
            print(f"Error inserting {prod['name']}: {e}")

    print("✅ Seeding Complete!")

if __name__ == "__main__":
    asyncio.run(seed_data())
