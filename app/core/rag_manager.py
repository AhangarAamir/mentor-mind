# /mentormind-backend/app/core/rag_manager.py
import logging
from typing import Dict, Any, List
import json

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_core.retrievers import BaseRetriever
from langchain_core.vectorstores.base import VectorStoreRetriever
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from app.services.chroma_service import ChromaService
from app.config import settings

logger = logging.getLogger(__name__)


class RagManager:
    """
    Manages the Retrieval-Augmented Generation (RAG) process.
    """

    def __init__(self, enable_streaming: bool = True):
        self.chroma_service = ChromaService()

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.2,
            convert_system_message_to_human=True,
            streaming=enable_streaming,
        )

        self.answer_prompt = PromptTemplate.from_template("""
        You are an expert Physics tutor for 9th and 10th-grade students.
        Use the following pieces of context to answer the question at the end.
        If you don't know the answer from the context, say you don't know — don't make up an answer.
        Provide a clear, concise, and step-by-step explanation suitable for a high school student.

        Context:
        {context}

        Question: {question}

        Helpful Answer:
        """)

        self.quiz_prompt_without_context = PromptTemplate.from_template("""
        You are an expert Physics educator creating a quiz for {grade}-grade students on the topic of '{topic}'.
        Generate a multiple-choice quiz with {num_questions} questions.

        The output must be a single, valid JSON object. Do not include any text or markdown formatting before or after the JSON.
        The JSON object should have a single key: "questions".
        The value of "questions" should be an array of question objects.
        Each question object must have the following keys:
        - "question_text": The full text of the question.
        - "options": An array of 4 strings representing the possible answers.
        - "correct_answer": The string that exactly matches one of the items in the "options" array.

        JSON Quiz Output:
        """)

        self.str_output_parser = StrOutputParser()
        self.json_output_parser = JsonOutputParser()

    def _get_retriever(self, student_grade: int, k: int) -> Chroma:
        """Creates and returns a retriever for the vector store."""
        lc_embedding_function = SentenceTransformerEmbeddings(
            model_name=settings.EMBEDDING_MODEL_NAME
        )
        vectorstore = Chroma(
            client=self.chroma_service._client,
            collection_name=settings.CHROMA_COLLECTION_NAME,
            embedding_function=lc_embedding_function,
        )
        return vectorstore

    def get_answer(self, question: str, student_grade: int, k: int = 5) -> Dict[str, Any]:
        """
        Gets an answer from the RAG system.
        """
        retriever = self._get_retriever(student_grade, k)
        retrieved_docs = retriever.similarity_search_with_relevance_scores(
                            query=question,
                            k=k,
                            filter={"grade": student_grade}
                        )

        if not retrieved_docs:
            logger.warning(f"No documents found for grade {student_grade} and question '{question}'. Widening search.")
            # Widen search by removing grade filter
            retrieved_docs = retriever.similarity_search_with_relevance_scores(
                            query=question,
                            k=k
                        )


        context_text = "\n\n".join([doc[0].page_content for doc in retrieved_docs])

        rag_chain = self.answer_prompt | self.llm | self.str_output_parser
        result = rag_chain.invoke({"context": context_text, "question": question})

        sources = [{"content": doc[0].page_content, "metadata": doc[0].metadata} for doc in retrieved_docs]

        return {
            "answer": result or "Sorry, I could not find an answer.",
            "sources": sources,
        }

    def generate_quiz(self, topic: str, grade: int, num_questions: int, k: int = 10) -> Dict[str, Any]:
        """
        Generates a quiz using only the LLM's knowledge, without RAG.
        """
        quiz_chain = self.quiz_prompt_without_context | self.llm | self.json_output_parser
        
        try:
            result = quiz_chain.invoke({
                "topic": topic,
                "grade": grade,
                "num_questions": num_questions
            })
            if isinstance(result, str):
                result = json.loads(result)
            
        except Exception as e:
            logger.error(f"Failed to generate or parse quiz from LLM: {e}")
            return {"error": "Failed to generate a valid quiz."}

        return result

    def get_answer_stream(self, question: str, student_grade: int, k: int = 5):
        """
        Yields answer chunks from the RAG system stream.
        """
        retriever = self._get_retriever(student_grade, k)
        retrieved_docs = retriever.similarity_search_with_relevance_scores(
                            query=question,
                            k=k,
                            filter={"grade": student_grade}
                        )

        if not retrieved_docs:
            logger.warning(f"No documents found for grade {student_grade} and question '{question}'. Widening search.")
            retrieved_docs = retriever.similarity_search_with_relevance_scores(
                            query=question,
                            k=k
                        )

        context_text = "\n\n".join([doc[0].page_content for doc in retrieved_docs])
        rag_chain = self.answer_prompt | self.llm | self.str_output_parser
        
        for chunk in rag_chain.stream({"context": context_text, "question": question}):
            yield chunk
