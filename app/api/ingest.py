# /mentormind-backend/app/api/ingest.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Form
from typing import Annotated
import os

from app.config import settings
from app.db.models import User, IngestionStatus
from app.db.crud import create_ingestion_job, get_ingestion_job_by_id
from app.core.dependencies import get_current_admin_user
from app.tasks.tasks import process_pdf_ingestion_sync

router = APIRouter()

@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_pdf_for_ingestion(
    grade: Annotated[int, Form()],
    subject: Annotated[str, Form()],
    chapter: Annotated[str, Form()],
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Admin endpoint to upload a PDF and process it synchronously.
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

    # Process the file synchronously
    try:
        process_pdf_ingestion_sync(job.id)
    except Exception as e:
        # The processing function handles setting the FAILED status
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF processing failed: {e}"
        )
    
    processed_job = get_ingestion_job_by_id(job.id)

    return {
        "message": "PDF processed successfully.",
        "job_id": processed_job.id,
        "filename": processed_job.filename,
        "status": processed_job.status
    }
