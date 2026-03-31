from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import os
import shutil
import uuid
from datetime import datetime
from backend.core.config import settings
from backend.models.sql_models import FileRecord, AnalysisResult, User
from backend.services.file_analyzer import FileAnalyzer
from backend.services.email_service import EmailService

router = APIRouter()

# Simple Dependency for Database Session (Placeholder)
def get_db():
    from backend.models.sql_models import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload")
async def upload_file(
    user_id: str, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    """
    Saves the uploaded file to the local storage.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    # Generate Unique Path
    file_id = str(uuid.uuid4())
    unique_filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    # Save to disk
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

    return {
        "status": "success",
        "id": file_id,
        "path": file_path,
        "filename": file.filename
    }

@router.post("/analyze/{file_id}")
async def analyze_file(file_path: str, email: str = "drariana2025@gmail.com"):
    """
    Triggers pandas analysis on a previously uploaded file.
    """
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    analysis_data = FileAnalyzer.analyze(file_path)
    
    if "error" in analysis_data:
        raise HTTPException(status_code=500, detail=analysis_data["error"])

    # Trigger Email Notification
    try:
        filename = os.path.basename(file_path).split('_', 1)[-1]
        await EmailService.notify_analysis_complete(email, filename)
    except:
        pass # Don't block if SMTP is not configured
    
    return {
        "status": "success",
        "analysis_results": analysis_data
    }
