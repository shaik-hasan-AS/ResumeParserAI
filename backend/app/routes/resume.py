from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.orm.attributes import flag_modified
from ..database import get_db
from ..models import models
from ..schemas import schemas
from .auth import get_current_user
from ..parsers.resume.main import extract_text_from_pdf, extract_text_from_docx, parse_resume_text
from starlette.concurrency import run_in_threadpool
from ..ai.gemini import generate_feedback, generate_cover_letter, rewrite_text, generate_mock_interview, transcribe_audio, enhance_resume_with_audio, evaluate_interview_answer, evaluate_ats_match, generate_speech_suggestions
from ..parsers.ocr import local_ocr_image, local_ocr_pdf
from ..services.rate_limit import rate_limit
import os
import shutil
import uuid
import json

router = APIRouter(prefix="/api/resume", tags=["resume"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def validate_uploaded_file(file: UploadFile, max_size_mb: int = 10) -> bytes:
    """
    Validate the uploaded file's extension, mime type, and maximum file size.
    Returns the file bytes.
    """
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in {".pdf", ".docx", ".jpg", ".jpeg", ".png"}:
        raise HTTPException(
            status_code=400,
            detail=f"Only PDF, DOCX, JPG, and PNG files are allowed. Invalid extension: {ext}"
        )
        
    # Read file content in chunks of 1MB to verify size (prevents memory exhaustion)
    max_bytes = max_size_mb * 1024 * 1024
    content = bytearray()
    while True:
        chunk = await file.read(1024 * 1024)
        if not chunk:
            break
        content.extend(chunk)
        if len(content) > max_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"File exceeds maximum allowed size of {max_size_mb} MB"
            )
            
    await file.seek(0)
    return bytes(content)


def extract_text_from_file(file_path: str, file_bytes: bytes) -> str:
    """Return extracted text from a resume file, falling back to OCR for scanned PDFs."""
    lower = file_path.lower()
    if lower.endswith((".jpg", ".jpeg", ".png")):
        return local_ocr_image(file_bytes)
    elif lower.endswith(".pdf"):
        text = extract_text_from_pdf(file_bytes)
        if len(text.strip()) < 100:
            text = local_ocr_pdf(file_bytes)
        return text
    elif lower.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    return "File format not supported for text extraction."



@router.get("/", response_model=list[schemas.ResumeResponse])
def get_user_resumes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    resumes = db.query(models.Resume).options(joinedload(models.Resume.feedback)).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.uploaded_at.desc()).all()
    return resumes


