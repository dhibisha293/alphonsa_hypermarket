import os
import sys
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from .env")
    sys.exit(1)

# Use Service Role Key to bypass RLS and perform admin actions
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def promote_admin(email: str):
    print(f"Promoting user {email} to admin...")
    
    # 1. Fetch user by email to get their ID
    # Note: supabase-py admin API to list users might be needed, but we can query the profiles table directly
    # since we created it with a trigger. We don't have email in profiles directly, so we need to use auth.users
    # Or, simpler: we just update profiles based on the user_id if we query it via the auth API.
    
    # Using the admin auth API:
    try:
        users = supabase.auth.admin.list_users()
        user_list = users.users
        
        target_user = None
        for u in user_list:
            if u.email == email:
                target_user = u
                break
                
        if not target_user:
            print(f"User with email '{email}' not found in Supabase Auth.")
            sys.exit(1)
            
        print(f"Found user: {target_user.id}")
        
        # 2. Update the role in the profiles table
        res = supabase.table("profiles").update({"role": "admin"}).eq("id", target_user.id).execute()
        
        if len(res.data) > 0:
            print(f"Successfully promoted {email} to admin!")
        else:
            print(f"Failed to update profile for {email}. Make sure they have logged in at least once.")
            
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python promote_admin.py <user_email>")
        sys.exit(1)
        
    promote_admin(sys.argv[1])
