from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Suggestion
from auth_utils import require_admin

router = APIRouter()


class SuggestionInput(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    message: str


def build_suggestion(s: Suggestion) -> dict:
    return {
        "id": s.id,
        "name": s.name,
        "email": s.email,
        "message": s.message,
        "isRead": s.is_read,
        "createdAt": s.created_at.isoformat(),
    }


@router.post("", status_code=201)
def create_suggestion(data: SuggestionInput, db: Session = Depends(get_db)):
    if not data.message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty")
    suggestion = Suggestion(
        name=data.name or None,
        email=data.email or None,
        message=data.message.strip(),
    )
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)
    return {"success": True, "id": suggestion.id}


@router.get("", dependencies=[Depends(require_admin)])
def list_suggestions(db: Session = Depends(get_db)):
    items = db.query(Suggestion).order_by(Suggestion.created_at.desc()).all()
    return [build_suggestion(s) for s in items]


@router.patch("/{suggestion_id}/read", dependencies=[Depends(require_admin)])
def mark_read(suggestion_id: int, db: Session = Depends(get_db)):
    s = db.query(Suggestion).filter(Suggestion.id == suggestion_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    s.is_read = True
    db.commit()
    return {"success": True}


@router.delete("/{suggestion_id}", dependencies=[Depends(require_admin)])
def delete_suggestion(suggestion_id: int, db: Session = Depends(get_db)):
    s = db.query(Suggestion).filter(Suggestion.id == suggestion_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    db.delete(s)
    db.commit()
    return {"success": True}
