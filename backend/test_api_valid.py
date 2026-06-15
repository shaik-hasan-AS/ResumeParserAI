import asyncio
from fastapi.testclient import TestClient
from main import app
from app.database import get_db

from app.routes.auth import get_current_user
from app.models.models import User
def override_get_current_user():
    return User(id="test_user", email="test@test.com")
app.dependency_overrides[get_current_user] = override_get_current_user

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
    # create a dummy jpg file (minimum valid structure not needed for PIL if we expect an exception handled gracefully, or we can just send a tiny 1x1 png)
    # A 1x1 transparent PNG
    png_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDAT\x08\xd7c\xf8\xff\xff?\x00\x05\xfe\x02\xfe\xa7\x35\x81\x84\x00\x00\x00\x00IEND\xaeB`\x82"
    response = client.post("/api/resume/upload", files={"file": ("test.png", png_content, "image/png")})
    print("STATUS:", response.status_code)
    print("RESPONSE:", response.json())

if __name__ == "__main__":
    test_upload()
