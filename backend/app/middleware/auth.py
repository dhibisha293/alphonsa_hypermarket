from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.database import supabase_anon

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """
    Validate the JWT token sent by the React frontend.
    Returns the Supabase user dict if valid, raises 401 otherwise.
    """
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = credentials.credentials
    try:
        response = supabase_anon.auth.get_user(token)
        if response.user is None:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return response.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """
    Like get_current_user but returns None instead of raising 401.
    Used for endpoints that work for both guests and logged-in users.
    """
    if credentials is None:
        return None
    try:
        response = supabase_anon.auth.get_user(credentials.credentials)
        return response.user
    except Exception:
        return None

async def get_staff_roles(current_user=Security(get_current_user)) -> list[str]:
    """
    Fetch all roles for the current user from the staff_roles table.
    Returns a list of roles, e.g. ['SUPER_ADMIN', 'INVENTORY_MANAGER'].
    """
    from app.database import supabase
    try:
        res = supabase.table("staff_roles").select("role").eq("user_id", current_user.id).execute()
        return [row["role"] for row in res.data] if res.data else []
    except Exception:
        return []

class RequireRole:
    """
    Dependency factory to enforce RBAC.
    Usage: @router.get("/orders", dependencies=[Depends(RequireRole(["SUPER_ADMIN", "ORDER_MANAGER"]))])
    """
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    async def __call__(self, roles: list[str] = Security(get_staff_roles)):
        # SUPER_ADMIN overrides all permissions
        if "SUPER_ADMIN" in roles:
            return True
            
        for role in self.allowed_roles:
            if role in roles:
                return True
                
        raise HTTPException(status_code=403, detail="Not authorized for this action")

# Convenience dependency for legacy endpoints that just required any admin access
async def get_current_admin(roles: list[str] = Security(get_staff_roles), current_user=Security(get_current_user)):
    """
    Legacy helper ensuring user is at least a SUPER_ADMIN.
    We return current_user for backwards compatibility.
    """
    if "SUPER_ADMIN" not in roles:
        raise HTTPException(status_code=403, detail="Not authorized as admin")
    return current_user
