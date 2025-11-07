# /mentormind-backend/app/services/quiz_service.py
from app.core.rag_manager import RagManager


class QuizService:
    def __init__(self):
        self.rag_manager = RagManager()

    def generate_quiz_for_topic(self, topic: str, grade: int, num_questions: int = 5):
        """
        Generates a quiz using the RAG manager.
        """
        quiz_data = self.rag_manager.generate_quiz(
            topic=topic,
            grade=grade,
            num_questions=num_questions
        )
        return quiz_data
