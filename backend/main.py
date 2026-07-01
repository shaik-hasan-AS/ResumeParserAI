import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, resume, jobs

# Create database tables safely so app doesn't crash on startup if DB is down
try:
    # Test connection first to avoid multiple slow timeout loops if DB is unreachable
    with engine.connect() as conn:
        pass

    Base.metadata.create_all(bind=engine)
    # HOTFIX: Since Alembic migration failed due to create_all creating tables out of band,
    # we manually ensure the new columns exist.
    from sqlalchemy import text
    hotfixes = [
        "ALTER TABLE users ADD COLUMN role VARCHAR",
        "ALTER TABLE applications ADD COLUMN status VARCHAR DEFAULT 'pending'",
        "ALTER TABLE applications ADD COLUMN notes VARCHAR",
        "ALTER TABLE applications ADD COLUMN rating INTEGER",
        "ALTER TABLE job_listings ADD COLUMN auto_reject_threshold INTEGER",
        "ALTER TABLE quick_scan_results ADD COLUMN rating INTEGER",
        "ALTER TABLE quick_scan_results ADD COLUMN notes VARCHAR"
    ]
    with engine.begin() as conn:
        for query in hotfixes:
            try:
                conn.execute(text(query))
            except Exception:
                pass
                
    # Seeding demo accounts for quick client evaluations
    from sqlalchemy.orm import Session as DBSession
    from app.services import auth as auth_service
    from app.models import models
    with DBSession(engine) as session:
        try:
            cand = session.query(models.User).filter(models.User.email == "candidate@vinentoai.com").first()
            if not cand:
                hashed = auth_service.get_password_hash("password123")
                new_cand = models.User(name="Demo Candidate", email="candidate@vinentoai.com", password_hash=hashed, role="candidate")
                session.add(new_cand)
            rec = session.query(models.User).filter(models.User.email == "recruiter@vinentoai.com").first()
            if not rec:
                hashed = auth_service.get_password_hash("password123")
                new_rec = models.User(name="Demo Recruiter", email="recruiter@vinentoai.com", password_hash=hashed, role="recruiter")
                session.add(new_rec)
            session.commit()
            print("Database demo accounts seeded successfully.")
        except Exception as se:
            print(f"Error seeding demo accounts: {se}")
            session.rollback()
            
    print("Database tables created successfully or already exist.")
except Exception as e:
    # ponytail: capture single connection timeout/failure and proceed so uvicorn starts
    print(f"Error connecting to database or running migrations: {e}")

from app.services import auth as auth_service
import re

# Enforce secure SECRET_KEY in production environments
is_prod = "postgresql" in os.getenv("DATABASE_URL", "") or os.getenv("ENV") == "production"
if is_prod and (not auth_service.SECRET_KEY or auth_service.SECRET_KEY in ("your-secret-key-for-local-dev", "change-me-to-a-strong-random-secret")):
    raise RuntimeError(
        "CRITICAL SECURITY ERROR: The SECRET_KEY environment variable is not configured securely "
        "for production. Please set a strong, random SECRET_KEY in your environment."
    )

app = FastAPI(title="VinentoAI API")

# Build CORS origins list — always include localhost for dev,
# plus the deployed Vercel frontend URL from environment variable.
_frontend_url = os.getenv("FRONTEND_URL", "").strip().rstrip("/")

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if _frontend_url:
    allowed_origins.append(_frontend_url)

# Build CORS origin regex to restrict wildcards
allowed_origin_regex = None
if _frontend_url:
    if ".vercel.app" in _frontend_url:
        project_match = re.match(r"https://([^.-]+)", _frontend_url)
        if project_match:
            project_name = project_match.group(1)
            allowed_origin_regex = rf"https://{re.escape(project_name)}-.*\.vercel\.app"
    elif ".ai" in _frontend_url or ".com" in _frontend_url:
        domain_match = re.search(r"https://([^/]+)", _frontend_url)
        if domain_match:
            domain = domain_match.group(1).replace("www.", "")
            allowed_origin_regex = rf"https://(.*)\.{re.escape(domain)}"

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allowed_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routes import auth, resume, jobs, screener

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(jobs.router)
app.include_router(screener.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to MyAIProfile API"}
