from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    credential: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class FeedbackSummary(BaseModel):
    score: int
    class Config:
        from_attributes = True

class ResumeResponse(BaseModel):
    id: str
    user_id: str
    original_file_path: str
    uploaded_at: datetime
    feedback: Optional[FeedbackSummary] = None
    class Config:
        from_attributes = True

class ParsedDataResponse(BaseModel):
    id: str
    resume_id: str
    parsed_json: Dict[str, Any]
    raw_text: Optional[str] = None
    class Config:
        from_attributes = True

class FeedbackRequest(BaseModel):
    target_role: Optional[str] = None
    job_description: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: str
    resume_id: str
    feedback_text: str
    score: Optional[int]
    class Config:
        from_attributes = True

class CoverLetterRequest(BaseModel):
    job_description: str
    target_role: Optional[str] = None

class CoverLetterResponse(BaseModel):
    cover_letter_text: str
