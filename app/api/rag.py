# /mentormind-backend/app/api/rag.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from peewee import DoesNotExist
from fastapi.responses import StreamingResponse
import json
import datetime

from app.db.models import User, StudentProfile, Conversation, Message
from app.db import crud
from app.core.dependencies import get_current_student_user
from app.core.rag_manager import RagManager
from app.api.schemas import ConversationResponse, MessageResponse

router = APIRouter()
rag_manager = RagManager()

class AskRequest(BaseModel):
    question: str
    conversation_id: int | None = None

@router.post("/ask")
async def ask_question(
    request: AskRequest,
    current_user: User = Depends(get_current_student_user)
):
    """
    Receives a student's question and returns an answer using the RAG system.
    Handles conversation creation and message storage.
    """
    try:
        student_profile = StudentProfile.get(StudentProfile.user == current_user.id)
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found. Please complete your profile."
        )
    student_grade = student_profile.grade

    conversation: Conversation | None = None
    if request.conversation_id:
        conversation = crud.get_conversation_by_id(request.conversation_id)
        if not conversation or conversation.student.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found or does not belong to the current student."
            )
    
    if not conversation:
        conversation = crud.create_conversation(student_id=current_user.id)
    
    # Save student's question as a message
    crud.create_message(
        conversation_id=conversation.id,
        sender="student",
        content=request.question
    )

    async def generate_stream():
        full_answer_content = ""
        # Yield the conversation_id first as a JSON object
        yield json.dumps({"conversation_id": conversation.id}) + "\n"

        try:
            for chunk in rag_manager.get_answer_stream(request.question, student_grade):
                full_answer_content += chunk
                yield json.dumps({"message_chunk": chunk}) + "\n"
        except Exception as e:
            import traceback
            traceback.print_exception(e)
            yield json.dumps({"error": "Failed to get an answer from the RAG system."})
        finally:
            # Save the full LLM answer as a message after streaming is complete
            if full_answer_content:
                crud.create_message(
                    conversation_id=conversation.id,
                    sender="tutor",
                    content=full_answer_content
                )

    return StreamingResponse(generate_stream(), media_type="application/json")

@router.get("/conversations", response_model=list[ConversationResponse])
def get_conversations(
    current_user: User = Depends(get_current_student_user)
):
    """
    Retrieves all conversations for the authenticated student.
    """
    conversations = crud.get_conversations_by_student(current_user.id)
    response_conversations = []
    for conv in conversations:
        last_message = crud.get_messages_by_conversation(conv.id)
        last_message_snippet = last_message[-1].content[:100] + "..." if last_message else None
        response_conversations.append(ConversationResponse(
            id=conv.id,
            student_id=conv.student.id,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            last_message_snippet=last_message_snippet
        ))
    return response_conversations

@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageResponse])
def get_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_student_user)
):
    """
    Retrieves all messages for a specific conversation.
    """
    conversation = crud.get_conversation_by_id(conversation_id)
    if not conversation or conversation.student.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or does not belong to the current student."
        )
    messages = crud.get_messages_by_conversation(conversation_id)
    return [MessageResponse.from_orm(msg) for msg in messages]
