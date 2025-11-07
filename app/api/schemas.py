# /mentormind-backend/app/api/schemas.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class StudentReportCard(BaseModel):
    student_name: str
    quiz_attempts: int
    average_score: float
    weak_topics: List[str]
    lessons_completed: int
    learning_streak_days: int

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: int
    student_id: int
    created_at: datetime
    updated_at: datetime
    last_message_snippet: Optional[str] = None

    class Config:
        from_attributes = True
