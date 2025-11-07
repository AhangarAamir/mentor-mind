# /mentormind-backend/app/api/students.py
from fastapi import APIRouter, Depends, HTTPException

from app.db.models import User
from app.db import crud
from app.core.dependencies import get_current_student_user
from app.api.schemas import StudentReportCard # Reusing the model from parents API

router = APIRouter()

@router.get("/dashboard", response_model=StudentReportCard)
def get_student_dashboard(current_user: User = Depends(get_current_student_user)):
    """
    Returns personalized dashboard data for the logged-in student.
    Fetches real quiz data and uses placeholders for other metrics.
    """
    report_data = crud.get_student_report_data(current_user.id)
    
    if not report_data:
        raise HTTPException(status_code=404, detail="Student data not found.")

    # Combine real data with dummy data as requested
    dashboard_data = StudentReportCard(
        student_name=report_data["student_name"],
        quiz_attempts=report_data["quiz_attempts"],
        average_score=report_data["average_score"],
        weak_topics=report_data["weak_topics"],
        # --- Dummy Data ---
        lessons_completed=5, 
        learning_streak_days=7 
    )
    
    return dashboard_data
