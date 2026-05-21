from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from ..database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(Text, nullable=True)
    resumes = relationship("Resume", back_populates="owner")

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    original_file_path = Column(Text)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    owner = relationship("User", back_populates="resumes")
    parsed_data = relationship("ParsedData", back_populates="resume", uselist=False)
    feedback = relationship("Feedback", back_populates="resume", uselist=False)

class ParsedData(Base):
    __tablename__ = "parsed_data"
    id = Column(String, primary_key=True, default=generate_uuid)
    resume_id = Column(String, ForeignKey("resumes.id"))
    parsed_json = Column(JSON)
    raw_text = Column(Text, nullable=True)  # Stores extracted text so file re-reads aren't needed
    resume = relationship("Resume", back_populates="parsed_data")

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(String, primary_key=True, default=generate_uuid)
    resume_id = Column(String, ForeignKey("resumes.id"))
    feedback_text = Column(Text)
    score = Column(Integer)
    resume = relationship("Resume", back_populates="feedback")
