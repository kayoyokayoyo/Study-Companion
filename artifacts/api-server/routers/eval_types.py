from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from database import get_db
from models import EvalType, Quiz
from auth_utils import require_admin

router = APIRouter()


class EvalTypeInput(BaseModel):
    name: str


def build_eval_type_response(db: Session, et: EvalType) -> dict:
    quiz_count = db.query(func.count(Quiz.id)).filter(Quiz.eval_type_id == et.id).scalar() or 0
    return {
        "id": et.id,
        "name": et.name,
        "quizCount": quiz_count,
        "createdAt": et.created_at.isoformat(),
    }


@router.get("")
def list_eval_types(db: Session = Depends(get_db)):
    items = db.query(EvalType).order_by(EvalType.name).all()
    return [build_eval_type_response(db, et) for et in items]


@router.post("", status_code=201, dependencies=[Depends(require_admin)])
def create_eval_type(data: EvalTypeInput, db: Session = Depends(get_db)):
    et = EvalType(name=data.name)
    db.add(et)
    db.commit()
    db.refresh(et)
    return build_eval_type_response(db, et)


@router.put("/{eval_type_id}", dependencies=[Depends(require_admin)])
def update_eval_type(eval_type_id: int, data: EvalTypeInput, db: Session = Depends(get_db)):
    et = db.query(EvalType).filter(EvalType.id == eval_type_id).first()
    if not et:
        raise HTTPException(status_code=404, detail="Eval type not found")
    et.name = data.name
    db.commit()
    db.refresh(et)
    return build_eval_type_response(db, et)


@router.delete("/{eval_type_id}", dependencies=[Depends(require_admin)])
def delete_eval_type(eval_type_id: int, db: Session = Depends(get_db)):
    et = db.query(EvalType).filter(EvalType.id == eval_type_id).first()
    if not et:
        raise HTTPException(status_code=404, detail="Eval type not found")
    db.delete(et)
    db.commit()
    return {"success": True}
