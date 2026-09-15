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
