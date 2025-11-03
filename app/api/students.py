# /mentormind-backend/app/api/students.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.db.models import User
from app.core.dependencies import get_current_student_user

router = APIRouter()

class StudentDashboardData(BaseModel):
    lessons_completed: int
    quiz_attempts: int
    average_score: float
    learning_streak_days: int
    weak_topics: list[str]

@router.get("/dashboard", response_model=StudentDashboardData)
def get_student_dashboard(current_user: User = Depends(get_current_student_user)):
    """
    Returns personalized dashboard data for the logged-in student.
    This is mock data and should be replaced with real database queries.
    """
    # TODO: Implement actual database queries to fetch this data
    # For example:
    # lessons_completed = QuizAttempt.select().where(QuizAttempt.student == current_user.id).count()
    # weak_topics = [wt.topic for wt in WeakTopic.select().where(WeakTopic.student == current_user.id)]
    
    return StudentDashboardData(
        lessons_completed=5,
        quiz_attempts=12,
        average_score=85.5,
        learning_streak_days=7,
        weak_topics=["Optics", "Thermodynamics"]
    )
