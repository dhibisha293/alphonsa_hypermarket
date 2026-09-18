from app.database import supabase

user_id = "ba13f3b3-0f4c-471c-9044-b7d61e304ec7"
try:
    profile_res = supabase.table("profiles").select("role").eq("id", user_id).single().execute()
    print("profile_res.data:", profile_res.data)
except Exception as e:
    print("Exception in auth.py logic:", e)
