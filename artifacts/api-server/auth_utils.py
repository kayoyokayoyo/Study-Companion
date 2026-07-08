import os
import hmac
import hashlib
from fastapi import Request, HTTPException

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
SESSION_SECRET = os.environ.get("SESSION_SECRET", "quiznet-default-secret-change-me")
COOKIE_NAME = "quiznet_auth"
_TOKEN_MSG = b"quiznet_admin_v1"


def generate_token() -> str:
    return hmac.new(SESSION_SECRET.encode("utf-8"), _TOKEN_MSG, hashlib.sha256).hexdigest()


def verify_token(token: str) -> bool:
    expected = generate_token()
    try:
        return hmac.compare_digest(token, expected)
    except Exception:
        return False


def is_admin(request: Request) -> bool:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return False
    return verify_token(token)


def require_admin(request: Request) -> None:
    """FastAPI dependency — raises 401 if not authenticated as admin."""
    if not is_admin(request):
        raise HTTPException(status_code=401, detail="Admin authentication required")
