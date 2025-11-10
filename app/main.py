# /mentormind-backend/app/main.py
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from peewee import PeeweeException
from peewee_migrate import Router

from app.api import auth, users, parents, students, rag, ingest, quiz
from app.db.base import database
from app.db.models import (
    User, StudentProfile, ParentStudentMap, Lesson, Quiz,
    StudentQuizAttempt, WeakTopic, IngestionJob, Badge, 
)
from app.services.chroma_service import ChromaService
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# List of database models
MODELS = [
    User, StudentProfile, ParentStudentMap, Lesson, Quiz,
    StudentQuizAttempt, WeakTopic, IngestionJob, Badge
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup and shutdown events.
    """
    print("Application startup...")
    try:

        # Run migrations
        router = Router(database, migrate_dir=settings.MIGRATIONS_DIR)
        router.run()
        print("Database migrations applied.")
        # Initialize ChromaDB service
        ChromaService.initialize()
        print("ChromaDB service initialized.")

    except PeeweeException as e:
        print(f"Database connection failed: {e}")
        # Depending on the policy, you might want to exit the application
        # For now, we log the error and continue, but some operations will fail.
    except Exception as e:
        print(f"An error occurred during startup: {e}")
    yield

    # Shutdown logic
    logger.info("Application shutdown...")
    if not database.is_closed():
        database.close()
        logger.info("Database connection closed.")

# Initialize FastAPI app with the lifespan context manager
app = FastAPI(
    title="MentorMind - AI Powered Tutoring System",
    description="Backend for an AI Tutoring System using FastAPI, ChromaDB, and LangChain.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["https://example.com"] for specific domains
    allow_credentials=True,
    allow_methods=["*"],  # allows all HTTP methods
    allow_headers=["*"],  # allows all headers
)

# --- Middleware to manage database connection state ---
@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    try:
        database.connect(reuse_if_open=True)
        response = await call_next(request)
    except Exception as e:
        logger.exception("Database middleware error: %s", e)
        raise
    finally:
        if not database.is_closed():
            try:
                database.close()
            except Exception as e:
                logger.warning("Error closing database: %s", e)
    return response


# --- Exception Handlers ---
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )

# --- API Routers ---
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(parents.router, prefix="/api/parents", tags=["Parents"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(rag.router, prefix="/api/rag", tags=["RAG System"])
app.include_router(ingest.router, prefix="/api/ingest", tags=["Data Ingestion"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz Creation"])


@app.get("/", tags=["Health Check"])
async def root():
    """
    Root endpoint for health checks.
    """
    return {"status": "ok", "message": "Welcome to MentorMind Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)