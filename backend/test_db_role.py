import asyncio
from app.database import SessionLocal
from app.models import models
from app.schemas import schemas

def test():
    db = SessionLocal()
    user = schemas.UserCreate(name="Test Role", email="testrole@test.com", password="pwd", role="recruiter")
    print("Schema user role:", user.role)
    new_user = models.User(name=user.name, email=user.email, password_hash="hash", role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print("DB user role:", new_user.role)
    db.delete(new_user)
    db.commit()

test()
