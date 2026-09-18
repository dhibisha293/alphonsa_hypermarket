from fastapi import Request, HTTPException, Security
from fastapi.security import APIKeyHeader
import os

API_KEY_NAME = "X-POS-API-KEY"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def verify_pos_api_key(api_key: str = Security(api_key_header)):
    # In a real app, you might fetch this from DB or a more secure location
    # For now, we expect it to be in env, or fallback to a hardcoded string
    expected_api_key = os.getenv("POS_API_KEY", "alphonsa-pos-secret-2026")
    
    if api_key == expected_api_key:
        return api_key
    raise HTTPException(status_code=403, detail="Invalid POS API Key")
