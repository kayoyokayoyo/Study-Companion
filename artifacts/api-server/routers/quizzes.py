from flask import Blueprint, request, jsonify
from sqlalchemy import func
from database import SessionLocal
from models import Quiz, Course, EvalType, Question, Choice
from auth_utils import require_admin

bp = Blueprint("quizzes", __name__)


def build_choice(c) -> dict:
    return {"id": c.id, "text": c.text, "isCorrect": c.is_correct}


def build_question(q) -> dict:
    return {
        "id": q.id,
        "quizId": q.quiz_id,
        "type": q.type,
        "text": q.text,
        "explanation": q.explanation,
        "orderIndex": q.order_index,
        "directAnswer": q.direct_answer,
        "choices": [build_choice(c) for c in q.choices],
    }


def build_quiz_summary(quiz) -> dict:
    return {
        "id": quiz.id,
        "title": quiz.title,
        "description": quiz.description,
        "courseId": quiz.course_id,
        "courseName": quiz.course.name,
        "evalTypeId": quiz.eval_type_id,
        "evalTypeName": quiz.eval_type.name,
        "questionCount": len(quiz.questions),
        "createdAt": quiz.created_at.isoformat(),
    }


@bp.route("", methods=["GET"])
def list_quizzes():
    db = SessionLocal()
    try:
        course_id = request.args.get("courseId", type=int)
        eval_type_id = request.args.get("evalTypeId", type=int)
        q = db.query(Quiz)
        if course_id is not None:
            q = q.filter(Quiz.course_id == course_id)
        if eval_type_id is not None:
            q = q.filter(Quiz.eval_type_id == eval_type_id)
        quizzes = q.order_by(Quiz.created_at.desc()).all()
        return jsonify([build_quiz_summary(quiz) for quiz in quizzes])
    finally:
        db.close()


@bp.route("", methods=["POST"])
@require_admin
def create_quiz():
    db = SessionLocal()
    try:
        data = request.get_json(silent=True) or {}
        course = db.query(Course).filter(Course.id == data.get("courseId")).first()
        if not course:
            return jsonify({"error": "Course not found"}), 404
        et = db.query(EvalType).filter(EvalType.id == data.get("evalTypeId")).first()
        if not et:
            return jsonify({"error": "Eval type not found"}), 404
        quiz = Quiz(
            title=data.get("title", ""),
            description=data.get("description"),
            course_id=data.get("courseId"),
            eval_type_id=data.get("evalTypeId"),
        )
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        return jsonify(build_quiz_summary(quiz)), 201
    finally:
        db.close()


@bp.route("/<int:quiz_id>", methods=["GET"])
def get_quiz(quiz_id):
    db = SessionLocal()
    try:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            return jsonify({"error": "Quiz not found"}), 404
        result = build_quiz_summary(quiz)
        result["questions"] = [
            build_question(q)
            for q in sorted(quiz.questions, key=lambda x: x.order_index)
        ]
        return jsonify(result)
    finally:
        db.close()


@bp.route("/<int:quiz_id>", methods=["PUT"])
@require_admin
def update_quiz(quiz_id):
    db = SessionLocal()
    try:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            return jsonify({"error": "Quiz not found"}), 404
        data = request.get_json(silent=True) or {}
        course = db.query(Course).filter(Course.id == data.get("courseId")).first()
        if not course:
            return jsonify({"error": "Course not found"}), 404
        et = db.query(EvalType).filter(EvalType.id == data.get("evalTypeId")).first()
        if not et:
            return jsonify({"error": "Eval type not found"}), 404
        quiz.title = data.get("title", quiz.title)
        quiz.description = data.get("description", quiz.description)
        quiz.course_id = data.get("courseId", quiz.course_id)
        quiz.eval_type_id = data.get("evalTypeId", quiz.eval_type_id)
        db.commit()
        db.refresh(quiz)
        return jsonify(build_quiz_summary(quiz))
    finally:
        db.close()


@bp.route("/<int:quiz_id>", methods=["DELETE"])
@require_admin
def delete_quiz(quiz_id):
    db = SessionLocal()
    try:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            return jsonify({"error": "Quiz not found"}), 404
        db.delete(quiz)
        db.commit()
        return jsonify({"success": True})
    finally:
        db.close()


@bp.route("/<int:quiz_id>/import", methods=["POST"])
@require_admin
def import_questions(quiz_id):
    db = SessionLocal()
    try:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            return jsonify({"error": "Quiz not found"}), 404

        payload = request.get_json(silent=True) or {}
        questions_data = payload.get("questions", [])

        imported = 0
        errors = []
        current_max = (
            db.query(func.max(Question.order_index))
            .filter(Question.quiz_id == quiz_id)
            .scalar() or -1
        )

        for i, qdata in enumerate(questions_data):
            try:
                current_max += 1
                order = qdata.get("orderIndex") if qdata.get("orderIndex") is not None else current_max
                question = Question(
                    quiz_id=quiz_id,
                    type=qdata.get("type", "mcq"),
                    text=qdata.get("text", ""),
                    explanation=qdata.get("explanation"),
                    order_index=order,
                    direct_answer=qdata.get("directAnswer"),
                )
                db.add(question)
                db.flush()

                if qdata.get("type") == "mcq" and qdata.get("choices"):
                    for cdata in qdata["choices"]:
                        db.add(Choice(
                            question_id=question.id,
                            text=cdata.get("text", ""),
                            is_correct=cdata.get("isCorrect", False),
                        ))
                imported += 1
            except Exception as e:
                errors.append(f"Question {i + 1}: {str(e)}")

        db.commit()
        return jsonify({"imported": imported, "errors": errors})
    finally:
        db.close()
