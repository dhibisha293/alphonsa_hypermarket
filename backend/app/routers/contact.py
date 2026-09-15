from fastapi import APIRouter, HTTPException
from app.database import supabase
from app.schemas.commerce import ContactMessageRequest
from app.utils.responses import ok

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("", summary="Submit a contact/support message")
async def submit_contact(body: ContactMessageRequest):
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    supabase.table("contact_messages").insert({
        "name": body.name,
        "email": body.email,
        "phone": body.phone,
        "message": body.message,
        "status": "new",
    }).execute()

    return ok(message="Your message has been received! Our team will get back to you soon.")
