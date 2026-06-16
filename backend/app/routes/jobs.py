from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import models
from ..schemas import schemas
from .auth import get_current_user
from ..ai.gemini import evaluate_candidate_fit
from starlette.concurrency import run_in_threadpool

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.post("", response_model=schemas.JobListingResponse)
def create_job(
    job: schemas.JobListingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can post jobs")
    
    new_job = models.JobListing(
        title=job.title,
        description=job.description,
        recruiter_id=current_user.id
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.get("", response_model=list[schemas.JobListingResponse])
def list_jobs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == "recruiter":
        return db.query(models.JobListing).filter(models.JobListing.recruiter_id == current_user.id).order_by(models.JobListing.created_at.desc()).all()
    else:
        return db.query(models.JobListing).order_by(models.JobListing.created_at.desc()).all()

@router.post("/{job_id}/apply", response_model=schemas.ApplicationResponse)
async def apply_to_job(
    job_id: str,
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "candidate":
        raise HTTPException(status_code=403, detail="Only candidates can apply to jobs")
    
    # Check if job exists
    job = db.query(models.JobListing).filter(models.JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Check if resume belongs to user
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or does not belong to you")
        
    # Check if already applied
    existing_app = db.query(models.Application).filter(models.Application.job_id == job_id, models.Application.resume_id == resume_id).first()
    if existing_app:
        raise HTTPException(status_code=400, detail="Already applied to this job with this resume")

    # Get parsed data for AI evaluation
    parsed = db.query(models.ParsedData).filter(models.ParsedData.resume_id == resume_id).first()
    parsed_json = parsed.parsed_json if parsed else {}

    # Evaluate candidate async
    evaluation = await run_in_threadpool(evaluate_candidate_fit, parsed_json, job.description)
    
    application = models.Application(
        job_id=job_id,
        resume_id=resume_id,
        match_score=evaluation.get("match_score", 0),
        match_summary=evaluation.get("match_summary", "Evaluation failed.")
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    
    return application

@router.get("/{job_id}/applications")
def get_job_applications(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can view applications")
        
    job = db.query(models.JobListing).filter(models.JobListing.id == job_id, models.JobListing.recruiter_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or does not belong to you")
        
    applications = db.query(models.Application).filter(models.Application.job_id == job_id).order_by(models.Application.match_score.desc()).all()
    
    results = []
    for app in applications:
        # Also fetch basic resume info
        resume_info = db.query(models.ParsedData).filter(models.ParsedData.resume_id == app.resume_id).first()
        name = "Unknown Candidate"
        if resume_info and resume_info.parsed_json:
            name = resume_info.parsed_json.get("name", "Unknown Candidate")
            
        results.append({
            "application_id": app.id,
            "resume_id": app.resume_id,
            "candidate_name": name,
            "match_score": app.match_score,
            "match_summary": app.match_summary,
            "status": app.status,
            "notes": app.notes,
            "applied_at": app.applied_at
        })
        
    return results

@router.put("/{job_id}/applications/{app_id}", response_model=schemas.ApplicationResponse)
def update_application(
    job_id: str,
    app_id: str,
    update_data: schemas.ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can update applications")
        
    job = db.query(models.JobListing).filter(models.JobListing.id == job_id, models.JobListing.recruiter_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or does not belong to you")
        
    application = db.query(models.Application).filter(models.Application.id == app_id, models.Application.job_id == job_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if update_data.status is not None:
        application.status = update_data.status
    if update_data.notes is not None:
        application.notes = update_data.notes
        
    db.commit()
    db.refresh(application)
    return application

@router.post("/{job_id}/upload_candidates")
async def bulk_upload_candidates(
    job_id: str,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can upload candidates")
        
    job = db.query(models.JobListing).filter(models.JobListing.id == job_id, models.JobListing.recruiter_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or does not belong to you")
        
    from .resume import extract_text_from_file, UPLOAD_DIR
    from ..parsers.resume.main import parse_resume_text
    import uuid
    import os
    import asyncio
    
    async def process_file(file: UploadFile):
        file_bytes = await file.read()
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1]
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")
        
        with open(file_path, "wb") as buffer:
            buffer.write(file_bytes)
            
        try:
            raw_text = await run_in_threadpool(extract_text_from_file, file_path, file_bytes)
            parsed_json = await run_in_threadpool(parse_resume_text, raw_text)
            evaluation = await run_in_threadpool(evaluate_candidate_fit, parsed_json, job.description)
        except Exception as e:
            raw_text = "Error extracting text."
            parsed_json = {}
            evaluation = {"match_score": 0, "match_summary": f"Failed to process resume: {str(e)}"}
            
        return {
            "file_id": file_id,
            "file_path": file_path,
            "raw_text": raw_text,
            "parsed_json": parsed_json,
            "evaluation": evaluation
        }

    # Run AI processing concurrently for all uploaded files
    results = await asyncio.gather(*(process_file(f) for f in files))
    
    # Synchronously write to database to avoid connection issues
    for res in results:
        new_resume = models.Resume(
            id=res["file_id"],
            user_id=current_user.id,
            original_file_path=res["file_path"]
        )
        db.add(new_resume)
        
        parsed_data = models.ParsedData(
            resume_id=res["file_id"],
            parsed_json=res["parsed_json"],
            raw_text=res["raw_text"]
        )
        db.add(parsed_data)
        
        application = models.Application(
            job_id=job_id,
            resume_id=res["file_id"],
            match_score=res["evaluation"].get("match_score", 0),
            match_summary=res["evaluation"].get("match_summary", "Evaluation failed."),
            status="pending"
        )
        db.add(application)
        
    db.commit()
    return {"message": f"Successfully uploaded and processed {len(files)} candidates."}
