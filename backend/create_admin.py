import sys
import os
from dotenv import load_dotenv

def create_admin():
    from dotenv import load_dotenv
    load_dotenv()

    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        print("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        return

    from supabase import create_client, Client
    supabase: Client = create_client(supabase_url, supabase_key)

    email = "admin@example.com"
    password = "Password123"

    try:
        # 1. Admin create user (bypasses rate limits, auto-confirms email)
        print(f"Creating user {email}...")
        res = supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"full_name": "Admin User"}
        })
        user = res.user
        print(f"User created with ID: {user.id}")

        # 2. Update role in profiles table
        print(f"Promoting {email} to admin role...")
        supabase.table("profiles").update({"role": "admin"}).eq("id", user.id).execute()
        print("Success! You can now log in with admin@example.com / Password123")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_admin()
