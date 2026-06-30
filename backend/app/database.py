import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

db_url = os.environ.get("DATABASE_URL")
connect_args = {}

if not db_url:
    # ponytail: default to local sqlite in production/dev if DATABASE_URL is not set to avoid startup block
    db_url = "sqlite:///./sqlite.db"
    connect_args["check_same_thread"] = False
else:
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    if db_url.startswith("postgresql"):
        # ponytail: prevent 15-minute startup hang on unreachable db URL
        connect_args["connect_timeout"] = 5

SQLALCHEMY_DATABASE_URL = db_url

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
