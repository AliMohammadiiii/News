import os
from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader

API_KEY_HEADER_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_HEADER_NAME, auto_error=False)
EXPECTED_API_KEY = os.getenv("NEWS_INGEST_API_KEY")

def require_ingest_api_key(api_key: str | None = Security(api_key_header)) -> None:
    # For local dev, you may allow missing key by returning early,
    # but for safety we'll enforce when EXPECTED_API_KEY is set.
    if not EXPECTED_API_KEY:
        return
    if api_key and api_key == EXPECTED_API_KEY:
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Invalid or missing API key",
    )
