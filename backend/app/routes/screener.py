from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import models
from ..schemas import schemas
from .auth import get_current_user
from ..ai.gemini import evaluate_candidate_fit
from starlette.concurrency import run_in_threadpool
import asyncio
import os
import uuid

router = APIRouter(prefix="/api/screener", tags=["screener"])

@router.get("", response_model=List[schemas.QuickScanResponse])
def get_scans(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can view scans")
    
    scans = db.query(models.QuickScan).filter(models.QuickScan.recruiter_id == current_user.id).order_by(models.QuickScan.created_at.desc()).all()
    results = []
    for scan in scans:
        count = db.query(models.QuickScanResult).filter(models.QuickScanResult.scan_id == scan.id).count()
        results.append({
            "id": scan.id,
            "recruiter_id": scan.recruiter_id,
            "title": scan.title,
            "description": scan.description,
            "keywords": scan.keywords,
            "created_at": scan.created_at,
            "results_count": count
        })
    return results

@router.get("/{scan_id}", response_model=List[schemas.QuickScanResultResponse])
def get_scan_results(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can view scans")
        
    scan = db.query(models.QuickScan).filter(models.QuickScan.id == scan_id, models.QuickScan.recruiter_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    results = db.query(models.QuickScanResult).filter(models.QuickScanResult.scan_id == scan_id).order_by(models.QuickScanResult.match_score.desc()).all()
    
    response_data = []
    for res in results:
        resume_info = db.query(models.ParsedData).filter(models.ParsedData.resume_id == res.resume_id).first()
        name = "Unknown Candidate"
        if resume_info and resume_info.parsed_json:
            name = resume_info.parsed_json.get("name", "Unknown Candidate")
            
        response_data.append({
            "id": res.id,
            "scan_id": res.scan_id,
            "resume_id": res.resume_id,
            "candidate_name": name,
            "match_score": res.match_score,
            "match_summary": res.match_summary,
            "notes": res.notes,
            "rating": res.rating,
            "created_at": res.created_at
        })
        
    return response_data

@router.put("/{scan_id}/results/{result_id}", response_model=schemas.QuickScanResultResponse)
def update_scan_result(
    scan_id: str,
    result_id: str,
    update_data: schemas.QuickScanResultUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can update scan results")
        
    scan = db.query(models.QuickScan).filter(models.QuickScan.id == scan_id, models.QuickScan.recruiter_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    result = db.query(models.QuickScanResult).filter(models.QuickScanResult.id == result_id, models.QuickScanResult.scan_id == scan_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
        
    if update_data.notes is not None:
        result.notes = update_data.notes
    if update_data.rating is not None:
        result.rating = update_data.rating
        
    db.commit()
    db.refresh(result)
    
    # Needs candidate_name for response model
    resume_info = db.query(models.ParsedData).filter(models.ParsedData.resume_id == result.resume_id).first()
    name = "Unknown Candidate"
    if resume_info and resume_info.parsed_json:
        name = resume_info.parsed_json.get("name", "Unknown Candidate")
        
    return {
        "id": result.id,
        "scan_id": result.scan_id,
        "resume_id": result.resume_id,
        "candidate_name": name,
        "match_score": result.match_score,
        "match_summary": result.match_summary,
        "notes": result.notes,
        "rating": result.rating,
        "created_at": result.created_at
    }

@router.post("")
async def create_scan(
    title: str = Form(...),
    description: str = Form(...),
    keywords: str = Form(""),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can create scans")
        
    new_scan = models.QuickScan(
        title=title,
        description=description,
        keywords=keywords,
        recruiter_id=current_user.id
    )
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)
    
    from .resume import extract_text_from_file, UPLOAD_DIR
    from ..parsers.resume.main import parse_resume_text
    
    # Inject keywords into job description for AI evaluation
    eval_description = description
    if keywords.strip():
        eval_description += f"\n\nCRITICAL KEYWORDS TO MATCH: {keywords}"

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
            evaluation = await run_in_threadpool(evaluate_candidate_fit, parsed_json, eval_description)
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

    results = await asyncio.gather(*(process_file(f) for f in files))
    
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
        
        scan_result = models.QuickScanResult(
            scan_id=new_scan.id,
            resume_id=res["file_id"],
            match_score=res["evaluation"].get("match_score", 0),
            match_summary=res["evaluation"].get("match_summary", "Evaluation failed.")
        )
        db.add(scan_result)
        
    db.commit()
    
    return {"message": "Scan complete", "scan_id": new_scan.id}
