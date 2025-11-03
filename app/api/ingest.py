# /mentormind-backend/app/api/ingest.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Form
from typing import Annotated
import os

from app.config import settings
from app.db.models import User, IngestionStatus
from app.db.crud import create_ingestion_job
from app.core.dependencies import get_current_admin_user
from app.tasks.tasks import process_pdf_ingestion

router = APIRouter()

@router.post("/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_pdf_for_ingestion(
    grade: Annotated[int, Form()],
    subject: Annotated[str, Form()],
    chapter: Annotated[str, Form()],
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Admin endpoint to upload a PDF, create an ingestion job,
    and trigger the background processing task.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDFs are accepted."
        )

    # Save the uploaded file to the designated PDF directory
    file_path = os.path.join(settings.PDF_UPLOAD_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {e}"
        )

    # Create a job entry in the database
    job = create_ingestion_job(
        filename=file.filename,
        grade=grade,
        subject=subject,
        chapter=chapter,
        status=IngestionStatus.PENDING
    )

    # Trigger the Celery task
    process_pdf_ingestion.delay(job.id)

    return {
        "message": "PDF uploaded and ingestion process started.",
        "job_id": job.id,
        "filename": file.filename,
        "status": job.status.value
    }
