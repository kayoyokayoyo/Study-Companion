import os
from flask import Blueprint, request, jsonify, make_response
from auth_utils import (
    COOKIE_NAME, generate_token, is_admin,
    get_admin_password, update_admin_password, require_admin
)

bp = Blueprint("auth", __name__)

_SECURE_COOKIE = os.environ.get("FLASK_ENV", "development") == "production"


@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    password = data.get("password", "")
    if password != get_admin_password():
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


@bp.route("/settings", methods=["PATCH"])
@require_admin
def update_settings():
    data = request.get_json(silent=True) or {}
    current_password = (data.get("currentPassword") or "").strip()
    new_password     = (data.get("newPassword") or "").strip()

    if not current_password or current_password != get_admin_password():
        return jsonify({"error": "Mot de passe actuel incorrect"}), 401

    if len(new_password) < 6:
        return jsonify({"error": "Le nouveau mot de passe doit avoir au moins 6 caractères"}), 422

    update_admin_password(new_password)
    return jsonify({"success": True})