@router.post("/upload", response_model=schemas.ResumeResponse, dependencies=[Depends(rate_limit(10, 60))])
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    file_bytes = await validate_uploaded_file(file, 10)
        
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")

    # Save to disk (best-effort; Railway filesystem is ephemeral)
    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)
        
    new_resume = models.Resume(
        id=file_id,
        user_id=current_user.id,
        original_file_path=file_path
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    raw_text = await run_in_threadpool(extract_text_from_file, file_path, file_bytes)
    parsed_json = await run_in_threadpool(parse_resume_text, raw_text)
    
    parsed_data = models.ParsedData(
        resume_id=new_resume.id,
        parsed_json=parsed_json,
        raw_text=raw_text  # Store text so we don't need the file later
    )
    db.add(parsed_data)
    db.commit()
    
    return new_resume


@router.get("/{id}/parsed", response_model=schemas.ParsedDataResponse)
def get_parsed_data(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    resume = db.query(models.Resume).filter(models.Resume.id == id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    parsed = db.query(models.ParsedData).filter(models.ParsedData.resume_id == id).first()
    if not parsed:
        raise HTTPException(status_code=404, detail="Parsed data not found")
        
    return parsed


@router.put("/{id}/parsed", response_model=schemas.ParsedDataResponse)
def update_parsed_data(
    id: str,
    req: schemas.ParsedDataUpdateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    resume = db.query(models.Resume).filter(models.Resume.id == id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    parsed = db.query(models.ParsedData).filter(models.ParsedData.resume_id == id).first()
    if not parsed:
        raise HTTPException(status_code=404, detail="Parsed data not found")
        
    parsed.parsed_json = req.parsed_json
    flag_modified(parsed, "parsed_json")
    db.commit()
    db.refresh(parsed)
    return parsed


@router.post("/{id}/feedback", response_model=schemas.FeedbackResponse)
def generate_resume_feedback(
    id: str,
    req: schemas.FeedbackRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    resume = db.query(models.Resume).filter(models.Resume.id == id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    parsed = db.query(models.ParsedData).filter(models.ParsedData.resume_id == id).first()
    if not parsed:
        raise HTTPException(status_code=404, detail="Parsed data not found")

    # Prefer stored raw_text (survives Railway restarts); fall back to reading file from disk
    raw_text = getattr(parsed, "raw_text", None) or ""
    if not raw_text and os.path.exists(resume.original_file_path):
        with open(resume.original_file_path, "rb") as f:
            file_bytes = f.read()
        raw_text = extract_text_from_file(resume.original_file_path, file_bytes)

    feedback_result = generate_feedback(parsed.parsed_json if parsed else {}, raw_text, target_role=req.target_role, job_description=req.job_description)
    
    feedback = db.query(models.Feedback).filter(models.Feedback.resume_id == id).first()
    if not feedback:
        feedback = models.Feedback(
            resume_id=id,
            feedback_text=feedback_result["feedback_text"],
            score=feedback_result["score"]
        )
        db.add(feedback)
    else:
        feedback.feedback_text = feedback_result["feedback_text"]
        feedback.score = feedback_result["score"]
        
    # Also update the parsed data's summary with the new professional summary
    try:
        import json
        parsed_fb = json.loads(feedback_result["feedback_text"])
        if parsed_fb.get("professional_summary"):
            # Update the parsed JSON in memory
            new_parsed_json = dict(parsed.parsed_json) if parsed.parsed_json else {}
            new_parsed_json["summary"] = parsed_fb["professional_summary"]
            # Reassign to trigger SQLAlchemy JSON update
            parsed.parsed_json = new_parsed_json
    except Exception as e:
        print(f"Error updating professional summary: {e}")
        
    db.commit()
    db.refresh(feedback)
    
    return feedback

@router.post("/{id}/coverletter", response_model=schemas.CoverLetterResponse)
def create_cover_letter(
    id: str,
    req: schemas.CoverLetterRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    resume = db.query(models.Resume).filter(models.Resume.id == id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    parsed = db.query(models.ParsedData).filter(models.ParsedData.resume_id == id).first()
    if not parsed:
        raise HTTPException(status_code=404, detail="Parsed data not found")

    raw_text = getattr(parsed, "raw_text", None) or ""
    if not raw_text and os.path.exists(resume.original_file_path):
        with open(resume.original_file_path, "rb") as f:
            file_bytes = f.read()
        raw_text = extract_text_from_file(resume.original_file_path, file_bytes)

    cover_letter_text = generate_cover_letter(
        parsed.parsed_json if parsed else {}, 
        raw_text, 
        job_description=req.job_description,
        target_role=req.target_role
    )
    
    return schemas.CoverLetterResponse(cover_letter_text=cover_letter_text)

from ..ai.gemini import generate_outreach_email

@router.post("/{id}/outreach_email", response_model=schemas.OutreachEmailResponse)
def create_outreach_email(
    id: str,
    req: schemas.OutreachEmailRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can generate outreach emails")

    resume = db.query(models.Resume).filter(models.Resume.id == id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    parsed = db.query(models.ParsedData).filter(models.ParsedData.resume_id == id).first()
    if not parsed:
        raise HTTPException(status_code=404, detail="Parsed data not found")

    raw_text = getattr(parsed, "raw_text", None) or ""
    if not raw_text and os.path.exists(resume.original_file_path):
        with open(resume.original_file_path, "rb") as f:
            file_bytes = f.read()
        raw_text = extract_text_from_file(resume.original_file_path, file_bytes)

    email_text = generate_outreach_email(
        parsed.parsed_json if parsed else {}, 
        raw_text, 
        job_description=req.job_description,
        target_role=req.target_role,
        email_type=req.email_type
    )
    
    return schemas.OutreachEmailResponse(email_text=email_text)

@router.post("/rewrite")
def rewrite_resume_text(
    req: schemas.RewriteRequest,
    current_user: models.User = Depends(get_current_user)
):
    rewritten = rewrite_text(req.text, req.context)
    return {"text": rewritten}

@router.post("/{id}/mock-interview", response_model=schemas.MockInterviewResponse)
def create_mock_interview(
    id: str,
    req: schemas.MockInterviewRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    resume = db.query(models.Resume).filter(models.Resume.id == id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    parsed = db.query(models.ParsedData).filter(models.ParsedData.resume_id == id).first()
    if not parsed:
        raise HTTPException(status_code=404, detail="Parsed data not found")

    raw_text = getattr(parsed, "raw_text", None) or ""
    if not raw_text and os.path.exists(resume.original_file_path):
        with open(resume.original_file_path, "rb") as f:
            file_bytes = f.read()
        raw_text = extract_text_from_file(resume.original_file_path, file_bytes)

    interview_text = generate_mock_interview(
        parsed.parsed_json if parsed else {}, 
        raw_text, 
        job_description=req.job_description,
        target_role=req.target_role
    )
    
    import json
    try:
        parsed_interview = json.loads(interview_text)
        return parsed_interview
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse mock interview response: {str(e)}")

from fastapi.responses import FileResponse

@router.get("/{id}/download")
def download_resume_original(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Recruiters can download any resume they have access to, candidates can only download their own.
    # For simplicity, if current_user is recruiter, allow it. Otherwise verify ownership.
    resume = db.query(models.Resume).filter(models.Resume.id == id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    if current_user.role != "recruiter" and resume.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to download this resume")

    if not os.path.exists(resume.original_file_path):
        raise HTTPException(status_code=404, detail="Original file no longer exists on server")

    filename = os.path.basename(resume.original_file_path)
    return FileResponse(path=resume.original_file_path, filename=filename)


ALLOWED_AUDIO_TYPES = {
    "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
    "audio/webm", "audio/ogg", "audio/m4a", "audio/mp4",
    "audio/x-m4a", "video/webm",  # browser MediaRecorder often uses video/webm
}

@router.post("/{id}/enhance-audio", response_model=schemas.AudioEnhanceResponse)
async def enhance_resume_with_audio_route(
    id: str,
    audio: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Accept an audio recording, transcribe it with Gemini, merge with existing parsed data, save and return enhanced JSON."""
    resume = db.query(models.Resume).filter(
        models.Resume.id == id, models.Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    parsed = db.query(models.ParsedData).filter(models.ParsedData.resume_id == id).first()
    if not parsed:
        raise HTTPException(status_code=404, detail="Parsed data not found")

    # Validate content type (browser sometimes sends octet-stream)
    content_type = audio.content_type or ""
    if content_type not in ALLOWED_AUDIO_TYPES and not content_type.startswith("audio/"):
        # Accept anyway if filename looks like audio – ponytail: lenient, the API will reject bad files itself
        ext = os.path.splitext(audio.filename or "")[1].lower()
        if ext not in {".mp3", ".wav", ".webm", ".ogg", ".m4a", ".mp4"}:
            raise HTTPException(status_code=400, detail=f"Unsupported audio format: {content_type}")

    audio_bytes = await audio.read()
    if len(audio_bytes) > 50 * 1024 * 1024:  # 50 MB hard cap
        raise HTTPException(status_code=413, detail="Audio file too large (max 50 MB)")

    raw_text = getattr(parsed, "raw_text", None) or ""

    # Transcribe then enhance — both are blocking/network calls, run in threadpool
    mime = content_type or "audio/mpeg"

    def _process():
        transcript = transcribe_audio(audio_bytes, mime)
        return enhance_resume_with_audio(parsed.parsed_json or {}, raw_text, transcript)

    enhanced_json = await run_in_threadpool(_process)

    if "error" in enhanced_json and len(enhanced_json) <= 2:
        raise HTTPException(status_code=500, detail=enhanced_json["error"])

    # Persist the enhanced data
    parsed.parsed_json = enhanced_json
    flag_modified(parsed, "parsed_json")
    db.commit()

    return schemas.AudioEnhanceResponse(parsed_json=enhanced_json)


@router.post("/{id}/mock-interview/evaluate", response_model=schemas.InterviewAnswerEvaluationResponse)
async def evaluate_mock_interview_answer_route(
    id: str,
    audio: UploadFile = File(...),
    question: str = Form(...),
    expected_hints: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Accept an audio recording of a mock interview answer, transcribe it, evaluate it, and return feedback + score."""
    resume = db.query(models.Resume).filter(
        models.Resume.id == id, models.Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    content_type = audio.content_type or ""
    if content_type not in ALLOWED_AUDIO_TYPES and not content_type.startswith("audio/"):
        ext = os.path.splitext(audio.filename or "")[1].lower()
        if ext not in {".mp3", ".wav", ".webm", ".ogg", ".m4a", ".mp4"}:
            raise HTTPException(status_code=400, detail=f"Unsupported audio format: {content_type}")

    audio_bytes = await audio.read()
    mime = content_type or "audio/mpeg"

    # Transcribe and evaluate in threadpool
    def _evaluate():
        # transcribe
        transcript_json_str = transcribe_audio(audio_bytes, mime)
        transcript = ""
        try:
            parsed_trans = json.loads(transcript_json_str)
            transcript = parsed_trans.get("transcript", transcript_json_str)
        except Exception:
            transcript = transcript_json_str

        # parse hints back to list
        hints_list = [h.strip() for h in expected_hints.split(",") if h.strip()]

        # evaluate
        eval_res = evaluate_interview_answer(question, hints_list, transcript)
        return {
            "transcript": transcript,
            "feedback": eval_res.get("feedback", "No feedback available."),
            "score": eval_res.get("score", 0),
            "better_phrasing": eval_res.get("better_phrasing", "N/A")
        }

    res = await run_in_threadpool(_evaluate)
    return schemas.InterviewAnswerEvaluationResponse(**res)


@router.post("/{id}/ats-match", response_model=schemas.ATSMatchResponse)
def get_ats_match_score(
    id: str,
    req: schemas.ATSMatchRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Analyze resume details against a job description to provide match score, keyword differences, and suggested experience bullet fixes."""
    resume = db.query(models.Resume).filter(
        models.Resume.id == id, models.Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    parsed = db.query(models.ParsedData).filter(models.ParsedData.resume_id == id).first()
    if not parsed:
        raise HTTPException(status_code=404, detail="Parsed data not found")

    raw_text = getattr(parsed, "raw_text", None) or ""
    if not raw_text and os.path.exists(resume.original_file_path):
        with open(resume.original_file_path, "rb") as f:
            file_bytes = f.read()
        raw_text = extract_text_from_file(resume.original_file_path, file_bytes)

    result = evaluate_ats_match(parsed.parsed_json or {}, raw_text, req.job_description)
    return schemas.ATSMatchResponse(**result)


@router.get("/{id}/speech-suggestions", response_model=schemas.SpeechSuggestionsResponse)
def get_speech_suggestions(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Retrieve 3 industry-specific, tailored speech suggestions based on parsed resume experience to guide their audio recording."""
    resume = db.query(models.Resume).filter(
        models.Resume.id == id, models.Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    parsed = db.query(models.ParsedData).filter(models.ParsedData.resume_id == id).first()
    if not parsed:
        raise HTTPException(status_code=404, detail="Parsed data not found")

    result = generate_speech_suggestions(parsed.parsed_json or {})
    return schemas.SpeechSuggestionsResponse(**result)
