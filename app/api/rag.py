# /mentormind-backend/app/api/rag.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from peewee import DoesNotExist # Added DoesNotExist

from app.db.models import User, StudentProfile
from app.core.dependencies import get_current_student_user
from app.core.rag_manager import RagManager

router = APIRouter()
rag_manager = RagManager()

class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str
    sources: list[dict]

@router.post("/ask", response_model=AskResponse)
def ask_question(
    request: AskRequest,
    current_user: User = Depends(get_current_student_user)
):
    """
    Receives a student's question and returns an answer using the RAG system.
    """
    try:
        student_profile = StudentProfile.get(StudentProfile.user == current_user.id)
    except DoesNotExist: # Changed to use imported DoesNotExist
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found. Please complete your profile."
        )
    student_grade = student_profile.grade
    
    try:
        result = rag_manager.get_answer(request.question, student_grade)
    except Exception as e:
        import traceback
        traceback.print_exception(e)
        # Log the exception e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get an answer from the RAG system."
        )

    return AskResponse(answer=result["answer"], sources=result["sources"])
