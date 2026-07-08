from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from database import get_db
from models import Quiz, Course, EvalType, Question, Choice
from auth_utils import require_admin

router = APIRouter()


class QuizInput(BaseModel):
    title: str
    description: Optional[str] = None
    courseId: int
    evalTypeId: int


class ChoiceImport(BaseModel):
    text: str
    isCorrect: bool


class QuestionImport(BaseModel):
    quizId: Optional[int] = None
    type: str
    text: str
    explanation: Optional[str] = None
    orderIndex: Optional[int] = None
    choices: Optional[List[ChoiceImport]] = []
    directAnswer: Optional[str] = None


class ImportPayload(BaseModel):
    questions: List[QuestionImport]


def build_choice(c: Choice) -> dict:
    return {"id": c.id, "text": c.text, "isCorrect": c.is_correct}


def build_question(q: Question) -> dict:
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


def build_quiz_summary(quiz: Quiz) -> dict:
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


@router.get("")
def list_quizzes(
    courseId: Optional[int] = None,
    evalTypeId: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Quiz)
    if courseId is not None:
        query = query.filter(Quiz.course_id == courseId)
    if evalTypeId is not None:
        query = query.filter(Quiz.eval_type_id == evalTypeId)
    quizzes = query.order_by(Quiz.created_at.desc()).all()
    return [build_quiz_summary(q) for q in quizzes]


@router.post("", status_code=201, dependencies=[Depends(require_admin)])
def create_quiz(data: QuizInput, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == data.courseId).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    et = db.query(EvalType).filter(EvalType.id == data.evalTypeId).first()
    if not et:
        raise HTTPException(status_code=404, detail="Eval type not found")
    quiz = Quiz(
        title=data.title,
        description=data.description,
        course_id=data.courseId,
        eval_type_id=data.evalTypeId,
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return build_quiz_summary(quiz)


@router.get("/{quiz_id}")
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    result = build_quiz_summary(quiz)
    result["questions"] = [
        build_question(q)
        for q in sorted(quiz.questions, key=lambda x: x.order_index)
    ]
    return result


@router.put("/{quiz_id}", dependencies=[Depends(require_admin)])
def update_quiz(quiz_id: int, data: QuizInput, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    course = db.query(Course).filter(Course.id == data.courseId).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    et = db.query(EvalType).filter(EvalType.id == data.evalTypeId).first()
    if not et:
        raise HTTPException(status_code=404, detail="Eval type not found")
    quiz.title = data.title
    quiz.description = data.description
    quiz.course_id = data.courseId
    quiz.eval_type_id = data.evalTypeId
    db.commit()
    db.refresh(quiz)
    return build_quiz_summary(quiz)


@router.delete("/{quiz_id}", dependencies=[Depends(require_admin)])
def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    db.delete(quiz)
    db.commit()
    return {"success": True}


@router.post("/{quiz_id}/import", dependencies=[Depends(require_admin)])
def import_questions(quiz_id: int, payload: ImportPayload, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    imported = 0
    errors: List[str] = []
    current_max = (
        db.query(func.max(Question.order_index)).filter(Question.quiz_id == quiz_id).scalar()
        or -1
    )

    for i, qdata in enumerate(payload.questions):
        try:
            current_max += 1
            order = qdata.orderIndex if qdata.orderIndex is not None else current_max
            question = Question(
                quiz_id=quiz_id,
                type=qdata.type,
                text=qdata.text,
                explanation=qdata.explanation,
                order_index=order,
                direct_answer=qdata.directAnswer,
            )
            db.add(question)
            db.flush()

            if qdata.type == "mcq" and qdata.choices:
                for cdata in qdata.choices:
                    db.add(
                        Choice(
                            question_id=question.id,
                            text=cdata.text,
                            is_correct=cdata.isCorrect,
                        )
                    )
            imported += 1
        except Exception as e:
            errors.append(f"Question {i + 1}: {str(e)}")

    db.commit()
    return {"imported": imported, "errors": errors}
