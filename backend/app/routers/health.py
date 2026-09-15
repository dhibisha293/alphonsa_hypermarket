from fastapi import APIRouter
from app.database import supabase
from app.utils.responses import ok

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Health check")
async def health_check():
    """Verify the API is running and Supabase connection is alive."""
    try:
        # Quick ping: fetch 1 category
        supabase.table("categories").select("id").limit(1).execute()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return ok(
        data={
            "api": "Alphonsa Hypermarket API",
            "version": "1.0.0",
            "database": db_status,
        },
        message="API is running"
    )
