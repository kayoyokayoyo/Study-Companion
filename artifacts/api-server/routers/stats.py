from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Course, EvalType, Quiz, Question

router = APIRouter()


@router.get("")
def get_stats(db: Session = Depends(get_db)):
    total_courses = db.query(func.count(Course.id)).scalar() or 0
    total_quizzes = db.query(func.count(Quiz.id)).scalar() or 0
    total_questions = db.query(func.count(Question.id)).scalar() or 0
    total_eval_types = db.query(func.count(EvalType.id)).scalar() or 0
    mcq_count = db.query(func.count(Question.id)).filter(Question.type == "mcq").scalar() or 0
    direct_count = db.query(func.count(Question.id)).filter(Question.type == "direct").scalar() or 0

    # Top courses by question count
    courses = db.query(Course).all()
    top_courses = []
    for course in courses:
        quiz_count = db.query(func.count(Quiz.id)).filter(Quiz.course_id == course.id).scalar() or 0
        question_count = (
            db.query(func.count(Question.id))
            .join(Quiz, Question.quiz_id == Quiz.id)
            .filter(Quiz.course_id == course.id)
            .scalar()
            or 0
        )
        top_courses.append({
            "id": course.id,
            "name": course.name,
            "quizCount": quiz_count,
            "questionCount": question_count,
        })

    top_courses.sort(key=lambda x: x["questionCount"], reverse=True)

    return {
        "totalCourses": total_courses,
        "totalQuizzes": total_quizzes,
        "totalQuestions": total_questions,
        "totalEvalTypes": total_eval_types,
        "mcqCount": mcq_count,
        "directCount": direct_count,
        "topCourses": top_courses[:5],
    }
