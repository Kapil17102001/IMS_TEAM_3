from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
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
    StudentResume as ResumeSchema
)
from app.api import deps
from app.models.college_portal import CollegeStudent, UploadedFile, StudentResume

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
    studentId: int = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(deps.get_db)
) -> Any:
    # Verify student exists
    student = db.query(CollegeStudent).filter(CollegeStudent.id == studentId).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    uploaded_files_data = []
    for file in files:
        if not file.filename.lower().endswith('.pdf'):
            continue # Basic PDF check like in server.js

        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"offer-letter-{uuid.uuid4().hex}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Get file size
        file_size = os.path.getsize(file_path)

        # Save to database
        db_file = UploadedFile(
            student_id=studentId,
            file_name=file.filename,
            file_path=file_path,
            file_size=file_size
        )
        db.add(db_file)
        db.commit()
        db.refresh(db_file)

        uploaded_files_data.append({
            "id": db_file.id,
            "fileName": db_file.file_name,
            "fileSize": db_file.file_size,
            "uploadedAt": db_file.uploaded_at
        })

    return {
        "message": f"{len(uploaded_files_data)} file(s) uploaded successfully",
        "data": {
            "studentId": studentId,
            "files": uploaded_files_data
        }
    }

@router.post("/resumes/upload/{user_id}")
async def upload_resumes(
    user_id: int,
    resumes: List[UploadFile] = File(...),
    db: Session = Depends(deps.get_db)
) -> Any:
    # Get the college_id using the user_id
    college_id = get_college_id_by_user_id(db, user_id)
    if not college_id:
        raise HTTPException(status_code=404, detail="College ID not found for the user")

    uploaded_resumes_data = []
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
            college_id = college_id
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

        results = pdf_extraction_service.extract_and_process_resumes(college_id)

    return {
        "message": f"{len(uploaded_resumes_data)} resume(s) uploaded successfully",
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

@router.get("/uploads/student/{studentId}", response_model=List[FileSchema])
def get_student_uploads(studentId: int, db: Session = Depends(deps.get_db)) -> Any:
    return db.query(UploadedFile).filter(UploadedFile.student_id == studentId).order_by(UploadedFile.uploaded_at.desc()).all()

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