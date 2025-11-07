# /mentormind-backend/app/db/crud.py
from .models import User, UserRole, ParentStudentMap, IngestionJob, IngestionStatus, StudentProfile, StudentQuizAttempt, Conversation, Message
from peewee import fn, DoesNotExist

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

# --- Conversation and Message CRUD ---

def create_conversation(student_id: int) -> Conversation:
    """Creates a new conversation for a given student."""
    return Conversation.create(student=student_id)

def get_conversations_by_student(student_id: int) -> list[Conversation]:
    """Retrieves all conversations for a specific student, ordered by updated_at descending."""
    return list(Conversation.select().where(Conversation.student == student_id).order_by(Conversation.updated_at.desc()))

def get_conversation_by_id(conversation_id: int) -> Conversation | None:
    """Retrieves a single conversation by its ID."""
    try:
        return Conversation.get_by_id(conversation_id)
    except DoesNotExist:
        return None

def create_message(conversation_id: int, sender: str, content: str) -> Message:
    """Adds a new message to a conversation and updates the conversation's updated_at timestamp."""
    import datetime
    message = Message.create(conversation=conversation_id, sender=sender, content=content)
    conversation = Conversation.get_by_id(conversation_id)
    if conversation:
        conversation.updated_at = datetime.datetime.now()
        conversation.save()
    return message

def get_messages_by_conversation(conversation_id: int) -> list[Message]:
    """Retrieves all messages for a specific conversation, ordered by created_at ascending."""
    return list(Message.select().where(Message.conversation == conversation_id).order_by(Message.created_at.asc()))

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
    Fetches and aggregates real quiz data for a student's report,
    and includes dummy data for other metrics.
    """
    student = get_user_by_id(student_id)
    if not student or student.role != 'student':
        return None

    # Query for quiz attempts
    attempts_query = StudentQuizAttempt.select().where(StudentQuizAttempt.student == student_id)
    total_attempts = attempts_query.count()
    
    if total_attempts == 0:
        return {
            "student_name": student.name,
            "quiz_attempts": 0,
            "average_score": 0.0,
            "weak_topics": [],
            "lessons_completed": 5,  # Dummy data
            "learning_streak_days": 0 # Dummy data
        }

    # Calculate average score
    average_score = attempts_query.select(fn.AVG(StudentQuizAttempt.score)).scalar()

    # Identify weak topics (topics with an average score below a threshold, e.g., 70)
    weak_topics_query = (StudentQuizAttempt
                         .select(StudentQuizAttempt.topic, fn.AVG(StudentQuizAttempt.score).alias('avg_score'))
                         .where(StudentQuizAttempt.student == student_id)
                         .group_by(StudentQuizAttempt.topic)
                         .having(fn.AVG(StudentQuizAttempt.score) < 70))
    
    weak_topics = [item.topic for item in weak_topics_query]

    return {
        "student_name": student.name,
        "quiz_attempts": total_attempts,
        "average_score": average_score or 0.0,
        "weak_topics": weak_topics,
        "lessons_completed": 5,      # Dummy data
        "learning_streak_days": 7    # Dummy data
    }

# --- Quiz Attempt CRUD ---

def create_quiz_attempt(student_id: int, topic: str, grade: int, questions: list, answers: dict, score: float) -> StudentQuizAttempt:
    """Creates a new quiz attempt record for a student."""
    import json
    
    attempt = StudentQuizAttempt.create(
        student=student_id,
        topic=topic,
        grade=grade,
        questions=json.dumps(questions),
        answers=json.dumps(answers),
        score=score
    )
    return attempt

# --- Parent CRUD ---

def get_linked_students(parent_id: int) -> list[User]:
    """Fetches all student users linked to a given parent."""
    query = (User
             .select()
             .join(ParentStudentMap, on=(ParentStudentMap.student == User.id))
             .where(ParentStudentMap.parent == parent_id))
    return list(query)
