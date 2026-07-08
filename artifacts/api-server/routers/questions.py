from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from database import get_db
from models import Question, Choice, Quiz
from auth_utils import require_admin

router = APIRouter()


class ChoiceInput(BaseModel):
    text: str
    isCorrect: bool


class QuestionInput(BaseModel):
    quizId: int
    type: str  # "mcq" or "direct"
    text: str
    explanation: Optional[str] = None
    orderIndex: Optional[int] = None
    choices: Optional[List[ChoiceInput]] = []
    directAnswer: Optional[str] = None


def build_question(q: Question) -> dict:
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


@router.post("", status_code=201, dependencies=[Depends(require_admin)])
def create_question(data: QuestionInput, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == data.quizId).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    if data.orderIndex is None:
        max_order = (
            db.query(func.max(Question.order_index))
            .filter(Question.quiz_id == data.quizId)
            .scalar()
        )
        order = (max_order or -1) + 1
    else:
        order = data.orderIndex

    question = Question(
        quiz_id=data.quizId,
        type=data.type,
        text=data.text,
        explanation=data.explanation,
        order_index=order,
        direct_answer=data.directAnswer,
    )
    db.add(question)
    db.flush()

    if data.type == "mcq" and data.choices:
        for cdata in data.choices:
            db.add(Choice(question_id=question.id, text=cdata.text, is_correct=cdata.isCorrect))

    db.commit()
    db.refresh(question)
    return build_question(question)


@router.put("/{question_id}", dependencies=[Depends(require_admin)])
def update_question(question_id: int, data: QuestionInput, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    question.type = data.type
    question.text = data.text
    question.explanation = data.explanation
    question.direct_answer = data.directAnswer
    if data.orderIndex is not None:
        question.order_index = data.orderIndex

    # Replace choices
    for c in list(question.choices):
        db.delete(c)
    db.flush()

    if data.type == "mcq" and data.choices:
        for cdata in data.choices:
            db.add(Choice(question_id=question.id, text=cdata.text, is_correct=cdata.isCorrect))

    db.commit()
    db.refresh(question)
    return build_question(question)


@router.delete("/{question_id}", dependencies=[Depends(require_admin)])
def delete_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(question)
    db.commit()
    return {"success": True}
