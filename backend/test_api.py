import asyncio
from fastapi.testclient import TestClient
from main import app
from app.database import get_db

# Override dependency to mock user
from app.routes.auth import get_current_user
from app.models.models import User
def override_get_current_user():
    return User(id="test_user", email="test@test.com")
app.dependency_overrides[get_current_user] = override_get_current_user

# We also need a mock DB session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()
app.dependency_overrides[get_db] = override_get_db

from app.models.models import Base
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_upload():
    # create a dummy pdf file
    pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Title (Test PDF)\n>>\nendobj\n"
    response = client.post("/api/resume/upload", files={"file": ("test.pdf", pdf_content, "application/pdf")})
    print("STATUS:", response.status_code)
    print("RESPONSE:", response.json())

if __name__ == "__main__":
    test_upload()
