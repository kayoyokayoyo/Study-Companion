from flask import Blueprint, request, jsonify
from sqlalchemy import func
from database import SessionLocal
from models import Question, Choice, Quiz
from auth_utils import require_admin

bp = Blueprint("questions", __name__)


def build_question(q) -> dict:
    return {
        "id": q.id,
        "quizId": q.quiz_id,
        "type": q.type,
        "text": q.text,
        "explanation": q.explanation,
        "orderIndex": q.order_index,
        "directAnswer": q.direct_answer,
        "choices": [
            {"id": c.id, "text": c.text, "isCorrect": c.is_correct}
            for c in q.choices
        ],
    }


@bp.route("", methods=["POST"])
@require_admin
def create_question():
    db = SessionLocal()
    try:
        data = request.get_json(silent=True) or {}
        quiz = db.query(Quiz).filter(Quiz.id == data.get("quizId")).first()
        if not quiz:
            return jsonify({"error": "Quiz not found"}), 404

        order_index = data.get("orderIndex")
        if order_index is None:
            max_order = (
                db.query(func.max(Question.order_index))
                .filter(Question.quiz_id == data.get("quizId"))
                .scalar()
            )
            order_index = (max_order or -1) + 1

        question = Question(
            quiz_id=data.get("quizId"),
            type=data.get("type", "mcq"),
            text=data.get("text", ""),
            explanation=data.get("explanation"),
            order_index=order_index,
            direct_answer=data.get("directAnswer"),
        )
        db.add(question)
        db.flush()

        if data.get("type") == "mcq" and data.get("choices"):
            for cdata in data["choices"]:
                db.add(Choice(
                    question_id=question.id,
                    text=cdata.get("text", ""),
                    is_correct=cdata.get("isCorrect", False),
                ))

        db.commit()
        db.refresh(question)
        return jsonify(build_question(question)), 201
    finally:
        db.close()


@bp.route("/<int:question_id>", methods=["PUT"])
@require_admin
def update_question(question_id):
    db = SessionLocal()
    try:
        question = db.query(Question).filter(Question.id == question_id).first()
        if not question:
            return jsonify({"error": "Question not found"}), 404

        data = request.get_json(silent=True) or {}
        question.type = data.get("type", question.type)
        question.text = data.get("text", question.text)
        question.explanation = data.get("explanation", question.explanation)
        question.direct_answer = data.get("directAnswer", question.direct_answer)
        if data.get("orderIndex") is not None:
            question.order_index = data["orderIndex"]

        # Replace choices
        for c in list(question.choices):
            db.delete(c)
        db.flush()

        if data.get("type") == "mcq" and data.get("choices"):
            for cdata in data["choices"]:
                db.add(Choice(
                    question_id=question.id,
                    text=cdata.get("text", ""),
                    is_correct=cdata.get("isCorrect", False),
                ))

        db.commit()
        db.refresh(question)
        return jsonify(build_question(question))
    finally:
        db.close()


@bp.route("/<int:question_id>", methods=["DELETE"])
@require_admin
def delete_question(question_id):
    db = SessionLocal()
    try:
        question = db.query(Question).filter(Question.id == question_id).first()
        if not question:
            return jsonify({"error": "Question not found"}), 404
        db.delete(question)
        db.commit()
        return jsonify({"success": True})
    finally:
        db.close()
