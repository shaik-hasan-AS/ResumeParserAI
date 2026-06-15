from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.orm.attributes import flag_modified
from ..database import get_db
from ..models import models
from ..schemas import schemas
from .auth import get_current_user
from ..parsers.resume.main import extract_text_from_pdf, extract_text_from_docx, parse_resume_text
from starlette.concurrency import run_in_threadpool
from ..ai.gemini import generate_feedback, generate_cover_letter, rewrite_text
from ..parsers.ocr import local_ocr_image, local_ocr_pdf
import os
import shutil
import uuid

router = APIRouter(prefix="/api/resume", tags=["resume"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


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


# NOTE: Static routes (GET /) must come BEFORE dynamic routes (GET /{id}/...)
# to prevent FastAPI from matching "/" as an id parameter.
@router.get("/debug")
def debug_server_env():
    import shutil
    import os
    import pytesseract
    
    tess_path = shutil.which("tesseract")
    custom_path = pytesseract.pytesseract.tesseract_cmd
    
    # Check common locations manually
    locations = [
        "/usr/bin/tesseract",
        "/app/.apt/usr/bin/tesseract",
        "/workspace/.apt/usr/bin/tesseract",
        "/nix/store"
    ]
    
    found = {loc: os.path.exists(loc) for loc in locations}
    
    return {
        "shutil_which": tess_path,
        "pytesseract_cmd": custom_path,
        "locations": found,
        "env_path": os.environ.get("PATH"),
        "tessdata_prefix": os.environ.get("TESSDATA_PREFIX")
    }

@router.get("/", response_model=list[schemas.ResumeResponse])
def get_user_resumes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    resumes = db.query(models.Resume).options(joinedload(models.Resume.feedback)).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.uploaded_at.desc()).all()
    return resumes


@router.post("/upload", response_model=schemas.ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not file.filename.lower().endswith((".pdf", ".docx", ".jpg", ".jpeg", ".png")):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, JPG, and PNG files are allowed")
        
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")
    
    file_bytes = await file.read()

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

@router.post("/rewrite")
def rewrite_resume_text(
    req: schemas.RewriteRequest,
    current_user: models.User = Depends(get_current_user)
):
    rewritten = rewrite_text(req.text, req.context)
    return {"text": rewritten}
