# /mentormind-backend/README.md
# MentorMind - AI Powered Tutoring System Backend

This repository contains the complete backend for the MentorMind project, an AI-powered tutoring system for 9th and 10th-grade Physics students. It's built with Python, FastAPI, PeeWee ORM, and leverages a RAG architecture with ChromaDB and LangChain for question-answering.

## Features

- **User Authentication**: JWT-based authentication with roles (student, parent, admin).
- **Role-Based Access**: Secure endpoints accessible only to authorized roles.
- **Parent-Student Linking**: Parents can link to and monitor their children's progress.
- **RAG-based Q&A**: Students can ask Physics questions and get answers from a knowledge base built from ingested documents.
- **PDF Ingestion**: Admins can upload PDF documents, which are processed in the background by Celery workers and stored in a ChromaDB vector store.
- **Background Tasks**: Celery and Redis handle asynchronous tasks like PDF processing and weekly report generation.
- **Containerized**: Fully containerized with Docker and Docker Compose for easy setup and deployment.

---

## Tech Stack

- **Framework**: FastAPI
- **Language**: Python 3.12
- **Database ORM**: PeeWee
- **Database**: PostgreSQL
- **Vector Store**: ChromaDB (Persistent)
- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2`
- **LLM Integration**: LangChain with Google Gemini
- **Async Tasks**: Celery & Redis
- **Authentication**: JWT (Access & Refresh Tokens)
- **Containerization**: Docker

---

## Getting Started

### Prerequisites

- Docker and Docker Compose (for containerized setup).
- Python 3.12 and `pip` (for local setup).
- A Google Gemini API key.

### 1. Clone the Repository

```bash
git clone <repository_url>
cd mentormind-backend
```

### 2. Create the Environment File

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and fill in the required values, especially your `GOOGLE_API_KEY`. For local development, you might need to change `DATABASE_URL` and `REDIS_URL` to point to `localhost` instead of the service names (`db`, `redis`).

---

### Option A: Run with Docker (Recommended)

This is the easiest way to get all services (backend, database, redis, workers) running together.

**1. Build and Run the Containers:**
From the root directory, run the following command:

```bash
docker-compose up --build
```

The API will be available at `http://localhost:8000`.

---

### Option B: Run Locally (Without Docker)

This is useful for development and debugging.

**1. Set up a Virtual Environment:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**2. Install Dependencies:**
Ensure you have installed all the required packages from `requirements.txt`:
```bash
pip install -r requirements.txt
```
This is the crucial step to solve `ModuleNotFoundError`.

**3. Run External Services:**
You will need to have PostgreSQL and Redis running on your local machine and accessible to the application.

**4. Run the Application:**
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`. You will also need to run the Celery worker separately in another terminal if you want to test background tasks.

---

## API Usage

The interactive API documentation (Swagger UI) is available at `http://localhost:8000/docs`.

### Workflow Example

1.  **Create an Admin User**:
    - Go to `POST /api/auth/signup`.
    - Create a user with the role `admin`.

2.  **Create a Student and Parent User**:
    - Use the same endpoint to create a `student` and a `parent`.

3.  **Ingest a PDF (as Admin)**:
    - Log in as the admin user via `POST /api/auth/login` to get a JWT token.
    - Authorize your requests in the Swagger UI using the obtained token.
    - Go to `POST /api/ingest/upload`.
    - Provide the `grade`, `subject`, `chapter`, and upload a sample Physics PDF.
    - This will trigger a background job. You can monitor the Celery worker logs to see the progress: `docker logs -f mentormind_worker`.

4.  **Ask a Question (as Student)**:
    - Log in as the student user.
    - Go to `POST /api/rag/ask`.
    - Ask a question related to the content of the PDF you ingested. The system will use the student's grade (default is 9) to filter the search.

5.  **Link Parent to Student (as Parent)**:
    - Log in as the parent user.
    - Go to `POST /api/parents/link` and provide the student's email address.

---

## Project Structure

```
mentormind-backend/
│
├── app/                  # Main application source code
│   ├── api/              # API endpoint routers
│   ├── core/             # Core logic (security, dependencies)
│   ├── db/               # Database models and CRUD operations
│   ├── services/         # Business logic services
│   ├── tasks/            # Celery background tasks
│   └── main.py           # FastAPI app entrypoint
│
├── data/                 # Persistent data
│   ├── pdfs/             # Uploaded PDF files
│   └── chroma/           # ChromaDB persistent storage
│
├── migrations/           # PeeWee database migrations
│
├── tests/                # Pytest tests
│
├── .env.example          # Environment variable template
├── Dockerfile            # Docker image definition
├── docker-compose.yml    # Docker multi-container setup
├── requirements.txt      # Python dependencies
└── README.md             # This file
```
