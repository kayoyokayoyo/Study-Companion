from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import Suggestion
from auth_utils import require_admin

bp = Blueprint("suggestions", __name__)


def build_suggestion(s) -> dict:
    return {
        "id": s.id,
        "name": s.name,
        "email": s.email,
        "message": s.message,
        "isRead": s.is_read,
        "createdAt": s.created_at.isoformat(),
    }


@bp.route("", methods=["POST"])
def create_suggestion():
    db = SessionLocal()
    try:
        data = request.get_json(silent=True) or {}
        message = (data.get("message") or "").strip()
        if not message:
            return jsonify({"error": "Message cannot be empty"}), 422
        suggestion = Suggestion(
            name=data.get("name") or None,
            email=data.get("email") or None,
            message=message,
        )
        db.add(suggestion)
        db.commit()
        db.refresh(suggestion)
        return jsonify({"success": True, "id": suggestion.id}), 201
    finally:
        db.close()


@bp.route("", methods=["GET"])
@require_admin
def list_suggestions():
    db = SessionLocal()
    try:
        items = db.query(Suggestion).order_by(Suggestion.created_at.desc()).all()
        return jsonify([build_suggestion(s) for s in items])
    finally:
        db.close()


@bp.route("/<int:suggestion_id>/read", methods=["PATCH"])
@require_admin
def mark_read(suggestion_id):
    db = SessionLocal()
    try:
        s = db.query(Suggestion).filter(Suggestion.id == suggestion_id).first()
        if not s:
            return jsonify({"error": "Suggestion not found"}), 404
        s.is_read = True
        db.commit()
        return jsonify({"success": True})
    finally:
        db.close()


@bp.route("/<int:suggestion_id>", methods=["DELETE"])
@require_admin
def delete_suggestion(suggestion_id):
    db = SessionLocal()
    try:
        s = db.query(Suggestion).filter(Suggestion.id == suggestion_id).first()
        if not s:
            return jsonify({"error": "Suggestion not found"}), 404
        db.delete(s)
        db.commit()
        return jsonify({"success": True})
    finally:
        db.close()
