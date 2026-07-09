import os
from flask import Blueprint, request, jsonify, make_response
from auth_utils import ADMIN_PASSWORD, COOKIE_NAME, generate_token, is_admin

_SECURE_COOKIE = os.environ.get("FLASK_ENV", "development") == "production"

bp = Blueprint("auth", __name__)


@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    password = data.get("password", "")
    if password != ADMIN_PASSWORD:
        return jsonify({"error": "Invalid credentials"}), 401
    token = generate_token()
    resp = make_response(jsonify({"isAdmin": True}))
    resp.set_cookie(
        COOKIE_NAME,
        token,
        httponly=True,
        secure=_SECURE_COOKIE,
        samesite="Lax",
        max_age=7 * 24 * 3600,
        path="/",
    )
    return resp


@bp.route("/logout", methods=["POST"])
def logout():
    resp = make_response(jsonify({"success": True}))
    resp.delete_cookie(COOKIE_NAME, path="/")
    return resp


@bp.route("/me", methods=["GET"])
def get_me():
    return jsonify({"isAdmin": is_admin()})
