# /mentormind-backend/app/db/models.py
import datetime
from peewee import (
    Model, CharField, TextField, DateTimeField, ForeignKeyField,
    IntegerField, FloatField, AutoField
)
from enum import Enum
from app.db.base import BaseModel

class UserRole(str, Enum):
    student = "student"
    parent = "parent"
    admin = "admin"

class IngestionStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class User(BaseModel):
    id = AutoField()
    name = CharField()
    email = CharField(unique=True, index=True)
    password_hash = CharField()
    role = CharField(choices=[(role.value, role.name) for role in UserRole])
    created_at = DateTimeField(default=datetime.datetime.now)

class StudentProfile(BaseModel):
    user = ForeignKeyField(User, backref='student_profile', primary_key=True)
    grade = IntegerField()
    syllabus = CharField(null=True)

class ParentStudentMap(BaseModel):
    parent = ForeignKeyField(User, backref='linked_students')
    student = ForeignKeyField(User, backref='linked_parents')

    class Meta:
        primary_key = False # No primary key, but we can add constraints
        indexes = (
            (('parent', 'student'), True), # Unique constraint on (parent, student)
        )

class Lesson(BaseModel):
    id = AutoField()
    title = CharField()
    grade = IntegerField()
    subject = CharField()
    source = CharField(null=True) # e.g., filename or external URL
    created_at = DateTimeField(default=datetime.datetime.now)

class Quiz(BaseModel):
    id = AutoField()
    lesson = ForeignKeyField(Lesson, backref='quizzes')
    questions = TextField() # Storing questions as JSON string
    
class StudentQuizAttempt(BaseModel):
    id = AutoField()
    student = ForeignKeyField(User, backref='quiz_attempts')
    topic = CharField()
    grade = IntegerField()
    questions = TextField()  # JSON of questions, options, and correct_answer
    answers = TextField()    # JSON of the student's answers
    score = FloatField()
    attempted_at = DateTimeField(default=datetime.datetime.now)

class WeakTopic(BaseModel):
    student = ForeignKeyField(User, backref='weak_topics')
    topic = CharField()
    accuracy_score = FloatField()

class IngestionJob(BaseModel):
    id = AutoField()
    filename = CharField()
    grade = IntegerField()
    subject = CharField()
    chapter = CharField()
    status = CharField(choices=[(s.value, s.name) for s in IngestionStatus])
    created_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)

class Conversation(BaseModel):
    id = AutoField()
    student = ForeignKeyField(User, backref='conversations')
    created_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)

class Message(BaseModel):
    id = AutoField()
    conversation = ForeignKeyField(Conversation, backref='messages')
    sender = CharField() # 'student' or 'tutor'
    content = TextField()
    created_at = DateTimeField(default=datetime.datetime.now)

class Badge(BaseModel):
    id = AutoField()
    student = ForeignKeyField(User, backref='badges')
    name = CharField() # e.g., "Quiz Master", "Perfect Streak"
    description = TextField()
    awarded_at = DateTimeField(default=datetime.datetime.now)
