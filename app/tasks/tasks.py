# /mentormind-backend/app/tasks/tasks.py
import logging
import os
from celery import shared_task
from app.db.crud import get_ingestion_job_by_id, update_ingestion_job_status
from app.db.models import IngestionStatus, User
from app.config import settings
from app.utils.pdf_parser import extract_text_from_pdf, split_text_into_chunks
from app.services.chroma_service import ChromaService
from app.services.report_service import generate_report_content

logger = logging.getLogger(__name__)


def process_pdf_ingestion_sync(job_id: int):
    """
    Synchronously processes a PDF file for ingestion into ChromaDB.
    """
    logger.info(f"Starting PDF ingestion for job_id: {job_id}")
    
    job = get_ingestion_job_by_id(job_id)
    if not job:
        logger.error(f"Ingestion job with id {job_id} not found.")
        raise ValueError(f"Ingestion job with id {job_id} not found.")

    update_ingestion_job_status(job_id, IngestionStatus.PROCESSING)
    
    file_path = os.path.join(settings.PDF_UPLOAD_DIR, job.filename)
    if not os.path.exists(file_path):
        logger.error(f"File not found: {file_path}")
        update_ingestion_job_status(job_id, IngestionStatus.FAILED)
        raise FileNotFoundError(f"File not found: {file_path}")

    try:
        # 1. Extract text from PDF
        logger.info(f"Extracting text from {job.filename}")
        text = extract_text_from_pdf(file_path)
        
        # 2. Split text into manageable chunks
        logger.info("Splitting text into chunks")
        chunks = split_text_into_chunks(text)
        
        # 3. Prepare metadata and IDs for ChromaDB
        metadatas = [{
            "grade": job.grade,
            "subject": job.subject,
            "chapter": job.chapter,
            "filename": job.filename,
            "chunk_index": i
        } for i in range(len(chunks))]
        
        ids = [f"{job.id}_{i}" for i in range(len(chunks))]
        
        # 4. Upsert into ChromaDB
        logger.info(f"Upserting {len(chunks)} chunks into ChromaDB")
        chroma_service = ChromaService()
        chroma_service.upsert_documents(documents=chunks, metadatas=metadatas, ids=ids)
        
        # 5. Update job status to COMPLETED
        update_ingestion_job_status(job_id, IngestionStatus.COMPLETED)
        logger.info(f"Successfully completed ingestion for job_id: {job_id}")

    except Exception as e:
        logger.error(f"Error processing PDF for job_id {job_id}: {e}")
        update_ingestion_job_status(job_id, IngestionStatus.FAILED)
        raise e  # Re-raise to be handled by the API endpoint


@shared_task
def generate_weekly_reports():
    """
    Periodic Celery task to generate and email weekly reports to parents.
    """
    logger.info("Starting weekly report generation task.")
    
    # 1. Get all parent users
    parents = User.select().where(User.role == 'parent')
    
    for parent in parents:
        # 2. For each parent, get their linked students
        for link in parent.linked_students:
            student = link.student
            logger.info(f"Generating report for student {student.name} (ID: {student.id}) for parent {parent.name}")
            
            # 3. Fetch report data (this is mocked in crud.py)
            report_data = {
                "student_name": student.name,
                "quiz_attempts": 10, # Replace with real data
                "average_score": 88.0,
                "weak_topics": ["Magnetism"]
            }
            
            # 4. Generate report content
            report_content = generate_report_content(report_data)
            
            # 5. "Email" the report (for now, just print to console)
            # In a real app, you would use a service like SendGrid or SMTP.
            print("--- SENDING EMAIL ---")
            print(f"To: {parent.email}")
            print(f"Subject: Weekly Progress Report for {student.name}")
            print("\n" + report_content)
            print("--- END EMAIL ---\n")

    logger.info("Weekly report generation task finished.")
