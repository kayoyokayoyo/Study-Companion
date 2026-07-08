from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from database import get_db
from models import Course, Quiz, Question
from auth_utils import require_admin

router = APIRouter()


class CourseInput(BaseModel):
    name: str
    description: Optional[str] = None


def build_course_response(db: Session, course: Course) -> dict:
    quiz_count = db.query(func.count(Quiz.id)).filter(Quiz.course_id == course.id).scalar() or 0
    question_count = (
        db.query(func.count(Question.id))
        .join(Quiz, Question.quiz_id == Quiz.id)
        .filter(Quiz.course_id == course.id)
        .scalar()
        or 0
    )
    return {
        "id": course.id,
        "name": course.name,
        "description": course.description,
        "quizCount": quiz_count,
        "questionCount": question_count,
        "createdAt": course.created_at.isoformat(),
    }


@router.get("")
def list_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).order_by(Course.name).all()
    return [build_course_response(db, c) for c in courses]


@router.post("", status_code=201, dependencies=[Depends(require_admin)])
def create_course(data: CourseInput, db: Session = Depends(get_db)):
    course = Course(name=data.name, description=data.description)
    db.add(course)
    db.commit()
    db.refresh(course)
    return build_course_response(db, course)


@router.get("/{course_id}")
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return build_course_response(db, course)


@router.put("/{course_id}", dependencies=[Depends(require_admin)])
def update_course(course_id: int, data: CourseInput, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.name = data.name
    course.description = data.description
    db.commit()
    db.refresh(course)
    return build_course_response(db, course)


@router.delete("/{course_id}", dependencies=[Depends(require_admin)])
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return {"success": True}
