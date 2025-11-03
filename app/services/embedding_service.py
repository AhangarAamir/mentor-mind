# /mentormind-backend/app/services/embedding_service.py
# Note: This service is now implicitly handled by ChromaDB's
# `SentenceTransformerEmbeddingFunction`. This file is kept for conceptual
# clarity and could be used if you wanted to manage embeddings manually
# or use a different provider.

from sentence_transformers import SentenceTransformer
from app.config import settings

class EmbeddingService:
    """
    A service to handle the creation of text embeddings.
    """
    _model = None

    @classmethod
    def get_model(cls):
        """
        Loads and returns the SentenceTransformer model (singleton pattern).
        """
        if cls._model is None:
            cls._model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
        return cls._model

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """
        Takes a list of texts and returns their embeddings.
        """
        model = self.get_model()
        embeddings = model.encode(texts, convert_to_tensor=False)
        return embeddings.tolist()

# Example usage (not needed for the main app flow with Chroma's built-in function)
# if __name__ == "__main__":
#     service = EmbeddingService()
#     embeddings = service.embed_documents(["This is a test sentence.", "Hello, world!"])
#     print(len(embeddings))
#     print(len(embeddings[0]))
