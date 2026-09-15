from supabase import create_client, Client
from app.config import settings

# Anon client — used for auth operations (respects RLS)
supabase_anon: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_ANON_KEY
)

# Service-role client — used for trusted server-side ops (bypasses RLS)
# NEVER expose this to the frontend
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY
)
