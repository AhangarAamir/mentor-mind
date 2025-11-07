# /mentormind-backend/app/api/quiz.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from app.db.models import User
from app.db import crud
from app.core.dependencies import get_current_active_user
from app.services.quiz_service import QuizService

router = APIRouter()


class QuizRequest(BaseModel):
    topic: str
    grade: int
    num_questions: int = 5

class QuizQuestion(BaseModel):
    question_text: str
    options: List[str]
    correct_answer: str

class QuizSubmission(BaseModel):
    topic: str
    grade: int
    questions: List[QuizQuestion]
    answers: Dict[str, str] # { question_text: selected_answer }


@router.post("/generate")
def generate_quiz(
    request: QuizRequest,
    current_user: User = Depends(get_current_active_user),
    quiz_service: QuizService = Depends(QuizService)
):
    """
    Generates a new quiz for a given topic and grade.
    """
    if not (8 <= request.grade <= 12):
        raise HTTPException(status_code=400, detail="Grade must be between 8 and 12.")

    quiz = quiz_service.generate_quiz_for_topic(
        topic=request.topic,
        grade=request.grade,
        num_questions=request.num_questions
    )

    if quiz.get("error"):
        raise HTTPException(status_code=500, detail=quiz["error"])

    return quiz


@router.post("/submit")
def submit_quiz(
    submission: QuizSubmission,
    current_user: User = Depends(get_current_active_user)
):
    """
    Submits a user's quiz answers, calculates the score, and saves the attempt.
    """
    correct_count = 0
    for question in submission.questions:
        user_answer = submission.answers.get(question.question_text)
        if user_answer == question.correct_answer:
            correct_count += 1
    
    score = (correct_count / len(submission.questions)) * 100 if submission.questions else 0
    
    # Save the attempt to the database
    try:
        crud.create_quiz_attempt(
            student_id=current_user.id,
            topic=submission.topic,
            grade=submission.grade,
            questions=[q.dict() for q in submission.questions],
            answers=submission.answers,
            score=score
        )
    except Exception as e:
        # In a real app, log this error properly
        raise HTTPException(status_code=500, detail=f"Failed to save quiz attempt: {e}")

    feedback = "Great job! Keep it up." if score >= 70 else "You can do better. Keep practicing."

    return {
        "score": round(score),
        "feedback": feedback,
        "correct_count": correct_count,
        "total_questions": len(submission.questions)
    }
