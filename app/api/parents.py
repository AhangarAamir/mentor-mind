# /mentormind-backend/app/api/parents.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, EmailStr

from app.db.models import User
from app.db.crud import get_user_by_email, link_parent_to_student, get_student_report_data, get_linked_students
from app.core.dependencies import get_current_parent_user
from app.api.schemas import StudentReportCard
from typing import List

router = APIRouter()

class LinkStudentRequest(BaseModel):
    student_email: EmailStr

class LinkStudentResponse(BaseModel):
    message: str
    parent_email: EmailStr
    student_email: EmailStr

class ChildSummary(BaseModel):
    id: int
    name: str
    email: str

@router.post("/link", status_code=status.HTTP_201_CREATED, response_model=LinkStudentResponse)
def link_student(
    request: LinkStudentRequest,
    current_user: User = Depends(get_current_parent_user)
):
    """
    Links a parent to a student account using the student's email.
    """
    student = get_user_by_email(request.student_email)
    if not student or student.role != 'student':
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student with this email does not exist."
        )

    try:
        link_parent_to_student(parent_id=current_user.id, student_id=student.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )

    return {
        "message": "Student linked successfully.",
        "parent_email": current_user.email,
        "student_email": student.email
    }

@router.get("/children", response_model=List[ChildSummary])
def get_children(current_user: User = Depends(get_current_parent_user)):
    """
    Gets a list of all children linked to the current parent.
    """
    linked_students = get_linked_students(current_user.id)
    return [{"id": student.id, "name": student.name, "email": student.email} for student in linked_students]

@router.get("/report", response_model=StudentReportCard)
def get_student_report(
    student_email: EmailStr = Query(..., description="The email of the student to generate a report for."),
    current_user: User = Depends(get_current_parent_user)
):
    """
    Fetches a performance report for a linked student using their email.
    """
    # TODO: Verify that this student is actually linked to the parent
    
    student = get_user_by_email(student_email)
    if not student or student.role != 'student':
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student with this email does not exist."
        )

    report_data = get_student_report_data(student.id)
    if not report_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No data available for this student to generate a report."
        )
        
    return report_data
