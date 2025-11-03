# /mentormind-backend/app/services/chroma_service.py
__import__('pysqlite3')
import sys
sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')
import chromadb
from chromadb.utils import embedding_functions
from app.config import settings

class ChromaService:
    """
    A singleton service for interacting with ChromaDB.
    """
    _instance = None
    _client = None
    _collection = None
    _embedding_function = None # Store embedding function as a class attribute

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ChromaService, cls).__new__(cls)
            cls.initialize()
        return cls._instance

    @classmethod
    def initialize(cls):
        """
        Initializes the ChromaDB client and collection.
        This should be called at application startup.
        """
        if cls._client is None:
            cls._client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIRECTORY)
            
            # Use the pre-built SentenceTransformer embedding function
            cls._embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name=settings.EMBEDDING_MODEL_NAME
            )
            
            cls._collection = cls._client.get_or_create_collection(
                name=settings.CHROMA_COLLECTION_NAME,
                embedding_function=cls._embedding_function, # Use the stored embedding function
                metadata={"hnsw:space": "cosine"} # Specifies the distance metric
            )

    def get_collection(self):
        """Returns the ChromaDB collection instance."""
        if self._collection is None:
            self.initialize()
        return self._collection

    def get_embedding_function(self):
        """Returns the embedding function used by the collection."""
        if self._embedding_function is None:
            self.initialize()
        return self._embedding_function

    def upsert_documents(self, documents: list[str], metadatas: list[dict], ids: list[str]):
        """
        Upserts (inserts or updates) documents into the collection.
        """
        collection = self.get_collection()
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )

    def query_collection(self, query_text: str, n_results: int, where_filter: dict) -> dict:
        """
        Queries the collection for similar documents.
        
        Args:
            query_text: The text to search for.
            n_results: The number of results to return.
            where_filter: A dictionary to filter results based on metadata.
                          Example: {"grade": 9, "subject": "Physics"}
        """
        collection = self.get_collection()
        results = collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where=where_filter
        )
        return results
