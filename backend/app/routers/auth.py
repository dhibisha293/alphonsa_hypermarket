from fastapi import APIRouter, HTTPException
from app.database import supabase_anon, supabase
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse
from app.utils.responses import ok, fail

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", summary="Register a new user account")
async def register(body: RegisterRequest):
    try:
        response = supabase_anon.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {
                "data": {"full_name": body.full_name or ""}
            }
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

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
async def login(body: LoginRequest):
    try:
        response = supabase_anon.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password
        })
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if response.user is None or response.session is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = response.user
    full_name = (user.user_metadata or {}).get("full_name")

    return ok(
        data={
            "access_token": response.session.access_token,
            "token_type": "bearer",
            "user_id": str(user.id),
            "email": user.email,
            "full_name": full_name,
        },
        message="Welcome back to Alphonsa Hypermarket!"
    )


@router.post("/logout", summary="Sign out the current user")
async def logout():
    # Token invalidation happens client-side; server just confirms
    return ok(message="Logged out successfully")


@router.get("/me", summary="Get current authenticated user info")
async def get_me():
    """
    This endpoint is intentionally lightweight.
    The React frontend validates its token via this route on startup.
    Actual user data is carried in the JWT itself.
    """
    return ok(message="Use the Authorization header with a valid Supabase JWT")
