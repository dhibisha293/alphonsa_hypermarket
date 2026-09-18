from typing import Optional, Dict, Any
from app.database import supabase
from fastapi import Request

async def log_audit_action(
    user_id: Optional[str],
    action: str,
    entity: str,
    entity_id: Optional[str] = None,
    old_value: Optional[Dict[str, Any]] = None,
    new_value: Optional[Dict[str, Any]] = None,
    request: Optional[Request] = None
):
    """
    Utility function to log sensitive administrative actions to the audit_logs table.
    """
    ip_address = None
    if request:
        # Attempt to get real IP if behind proxy, otherwise fallback to client host
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            ip_address = forwarded_for.split(",")[0].strip()
        elif request.client:
            ip_address = request.client.host

    log_entry = {
        "user_id": user_id,
        "action": action,
        "entity": entity,
        "entity_id": entity_id,
        "old_value": old_value,
        "new_value": new_value,
        "ip_address": ip_address
    }
    
    # Remove keys with None values to let DB defaults/nulls handle it safely
    log_entry = {k: v for k, v in log_entry.items() if v is not None}
    
    try:
        # Use the service role client since RLS for audit_logs is INTERNAL ONLY
        supabase.table("audit_logs").insert(log_entry).execute()
    except Exception as e:
        # In a real system, you might want to log this failure to a file
        print(f"Failed to write audit log: {e}")
