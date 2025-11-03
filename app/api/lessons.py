# /mentormind-backend/app/api/lessons.py
# This file is a placeholder for future lesson and quiz management APIs.
# You could add endpoints to create, retrieve, and list lessons.
from fastapi import APIRouter, Depends
from app.db.models import User
from app.core.dependencies import get_current_active_user


router = APIRouter()

@router.get("/")
def list_lessons(current_user: User = Depends(get_current_active_user)):
    """
    (Placeholder) Lists available lessons.
    """
    return {"message": "List of lessons placeholder"}
