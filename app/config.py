# /mentormind-backend/app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from pathlib import Path

# Define the base directory of the project
# This makes the paths work both locally and inside the Docker container
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """
    Application settings loaded from .env file.
    """
    # Database configuration
    DATABASE_URL: str = "postgresql://user:password@db:5432/mentormind_db"

    # Redis configuration for Celery
    REDIS_URL: str = "redis://redis:6379/0"

    # JWT settings
    SECRET_KEY: str = "a_very_secret_key_that_should_be_changed"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # LLM API Key (e.g., Google Gemini)
    GOOGLE_API_KEY: str = "your_google_api_key_here"

    # Embedding model
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"

    # ChromaDB settings
    CHROMA_PERSIST_DIRECTORY: str = str(BASE_DIR / "data" / "chroma")
    CHROMA_COLLECTION_NAME: str = "physics_tutoring"

    # File storage
    PDF_UPLOAD_DIR: str = str(BASE_DIR / "data" / "pdfs")

    # Pydantic settings configuration
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding='utf-8', extra='ignore')

# Create a single instance of the settings
settings = Settings()

# Ensure data directories exist
os.makedirs(settings.PDF_UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.CHROMA_PERSIST_DIRECTORY, exist_ok=True)
