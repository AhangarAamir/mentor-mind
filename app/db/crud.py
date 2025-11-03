# /mentormind-backend/app/db/crud.py
from peewee import DoesNotExist
from .models import User, UserRole, ParentStudentMap, IngestionJob, IngestionStatus, StudentProfile

def get_user_by_email(email: str) -> User | None:
    """Retrieve a user by their email address."""
    try:
        return User.get(User.email == email)
    except DoesNotExist:
        return None

def get_user_by_id(user_id: int) -> User | None:
    """Retrieve a user by their ID."""
    try:
        return User.get_by_id(user_id)
    except DoesNotExist:
        return None

def create_user(name: str, email: str, password_hash: str, role: UserRole) -> User:
    """Create a new user in the database."""
    user = User.create(
        name=name,
        email=email,
        password_hash=password_hash,
        role=role.value
    )
    # If the user is a student, create a default profile
    if role == UserRole.student:
        StudentProfile.create(user=user, grade=9) # Default to 9th grade
    return user

def link_parent_to_student(parent_id: int, student_id: int):
    """Create a mapping between a parent and a student."""
    # Check if link already exists
    existing_link = ParentStudentMap.select().where(
        (ParentStudentMap.parent == parent_id) & (ParentStudentMap.student == student_id)
    ).first()

    if existing_link:
        raise ValueError("This parent-student link already exists.")
        
    return ParentStudentMap.create(parent=parent_id, student=student_id)

# --- Ingestion Job CRUD ---

def create_ingestion_job(**kwargs) -> IngestionJob:
    """Creates a new ingestion job record."""
    return IngestionJob.create(**kwargs)

def get_ingestion_job_by_id(job_id: int) -> IngestionJob | None:
    """Retrieves an ingestion job by its ID."""
    try:
        return IngestionJob.get_by_id(job_id)
    except DoesNotExist:
        return None

def update_ingestion_job_status(job_id: int, status: IngestionStatus):
    """Updates the status of an ingestion job."""
    job = get_ingestion_job_by_id(job_id)
    if job:
        job.status = status.value
        job.save()
    return job

# --- Reporting CRUD ---

def get_student_report_data(student_id: int) -> dict | None:
    """
    Fetches aggregated data for a student's report.
    This is a placeholder for a more complex query.
    """
    student = get_user_by_id(student_id)
    if not student or student.role != 'student':
        return None
    
    # Mock data fetching
    return {
        "student_name": student.name,
        "quiz_attempts": 12,
        "average_score": 85.5,
        "weak_topics": ["Optics", "Thermodynamics"]
    }
