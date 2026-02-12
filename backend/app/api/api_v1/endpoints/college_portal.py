from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import shutil
from datetime import datetime
import uuid
from pathlib import Path
from app.services.text_extract import pdf_extraction_service
from app.services.user_service import get_college_id_by_user_id


from app import models
from app.schemas.college_portal import (
    CollegeStudent as StudentSchema, 
    CollegeStudentCreate as StudentCreate,
    CollegeStudentUpdate as StudentUpdate,
    UploadedFile as FileSchema, 
    UploadedFileUpdate,
    StudentResume as ResumeSchema
)
from app.api import deps
from app.models.college_portal import CollegeStudent, UploadedFile, StudentResume
from app.models.intern import Intern, InternStatus
from app.models.enums import FileUploadStatus

router = APIRouter()

# Directories for uploads
BASE_DIR = Path(__file__).resolve().parents[4]
UPLOAD_DIR = str(BASE_DIR / "documents")
RESUMES_DIR = str(BASE_DIR / "documents" / "resume")

print(f"DEBUG: UPLOAD_DIR initialized at {UPLOAD_DIR}")
print(f"DEBUG: RESUMES_DIR initialized at {RESUMES_DIR}")

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESUMES_DIR, exist_ok=True)


# --- Student Endpoints ---

@router.get("/students", response_model=List[StudentSchema])
def get_students(db: Session = Depends(deps.get_db)) -> Any:
    return db.query(CollegeStudent).order_by(CollegeStudent.created_at.asc()).all()

