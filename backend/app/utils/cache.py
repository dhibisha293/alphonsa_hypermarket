import time
from functools import wraps
from typing import Any, Callable

def simple_ttl_cache(ttl_seconds: int = 60):
    """
    A very simple in-memory TTL cache for async endpoints.
    Warning: This caches across all users and uses exact arguments as keys.
    Do not use this for endpoints that return user-specific data!
    """
    cache = {}

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            # Create a cache key from args and kwargs
            # (only works if args/kwargs are hashable, suitable for simple queries)
            key = str(args) + str(kwargs)
            now = time.time()
            
            if key in cache:
                result, timestamp = cache[key]
                if now - timestamp < ttl_seconds:
                    return result
                    
            # Cache miss or expired
            result = await func(*args, **kwargs)
            cache[key] = (result, now)
            return result
        return wrapper
    return decorator
