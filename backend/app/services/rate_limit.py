import time
from fastapi import Request, HTTPException, status
from collections import defaultdict
from typing import Dict, List

# In-memory store: client_ip -> list of timestamps
_rate_limit_records: Dict[str, List[float]] = defaultdict(list)

def rate_limit(limit: int, window_seconds: int):
    """
    FastAPI dependency factory that returns a rate limiting dependency.
    Tracks client IP using a sliding window.
    """
    def dependency(request: Request):
        # Fallback to local loopback if request.client is None
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        
        # Clean up expired timestamps outside the sliding window
        timestamps = _rate_limit_records[client_ip]
        _rate_limit_records[client_ip] = [t for t in timestamps if now - t < window_seconds]
        
        # Check limit
        if len(_rate_limit_records[client_ip]) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later."
            )
            
        # Log the current request timestamp
        _rate_limit_records[client_ip].append(now)
        
    return dependency
