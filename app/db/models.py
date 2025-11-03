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
    
class QuizAttempt(BaseModel):
    id = AutoField()
    student = ForeignKeyField(User, backref='quiz_attempts')
    quiz = ForeignKeyField(Quiz, backref='attempts')
    answers = TextField() # Storing answers as JSON string
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

class Badge(BaseModel):
    id = AutoField()
    student = ForeignKeyField(User, backref='badges')
    name = CharField() # e.g., "Quiz Master", "Perfect Streak"
    description = TextField()
    awarded_at = DateTimeField(default=datetime.datetime.now)
