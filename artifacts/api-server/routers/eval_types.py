from flask import Blueprint, request, jsonify
from sqlalchemy import func
from database import SessionLocal
from models import EvalType, Quiz
from auth_utils import require_admin

bp = Blueprint("eval_types", __name__)


def build_eval_type_response(db, et) -> dict:
    quiz_count = db.query(func.count(Quiz.id)).filter(Quiz.eval_type_id == et.id).scalar() or 0
    return {
        "id": et.id,
        "name": et.name,
        "quizCount": quiz_count,
        "createdAt": et.created_at.isoformat(),
    }


@bp.route("", methods=["GET"])
def list_eval_types():
    db = SessionLocal()
    try:
        items = db.query(EvalType).order_by(EvalType.name).all()
        return jsonify([build_eval_type_response(db, et) for et in items])
    finally:
        db.close()


@bp.route("", methods=["POST"])
@require_admin
def create_eval_type():
    db = SessionLocal()
    try:
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Name is required"}), 422
        et = EvalType(name=name)
        db.add(et)
        db.commit()
        db.refresh(et)
        return jsonify(build_eval_type_response(db, et)), 201
    finally:
        db.close()


@bp.route("/<int:eval_type_id>", methods=["PUT"])
@require_admin
def update_eval_type(eval_type_id):
    db = SessionLocal()
    try:
        et = db.query(EvalType).filter(EvalType.id == eval_type_id).first()
        if not et:
            return jsonify({"error": "Eval type not found"}), 404
        data = request.get_json(silent=True) or {}
        et.name = data.get("name", et.name)
        db.commit()
        db.refresh(et)
        return jsonify(build_eval_type_response(db, et))
    finally:
        db.close()


@bp.route("/<int:eval_type_id>", methods=["DELETE"])
@require_admin
def delete_eval_type(eval_type_id):
    db = SessionLocal()
    try:
        et = db.query(EvalType).filter(EvalType.id == eval_type_id).first()
        if not et:
            return jsonify({"error": "Eval type not found"}), 404
        db.delete(et)
        db.commit()
        return jsonify({"success": True})
    finally:
        db.close()
