from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "candidate"

class GoogleAuthRequest(BaseModel):
    credential: str
    role: Optional[str] = "candidate"

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: Optional[str] = "candidate"
    class Config:
        from_attributes = True

class JobListingCreate(BaseModel):
    title: str
    description: str
    auto_reject_threshold: Optional[int] = None

class JobListingResponse(BaseModel):
    id: str
    recruiter_id: str
    title: str
    description: str
    auto_reject_threshold: Optional[int] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    resume_id: str
    match_score: Optional[int]
    match_summary: Optional[str]
    status: str
    notes: Optional[str]
    rating: Optional[int]
    applied_at: datetime
    class Config:
        from_attributes = True

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    rating: Optional[int] = None

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

class ParsedDataUpdateRequest(BaseModel):
    parsed_json: Dict[str, Any]


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

class OutreachEmailRequest(BaseModel):
    target_role: str
    job_description: str
    email_type: str # 'interview', 'rejection', 'initial_contact'

class OutreachEmailResponse(BaseModel):
    email_text: str

class RewriteRequest(BaseModel):
    text: str
    context: Optional[str] = None

class MockInterviewRequest(BaseModel):
    target_role: Optional[str] = None
    job_description: Optional[str] = None

class MockInterviewQuestion(BaseModel):
    question: str
    type: str  # e.g., "technical", "behavioral", "situational"
    expected_answer_hints: List[str]

class MockInterviewResponse(BaseModel):
    questions: List[MockInterviewQuestion]

class QuickScanResultResponse(BaseModel):
    id: str
    scan_id: str
    resume_id: str
    candidate_name: str
    match_score: Optional[int]
    match_summary: Optional[str]
    notes: Optional[str]
    rating: Optional[int]
    created_at: datetime
    class Config:
        from_attributes = True

class QuickScanResultUpdate(BaseModel):
    notes: Optional[str] = None
    rating: Optional[int] = None

class QuickScanResponse(BaseModel):
    id: str
    recruiter_id: str
    title: str
    description: str
    keywords: Optional[str]
    created_at: datetime
    results_count: Optional[int] = 0
    class Config:
        from_attributes = True

class AudioEnhanceResponse(BaseModel):
    parsed_json: Dict[str, Any]

class InterviewAnswerEvaluationResponse(BaseModel):
    transcript: str
    feedback: str
    score: int
    better_phrasing: str


class ATSMatchRequest(BaseModel):
    job_description: str
    target_role: Optional[str] = None


class ATSMatchResponse(BaseModel):
    match_score: int
    matched_keywords: List[str]
    missing_keywords: List[str]
    suggested_bullet_fixes: List[str]
