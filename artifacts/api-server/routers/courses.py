from flask import Blueprint, request, jsonify
from sqlalchemy import func
from database import SessionLocal
from models import Course, Quiz, Question
from auth_utils import require_admin

bp = Blueprint("courses", __name__)


def build_course_response(db, course) -> dict:
    quiz_count = db.query(func.count(Quiz.id)).filter(Quiz.course_id == course.id).scalar() or 0
    question_count = (
        db.query(func.count(Question.id))
        .join(Quiz, Question.quiz_id == Quiz.id)
        .filter(Quiz.course_id == course.id)
        .scalar() or 0
    )
    return {
        "id": course.id,
        "name": course.name,
        "description": course.description,
        "quizCount": quiz_count,
        "questionCount": question_count,
        "createdAt": course.created_at.isoformat(),
    }


@bp.route("", methods=["GET"])
def list_courses():
    db = SessionLocal()
    try:
        courses = db.query(Course).order_by(Course.name).all()
        return jsonify([build_course_response(db, c) for c in courses])
    finally:
        db.close()


@bp.route("", methods=["POST"])
@require_admin
def create_course():
    db = SessionLocal()
    try:
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Name is required"}), 422
        course = Course(name=name, description=data.get("description"))
        db.add(course)
        db.commit()
        db.refresh(course)
        return jsonify(build_course_response(db, course)), 201
    finally:
        db.close()


@bp.route("/<int:course_id>", methods=["GET"])
def get_course(course_id):
    db = SessionLocal()
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return jsonify({"error": "Course not found"}), 404
        return jsonify(build_course_response(db, course))
    finally:
        db.close()


@bp.route("/<int:course_id>", methods=["PUT"])
@require_admin
def update_course(course_id):
    db = SessionLocal()
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return jsonify({"error": "Course not found"}), 404
        data = request.get_json(silent=True) or {}
        course.name = data.get("name", course.name)
        course.description = data.get("description", course.description)
        db.commit()
        db.refresh(course)
        return jsonify(build_course_response(db, course))
    finally:
        db.close()


@bp.route("/<int:course_id>", methods=["DELETE"])
@require_admin
def delete_course(course_id):
    db = SessionLocal()
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return jsonify({"error": "Course not found"}), 404
        db.delete(course)
        db.commit()
        return jsonify({"success": True})
    finally:
        db.close()
