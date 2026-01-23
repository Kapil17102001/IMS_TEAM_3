from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import List, Optional

# --- Student Schemas ---
class CollegeStudentBase(BaseModel):
    name: str
    roll_number: str
    email: EmailStr
    status: str
    hiring_date: Optional[date] = None
    joining_date: Optional[date] = None
    round_details: Optional[str] = None

class CollegeStudentCreate(CollegeStudentBase):
    pass

class CollegeStudentUpdate(BaseModel):
    name: Optional[str] = None
    roll_number: Optional[str] = None
    email: Optional[EmailStr] = None
    status: Optional[str] = None
    hiring_date: Optional[date] = None
    joining_date: Optional[date] = None
    round_details: Optional[str] = None

class CollegeStudent(CollegeStudentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Uploaded File Schemas ---
class UploadedFileBase(BaseModel):
    student_id: int
    file_name: str
    file_path: str
    file_size: int

class UploadedFileCreate(UploadedFileBase):
    pass

class UploadedFile(UploadedFileBase):
    id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True

# --- Student Resume Schemas ---
class StudentResumeBase(BaseModel):
    file_name: str
    file_path: str
    file_size: int

class StudentResumeCreate(StudentResumeBase):
    pass

class StudentResume(StudentResumeBase):
    id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True