@router.get("/students/{id}", response_model=StudentSchema)
def get_student(id: int, db: Session = Depends(deps.get_db)) -> Any:
    student = db.query(CollegeStudent).filter(CollegeStudent.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.post("/students", response_model=StudentSchema)
def create_student(
    *,
    db: Session = Depends(deps.get_db),
    student_in: StudentCreate
) -> Any:
    # Check if student with roll number or email already exists
    student = db.query(CollegeStudent).filter(
        (CollegeStudent.roll_number == student_in.roll_number) | 
        (CollegeStudent.email == student_in.email)
    ).first()
    if student:
        raise HTTPException(
            status_code=400,
            detail="A student with this roll number or email already exists."
        )

    db_student = CollegeStudent(**student_in.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@router.put("/students/{id}", response_model=StudentSchema)
def update_student(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    student_in: StudentUpdate
) -> Any:
    db_student = db.query(CollegeStudent).filter(CollegeStudent.id == id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    update_data = student_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_student, field, value)

    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@router.delete("/students/{id}")
def delete_student(
    *,
    db: Session = Depends(deps.get_db),
    id: int
) -> Any:
    db_student = db.query(CollegeStudent).filter(CollegeStudent.id == id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Also delete linked files from disk if necessary
    # For now, just deleting the record (the model has cascade="all, delete-orphan" for database)
    db.delete(db_student)
    db.commit()
    return {"message": "Student deleted successfully"}

# --- Upload Endpoints ---

@router.post("/upload")
async def upload_files(
    userId: int = Form(...),
    fileType:str = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(deps.get_db)
) -> Any:
    # Get user to find internId
    user = db.query(models.User).filter(models.User.id == userId).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    intern_id = user.intern_id
    if not intern_id:
        raise HTTPException(status_code=400, detail="User is not associated with an intern profile")

    # Get intern details to use name in filename
    intern = db.query(models.Intern).filter(models.Intern.id == intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern profile not found")
    
    # Sanitize name for filename
    safe_name = intern.full_name.replace(" ", "_").lower()
    
    uploaded_files_data = []
    for file in files:
        if not file.filename.lower().endswith('.pdf'):
            continue # Basic PDF check like in server.js

        file_ext = os.path.splitext(file.filename)[1]
        # Use name and fileType in the filename
        unique_filename = f"{safe_name}-{fileType.lower()}-{uuid.uuid4().hex[:8]}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Get file size
        file_size = os.path.getsize(file_path)

        # Check for existing file of same type to replace
        existing_file = db.query(UploadedFile).filter(
            UploadedFile.intern_id == intern_id,
            UploadedFile.file_type == fileType
        ).first()

        if existing_file:
            # Delete old physical file
            if os.path.exists(existing_file.file_path):
                os.remove(existing_file.file_path)
            
            # Update existing record
            existing_file.file_name = unique_filename
            existing_file.file_path = file_path
            existing_file.file_size = file_size
            existing_file.status = FileUploadStatus.PENDING
            existing_file.feedback = None
            db_file = existing_file
        else:
            # Create new record
            db_file = UploadedFile(
                intern_id=intern_id,
                file_name=unique_filename,
                file_path=file_path,
                file_size=file_size,
                file_type = fileType,
                status = FileUploadStatus.PENDING
            )
            db.add(db_file)
        
        db.commit()
        db.refresh(db_file)

        uploaded_files_data.append({
            "id": db_file.id,
            "fileName": db_file.file_name,
            "fileSize": db_file.file_size,
            "status": db_file.status,
            "feedback": db_file.feedback,
            "fileType": db_file.file_type,
            "uploadedAt": db_file.uploaded_at
        })

    return {
        "message": f"{len(uploaded_files_data)} file(s) uploaded successfully",
        "data": {
            "internId": intern_id,
            "files": uploaded_files_data
        }
    }

@router.post("/resumes/upload/{user_id}")
async def upload_resumes(
    user_id: int,
    background_tasks: BackgroundTasks,
    resumes: List[UploadFile] = File(...),
    db: Session = Depends(deps.get_db)
) -> Any:
    # Get the college_id using the user_id
    college_id = get_college_id_by_user_id(db, user_id)
    if not college_id:
        raise HTTPException(status_code=404, detail="College ID not found for the user")

    uploaded_resumes_data = []
    file_names_to_process = []

    for file in resumes:
        if not file.filename.lower().endswith('.pdf'):
            continue

        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"resume-{uuid.uuid4().hex}{file_ext}"
        file_path = os.path.join(RESUMES_DIR, unique_filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = os.path.getsize(file_path)

        db_resume = StudentResume(
            file_name=file.filename,
            file_path=file_path,
            file_size=file_size,
            college_id=college_id
        )
        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)

        uploaded_resumes_data.append({
            "id": db_resume.id,
            "fileName": db_resume.file_name,
            "fileSize": db_resume.file_size,
            "uploadedAt": db_resume.uploaded_at,
            "college_id": college_id
        })
        
        # Add the UNIQUE filename on disk to process later
        file_names_to_process.append(unique_filename)

    # Process resumes in the background so the user doesn't have to wait
    if file_names_to_process:
        background_tasks.add_task(
            pdf_extraction_service.extract_and_process_resumes, 
            college_id, 
            file_names_to_process
        )

    return {
        "message": f"{len(uploaded_resumes_data)} resume(s) uploaded successfully. Processing started in background.",
        "data": uploaded_resumes_data
    }

# --- Management Endpoints ---

@router.get("/resumes/{user_id}", response_model=List[ResumeSchema])
def get_resumes(user_id:int , db: Session = Depends(deps.get_db)) -> Any:

    college_id = get_college_id_by_user_id(db, user_id)
    if not college_id:
        raise HTTPException(status_code=404, detail="College ID not found for the user")

    return db.query(StudentResume).filter(StudentResume.college_id == college_id).order_by(StudentResume.uploaded_at.desc()).all()

@router.delete("/resumes/{resume_id}")
def delete_resume(resume_id: int, db: Session = Depends(deps.get_db)) -> Any:
    db_resume = db.query(StudentResume).filter(StudentResume.id == resume_id).first()
    if not db_resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Delete file from disk
    if os.path.exists(db_resume.file_path):
        os.remove(db_resume.file_path)

    # Delete from database
    db.delete(db_resume)
    db.commit()

    return {"message": "Resume deleted successfully"}

@router.get("/uploads", response_model=List[FileSchema])
def get_all_uploads(db: Session = Depends(deps.get_db)) -> Any:
    return db.query(UploadedFile).order_by(UploadedFile.uploaded_at.desc()).all()

@router.get("/uploads/intern/{internId}", response_model=List[FileSchema])
def get_intern_uploads(internId: int, db: Session = Depends(deps.get_db)) -> Any:
    return db.query(UploadedFile).filter(UploadedFile.intern_id == internId).order_by(UploadedFile.uploaded_at.desc()).all()

@router.get("/uploads/user/{userId}", response_model=List[FileSchema])
def get_user_uploads(userId: int, db: Session = Depends(deps.get_db)) -> Any:
    user = db.query(models.User).filter(models.User.id == userId).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    intern_id = user.intern_id
    if not intern_id:
        return []
        
    return db.query(UploadedFile).filter(UploadedFile.intern_id == intern_id).order_by(UploadedFile.uploaded_at.desc()).all()

@router.get("/uploads/download/{id}")
def download_file(id: int, db: Session = Depends(deps.get_db)):
    db_file = db.query(UploadedFile).filter(UploadedFile.id == id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    if not os.path.exists(db_file.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        path=db_file.file_path,
        filename=db_file.file_name,
        media_type='application/pdf'
    )

@router.get("/resumes/download/{resume_id}")
def download_resume(resume_id: int, db: Session = Depends(deps.get_db)):
    db_resume = db.query(StudentResume).filter(StudentResume.id == resume_id).first()
    if not db_resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if not os.path.exists(db_resume.file_path):
        raise HTTPException(status_code=404, detail="Resume file not found on server")

    return FileResponse(
        path=db_resume.file_path,
        filename=db_resume.file_name,
        media_type='application/pdf'
    )

@router.put("/uploads/{id}", response_model=FileSchema)
def update_upload(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    upload_in: UploadedFileUpdate
) -> Any:
    db_file = db.query(UploadedFile).filter(UploadedFile.id == id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="Upload not found")

    update_data = upload_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_file, field, value)

    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    # Check and update intern status if all 5 documents are now verified
    if db_file.status == FileUploadStatus.VERIFIED:
        all_files = db.query(UploadedFile).filter(UploadedFile.intern_id == db_file.intern_id).all()
        if len(all_files) == 5 and all(f.status == FileUploadStatus.VERIFIED for f in all_files):
            intern = db.query(Intern).filter(Intern.id == db_file.intern_id).first()
            if intern and intern.status == InternStatus.PENDING:
                intern.status = InternStatus.ACTIVE
                db.add(intern)
                db.commit()

    return db_file

@router.delete("/uploads/{id}")
def delete_upload(id: int, db: Session = Depends(deps.get_db)):
    db_file = db.query(UploadedFile).filter(UploadedFile.id == id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="Upload not found")

    # Delete from disk
    if os.path.exists(db_file.file_path):
        os.remove(db_file.file_path)

    # Delete from database
    db.delete(db_file)
    db.commit()

    return {"message": "Upload deleted successfully"}