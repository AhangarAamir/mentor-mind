# /mentormind-backend/app/api/parents.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.db.models import User
from app.db.crud import get_user_by_email, link_parent_to_student, get_student_report_data
from app.core.dependencies import get_current_parent_user
from app.services.report_service import generate_report_content

router = APIRouter()

class LinkStudentRequest(BaseModel):
    student_email: EmailStr

class LinkStudentResponse(BaseModel):
    message: str
    parent_email: EmailStr
    student_email: EmailStr

class StudentReport(BaseModel):
    student_id: int
    report_content: str

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

@router.get("/report/{student_id}", response_model=StudentReport)
def get_student_report(
    student_id: int,
    current_user: User = Depends(get_current_parent_user)
):
    """
    Fetches a performance report for a linked student.
    A real implementation might generate this on-the-fly or fetch a pre-generated one.
    """
    # TODO: Verify that this student is actually linked to the parent
    
    report_data = get_student_report_data(student_id)
    if not report_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No data available for this student to generate a report."
        )
        
    report_content = generate_report_content(report_data)

    return {"student_id": student_id, "report_content": report_content}
