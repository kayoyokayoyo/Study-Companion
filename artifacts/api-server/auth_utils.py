import os
import json
import hmac
import hashlib
from functools import wraps
from flask import request, jsonify

_RAW_SECRET = os.environ.get("SESSION_SECRET", "")
_IS_PRODUCTION = os.environ.get("FLASK_ENV", "development") == "production"

# Fail loudly in production if SESSION_SECRET is missing — a weak secret would
# allow anyone who can read the source code to forge an admin cookie.
if _IS_PRODUCTION and not _RAW_SECRET:
    raise RuntimeError(
        "SESSION_SECRET environment variable is required in production. "
        "Set it to a long random string (e.g. openssl rand -hex 32)."
    )

SESSION_SECRET = _RAW_SECRET or "quiznet-dev-only-secret-do-not-use-in-prod"
COOKIE_NAME = "quiznet_auth"
_TOKEN_MSG = b"quiznet_admin_v1"
_SECURE_COOKIE = _IS_PRODUCTION

_CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")


def _load_config() -> dict:
    try:
        if os.path.exists(_CONFIG_PATH):
            with open(_CONFIG_PATH) as f:
                return json.load(f)
    except Exception:
        pass
    return {}


def _save_config(data: dict) -> None:
    existing = _load_config()
    existing.update(data)
    try:
        with open(_CONFIG_PATH, "w") as f:
            json.dump(existing, f, indent=2)
    except Exception as e:
        print(f"Config save error: {e}")


def get_admin_password() -> str:
    """Always reads from config file first, then env, then default."""
    config = _load_config()
    return config.get("admin_password") or os.environ.get("ADMIN_PASSWORD", "admin123")


def update_admin_password(new_password: str) -> None:
    _save_config({"admin_password": new_password})


def generate_token() -> str:
    return hmac.new(SESSION_SECRET.encode("utf-8"), _TOKEN_MSG, hashlib.sha256).hexdigest()


def verify_token(token: str) -> bool:
    expected = generate_token()
    try:
        return hmac.compare_digest(token, expected)
    except Exception:
        return False


def is_admin() -> bool:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return False
    return verify_token(token)


def require_admin(f):
    """Flask decorator — returns 401 if not authenticated as admin."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not is_admin():
            return jsonify({"error": "Admin authentication required"}), 401
        return f(*args, **kwargs)
    return decorated
