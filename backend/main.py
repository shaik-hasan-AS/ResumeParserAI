import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, resume, jobs

# Create database tables safely so app doesn't crash on startup if DB is down
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully or already exist.")
except Exception as e:
    print(f"Error creating database tables: {e}")

app = FastAPI(title="MyAIProfile API")

# Build CORS origins list — always include localhost for dev,
# plus the deployed Vercel frontend URL from environment variable.
_frontend_url = os.getenv("FRONTEND_URL", "").strip().rstrip("/")

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if _frontend_url:
    allowed_origins.append(_frontend_url)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(jobs.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to MyAIProfile API"}
