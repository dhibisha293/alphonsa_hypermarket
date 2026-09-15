from typing import Any, Optional
from pydantic import BaseModel


class SuccessResponse(BaseModel):
    success: bool = True
    data: Any = None
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str


def ok(data: Any = None, message: str = None) -> dict:
    return {"success": True, "data": data, "message": message}


def fail(message: str) -> dict:
    return {"success": False, "message": message}
