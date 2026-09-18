from app.database import supabase

try:
    user_res = supabase.auth.admin.list_users()
    admin_user = next((u for u in user_res if u.email == "admin@example.com"), None)
    if admin_user:
        print(f"User ID from auth.users: {admin_user.id}")
        prof = supabase.table("profiles").select("*").eq("id", admin_user.id).execute()
        print("Profile data:", prof.data)
    else:
        print("User admin@example.com not found!")
except Exception as e:
    print("Error:", e)
