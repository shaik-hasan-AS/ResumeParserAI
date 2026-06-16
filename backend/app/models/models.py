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
    role = Column(String, default="candidate") # "candidate" or "recruiter"
    resumes = relationship("Resume", back_populates="owner")
    job_listings = relationship("JobListing", back_populates="recruiter")

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    original_file_path = Column(Text)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    owner = relationship("User", back_populates="resumes")
    parsed_data = relationship("ParsedData", back_populates="resume", uselist=False)
    feedback = relationship("Feedback", back_populates="resume", uselist=False)
    applications = relationship("Application", back_populates="resume")

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

class JobListing(Base):
    __tablename__ = "job_listings"
    id = Column(String, primary_key=True, default=generate_uuid)
    recruiter_id = Column(String, ForeignKey("users.id"))
    title = Column(String)
    description = Column(Text)
    auto_reject_threshold = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    recruiter = relationship("User", back_populates="job_listings")
    applications = relationship("Application", back_populates="job_listing")

class Application(Base):
    __tablename__ = "applications"
    id = Column(String, primary_key=True, default=generate_uuid)
    job_id = Column(String, ForeignKey("job_listings.id"))
    resume_id = Column(String, ForeignKey("resumes.id"))
    match_score = Column(Integer, nullable=True)
    match_summary = Column(Text, nullable=True)
    status = Column(String, default="pending") # "pending", "reviewing", "interviewing", "offered", "rejected"
    notes = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)
    applied_at = Column(DateTime, default=datetime.utcnow)
    job_listing = relationship("JobListing", back_populates="applications")
    resume = relationship("Resume", back_populates="applications")

class QuickScan(Base):
    __tablename__ = "quick_scans"
    id = Column(String, primary_key=True, default=generate_uuid)
    recruiter_id = Column(String, ForeignKey("users.id"))
    title = Column(String)
    description = Column(Text)
    keywords = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    recruiter = relationship("User")
    results = relationship("QuickScanResult", back_populates="scan", cascade="all, delete-orphan")

class QuickScanResult(Base):
    __tablename__ = "quick_scan_results"
    id = Column(String, primary_key=True, default=generate_uuid)
    scan_id = Column(String, ForeignKey("quick_scans.id"))
    resume_id = Column(String, ForeignKey("resumes.id"))
    match_score = Column(Integer, nullable=True)
    match_summary = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    scan = relationship("QuickScan", back_populates="results")
    resume = relationship("Resume")
