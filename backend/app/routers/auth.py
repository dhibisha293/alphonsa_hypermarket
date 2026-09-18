import time
from collections import defaultdict
from fastapi import APIRouter, HTTPException, Request, Depends
from app.database import supabase_anon, supabase
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, ProfileUpdateRequest
from app.utils.responses import ok, fail
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

from app.config import settings

# Simple in-memory rate limiter
# Deployment Note: This state is process-local. For horizontal scaling (multiple workers/containers),
# this should be replaced with a distributed store like Redis.
RATE_LIMIT_STORE = defaultdict(list)

def check_rate_limit(request: Request):
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Clean up old timestamps
    RATE_LIMIT_STORE[ip] = [t for t in RATE_LIMIT_STORE[ip] if now - t < settings.AUTH_RATE_LIMIT_WINDOW_SECONDS]
    
    if len(RATE_LIMIT_STORE[ip]) >= settings.AUTH_RATE_LIMIT_MAX:
        raise HTTPException(status_code=429, detail="Too many attempts. Please try again later.")
        
    RATE_LIMIT_STORE[ip].append(now)

@router.post("/register", summary="Register a new user account")
async def register(body: RegisterRequest, _: None = Depends(check_rate_limit)):
    try:
        response = supabase_anon.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {
                "data": {"full_name": body.full_name or ""}
            }
        })
    except Exception as e:
        # Sanitize error to prevent leaking sensitive details
        raise HTTPException(status_code=400, detail="Registration failed. Please check your details.")

    if response.user is None:
        raise HTTPException(status_code=400, detail="Registration failed. Please check your details.")

    # If email confirmation is disabled in Supabase, session is available immediately
    session = response.session
    access_token = session.access_token if session else None

    return ok(
        data={
            "user_id": str(response.user.id),
            "email": response.user.email,
            "full_name": body.full_name,
            "access_token": access_token,
            "confirmed": session is not None,
        },
        message="Account created! Check your email to confirm." if not session else "Account created successfully!"
    )


@router.post("/login", summary="Sign in with email and password")
async def login(body: LoginRequest, _: None = Depends(check_rate_limit)):
    try:
        response = supabase_anon.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password
        })
    except Exception as e:
        # Sanitize error to prevent leaking sensitive details
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if response.user is None or response.session is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = response.user
    full_name = (user.user_metadata or {}).get("full_name")

    # Fetch role and points from profiles table
    role = "customer"
    loyalty_points = 0
    try:
        profile_res = supabase.table("profiles").select("role, loyalty_points").eq("id", user.id).single().execute()
        if profile_res.data:
            role = profile_res.data.get("role", "customer")
            loyalty_points = profile_res.data.get("loyalty_points", 0)
    except Exception as e:
        pass # fallback

    return ok(
        data={
            "access_token": response.session.access_token,
            "token_type": "bearer",
            "user_id": str(user.id),
            "email": user.email,
            "full_name": full_name,
            "role": role,
            "loyalty_points": loyalty_points,
        },
        message="Welcome back to Alphonsa Hypermarket!"
    )


@router.post("/logout", summary="Sign out the current user")
async def logout():
    # Token invalidation happens client-side; server just confirms
    return ok(message="Logged out successfully")


@router.get("/me", summary="Get current authenticated user info")
async def get_me(user=Depends(get_current_user)):
    """
    Returns the current user profile, including loyalty points.
    """
    full_name = (user.user_metadata or {}).get("full_name", "")
    
    # Fetch role and points from profiles table
    role = "customer"
    loyalty_points = 0
    try:
        profile_res = supabase.table("profiles").select("role, loyalty_points").eq("id", user.id).single().execute()
        if profile_res.data:
            role = profile_res.data.get("role", "customer")
            loyalty_points = profile_res.data.get("loyalty_points", 0)
    except Exception as e:
        pass # fallback
        
    return ok(data={
        "user_id": str(user.id),
        "email": user.email,
        "full_name": full_name,
        "role": role,
        "loyalty_points": loyalty_points,
        "phone": profile_res.data.get("phone", "") if profile_res.data else ""
    })

@router.put("/me", summary="Update current user profile")
async def update_me(body: ProfileUpdateRequest, user=Depends(get_current_user)):
    """
    Update the user's profile information (name and phone).
    """
    update_data = {}
    if body.full_name is not None:
        update_data["full_name"] = body.full_name
    if body.phone is not None:
        update_data["phone"] = body.phone
        
    if not update_data:
        return ok(message="No changes provided")

    try:
        supabase.table("profiles").update(update_data).eq("id", str(user.id)).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update profile")

    # If full_name is updated, we might also want to update the raw_user_meta_data in auth.users
    # However, supabase python client provides update_user for this.
    if body.full_name is not None:
        try:
            supabase.auth.admin.update_user_by_id(
                str(user.id),
                {"user_metadata": {"full_name": body.full_name}}
            )
        except Exception:
            pass # ignore if this fails, profile table is the main source

    return ok(message="Profile updated successfully")
