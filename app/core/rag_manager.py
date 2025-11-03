# /mentormind-backend/app/core/rag_manager.py
import logging
from typing import Dict, Any

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.retrievers import BaseRetriever # Import BaseRetriever
from langchain_community.vectorstores import Chroma # Import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings # Import SentenceTransformerEmbeddings
from app.services.chroma_service import ChromaService
from app.config import settings

logger = logging.getLogger(__name__)


class RagManager:
    """
    Manages the Retrieval-Augmented Generation (RAG) process.
    """

    def __init__(self, enable_streaming: bool = False):
        self.chroma_service = ChromaService()

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.2,
            convert_system_message_to_human=True,
            streaming=enable_streaming,   # 👈 streaming configurable
        )

        self.prompt = PromptTemplate.from_template("""
        You are an expert Physics tutor for 9th and 10th-grade students.
        Use the following pieces of context to answer the question at the end.
        If you don't know the answer from the context, say you don't know — don't make up an answer.
        Provide a clear, concise, and step-by-step explanation suitable for a high school student.

        Context:
        {context}

        Question: {question}

        Helpful Answer:
        """)

        # Output parser (ensures the model returns a string)
        self.output_parser = StrOutputParser()

    def get_answer(self, question: str, student_grade: int, k: int = 5) -> Dict[str, Any]:
        """
        Gets an answer from the RAG system.
        """
        # Get the raw ChromaDB client and collection name
        # The embedding function needs to be a LangChain Embeddings object
        lc_embedding_function = SentenceTransformerEmbeddings(
            model_name=settings.EMBEDDING_MODEL_NAME
        )

        # Create a LangChain Chroma vector store instance
        vectorstore = Chroma(
            client=self.chroma_service._client, # Access the client directly
            collection_name=settings.CHROMA_COLLECTION_NAME,
            embedding_function=lc_embedding_function, # Use the LangChain Embeddings object
            collection_metadata={"hnsw:space": "cosine"} # Ensure metadata is passed if needed
        )

        retriever: BaseRetriever = vectorstore.as_retriever( # Type hint retriever
            search_type="similarity",
            search_kwargs={"k": k, "filter": {"grade": student_grade}},
        )

        # # Try retrieving documents
        # retrieved_docs = retriever._get_relevant_documents(question)
        # if len(retrieved_docs) < k / 2:
        #     logger.info(f"Few results for grade {student_grade}, widening search to all grades.")
        #     retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": k}) # Use vectorstore here
        #     retrieved_docs = retriever._get_relevant_documents(question)

        # Combine retrieved docs into context text
        # context_text = "\n\n".join([doc.page_content for doc in retrieved_docs])
        
        context_text=""
        # 🧠 Pipe-style LCEL chain
        rag_chain = self.prompt | self.llm | self.output_parser

        # Run the chain
        result = rag_chain.invoke({"context": context_text, "question": question})

        # Format sources
        # sources = [
        #     {"content": doc.page_content, "metadata": doc.metadata}
        #     for doc in retrieved_docs
        # ]

        sources = []

        return {
            "answer": result or "Sorry, I could not find an answer.",
            "sources": sources,
        }
